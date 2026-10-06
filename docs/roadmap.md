# Crmail geliştirme yol haritası

Durum: 6 Ekim 2026 tarihli araştırma ve uygulama planı. Ürün runtime’ı henüz geliştirilmedi; aşağıdaki gates `not_run`. Fazlar birbirinin küçültülmüş feature listesi değildir: teknik kanıt → güvenli minimum iş → iş değeri → büyüme → sürdürülebilirlik.

## Fizibilite keypoint’leri

| Bulgu | Karar etkisi |
|---|---|
| Framework 16.50/CRM 1.86 manifest uyumu | Sabit tag/imaj/runtime/lock clean-install PoC; develop’a plansız geçiş yok |
| CRM-only native Quotation yok | Basit hizmet Proposal custom; mali kapsam gerekiyorsa ERPNext otoritesi |
| Native CRM Vue, Mantine React | Headless workspace + API; native route/iframe adaptörü ayrı |
| Plugin 1.0.8 v4 compiler, latest MJML5 | Eş browser/server 4.18 adayını test et; v5 ayrı migration |
| Native EmailBody wrapper/CSS/Jinja | Approved browser preview yeterli değil; final MIME proof |
| SMTP accepted + DB update atomik değil | UI intent idempotency + outbox; UnknownSubmission/native-retry blocker |
| Private File ve recipient yetkisi | UI saklaması değil server ACL; draft/revision/hash/send binding |
| Proton Submission outbound-only | İlk provider seçimi; inbound Bridge post-MVP bağımsız deney |
| Claude içerik üretmedi | Bağımsız karşılaştırma henüz kapanmadı; gerçek limit kaydı |
| Proje lisansı bekliyor | Lisans seçimi yapılmaz; upstream yükümlülükleri korunur |

Kaynak ve açıklamalar: [Frappe](research/frappe-framework.md), [frontend](research/frontend-stack.md), [mail](architecture/mail-delivery.md), [gap](research/gap-analysis.md), [Claude](claude/status.md), [fizibilite](research/feasibility.md).

## Faz haritası

| Faz | İş hedefi | Yeni custom model odağı | Geçiş kanıtı | Ayrı sayfa |
|---|---|---|---|---|
| PoC | Riskli sınırları kanıtla | Brand Profile, Email Template, Email Draft, Dispatch minimum şema | Clean install; editor parity; izin; fake SMTP fault injection | [01 PoC](phases/01-poc.md) |
| Pre-MVP | Pilot iç sözleşmesini kur | Template Revision ve mevcut modellerin revision/schema alanları | Immutable publish, concurrent save, private assets,320px kritik journey | [02 Pre-MVP](phases/02-pre-mvp.md) |
| MVP | Bir müşteriye güvenli teklif/e-posta gönder | Proposal, Proposal Item, Proposal Revision; Approval koşullu | Alıcı/onay/payload ilişkisi, gerçek yetkili provider pilotu, restore | [03 MVP](phases/03-mvp.md) |
| Post-MVP | Pilotun istediği genişletmeler | Acceptance, Delivery Event, Connector Policy koşullu | Replay/webhook/inbound/privacy policy; ayrı negatif testler | [04 Post-MVP](phases/04-post-mvp.md) |
| PMF | Tekrar kullanım ve ödeme değerini göster | Yeni DocType zorunlu değil | Kullanım cohort’u, hazırlama zamanı/kalitesi, müşterinin satın alma kararı | [05 PMF](phases/05-pmf.md) |
| Scale | Doğrulanmış yükü ekonomik yönet | Organization Policy yalnız çoklu organizasyon ihtiyacında | Queue fairness, quota, cost/load/tenant ve migration ölçümleri | [06 Scale](phases/06-scale.md) |
| Enterprise | Sözleşmeli işletim/politika ihtiyacını karşıla | Audit Evidence ve policy genişlemeleri koşullu | Delegated approval, SSO, retention, restore ve dış inceleme | [07 Enterprise](phases/07-enterprise.md) |
| Maturity | Uzun ömür ve kontrollü değişimi sağla | Yeni model zorunlu değil; archive/export ihtiyaçla | Deprecation/migration/export ve incident öğrenimi | [08 Maturity](phases/08-maturity.md) |

