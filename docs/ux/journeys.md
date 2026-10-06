# Crmail kullanıcı yolculukları ve kabul ölçütleri

Tarih: 2026-10-06. Aşağıdaki akışlar araştırma önerisidir; kullanıcı görüşmesi sonucu, uygulanmış ekran veya çalıştırılmış ürün testi değildir. Son kullanıcı kabuğu headless Astro/Mantine; editor GrapesJS/MJML; iş/veri otoritesi Frappe custom app'tir. [Backend sözleşmesi](../architecture/backend-doctypes.md) isim ve state otoritesidir.

## Roller ve kritik yol

İlk tek ekipte aynı kişi hazırlama, inceleme ve gönderme yapabilir. Buna rağmen API rollerin yetkisini ayrı değerlendirir: author içerik yaratır, publisher şablon yayımlar, reviewer ticari revizyonu değerlendirir, sender yetkili hesabıyla gönderir, operator belirsiz/başarısız işlem üzerinde işletim yapar. Roller ürün önerisidir; Frappe DocPerm ve alan seviyeleri bunları uygulamak için temel sunar. [Frappe permissions](https://docs.frappe.io/framework/user/en/basics/users-and-permissions).

| Yolculuk | Kullanıcının amacı | Adımlar | Kaydedilen iş verisi | Başarı / hata ölçütü |
|---|---|---|---|---|
| Müşteri/fırsat seçme | Doğru kuruluşa yazmak | Yetkili CRM arama → kuruluş ve Contact bağlamını gör → alıcı seç | CRM referansı, recipient ID/adres snapshot'ı | Benzer isimler ayrılır; forbidden kayıt/metadata response'da yok |
| Şablon oluşturma | Markayı kaynak korunarak düzenlemek | Brand seç → blok/metin/CTA/görsel → kaydet → server preview → publish | Email Template + immutable Template Revision | Project JSON round-trip; hata kaynakta gösterilir, içerik silinmez |
| E-posta hazırlama | Gerçek iş metnini kişiselleştirmek | Şablon revizyonu seç → konu/metin → Contact değişkenlerini gör → save | Email Draft + save_revision | Kaydedildi timestamp; stale save conflict sessiz overwrite olmaz |
| Teklif hazırlama | Kapsam/fiyatı doğru iletmek | Deal → scope/kalem/para birimi/geçerlilik → server hesap → review | Proposal/Item → Proposal Revision | Tutar ve yuvarlama sunucu otoritesi; eski sürüm değişmez |
| Son inceleme/gönderim | Yetkili kesin içeriği göndermek | Sender/To/CC/BCC → exact revizyon/link/ek → approve → request_dispatch | Sealed Dispatch, approval hash, native Queue/Communication links | Değişmiş alan onayı geçersiz kılar; çift click yeni intent oluşturmaz |
| Durum takibi | Sonucu yanlış anlamamak | Queue/Submitted/Unknown/Failed durumunu aç → nedeni ve sonraki adımı gör | Dispatch ve teknik native queue durumu | Submitted “teslim edildi” olarak gösterilmez; unknown otomatik resend olmaz |
| Teklif alıcısı | Teklifi görmek ve gerekirse yanıtlamak | Revizyon linki → kapsam/tutar/geçerlilik → açık action → doğrulama | Post-MVP Acceptance | GET/prefetch kabul değildir; expired/replayed token reddedilir |

Native veri ve SMTP durumları için kaynaklar: [CRM veri ağacı](https://github.com/frappe/crm/tree/v1.86.0/crm/fcrm/doctype), [Frappe Queue](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py), [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321).

## 320 CSSpx kritik akış

1. İlk ekran bütün CRM'yi taklit etmez: son taslaklar/teklifler ve “Yeni ileti” ana eylemi. Customer search dar alan içinde kuruluş/adres ayrımını korur.
2. Alıcı seçimi görünür form olur; yalnız avatar/isim gösterilmez. Gerekirse tam adres ikinci satırda; CC/BCC açıldığında gizli recipient varlığı final summary'de görünür.
3. Telefonda metin/blok formu ve preview arasında tek kaynak üzerinde geçiş vardır. Drag/drop tek düzenleme yolu olmaz; “Yukarı taşı/Aşağı taşı”, blok seçimi ve inspector alanları keyboard/touch erişimine sahiptir.
4. Büyük tuval veya iki boyutlu tablo gerekiyorsa kendi sınırında scroll; sayfa tamamı yanlışlıkla yatay taşmaz. Font ve hit area daraltılarak kritik bilgi saklanmaz.
5. İnceleme, alıcı/sender/subject/revizyon/ek/link ve ticari toplamı tek izlenebilir akışta gösterir. Tek “Gönder” action'ının işlemi farklı sayfalarda farklı izinle yürütülmez.
6. Soft keyboard açıkken save/status ve ana eylem occlusion test edilir. Landscape, tablet split-screen ve hybrid mouse/touch sırasında draft/selection/focus kaybolmaz.

320/360/375/390 CSSpx, yatay ve içerik breakpoint N−1/N/N+1 ölçüleri kabul örnekleridir. 320px desteği fiziksel iPhone 4'ün orijinal Safari sürümü sertifikası değildir. [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Başlangıç ürün önerisi: en az 44px effective target; coarse touch varsa 48px. Bu, WCAG minimumu ile aynı iddia değildir. [Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Kaydetme ve çatışma UX'i

Autosave'in iki hali ayrılır: browser'da yerel değişiklik var ve sunucuda kalıcı kayıt var. “Kaydedildi” yalnız başarılı server revision sonrası yazılır. Offline/session expiry draft'ı silmez; retry yeni last-write-wins overwrite üretmez. İki sekme aynı draft'ı değiştirdiğinde conflict ekranı mevcut server ve yerel source'u karşılaştırır; otomatik merge yalnız alan güvenli olduğunda değerlendirilir. Project JSON, compiler source ve değişmiş text birlikte korunur. [GrapesJS project data](https://grapesjs.com/docs/modules/Storage.html#project-data).

Template publish, draft save ve proposal approval ayrı eylemlerdir. Taslağı değiştirmek yayımlanmış şablonu veya gönderilmiş teklifi değiştirmez. “Bu değişiklik yeni revizyon gerektiriyor” copy'si kullanıcıya nedenini açıklar; teknik hash ayrıntısı yerine alıcı, fiyat veya ek değişimi gösterilir.

## Riskli eylemlerin mikro metni

| State / olay | Önerilen metin | Erişilebilir sonraki adım |
|---|---|---|
| Draft saved | Taslak kaydedildi | Zaman ve mevcut revision; düzeltmeye devam |
| Stale revision | Bu taslak başka bir oturumda değişti | İki sürümü incele; yerel içeriği dışa aktar |
| Approval stale | Alıcı veya içerik değişti; yeniden inceleme gerekiyor | Değişiklik özeti, incelemeye dön |
| Queued | Gönderim sırada | Kuyruk/gönderim öncesi cancel policy |
| Submitted | Gönderim sunucusu iletiyi kabul etti | Teslimat ayrı kanıtlanmadı; iş timeline'ı |
| UnknownSubmission | Gönderim sonucu kesinleştirilemedi | Tekrar göndermeden operatör incelemesi |
| Permanent failure | Gönderim tamamlanamadı | Sanitized sebep ve düzeltilebilir alan |
| Copy success | Biçimlendirilmiş içerik kopyalandı | Yapıştırılan görünümü kontrol et; send garanti değildir |
| Expired proposal | Bu teklif sürümünün geçerlilik süresi doldu | Yeni teklif iste; acceptance kapalı |

`Submitted`, SMTP acceptance sınırını anlatır; inbox veya okunma sonucu değildir. [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321). Copy HTML, CID MIME part ve provider gönderimi ayrı transport'lardır. [WebKit sanitization](https://webkit.org/blog/10855/async-clipboard-api/), [RFC 2392](https://www.rfc-editor.org/rfc/rfc2392).

## Görüşme ve kullanım doğrulama planı

İlk 5–8 görev oturumu önerilir: gerçek işten arındırılmış müşteri benzeri veriyle teklif hazırlat, format değiştir, yanlış fırsattan geri dön, telefonda incelet ve mevcut sürecin karşılığını sor. Gözlem, task completion, kritik hata, source kaybı, time-on-task ve destek müdahalesi kaydedilir. İyi görünen ekran veya beğeni puanı tek başına ürün kabulü değildir.

Pilot cohort tanımı ve satış ritmi belirlenmeden retention eşiği seçilmez. Uzun satış döngüsünde günlük kullanım uygun başarı metriği olmayabilir. [PMF fazı](../phases/05-pmf.md) iş değeri değerlendirmesini ayrı tutar. Gerçek kullanıcı görüşmesi, ekran okuyucu, mobile device veya mail client deneyi bu araştırmada yapılmadı.
