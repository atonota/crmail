# Faz 3 — MVP: güvenli kurumsal ileti ve teklif

Tarih: 2026-10-06. Durum: geliştirme planı; gerçek ürün/SMTP testi yapılmadı. Amaç düşük hacimli tek organizasyon/site pilotunda müşteri/fırsat → revizyonlu hizmet teklifi → yetkili e-posta → anlaşılır gönderim durumu akışını tamamlamak. Tahmin: 30–50 mühendis-günü, iki geliştirici + paylaşımlı QA/ops. Finansal ERP scope'u veya client sayısı arttığında yeniden planlanır; tarih sözü değildir.

## Önkoşullar ve sınır

[Pre-MVP](02-pre-mvp.md) kaynak/publish/save/asset gates geçer; PoC UnknownSubmission/native retry uzlaşması kapanmıştır. İlk teklif gerçek örneğinden arındırılmış alan/para birimi/precision/vergi policy'si belirlenir. ERPNext gerekiyorsa Quotation otoritesi seçilir; aynı ticari toplam iki bağımsız modelde hesaplanmaz. CRM native Quotation akışının ERPNext entegrasyonuna dayandığı unutulmaz. [CRM ERPNext](https://docs.frappe.io/crm/erpnext), [ERPNext Quotation](https://docs.frappe.io/erpnext/quotation).

Outbound provider yalnız yetkili staging/pilot hesapla, sender allowlist ve bütçe/rate policy'siyle kullanılır. Toplu kampanya, inbound inbox sync, hukukî e-imza, tenant marketplace veya bütün CRM ekranlarını taklit etme MVP kapsamı değildir.

## DocType değişiklikleri

| Sınıf / DocType | Fields / state | Permission / server validator | Bağımlılık |
|---|---|---|---|
| Native CRM Deal/Organization/Contact | deal ref, customer context; native | Her action CRM read/write gereksinimini doğrular | CRM |
| Native Communication/Queue/Email Account/File | message/link/sender/PDF/private refs; native | Operator account yönetir; sender command'dan geçer; File read | Mail pipeline |
| Mevcut Template Revision/Draft/Dispatch | approved/sealed hashes, recipient/sender snapshot, queue refs | Published/sealed immutable; unique key; state yalnız command | Pre-MVP |
| Yeni Crmail Proposal | deal/title/scope/currency/valid_until/owner/current_revision; Draft→Review→Ready | Author write; tutar/geçerlilik server calculate; client Ready yetmez | CRM Deal |
| Yeni Crmail Proposal Item, child | açıklama/quantity/unit_price/tax_policy/amount | Parent ACL; bağımsız CRUD yok; decimal/precision/range | Proposal |
| Yeni Crmail Proposal Revision | item/terms snapshots, currency/totals/precision, PDF File/checksum/approved_by/at | Immutable issued/approved revision; server render; exact seal binding | Proposal/File |
| Koşullu yeni Crmail Approval | target revision/hash/reviewer/decision/reason/expiry | Ayrık reviewer gerekiyorsa; approve permission ve unchanged payload | Revision; tek ekipte alanlar yeterli olabilir |
| Ertelenmiş | Acceptance/Delivery Event/Connector Policy | Sonraki faz | Gerçek iş ihtiyacı |

Canonical sözleşme: [backend Doctypes](../architecture/backend-doctypes.md). Native Version audit'i gönderilmiş teklif snapshot'ı yerine kullanılmaz.

## Uygulama sırası

