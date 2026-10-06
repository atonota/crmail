# Faz 1 — PoC: teknik varsayımları yanlışlamaya çalış

Tarih: 2026-10-06. Durum: plan; ürün PoC'si çalıştırılmadı. Amaç görsel demo üretmekten önce headless auth, kaynak editör, final MIME ve SMTP belirsizliği sınırlarını kanıtlamak. Tahmin: iki geliştirici ve paylaşımlı QA/ops varsayımıyla 5–10 mühendis-günü araştırma/fixture işi; platform/provider kurulumu ve review bekleme süresi ayrıca. Bu teslim tarihi sözü değildir.

## Başlangıç koşulları

- Framework/CRM sabit tag ve aday imaj/runtime/DB kombinasyonu [backend araştırmasında](../research/frappe-framework.md) belirlenir. Manifest uyumu kurulum başarısı sayılmaz.
- İzole site, fake SMTP sink ve arındırılmış CRM fixture'ı; gerçek SMTP credential veya müşteri alıcısı kullanılmaz.
- %100 headless tanımı son kullanıcı journeys olarak ADR'ye yazılır. Native CRM action ile özel Astro route'a geçiş mi, gerçekten inline mount mı istendiği ayrılır.
- Initial single-organization/site sınırı, author/sender ve operator test kimlikleri tanımlanır. Native Administrator browser proxy olarak kullanılmaz.

