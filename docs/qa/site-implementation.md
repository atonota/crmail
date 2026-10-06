# Dokümantasyon sitesi uygulama kanıtı

Bu sayfa ürün PoC'sinin başarı raporu değildir. Araştırma belgelerini yayımlayan Astro static site uygulamasıdır. Güncelleme: 6 Ekim 2026.

## Kapsam ve kaynak

`docs/**` ve `reports/**` Markdown dosyaları build anında otomatik route, rehber, arama dizini ve kütüphane indeksine alınır. `docs/phases/` altındaki sekiz faz ayrı sayfalardır. Araştırma kaynak HTML'i script olarak çalıştırılmaz; Markdown raw HTML escape edilir, aktif URL protokolleri engellenir. JSON evidence kaynakları araştırma dosyasıdır; müşteri verisi içermez.

GitHub Pages `/crmail/` public static dokümantasyonu sunar. Frappe, SMTP, kimlik doğrulamalı müşteri verisi ve GrapesJS çalışma editörü site paketinde yoktur. Ürün frontend uygulaması geliştirilmiş sayılmaz.

## Yığın ve gerçek sürüm ayrımı

- Gözlenen shell Node:24.21.0. İlk sistem `pnpm` wrapper'ı bundled Node24.19.0 kullanmıştır; takip eden kurulum/build komutları explicit Node24.21.0 ile pnpm CLI'yi çağırmıştır. Paket engine>=24.19<25; CI hedef24.21.0.
- pnpm11.19.0. Manifest exact Astro7.3.6, React19.3.0, Mantine9.7.1, Query5.104.1, marked18.1.0; lockfile aynı resolved sürümleri kaydeder.
- TypeScript5.9.3, Astrocheck0.9.10, Prettier3.9.9, Astro plugin1.1.0 seçildi. Güncel TS7 registry gözlemi otomatik uygulanmadı.
- İlk uygulamada Sharp0.34.5 kullanıldı. Güvenlik audit sonrası final exact Sharp0.35.5'e yükseltildi; Node>=20.9.0 uyumu registry manifestinden doğrulandı. Sharp yalnız Astro asset optimizasyonudur; source logo orijinali korunur. Astro104px WebP türeviyle52px görünür logo; gözlenen774KB source→yaklaşık2KB output.
- Playwright1.62.1 exact; tarayıcı yürütme ve artifact incelemesi ana ajan tarafından ayrı kaydedilir. Emülasyon gerçek macOS/iOS Safari cihaz kontrolü değildir.
- Lisans kullanıcı kararını bekler; public repo open-source lisansı seçildiği anlamına gelmez. Paket `private:true` npm yayınını önler, GitHub public görünürlüğünü değiştirmez; `UNLICENSED` kararı bekleyen package metadata'dır.

## UI uygulama kararları

320px önce: içerik akışkan, rehber semantic native details olarak kapalı başlar; kullanıcı açar. Desktop'ta aynı kontrol ulaşılabilir, gizli paralel navigasyon yoktur. JS olmadan bütün metin ve links erişilebilir. JavaScript arama için gerekir; noscript açıklaması bunu belirtir.

Tek Controls React kökü MantineProvider + QueryClientProvider içerir. Modal, arama ve sonuçlar aynı context'tedir. Arama JSON'u kullanıcı aramayı açana kadar fetch edilmez; Query cache sonraki açışlarda tekrar indirmeyi azaltır. GrapesJS/MJML/site editor asset'leri dependencies'e dahil değildir.

`src/styles/tokens.ts` marka paleti ve semantik renk kaynağı; Mantine theme bunu tüketir. Boşluk, hit area, typography, radius, shadow tokens merkezi CSS'tedir. Librarydefault component appearance marka theme/styling ile uyarlanır. Focus yalnız kontrolde tek outline; coarse pointer hedef48px, fine44px. Ürün UI estetiği bu docs site görünümüyle onaylanmış kabul edilmez.

## Gerçek çalıştırılan kontroller

| Kontrol | Durum | Kanıt ve sınır |
|---|---|---|
| Dependency install | pass | Exact manifest+pnpm-lock; esbuild/sharp scriptleri incelenip yalnız local dependency build allowlist'e alındı. Global Git hook/policy değişmedi. |
| Unit | pass | `node --test src/site/documents.test.mjs`:4 test. Duplicate heading test'i `karar-2` olmadığı için RED, unique slugger sonrası GREEN. |
| Astro/TS | pass | `pnpm run check`:12dosya,0error/0warning; sonraki final kapsam ana ajan tarafından tekrar doğrulanır. |
| İlk productionbuild | pass | `pnpm run build`:9page; sonraki eklenen belgeler finalbuild'de otomatik alınacak. |
| İlk internal links | pass | `pnpm run check:links`:9HTMLroute internal path kontrolü. Final doc kapsamı ayrı tekrar kontrol edilir. |
| Format | pass | Source/code kapsamına Prettier uygulandı; final check CI/main agent. |
| 3browser QA | not_run | Uygulayıcı bu aşamada çalıştırmadı; ana ajan ayrı Playwright matrix/evidence üretir. |
| Independent QA | not_run | Ana ajan salt okunur reviewer sözleşmesiyle tamamlayacak. |
| Gerçek cihaz/OS | not_run | iOS/Android/Safari fiziksel sertifikasyonu yapılmadı. |
| Live Frappe/MJML/SMTP | not_applicable | Dokümantasyon site tesliminde ürün runtime kurulmadı. |

