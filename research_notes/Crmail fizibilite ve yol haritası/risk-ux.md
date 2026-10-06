# Crmail: fizibilite, risk, UX ve sekiz faz

Araştırma tarihi: 2026-10-06. Kanıt türü: resmî belge ve sabit upstream kaynak incelemesi; Crmail backend kurulumu, provider hesabı veya ürün PoC'si çalıştırılmadı. Kullanım metrikleri ve faz eşikleri öneridir. Diğer araştırmacıların canonical DocType ailesiyle uzlaştırıldı. Claude CLI harcama sınırı yüzünden bulgu üretmedi; bağımsız Claude doğrulaması yoktur.

## Frappe mi, CRM mi, Mautic mi; ne gerçekten uygulanabilir?

### Takeaway

Koşullu öneri: Frappe Framework altyapı, Frappe CRM müşteri/fırsat bağlamı, Crmail custom app teklif ve şablon iş kuralları olsun. Mautic ilk MVP bağımlılığı yapılmasın; kampanya otomasyonu doğrulandığında ayrı entegrasyon kararıdır.

### Cited Findings

- Frappe DocType API'leri kullanıcı kimliğiyle CRUD/RPC sunar; üründeki onay/gönderim sınırı ayrıca tasarlanmalıdır. [Frappe REST](https://docs.frappe.io/framework/user/en/api/rest), [izinler](https://docs.frappe.io/framework/user/en/basics/users-and-permissions).
- CRM'in Quotation akışı ERPNext entegrasyonuna bağlıdır; CRM-only teklif modeliyle ERP finansal otoritesi ayrılmalıdır. [CRM–ERPNext](https://docs.frappe.io/crm/erpnext), [ERPNext Quotation](https://docs.frappe.io/erpnext/quotation).
- Mautic segment yayınları, campaign template'leri, izleme ve abonelik tercihleri sağlar; kampanya builder koşul/karar/aksiyon akışları kurar. Bunlar salt teklif gönderiminden farklı bir ürün kapsamıdır. [Mautic Emails 7.0](https://docs.mautic.org/en/7.0/channels/emails.html), [Campaign Builder 7.0](https://docs.mautic.org/en/7.0/campaigns/creating_campaigns.html).
- GrapesJS yeniden düzenlenebilir project data saklamayı destekler; yalnız HTML çıkışı editörün kaynak modeli değildir. MJML validation seviyeleri ve server compiler ayrı bir yayın kapısına uygundur. [GrapesJS Storage](https://grapesjs.com/docs/modules/Storage.html), [MJML validation](https://documentation.mjml.io/#validating-mjml).
- Native mail pipeline'ın SMTP gönderimi ve recipient durum güncellemesi ardışık işlemlerdir; recovery kodu Sending kayıtlarını tekrar değerlendirir. [Email Queue v16.50.0](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py), [Queue recovery v16.50.0](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/queue.py).

### Inferences

- İlk değer: fırsat seç → marka/şablon kullan → teklif/taslak oluştur → kesin revizyonu incele → yetkili gönder → belirsiz sonucu güvenle yönet. Kampanya/segment/drip bu akışın önkoşulu değildir.
- %100 headless, son kullanıcı iş akışlarının Astro/Mantine'de olması olarak sınırlandırılmalı. Desk'in kurulumdan sökülmesi veya her yönetim aracının yeniden yazılması ayrı, doğrulanmamış kapsamdır.
- Native Contact, File, Communication, Email Account, Email Queue, Version tekrar geliştirilmez. Custom modeller `Crmail` prefix'li iş intent ve revizyon kayıtlarıdır.
- ERPNext yalnız gerçek vergi/kur/stok/fiyat listesi/sipariş gereksinimi çıkarsa devreye girer. Basit hizmet Proposal'sı mali ERP yeteneklerini taklit etmez.

### Gaps

- Hedef hizmet teklifinin vergi, para birimi ve kabul kapsamı henüz örneklerle doğrulanmadı.
- Seçilecek SMTP provider/account yetkileri, gerçek hacim ve maliyet bilinmiyor.
- Native queue recovery ile UnknownSubmission kontrolünün güvenli adapter/hook sınırı PoC blocker'ıdır.

## Gönderim, içerik ve veri için hangi riskler kararı durdurur?

### Takeaway

En ağır risk görsel editörün görünüşü değildir: yanlış alıcı, eski onayla değişmiş içerik, yetkisiz dosya, kabul sonrası tekrar gönderme ve kanıtsız teslimat durumudur. İşlem idempotency'si SMTP dış yan etkisi için exactly-once garantisi vermez.

### Cited Findings

- SMTP DATA bitiminden sonraki timeout aynı mesajın tekrar kopyalarını doğurabilir. [RFC 5321 §4.5.3.2.6](https://www.rfc-editor.org/rfc/rfc5321#section-4.5.3.2.6).
- Frappe `get_all` izin uygulamaz; native File public/read ve bağlı private belge izni yolları farklıdır. [Database API](https://docs.frappe.io/framework/user/en/api/database#frappe-db-get-all), [File controller v16.50.0](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/file/file.py).
- Site çokluluğu hostname/port seçimi sağlar; uygulamadaki cache/worker/File/preview yetkilerini kendiliğinden kanıtlamaz. [Multitenancy](https://docs.frappe.io/framework/user/en/bench/guides/setup-multitenancy).
- Background enqueue commit sonrasına alınabilir; DB commit ile başka altyapıya job iletimi tek transaction değildir. [Background jobs](https://docs.frappe.io/framework/user/en/api/background_jobs), [Database transaction hooks](https://docs.frappe.io/framework/user/en/api/database).
- Provider günlük/rate/message-size sınırları ve alıcı sayısı maliyeti önemlidir; MIME encoding ham asset boyutuyla aynı değildir. [SES quotas](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html), [MIME Base64 RFC 2045 §6.8](https://www.rfc-editor.org/rfc/rfc2045#section-6.8).
- CID, MIME body part referansıdır; bir HTML `cid:` adresini panoya koymak tek başına dosya eki yaratmaz. [RFC 2392](https://www.rfc-editor.org/rfc/rfc2392), [Microsoft fileAttachment](https://learn.microsoft.com/en-us/graph/api/resources/fileattachment?view=graph-rest-1.0).
- WebKit clipboard HTML'yi sanitization'dan geçirir ve yorum düğümlerini kaldırır. Proton'un belgelenmiş inline görsel yolu görüntüyü upload edip Inline eklemektir. [WebKit Async Clipboard](https://webkit.org/blog/10855/async-clipboard-api/), [Proton embedded images](https://proton.me/support/embedded-images).
- DKIM alan adı sorumluluğu ve mesaj bütünlüğü bağlamındadır; alıcının ticari kabulüyle aynı olay değildir. Provider Delivery olayı da ayrı veri yapısıdır. [RFC 6376](https://www.rfc-editor.org/rfc/rfc6376), [SES event schema](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html).
- SSRF ve upload için izinli kaynak/şema/alan adı, dosya içerik/boyut sınırı ve erişim kontrolü gerekir. [OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html), [OWASP Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).
- Apple Mail Privacy Protection açılma bilgisini gönderenden gizleyebilir; open metriği güvenilir kişi eylemi değildir. [Apple Mail Privacy Protection](https://support.apple.com/en-ca/guide/iphone/iphf084865c7/ios).
- Frappe backup encryption ve site config anahtarı ayrı işletim unsurudur; yalnız SQL dosyasının varlığı geri dönüş kanıtı sayılmaz. [Backup encryption](https://docs.frappe.io/framework/user/en/guides/basics/how-to-enable-backup-encryption), [site migration](https://docs.frappe.io/cloud/sites/migrate-an-existing-site).

### Inferences

- `request_dispatch` şablon/teklif revizyonu, alıcılar, sender, subject, HTML/plain, asset manifest ve compiler sürümünden seal hash üretmelidir. Bunlardan biri değişince approval yeniden gereklidir.
- Duplicate click için unique idempotency key + aynı payload sonucu döndürme; aynı key/farklı payload için conflict gerekir. Worker'ın SMTP kabulü sonrası ölmesi ayrı `UnknownSubmission` ve reconciliation yoludur.
- `Submitted` arayüzde “Gönderim sunucusu kabul etti” olarak gösterilir; `Delivered` yalnız güvenilir ayrı kanıt varsa, `Accepted` yalnız teklif alıcısının açık revizyon-bağlı eylemiyle gösterilir.
- PoC'de fake sink ve kontrollü fault injection gerekir. Canlı müşteri e-postaları bu araştırmanın parçası değildir.
- Önceki yerel şablon denemesinde WebKit 26.5'in yüzde table genişliğini piksele dönüştürmesi ve MSO yorumlarını kaldırması gözlendi. Bu belirli fixture sonucu bütün Safari/Outlook sürümleri için genel hüküm değildir; Crmail copy transport corpus'una regresyon hipotezi olarak eklenmelidir. Backend gönderim MIME'ı clipboard çıktısından ayrı tutulmalıdır.

### Gaps

- Yanlış alıcının teknik olarak geçerli e-posta adresi olması yazılım doğrulamasının tek başına çözemediği bir hatadır; müşteri bağlamı ve son inceleme UX'i kullanıcı araştırması ister.
- SMTP provider'ın idempotency/reconciliation olanağı, webhook imza/replay sözleşmesi ve event saklama süresi hesap özelinde bilinmiyor.
- İmza/kabul kaydının ticari ve hukuki gereksinimi ayrı değerlendirme ister; teknik hash/DKIM bu değerlendirmeyi ikame etmez.

## UX hangi kontrol noktalarını görünür kılmalı?

### Takeaway

Görsel editör ürünün merkezi yeteneğidir fakat her ekrana yüklenmemelidir. Kullanıcı alıcı/kapsam/versiyon/gönderim durumunu kaybetmeden telefonda inceleyebilmeli, hassas eylemi açıkça yapmalıdır.

### Cited Findings

- Reflow değerlendirmesi CSS viewport üzerinden yapılır; 320 CSSpx kabulü eski telefon işletim sistemi desteğiyle aynı değildir. [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Klavye/dokunma hedefleri görünür boyuttan ve kontrol aralığından ayrı değerlendirilir. [W3C Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- GrapesJS proje JSON'unun korunması, editör ve derlenmiş çıktı arasında geri dönüşü mümkün kılan ana veridir. [GrapesJS project data](https://grapesjs.com/docs/modules/Storage.html#project-data).

### Inferences

- 320 akışı: fırsat seçimi → konu/metin ve teklif özeti → kaydedildi/çatışma durumu → alıcı/sender revizyon incelemesi → açık gönderim. Düzenleme için blok seçme ve form tabanlı içerik güncelleme yolu, drag/drop'a alternatif olmalıdır.
- Desktopta editör canvas ve inspector aynı sayfada; dar alanlarda inspector sheet/panel olur. Project JSON ve undo/source tek kalır; ikinci gizli editör örneği yaratılmaz.
- Marka UI'sı için üç estetik seçenek önerilir; hiçbiri onaylanmış tasarım değildir. Dokümantasyon semi-flat 2.0 görünümü ürüne zorunlu biçimde taşınmaz ve formal standard badge değildir.
- Tracking varsayılan kapalı; toplantı/teklif tıklamasıyla teklif kabulü farklı eylemlerdir. GET/prefetch hiçbir teklif kabulü veya iş durumu değişikliğine yol açmamalıdır.

### Gaps

- Gerçek satış çalışanı ve reviewer ile görev gözlemi yapılmadı; bu UX önerileri görüşme bulgusu diye sunulamaz.
- Telefonda hangi editör özelliklerinin zorunlu olduğu ve hedef mail istemci/OS matrisi bilinmiyor.
- Erişilebilirlik ekran okuyucu ve gerçek cihaz katmanı henüz çalıştırılmadı.

## Fazlar hangi kanıtla ilerlemeli?

### Takeaway

Sekiz faz bir feature merdiveni değildir: PoC teknik belirsizliği, MVP güvenli minimum iş değerini, PMF ödeme/tekrar kullanım/sonuç kanıtını, sonraki fazlar doğrulanmış işletim ihtiyacını kapatır. Her fazın sonuçları planlanmış kabul kapılarıdır; başarı iddiası değildir.

### Cited Findings

- Native queue/transaction/permission davranışı source-level adapter ve negatif test gereksinimini belirler. [Queue recovery](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/queue.py), [izin modeli](https://docs.frappe.io/framework/user/en/basics/users-and-permissions), [transaction API](https://docs.frappe.io/framework/user/en/api/database).
- Provider quota ve event semantiği farklı kapasite/delivery kapıları gerektirir. [SES limits](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html), [SES event schema](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html).

### Inferences

- [PoC](../../docs/phases/01-poc.md): sürüm/adaptor/queue belirsizliğini fake sink ile doğrula.
- [Pre-MVP](../../docs/phases/02-pre-mvp.md): immutable şablon, concurrency, asset, editor source/compile gates.
- [MVP](../../docs/phases/03-mvp.md): Proposal/Revision + alıcı/reviewer/send permission + restore.
- [Post-MVP](../../docs/phases/04-post-mvp.md): kanıtlanmış ihtiyaç varsa Acceptance/event/inbound/connector; ayrı güvenlik kapıları.
- [PMF](../../docs/phases/05-pmf.md): gerçek ekiplerde tekrar kullanım, ödeme isteği ve zaman/kalite sonucunu ölç; öğrenilmeyen hipotezleri iptal et.
- [Scale](../../docs/phases/06-scale.md): maliyet/queue fairness/tenant/data migration yükünü gerçek büyüme ile doğrula.
- [Enterprise](../../docs/phases/07-enterprise.md): sözleşmeyle talep edilen politika, kanıt, SSO/retention; hepsini bütün müşterilere zorunlu yapma.
- [Maturity](../../docs/phases/08-maturity.md): deprecation/export/upgrade/incident ve ürün portföyünü sürdürülebilir yönet.
- Tahminler önerilen effort aralıklarıdır; ekip ve provider bilinmeden teslim tarihi sözü değildir. Altyapı teknik sahibi Hüseyin Cengiz; GoDaddy DNS uygulaması Asistan Hüseyin'dedir. Araştırma görev dağılımı dış kişilere otomatik mesaj veya server değişikliği yetkisi vermez.

### Gaps

- Ekip kapasitesi, gerçek müşteri cohort'u, satış ritmi ve bütçe bilinmiyor. PMF/scale eşikleri kullanıcıyla iş verisi üzerinden seçilmelidir; evrensel büyüme standardı yoktur.
- Crmail runtime ve ürün testleri henüz yok; bu belgelerin site testinden geçmesi ürün doğruluğu anlamına gelmez.
