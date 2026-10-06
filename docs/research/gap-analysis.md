# Crmail gap analizi

Tarih: 6 Ekim 2026. Kapsam: Frappe Framework + CRM veri/iş altyapısı; Astro + Mantine özel son kullanıcı deneyimi; GrapesJS/MJML görsel editör; SMTP ile birebir kurumsal iletişim ve teklif. Bu belge uygulama kodu teslim edildiğini söylemez. Kaynak doğrulaması ile ortam doğrulaması ayrıdır.

## Mevcut yetenek ve eksik iş

| Kullanıcı gereksinimi | Native temel | Eksik | Faz / kabul kanıtı |
|---|---|---|---|
| CRM müşterisi/fırsatı seç | CRM Lead, Deal, Organization ve Contact bağlantıları | Headless arama, sahiplik filtreleri, alıcı doğrulama | PoC: yetkili kayıt görünür, yetkisiz kayıt hiçbir response'da yok |
| Kurumsal şablon hazırla | Frappe Email Template, CRM rich text/HTML seçimi | GrapesJS proje JSON'u, MJML, marka blokları ve sürümleme | Pre-MVP: kaydet/yükle round-trip; immutable published revision |
| Metin, çoklu buton/görsel | GrapesJS/MJML editör | Frappe File yükleme, alt text, URL politikası, içerik temizleme | Pre-MVP: en az iki CTA ve iki görsel server compile |
| Görünümü kopyala | Browser Clipboard API, native CRM'den bağımsız | HTML/plain üretimi, CID'nin clipboard'da kullanılamaması, fallback | MVP: gönderim kopyalamaya bağımlı değil; fallback açık |
| Gönder | Frappe Email Account, Communication, Email Queue | İşlem onayı, sender yetkisi, revizyon snapshot'ı, duplicate koruması | PoC→MVP: fake SMTP ve failure injection |
| Teklif üret | ERPNext Quotation entegrasyonu mevcut | CRM-only kapsamda Proposal modeli; özel headless ekran | MVP: doğru kalem/toplam, sürüm ve gönderilmiş snapshot |
| Sunum/teklif bağlantısı | HTML anchor / File | Gizli dosya URL'si, link yaşam süresi, süresi dolan teklif | MVP: public kaynak/özel teklif ayrımı |
| Teklif cevabı/kabul | CRM activity/timeline | Acceptance kanıtı ve yetkili kabul; scanner güvenliği | Post-MVP: GET hiçbir kabul/onay yapmıyor |
| Agent hazırlasın | Frappe API; deneysel upstream MCP | Token scope, action policy, onay, prompt injection sınırı | MVP taslakla sınırlı; post-MVP devredilmiş onaylı işlemler |
| Suite içine göm | CRM Vue/Frappe UI, Framework Desk | Astro route ile API entegrasyonu; native ekran embedding adaptörü | PoC: mimari yorum kesin; iki frontend ortak state otoritesi yok |
| Yüksek performans | Redis ve background jobs | Editor koşullu yükleme, derleme queue, ölçülmüş API/bundle bütçesi | PoC: editor açılmadan editor kaynakları indirilmez |

