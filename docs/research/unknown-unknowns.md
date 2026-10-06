# Bilinen belirsizlikler ve gerçek bilinmezleri keşfetme

Tarih: 2026-10-06. Bir riske ad, senaryo ve test verebiliyorsak artık **known unknown**'dır. Unknown unknowns eksiksiz listelenemez. Bu belge aşağıdaki açık soruları isimlendirir ve henüz adını bilmediğimiz arızaları yakalayacak keşif döngüsünü önerir. Test sonuçları yoktur; bütün gates planlanmıştır.

## Keşif sözleşmesi

Her deney şu kaydı üretir: hipotez, hangi gözlemin hipotezi yanlışlayacağı, fixture/veri sınıfı, sürüm/ortam, beklenen invariant, gözlenen sonuç, severity, owner, kanıt erişim düzeyi, ürün kararı. Unexpected sonuç “geçti” altında toplanmaz; yeni known unknown issue'su ve azaltılmış regression fixture'ı olur. Public dokümana gerçek alıcı, SMTP secret, müşteri MIME/PDF veya kişisel ekran görüntüsü konmaz.

| Kaynak/alan | Bilinen açık soru | Falsification deneyi | Durdurma koşulu / owner |
|---|---|---|---|
| SMTP accept | DATA sonrası timeout kabul mü ret mi? | Proxy 250'yi düşür; worker'ı native sendmail dönüşü ile recipient update arasında öldür | Unknown durumunun native retry'de otomatik gönderilmesi; backend + Hüseyin Cengiz |
| Idempotency | Çift click/iki worker aynı intent'i çoğaltıyor mu? | Aynı key/same payload; aynı key/different payload; lease expiry race | İkinci Dispatch/Queue veya sessiz payload overwrite; backend |
| DB–job | Commit var fakat Redis enqueue yoksa ne olur? | Commit sonrası process kill; reconciler yeniden başlat | Kaybolmuş outbox veya iki queue; backend/ops |
| Native wrapper | Onaylı MJML çıktısı Jinja/CSS/EmailBody ile değişiyor mu? | İnert token, braces, iki CTA, private CID; final MIME diff | URL, fiyat, recipient/asset veya içerik hash drift; backend |
| Recipient | Geçerli ama yanlış Contact seçimi fark ediliyor mu? | Benzer ad/iki kuruluş/CC-BCC; task gözlemi ve final summary | Kullanıcı bağlamı görmeden gönderiyor; UX/product |
| Approval | Onaydan sonra tek byte/asset değişirse eski onay geçer mi? | To, sender, subject, CTA, total, PDF, compiler version mutate | Eski hash ile request_dispatch accepted; backend |
| Template | Published revizyon geriye dönük değişebilir mi? | CRUD/import/API doğrudan edit/delete; draft mutable pointer değişimi | Eski dispatch render veya MIME snapshot değişir; backend |
| Asset/privacy | Private File URL'si dış alıcıya açılıyor mu? | Farklı user/site; public/private toggle; signed link expiry | Yetkisiz byte/metadata/cache hit; backend/security |
| MIME/CID | Inline image transport, copy ve client aynı mı? | Clipboard, MIME sink ve gerçek yetkili client ayrı corpus | CID referansı eksik part; byte/CTA drift; QA |
| Provider cost | Rate/daily limit recipient bazında hesabı bozuyor mu? | Fake 4xx/5xx; quota exhaustion; büyütülmüş MIME | Kontrolsüz retry/cost veya yanlış Failed; ops/product |
| Tracking | Open/click insan eylemi mi? | Image preload, security scanner GET, link prefetch | GET acceptance veya yanlış okundu/kabul edildi; backend/UX |
| Tenant | User/site scope cache, File, worker, realtime'da sürüyor mu? | Aynı entity ID farklı auth/hostname/job context | Cross-tenant içerik veya unauthorized state change; backend/security |
| Restore | Yedek eski pending mail'i tekrar gönderiyor mu? | Outbound muted izole restore; queue/time/status karşılaştır | SMTP yanlışlıkla açılır veya sealed snapshot yok; Hüseyin Cengiz |
| Signature | Teknik onay/DKIM hukukî kabul olarak mı gösteriliyor? | UI copy + belge/evidence review | Teknik event “yasal e-imza” diye pazarlanıyor; product + alan uzmanı |

