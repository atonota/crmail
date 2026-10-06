# Frappe Framework ve CRM: headless fizibilite

Araştırma tarihi: 6 Ekim 2026. Bu belge kaynak incelemesidir; çalışan Frappe kurulumu, yük testi veya SMTP hesabı testi değildir. “Doğrulandı” kaynakta görülen davranışı; “öneri” Crmail tasarım kararını; “açık” gerçek ortamda kanıtlanması gereken varsayımı anlatır.

## Karar özeti

Frappe, CRM verisi, doküman yetkileri ve e-posta kuyruğunu sağlayabilir. Astro + Mantine ile bütün son kullanıcı akışları headless geliştirilebilir; hazır CRM Vue ekranlarını Mantine React bileşenleri gibi doğrudan kullanmak mümkün değildir. Mevcut CRM ekranlarına editör gömmek ile CRM verisini tamamen özel Astro arayüzünde kullanmak iki farklı entegrasyon yoludur. Öneri: asıl ürün Astro; CRM/Desk yalnız yönetim ve destek için erişimi sınırlı araç; Vue arayüzüne zorunlu bağımlılık yok. Kaynak: [CRM README](https://github.com/frappe/crm/blob/v1.86.0/README.md), [REST API](https://docs.frappe.io/framework/user/en/api/rest).

Headless “son kullanıcının Desk görmemesi” olarak kabul edilmelidir. “Frappe'nin hiçbir HTML veya Desk kodunun kurulumda bulunmaması” farklı, daha pahalı bir framework ayrıştırmasıdır; böyle bir garanti vermiyoruz. SMTP hesapları, roller, arka plan işlerinin yönetimi custom yönetim ekranına taşınabilir ama ilk sürümün ürün değerine katkısı düşüktür. Kaynak: [Frappe mimarisi](https://docs.frappe.io/framework/user/en/basics/architecture), [CRM uygulama yapısı](https://github.com/frappe/crm/tree/v1.86.0).

## Canlı sürüm kanıtı ve sınırlar

| Bileşen | Kaynakta gözlenen | Planlama sonucu |
|---|---|---|
| Frappe Framework | `v16.50.0`, GitHub release tarihi 2026-10-06 | PoC için aday sabit tag; “latest” üretimde kullanılmaz |
| Frappe CRM | `v1.86.0`, release tarihi 2026-09-30 | Kararlı v1 dalı; PoC aynı tag ile |
| CRM–Frappe sözleşmesi | CRM v1.86 manifest: `>=15.0.0,<17.0.0` | v15 ve v16 aday; çalışma testi henüz yapılmadı |
| Frappe v16.50 Python | `>=3.14,<3.15` | 3.14 patch sürümü sabitlenmeli |
| Frappe v16.50 Node | `>=24` | Node 24 LTS patch sürümü aday |
| Resmî kurulum tablosu | v16/develop MariaDB11.8, Redis/Valkey6+, Yarn1.22+, pip25.3+ | Container imajı ve DB patch sürümü PoC'de doğrulanmalı |
| CRM frontend manifest | Node `^20.19.0 || >=22.12.0` | Frappe v16 için daha sıkı Node24 ortak alt sınır |
| CRM frontend lockfile | Vue3.5.32, frappe-ui1.0.0-beta.29 | Astro/Mantine ile aynı React bileşen ağacı değildir |

Kanıtlar: [Framework release](https://github.com/frappe/frappe/releases/tag/v16.50.0), [CRM release](https://github.com/frappe/crm/releases/tag/v1.86.0), [CRM sabit manifest](https://github.com/frappe/crm/blob/v1.86.0/pyproject.toml), [Framework Python manifest](https://github.com/frappe/frappe/blob/v16.50.0/pyproject.toml), [Node engine](https://github.com/frappe/frappe/blob/v16.50.0/package.json), [kurulum](https://docs.frappe.io/framework/user/en/installation), [CRM manifest](https://github.com/frappe/crm/blob/v1.86.0/frontend/package.json), [CRM lockfile](https://github.com/frappe/crm/blob/v1.86.0/frontend/yarn.lock).

Bunlar kurulu sürümler değildir: bu araştırmada Bench, Python3.14, MariaDB11.8 veya Redis kurulmadı. Manifest aralığı ile çözümlenen bağımlılık, yayımlanmış tag ile doğrulanmış çalışma ortamı farklıdır. Yalnız upstream tag ve manifest incelendi; Crmail lockfile çözümü PoC kapısıdır. `develop` dalı gelecek CRMv2/Frappev17 olarak işaretli ve kararlı üretim temeli değildir. Bir manifestin eski yardımcı Nix yapılandırmasında Python3.12/Node20 geçmesi, esas `requires-python` ve `engines` sözleşmesini değiştirmez. Kaynak: [CRM kararlılık tablosu](https://github.com/frappe/crm/blob/develop/README.md), [v16 manifest](https://github.com/frappe/frappe/blob/v16.50.0/pyproject.toml).

Kurulum dokümanının v16/develop sütunu geliştirme dalını da birleştirir. Bu yüzden tablo tek başına eksiksiz destek matrisi değildir. PoC sonuçları seçilen release + container digest + DB/Redis runtime + CRM tag birlikte kaydedilene kadar sürüm uyumu koşulludur.

## Teklif yerleşik mi?

Frappe Framework genel platformdur; CRM fırsat, müşteri adayı ve iletişim uygulamasıdır; ERPNext ayrı ERP uygulamasıdır. CRM v1.86.0 DocType ağacında `Quotation` bulunmuyor. CRM'in belgelenmiş “Create Quotation” akışı ERPNext entegrasyonuna dayanır ve ERPNext teklifini açar; bu headless teklif düzenleme ekranını kendiliğinden sağlamaz. Kaynak: [sabit CRM DocType ağacı](https://github.com/frappe/crm/tree/v1.86.0/crm/fcrm/doctype), [CRM–ERPNext entegrasyonu](https://docs.frappe.io/crm/erpnext), [ERPNext Quotation](https://docs.frappe.io/erpnext/quotation).

İki uygulanabilir yol vardır:

1. **CRM + Crmail Proposal:** ajans/hizmet teklifi; kapsam, teslimatlar, ücret kalemleri ve sürümler. ERP zorunluluğu yok. MVP önerisi; maliyet/vergi hesaplaması sınırlı ve açık sözleşmeli olmalı.
2. **CRM + ERPNext Quotation:** stok, fiyat listesi, vergi, para birimi, sipariş ve muhasebe entegrasyonu gerçekten gerekirse. Teklif verisinin mali kaynak otoritesi ERPNext olur; Crmail sunum ve iletim katmanı kalır. Aynı finansal veriyi iki yerde bağımsız hesaplamak yasak olmalı.

ERPNext seçeneği bir “sadece DocType ekle” işi değildir: Company, Customer, Item, Currency, Price List ve vergi kurulumu ek operasyon getirir. Hizmet teklifi gereksinimi netleşmeden ERPNext kurmak scope büyütür. Bu değerlendirme öneridir; finansal kapsam bilinmiyor. Bağlam: [Quotation ön koşulları](https://docs.frappe.io/erpnext/quotation).

## API, oturum ve izinler

Frappe otomatik DocType CRUD ve whitelisted RPC sağlar; işlemler kullanıcı kimliğiyle çalışır. Gönderim, teklif onayı ve kabul gibi iş komutları otomatik CRUD'ye bırakılmamalı. BFF veya doğrudan same-origin proxy seçilebilir; tarayıcıya API secret/SMTP secret verilmez. Kullanıcı cookie oturumunda CSRF, CORS, SameSite ve oturum yenileme PoC'de kanıtlanır. BFF tüm kullanıcılar adına tek Administrator token kullanamaz. Kaynak: [REST kimlik doğrulama](https://docs.frappe.io/framework/user/en/api/rest), [izin modeli](https://docs.frappe.io/framework/user/en/basics/users-and-permissions).

Crmail API önerisi: `save_draft`, `compile_preview`, `publish_template_revision`, `approve_proposal_revision`, `request_dispatch`, `get_dispatch_status`. `request_dispatch` alıcı, başlık, içerik revizyonu, kaynak teklif, dosya erişimi, gönderen hesabı, role/action izni ve idempotency anahtarını sunucuda doğrular. İstemciden gelen `status=Approved`, serbest `from`, `ignore_permissions` veya hazır HTML otorite kabul edilmez. Framework email RPC varlığı Crmail iş izinlerini kaldırmaz. Kaynak: [Communication email API kaynağı](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/communication/email.py).

## Gerçek zayıf noktalar ve tedbirler

| Sınır | Kanıt / etkisi | Crmail tedbiri |
|---|---|---|
| API izin atlama riski | `get_all` izin uygulamaz; `db.set_value` controller trigger'larını çağırmaz | Kullanıcı uçlarında `get_list`, belge bazlı `check_permission`, iş komutlarında controller; alan allowlist |
| Kuyruk ile SMTP atomik değil | SMTP send sonrası recipient durumu yazılır; arada worker ölümü belirsizlik bırakır | Outbox, gönderen tek sahip, belirsiz kabul durumunda otomatik resend yerine inceleme |
| Ağır full-stack işletim | DB, Redis/Valkey, web, worker, scheduler ve gerektiğinde realtime servisleri | Healthcheck, worker lag, restore tatbikatı; ihtiyacı olmayan websocket aboneliği açmama |
| Major değişiklikler | v16 database API breaking change belgelenmiş | Tag sabitleme, sözleşme testi, staging migration ve rollback verisi |
| “Zero downtime” kısıtı | Resmî mekanizma yazmaları durdurup okumayı sürdürür | UI read-only; gönderim/derleme komutlarının maintenance cevabı ve taslak korunması |
| Hazır frontend Vue | Mantine React ile doğrudan bileşen paylaşımı yok | Domain API paylaşılır; native CRM gömme adaptörü ayrı ve isteğe bağlı |
| Tarihçe değişmez belge değil | `Version` değişiklik kaydı ve draft dokümanları tek başına gönderilmiş teklif snapshot'ı değildir | Immutable revizyon + hash + kaynak dosya sürümü |
| Public/private File ayrımı | Public File okuma davranışı daha geniş; private dosya bağlı belge iznine dayanır | Teklif/PDF/kişisel görsel private; authorized download veya CID |
| Platform güvenlik geçmişi | Upstream güvenlik advisories yayımlar | Sürüm takip, yamalama SLA, örnek veriyle saldırı ve izolasyon testleri |

Kaynaklar: [Database API](https://docs.frappe.io/framework/user/en/api/database), [Email Queue source](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py), [background jobs](https://docs.frappe.io/framework/user/en/api/background_jobs), [zero downtime](https://docs.frappe.io/framework/user/en/zero%2A_downtime_migrations), [Document API](https://docs.frappe.io/framework/user/en/api/document), [File controller](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/file/file.py), [security advisories](https://github.com/frappe/frappe/security/advisories).

Bu tablo “Frappe güvensiz/ölçeklenemez” iddiası değildir. Yanlış kullanım, operasyonel bağımlılık ve proje uyarlama maliyetini gösterir. Native workflow ve DocPerm kullanılmalı; bağımsız güvenlik sınırları controller ve API testinde doğrulanmalıdır.

## MCP: hazır çözüm var, doğrudan kurulum engeli de var

Resmî `frappe/mcp` Streamable HTTP adaptörü sunuyor; README yüksek deneysel durum ve yalnız tools desteği bildiriyor. Araştırmada görülen manifest `Werkzeug==3.1.3`, Frameworkv16.50.0 ise `Werkzeug==3.1.6` istiyor. Aynı Python ortamında iki exact pin çözülemez; `--no-deps` ile gizlemek çözüm değildir. Kaynak: [MCP README](https://github.com/frappe/mcp/blob/main/README.md), [MCP manifest](https://github.com/frappe/mcp/blob/main/pyproject.toml), [Framework manifest](https://github.com/frappe/frappe/blob/v16.50.0/pyproject.toml).

Öneri: MCP adapter ayrı süreçte, Frappe'nin sınırlı Crmail iş API'sine kullanıcı/devredilmiş kimlikle bağlanır. Önce draft araçları: şablon listele, CRM bağlamı getir, taslak hazırla, önizleme oluştur. Gönderim yetkisi ayrıca, sunucu onay kaydı ve revizyon hash'i olmadan hiçbir agent gönderemez. Tool annotation güvenlik politikası değildir. Native MCP deneysel entegrasyonu post-MVP araştırma adayıdır; MVP'nin zorunlu dependency'si olmaz.

## Lisans ve ürün sınırı

Framework MIT; CRM AGPL-3.0; ERPNext GPL-3.0. Bunlar aynı lisans değildir. Headless kullanım CRM lisansını ortadan kaldırmaz; değiştirilmiş AGPL programının ağ kullanıcılarına kaynak sunma yükümlülüğü Section13 ile değerlendirilmelidir. Ayrı uygulama/bağlantı sınırının hukuki sonucu otomatik kesinleştirilemez. Kaynak: [Framework LICENSE](https://github.com/frappe/frappe/blob/v16.50.0/LICENSE), [CRM LICENSE](https://github.com/frappe/crm/blob/v1.86.0/LICENSE), [ERPNext license](https://github.com/frappe/erpnext/blob/v16.50.0/license.txt), [CRM lisansının Section13 metni](https://github.com/frappe/crm/blob/v1.86.0/LICENSE).

Crmail public repo olacaktır; bu araştırma lisans seçimi veya değişikliği yetkisi değildir. Kullanıcı Crmail lisansını ayrıca netleştirene kadar yeni LICENSE dosyası eklenmez. Upstream bildirimleri, SBOM, bağımlılık sınırı ve kaynak erişim yöntemi enterprise fazından önce somutlaştırılır.

## Zorunlu PoC çıkış kanıtı

- CRM1.86 + Framework16.50 + Python3.14 + Node24 adayının temiz site kurulumu, migrate ve runtime sürümleri.
- Astro son kullanıcı akışından giriş, yetkili CRM Deal okuma, private File erişimi; ikinci kullanıcı ile negatif izin testi.
- SMTP fake sink ile MJML → server derleme → MIME/CID → native Email Queue; üretim alıcısına mesaj gönderilmeden.
- Dispatch double-click, retry ve worker kill testleri: duplicate davranışı ve belirsiz sonuç görünür.
- Published revizyon değişmezliği; template/draft değişimi geçmiş gönderiyi değiştirmiyor.
- Başarısız maintenance/expired session sırasında taslak korunuyor.

Bunlar planlanan testlerdir; bu araştırmada çalıştırılmadı.
