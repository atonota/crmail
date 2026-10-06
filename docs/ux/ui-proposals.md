# Ürün UI önerileri: seçim ve kanıt kapıları

Tarih: 2026-10-06. Bunlar estetik ve interaction alternatifleridir; onaylanmış ürün tasarımı veya uygulanmış Crmail UI'sı değildir. Dokümantasyon sitesinin semi-flat 2.0 yaklaşımı ayrı bir sunum tercihidir; formal standard, compliance badge veya bütün ürünlere taşınacak hazır tema değildir.

## Üç alternatif

| Alternatif | Başlangıç deneyimi | Yararı | Somut riski | Seçim deneyi |
|---|---|---|---|---|
| İşlem odaklı | Son draft/teklif, müşteri arama, belirgin hazırlama akışı | Birebir satış işinde hızlı dönüş ve state açıklığı | Template tasarımı ikinci planda kalabilir | Teklif hazırlama + yanlış alıcıdan dönme task'ı |
| Editör odaklı | Marka blokları, canvas, inspector, revision preview | Marka/design sorumlusunun üretimini destekler | İlk route ağır olabilir; telefonda karmaşa | İlk dokunma ve server-save turu; editor kaynak transferi |
| İletişim akışı | Deal timeline + taslak + gönderim/yanıt ayrımı | CRM bağlamı kaybolmaz | Bütün CRM'yi yeniden yazma scope'una büyüyebilir | Native CRM action'dan Crmail'e geçiş; scope sınırı |

Önerilen PoC başlangıcı işlem odaklı kabuk içinde isteğe bağlı editör route'udur. Bu tercih kesin tasarım kararı değil, ilk iş değerini test etme hipotezidir. GrapesJS canvas korunur; Mantine iş kontrolleri/inspector kabuğunu sağlar. Native CRM Vue bileşenleri React/Mantine bileşen ağacına doğrudan aktarılmaz. [CRM frontend v1.86.0](https://github.com/frappe/crm/tree/v1.86.0/frontend), [GrapesJS storage/model](https://grapesjs.com/docs/modules/Storage.html).

## Marka ve semantik token önerisi

AtonotA'nın lacivert, mavi ve serin gri ailesi başlangıç marka kaynağıdır. Renkler yalnız logo kopyalama değildir: eylem, seçili durum, focus, read-only, warning, failure ve success için semantik tokenlar gerekir. Mantine varsayılan görünümü karar sayılmaz. Kesin hex/typography/radius ancak marka asset'leri ve contrast kanıtıyla seçilir; bu belgede yeni ürün palette'i onaylanmaz.

| Token grubu | İşlev | Tasarım ilkesi |
|---|---|---|
| surface/page/surface-raised | Okuma ve editör/inspector ayrımı | Boşluk ve hizalama önce; her şey kart içinde değil |
| text/primary/secondary/muted | Body, yardım, metadata | Kritik state düşük kontrastlı griye itilmez |
| action/primary/hover/active/disabled | Save, review, publish, send | “Disabled” nedenini kullanıcı görebilir |
| focus/visible | Keyboard odak | Tek kontrol üzerinde tek gösterge; adjacent yüzeyle ≥3:1 |
| state/success/warning/error/info | İşlem sonucu | Renk tek sinyal olmaz; state ve eylem metni vardır |
| space/gutter/content/gap | 320 reflow | İç içe padding toplamı gözetilir; text/hit area küçültülmez |
| target/effective/coarse | Kontrol erişimi | Görünür artwork ile dokunma alanı ayrıdır |
| typography/body/heading/meta | İçerik hiyerarşisi | E-posta/teklif metni ve operational metadata karışmaz |

Focus ve target doğrulaması ile gerçek kullanıcı görevi birlikte değerlendirilmelidir. [W3C focus contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Editör adaptasyonu

Telefon: iş metni/blok listesi, form tabanlı inspector ve ayrı preview geçişi. Tablet split-screen: canvas okunabilirlik sınırını korur; inspector gerektiğinde panel olur. Desktop: canvas + inspector; daha büyük ekran bütün kontrol ve boşlukları büyütme gerekçesi değildir. Bu düzenler tek proje verisi ve shared iş kurallarını kullanır; gizli ikinci editör/render modeli yaratılmaz.

Pointer/hover/keyboard bağımsızdır. Dar pencere fare kullanabilir, geniş tablet dokunma kullanabilir. Drag/drop'a alternatif sıra değiştirme komutları, undo, block selection, Escape ve focus return gereklidir. Konu/metin/recipient alanları yön değişiminde kalır. Platform adı veya tek isMobile flag davranış otoritesi olmaz. [W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Pointer Events](https://www.w3.org/TR/pointerevents3/).

## Performansın UX'e etkisi

Template listeleme ekranı editor/MJML ve bütün block asset'lerini indirmemelidir. Editor route'unda ihtiyaç doğduğunda import; route değişiminde kaynak/undo verisini server-confirmed draft'a bağla. Preview compiled çıktı olabilir, source editor değildir. İlk cevap semantik ve güvenilir olmalı; advanced editor yüklenmezse kullanıcı taslağını ve metnini kaybetmemelidir. Request initiation kanıtı, response cache baytından farklıdır. [Astro islands](https://docs.astro.build/en/concepts/islands/), [GrapesJS project data](https://grapesjs.com/docs/modules/Storage.html#project-data).

Kesin bundle/API budget'ları [frontend araştırmasındaki](../architecture/frontend.md) sürüm ve gerçek production build ölçümleriyle uzlaştırılır. Başka projenin 50KB örneği Crmail'in otomatik SLA'sı değildir. Birinci profile seçimi kaynak yükleme ve iş akışı ayrımına dayanır, her viewport/input kombinasyonu için yeni bundle üretmeye dayanmaz.

## Estetik seçimin kabul kapısı

1. Aynı müşteri/teklif task'ını üç low-fidelity seçenekte göster; kullanıcıdan yalnız “beğendiğin hangisi” cevabı değil riskli bilgiyi nasıl bulduğunu gözle.
2. 320px'de alıcı, sender, price, revision ve send status kaybolmamalı. 360/375/390, yatay, tablet ve desktop karşılıkları gösterilir.
3. Bir candidate token seti ve önce/sonra/difference hazırlanır. Uygulayıcı kendi baseline'ını tek başına topluca onaylamaz; mevcut explicit kullanıcı seçimi tekrar sorulmaz.
4. Chromium/Firefox/WebKit emülasyonu; gerçek macOS Safari/iOS/Android, keyboard/touch, screen-reader ve mail-client katmanları ayrı raporlanır. Yapılmayan check pass değildir.
5. Seçilen estetik iş ölçütünü bozmuyorsa uygulanır. Sonraki style değişimi revenue/PMF kanıtının yerine geçmez.

Bu belgede ekran/test/baseline teslimi yoktur. Dokümantasyon site QA'sı Crmail ürün UI QA'sına eşit değildir. [Kritik journeys](journeys.md), [Pre-MVP](../phases/02-pre-mvp.md) ve [PMF](../phases/05-pmf.md) ürün kabulünü yönetir.
