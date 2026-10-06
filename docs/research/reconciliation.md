# Araştırma karşılaştırması ve uzlaştırma

Tarih: 6 Ekim 2026. **Codex–Claude içerik karşılaştırması tamamlanmadı.** Claude Code CLI gerçek terminalden arka planda çağrıldı; aylık harcama limiti nedeniyle içerik üretmedi. Claude araştırması, kaynak analizi veya tasarım bulgusu varmış gibi birleştirilmez. Kanıt: [Claude durum kaydı](../claude/status.md).

## Mevcut araştırmacıların bulguları

| Konu | Backend araştırması | Frontend/UX araştırması | Uzlaştırılmış öneri |
|---|---|---|---|
| Headless | Son kullanıcı API, yönetim Desk korunabilir | Tek React workspace ve CRM adapter | Ürün yolculuğu headless; admin yeniden geliştirme ilk kapsam dışı |
| CRM embedding | Native Vue ekran ve Desk farklı | Route deeplink önce, iframe ayrı PoC | Birinci giriş Astro, native CRM giriş adaptörü opsiyonel |
| Canonical içerik | Immutable revision ve server dispatch | JSON + MJML + browser/server compiler parity | Düzenleme kaynağı ve teslim MIME farklı snapshot |
| Gönderim | Native SMTP Queue + custom intent | Query mutation blind retry yapmaz | UI double-click tek intent; SMTP ambiguous ayrı unresolved gate |
| Sürüm | Framework 16.50 / CRM 1.86 pinned source | npm latest compiler major uyuşmazlığı | Adaylar exact lock/runtime PoC ile doğrulanır; latest otomatik seçilmez |
| MCP | Native adapter deneysel/Werkzeug conflict | Agent draft ve server approval | Ayrı MCP process önerisi; ürün API'si tek policy kaynağı |
| Tasarım | UI kararına backend karar verilmez | Semi-flat2.0 estetik brief | UX states/recovery planlanır, ürün görsel kararları öneri kalır |

Kanıt ve detay: [Framework](frappe-framework.md), [frontend](frontend-stack.md), [gap](gap-analysis.md), [mail delivery](../architecture/mail-delivery.md), [frontend architecture](../architecture/frontend.md).

## Kaynak çelişkilerini çözme yöntemi

CRM CustomActions doküman örneği Quotation API gösterirken stable source bunu doğrulamıyor; gerçek ERPNext entegrasyon belgesi teklifin ERPNext'te açıldığını bildiriyor. Stable tag source ve manifest öncelikle kullanıldı; doküman örneği çalışan release API kanıtı sayılmadı. [Custom Actions](https://docs.frappe.io/crm/custom-actions), [CRM stable API tree](https://github.com/frappe/crm/tree/v1.86.0/crm/api), [ERPNext integration](https://docs.frappe.io/crm/erpnext).

Plugin manifest v4 browser compiler; MJML registry latest v5. Aynı “MJML destekli” etiketi major parity sağlamaz; v4 eş aday matrisi ile PoC, v5 için ayrı migration. [Plugin manifest](https://github.com/GrapesJS/mjml/blob/master/package.json), [compiler latest](https://registry.npmjs.org/mjml-browser/latest).

Frappe MCP/Framework Werkzeug exact pinleri uyuşmaz. Dependency kontrollerini atlamak yerine ayrı süreç veya uyumlu upstream release bekleme seçeneği. [MCP pin](https://github.com/frappe/mcp/blob/main/pyproject.toml), [Framework pin](https://github.com/frappe/frappe/blob/v16.50.0/pyproject.toml).

## Claude tamamlandığında doldurulacak matris

| Claim ID | Codex kanıtı | Claude kanıtı | Çatışma büyüklüğü | Sonuç ve gerekçe |
|---|---|---|---|---|
| C01 sürüm/uyum | Sabit upstream tag + manifest + registry gözlemi | Henüz yok | Değerlendirilmedi | PoC adayı, runtime doğrulanmadı |
| C02 teklif modeli | CRM vs ERPNextsource | Henüz yok | Değerlendirilmedi | Basit Proposal önerisi koşullu |
| C03 editor/compiler | Plugin v4/latest v5 | Henüz yok | Değerlendirilmedi | Browser/server exact major parity |
| C04 SMTP belirsizlik | Native source + RFC | Henüz yok | Değerlendirilmedi | Unresolved technical gate |
| C05 MCP | Experimental + exact pin conflict | Henüz yok | Değerlendirilmedi | Separate adapter önerisi |
| C06 faz/UX | Araştırma ve kullanıcı gereksinimi | Henüz yok | Değerlendirilmedi | Aşamalı plan, estetik öneri |

Kullanıcı tercihi: küçük farklılıkları ortak kanıtla birleştir; büyük teknik ayrışmada Claude yaklaşımını öncelikli değerlendir. Buna rağmen doğrulanmamış kaynak/sürüm veya güvenlik iddiası gerçek olmuş gibi sunulamaz. Büyük çelişki ortaya çıkarsa Claude yaklaşımıyla uygulanabilir seçeneğin trade-off'u ve kalan deney kapısı açık yazılır. Hesap limitini aşmak için ücret/ayar değişikliği yapılmaz ve bu belgede ek onay sorusu istenmez.

Bu durum, platform araştırmasının tamamlanmış kısımlarını geçersiz kılmaz; kullanıcının istediği bağımsız Claude bulguları ve karşılaştırma tesliminin hâlâ eksik olduğunu gösterir.
