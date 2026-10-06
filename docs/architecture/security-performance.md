# Güvenlik, performans ve doğrulama planı

Durum: ürün uygulanmadı; aşağıdaki değerler önerilen PoC kabul bütçeleridir, elde edilmiş benchmark değildir. İnceleme 6 Ekim 2026.

## Tehdit modeli ve kontroller

| Sınır | Risk | Gerekli kontrol | Kanıt |
|---|---|---|---|
| Browser→BFF→Frappe | Başka tenant müşteri/şablon okumak | Her endpoint server ACL; kullanıcı bağlamı; tenant query key | 2 kullanıcı/tenant negatif test |
| Login/session | CSRF, session fixation, token sızıntısı | HttpOnly Secure session, CSRF, explicit origins, logout invalidation | Cross-origin request reddi |
| Preview/editor HTML | Stored XSS, javascript URL | Node/attr/protocol allowlist, script/event-handler reddi, sandbox preview | Script payload etkisiz |
| Asset upload | MIME spoofing, SVG aktif içerik, image bomb | Boyut/dimensions limit, magic bytes, re-encode, private attachment ACL | Zararlı fixtures reddi |
| Remote asset import | SSRF, cloud metadata, DNS rebinding | Varsayılan upload-only; allowlist import, resolve/IP denetimi, redirect kapalı | localhost/private/link-local reddi |
| MJML compiler | include file/URL, aşırı nested template | Include devre dışı veya sabit root allowlist; subprocess/worker timeout, size limit | Dosya okuma/network kaçışı yok |
| Iframe bridge | postMessage spoofing, token kaçışı | Exact origin+source+schema+nonce; secrets/SMTP aktarma yok | Yanlış origin reddi |
| Send RPC | Duplicate send, privilege escalation | Revision approval + recipient permission + idempotency + immutable render | Yinelenen UI/API intent tek Dispatch; SMTP belirsizliği ayrı kapı |
| MCP | Prompt injection ile yetki yükseltme | Least-privilege tools, draft ayrı send ayrı, explicit approval receipt | Agent approval bypass reddi |

Upload ve SSRF kontrolleri [OWASP upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) ve [SSRF rehberi](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) doğrultusunda proje gereksinimidir. Frappe'nin hazır olması özel endpoint'in ACL uygulamasını garanti etmez. Önizleme sanitizasyonu ve gönderim output sanitizasyonu ayrı yapılır; email CSS/Outlook conditional markup korunacak şekilde allowlist fixture'larla sınanır.

