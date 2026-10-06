# Dokümantasyon sitesi doğrulama kaydı

Tarih: 6 Ekim 2026. Bu kayıt yalnız public Astro/Mantine dokümantasyon sitesine aittir. Frappe kurulumu, GrapesJS/MJML ürün editörü, SMTP gönderimi, gerçek müşteri, fiziksel telefon veya gerçek Safari uygulaması testi değildir.

## Ortam ve kapsam

macOS arm64; shell Node 24.21.0, pnpm 11.19.0 wrapper Node 24.19.0. Playwright 1.62.1; mevcut Chromium 153.0.8010.12, Firefox 155 ve WebKit 26.5 executable'ları headless kullanıldı. Grafik arayüz kontrol edilmedi. Yerel üretim test sunucusu yalnız 127.0.0.1:45873 üzerindedir. Diğer yerel servisler korunur.

Yeni site tek akışkan kabuk kullanır. 320, 360, 375, 390, 879/880/881, 1339/1340/1341 ve 1440 CSS px; 740 px telefon ve 900 px geniş görünüm yükseklikleri örneklendi. Arama sırasında 320×740 → 740×320 geçişi, metin ve odak devamlılığı ayrıca kontrol edildi. Fare, klavye, dokunma emülasyonu, reduced motion ve JavaScript kapalı okuma birbirinden ayrı vakalardır. Fiziksel cihaz hareketi veya sanal klavye bunlardan çıkarılmaz.

## Gerçek komutlar

`pnpm test`, `pnpm check`, `pnpm format:check`, `pnpm build`, `pnpm check:links`, `pnpm audit --prod --json`, `pnpm test:browser`. Browser executable ortam değişkenleri sadece mevcut yerel binary'leri seçer. CI ayrıca aynı Playwright sürümüyle Linux binary'lerini kurar. `lint` Astro/typecheck alias'ıdır; bağımsız ESLint denetimi olarak sayılmaz.

## Sonuç kapsamı

| Katman | Durum | Kanıt / sınır |
|---|---|---|
| Unit | pass | 6 vaka: kaynak URL/Markdown dönüşümü, tekrarlı heading, güvenli link/raw HTML davranışı |
| Astro/TypeScript | pass | 15 kaynak dosyası, sıfır error/warning/hint; üretilmiş Playwright vendor raporları kaynak kapsamından ayrıldı |
| Format / production build | pass | Sabit manifest/lock ve statik `/crmail/` çıktısı |
| İç linkler | pass | Üretilmiş rota dosyaları; ayrıca relative `.md` ve yerel fragment taraması |
| Dependency audit | pass | Sharp 0.35.5 güncellemesi sonrası production advisory sayısı sıfır; mutlak güvenlik iddiası değildir |
| Üç motor davranış QA | pass | 48 vaka: nonempty request/response gözlemi, tüm 28 belge rotası, genişlik/giriş/arama kontrolleri; 26,7 saniyelik son 60 vaka koşusu içinde |
| macOS görsel regresyon / bağımsız inceleme | pass | 12 greenfield aday bağımsız salt okunur incelemede kabul edildi; 12 karşılaştırma `maxDiffPixels: 0` ile geçti. Linux referansları ayrı doğrulanacak |
| GitHub Actions / Pages | pending | Workflow dosyası varlığı gerçek run/deploy başarısı sayılmaz |
| Fiziksel iOS/Android/macOS Safari | not_run | GUI kullanıcıya ayrıldı; headless emülasyon gerçek cihaz sertifikasyonu değildir |
| Ekran okuyucu / sanal klavye / gerçek zoom | not_run | DOM/ARIA ve klavye kontrolleri tam erişilebilirlik sertifikası değildir |
| Canlı Frappe/SMTP/MJML engine | not_applicable | Bu teslim araştırma ve dokümantasyon sitesidir; ürün faz kapıları ayrı `not_run` |

## Yakalanıp düzeltilen regresyonlar

- Yinelenen heading için ikinci anchor üretilemiyordu; kaynak testindeki RED sonrası benzersiz slug üretimi GREEN oldu.
- Arama kapatma düğmesinin Türkçe erişilebilir adı yoktu; hedef testi RED, `Aramayı kapat` adıyla GREEN oldu. Close/input en az 44×44; coarse hit hedefi 48 px token'ıdır.
- Yüzde kodlanmış boşluk içeren ana rapor linki ve JSON kaynak kanıtı relative URL olarak kalıyordu. İki anlamlı unit vaka RED; canonical path çözümü ve public GitHub evidence bağlantısıyla GREEN oldu.
- Test portu ayrıldıktan sonra response gözlem filtresi eski portu kullanıyordu. Boş network listesi başarı kanıtı kabul edilmedi; nonempty request/response assertions RED, fixture `baseURL` origin'i ile düzeltildi.
- Astro7 agent varsayılan background preview, Playwright webServer yaşam döngüsüne uymadı. Yeni projeye ait preview temizlenip ayrı portta belgelenmiş foreground seçeneği kullanıldı; Git hooks ve başka servisler değiştirilmedi.

## Kaynak ve performans kanıtı

Cold yeni browser context'te navigation öncesi request attempts ve response byte/status gözlenir. Arama dizini yalnız arama açılınca istenir. Browser'a raw TSX yerine production JS/CSS gelir. Bu site hiçbir GrapesJS/MJML editor bağımlılığı içermez; ürün editörünün gelecekteki koşullu yükleme hedefi burada yapılmış ürün testi diye gösterilmez.

Response body boyutu decoded byte'tır; gzip hesaplaması, wire transfer veya field Core Web Vitals ayrı ölçümlerdir. Kesin LCP/INP/CLS başarısı iddia edilmez. Görsel referans ortamları karıştırılmaz; Linux ve macOS baseline'ları ayrı tutulur. Mevcut kullanıcı görsel referansı bu greenfield repoda yoktur; yeni adaylar uygulayıcının tek başına onayına bırakılmaz.

## Görsel referans protokolü

`tests/visual.spec.ts` üç motorda 320px ana sayfa, 1440px ana sayfa, 320px faz belgesi ve 740×320 arama durumunu karşılaştırır. Yeni referanslar önce bağımsız incelenir; mevcut referanslar topluca veya sessizce güncellenmez. İlk missing-reference koşusu başarısızdır ve yalnız aday üretir; sonraki karşılaştırma sonucu başarı kanıtıdır. Mantine açılış animasyonunda opacity/transform kararlı durumunu beklemek, henüz 44px'e ulaşmamış ölçeklenmiş hedefi doğru ölçmek için gereklidir. Geometri assertion toleransı küçültülmedi. CI/Linux ilk referansları Linux artefaktlarından ayrıca incelenir; macOS görüntüleri Linux karşılığı sayılmaz.
