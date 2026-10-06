# Crmail

Frappe CRM üzerinde headless teklif ve kurumsal e-posta deneyimi için araştırma, fizibilite, mimari, UX ve faz bazlı geliştirme planı.

- [Dokümantasyon sitesi](https://atonota.github.io/crmail/)
- [Araştırma belgeleri](docs/research/)
- [Mimari](docs/architecture/)
- [Sekiz geliştirme fazı](docs/phases/)
- [UX önerileri](docs/ux/)
- [Claude bağımsız araştırma durumu](docs/claude/status.md)

Bu repo mevcut aşamada dokümantasyon ve dokümantasyon sitesi içerir. Canlı Frappe ürünü, e-posta gönderim servisi veya çalıştırılmış ürün PoC'si değildir. GitHub Pages yalnız public belgeleri sunar; müşteri verisi ve SMTP secretları barındırmaz.

## Lisans durumu

Kullanıcının son talimatıyla lisans kararı şimdilik bekletilir. LICENSE henüz yayımlanmaz. Repo public görünürdür; bu tek başına açık kaynak kullanım lisansı değildir. Bağımlılıkların ve marka varlıklarının mevcut hakları ve lisansları korunur.

## Geliştirme

Node 24.x ve pnpm 11.19.0 kullanılır. Exact bağımlılıklar `pnpm-lock.yaml` içinde kayıtlıdır.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm format:check
pnpm build
pnpm check:links
pnpm exec playwright install --with-deps chromium firefox webkit
pnpm test:browser
```

Geliştirme: `pnpm dev`. Üretim önizlemesi: `pnpm preview --port 4321`. Tarayıcı testleri ayrı 127.0.0.1:45873 üretim sunucusunu kullanır. Yerel mevcut browser binaries için `CRMAIL_CHROMIUM_EXECUTABLE`, `CRMAIL_FIREFOX_EXECUTABLE`, `CRMAIL_WEBKIT_EXECUTABLE` desteklenir; CI aynı Playwright sürümüyle browser kurar.

GitHub Actions, main üzerindeki commit için kontrol ve build sonrasında Pages deploy eder. Browser emülasyonu gerçek telefon veya Safari cihaz testi yerine geçmez. Doğrulama sonuçları [QA belgelerinde](docs/qa/) ayrı kaydedilir. Proje kararları için [AGENTS.md](AGENTS.md) geçerlidir.
