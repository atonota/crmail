# Crmail ortak ajan sözleşmesi

[AGENTS.md](AGENTS.md) dosyasındaki çalışma sözleşmesini oku ve uygula. Aşağıdaki UI kabul kriterleri tüm proje ekranları için geçerlidir.

### Tıklama, dokunma ve klavye odağı kabul kriterleri

**Fareyle tıklama veya dokunma sonucunda tablo, kart, bölüm ve üst kapsayıcıların tamamında odak çerçevesi oluşmamalıdır. Klavye ile gezinirken görünür odak korunmalı; yalnızca odaklanan etkileşimli öğede, tek bir odak göstergesi bulunmalıdır.**

Kaydırılabilir tablo klavyeyle odaklanmayı gerektiriyorsa, yalnızca klavye odağında gösterge çıkmalıdır.

#### Teknik koşullar

- `:focus` yerine uygun şekilde `:focus-visible` kullanılmalı; kapsayıcılara `:focus-within` çerçevesi verilmemeli.
- Gereksiz `tabindex="0"` kaldırılmalı. Klavyeyle kaydırma için gerekli odaklanabilirlik korunmalı.
- Global `outline: none` ile klavye odağı gizlenmemeli.
- Chromium, Firefox ve Safari'de tıklama, dokunma ve Tab/Shift+Tab senaryoları doğrulanmalı.
- Çerçeve kaynağı hesaplanmış stillerden (computed styles) teşhis edilmeli; `border`, `outline` ve `box-shadow` birleşimiyle çift veya üçlü odak çerçevesi üretilmemeli.
- Gerçek Safari doğrulaması ile WebKit emülasyonu ayrı raporlanmalı; çalıştırılmayan kontrol başarılı sayılmamalı.

### Akışkan tablolar ve sütun genişliği kabul kriterleri

**Tablo sütunları, içerik türüne göre okunabilir minimum genişliklerini korumalıdır. Başlıklar ve model adları kelime ortasından bölünmemeli; metin yalnızca kelimeler arasından doğal biçimde sarılmalıdır. Açıklama sütunları kalan alanı esnek paylaşmalıdır.**

**Ekran daraldığında sütunları sıkıştırmak veya yazıyı küçültmek yerine, tablo kendi kapsayıcısı içinde yatay kaydırılmalıdır. Sayfanın tamamında yatay taşma oluşmamalıdır.**

#### Doğrulama koşulları

- `DocType`, `Template`, `Proposal` gibi kelimeler parçalanmamalı.
- Uzun model adları ve gerçek içerikle test edilmeli; yalnızca kısa örneklerle doğrulanmamalı.
- 320, 360, 375, 390 px, tablet ve masaüstünde okunabilirlik korunmalı.
- Chromium, Firefox ve Safari'de dokunma, fare ve klavyeyle kaydırma çalışmalı.
- İlk sütunda zorlayıcı `word-break: break-all` veya `overflow-wrap: anywhere` kullanılmamalı.

### Minimum metin boyutu kabul kriterleri

- Web arayüzündeki tüm okunabilir metinlerin minimum boyutu **1rem ve üzeri** olmalıdır. Gövde, tablo, başlık, etiket, yardımcı metin, metadata, rozet, tooltip, kod, form kontrolü ve hata mesajları bu kurala dahildir.
- Kök yazı boyutu tarayıcı/kullanıcı tercihini korumalıdır; `html` boyutunu küçülterek 1rem kuralı dolaylı biçimde aşılmamalıdır. Tipografi merkezi semantik tokenlarla yönetilmelidir.
- `clamp()` minimumları ve kütüphane tipografi ayarları 1rem altına inmemelidir. Alt öğelerdeki `em`, yüzde veya sabit piksel değerleri hesaplanmış metin boyutunu 1rem altına düşürmemelidir.
- Dar ekrana sığdırmak için metin küçültülmemelidir; akışkan yerleşim, doğal satır sarımı ve gerektiğinde tablo içinde kaydırma kullanılmalıdır.
- 320, 360, 375, 390 px, tablet ve masaüstünde; açılan panel, form ve hata durumları dahil hesaplanmış yazı boyutları doğrulanmalıdır. Kullanıcının kök yazı boyutunu büyütmesi ve zoom okunabilirliği veya işlevi bozmamalıdır.

### Okuma genişliği ile veri alanını ayırma

- Paragraf satır uzunluğu sınırı üst içerik kapsayıcısını, tabloları, kod bloklarını veya veri görselleştirmelerini daraltmamalıdır. Okuma genişliği yalnız metin bloklarına uygulanmalıdır.
- Tablo, navigasyon ve belge içi rehber ayrıldıktan sonra kalan içerik sütununun tamamını kullanmalıdır. Sağda kullanılabilir içerik alanı varken gereksiz yatay kaydırma oluşturulmamalıdır.
- Yatay kaydırma, tablonun okunabilir minimum genişliği gerçek kullanılabilir alana sığmadığında kullanılmalıdır; metin küçültülmemeli veya sözcükler parçalanmamalıdır.
- Regresyon kontrolü yalnız sayfa taşmasını değil, tablo kapsayıcısının ayrılan grid/flex alanını kullanmasını da ölçmelidir. Gerçek geniş tabloyla 320 px, ilgili breakpoint N−1/N/N+1 ve 1440/1920/2136 px örnekleri doğrulanmalıdır.