İlk build Sharp eksikliğiyle başarısız oldu; explicit dependency eklenerek düzeltildi. Sonuç başarılı build'de yukarıda kayıtlıdır. Browser pass/CI deployed iddiası bu sayfanın ilk uygulama kontrolünden çıkarılmaz.

## Komutlar ve CI

`pnpm test`, `pnpm check`, `pnpm format:check`, `pnpm build`, `pnpm check:links`, `pnpm test:browser`. `lint` Astrocheck alias'ıdır; ayrı ESLint gate varmış gibi sunulmaz. CI frozen install, unit/type/format/build/link ve Chromium/Firefox/WebKit kontrollerini geçmeden Pages deploy job'una ilerlemez. Workflow dosyası varlığı GitHub run'ın geçtiği anlamına gelmez; gerçek run ana teslim kanıtında raporlanır.

Browser test runner yalnız bu proje için127.0.0.1:45873 production preview açar. Astro7 `--ignore-lock` seçeneği preview'ı foreground test process olarak tutmak içindir; Git hook veya güvenlik guard'ıyla ilişkili değildir. Önceden kullanılan4321portlarının başka yerel süreçlerde olması nedeniyle test portu ayrıldı; mevcut kullanıcı servisleri durdurulmadı.

## pnpm tedarik zinciri kayıtları

pnpm11.19.0 ilk install sırasında seçilmiş yedi yeni yayını `minimumReleaseAgeExclude` içine otomatik ekledi. Bunlar genel release-age politikasını kapatan ayar değildir; wildcard veya tüm paketler istisnası yoktur. Node/global pnpm yapılandırması, Git hook'u veya runtime güvenlik guard'ı değiştirilmedi. `pnpm config get minimumReleaseAge` bu proje bağlamında `undefined` döndü; geçerli default eşik sayısı bu gözlemden türetilmez. Güncel [pnpm ayar rehberi](https://pnpm.io/settings) ve exact11.19.0 CLI davranışı ayrı kanıtlardır.

Bu dar istisnalar explicit exact seçilmiş resmi paketlerin hızlı yayınlarıdır. Registry `time` değerleri ayrıca okundu: Astro7.3.6 2026-10-06T12:45:48Z; React integration7.0.1 12:42:35Z; internal-helpers0.12.0 12:42:29Z; markdown-satteri0.4.3 12:42:39Z; Mantine core9.7.1 12:38:47Z; hooks9.7.1 12:35:32Z; marked18.1.0 2026-10-05T15:40:41Z. Bunlar araştırma anında henüz çok genç yayınlardı. Astro'nun iki internal package'ı seçilen7.3.6 build zincirinin transitive bağımlılıklarıdır; independently ihtiyaç olmayan bir paket eklenmedi.

Doğrudan kaynaklar: [Astro registry](https://registry.npmjs.org/astro), [React integration](https://registry.npmjs.org/@astrojs/react), [Mantine](https://registry.npmjs.org/@mantine/core), [hooks](https://registry.npmjs.org/@mantine/hooks), [internal helpers](https://registry.npmjs.org/@astrojs/internal-helpers), [markdown-satteri](https://registry.npmjs.org/@astrojs/markdown-satteri), [marked](https://registry.npmjs.org/marked). Exact lockfile integrity ve peer manifestler incelendi; pnpm frozen install `Lockfile passes supply-chain policies` çıktısı verdi. Bu çıktı bağımlılıkların mutlak güvenliği garantisi değildir. Sürümler build/type/unit kapsamını geçti; gelecekte genel age policy disable edilmez, bağımlılık upgrade'i ayrı inceleme olur.


## Güvenlik düzeltmesi

Ana ajan `pnpm audit --prod` ile Sharp0.34.5 için iki high advisory buldu. [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) patched>=0.35.0; [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) patched>=0.35.4 gerektirir. Açıklar yok sayılmadı; exact0.35.5 manifest ve lockfile'a alındı. Final audit/build sonucu ana QA kaydında raporlanır.

## Dar kapsamlı erişilebilirlik düzeltmesi

Ana ajan yeni browser regresyonunda Modal kapatma düğmesinin Türkçe erişilebilir adının eksik olduğunu RED olarak gözledi. `closeButtonProps` ile `aria-label="Aramayı kapat"` eklendi. Uygulayıcı kendi geçici127.0.0.1:45874 productionpreview'ında320x740 Chromium cached build1243 headless ölçümü yaptı: kapatma kontrolü44x44; etiketli arama input'u256x44 CSSpx. Inputfocus outline solid, işlevsel sınır baseline `rgb(218,228,239)` kaldı. Bu kontrol tüm browser matrisinin geçtiği anlamına gelmez; ana QA tam GREEN sonucu ayrı kayıttır. Geçici sunucu kapatıldı, mevcut kullanıcı servislerine dokunulmadı.
