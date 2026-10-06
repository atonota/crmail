# Faz 4 — Post-MVP: doğrulanmış geri bildirim ve entegrasyon

Tarih: 2026-10-06. Durum: koşullu plan. Amaç pilotun gösterdiği eksikleri kapatmak; her entegrasyonu peşinen yapmak değildir. Acceptance, delivery events, connector policy ve inbound birbirinden bağımsız workstream'lerdir. Tahmin: seçilen iki workstream için 20–40 mühendis-günü; tümünü aynı fazda yapmak kapsam ve süreyi değiştirir.

## Önkoşullar

[MVP](03-mvp.md) pilotuna ait risk/hata/support kayıtları, izinli gerçek kullanım ve source/MIME/queue gates vardır. En az bir açık kullanıcı ihtiyacı her seçilen workstream'i gerekçelendirir. “Daha çok özellik” gerekçe sayılmaz. Outbound-only ürün iyi iş görüyorsa inbound veya marketing eklenmez.

## DocType kararı

| Sınıf / DocType | Fields / state | Permission / server validator | Bağımlılık |
|---|---|---|---|
| Native Communication/Queue/File | message_id/thread/linked_doc/private bytes | Trusted connector association; same site/user read | Native mail/CRM |
| Mevcut Proposal Revision/Dispatch | exact revision/hash/provider refs | Issued snapshot değişmez; event teknik state'i yalnız yetkili handler ile etkiler | MVP |
| Koşullu yeni Crmail Acceptance | exact revision/hash, verifier, accepted_at, evidence, token ref | Open POST + auth/token/expiry/replay; GET read-only | Proposal Revision; kimlik yöntemi kararı |
| Koşullu yeni Crmail Delivery Event | dispatch/provider_message_id/source/event_id/outcome/time | Unique trusted event; signature/replay/recipient association | Connector/provider |
| Koşullu yeni Crmail Connector Policy | provider/account ref/quota/allowed identity/enabled | Operator write; secret native ref; capability validation | Email Account |
| Koşullu mevcut Approval | target hash, decision, expiry | Delegated reviewer binding; expired/stale ret | Ayrık review talebi |
| Ertelenmiş | Organization Policy/Audit Evidence; marketing campaign modelleri | Henüz yok | Scale/enterprise veya ayrı marketing keşfi |

Custom state/field adları [backend sözleşmesine](../architecture/backend-doctypes.md) bağlıdır. Yeni model üretmek user need ve lifecycle kanıtı ister.

## Uygulama sırası

1. **Pilot triage:** support/incident/failed task'ları kök nedenle grupla; her iş için hipotez, kullanıcının işi, kabul ve rollback owner yaz. UI estetik değişiklikleri kaynak model/revizyon riskinden ayrılır.
2. **Acceptance seçildiyse:** read-only share view, expiry/revoke, explicit POST, CSRF/token binding, current revision ve replay guard. GET, mail scanner veya tracking event acceptance oluşturmaz. Kimlik/risk yöntemi ürün kararıdır; teknik click/DKIM hukukî e-imza diye sunulmaz. [DKIM kapsamı](https://www.rfc-editor.org/rfc/rfc6376).
3. **Delivery event seçildiyse:** provider capability registry, webhook secret/signature verification, event dedup, delayed/out-of-order ve unknown message association quarantine. Send acceptance ile provider delivery ayrıdır. [SES event schema örneği](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html).
4. **Connector policy:** account/identity/quota rate sınırı ve circuit breaker; SMTP accepted ambiguity route'u aynen korunur. Provider adapter frontend secret almadan çalışır. Maliyet per recipient/MIME/storage/support hesaplanır. [Provider quota örneği](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html).
5. **Inbound seçildiyse ayrı PoC:** Message-ID/In-Reply-To, duplicate import, correct user/site association ve attachments; konu eşleşmesi tek anahtar olmaz. Proton Bridge varsa process/keyring/loopback/lifecycle ayrı işletim deneyi; native Frappe destekli varsayılmaz. [Mail delivery araştırması](../architecture/mail-delivery.md).
6. **Copy/received regression:** private asset leak, CID missing part, URL expiry, HTML/native wrapper, source revision upgrade. Copy PNG/Base64 başarı ölçüsü actual received MIME değil. [RFC 2392](https://www.rfc-editor.org/rfc/rfc2392), [WebKit Clipboard](https://webkit.org/blog/10855/async-clipboard-api/).
7. **Monitoring ve usability:** Unknown operator işini, stale approval recovery ve bağlantı süresi dolmuş alıcı akışını görev olarak gözle; operational evidence publish için redacted olur. Sahipler: product/UX/backend/QA.

## Önerilen exit gates

- Seçilen acceptance yolunda scanner GET/prefetch, replay, expired/revoked/other-revision ve wrong-identity corpus'u state change üretmez; doğru explicit eylem exact revision'a bağlanır.
- Event seçildiyse aynı event 100 kez iletildiğinde tek kayıt/transition; out-of-order event güncel durumu yanlış regress etmez; untrusted signature ret.
- Connector outage/rate exhaustion sonrası sınırlı retry/backoff; UnknownSubmission explicit reconcile; duplicate send policy dışına çıkmaz.
- Inbound seçildiyse same Message-ID repeat import, farklı site, wrong-thread ve attachment ACL testleri geçer; sender subject eşitliğiyle yanlış timeline bağlantısı yok.
- Tracking kapalı default korunur. Kullanıcı politikası ve ölçüm güvenilirliği olmadan open/click metriği satış veya acceptance otoritesi olmaz. [Apple Mail privacy](https://support.apple.com/en-ca/guide/iphone/iphf084865c7/ios).
- Pilot support yükü, task hata oranı ve yardım olmadan completion ilk MVP baseline'ına göre raporlanır; seçilen workstream değeri artmadıysa scope durur.

## Rollback, sahiplik ve faz sınırı

Acceptance endpoint/write kapısı kapanabilir; daha önce oluşmuş kanıt exact revision'a bağlı korunur. Event handler yeni intake'i durdurur; quarantine olayları yeniden değerlendirirken provider send tetiklemez. Inbound import kapatılır, Communication verisi silinmez. Connector disable send'leri accepted/unknown boundary'ye göre yönetir; eski keys public log'a yazılmaz.

Backend event/acceptance/permissions; frontend read/review/recovery; Hüseyin Cengiz webhook ingress/secret lifecycle/worker/backup teknik sahibi. DNS değişikliği gerekiyorsa Asistan Hüseyin yalnız GoDaddy uygulamasını yapar; bu plan dış iletişime yetki vermez. Marketing growth kapasitesi sadece gerçekten gerekirse yeni discovery olur; bu fazın zorunlu acceptance'ı değildir. [PMF](05-pmf.md) özellik sayısıyla değil iş kanıtıyla değerlendirilir.
