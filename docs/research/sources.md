# Birincil kaynak kaydı

Araştırma tarihi: 6 Ekim 2026. Kaynak erişimleri araştırmacı notlarında kayıtlıdır; bu liste upstream içerik/manifest incelemesinin kapsamını gösterir, çalışan ürün testi değildir. Registry `latest` ve GitHub hareketli dalları gelecekte değişir; gözlenen değerler ayrıca notlarda saklanır. Sabit backend tag URL’leri mümkün olduğunda tercih edildi.

## Kanıt sınıfları

| Sınıf | Anlam | Bu teslimde durum |
|---|---|---|
| Birincil doküman | Yetenek ve platform sözleşmesi | İncelendi |
| Sabit kaynak/manifest | Belirli release uygulaması ve dependency aralığı | Framework16.50, CRM1.86 için incelendi |
| Hareketli source/registry | Güncel repo/latest gözlemi | Tarih ve sürüm notlarıyla kullanıldı |
| Crmail lock/runtime | Yeni ürün bağımlılık çözümü ve backend çalışması | Henüz yok |
| İstemci/SMTP proof | Gerçek teslim MIME/render ve provider davranışı | Henüz yok |
| Claude bağımsız bulgu | İkinci araç/model araştırması | Üretilmedi; CLI hesap limitinde |

## Frontend registry gözlem özeti

