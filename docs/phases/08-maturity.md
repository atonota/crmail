# Faz 8 — Maturity: sürdürülebilir lifecycle ve ürün sınırı

Tarih: 2026-10-06. Durum: süreklilik planı; olgunluk sertifikası veya bitiş tarihi yoktur. Amaç kaynak/revizyon/veri/connector/API lifecycle'ı, operasyon ve ürün ekonomisini uzun dönem yönetmek. Tahmin: üç aylık review döngüsünde 10–20 mühendis-günü bakım kapasitesi önerisi; gerçek incident/upgrade/customer yüküyle uyarlanır. Yeni feature bitirmek bu fazın özü değildir.

## Önkoşullar

Gerçek kullanım, supported-version/client matrisi, security/incident review, retention/export policy, maliyet ve müşteri değer kaydı vardır. [Enterprise](07-enterprise.md) bütün müşteriler için zorunlu değildir; maturity enterprise müşterisi olmadan da gerekli olabilir. “Her şey desteklenir” iddiası yerine desteklenen kapsam ve deprecation sözleşmesi yazılır.

## Veri modeli/lifecycle

| Sınıf / DocType | Fields / state | Permission / server validator | Bağımlılık |
|---|---|---|---|
| Native Version/Activity/Error logs | Native operational/history | Scoped access ve retention; içerik/sır public log'a aktarılmaz | Platform sürümü |
| Mevcut Template Revision/Proposal Revision | schema/compiler/checksum/current/retired pointers | Published/issued source değişmez; migration yeni representation üretirse provenance | Historic renderer/export |
| Mevcut Dispatch/Delivery Event | accepted/unknown facts, provider refs, reconcile/evidence | Eski kuyruğu restore sırasında yanlış resend yok | Provider/native queue lifecycle |
| Mevcut Organization/Connector Policy | version/retention/limits/supported provider | Per-site permission; policy version ve deprecation gate | Approved tenant scope |
| Koşullu Audit Evidence | evidence class/hash/storage/provenance | Retention/export/purge yetkisi; immutable storage claim kanıtlıysa | Enterprise kontrol ihtiyacı |
| Yeni zorunlu DocType yok | Versioned schema/migration/export format | Yeni Doctype yalnız gerçek lifecycle ihtiyacıyla | Mevcut model yeterlilik analizi |
| Ertelenmiş | Sonsuz retention, evrensel client desteği, zorunlu active-active, büyüme kampanyası | Ticari/teknik ihtiyaç olmadan yok | Yeni hipotez ve cost gate |

