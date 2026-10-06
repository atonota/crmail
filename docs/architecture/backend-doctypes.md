# Backend sözleşmesi ve DocType yol haritası

Tarih: 6 Ekim 2026. Bu şema uygulama öncesi tasarımdır. Adlar `Crmail` prefix'iyle native modellerle çakışmayı önler; fields/state/index detayları PoC verisiyle kesinleştirilir.

## Native modeller: yeniden geliştirilmez

| Platform | Model | Crmail kullanımı |
|---|---|---|
| CRM | CRM Lead, CRM Deal, CRM Organization | Müşteri/fırsat bağlamı ve sahiplik |
| Framework | Contact, File, User, Role, DocPerm | Kişi, erişim ve ekler |
| Framework | Email Account, Email Queue, Email Queue Recipient | SMTP config ve teknik gönderim |
| Framework | Communication, Communication Link | CRM timeline ve threading |
| Framework | Email Template | Gerekirse native HTML compatibility projection; görsel proje kaynağı değil |
| Framework | Version, Activity Log, Error Log | Platform history/operations; immutable ticari belge yerine geçmez |
| ERPNext, opsiyonel | Quotation, Quotation Item, Customer, Item | Finansal teklif kapsamı varsa ERP otoritesi |

Kaynak: [CRM DocType tree](https://github.com/frappe/crm/tree/v1.86.0/crm/fcrm/doctype), [Framework email DocTypes](https://github.com/frappe/frappe/tree/v16.50.0/frappe/email/doctype), [Communication](https://github.com/frappe/frappe/tree/v16.50.0/frappe/core/doctype/communication), [ERPNext Quotation](https://docs.frappe.io/erpnext/quotation).

## Önerilen custom modeller ve ilk gerekli faz

| DocType | İlk faz | Temel alanlar | Bağımlılık ve invariant |
|---|---|---|---|
| Crmail Brand Profile | PoC | isim, logo File, izinli sender, semantik marka yapılandırması, aktif | Bir marka başlangıçta yeterli; sır yok |
| Crmail Email Template | PoC | başlık, amaç, brand, owner, aktif_revision | Mutable katalog; yayımlanmış revision pointer |
| Crmail Template Revision | Pre-MVP | template, sıra, project_json, mjml, compiled_html, plain_text, compiler_version, schema_version, checksum, published_by/at | Published kaydı normal edit/delete ile değişmez; yeni revision oluştur |
| Crmail Email Draft | PoC | CRM referansı, To/CC/BCC, konu, template_revision, draft_json, save_revision, owner | Yetkili müşteri referansı; optimistic concurrency; mutable |
| Crmail Dispatch | PoC | draft/revision, idempotency_key, sender account ref, recipient snapshot, payload_hash, state, Email Queue/Communication refs | SMTP lifecycle otoritesi değil iş intent otoritesi; immutable sealed payload |
| Crmail Proposal | MVP | deal, başlık, para birimi, geçerlilik, kalemler, scope, owner, current_revision | Basit hizmet teklifi; toplam sunucu hesaplar |
| Crmail Proposal Item | MVP, child | açıklama, quantity, unit_price, tax_policy, amount | Parent izinleri, kendi genel bağımsız CRUD'si yok |
| Crmail Proposal Revision | MVP | proposal, sıra, terms_snapshot, item_snapshot, currency, totals, PDF File, checksum, approved_by/at | Gönderi eski revision'a bağlanır; mevcut Proposal değişse bile korunur |
| Crmail Approval | MVP yalnız ayrık onay gerekiyorsa | target revision/hash, reviewer, decision, reason, expiry | Tek ekipte approval alanları revision'da yeterli olabilir; gereksiz tablo yok |
| Crmail Acceptance | Post-MVP | exact proposal_revision/hash, verifier, accepted_at, evidence, token ref | GET kabul sayılmaz; POST + açık kullanıcı eylemi; kimlik yöntemi riskle |
| Crmail Delivery Event | Post-MVP | dispatch, provider_message_id, source, event_id, outcome, timestamp | Duplicate event unique; trusted webhook/import doğrulaması |
| Crmail Connector Policy | Post-MVP | provider, quota, allowed sender/domain, account link, enabled | Password yerine native Email Account veya secret ref |
| Crmail Organization Policy | Scale/enterprise yalnız çoklu organizasyon gerekirse | organization/site scope, limits, retention, approvers | Tenant izolasyonu PoC'de seçilir; sonradan yalnız filtre ekleyerek yapılmaz |
| Crmail Audit Evidence | Enterprise koşullu | event checksum, retention scope, evidence File, actor | WORM iddiası ayrı storage/permission proof gerektirir |

Bu custom şema Crmail önerisidir; upstream'de böyle DocTypes varmış gibi sunulmaz. İlk PoC fake SMTP için en küçük alan kümesiyle dört custom model yeterlidir; Template Revision pre-MVP'de yayın garantisi getirilmeden canlı gönderim ürünleştirilmez.

## Referans ve durum semantiği

Template: `Draft → Published → Retired`. Published revizyon değişmez. Yeni revizyon eskiyi silmez. Browser preview başarılı diye published sayılmaz; server compiler ve policy kontrolünden geçer.

Proposal: mutable çalışma kopyası `Draft → Review → Ready`. Gönderilecek sürüm `Proposal Revision` olarak dondurulur. Revision geçerliliği, mali toplamı ve approve edilen hash'i taşımalıdır. Published teklif üzerinde “başlık düzeltme” bile yeni revizyon üretir. Acceptance yalnız belirli revizyonu kabul eder; CRM Deal Won durumu otomatik sözleşme/e-imza yerine geçmez.

Dispatch: `Prepared → Sealed → Queued → Submitted`, alternatif `Rejected`, `Failed`, `CancelledBeforeSubmission`, `UnknownSubmission`. `Submitted` SMTP sunucusunun kabulünü anlatır. `Delivered` ancak güvenilir ayrı delivery kanıtıyla; `Read` kullanıcı izleme izni ve güvenilirlik sınırıyla farklı olaydır. Native Email Queue `Sent` iş UI'sında “teslim edildi” diye tercüme edilmez. Kaynak: [Queue status/send implementation](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py), [SMTP](https://www.rfc-editor.org/rfc/rfc5321).

State isimleri henüz runtime enum değildir; PostgreSQL/MariaDB lock ve native Queue behavior ölçülmeden garanti sunulmaz.

## İş komutları: CRUD ötesi

| Komut | Sunucu kontrolü | Başarılı yanıt |
|---|---|---|
| save_draft | owner/write, CRM read, schema, save_revision/modified eşleşmesi | yeni save_revision |
| compile_preview | draft read/write, resource limits, allowed asset ve URL, deterministic compiler | output hash + hatalar |
| publish_template_revision | publisher role, server compile, brand policy | immutable revision ID |
| approve_proposal_revision | reviewer permission, exact payload hash, tutar/geçerlilik | approval kaydı |
| request_dispatch | sender/recipient izinleri, exact revision, assets, approval, unique key | dispatch ID ve kuyruk durumu |
| cancel_dispatch | sealed/submission boundary, ownership | cancelled veya geç kaldı |
| accept_proposal | token/session kapsamı, exact revision, expiry, POST, replay guard | acceptance ID |

`POST /api/method/crmail.api.request_dispatch` önerilen adlandırmadır; endpoint henüz yoktur. Payload yalnız entity IDs, expected revision/hash ve idempotency key taşır. Serbest SMTP host, credential, raw file path, status veya `ignore_permissions` taşımaz. Native Email Account / Queue yönetim uçları ürün kullanıcısına genel izin olarak açılmaz. Kaynak bağlamı: [Frappe RPC](https://docs.frappe.io/framework/user/en/api/rest), [permissions](https://docs.frappe.io/framework/user/en/basics/users-and-permissions).

## İşlem ve outbox

1. İstek kullanıcı kimliğini belirler, izin ve beklenen revision kontrolünü yapar.
2. Aynı transaction'da sealed Dispatch ve idempotency unique kaydı oluşur; payload hash farklıysa aynı anahtara409 döner.
3. Commit sonrası worker tetiklenir; `enqueue_after_commit` rollback'te işin erken çalışmasını önler. Ancak DB commit ile Redis enqueue arasındaki crash hâlâ mümkündür; reconciler sealed/queued olmayan outbox kayıtlarını tarar.
4. Tek worker sahipliği claim/lease veya row lock ile alınır; native Email Queue kaydı/linki tutarlı biçimde yaratılır.
5. SMTP accepted ile yerel DB update tek atomik transaction olamaz. Timeout durumunu kesin failure varsaymayız; UnknownSubmission policy'si uygulanır.
6. Reconciler Send/Communication durumlarını Dispatch'e yansıtır; duplicate native queue oluşturmaz.

Dayanak: [enqueue contract](https://docs.frappe.io/framework/user/en/api/background_jobs), [DB transaction hooks](https://docs.frappe.io/framework/user/en/api/database), [native SMTP code](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py).

Bu outbox bütün dünyada exactly-once email garantisi değildir. Native retry'nin belirsiz SMTP kabulünde yeniden gönderme olasılığına uyumlu politika gerekir. PoC bu davranışı ölçmeden canlıya geçmez.

## İzin ve tenant sınırı

Önerilen roller: author, publisher/reviewer, sender, operator. Bunlar custom role adları; yetki matrisinde çapraz Doctype alanları ayrıca kısıtlanır. Her role ihtiyaç yoksa tek kullanıcılı başlangıç basitleştirilir fakat sunucu kontrolü kaldırılmaz.

MVP tek organizasyon/site ile başlar. Çok tenant ihtiyacı çıkarsa Frappe site başına veri sınırı tercih edilir; aynı DB'de organization filtresi tek başına güvenlik garantisi değildir. Cache, realtime channel, File, export ve worker context de site/user kapsamı taşır. Kaynak: [Frappe site modeli](https://docs.frappe.io/framework/user/en/basics/sites), [multitenancy](https://docs.frappe.io/framework/user/en/bench/guides/setup-multitenancy).

## Her fazın veri kabul kapısı

- **PoC:** create/read/draft save ve fake SMTP; forbidden-user ve duplicate-intent negatif testleri.
- **Pre-MVP:** published immutability, private asset permission, template round-trip, conflict-save recovery.
- **MVP:** Proposal Item precision, revision snapshot, send-on-approved-hash, restore consistency.
- **Post-MVP:** Acceptance expiry/replay/scanner, provider events dedup, inbound thread matching.
- **PMF:** gerçek kullanımın gösterdiği şablon çeşitleri ve veri saklama süreleri; yeni model yalnız evidence ile.
- **Scale:** per-site quota, queue fairness, bounded scans/index ve schema migration load testi.
- **Enterprise:** delegated policy, evidence export, retention, external review.
- **Maturity:** deprecation, archive, interoperability, uzun dönem migration/restore provası.

Hepsi planlanan doğrulamalardır; bu rapor hazırlanırken backend çalıştırılmadı.