Teknik dayanaklar: [RFC 5321 timeout](https://www.rfc-editor.org/rfc/rfc5321#section-4.5.3.2.6), [Frappe native send/recipient update](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py), [queue recovery](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/queue.py), [DB API permission bypass](https://docs.frappe.io/framework/user/en/api/database), [File authorization](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/file/file.py), [SES quotas](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html), [DKIM](https://www.rfc-editor.org/rfc/rfc6376). Tablo bu davranışlardan çıkarılmış Crmail test önerisidir.

## Henüz adını bilmediklerimiz nasıl ortaya çıkar?

### 1. Gözlenmemiş iş akışı

Üç farklı görev rolüne arındırılmış temsilî teklif işi ver: hazırlayan, inceleyen, gönderen. Özelliği tarif ederek doğru düğmeyi söyleme; işi ve sonucu tarif et. Sonra kritik olayları kodla: yanlış fırsata dönüş, reviewer'ın fiyatı başka yerde kontrol etmesi, telefon değişimi, dosyayı e-postadan ayırması, çalışmayı bırakması. Beklenmeyen davranış yeni gereksinimdir; sırf kullanıcı “beğendim” dedi diye çözülmez. Önerilen başlangıç 5–8 görev oturumu; istatistiksel temsil iddiası değildir.

### 2. Dönüşüm sınırları

Project JSON → MJML → HTML/plain → native EmailBody → MIME → received client zincirine değişik içerik corpus'u gönderilir. Uzun Türkçe kelime/ad, RTL içeriğin kaynak örneği, boş alan, çoklu CTA, nested tablo, bozuk URL, çok büyük boyut, CID eksikliği ve eski schema fixture'ları çeşitlilik sağlar. Başarısız corpus küçültülür; generator bunu sessizce “tamir” edip kaynağı yok etmez. GrapesJS project data ve derlenmiş HTML aynı kaynak sayılmaz. [GrapesJS storage](https://grapesjs.com/docs/modules/Storage.html), [MJML strict validation](https://documentation.mjml.io/#validating-mjml), [RFC 2392](https://www.rfc-editor.org/rfc/rfc2392).

### 3. Karşılaştırmalı fault injection

Aynı sealed intent'i normal koşulda ve DB/Redis/SMTP/worker kesintilerinde işle; sadece HTTP success değil bütün local/provider side effect sayısını kaydet. State grafiğinde olmayan sonuç yeni durum/operatör yoludur. İki servis transaction'ı tek commit sanılmaz. [Frappe enqueue_after_commit](https://docs.frappe.io/framework/user/en/api/background_jobs), [SMTP duplication](https://www.rfc-editor.org/rfc/rfc5321#section-4.5.3.2.6).

### 4. Yetki ve bağlam permütasyonu

Listeyi saklamak yeterli değildir. API by-ID read/write, export, preview URL, File download, cache key, worker user/site, notifications ve webhook association ayrı denenir. Aynı kullanıcı iki siteye yetkiliyse yanlış browser sekmesi/host route'u da denenir. Site izolasyonu seçimi ürün tasarımından önce yapılır. [Frappe permissions](https://docs.frappe.io/framework/user/en/basics/users-and-permissions), [multitenancy](https://docs.frappe.io/framework/user/en/bench/guides/setup-multitenancy).

### 5. Bağımlılık değişimi ve operasyon

Sabit tag'den aday patch'e upgrade rehearsal, eski draft schema load, provider token revoke, queue starvation ve backup restore tatbikatları yapılır. Değişim etkisi editor kaynak modeli ve native queue lifecycle'da aranır. Cron/worker “up” olması doğru iş sonucunu kanıtlamaz. [Frappe jobs](https://docs.frappe.io/framework/user/en/api/background_jobs), [backup encryption](https://docs.frappe.io/framework/user/en/guides/basics/how-to-enable-backup-encryption).

## Clipboard bir özel keşif alanıdır

WebKit resmî belgesi yorumların silindiğini ve visible HTML'nin yeniden üretildiğini açıklar. Önceki yerel e-posta fixture'ında WebKit 26.5 Meta+V paste'inde PNG'ler korundu, MSO yorumları kayboldu ve yüzde width'ler piksele dönüştü; sonraki 320px reflow başarısız oldu. Bu, başka client/sürüm için kanıt değildir. Crmail'de yeni source/hybrid max-width stratejisi yeniden denenmeden “Safari ve Outlook uyumlu” etiketi konmaz. MIME gönderimi clipboard'a bağımlı olmaz. [WebKit Clipboard](https://webkit.org/blog/10855/async-clipboard-api/), [Proton inline image yolu](https://proton.me/support/embedded-images).

## Keşfi ürün kapısına dönüştürme

P0: veri sızıntısı, yanlış alıcı/revizyon, kabul sonrası duplicate, kontrolsüz gönderim. Canlı send ve release durur; yazma/gönderim feature gate kapatılır. P1: kaynak kaybı, editör round-trip drift, session/save conflict, restore eksikliği. Dar pilot durur; mevcut sealed/issued kayıtlar korunur. P2: estetik, ek kısayol, gelişmiş rapor. Kritik akışı engellemiyorsa sonraki iterasyona alınabilir. Bu sınıflandırma öneridir; kullanıcı ve ekip risk değerlendirmesiyle kesinleştirilir.

Bir discovery issue kapatılmak için yeniden üretilebilir fixture, önce/sonra sonuç, owner ve acceptance gerekir. Çözülen olaydan sonra beklenmeyen komşu state denenir. “Bütün unknown unknowns kapandı” çıkış gate'i yoktur. PoC için kritik named blocker'lar, MVP için güvenli pilot, PMF için iş değeri ve sonraki fazlar için risk bütçesi ayrı onaylanır.
