# Crmail fizibilitesi: koşullu uygulanabilir

Tarih: 2026-10-06. Bu belge araştırma taslağıdır; kurulu Frappe ürünü veya tamamlanmış PoC raporu değildir. Öneri: Frappe Framework ve CRM iş/veri altyapısı; Crmail custom app revizyon ve gönderim intent'i; Astro/Mantine headless ürün kabuğu; GrapesJS/MJML korunmuş görsel editör. Uygulanabilirlik, aşağıdaki kapılar tamamlanana kadar koşulludur.

## Kullanıcı problemi ve seçenekler

Kritik iş: bir müşteriye doğru markayla hazırlanmış, revizyonu belirli kurumsal e-posta ve teklif iletmek. Toplu pazarlama, segment, drip veya davranışsal otomasyon henüz aynı gereksinim değildir. Mautic campaign koşul/karar/aksiyonları ile segment ve template e-postaları destekler; bu yüzden marketing automation ihtiyacı varsa anlamlıdır. İlk birebir teklif MVP'sine zorunlu eklenmesi bu araştırmanın önerisi değildir. Bu bir ürün çıkarımıdır, Mautic'in bunu yapamadığı iddiası değildir. [Mautic campaigns](https://docs.mautic.org/en/7.0/campaigns/creating_campaigns.html), [Mautic emails](https://docs.mautic.org/en/7.0/channels/emails.html).

| Yol | Uygun problem | Sağladığı temel | Ek iş ve karar |
|---|---|---|---|
| Frappe Framework tek başına | Custom veri/iş akışı | DocType, izin, API, jobs, mail | CRM bağlamını ayrıca üretmek gerekir; mevcut CRM varken önerilmez |
| Framework + CRM + Crmail | Birebir satış iletişimi, ajans/hizmet teklifi | Lead/Deal/Organization, Communication, Email Queue | Custom immutable revizyon, görsel editör ve güvenli send command |
| Bunlara ERPNext | Fiyat listesi/vergi/stok/sipariş/muhasebe bağlı teklif | Quotation ve finansal kaynak otoritesi | Company/Customer/Item vb. kurulum ve headless ekran maliyeti |
| Mautic ayrı entegrasyon | Doğrulanmış kampanya/segment/drip | Kampanya builder, marketing kanalları | İzin/consent/suppression, senkronizasyon, operasyon ve iki içerik otoritesi riski |

Native temeller ve ERP sınırı kaynakları: [Frappe REST](https://docs.frappe.io/framework/user/en/api/rest), [CRM ERPNext](https://docs.frappe.io/crm/erpnext), [ERPNext Quotation](https://docs.frappe.io/erpnext/quotation). Tablo önerilen ürün konumlandırmasıdır; ölçülmüş maliyet karşılaştırması değildir.

## “%100 headless” kabul sözleşmesi

Son kullanıcının müşteri/fırsat seçme, draft/template/teklif düzenleme, önizleme, review, gönderim ve durum akışlarında native Desk/Vue ekranına mecbur olmaması hedeflenir. Frappe'nin HTML/Desk bileşenlerinin kurulumdan tamamen çıkarılması aynı hedef değildir. Operatör Email Account/worker/user/role yönetimi başlangıçta erişimi sınırlı native araçlarla yapılabilir. Yönetimin de özel Astro UI'sı olması talep edilirse ayrı scope ve acceptance gerekir. [Frappe API](https://docs.frappe.io/framework/user/en/api/rest), [CRM frontend v1.86.0](https://github.com/frappe/crm/tree/v1.86.0/frontend).

GrapesJS tuvali Mantine ile yeniden çizilmez. Astro route'un içinde editör adapter'ı, inspector ve iş kontrolleri marka tokenlarını paylaşabilir. Native CRM “Crmail ile hazırla” action'ı özel route'a gidebilir; gerçek inline iframe/mount talebi ise ayrı PoC'dir. İki frontend aynı server state'i farklı kurallarla yönetmez. [GrapesJS storage](https://grapesjs.com/docs/modules/Storage.html), [CRM custom actions](https://docs.frappe.io/crm/custom-actions).

## Maliyet ve teknik ağırlık

Görsel builder hazır bileşen olsa da kaynak project JSON, MJML, compiled HTML/plain ve final MIME ayrı artefaktlardır. Server compiler otoritesi, asset izinleri, template interpolation, concurrency ve approval hash kod gerektirir. MJML strict validation şema hatalarını durdurabilir; tek başına güvenli URL, alıcı doğruluğu veya bütün mail client görünümü garantisi değildir. [MJML validation](https://documentation.mjml.io/#validating-mjml), [GrapesJS project data](https://grapesjs.com/docs/modules/Storage.html#project-data).

Frappe native mail kabulü ile DB recipient durumu atomik değildir. Duplicate UI intent engellenebilir, fakat SMTP DATA sonrası timeout dış dünyada belirsizlik yaratır. `Crmail Dispatch.UnknownSubmission` yazmak native retry'yi kendiliğinden durdurmaz. Güvenli adapter/hook ve recovery policy PoC'de kapatılmalıdır. [Queue implementation v16.50.0](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py), [recovery v16.50.0](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/queue.py), [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321#section-4.5.3.2.6).

## Go / no-go kapıları

| Kapı | Önerilen kanıt | Durum | Durursa alternatif |
|---|---|---|---|
| Sürüm uyumu | Sabit Framework/CRM tag, imaj digest, runtime, migrate ve smoke | not_run | Desteklenen sabit kombinasyonu seç; develop'a plansız geçme |
| Headless auth | Kullanıcı bazlı permission/CSRF/session expiry; browser'da secret yok | not_run | Same-origin BFF; Administrator proxy token'ını kullanma |
| Source round-trip | Editor kaydet/yükle; en az iki CTA/iki görsel ve Türkçe corpus | not_run | Kaynağı koru, blok setini daralt; builder'ı ezme |
| Final MIME | Server HTML → native wrapper → received MIME comparison | not_run | Dar mail adapter'ı; yayın/gönderimi kapat |
| Retry belirsizliği | 250 kaybı ve worker kill; Unknown + native retry uzlaşması | not_run, blocker | Canlı SMTP yok; operatör incelemesi ve fake sink |
| Alıcı/revizyon | Eski onay + değişen recipient/price/link negatif testleri | not_run | Review zorunlu, permissive auto-send yok |
| Veri izolasyonu | İki kullanıcı/site, File/preview/cache/worker negatif corpus | not_run | Tek site/organizasyon MVP; tenant üretimine geçme |
| İş değeri | Gerçek ekip task'ı, ilk başarı ve tekrar kullanım; öğrenme görüşmesi | not_run | Ürün scope'unu yeniden konumlandır |

Permission ve transaction temelinin kaynakları: [permissions](https://docs.frappe.io/framework/user/en/basics/users-and-permissions), [Database API](https://docs.frappe.io/framework/user/en/api/database), [Background jobs](https://docs.frappe.io/framework/user/en/api/background_jobs). Tablodaki testler önerilen planlardır, araştırmada çalıştırılmadı.

## Ekonomik sınır

Maliyet yalnız SMTP birim fiyatı değildir: MIME boyutu, recipient sayısı, storage/backup, worker/compile zamanı, outbound provider kotası, client QA ve destek/reconciliation işi hesaba katılmalıdır. SES belgesi kota/rate'in ve MIME mesaj boyutunun ayrı olduğunu gösterir; bu Crmail'in SES seçtiği anlamına gelmez. Seçilen mailcow/Proton/başka provider için aynı hesap bazlı tablo ayrıca doldurulmalıdır. [SES limits](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html), [MIME encoding](https://www.rfc-editor.org/rfc/rfc2045#section-6.8).

Önerilen ilk MVP outbound-only, düşük hacim, tek organizasyon/site, açık alıcı/sender incelemesi ve küçük şablon corpus'udur. Inbound, kampanya, e-imza, toplu gönderim ve tenant marketplace önkoşul değildir. Ürün estetiği seçim bekleyen [UI önerileridir](../ux/ui-proposals.md); teknik gate çözülmeden yalnız görünümle MVP tamamlanmış sayılmaz.

## Karar ve bağımlı belgeler

**Koşullu go:** araştırma ve izole PoC'ye ilerle. **Henüz no-go:** canlı müşteri SMTP, otomatik belirsiz retry, tenant'lı üretim ve hukuki imza/teslimat garantisi. [Backend DocTypes](../architecture/backend-doctypes.md), [Mail delivery](../architecture/mail-delivery.md), [known/unknown keşif](unknown-unknowns.md), [UX journeys](../ux/journeys.md), [PoC](../phases/01-poc.md) bu kararın uygulama sözleşmesidir. Lisans kararı kullanıcının talimatıyla beklemededir; bu belgede lisans seçilmez.


## Sürüm ve bağımlılık sentezi

Backend ilk aday: Framework v16.50.0 + CRM v1.86.0; CRM manifesti Frappe15/16’ya izin verir, seçilen Framework Python3.14 ve Node24 ister. Resmî v16 kurulum tablosunda MariaDB11.8 vardır. Bu clean install sonucu değildir; release/manifest ve runtime farklı kanıtlardır. [Framework tag](https://github.com/frappe/frappe/releases/tag/v16.50.0), [CRM manifest](https://github.com/frappe/crm/blob/v1.86.0/pyproject.toml), [Framework manifest](https://github.com/frappe/frappe/blob/v16.50.0/pyproject.toml), [Node](https://github.com/frappe/frappe/blob/v16.50.0/package.json), [kurulum](https://docs.frappe.io/framework/user/en/installation).

Frontend ilk compiler adayı plugin1.0.8 + GrapesJS0.23.6 + browser/serverMJML4.18.0; plugin manifestinin v4 aralığı ile observed latestMJML5.4.1 farkı ayrı migration kapısıdır. Astro7.3.6, React19.3.0, Mantine9.7.1 ve ilgili paketler registry gözlemleridir, Crmail ürün lock/runtime sonucu değildir. [Plugin manifest](https://github.com/GrapesJS/mjml/blob/master/package.json), [frontend sürüm kaydı](frontend-stack.md).

Native Frappe MCP yüksek deneyseldir ve incelenen exact Werkzeug pinleri seçilen Framework ile çakışır. Ayrı MCP adapter + kullanıcı-kapsamlı iş API’si ilk öneridir. Agent draft/preview hazırlayabilir; gönderim exact revision/payload onayını server’da yeniden kontrol eder. Bu ek geliştirme maliyeti MVP core sender’ına zorunlu dependency yapılmaz. [MCP README](https://github.com/frappe/mcp/blob/main/README.md), [MCP manifest](https://github.com/frappe/mcp/blob/main/pyproject.toml), [mimari kararlar](../architecture/decisions.md).

## Teslim ve karşılaştırma sınırı

Public Pages yalnız araştırma/planlama sitesidir; authenticated Crmail runtime, Frappe kurulum ve SMTP worker ayrı üretim işidir. Claude CLI arka planda gerçekten çağrıldı fakat aylık harcama limiti nedeniyle hiç bulgu üretmedi. Dolayısıyla araştırmanın tamamlanan kaynak çalışması teslim edilebilirken kullanıcının istediği bağımsız Claude belgeleri ve karşılaştırması eksik kalır; bu eksikliği tamamlanmış gibi kapatmıyoruz. [Claude kaydı](../claude/status.md), [uzlaştırma](reconciliation.md), [ana rapor](../../reports/Crmail%20fizibilite%20ve%20yol%20haritası.md).

Önerilen devam: [PoC](../phases/01-poc.md) teknik kapıları; [Pre-MVP](../phases/02-pre-mvp.md) immutable şablon/asset/concurrency; [MVP](../phases/03-mvp.md) tek müşteri teklif ve iletim değerini tamamlar. Tam sekiz faz [yol haritasında](../roadmap.md) ayrı sayfalardır. Kalan fazlar teknik özellik sayısıyla değil, gerçek müşteri/işletim ihtiyacıyla açılır.
