# Faz 5 — PMF: iş değerini gerçek kullanımda doğrula

Tarih: 2026-10-06. Durum: araştırma/pilot planı; müşteri, ödeme veya retention sonucu yoktur. Amaç yeni feature sayısını artırmak değil, belirli kullanıcı segmentinin Crmail ile tekrar eden işi daha iyi yapıp bunun için değer/ödeme atfedip atfetmediğini öğrenmek. Tahmin: 6–12 haftalık öğrenme penceresi ve 15–30 mühendis-günü ölçüm/iyileştirme; satış ritmi ve katılımcı erişimi bilinmeden takvim sözü verilemez.

## Önkoşullar

[MVP](03-mvp.md) güvenli pilotu ve seçilmiş [Post-MVP](04-post-mvp.md) iyileştirmeleri vardır; kritik kaynak/recipient/approval/SMTP/permission sorunu açık değildir. Hedef segment net yazılır: örneğin düzenli hizmet teklifi ve birebir kurumsal mail hazırlayan küçük ekip. Bu örnek onaylanmış müşteri segmenti değildir. Kullanımın gerçek iş ritmi, mevcut alternatif ve ücretlendirme hipotezi pilot başlamadan kaydedilir.

Feature ekleme listesi PMF gate değildir. Daily active users uzun satış döngüsünde yanlış hedef olabilir; cohort fırsat/teklif ritmiyle tanımlanır. Marketing campaign/growth automation, henüz gözlenen ihtiyaç yoksa bu faza da zorunlu eklenmez. Mautic'in segment/campaign yetenekleri ayrı iş kapsamıdır. [Mautic campaigns](https://docs.mautic.org/en/7.0/campaigns/creating_campaigns.html).

## Model ve ölçüm kapsamı

| Sınıf / DocType | Ölçüm/alan | State / permission / server validator | Bağımlılık |
|---|---|---|---|
| Native CRM Deal/Communication | İş bağlamı, authorized timeline | Native; salt izinli aggregate; müşteri içeriği analytics'e kopyalanmaz | CRM ve mail |
| Mevcut Draft/Template Revision | saved/published/revision, compiler errors | Owner/site scope; source ve recipient analytics payload değildir | Pre-MVP |
| Mevcut Proposal/Revision/Dispatch | created/reviewed/sealed/submitted/unknown, sanitized failure class | Accepted varsa exact action; Submitted delivered/read değildir | MVP |
| Koşullu mevcut Acceptance/Delivery Event | İş sonucu ve teknik event ayrımı | İzinli, verified event; bot/open kabul sayılmaz | Seçilmiş Post-MVP |
| Yeni | Zorunlu yeni DocType yok | Versioned event taxonomy, aggregate sorgu ve private research kayıtları | Product ölçüm planı |
| Ertelenmiş | Campaign/segmentation/score, Organization Policy, Audit Evidence | Talep/iş sonucu gate'i olmadan model yok | İleriki koşullu scope |

Custom schema otoritesi [backend sözleşmesidir](../architecture/backend-doctypes.md). Native history veya monitoring log'u, kullanıcı memnuniyeti/iş değeri verisi yerine kullanılmaz. Provider Submitted/Delivery event ayrımı [SMTP](https://www.rfc-editor.org/rfc/rfc5321) ve [provider event schema](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html) bağlamına dayanır.

## Uygulama ve öğrenme sırası