Frappe API, job ve native source dayanakları: [REST](https://docs.frappe.io/framework/user/en/api/rest), [background jobs](https://docs.frappe.io/framework/user/en/api/background_jobs), [Email Queue v16.50.0](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py).

## DocType kapsamı

Adlar önerilen custom app şemasıdır; upstream modeller oldukları iddia edilmez. PoC revision yayın garantisi vermez; canlı send kapalıdır.

| Sınıf / DocType | Asgari fields | State | Permission / server validator | Bağımlılık |
|---|---|---|---|---|
| Native CRM Lead/Deal/Organization, Contact | ID, kuruluş, kişi/adres, sahiplik | Native | Her read/by-ID için CRM read; sender adres seçimi yeniden doğrulanır | CRM kurulumu |
| Native File | file ID, private, attached_to | Native | Belge + File read; MIME/size; raw path/URL kabul edilmez | Native File |
| Native Email Account/Queue/Communication | Hesap ref, teknik status, message refs | Native | Sadece operator config; fake provider; custom intent ile link | Native mail |
| Custom Crmail Brand Profile | ad, logo File, allowed sender ref | Active/Inactive | Author read; operator write; secrets yok | File/Email Account |
| Custom Crmail Email Template | ad, brand, owner, mutable source ref | Draft | Source schema/resource limits; arbitrary Jinja yok | Brand Profile |
| Custom Crmail Email Draft | CRM ref, recipient, subject, source, save_revision | Draft | Owner write + CRM/File read; expected revision | Template/CRM |
| Custom Crmail Dispatch | draft, key, payload_hash, sender, sealed payload, queue ref | Prepared/Sealed/Queued/Submitted/UnknownSubmission/Failed | Sunucu command ve unique key; client status kabul edilmez | Draft/native Queue |
| Yeni sonraki faz | Template Revision, Proposal/Item/Revision | Henüz yok | Pre-MVP/MVP kapısı | Bu PoC'nin sonucu |
| Ertelenmiş | Approval/Acceptance/Delivery Event/Connector Policy | Yok | İhtiyaç kanıtı; toplu marketing yok | Post-MVP sonrası |

Canonical alan/state ayrıntısı: [backend Doctypes](../architecture/backend-doctypes.md). Native queue state'i custom business state'iyle karıştırılmaz.

## Uygulama sırası ve teslimler

1. **Ortam manifesti:** tag/commit, container digest, Python/Node/DB/Redis gözlenen sürümü ve migrate çıktısı; operator auth ve outbound muted konfigurasyonu. Sahip: backend + Hüseyin Cengiz.
2. **Auth ve CRM API spine:** login/session expiry, CSRF/same-origin kararı; yetkili arama, forbidden by-ID ve File negatif testleri. Sahip: backend/frontend. `get_all` izin uygulamadığından kullanıcı query'si olarak gelişigüzel kullanılmaz. [Database API](https://docs.frappe.io/framework/user/en/api/database#frappe-db-get-all).
3. **Editor spike:** iki CTA, iki görsel ve uzun Türkçe metin ile project JSON kaydet/yükle; MJML/HTML preview. GrapesJS canvas ezilmez. Publish ve production-quality UX bu fazda vaadedilmez. [GrapesJS project data](https://grapesjs.com/docs/modules/Storage.html#project-data).
4. **Compile/MIME fixture:** server compiler çıktısını native EmailBody wrapper sonrası MIME sink ile karşılaştır; URL/metin/CID parts/subject korunumu kaydedilir. Browser preview send otoritesi değildir. Sahip: backend/QA.
5. **Dispatch outbox spike:** aynı DB transaction'da sealed intent + unique key, commit sonrası enqueue, kaybolmuş job reconciliation. Aynı key/different hash conflict; aynı key/same hash aynı intent. Sahip: backend.
6. **Fault injection:** SMTP250 kaybı, sendmail dönüşü sonrası worker kill, DB–Redis arası crash. Native recovery'nin tekrar gönderimi nasıl kontrol edileceğini source adapter/hook ADR'sine yaz. Sadece Dispatch.Unknown flag yeterli sayılmaz. [Native recovery](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/queue.py), [SMTP timeout duplication](https://www.rfc-editor.org/rfc/rfc5321#section-4.5.3.2.6).
7. **Headless karar kaydı:** native administration kalır; son kullanıcı minimum spine Astro'dadır. Inline CRM embedding ayrı spike sonucu; zorunluysa CSP/session/focus boundary raporu eklenir. Sahip: product/frontend.

## Ölçülebilir exit gates

Önerilen corpus: 10 normal içerik varyantı, 10 forbidden-user/File vakası, 20 aynı-key race isteği ve her fault boundary için tekrarlı kontrollü deney. Sayılar kapsam önerisidir; test yapılmadan pass denmez.

- Her normal fixture için source/compiled/final MIME hash ve semantic comparison; CTA/recipient/asset kaybı sıfır.
- Negatif izin corpus'unda unauthorized byte/metadata ve state change sıfır.
- Duplicate intent race'inde bir Dispatch/native queue ilişki kümesi; SMTP exactly-once iddiası yok.
- Belirsiz accepted vaka UI'da Unknown; native recovery otomatik resend davranışı ve operator reconciliation kanıtlı. Güvenli uzlaşma yoksa faz çıkışı bloklanır.
- 320 CSSpx kritik task'ta veri/focus kaybı ve page overflow yok; editor açılmadan editor/MJML özel kaynak request'i yok. Gerçek device/mail-client sertifikası ayrı not_run olabilir.

## Rollback, sahipler ve devam kararı

Rollback: fake sink/outbound mute; job worker kapısı kapanır; sealed intent/source kanıtı korunur; experiment site üretime taşınmaz. SMTP kabul olmuş mesajı “geri almak” rollback değildir. Hüseyin Cengiz teknik environment, queue, log ve restore sahibidir; GoDaddy işi yoksa Asistan Hüseyin bu fazda görev almaz. DNS gerekirse kayıt türü/adı/değeri Hüseyin Cengiz'den, uygulama Asistan Hüseyin'den gelir; bu plan dış mesaj/server yetkisi vermez.

Başarılı çıkış yalnız [Pre-MVP](02-pre-mvp.md) için koşullu izin verir. Belirsiz retry, source/MIME drift veya permission gap kapanmadan canlı SMTP ve MVP build kabul edilmez. UI estetiği seçimi, marketing/growth veya ERPNext kurulumu PoC'nin zorunlu sonucu değildir.