| Paket | 6 Ekim 2026 gözlemi | Kaynak |
|---|---|---|
| astro | 7.3.6 | [Registry](https://registry.npmjs.org/astro/latest) |
| @astrojs/react | 7.0.1 | [Registry](https://registry.npmjs.org/@astrojs/react/latest) |
| react | 19.3.0 | [Registry](https://registry.npmjs.org/react/latest) |
| @mantine/core | 9.7.1 | [Registry](https://registry.npmjs.org/@mantine/core/latest) |
| grapesjs | 0.23.6 | [Registry](https://registry.npmjs.org/grapesjs/latest) |
| grapesjs-mjml | 1.0.8 | [Registry](https://registry.npmjs.org/grapesjs-mjml/latest) |
| mjml | 5.4.1 | [Registry](https://registry.npmjs.org/mjml/latest) |
| mjml-browser | 5.4.1 | [Registry](https://registry.npmjs.org/mjml-browser/latest) |
| @tanstack/react-query | 5.104.1 | [Registry](https://registry.npmjs.org/@tanstack/react-query/latest) |
| @tanstack/react-form | 1.33.5 | [Registry](https://registry.npmjs.org/@tanstack/react-form/latest) |
| @tanstack/react-table | 9.2.6 | [Registry](https://registry.npmjs.org/@tanstack/react-table/latest) |
| @tanstack/react-virtual | 3.14.13 | [Registry](https://registry.npmjs.org/@tanstack/react-virtual/latest) |
| @tanstack/react-router | 1.170.41 | [Registry](https://registry.npmjs.org/@tanstack/react-router/latest) |
| @tanstack/store | 0.11.2 | [Registry](https://registry.npmjs.org/@tanstack/store/latest) |
| @tanstack/pacer | 0.23.1 | [Registry](https://registry.npmjs.org/@tanstack/pacer/latest) |
| @tanstack/db | 0.12.0 | [Registry](https://registry.npmjs.org/@tanstack/db/latest) |
| @tanstack/react-start | 1.168.60 | [Registry](https://registry.npmjs.org/@tanstack/react-start/latest) |

Bu satırlar ürün için onaylanmış kurulum matrisi değildir. Plugin1.0.8 v4 compiler bağımlılığına rağmen MJMLlatest5.4.1 gözlendi; ilk aday v4 browser/server parity PoC’sidir. Frontend geliştirme lockfile’ı paket aralığıyla karıştırılmaz.

## Kaynak envanteri

| Kaynak | Araştırma alanı | Sürüm/kapsam |
|---|---|---|
| [Kaynak](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) | frontend, risk-ux | Resmî doküman / upstream |
| [Kaynak](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) | frontend, risk-ux | Resmî doküman / upstream |
| [Kaynak](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write) | frontend | Resmî doküman / upstream |
| [Kaynak](https://developers.google.com/workspace/gmail/design/css) | frontend | Resmî doküman / upstream |
| [Kaynak](https://docs.astro.build/en/concepts/islands/) | frontend | Resmî doküman / upstream |
| [Kaynak](https://docs.astro.build/en/guides/deploy/github/) | frontend | Resmî doküman / upstream |
| [Kaynak](https://docs.astro.build/en/guides/on-demand-rendering/) | frontend | Resmî doküman / upstream |
| [Kaynak](https://docs.astro.build/en/recipes/sharing-state-islands/) | frontend | Resmî doküman / upstream |
| [Kaynak](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html) | risk-ux | Hareketli manifest/dal |
| [Kaynak](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html) | risk-ux | Hareketli manifest/dal |
| [Kaynak](https://docs.frappe.io/cloud/sites/migrate-an-existing-site) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/crm/custom-actions) | frappe | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/crm/email-template) | frappe | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/crm/erpnext) | frappe, risk-ux | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/erpnext/quotation) | frappe, risk-ux | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/api/background_jobs) | frappe, risk-ux | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/api/database) | frappe, risk-ux | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/api/database#frappe-db-get-all) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/api/page) | frappe | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/api/rest) | frappe, risk-ux | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/basics/architecture) | frappe | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/basics/sites) | frappe | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/basics/users-and-permissions) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/bench/guides/setup-multitenancy) | frappe, risk-ux | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/guides/basics/how-to-enable-backup-encryption) | frappe, risk-ux | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/installation) | frappe | Resmî doküman / upstream |
| [Kaynak](https://docs.frappe.io/framework/user/en/zero%2A_downtime_migrations) | frappe | Resmî doküman / upstream |
| [Kaynak](https://docs.mailcow.email/client/client-manual/) | frappe | Resmî doküman / upstream |
| [Kaynak](https://docs.mautic.org/en/7.0/campaigns/creating_campaigns.html) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://docs.mautic.org/en/7.0/channels/emails.html) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://documentation.mjml.io/) | frontend | Resmî doküman / upstream |
| [Kaynak](https://documentation.mjml.io/#validating-mjml) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://github.com/GrapesJS/mjml) | frontend | Resmî doküman / upstream |
| [Kaynak](https://github.com/GrapesJS/mjml/blob/master/package.json) | frontend | Hareketli manifest/dal |
| [Kaynak](https://github.com/GrapesJS/mjml/blob/master/src/index.ts) | frontend | Hareketli manifest/dal |
| [Kaynak](https://github.com/TanStack/pacer) | frontend | Resmî doküman / upstream |
| [Kaynak](https://github.com/frappe/crm/blob/develop/frontend/package.json) | frontend | Hareketli manifest/dal |
| [Kaynak](https://github.com/frappe/crm/blob/v1.86.0/LICENSE) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/crm/blob/v1.86.0/README.md) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/crm/blob/v1.86.0/crm/overrides/email_template.py) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/crm/blob/v1.86.0/frontend/package.json) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/crm/blob/v1.86.0/frontend/yarn.lock) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/crm/blob/v1.86.0/pyproject.toml) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/crm/releases/tag/v1.86.0) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/crm/tree/v1.86.0/crm/api) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/crm/tree/v1.86.0/crm/fcrm/doctype) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/erpnext/blob/v16.50.0/license.txt) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/blob/v16.50.0/LICENSE) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/communication/email.py) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/file/file.py) | frappe, risk-ux | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/__init__.py) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_account/email_account.py) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py) | frappe, risk-ux | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/email_body.py) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/queue.py) | frappe, risk-ux | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/blob/v16.50.0/package.json) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/blob/v16.50.0/pyproject.toml) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/releases/tag/v16.50.0) | frappe | Sabit upstream tag |
| [Kaynak](https://github.com/frappe/frappe/security/advisories) | frappe | Resmî doküman / upstream |
| [Kaynak](https://github.com/frappe/mcp/blob/main/README.md) | frappe | Hareketli manifest/dal |
| [Kaynak](https://github.com/frappe/mcp/blob/main/pyproject.toml) | frappe | Hareketli manifest/dal |
| [Kaynak](https://grapesjs.com/docs/api/editor.html) | frontend | Resmî doküman / upstream |
| [Kaynak](https://grapesjs.com/docs/modules/Assets.html) | frontend | Resmî doküman / upstream |
| [Kaynak](https://grapesjs.com/docs/modules/Storage.html) | frontend, risk-ux | Resmî doküman / upstream |
| [Kaynak](https://grapesjs.com/docs/modules/Storage.html#project-data) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://learn.microsoft.com/en-us/graph/api/resources/fileattachment?view=graph-rest-1.0) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://mantine.dev/core/portal/) | frontend | Resmî doküman / upstream |
| [Kaynak](https://mantine.dev/styles/mantine-styles/) | frontend | Resmî doküman / upstream |
| [Kaynak](https://mantine.dev/theming/mantine-provider/) | frontend | Resmî doküman / upstream |
| [Kaynak](https://proton.me/support/bridge-for-linux) | frappe | Resmî doküman / upstream |
| [Kaynak](https://proton.me/support/bridge-ssl-connection-issue) | frappe | Resmî doküman / upstream |
| [Kaynak](https://proton.me/support/clients-supported-bridge) | frappe | Resmî doküman / upstream |
| [Kaynak](https://proton.me/support/embedded-images) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://proton.me/support/smtp-submission) | frappe | Resmî doküman / upstream |
| [Kaynak](https://registry.npmjs.org/@astrojs/react/latest) | frontend | Hareketli manifest/dal |
| [Kaynak](https://registry.npmjs.org/@mantine/core/latest) | frontend | Hareketli manifest/dal |
| [Kaynak](https://registry.npmjs.org/astro/latest) | frontend | Hareketli manifest/dal |
| [Kaynak](https://registry.npmjs.org/grapesjs-mjml/latest) | frontend | Hareketli manifest/dal |
| [Kaynak](https://registry.npmjs.org/mjml-browser/4.18.0) | frontend | Resmî doküman / upstream |
| [Kaynak](https://registry.npmjs.org/mjml-browser/latest) | frontend | Hareketli manifest/dal |
| [Kaynak](https://support.apple.com/en-ca/guide/iphone/iphf084865c7/ios) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://tanstack.com/form/latest/docs/framework/react/guides/validation) | frontend | Hareketli manifest/dal |
| [Kaynak](https://tanstack.com/libraries) | frontend | Resmî doküman / upstream |
| [Kaynak](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) | frontend | Hareketli manifest/dal |
| [Kaynak](https://tanstack.com/stack/state) | frontend | Resmî doküman / upstream |
| [Kaynak](https://tanstack.com/virtual/latest/docs/introduction) | frontend | Hareketli manifest/dal |
| [Kaynak](https://webkit.org/blog/10855/async-clipboard-api/) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://www.rfc-editor.org/rfc/rfc2045#section-6.8) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://www.rfc-editor.org/rfc/rfc2392) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://www.rfc-editor.org/rfc/rfc5321) | frappe | Resmî doküman / upstream |
| [Kaynak](https://www.rfc-editor.org/rfc/rfc5321#section-4.5.3.2.6) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://www.rfc-editor.org/rfc/rfc6376) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | risk-ux | Resmî doküman / upstream |
| [Kaynak](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | risk-ux | Resmî doküman / upstream |

## İddia güveni ve kalan boşluk

Upstream exact manifeste veya controller’a dayanan davranış tespitinin güveni yüksek; Crmail’in bileşenleri birlikte çalıştıracağı mimari çıkarımın güveni koşulludur. Mail/client rendering, beklenen p95 ve kapasite için deney olmadan yüksek güven verilmez. Source/registry gözlemi yayımlanmış stable tag veya seçilmiş release olsa bile clean install, migration, CSP/auth ve final MIME testlerini ikame etmez.

Sonuçların belgelere bağlanması: [Framework](frappe-framework.md), [frontend](frontend-stack.md), [gap](gap-analysis.md), [zayıf noktalar](frappe-weaknesses.md), [karşılaştırma](reconciliation.md). Risk/UX araştırma kaynakları envantere eklendi. Liste %100 tüm URL’ler için ayrı HTTP sağlık testi yapıldığı anlamına gelmez; araştırmacıların eriştiği kaynak kayıtlarını birleştirir.