1. **Hipotez kartı:** hangi rol, hangi tekrarlı iş, mevcut süreç, beklenen fayda, ölçüm süresi, yanlışlanma ölçütü. “Şablon güzel görünüyor” yerine hazırlanma süresi, yanlış alıcı/price hatası ve revizyonu bulma işi tanımlanır. Sahip: product/UX.
2. **Baseline:** mevcut araçla aynı arındırılmış görevin completion/support/error/time ölçümü; kullanıcılar farklı iş karmaşıklığında karşılaştırılmaz. Mevcut süreç verisi yoksa iyileşme yüzdesi uydurulmaz.
3. **Pilot cohort:** önerilen başlangıç 3–5 bağımsız ekip, aynı segmentte temsilî roller ve en az iki normal iş döngüsü. Bu örnek bilimsel PMF kanıtı veya evrensel eşik değildir. Gerçek kişi verisi public repoya girmez.
4. **Minimum event planı:** create→save→review→request_dispatch→server outcome; event schema sürümü, site/permission, content-free IDs ve retention policy. Draft/source/SMTP credential veya recipient metni telemetry'de taşınmaz. Privacy ve access kontrolü server command'la aynı scope'u korur.
5. **Task görüşmesi:** pilot yardımsız görevi yapar; neden terk ettiğini, hangi alternatifle kıyasladığını ve ürüne geri dönme nedenini öğren. İlave UI alternatifleri gerekiyorsa [UI önerileri](../ux/ui-proposals.md) user evidence ile daraltılır.
6. **Ödeme/değer hipotezi:** ücretli pilot veya açık procurement willingness ve gerçek itirazı kaydet; özendirilmiş ücretsiz kullanım ödeme kanıtı diye sunulmaz. Per-workspace/per-user/per-send ücret seçenekleri maliyetle karşılaştırılır, henüz ürün fiyatı seçilmez.
7. **Az sayıda iteration:** segmentin kritik sorunu çözülür, template çeşitliliği gerçek işe göre eklenir. Eski source/revision/permission gates her iteration'da korunur. Self-reported beğeni teknik safety regression'ı telafi etmez.
8. **Go/pivot/stop review:** retention, tekrar iş, destek maliyeti, hata ve ödeme birlikte değerlendirilir. Enterprise tek müşteriye özel iş ile segment product fit birbirine karıştırılmaz.

## Ölçümler ve önerilen exit gate

| Ölçüm | Açık tanım | Yanlış yorumdan korunma |
|---|---|---|
| Activation | Pilotun yardımsız ilk doğru revizyon/recipient ile işi tamamlaması | Sadece account açma/editor açma yeterli değil |
| Tekrar kullanım | Beklenen iş döngüsünde ikinci/sonraki işi aynı ürünle tamamlama | Takvime değil segmentin satış ritmine normalize |
| İş kalitesi | Yanlış alıcı/price/revizyon ve source kaybı; support ihtiyacı | Teknik SMTP kabulü ticari başarı sayılmaz |
| Zaman faydası | Aynı karmaşıklıkta baseline task'a göre süre/support farkı | Görüşmeci yardımı ve öğrenme eğrisi ayrı |
| Değer/ödeme | Gerçek ücretli pilot veya belgelenmiş satın alma davranışı | “Öderdim” tek başına satış sayılmaz |
| Unit economics | Provider + storage + worker + support/reconciliation maliyeti | Ham SMTP fiyatı bütün maliyet değildir |

Eşik önerisi: cohort'ta en az üç bağımsız ekibin iki normal iş döngüsünde tekrarlı kullanımı, açık müşteri referansı ve ödeme/değer davranışı; baseline'a göre ölçülmüş belirgin iş faydası; P0 safety incident yok; destek maliyeti fiyat hipotezini bozmuyor. Sayılar onaylanacak plan başlangıcıdır; PMF'in resmî/evrensel formülü değildir. Kısmi veya zıt sonuçlar belgede korunur, rapor tek başarı puanına indirgenmez.

Open-rate ana PMF metriği değildir. Mail privacy veya image preload kişinin e-postayı açtığına ilişkin çıkarımı bozabilir. [Apple Mail Privacy Protection](https://support.apple.com/en-ca/guide/iphone/iphf084865c7/ios). Tracking optionaldır; kullanıcı policy'si ve güvenilirlik sınırı olmadan açık oranından sales score veya acceptance üretilmez.

## Rollback ve sahiplik

Ürün hipotezi başarısızsa canlı feature genişlemesi durur; pilot müşterinin veri/source/revision export'u ve güvenli mevcut hizmeti planlanır. Yeni analytics collection kapatılıp retention policy uygulanır. Ödeme/segment kanıtı yokken tenant marketplace, Mautic veya pahalı enterprise suite'a kaçılmaz. Pivot yeni hipotez ve migration/privacy değerlendirmesi ister.

Product/UX cohort ve karar sahibi; backend data/event permission; frontend task/feedback recovery; QA safety regresyon; Hüseyin Cengiz cost/operational baseline teknik sahibidir. Growth yetkinlikleri ölçüm, onboarding veya müşteri kazanımı için ihtiyaca göre eklenebilir; bütün sekiz fazda zorunlu feature ailesi değildir. [Scale](06-scale.md) ancak gerçek hacim/maliyet/operasyon ihtiyacı ve iş değeri kanıtıyla açılır.
