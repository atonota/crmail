# Frontend fizibilitesi ve bağımlılık araştırması

İnceleme: 6 Ekim 2026. Bu belge kurulum sonucu değil, resmi doküman ve canlı paket manifesti incelemesidir. Gözlenen `latest`, kilitli çözüm ve çalıştırılan sürüm ayrı kavramlardır. Ürün frontend'i henüz kurulmadığı için ürünün lockfile çözümü ve runtime uyumluluğu **doğrulanmadı**.

## Sonuç ve entegrasyon sınırı

Astro + React + Mantine ile Frappe'yi headless kullanmak teknik olarak uygulanabilir. Frappe CRM'in mevcut Vue ekranlarını Mantine bileşenlerine dönüştürmek ise ayrı bir frontend yeniden geliştirmesidir. CRM kaynak manifesti Vue, Vue Router, Pinia ve frappe-ui içerir; React eklentisi gibi gömülemez. [CRM manifesti](https://github.com/frappe/crm/blob/develop/frontend/package.json).

Önerilen sınır: CRM veri modeli ve yetki kuralları Frappe tarafında; müşteri, teklif, şablon, gönderim deneyimi bağımsız Crmail Astro/React uygulamasında. Frappe Suite/CRM içinde bağlantı veya ayrı editor route gömülmesi ikinci giriş noktasıdır. Kullanıcı “CRM içine gömmek” ile mevcut Vue detay ekranında aynı kullanıcı oturumu altında editor istiyorsa bu adaptör PoC'de ayrıca kanıtlanmalıdır. Mevcut CRM'in tüm frontend'ini Astro ile yeniden yazmak MVP kapsamı değildir. Bu bir proje çıkarımıdır; kaynak uygulamanın hazır özelliği değildir.

## Sürüm kanıtı

Canlı npm registry'den gözlendi; her satırdaki kaynak exact `latest` manifestidir. Üretim seçimi olarak otomatik benimsenmez.

| Paket | Gözlenen sürüm | Uyum notu |
|---|---|---|
| [astro](https://registry.npmjs.org/astro/latest) | 7.3.6 | Node >=22.12.0 |
| [@astrojs/react](https://registry.npmjs.org/@astrojs/react/latest) | 7.0.1 | React 17/18/19 peer; Node >=22.12.0 |
| [react](https://registry.npmjs.org/react/latest) | 19.3.0 | React DOM aynı sürüm çizgisinde kilitlenmeli |
| [@mantine/core](https://registry.npmjs.org/@mantine/core/latest) | 9.7.1 | React/React DOM ^19.2.0; hooks exact9.7.1 |
| [grapesjs](https://registry.npmjs.org/grapesjs/latest) | 0.23.6 | Plugin manifestindeki geliştirme aralığı farklı |
| [grapesjs-mjml](https://registry.npmjs.org/grapesjs-mjml/latest) | 1.0.8 | mjml-browser ^4.18.0; @types/mjml ^4.7.4 |
| [mjml](https://registry.npmjs.org/mjml/latest), [mjml-browser](https://registry.npmjs.org/mjml-browser/latest) | 5.4.1 | Plugin'in varsayılan compiler major'ından farklı |
| [@tanstack/react-query](https://registry.npmjs.org/@tanstack/react-query/latest) | 5.104.1 | React18/19 |
| [@tanstack/react-form](https://registry.npmjs.org/@tanstack/react-form/latest) | 1.33.5 | React17/18/19 |
| [@tanstack/react-table](https://registry.npmjs.org/@tanstack/react-table/latest) | 9.2.6 | Node>=20; React>=18 |
| [@tanstack/react-virtual](https://registry.npmjs.org/@tanstack/react-virtual/latest) | 3.14.13 | React16.8–19 peer |
| [@tanstack/react-router](https://registry.npmjs.org/@tanstack/react-router/latest) | 1.170.41 | Node>=20.19 |
| [@tanstack/store](https://registry.npmjs.org/@tanstack/store/latest) | 0.11.2 | Semver0; resmi katalog alpha etiketi |
| [@tanstack/pacer](https://registry.npmjs.org/@tanstack/pacer/latest) | 0.23.1 | Semver0; Node>=20 |
| [@tanstack/db](https://registry.npmjs.org/@tanstack/db/latest) | 0.12.0 | Semver0; beta, TypeScript>=4.7 |
| [@tanstack/react-start](https://registry.npmjs.org/@tanstack/react-start/latest) | 1.168.60 | Node>=22.12; Astro ile ikinci fullstack framework |

Registry'deki non-prerelease sürüm numarası ürün kararlılığı kanıtı değildir. TanStack'ın kendi [state kataloğu](https://tanstack.com/stack/state) DB'yi beta, Store'u alpha ve AI'ı RC olarak sunar. Doküman, registry ve GitHub master aynı anda aynı sürümü göstermeyebilir. PoC başlangıcında manifest + release + lockfile + runtime yeniden kaydedilir.

## GrapesJS/mjml: en önemli uyum riski

Plugin README gerçek zamanlı resmi **v4** compiler ve browser mocks kullandığını söyler; manifest `mjml-browser:^4.18.0`, geliştirme GrapesJS'i `^0.21.2` olarak belirtir. README minimum0.15.9 şartı yeni major/minor kombinasyonlarının test edildiği anlamına gelmez. [README](https://github.com/GrapesJS/mjml), [manifest](https://github.com/GrapesJS/mjml/blob/master/package.json).

PoC aday matrisi: plugin1.0.8 + GrapesJS0.23.6 + mjml-browser4.18.0 + server mjml4.18.0. Bu matris **henüz test edilmedi**. Plugin'in README minimumu yeterli değildir; component round-trip, import/export, undo/redo, image asset, multiple button ve server/browser HTML semantic parity testleri geçmeden release alınmaz. MJML5.4.1 ayrı migration deneyi; parser adapter yazılmadan zorla override edilmez. Plugin özel `mjmlParser` kabul eder, fakat API uyumu ve çıktının eşliği Crmail sorumluluğudur. [Plugin seçenekleri](https://github.com/GrapesJS/mjml#options), [MJML dokümanı](https://documentation.mjml.io/).

Kaydetme kaynağı yalnız export HTML olamaz. GrapesJS, edit edilebilir proje için JSON project data kullanılmasını ister. Crmail; proje JSON, canonical MJML, compiler/plugin/schema sürümleri, immutable render HTML ve düz metni ayrı tutmalıdır. HTML tekrar içe alma üzerinden kayıpsız düzenleme varsayılmaz. [Storage Manager](https://grapesjs.com/docs/modules/Storage.html).

## Astro, Mantine ve provider sözleşmesi

Astro islands ayrı context'lerde hydrate edilir. Bir `.astro` sayfada MantineProvider wrapper görüntüsü yaratıp bağımsız React adalarını ortak context almış saymak hatadır. Mantine, provider'ın uygulama kökünde kullanılmasını ister. Editör toolbar, dialog, forms ve QueryClient tek React `CrmailWorkspace` kökünün altında olur. Statik dokümantasyon navigasyonu React hydrate edilmek zorunda değildir. [Astro islands](https://docs.astro.build/en/concepts/islands/), [paylaşılan state](https://docs.astro.build/en/recipes/sharing-state-islands/), [MantineProvider](https://mantine.dev/theming/mantine-provider/).

Mantine9 React19.2+ ister; eski “Mantine7 + React18” tarifleri bu matrise taşınmaz. Astro React7 Babel integration seçeneğini kaldırmış, experimental Oxc React Compiler seçeneği eklemiştir. PoC'de compiler opt-in kullanılmaz; ölçülmeyen memoization kazancı vaat edilmez. [React integration](https://docs.astro.build/en/guides/integrations-guide/react/).

Mantine styles import sırası veya `styles.layer.css` cascade order açık olmalı; aynı paketin layered ve non-layered dosyası birlikte yüklenmez. MVP'de güvenilir global component CSS; sonraki aşamada bundle analiziyle component CSS ve dependency styles ayıklanır. Unstyled/headless kullanılabilir; select için Mantine Combobox tabanlı kontrol, panel/klavye/ARIA birlikte tasarlanır. NativeSelect ve yalnız appearance:none tercih edilmez. [Styles](https://mantine.dev/styles/mantine-styles/), [CSS bağımlılıkları](https://mantine.dev/styles/css-files-list/), [unstyled](https://mantine.dev/styles/unstyled/).

Modal/Drawer portal'ları varsayılan olarak body altında render olur ve SSR'de mount sonrasına kadar görünmez. Portal target, token scope, z-index, scroll lock ve focus restore iframe editor ile PoC'de kontrol edilir. UI bir iframe içine alınırsa portal o belgeye yöneltilmelidir; yanlış belgenin body'sine portal güvenilir değildir. [Mantine Portal](https://mantine.dev/core/portal/).

## TanStack seçimi: her paket aynı amaç için değil

| Araç | Karar | Somut gerekçe ve risk |
|---|---|---|
| Query5 | MVP | Frappe server-state cache; tenant/user/query key; auth değişiminde temizleme. Default stale/retry/refetch davranışları bilinçli ayarlanır. |
| Form1 | Pre-MVP→MVP | Teklif, alıcı, subject, schema validation; Mantine visual controls. Aynı formu Mantine Form ve TanStack Form ile iki kez yönetme. |
| Table9 | MVP | Server pagination/sort/filter sözleşmesi; UI headless. Eski v8 örnekleri v9'a test etmeden taşınmaz. |
| Virtual3 | Post-MVP koşullu | Çok uzun activity/asset/list'te profiling sonrası. Küçük tabloya eklenmez; screen reader ve focus retention test gerekir. |
| Router1 | PoC opsiyon | `/app/*` tek React SPA route sahibi olacaksa kullan. Astro ile aynı URL/history navigation için iki router aktif olmaz. |
| Store0 | Ertele | Küçük local form/draft state React ile başlayabilir. Alpha bağımlılığı yalnız gerçek cross-component ihtiyaçla izole adapter üzerinden. |
| Pacer0 | Koşullu | Debounced draft save/asset search; server rate-limit veya durable queue değildir. Unmount flush/cancel ve abort sırası garanti edilmelidir. |
| DB0 | Post-MVP deney | Beta reactive collection sync, offline reconciliations. Frappe yetkili backend veritabanının yerini almaz; ACL-aware changefeed ve conflict resolution hazır sayılmaz. |
| Start | Kullanma | Astro seçildi; ikinci SSR/fullstack framework sınır ve bakım çoğaltır. |
| AI | Ayrı deney | Resmi state sayfasında RC. MCP yetkisi, gönderim onayı ve secret isolation sağlamaz. İlk MCP bağımsız server adapter. |
| Devtools | Geliştirme | Prod bundle/log içinde müşteri içerikleri sergilenmez. |
| Hotkeys | İhtiyaçta | Editör Ctrl/Cmd kısayollarını çakıştırmadan scoped dispatch; erişilebilir eylemler ayrıca görünür. |
| Intent | Ertele | Link intention prefetch gizli müşteri verisini yetkisiz fetch etmeye dönüşmez; fayda ölçülmeli. |
| Charts | PMF sonrası | Gönderim/teklif KPI ihtiyacı doğmadan bundle'a girmez. Kararlılık exact seçilen sürümde tekrar incelenir. |
| Markdown/Highlight | Docs koşullu | Araştırma sayfası static build dönüşümü yeterli; ürün e-posta içeriğinde code highlighting gerekmez. |
| Ranger | Kullanma | İlk kritik yolculukta custom range slider yok; component gereksinimi oluşursa değerlendirilir. |
| CLI/Config | Tooling koşullu | Runtime'a girmez; mevcut repo build/CI düzeni yeterliyse yeni araç eklenmez. |

Paket yetenekleri için [TanStack katalog](https://tanstack.com/libraries), [Query defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults), [Form validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation), [Virtual](https://tanstack.com/virtual/latest/docs/introduction), [Pacer README](https://github.com/TanStack/pacer), [DB](https://github.com/TanStack/db) incelendi. Bu tablo proje seçimidir; bütün araçların aynı kararlılık seviyesinde olduğu iddiası değildir.

## Kesinleşmeyenler ve devam kapıları

1. Plugin0.23.6 core ile render round-trip geçiyor mu? Kanıt: aynı revision yeniden açıldığında MJML schema ve kullanıcı düzeni korunur.
2. MJML4 browser/server CSS çıktısı ve merge-field escaping eş mi? Kanıt: aynı fixtures ve export hash farkının açıklanması.
3. CRM içine iframe mi route adapter mı? Tenant session, CSP frame-ancestors, unsaved navigation, origin ve keyboard sınırı PoC'de kanıtlanır.
4. Telefon ekranında editör paneli kullanılabilir mi? 320px text/button/image edit/reorder/save/preview gerçek görev testi; drag-only başarılı sayılmaz.
5. Frappe gönderim HTML/CID pipeline'ı aynı şablonu taşıyor mu? SMTP teslim ve gerçek email render kanıtı gerekir.
6. SSR/BFF barındırma ve auth domain seçimi bilinmiyor; GitHub Pages yalnız public docs çıktısıdır, ürün runtime'ı değildir. [Astro SSR](https://docs.astro.build/en/guides/on-demand-rendering/), [Pages](https://docs.astro.build/en/guides/deploy/github/).

Bu bilinmeyenler çözülmeden “tam uyumlu” ve performans sonucu yazılmaz. Gerekli deneyler [frontend mimarisi](../architecture/frontend.md) ve [güvenlik/performance](../architecture/security-performance.md) içinde tarif edilmiştir.
