# Frappe zayıf noktaları: Crmail'e etkisi

Bu analiz 6 Ekim 2026 tarihinde birincil kaynaklarla sınırları değerlendirir. CVE numarası, performans kapasitesi veya güvenlik açığı uydurulmaz. Aşağıdaki konular genel kötüleme değil, bu projenin özel maliyet ve riskleridir. Backend çalıştırılmadı.

## Headless kullanım ready-made CRM deneyimini yeniden oluşturur

Native CRM frontend Vue/Frappe UI'dır. Astro/Mantine ürün kabuğu backend API'sini kullanabilir; native form script, liste, timeline, oturum ve native UI validasyonları özel kabuğa kendiliğinden taşınmaz. UI'dan gelen controller çağrıları ve izinleri doğrulamak gerekir. **Sonuç:** platform veri/iş modelini sağlar, Crmail journey'si custom geliştirmedir. [CRM stable frontend manifest](https://github.com/frappe/crm/blob/v1.86.0/frontend/package.json), [REST API](https://docs.frappe.io/framework/user/en/api/rest).

Öneri: yalnız kritik müşteri → teklif/şablon → önizleme → gönderim akışını geliştir; tüm CRM ekranlarını React'e port etme. Yönetim Desk'i kaldırmayı ürün headless gereksinimiyle karıştırma.

## İzin bypass API'leri özel uygulamada kolay yanlış kullanılır

`get_all` permission filtresi uygulamaz; `db.set_value` `validate/on_update` trigger'larını çağırmaz. Bunlar platformun meşru düşük seviyeli araçlarıdır ama dış API'ye kontrolsüz taşınırsa row access veya state invariant atlanır. **Sonuç:** CRUD'nin varlığı iş komutunun güvenli olduğunu kanıtlamaz. [Database API](https://docs.frappe.io/framework/user/en/api/database).

Öneri: API row permission, field allowlist ve state transition kontrolü; source review'de kullanıcı uçlarındaki `get_all`, raw SQL ve `ignore_permissions` için gerekçeli inceleme. Native Communication internal `_make` dış API değildir; kendi adapter bu metodu kullanacaksa iş izinleri daha önce kontrol edilmiş olmalıdır. [Communication source](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/communication/email.py).

## Email Queue dış side effect için atomik garanti vermez

SMTP kabul ve recipient Sent update ardışık ama atomik değildir. Recovery mekanizması Sending kayıtlarını yeniden denemeye döndürebilir. **Sonuç:** outage sırasında aynı e-postanın tekrar gönderilmesi SMTP standardı ve crash window nedeniyle mümkündür. [Native send](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py), [recovery](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/queue.py), [SMTP RFC](https://www.rfc-editor.org/rfc/rfc5321).

Öneri: UI/API intent için idempotency; DB/outbox reconciliation; belirsiz SMTP kabulünün native retry ile uzlaştırıldığı teknik PoC. Yerel yeni status etiketi otomatik native retry'yi durdurmuyorsa güvenlik hedefi sağlanmaz.

## Mail HTML formatter ikinci sunum motoru yaratır

Compiled MJML HTML native formatter'dan geçebilir; Jinja rendering, email wrapper ve hook CSS/premailer son çıktıyı değiştirebilir. **Sonuç:** editör preview onayı ile gönderilen MIME farklı olabilir. [EmailBody implementation](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/email_body.py).

Öneri: derleme, interpolation ve native format sırayı exact snapshot testinde belirle; desteklenen Outlook conditional markup sanitization'da kaybolmasın. Güvenli final MIME kanıtı oluştur; browser hash'i tek başına approval receipt olmasın.

## Operasyonel yüzey küçük editörden büyüktür

Framework DB, Redis/Valkey, worker/scheduler ve web süreçleri ister. Doküman güncellemesi schema migration gerektirebilir; v16 DB API breaking changes içerir. “Zero downtime” mekanizması yazmaları durdurur. **Sonuç:** teklif düzenleme/gönderim maintenance sırasında kesilebilir. [Kurulum](https://docs.frappe.io/framework/user/en/installation), [DB API](https://docs.frappe.io/framework/user/en/api/database), [read-only migrations](https://docs.frappe.io/framework/user/en/zero%2A_downtime_migrations).

Öneri: immutable Docker/container digest, staging migrate, backup/private file/key restore, outbound-muted restore tatbikatı; UI save pending ve read-only durumları. Çalışan Frappe olmadığı için üretim kapasitesi veya p95 sonucu verilemez.

## Çok tenant ve private dosyalar liste filtresinden fazlasını ister

Frappe site modeli tenant için bir yapı sağlar; File erişimi public/private ve bağlı belge/owner kararına dayanır. Backend bytes okuması kullanıcı adına erişim iznini kendiliğinden sağlamaz. **Sonuç:** private file'ı mailde public URL yapmak veya global preview cache kullanmak sızıntı yaratabilir. [Sites](https://docs.frappe.io/framework/user/en/basics/sites), [File source](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/file/file.py).

Öneri: MVP tek organizasyon/site; her async worker ve preview/File/cache aynı site/user bağlamını taşır. Multi-tenant ihtiyaç doğarsa veri erişimi, backup ve log sınırı birlikte sınanır; sonradan `organization_id` filtresi eklemek tek başına çözüm değildir.

## Eklenti ekosistemi pin ve lisans bakım yükü taşır

Resmî MCP halen deneyseldir; mevcut manifest Frameworkv16.50.0 exact Werkzeug pin ile çakışır. CRM AGPL, Framework MIT, ERPNext GPL farklıdır. **Sonuç:** “aynı Frappe suite” olması ortak kararlılık veya tek lisans şartı anlamına gelmez. [MCP](https://github.com/frappe/mcp/blob/main/README.md), [MCP manifest](https://github.com/frappe/mcp/blob/main/pyproject.toml), [Framework manifest](https://github.com/frappe/frappe/blob/v16.50.0/pyproject.toml), [CRM LICENSE](https://github.com/frappe/crm/blob/v1.86.0/LICENSE).

Öneri: MCP ayrı adapter, limited tools ve server onay politikası; dependencies inventory ve lisans değerlendirmesi. Crmail lisansı kullanıcı yönlendirmesiyle bekletiliyor; upstream lisanslar bu nedenle kaybolmaz.

## Önceliklendirme

P0: alıcı/sender/File permission ve immutable onay; native retry belirsizliği; MJML/native final MIME doğruluğu. P1: headless oturum/CSRF, preview isolation, restore ve schema migration. P2: operasyonda queue fairness ve tenant ölçeği, native CRM embed adaptörünün bakım maliyeti. Bunlar risk önceliği önerileridir; mevcut çalışan üründe tespit edilmiş bug listesi değildir.
