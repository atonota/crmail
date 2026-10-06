# Mimari karar kaydı

Durum tarihi: 6 Ekim 2026. **Kullanıcı kısıtı** ile **araştırma önerisi** ayrı tutulur. Bir önerinin dokümana yazılması uygulanmış veya kullanıcı tarafından ürün estetiği olarak onaylanmış olduğu anlamına gelmez.

## Karar matrisi

| ID | Karar | Durum | Gerekçe | Yeniden değerlendirme kapısı |
|---|---|---|---|---|
| ADR01 | Frappe Framework + Frappe CRM backend, Astro ön yüz, Mantine, GrapesJS/MJML | Kullanıcı kısıtı | İstenen teknoloji ve ürün yönü | Kullanıcının açık kapsam değişikliği |
| ADR02 | Headless, tüm ürün kullanıcı akışlarında Desk gerektirmemek; yönetim Desk/Bench korunur | Önerilen yorum | Framework yönetim araçlarını kaldırmak ayrı ürün maliyeti | PoC journey matrisi |
| ADR03 | Tek React workspace/provider ağacı; Astro statik kabuk ve public docs | Öneri | Ayrı islands ortak context'i kendiliğinden paylaşmaz | SSR/hydration/auth PoC |
| ADR04 | CRM veri modeli korunur; native Vue frontend fork edilmez | Öneri | React/Mantine ile native Vue aynı extension değildir | Native embedding PoC ve UX bulgusu |
| ADR05 | Önce CRM deeplink, sonra ihtiyaçta izole embed adapter | Öneri | Auth/CSP/focus riskini erkenden sınırlar | Aynı oturumda embed gerçek gereksinimse |
| ADR06 | Service proposal MVP custom; mali ERP kapsamında ERPNext Quotation otoritesi | Koşullu öneri | CRM-only native Quotation yok | İki gerçek, anonimleştirilmiş teklif field mapping |
| ADR07 | Project JSON + MJML + compiled output + immutable revision | Öneri | Düzenleme kaynağı ve iletilen snapshot farklıdır | Round-trip ve revision test |
| ADR08 | Server compiler gönderim otoritesi; native mail dönüşümü sonrası MIME doğrulanır | Öneri | Browser preview teslim kanıtı değildir | Compile/MIME corpus parity |
| ADR09 | Native Email Account/Queue/Communication tekrar kullanılır; custom Dispatch iş intent'ini taşır | Öneri | SMTP/CRM bağları yeniden yazılmaz | Native retry/UnknownSubmission uyumu |
| ADR10 | Idempotency + outbox; exactly-once SMTP iddiası yok | Zorunlu doğruluk sınırı | Uzak SMTP kabulü DB commit ile atomik değil | Failure injection ve reconciliation |
| ADR11 | Browser'da credential yok; sender/assets/recipients server ACL ile | Zorunlu güvenlik sınırı | Kullanıcı istemi yetki kararı değildir | Negatif izin testi |
| ADR12 | İlk provider bir adet; mailcow veya Proton outbound seçimi gerçek hesaba göre | Açık | Hesap, DNS ve plan bilinmiyor | Staging SMTP kabul kapısı |
| ADR13 | MCP ayrı adapter; MVP draft/preview; send exact revision approval ile | Öneri | Upstream deneysel ve exact Werkzeug pin çakışıyor | Adapter/auth PoC; upstream yeni release |
| ADR14 | MJML browser/server 4.18.0 ve plugin 1.0.8 ilk aday, MJML5 ayrı migration | Öneri, doğrulanmadı | Plugin v4 bağımlılığı; latest v5 major farkı | Compatible lock ve fixtures |
| ADR15 | Query/Form/Table gerçek ihtiyaçla; Virtual/DB/Store/Pacer koşullu | Öneri | “Tüm nimetler” tüm paketleri prod bundle'a eklemek değildir | Profiling / kullanım kanıtı |
| ADR16 | Astro ve TanStack Router aynı history'yi yönetmez | Zorunlu mimari sınır | İki rota otoritesi state kaybı yaratır | PoC route ADR |
| ADR17 | GitHub Pages yalnız dokümantasyon; ürün SSR/BFF/SMTP ayrı ortam | Platform sınırı | Static Pages backend worker çalıştırmaz | Üretim topolojisi seçimi |
| ADR18 | Ürün UI estetiği yalnız fikir; semi-flat2.0 teknik standart olarak sunulmaz | Kullanıcı kısıtı | UX planlanır, görsel ürün kararları henüz kilitlenmez | Tasarım prototip incelemesi |
| ADR19 | Crmail lisansı bekletilir; upstream license şartları saklanır | Kullanıcının son yönlendirmesi | Public repo lisans seçimi yerine geçmez | Kullanıcının açık lisans seçimi |
| ADR20 | Claude karşılaştırması tamamlanmadı; gerçek limit kaydı korunur | Doğrulanmış teslim sınırı | CLI hiç araştırma çıktısı üretmedi | Claude bağımsız çalışma tamamlanınca |

## Kanıt bağlantıları

Backend sınırları için [Framework araştırması](../research/frappe-framework.md), [DocType sözleşmesi](backend-doctypes.md) ve [mail iletimi](mail-delivery.md); frontend için [paket araştırması](../research/frontend-stack.md), [mimari](frontend.md) ve [performans/güvenlik](security-performance.md) esas alınır. Upstream kanıtlar: [CRM 1.86 manifest](https://github.com/frappe/crm/blob/v1.86.0/pyproject.toml), [CRM Vue lock](https://github.com/frappe/crm/blob/v1.86.0/frontend/yarn.lock), [GrapesJS project storage](https://grapesjs.com/docs/modules/Storage.html), [plugin compiler manifest](https://github.com/GrapesJS/mjml/blob/master/package.json), [Astro islands](https://docs.astro.build/en/concepts/islands/), [Pages](https://docs.astro.build/en/guides/deploy/github/), [Frappe MCP manifest](https://github.com/frappe/mcp/blob/main/pyproject.toml).

## Karar vermeyi durduran kapılar

Sürüm manifestlerinin uyumu çalışan lockfile değildir. SMTP accepted sonrası native auto-retry belirsizliği açıklanmadan canlı gönderim güvenliği kapanmaz. Private File/CID ve recipient permission negatif testleri geçmeden müşteri verisiyle pilot yapılamaz. Published template veya teklif revizyonu değişebiliyorsa gönderim approval'ı güvenilir değildir. Claude bağımsız araştırması olmadan Codex–Claude uzlaştırması tamamlandı denemez.

Bu karar kaydı üretim servisi kurmaz, repo lisansı seçmez ve doğrudan e-posta göndermez. Bir PoC deneyinin başarısız olması teknoloji kısıtlarını sessizce değiştirmez; seçenek, etkisi ve yeni kullanıcı karar ihtiyacı belgelenir.