1. **Ticari şema:** iki temsilî hizmet teklifinin kalem/teslimat/terms/geçerlilik mapping'i; currency ve rounding policy. Decimal aritmetik ve precision snapshot'ı; “her para birimi iki hane” varsayılmaz. Sahip: product/backend. Finansal kapsam belirsizse ERPNext veya tax otomasyonu ertelenir.
2. **Proposal command:** create/edit/server recalculate/review; negatif quantity/boşscope/expired/invalidcurrency kontrolü. Teklif child alanlarına by-ID izinsiz API yok. Native deal association ve authorized list/by-ID aynı policy'dir.
3. **Revision/PDF:** current Proposal'dan immutable snapshot, reproducible PDF/content checksum; authorized File bytes. Public documentation URL ile private teklif PDF'i ayrı tasarlanır. URL'ye login gerekiyorsa e-posta alıcısında çalışacağı varsayılmaz. Sahip: backend/editor.
4. **Review UX:** müşteri/Contact/sender, currency/price/terms/revision, iki CTA/attachment görünür. Onaydan sonra To/CC/BCC/subject/link/fiyat/PDF değişirse stale approval olur. Değişiklik özeti tekrar review ister. UI/MCP/API aynı iş command'ına gider.
5. **Dispatch command:** permission, expected revision/hash, allowed sender, asset erişimi, approval ve unique idempotency; DB outbox + after-commit enqueue + reconciliation. Native send/DB gap kontrollüdür. [Frappe enqueue](https://docs.frappe.io/framework/user/en/api/background_jobs), [native Queue](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py).
6. **Provider pilot:** hesap özelinde quota ve rate, TLS/sender/domain doğrulaması; kontrollü authorized recipients. Önce fake sink, sonra izinli received MIME. Gerçek e-posta gönderimi ayrı operasyon yetkisi ister; bu plan yetki değildir. [Quota örneği](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html).
7. **State ve support:** Queued, Submitted, Failed, Unknown, cancel-before-submission açıklaması; SMTP kabulünü Delivered/Read diye adlandırma. Unknown operator reconciliation; Sent-copy append hatasında tekrar SMTP yok. [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321).
8. **Restore/release:** outbound muted isolated restore; source, assets, revisions, secrets/key, queue intent ilişkisi kontrolü. Pilot rollout cohort ve explicit stop kriteri. Sahip: Hüseyin Cengiz + backend/QA. [Backup encryption](https://docs.frappe.io/framework/user/en/guides/basics/how-to-enable-backup-encryption).

## Önerilen ölçülebilir acceptance

- Proposal normal ve edge corpus'unda server totals/rounding doğru; client manipülasyonu fiyat/ready/approval üretmez.
- 30 mutation senaryosunda eski approval ile send success sıfır; geçerli hash ile tek sealed intent.
- Yetkisiz CRM/File/Proposal by-ID, upload/export ve direct child API testlerinde bilgi veya state sızıntısı sıfır.
- Worker/network failure injection accepted/unknown/failed ayrımını korur; native automatic recovery belirsiz mail'i policy dışı tekrar göndermez.
- Hedeflenmiş real mail clients/versions için received MIME, CTA, alt text, plain text ve small logo corpus'u; dark mode, image-blocked ve narrow görünüm material limitleri kayıtlı. Desteklenmeyen client destekli diye yazılmaz.
- Kritik 320 task, save/rotation/focus ve keyboard/touch kabul; source loss sıfır; görünür alıcı/sender/revizyon/amount.
- İzole restore sonucunda source/revision/hash/asset ilişkileri ve queue muted state tutarlı; beklenmeyen mail sayısı sıfır.
- Pilot görevi gerçek yetkili kullanıcı yardımsız tamamlayabiliyor; kişisel veri public evidence'de yok. Bu kullanıcı başarısı PMF değildir.

## Rollback ve devir

Provider send feature gate kapanır; sıradaki kabul edilmemiş intents policy'ye göre iptal edilir; Submitted geri alınmış sayılmaz. Unknown kayıtlar silinmez; operator reconciliation queue'sunda kalır. Migration ve template compiler önceki approved version'a döndürülebilir; issued revision/PDF değişmez. Güvenlikte pilot scope durur, asıl kanıt private tutulur.

Hüseyin Cengiz SMTP/TLS/outbound, queue/scheduler, secret/key backup, telemetry ve rollback teknik sahibidir. GoDaddy kayıt uygulaması Asistan Hüseyin; kayıt türü/adı/değerini Hüseyin Cengiz verir, doğrulamayı Hüseyin Cengiz yapar. Ürün sahibi acceptance, backend veri/command, frontend journeys, QA independent evidence sahibidir. Sonraki [Post-MVP](04-post-mvp.md) yalnız doğrulanmış talebe göre açılır.
