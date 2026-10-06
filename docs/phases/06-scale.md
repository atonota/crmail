# Faz 6 — Scale: doğrulanmış hacmi güvenle taşı

Tarih: 2026-10-06. Durum: koşullu kapasite planı; load test sonucu yoktur. Amaç gerçek PMF/pilot yükündeki maliyet, gecikme ve izolasyon sınırlarını büyütmek; peşinen mikroservis veya bütün tenant özellikleri eklemek değildir. Tahmin: 25–45 mühendis-günü capacity/migration/operations; gerçek peak, provider ve hosting seçimiyle yeniden hesaplanır.

## Önkoşullar

[PMF](05-pmf.md) veya eşdeğer doğrulanmış iş hacmi vardır; çalışma ritmi, message/recipient/MIME size dağılımı, p95 compile/save/queue lag, support ve provider limits kaydedilmiştir. Güvenlik sınırı PoC'de site/organizasyon kararından gelir; “scale'da tenant alanı ekleyerek” sonradan güvenli hâle geldiği varsayılmaz. [Frappe site multitenancy](https://docs.frappe.io/framework/user/en/bench/guides/setup-multitenancy).

İlk kapasite hedefi gözlenen peak'in önerilen 2 katı ve sınırlı provider outage recovery'dir; gerçek telemetry yoksa hedef simülasyon hipotezi olarak kalır. SLO değerleri [security/performance planıyla](../architecture/security-performance.md) tek budget setinde uzlaştırılır; burada ikinci çelişkili SLA yaratılmaz.

## Veri/DocType ölçeği

| Sınıf / DocType | Fields / state | Permission / server validator | Bağımlılık / index |
|---|---|---|---|
| Native Queue/Queue Recipient/Communication/File | Site-scoped queue status/recipient/message/asset refs | Native permission, muted/retry policy; custom intent association | Bounded native scans; upstream index kaynağı incelenir |
| Mevcut Dispatch | site-context, unique key/hash, queue refs, state/time, lease/reconcile fields önerisi | Tek sahip/lease; Unknown policy; key conflict | Unique idempotency; state+age bounded outbox sorgusu |
| Mevcut Template/Proposal Revision | source/checksum/compiler/schema/currency snapshot | Immutable/read policy; dedup hash private scope'la | Revision/parent index; private cache key site/user/policy |
| Koşullu mevcut Connector Policy | Rate/daily budget/account/identity/circuit status | Operator policy; untrusted frontend quota override yok | Provider capability ve window counter |
| Koşullu yeni Crmail Organization Policy | organization/site scope, limits/retention/approvers | Per-site admin scope; resource policy; credential native ref | Sadece multi-org gerçekten gerekirse |
| Yeni iş modeli yok | Kapasite/index/schema migration | İş semantiği değişmeden optimize | Aday DB/Redis sürümü sabit |
| Ertelenmiş | Audit Evidence/enterprise SSO/marketplace/sharding | Talep yoksa yok | Enterprise veya ayrı mimari gate |

Alanlar tasarım önerisidir, runtime schema değildir. Canonical models [backend belgesindedir](../architecture/backend-doctypes.md). Native background queue ve custom policy birlikte ölçülür. [Background jobs](https://docs.frappe.io/framework/user/en/api/background_jobs).

## Uygulama sırası

1. **Capacity model:** recipient bazlı rate, MIME encoded size, compile CPU/memory, storage/backup, queue scans ve support cost; kullanıcı/provider/route bazında içeriksiz metrics. Fake unlimited provider yerine quota modelini simüle et. [SES quota semantiği örneği](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html), [MIME Base64](https://www.rfc-editor.org/rfc/rfc2045#section-6.8).
2. **Bounded query/index:** outbox age/state, dispatch key, provider event unique ve revision retrieval için query plan; full table scan ve kullanıcı ucu `get_all` riskini ayır. Cursor/pagination ve per-user permission korunur. [Database API](https://docs.frappe.io/framework/user/en/api/database).
3. **Queue fairness:** compile/send/reconcile sınıflarını ihtiyaca göre kuyruklar; per-site/provider cap, worker concurrency ve backpressure. Bir tenant bulk işinin küçük ekip interactive task'ını aç bırakmasına izin verilmez. Frappe queue adları/config deployment'e bağlıdır; Cloud/custom worker sözleşmesi ayrıca doğrulanır.
4. **Circuit/reconcile:** provider outage, quota exhausted ve revoked token; accepted ambiguity otomatik tekrar sayısına dönüşmez. Lease expiry native Queue recovery ile çift sahip yaratmamalı. [Native retry source](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/queue.py).
5. **Asset/cache:** aynı File checksum'a dayanmak authorization'ı kaldırmaz; private/public ayrımı ve site/user policy cache key. Generated preview ve PDF access özellikle test edilir. [Native File permissions](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/file/file.py).
6. **Migration rehearsal:** gölgeli/read-only veya staging stratejisi aday sürümde; source/revision/dispatch büyük corpus'u ve rollback mapping. DB/toolchain plansız değiştirilmez. Native framework upgrade retry/permission davranışı yeniden incelenir.
7. **Cost/SLO review:** seçilmiş budget'a karşı p50/p95/p99 ve cold/warm resource requests; editor yalnız gerektiği route'ta. Dashboard aggregate'dir; müşteri body'si debug için public olmaz.
8. **Canary:** küçük yetkili cohort, outbound rate sınırı, stop-on-P0; worker kapasitesi kademeli değişir. P0 veya source drift olursa rollout durur.

## Ölçülebilir exit gates

- Onaylı capacity hedefinde save/compile/status budget'ları karşılanır; accepted/Unknown/Failed ayrımı ve duplicate intent invariants bozulmaz.
- Provider quota counter hesap/account/recipient boyutunu kapsar; bounded retry/circuit limit dışına çıkmaz; maliyet senaryosu fiyat hipotezine sığar.
- Bir site/provider outage'da diğer normal site/worker akışının belirlenen fairness budget'ı korunur; kaynak/noisy-neighbor ölçümü kayıtlı.
- İki site/user context permütasyonu API/cache/File/worker/realtime/export'ta unauthorized bilgi veya state üretmez. Listeyi saklamak test yerine geçmez.
- Bounded scans/query plan ve index migration canary yükünde doğrulanır; DB restore ve eski app version rollback source/sealed snapshot'ı korur.
- Load sonuçları gerçek hardware/OS/runtime/DB/cache ve warm/cold sınıfıyla kaydedilir. Yapılmamış load testi “ölçeklenir” diye raporlanmaz.

## Rollback ve teknik devir

Yeni worker/queue concurrency düşürülür; provider circuit/gönderim gate kapanır; canary cohort önceki code/compiler'a döner. Yeni schema migration destructive değilse eski sürümle uyumluluk korunur; destructive ise staged restore + pending-intent review gerekir. Queue restore otomatik gönderim başlatmaz. Site ekleme kaynak kod public diye veri veya service public yapmaz.

Hüseyin Cengiz capacity, worker, provider secret/quota, DB/Redis, observability, backup ve rollback teknik sahibidir. Asistan Hüseyin yalnız gerekli GoDaddy DNS kayıtlarını teknik spesifikasyonla uygular. Product fiyat/segment/SLO tradeoff; backend query/lease/permission; frontend conditional resource; QA fault/load corpus sahibidir. [Enterprise](07-enterprise.md) büyüme için otomatik zorunlu faz değil, gerçek müşteri gereksinimi varsa ayrı kapsamdır.
