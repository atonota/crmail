# Frappe backend, teklif ve e-posta fizibilite araştırması

Araştırmacı kapsamı: framework/CRM, native/custom DocType ayrımı, headless, iletim güvenilirliği, MCP ve upstream lisans. Tarih: 6 Ekim 2026. Kaynaklar canlı web ve upstream raw tag dosyalarından okundu; ortam kurulumu veya gerçek gönderim yapılmadı. Frontend estetiği kararı verilmedi. Claude bağımsız araştırması bu araştırmacı tarafından üretilmedi; koordinatörün `docs/claude/status.md` kaydı ayrı kanıttır.

## Hangi kararlı platform kombinasyonu mümkün?

### Takeaway

Frappe v16.50.0 + CRM v1.86.0 kararlı tag adaylarıdır; CRM manifest v15/v16 aralığına izin verir. Kaynak uyumu çalışma uyumu değildir: temiz kuruluma dayalı PoC zorunludur.

### Cited Findings

- Framework latest releasev16.50.0 bugün yayımlanmış; CRM latestv1.86.0 30 Eylül. — [Framework release](https://github.com/frappe/frappe/releases/tag/v16.50.0), [CRM release](https://github.com/frappe/crm/releases/tag/v1.86.0).
- CRM sabit tag manifesti `frappe>=15.0.0,<17.0.0`; README kararlı main v1, develop gelecek v2/v17 olarak ayırıyor. — [manifest](https://github.com/frappe/crm/blob/v1.86.0/pyproject.toml), [README](https://github.com/frappe/crm/blob/v1.86.0/README.md).
- Framework16.50 Python 3.14 minor istiyor; Node alt sınırı24. Resmî kurulum v16 MariaDB 11.8, Redis/Valkey 6+ listeliyor. — [Python](https://github.com/frappe/frappe/blob/v16.50.0/pyproject.toml), [Node](https://github.com/frappe/frappe/blob/v16.50.0/package.json), [kurulum](https://docs.frappe.io/framework/user/en/installation).
- CRM frontend manifest React değil Vue ve FrappeUI; lockfile Vue 3.5.32 ve frappe-ui 1.0.0-beta.29 çözüyor. — [manifest](https://github.com/frappe/crm/blob/v1.86.0/frontend/package.json), [lockfile](https://github.com/frappe/crm/blob/v1.86.0/frontend/yarn.lock).

### Inferences

- Node 24 ortak candidate'dir; Python 3.10 CRM minimumu Framework 3.14 ihtiyacını gevşetmez.
- Frappe/CRM ve özel Astro frontend'in ayrı build/lock sözleşmeleri olacaktır. CRM Vue kodunu Mantine React gibi mount etmek doğrudan entegrasyon değildir.
- Stable yerine develop çekmek WhatsApp dependency ve framework aralığını değiştirebilir; geliştirme dalları gerekçe olmadan seçilmemeli.

### Gaps

- Container digest, DB patch, Redis runtime, kurulum smoke ve migration çalışmadı.
- Bu kaynak araştırması tüm third-party Python bağımlılıklarının3.14 runtime geçişini kanıtlamaz.
- Bugfix çıkış frekansı SLA değildir; release destek süresi ayrıca üretim işletim kararına bağlanmalı.

## Headless ve native suite entegrasyonu nasıl yorumlanmalı?

### Takeaway

%100 headless son kullanıcı ürünü mümkündür; native CRM ekranına editor gömmek ayrı extension surface'tir. Yönetim Desk kullanımı ürünü zorunlu olarak headless olmaktan çıkarmaz fakat tanım açıkça yazılmalıdır.

### Cited Findings

- Frappe DocTypeCRUD ve whitelist RPC sağlar. — [REST](https://docs.frappe.io/framework/user/en/api/rest).
- CRM Custom Actions Lead/Deal başlık aksiyonlarını CRM Form Script üzerinden ekler; Desk Page API farklıdır. — [Custom Actions](https://docs.frappe.io/crm/custom-actions), [PageAPI](https://docs.frappe.io/framework/user/en/api/page).
- Platform sites DB/schema bağlamları ve operasyon servisleriyle çalışır. — [architecture](https://docs.frappe.io/framework/user/en/basics/architecture), [sites](https://docs.frappe.io/framework/user/en/basics/sites), [multitenancy](https://docs.frappe.io/framework/user/en/bench/guides/setup-multitenancy).

### Inferences

- Birincil Astro UI + custom app API; opsiyonel native CRM “Crmail ile hazırla” bağlantısı. Büyük CRM frontend fork maliyeti gerekmedikçe alınmaz.
- Yönetim Desk'i tamamen kaldırma isteği yeni admin app kapsamı yaratır; varsayılan son kullanıcı akışında Desk görünmez.
- Same-origin/BFF kimlik delegasyonu PoC kararı; tek Administrator credential ile tüm kullanıcıları temsil etmek yanlış sınırdır.

### Gaps

- Gerçek domain, auth sağlayıcısı ve cross-origin topoloji bilinmiyor.
- React editör inline embed mı routehandoff mı olacak deneyle netleşmeli; iki seçenek aynı iş API'sini kullanmalıdır.

## Teklif hangi uygulamanın verisi?

### Takeaway

CRM-only native Quotation yok; ERPNext entegrasyonu finansal teklifi sağlar. Ajans/hizmet MVP'sinde customProposal modelini seçmek daha dar kapsamlıdır; muhasebe/stok gerekiyorsa ERPNext otoritesi değerlendirilir.

### Cited Findings

- CRM v1.86 DocType ağacında Quotation yok. — [DocType ağacı](https://github.com/frappe/crm/tree/v1.86.0/crm/fcrm/doctype).
- CRM ERPNext entegrasyonu deal üzerinden ERPNext Quotation açıyor; aynı site ürün/fiyat senkronu belgelenmiş. — [entegrasyon](https://docs.frappe.io/crm/erpnext).
- ERPNext Quotation kendine özgü item/customer/currency ve mali alanlar barındırıyor. — [Quotation](https://docs.frappe.io/erpnext/quotation).
- Custom Actions örneği `crm.api.quotation.create_from_deal` gösteriyor fakat araştırılan stable tree bunu doğrulamıyor. — [doküman örneği](https://docs.frappe.io/crm/custom-actions); gerçek davranış için [stable tree](https://github.com/frappe/crm/tree/v1.86.0/crm/api) üstün kanıttır.

### Inferences

- Önerilen custom modeller: Crmail Proposal, Proposal Item child, Proposal Revision; gönderim immutable revision'a bağlanır.
- ERPNext kullanılırsa finansal totals kaynak otoritesi ERPNext, Crmail yalnız presentation/distribution.
- Template Version ve Proposal Revision mevcut Framework Version loguna indirgenmez.

### Gaps

- Teklifin vergi, kur, indirim, hukuki kabul, fatura/sipariş devamlılığı kapsamı bilinmiyor.
- İki örnek teklif fieldmapping tamamlanmadan ERPNextdependency'si karar sayılamaz.

## Email pipeline neleri hazır sağlar, neleri sağlamaz?

### Takeaway

Native Account / Queue / Communication kullanılabilir; sunucu iş izinleri, immutable payload ve SMTP belirsiz kabul politikası custom app işidir. “Queue Sent” alıcıya teslim değildir.

### Cited Findings

- Native Email Template rich text / HTML ve Jinja bağlamını destekler. — [CRMtemplate](https://docs.frappe.io/crm/email-template), [template override](https://github.com/frappe/crm/blob/v1.86.0/crm/overrides/email_template.py).
- sendmail delayed, reference, messageid, replyto, inlineimages, rawhtml/addcss alanları sunar. — [sendmail](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/__init__.py).
- SMTP sendmail sonrası recipient Sent update yapılır; queue recovery Sending kayıtlarını retry’ye döndürebilir. — [queue controller](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py), [recovery](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/queue.py).
- HTML renderer native wrapper/CSS/Jinja dönüşüm yapabilir; MIME CID related desteği vardır. — [EmailBody](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/email_body.py).
- Communication make raw HTML için native Template Use HTML kontrolü içerir; internal _make izin kontrolünü atlayan iç metottur. — [Communicationemail](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/communication/email.py).
- Sent append ayrı IMAP işlemi, incoming + IMAP ayarı gerektirir. — [Accountcontroller](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_account/email_account.py).
- SMTP standart tekrar deneme ile kesin tek iletimi garanti etmez. — [RFC5321](https://www.rfc-editor.org/rfc/rfc5321).

### Inferences

- Browser GrapesJS preview → server MJML compiler → approved final HTML/MIME → native queue adapter olmalı.
- Published template / MJML hash yeterli değil: downstream native wrapper ve CID dönüşümü sonrası actual MIME kanıtı saklanmalı.
- Outbox commit + enqueue / duplicate intent çözebilir; SMTP 250 kaybı exactly once çözülemez. UnknownSubmission policy native auto-retry ile gerçek kaynak adaptasyonu testine bağlıdır.
- CID clipboard'da eki otomatik yaratmaz; copy export ile SMTP MIME farklı transport olmalı.

### Gaps

- raw HTML fidelity adapter seçilmedi; compound Jinja/CSS değişimi specimen corpus ile ölçülmeli.
- Native auto-retry / UnknownSubmission uzlaşması teknik PoC blocker; yalnız yeni durum etiketi garanti değil.
- Çoklu To + CC/BCC işpolitikası, attachment boyutları ve gerçek istemci sonuçları açık.

## mailcow ve Proton farkı nedir?

### Takeaway

Her ikisi outbound SMTP adayıdır; Proton submission inbound IMAP değildir. İlk MVP tek provider + mock sink ile başlamalıdır.

### Cited Findings

- mailcow client manual SMTP 465/587 ve IMAP 993 TLS ayarlarını belgeliyor. — [manual](https://docs.mailcow.email/client/client-manual/).
- Proton submission paid/custom domain adresiyle token sağlar, gönderileriSent’e koyar; E2EE değil. — [SMTP](https://proton.me/support/smtp-submission).
- Bridge local IMAP/SMTP; Linux credential store gerektirir; resmî Frappe client garantisi yok. — [Linux](https://proton.me/support/bridge-for-linux), [supported clients](https://proton.me/support/clients-supported-bridge), [localhost TLS](https://proton.me/support/bridge-ssl-connection-issue).

### Inferences

- Proton outbound için Bridge zorunlu değil; inbound ayrı post-MVP keşif.
- SMTP accepted sonrası Sent copy failure aynı iletinin tekrar gönderilmesine neden olmamalı.
- Ürünmailcowserverkurmaişini mevcut altyapı gereksinimi yokken otomatik üstlenmez.

### Gaps

- Hangi provider account / plan / DNS hazır bilinmiyor; credential bulunmadı, aramadık.
- Provider hız / boyut / kota gerçek plan üzerinde teyit edilmeden sayısal garanti yok.

## Framework zayıf noktaları ve güvenlik sınırları?

### Takeaway

Platform özellikleri doğru kullanılırsa veri / izin tekrar yazma yükünü azaltır; kolay düşük seviyeli API ve operasyon bağımlılıkları dikkat ister.

### Cited Findings

- get_list kullanıcı izinlerini uygular, get_all uygulamaz; db.set_value controller trigger çalıştırmaz. — [DatabaseAPI](https://docs.frappe.io/framework/user/en/api/database).
- Private File bağlı belge / owner izinlerine dayanır; get_content düşük seviye okuması tek başına kullanıcı niyetini doğrulamaz. — [File](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/file/file.py).
- Queue background worker / Redis ve enqueue_after_commit desteği vardır. — [Jobs](https://docs.frappe.io/framework/user/en/api/background_jobs).
- Zero downtime migration read-only sınırı taşır. — [migration](https://docs.frappe.io/framework/user/en/zero%2A_downtime_migrations).
- Upstream security advisories yayımlar; backup encryption yapılandırılabilir. — [advisories](https://github.com/frappe/frappe/security/advisories), [backup](https://docs.frappe.io/framework/user/en/guides/basics/how-to-enable-backup-encryption).

### Inferences

- İzin / test katmanı UI gizleme değil server business actions olmalı; File ID ve auth context birlikte doğrulanır.
- MVP tek organization / site; gerekiyorsa site tabanlı tenant izolasyonu başlangıç tasarımıdır, scale fazında filtreyle eklenmez.
- Restore isolated + outbound muted olmak zorunda; restore ile eski queue yanlışlıkla çalışmamalı.

### Gaps

- Kullanıcı role / retention ve hassas veri politikası net değil; risk seviyesi PoC’de representative örneklerle belirlenmeli.
- Gerçek scale limits benchmark yok; framework ölçeklenmez veya sınırsız ölçeklenir iddiası yapılmıyor.

## MCP ve lisans kritik kararları?

### Takeaway

Resmî Frappe MCP yüksek deneysel; seçilen v16 exact Werkzeug pin ile çakışıyor. CRM AGPL, Framework MIT, ERPNext GPL farklı; proje lisansı şimdilik bekliyor.

### Cited Findings

- Native MCP Streamable HTTP tools-only ve highly experimental. — [README](https://github.com/frappe/mcp/blob/main/README.md).
- MCP manifest Werkzeug3.1.3 exact, Framework16.50 Werkzeug3.1.6 exact. — [MCPmanifest](https://github.com/frappe/mcp/blob/main/pyproject.toml), [Frameworkmanifest](https://github.com/frappe/frappe/blob/v16.50.0/pyproject.toml).
- Upstream lisanslar MIT / AGPL3 / GPL3; CRM lisans Section13 modified network work source yükümlülüğünü içeriyor. — [Framework](https://github.com/frappe/frappe/blob/v16.50.0/LICENSE), [CRM](https://github.com/frappe/crm/blob/v1.86.0/LICENSE), [ERPNext](https://github.com/frappe/erpnext/blob/v16.50.0/license.txt).

### Inferences

- Ayrı MCP adapter custom Frappe API kullanması dependency çakışmasını ayırır; permission devri ve approval yine gerekir.
- Sadece template/draft/preview agent tools ilk MVP'yeterli; gönderim için exact revizyon onayı server'da şart.
- Headless CRM, AGPL yükümlülüğünü otomatik düşürmez; custom app birleşimhukuki sınırı teknoloji tercihiyle kesinleşmez.

### Gaps

- Proje lisansı kullanıcının son yönlendirmesiyle ertelendi; yeni LICENSE seçimi yapılmayacak.
- Hukuki combined work değerlendirmesi ve source notice yöntemi daha sonraki karar kapısı.
- Native MCP için upstream release / support SLA vepin compatibility doğrulaması yok.