Asset manager custom upload callback/remote endpoint desteği verir; Crmail adapter'ı auth, multipart, processing durumunu kontrol eder. Token query parameter'a konmaz. Yerel object URL sadece browser preview içindir; alıcıya gönderilen HTML object URL içermez. Public CDN linki kullanılıyorsa asset'in müşteri gizliliği ve kalıcılık politikası açık olur; private offer asset'leri CID veya yetkili download olur. [GrapesJS Assets](https://grapesjs.com/docs/modules/Assets.html).

CSP: ürün hostunda scripts self/nonce, connect-src yalnız gerekli API, img-src onaylı origin/data/blob gerektiği kapsamda; preview ayrı sandbox origin'de scripts kapalı. GrapesJS canvas/editor ve Mantine runtime style injection CSP'yi etkiler; tek büyük `unsafe-inline/unsafe-eval` açarak sorun örtülmez. Provider `getStyleNonce` desteği vardır. Editor için gerçek ihtiyaç PoC'de network/CSP violation loguyla ölçülür. [MantineProvider](https://mantine.dev/theming/mantine-provider/).

## Email çıktısı web preview ile eşdeğer değil

MJML responsive email üretir; tüm istemcilerde aynı görüntü garantisi değildir. Gmail CSS destek listesi vardır, desteklenmeyen stiller kaldırılabilir. Kabul matrisi: Gmail web/mobile, Proton web, Outlook classic Windows, yeni Outlook, Outlook Mac/web ayrı ürünler; Apple Mail macOS/iOS. Kopyalama ve MIME gönderimi ayrı test. SMTP kabulünden sonra bağlantı zaman aşımı `UnknownSubmission` doğurabilir; native auto-retry davranışı PoC'de ayrıca incelenir. Dış SMTP tesliminde exactly-once garantisi verilmez. [MJML](https://documentation.mjml.io/), [Gmail CSS](https://developers.google.com/workspace/gmail/design/css).

Canonical gönderim: multipart/alternative plain+HTML, görseller için CID/uygun hosted URL, gerektiğinde PDF offer attachment. Base64 PNG email istemci desteği belirsiz olduğundan üretim varsayılanı değildir. Mail provider-specific CID gerçek Frappe pipeline deneyinde doğrulanır. Raw mail source, boyut, Content-ID, headers, screen captures kanıtları kişisel veri içermeyen sentetik fixture üzerinden saklanır. Koyu mod ve görseller kapalıyken marka adı/text/button action anlaşılır kalır.

## Performans bütçesi taslağı

Ölçüm koşulu: production build, exact lockfile/Node/browser, 320x568 ve390x844, Chrome stable 4xCPU slowdown +1.6Mbps/150msRTT sentetik profil; macOS Safari, gerçek iOS/Android ayrı katman. 5-run median/p75/p95 açık ayrılır. Bütçe revizyonu ölçüm kanıtı ve gerekçeyle yapılır.

| Senaryo | Başlangıç hedefi | Ölçüm |
|---|---|---|
| Public docs | İlk route editor/compiler asset sıfır | HAR/request list |
| Workspace list | Initial JS gzip<=250KB öneri | Manifest+network transferred bytes |
| 320px kritik giriş | LCP<=2.5s, CLS<=0.1, INP<=200ms öneri | Lab trace + mümkünse field vitals |
| Editor lazy | Liste route'unda GrapesJS/MJML JS/CSS preload/prefetch yok | Route öncesi/sonrası request diff |
| Basit blok edit | Long task<50ms hedef; p95 compile<500ms hedef | Trace/User Timing fixture |
| Büyük şablon | 100block fixture'da crash yok; p95 server compile<=2s öneri | Cold/warm separate, worker metrics |
| Lifecycle | 20 aç/kapa sonrası monoton retained editor büyümesi yok | Heap snapshot/listener/iframe count |
| Autosave | Typing sırasında düşük request sayısı; son edit flush veya explicit pending | API trace, abort/order test |

Bunlar uygulamanın mevcut sonuçları değildir; GrapesJS+compiler bundle'ı ölçülmeden editör byte sınırı uydurulmaz. Server compile limit maliyeti/şablon kapasitesi PoC ile belirlenecek. `display:none`, CSS media veya `client:visible` tek başına editor asset'in indirilmediği kanıtı değildir; bundler manifest/preload ve HAR okunur. Astro dynamic loading ve hydration yaklaşımı için [framework integration](https://docs.astro.build/en/guides/integrations-guide/react/) esas alınır.

Query cache staleTime/retry/refetch explicit: CRM listesi hafif stale; gönderim mutation otomatik kör retry yapmaz; auth değişiminde cache clear. Query defaults bilinmeden arka planda teklif/alıcı fetch davranışı oluşturulmaz. Server-side pagination, field projection, abort old search ve tanımlı item cap kullanılır. Virtualization veri indirme maliyetini tek başına azaltmaz. [Query defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults), [Virtual](https://tanstack.com/virtual/latest/docs/introduction).

## QA faz kapıları

PoC: sürüm eşliği, project round-trip, browser/server compiler, CRM bridge/auth,320px critical path, send/CID ve idempotency. Bunlar pass olmadan MVP taahhüdü verilmez.

Pre-MVP: failing regression→fix; semantic/ARIA/keyboard checks; Chromium/Firefox/WebKit 320,360,375,390,yatayphone,tablet,desktop; gerçek OS/device ayrı. N−1/N/N+1 yalnız değişen breakpoint'ler için. Email output client matrix browser QA'dan ayrı.

MVP: negative ACL/CSRF/SSRF/XSS tests, focus-visible tek gösterge>=3:1, keyboard Tab/ShiftTab/arrows/Enter/Escape, branded dropdown open panel, reduced motion/200%zoom/virtual keyboard/safe area. Focus panel resize/route cleanup sonrası kaybolmaz. Independent QA değişiklikten bağımsız reviewer'a actual diff/runtime/tests/evidence verir.

Her kanıt kaydı: requirement, commit/build id, OS/browser/viewport/input/network, command, screenshot/trace/HAR, expected/actual ve pass/fail/not_run/not_applicable. AI görsel incelemesi başarısız deterministik testi geçerli yapmaz. Gerçek cihaz çalıştırılmadıysa `not_run`; CI yerel başarıdan çıkarılmaz. Public repo kanıtına müşteri maili/secret/draft içeriği koyulmaz.