Bütün custom model adları `Crmail` prefix’i taşır. Native CRM Lead/Deal/Organization, Contact/File/Communication/Email Account/Email Queue/Version yeniden geliştirilmez. Bir fazdaki koşullu model ihtiyaç yoksa eklenmez. Ayrıntılı alan/izin/dependency sözleşmesi [backend DocTypes](architecture/backend-doctypes.md) belgesindedir.

## İlk PoC’nin uygulama sırası

1. Platform ve ürün sınırını kaydet: headless journey tanımı, tek organization/site, mali Proposal/ERPNext kapsamı.
2. Kararlı backend/frontend adaylarını sabitle: tag, imaj digest, lockfile ve gerçek runtime sürümlerini kanıt kaydına yaz.
3. Same-origin/BFF oturumunu iki kullanıcıyla sınayarak CRM ve private File negatif izin testini çalıştır.
4. GrapesJS project JSON/MJML source corpus’u üret; iki CTA/iki image/Türkçe metin browser/server compiler parity.
5. Server HTML → native EmailBody → final MIME adaptörünü fake SMTP sink ile çalıştır; varsayılan wrapper/CSS/interpolation değişimlerini incele.
6. Dispatch/outbox/idempotency ve native Queue linkini çift click/iki worker/commit-enqueue crash ile doğrula.
7. SMTP250 cevabı kaybı ve worker kill ile UnknownSubmission/native auto-retry politikasını gerçek source üzerinden kapat.
8.320px text/button/image edit/reorder/save/preview yolculuğunu klavye/dokunma ve save conflict/session expiry ile dene.
9. Kanıt ve ADR’leri karşılaştır: geçmeyen gate için adapter/scope seçenekleri ve maliyeti yaz; MVP taahhüdünü buna göre ver.

Bu sıra önerilen mühendislik yoludur; bu teslimde komutlar çalıştırılmış veya testler geçmiş sayılmaz. Canlı SMTP gönderim araştırmanın parçası değildir.

## Kaynak, süre ve maliyet varsayımı

Önerilen başlangıç effort: PoC5–10, Pre-MVP20–35, MVP30–50 mühendis-günü; toplam55–95. Post-MVP için seçilen iki workstream20–40 mühendis-günü tahmin edilir. Bunlar araştırma planı varsayımlarıdır; gerçek sprint velocity, platform/provider kurulumu, UX seçimi, review/QA ve finansal kapsamla yeniden tahmin gerekir.

İlk planlama varsayımı: Frappe/backend geliştiricisi, Astro/React/editor geliştiricisi ve uygulayıcıdan bağımsız QA; ihtiyaçla Hüseyin Cengiz altyapı devri. Ekip tahsis edilmedi. Faz effort aralıkları varsa ayrı sayfadaki tahmin varsayımı olarak okunur; takvim, ücret veya SLA sözü değildir. Maliyet hesabı provider/account kotası, MIME/storage/backup, compile CPU, client QA ve reconciliation desteğini içerir. Unknown kapılar bitmeden tüm ürün için sabit tarih çıkarılmaz.

GoDaddy DNS işlemlerini Asistan Hüseyin uygular; Hüseyin Cengiz teknik kayıt ihtiyacını hazırlar ve servis sonucunu doğrular. Otomatik mesaj/görev gönderimi ve mevcut server değişikliği bu planla yetkilendirilmez.

## Faz kabul kaydı

Her gate: requirement, exactbuild/version, ortam/browser/OS/viewport/input/network, sentetik fixture, komut, beklenen/gözlenen, screenshot/MIME/HAR/trace ve `pass/fail/not_run/not_applicable`. Site build/QA’sı ürün SMTP ve backend kanıtı değildir. Gerçek Proton/Outlook ve cihaz testi çalışmadıysa açıkça not_run kaydedilir.

Public GitHub Pages bu plan ve araştırmaları sunar; production Frappe/BFF/SMTP worker ayrı deployment kararıdır. Ürün UI estetiği [öneri sayfasında](ux/ui-proposals.md) kalır; dokümantasyon tasarımı ürün tasarımı onayı sayılmaz. Claude bağımsız çalışma erişimi geri geldiğinde [uzlaştırma](research/reconciliation.md) kapısı tamamlanır.