Custom schema owner [backend sözleşmesidir](../architecture/backend-doctypes.md). Site/admin izin ve native DB update davranışı review altında tutulur; modelde read-only flag var diye privileged değişmezlik kanıtı verilmez. [Frappe permissions](https://docs.frappe.io/framework/user/en/basics/users-and-permissions), [Database API](https://docs.frappe.io/framework/user/en/api/database).

## Sürekli uygulama sırası

1. **Supported matrix:** Framework/CRM/frontend/editor/compiler/provider/client sürümleri, release evidence ve sunset tarihleri. “Latest” otomatik upgrade değil. Upstream tag/manifest kaynakları [Frappe araştırmasında](../research/frappe-framework.md) güncellenir; eski public rapor tarihi sessizce değiştirilmez.
2. **Upgrade rehearsal:** patch/major adaylarını staged fixture corpus, auth/permission, source load/compile, final MIME ve native retry boundaries ile dene. Data migration mapping ve eski renderer/export kabiliyeti önceden düşünülür. Editor compiled HTML kaynak JSON'a çevrilerek round-trip sanılmaz. [GrapesJS source data](https://grapesjs.com/docs/modules/Storage.html).
3. **Deprecation:** müşteri/entegrasyon hangi endpoint/schema/provider capability'yi kullanıyor ölç; versioned API ve geçiş rehberi. Silent field rename, template rewrite veya sent snapshot replace yok. Uzun süreli destek cost'u açık product kararıdır.
4. **Export/portability:** authorized customer source/MJML/plain/HTML/PDF/revision/evidence manifest'i; secret ve başka müşteri data'sı export'ta yok. CID message resources ve HTML-only copy farklı formatlar olarak açıklanır. [RFC 2392](https://www.rfc-editor.org/rfc/rfc2392), [MIME RFC 2045](https://www.rfc-editor.org/rfc/rfc2045).
5. **Retention/purge:** müşteri/iş/hukuk scope'u belirlenmiş policy; backup/cache/provider/export residual haritası; irreversible işlemler explicit yetkiyle ve evidence ile. Hash saklamanın bütün privacy sorunlarını otomatik çözdüğü iddia edilmez.
6. **Incident learning:** her P0/P1 duplicate/recipient/permission/source olayını detection, timeline, containment, kök neden, regression fixture ve owner ile işle. Tespit edilmemiş incident yokmuş gibi ölçüm yapma. [Unknown discovery yöntemi](../research/unknown-unknowns.md).
7. **DR/quota/provider rehearsal:** token revoke/outage, worker starvation, restoration with outbound mute; accepted/unknown intents ayrılır. Provider değişimi yeni sender/auth/MIME/rate/behavior review ister, secret kopyalama işi değildir. [Frappe backup](https://docs.frappe.io/framework/user/en/guides/basics/how-to-enable-backup-encryption), [provider quota örneği](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html).
8. **Ürün portföyü:** az kullanılan pahalı özelliği kaldırma/yalınlaştırma; customer value ve support/cost ile değerlendirme. Growth/marketing opsiyonlarını temel teklif güvenliği üstüne zorunlu ekleme. Mautic entegrasyonu varsa source/contact/consent otoriteleri ve sync contracts aynı review'ye girer.
9. **UX sürdürülebilirliği:** 320 critical task, keyboard/coarse/hybrid, reduced motion/zoom ve gerçek target clients evidence; brand tokens ve baseline değişimi independent review. Dokümantasyon sitesinin semi-flat görünümü bütün ürün estetiğinin kalıcı standardı değildir.

## Review döngüsünün exit gates

Bu fazın tek “bitti” düğmesi yoktur. Her review döneminde aşağıdaki kapılar değerlendirilir:

- Supported matrix ve değişmiş dependency/provider contract'larının owner'ı var; bilinen P0 release blocker açıkken yeni rollout yok.
- Aday upgrade source/sealed/revision/permission/MIME/queue corpus'unu geçer veya açık stop kararı verir; başarısız fixture threshold/snapshot topluca gevşetilmez.
- Deprecation cohort'u ve export path kanıtlıdır; eski gönderilmiş içerik yeni compile version ile sessiz değişmez.
- Recovery/reconciliation tatbikatında eski pending mail outbound mute'ı aşmaz; provider accepted fact yeni gönderim bahanesi olmaz. SMTP duplication sınırı ortadan kalkmış gibi vaadedilmez. [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321#section-4.5.3.2.6).
- Retention/purge ve business evidence, üzerinde anlaşılmış scope'a göre erişilebilir/izlenebilirdir; compliance label yalnız bağımsız doğrulanmış gerçek kapsam için düşünülür.
- Maliyet/retention/support ve cohort iş faydası değerlendirilmiştir; devam/pivot/sunset kararı product owner'a aittir. Başarılı uptime veya feature sayısı tek başına olgun ürün değeri değildir.

## Rollback ve sorumluluk

Upgrade rollback compatible app/compiler pointer ve staged restore ile; destructive migration/purge geri dönülebilir varsayılmaz. Canary gate kapanır, queue muted ve Unknown reconcile kalır. Eskimiş provider/feature sunset'inde müşterinin authorized data export'u ve operasyon devam/bitirme planı hazırlanır; public code customer verisini public yapmaz.

Hüseyin Cengiz teknik release/DR/security/provider/worker; Asistan Hüseyin GoDaddy DNS uygulaması; backend contract/migration/evidence; frontend resource/brand/accessibility; QA independent regression; product/customer owner lifecycle ve fiyat/segment kararlarının sahibidir. Bu görev tanımı dış kişilere otomatik mesaj, server deploy veya mail gönderme yetkisi değildir. Lisans kararı beklemededir; maturity planı lisans seçimini değiştirmez.
