# Crmail frontend, editor ve performans araştırması

Araştırma tarihi 6 Ekim 2026. Canlı npm latest manifestleri ve resmi repo/dokümanlar incelendi. Ana ajan Node v24.21.0 / pnpm11.19.0 gözlemini bildirdi; bu araştırmada ürün kurulmadı. Claude bağımsız araştırması limit nedeniyle üretilemedi; bu dosya Claude karşılaştırması değildir.

## Astro + Mantine + headless Frappe uygulanabilir mi?

### Takeaway

Uygulanabilir, fakat mevcut Frappe CRM frontend'ini React'e taşıma ile API tabanlı Crmail workspace aynı kapsam değildir. Astro authenticated runtime ve public Pages docs farklı dağıtımlardır.

### Cited Findings

- CRM Vue/Vue Router/Pinia kullanır; React Mantine native eklentisi yoktur — [CRM manifesti](https://github.com/frappe/crm/blob/develop/frontend/package.json).
- Astro client islands farklı context'lerle hydrate olur — [Islands](https://docs.astro.build/en/concepts/islands/), [shared state](https://docs.astro.build/en/recipes/sharing-state-islands/).
- MantineProvider theme/context/CSS variables sağlar ve root'ta kullanılır — [MantineProvider](https://mantine.dev/theming/mantine-provider/).
- React integration7.0.1 Node>=22.12 ister, React17/18/19 peer içerir — [npm manifest](https://registry.npmjs.org/@astrojs/react/latest).
- Mantine9.7.1 React^19.2 ve exact hooks9.7.1 ister — [npm manifest](https://registry.npmjs.org/@mantine/core/latest).
- Astro SSR adapter gerekir; Pages static deployment tarifidir — [SSR](https://docs.astro.build/en/guides/on-demand-rendering/), [Pages](https://docs.astro.build/en/guides/deploy/github/).
- Mantine CSS layer ve import ordering sözleşmeleri vardır; Portal SSR'de mount sonrasına kalır — [Styles](https://mantine.dev/styles/mantine-styles/), [Portal](https://mantine.dev/core/portal/).

### Inferences

- Tek `CrmailWorkspace` React tree, tek Mantine/Query provider; statik/docs Astro. Route owner Astro veya scoped TanStack Router; aynı URL/history'de iki owner yok.
- CRM deeplink ilk adaptör; iframe embedded mode CSP/auth/focus kanıtıyla ikinci adaptör. CRM fork/port ilk sürüm dışında.
- Suite içinde göstermek UI runtime'ı veya SMTP'yi public Pages'e koymak değildir; kullanıcı secret'ları browser'a verilmez.

### Gaps

- Kullanıcının hedef Frappe/CRM sürümü, domain/session topolojisi, iframe tercih sınırı bilinmiyor. Bu eksik bilgiler PoC endpoint/bridge deneyinin girdisidir.
- LocalNode sürümü peer engine'ı sağlasa da full lockfile/build/hydration uyumu henüz doğrulanmadı.

## GrapesJS/mjml neden özellikle PoC gerektiriyor?

### Takeaway

En somut major conflict: plugin1.0.8 resmi v4 compiler'ı kullanırken MJML latest5.4.1. İlk aday browser/server4.18.0 eş compiler ve core0.23.6'dır; test edilmiş kombinasyon değildir.

### Cited Findings

- README minimumGrapesJS0.15.9 ve v4 browser compiler belirtir — [Plugin](https://github.com/GrapesJS/mjml).
- Plugin dependency mjml-browser^4.18.0, development core^0.21.2 — [package.json](https://github.com/GrapesJS/mjml/blob/master/package.json).
- Registry compiler latest5.4.1;4.18.0 ayrı yayın — [latest](https://registry.npmjs.org/mjml-browser/latest), [4.18.0](https://registry.npmjs.org/mjml-browser/4.18.0).
- Plugin custom parser seçeneği verir; default theme global styles enjekte eder — [README](https://github.com/GrapesJS/mjml), [index.ts](https://github.com/GrapesJS/mjml/blob/master/src/index.ts).
- GrapesJS edit edilebilir project data JSON kullanmayı önerir — [Storage](https://grapesjs.com/docs/modules/Storage.html).
- Assets custom upload entegrasyonuna, Editor destroy lifecycle'a sahip — [Assets](https://grapesjs.com/docs/modules/Assets.html), [Editor](https://grapesjs.com/docs/api/editor.html).

### Inferences

- Canonical JSON+MJML+versioned schema ile immutable HTML/plain snapshot ayrı tutulmalı. Tek HTML saklayarak lossless round-trip vaat edilmemeli.
- Core/plugin/compiler CSS/JS editor ihtiyacında lazy yüklenmeli; React GrapesJS DOM'unu yeniden çizmemeli. İframe canvas SSR/CSP/lifecycle/sandbox deneyleri ayrı.
- 320px'de text/button/image property formu ve reorder controls öncelik; bütün desktop drag editor'ünü daraltmak UX kabulü değil.

### Gaps

- Core0.23.6+plugin1.0.8 uyumluluğu, compiler browser/server parity, externalfont/image asset privacy, mergefield escaping, routecleanup, nativeiOS keyboard henüz deney yapılmadı.
- Gmail/Outlook/Proton gerçek teslim render ölçümü yok. MJML veya browser preview tek başına bu kanıtı sağlamaz — [MJML](https://documentation.mjml.io/), [Gmail CSS](https://developers.google.com/workspace/gmail/design/css).

## TanStack, güvenlik ve performansta gerekli seçimler nedir?

### Takeaway

Query/Form/Table somut MVP ihtiyaçlarını karşılar; Virtual ölçüm sonrası, Router scoped seçime bağlı. DB/Store beta/alpha riskini ve Start ikinci framework yükünü ilk faza taşımamak gerekir.

### Cited Findings

- Resmi katalog araç amaçlarını; state sayfası DBbeta/Storealpha/AI RC statüsünü listeler — [Libraries](https://tanstack.com/libraries), [State](https://tanstack.com/stack/state).
- Query default stale/retry/refetch davranışlarını içerir — [Query defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults).
- Form sync/async validation, Virtual headless rendering, Pacer scheduling utilities sağlar — [Form](https://tanstack.com/form/latest/docs/framework/react/guides/validation), [Virtual](https://tanstack.com/virtual/latest/docs/introduction), [Pacer](https://github.com/TanStack/pacer).
- Clipboard write secure context ister; HTML/plain MIME browser kapasitesidir, email client acceptance değildir — [Clipboard](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write).
- Upload ve server remote asset fetch güvenlik kontrolleri gerektirir — [OWASP upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

### Inferences

- Query cache tenant/user-scoped, authlogout temiz; gönderme mutation kör retry yapmaz. Form state MantineForm/TanStackForm ile iki owner olmaz.
- Uploadprivate, MIME/dimensions/size/reencode kontrolleri; remote fetch defaultoff; server compiler includes kapalı. CSP ile CSS/runtime injection gerçek editor üzerinde ölçülmeli.
- Docs route editor/compiler bytes0; productionworkspace initialJSgzip250KB ve LCP2.5s/CLS0.1/INP200ms başlangıç bütçe önerisi; başarılmış sonuç değil. Exact network/CPU/device koşulları security-performance.md'de.

### Gaps

- Editor gerçek productionbundle boyutu, compiler latency, authbridge, CID Frappe email pipeline, kullanıcı hacmi/SLO bilinmiyor. Ölçmeden yüzde performans kazanımı ve kapasite rakamı verilemez.
- Lisanslar: Astro/React/Mantine/MJML/TanStack paketleri manifestteMIT; GrapesJS/pluginBSD3. Bu bağımlılık lisansları Crmail lisansını seçmez; kullanıcı onayı gerekir. [Astro](https://registry.npmjs.org/astro/latest), [Mantine](https://registry.npmjs.org/@mantine/core/latest), [Plugin](https://registry.npmjs.org/grapesjs-mjml/latest).

Detay: `docs/research/frontend-stack.md`, `docs/architecture/frontend.md`, `docs/architecture/security-performance.md`. Registry gözlem ledger: `frontend-version-evidence.json`.
