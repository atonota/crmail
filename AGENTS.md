# crmail çalışma sözleşmesi

## Teslim kapsamı

Bu aşama kaynaklı araştırma, fizibilite, UX, mimari ve sekiz fazlık yol haritası ile bunları yayımlayan dokümantasyon sitesidir. Canlı Frappe CRM ürünü geliştirilmiş veya üretimde çalışıyor değildir. GitHub Pages yalnız public dokümantasyonu sunar; kimlik doğrulamalı ürün arka ucu, e-posta alıcıları, taslaklar, SMTP kimlik bilgileri ve müşteri verileri burada yer almaz.

## Mimari sınırlar

- Ürün son kullanıcı arayüzü Astro + React/Mantine; Frappe Framework/CRM backend headless hedeflenir. İdari Desk gereksinimleri araştırmada ayrıca kaydedilir.
- GrapesJS/MJML görsel editörünü koru; tuvali Mantine bileşenleriyle yeniden yazma. Editor chunklarını yalnız düzenleme yolculuğunda yükle.
- TanStack araçlarını somut ihtiyaca göre seç; iki routing sahibinden, kopyalanan server state'ten ve gereksiz bağımlılıklardan kaçın.
- Ürün görsel estetiği öneriler ve karar kapılarıdır; kullanıcı seçimi olmadan onaylanmış ürün tasarımı sayılmaz. Dokümantasyon sitesinin semi-flat 2.0 yaklaşımı ayrı bir sunum kararıdır.
- Teknik iddialar kaynak, tarih, sürüm/commit ve kanıt türü içerir. Önerilen metrikler gerçek ölçüm veya PoC başarısı olarak sunulmaz.
- Gerçek unknown unknowns önceden eksiksiz listelenemez. Bilinen açık soruları keşif yöntemlerinden ayır.
- Claude bağımsız belgeleri korunur. Uzlaştırma ayrı belgede yapılır; büyük çatışmalarda kullanıcı tercihi gereği Claude görüşüne öncelik verilir, doğrulanmış çelişkiler ve belirsizlikler gizlenmez.

## Kalıcı kişisel kurallar

- Yeni commit author ve committer yalnız `karacaismail <35493655+karacaismail@users.noreply.github.com>` olur. Co-author, bot, generated-with veya oturum trailer ekleme.
- `/Users/w6x/.config/git/author-guard/hooks` korunur; hook atlama veya hooksPath değişikliği yasaktır. Başka kişilerin upstream commitlerini yeniden yazma.
- Repo public olur; bu servis/veri erişimini public yapmaz. Kullanıcı onaylamadan proje lisansı seçme veya değiştirme.
- Secret, gerçek `.env`, erişim bilgisi, yedek ve kişisel verileri yayımlama. `work/` dış yayıma ve Git'e kapalıdır.
- Emoji kullanma.
- Bu Mac'te Colima `factory`; Docker Desktop kullanılmaz. Mevcut servisler yeniden başlatılmaz. Bu teslim container gerektirmez.
- Altyapı/güvenlik/CI/CD/deploy teknik sahibi Hüseyin Cengiz; GoDaddy/DNS uygulama sahibi insan Asistan Hüseyin. Bu roller otomatik mesaj veya sunucu değişikliği yetkisi vermez.

## UI ve doğrulama

- Ortak kaynak `/Users/w6x/.claude/skills/coding-standards/SKILL.md` ve ilgili `references/resolution.md`, `typescript.md`, `verification.md`, `adaptive-ui.md`, `adaptive-qa.md` uygulanır.
- Renk, tipografi, boşluk, gölge, radius ve etkileşim durumlarını merkezi semantik tokenlarla yönet; AtonotA mevcut marka renklerini temel al. Hazır Mantine temasını tasarım kararı sayma.
- 320 CSS px kritik okuma/gezinme yolculuğuyla başla; 360/375/390, yatay, tablet, masaüstü ve içerik breakpoint sınırlarını doğrula. Cihaz adı/UA ile deneyim seçme.
- Tek focus-visible göstergesi yalnız odaklanan kontrolde olur. Dropdown varsa erişilebilir Mantine/headless bileşeni kullan; native select paneli yeterli değildir.
- GitHub Pages production build, alt yol `/crmail/`, doğrudan sayfa erişimi, linkler, klavye, arama, overflow ve gerçek network requestlerini doğrula. Emülasyon gerçek Safari/iPhone sertifikasyonu değildir.
- Bağımsız salt okunur standart/QA incelemesi gerekir. `/Users/w6x/.claude/agents/standards-reviewer.md` sözleşmesi geçerlidir: inceleyici komut, dosya değişikliği, kurulum veya yeni inceleyici çalıştırmaz. Ana ajan kontrolleri çalıştırır ve gerçek kaynak/çıktıyı verir.
- Geçen/başarısız/çalıştırılmayan/uygulanmayan kontroller ayrı kaydedilir. Dokümanlarda önerilen PoC ve ürün testleri çalıştırılmış sayılmaz.

## Komutlar

- Kurulum: `pnpm install --frozen-lockfile`.
- Kontroller: `pnpm test`, `pnpm check` (Astro/TypeScript), `pnpm format:check`.
- Üretim: `pnpm build`, `pnpm check:links`.
- Astro SSR interaktif kontrolü event handler hazır olmadan kullanılabilir gösterme; native disabled/aria-busy ile hydration sınırını koru. Geciktirilmiş JS regresyonunu koru; statik gezinme JS gerektirmez.
- Görsel referanslar `tests/visual.spec.ts-snapshots/` içinde motor/platform bazında ayrılır; yeni/değişen adayları bağımsız incele, mevcut görselleri topluca güncelleme.
- Tarayıcı: `pnpm test:browser`; izole test preview 127.0.0.1:45873. Config yeni browser download yapmaz; CI Playwright exact sürümüyle binaries kurar. Mevcut yerel executable env override varsayılan CI kapsamını değiştirmez.
- Dev/preview: `pnpm dev`, `pnpm preview --port 4321`; yalnız loopback.
- `pnpm lint` Astro/typecheck alias'ıdır; bağımsız ESLint denetimi gibi raporlanmaz.
- Observed latest sürümler araştırma notlarında; gerçek exact dependency resolution lockfile'da; Node runtime sonucu QA'da ayrı kaydedilir.
- Kalıcı CI `.github/workflows/pages.yml` build, type/unit/format/link ve Chromium/Firefox/WebKit kapılarıyla docs yayını yapar. Bu workflow branch protection'ın ayrıca kurulmuş olduğu anlamına gelmez.