Native yetenek kanıtları: [CRM şablon](https://docs.frappe.io/crm/email-template), [CRM ERPNext](https://docs.frappe.io/crm/erpnext), [API](https://docs.frappe.io/framework/user/en/api/rest), [Email Queue kaynak](https://github.com/frappe/frappe/blob/v16.50.0/frappe/email/doctype/email_queue/email_queue.py), [GrapesJS/MJML](https://github.com/GrapesJS/mjml), [CRM frontend](https://github.com/frappe/crm/blob/v1.86.0/frontend/package.json).

## Kapsam farkı: “gömmek” iki anlama geliyor

**Önerilen birincil çözüm:** Astro/Mantine'den CRM Deal bağlamında editör açılır, custom app API'si native CRM verisine bağlanır. İş verisi Frappe'de, editör geçici durumları frontend'de; yayımlanmış HTML istemciden güvenilir kabul edilmez.

**İkincil ve opsiyonel çözüm:** native CRM Vue ekranında “Crmail ile hazırla” aksiyonu özel Astro sayfasına gider; gerçekten inline embed istenirse React editörünün izole mount/iframe adaptörü ayrıca test edilir. CRM frontend'ini fork edip bütün stylesheet'leri Mantine ile ezmek önerilmez. Frappe Desk page ve native CRM form script aynı extension point değildir. Kaynak: [CRM özel aksiyonları](https://docs.frappe.io/crm/custom-actions), [CRM frontend source](https://github.com/frappe/crm/tree/v1.86.0/frontend), [Frappe Desk Page API](https://docs.frappe.io/framework/user/en/api/page).

Kaynak çelişkisi: Custom Actions belgesindeki `crm.api.quotation.create_from_deal` örneği bir API örneğidir; araştırılan v1.86.0 kaynak ağacında bu Quotation API/DocType görülmedi. Doküman örneği gerçek kararlı release özelliği kabul edilmez.

Bu ayrım PoC'de bir ADR ile kapanmalıdır. Özel Astro son kullanıcı kabuğu, native CRM görüntüsünün yeniden geliştirilmesi kadar geniş olmayacak: ilk akış müşteri seç → taslak/teklif → önizle → gönder → durum.

## Gerçek bilinmezleri ele alma

“Unknown unknown” önceden isim verilmiş risk listesi değildir. Aşağıdaki maddeler **bilinen belirsizlikler** ve gerçek bilinmezleri açığa çıkaracak deneylerdir. Hiçbir araştırma “bütün bilinmezler bitti” diyemez. Ama yayın/gönderim kararını durduran kritik boşluklar tanımlanabilir.

| Kod | Açık soru | Neden olmazsa olmaz? | Kapatma deneyi | Geçiş kararı |
|---|---|---|---|---|
| K1 | Framework16/CRM1 kombinasyonu gerçek imaj ve DB ile kuruluyor mu? | Manifest uyumu runtime başarısı değildir | Temiz site + migrate + CRM fixture + smoke | PoC bitmeden sürüm onayı yok |
| K2 | %100 headless tanımı yalnız ürün akışı mı, yönetim de dahil mi? | Yönetim ekranlarını yeniden yapmak maliyeti değiştirir | Kullanıcı/yönetici journey matrisi | Varsayılan ürün headless, yönetim Desk |
| K3 | mailcow mu Proton SMTP mi ilk provider? Hesap/alan adı uygun mu? | Bağlantı ve sender politikası değişir | Fake provider ardından yetkili staging hesap | Gerçek credential yokken dış gönderim yok |
| K4 | SMTP DATA kabulü sonrası crash/retry nasıl görünür? | Aynı teklif tekrar iletilebilir | Network proxy ile 250 cevabı kaybı, worker kill | “Belirsiz” durum ve manuel inceleme şart |
| K5 | Editor JSON→MJML→HTML→MIME dönüşümü görsel/CTA'yı koruyor mu? | Şablon editörü var ama iletilen sonuç farklı olabilir | Immutable örnek corpus, received MIME incelemesi | Kaynak/çıktı hash ve client proof |
| K6 | Asset özel mi marka-public mi; alıcı login olacak mı? | Private URL dış alıcıda yüklenmez veya izin gevşetilirse sızar | İkinci kullanıcı + dış alıcı + CID + expired URL | Dosya paylaşım politikası olmadan gönderim yok |
| K7 | Teklif ticari/mali/hukuki belge mi, ajans sunumu mu? | Vergi/kur/tasdik ve ERPNext kararı değişir | İki temsilî teklif üzerinden field mapping | Basit Proposal veya ERPNext seçimi |
| K8 | Bir alıcıdan çok alıcıya geçişte CC/BCC ve revizyon bağlamı ne? | Birebir kişiselleştirme ile CC kopyaları karışabilir | Ayrı recipient/message fixture | MVP düşük hacim, explicit alıcı görünümü |
| K9 | Approval/gönderim yetkisi kullanıcı ve agent arasında korunuyor mu? | MCP'ye bağlamak izinleri otomatik sağlamaz | Aynı iş komutuna UI/API/MCP negatif test | Server policy tüm girişlerde aynı |
| K10 | Restore SMTP secret, private files ve outbox tutarlılığını geri getiriyor mu? | DB yedeği tek başına çalışır gönderim sistemi değildir | İzole restore; gönderim muted; karşılaştırma | MVP restore tatbikatı olmadan prod yok |

Dayanaklar: [SMTP yeniden deneme standardı](https://www.rfc-editor.org/rfc/rfc5321), [Frappe File izin davranışı](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/file/file.py), [Proton SMTP](https://proton.me/support/smtp-submission), [backup encryption](https://docs.frappe.io/framework/user/en/guides/basics/how-to-enable-backup-encryption), [MCP deneysel sınırlamalar](https://github.com/frappe/mcp/blob/main/README.md).

## Gerçek unknown unknown keşif yöntemleri

- **Akış gözlemi:** iki kullanıcıya gerçek işten arındırılmış görev ver; hata düğmesini göstermek yerine kendiliğinden ortaya çıkan darboğazları kaydet. Keşfedilen davranışı yeni issue ve gereksinime dönüştür.
- **Dönüşüm fuzz/round-trip:** nested MJML, uzun Türkçe metin, emoji içeren upstream içerik, bozuk URL, çok büyük resim ve hatalı blok. Beklenmeyen parser davranışı yakalanır; kaynağı silmeden hata gösterilir. Üründe kullanıcı tercihi gereği yeni emoji üretimi yok.
- **Fault injection:** commit sonrası enqueue kaybı, Redis kesintisi, worker kill, SMTP250 cevabı kaybı, append-to-Sent hatası. Beklenmedik ikili yan etkiler görünür olur.
- **Yetki matrisi saldırısı:** aynı kayıt ID'si farklı kullanıcı/site/domain context ile; File ve preview cache key dahil. Sadece görünür listeyi saklamak test değildir.
- **Sürüm yükseltme rehearsal:** bir patch yükseltmesi ve eski draft schema fixture'ları. Upgrade sonrası preview/gönderi semantiği kontrol edilir.
- **Operasyon tatbikatı:** sağlayıcı outage ve revoke edilmiş token; UI tekrar tekrar gönder demeden durumu açık göstermeli.

Bunlar bilimsel olarak bütün bilinmeyenleri tüketmez; keşif maliyetini ürün değerine göre sınırlayan plan önerileridir. Her keşif sahibi, deney, son tarih ve karar kapısına bağlanır.

## Faz dışında bırakılanlar

İlk MVP: toplu pazarlama kampanyası, davranışsal drip, teslimat garantisi, otomatik açık oranından satış kararı, fatura/muhasebe, e-imza hukuki iddiası, tenant marketplace, bütün CRM ekranlarının kopyası yok. İhtiyaç doğrulanırsa post-MVP sonrası ele alınır. SMTP'nin accepted olması alıcı inbox'a teslim veya okundu anlamına gelmez. Kaynak: [SMTP sorumluluk devri](https://www.rfc-editor.org/rfc/rfc5321).

## Fizibilite hükmü

**Koşullu uygulanabilir.** Native veri ve SMTP altyapısı yeniden yazılmaz; custom app az sayıda iş dokümanı ve kontrollü API ekler. En büyük geliştirme yükü sürükle-bırak kutusu değil: revizyon doğruluğu, MIME dönüşümü, izin, SMTP belirsizliği ve headless lifecycle yönetimidir. K1–K10 deneyleri tamamlanmadan “tam araştırıldı, geliştirme riski sıfır” denemez.
