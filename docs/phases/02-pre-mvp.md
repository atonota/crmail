# Faz 2 — Pre-MVP: kaynak, yayın ve editör güvenilirliği

Tarih: 2026-10-06. Durum: önerilen plan. Amaç: PoC spike'larını kaydedilebilir, sürümlenebilir ve izinli içerik lifecycle'ına dönüştürmek. Tahmin: 20–35 mühendis-günü; iki geliştirici + paylaşımlı QA varsayımı. Migration/client QA ve UX seçim beklemesi ayrıca; süre taahhüdü değildir.

## Önkoşullar

[PoC](01-poc.md) auth/queue/MIME blocker'ları için karar verir; unresolved P0 ile ilerlenmez. Headless boundary ve tenant/site seçimi yazılıdır. İlk marka, içerik tipi ve mail client corpus'u sınırlanmıştır. UI alternatifi [önerilerden](../ux/ui-proposals.md) seçilirse seçim kaydedilir; kütüphane default görünümü onay sayılmaz.

## DocType kapsamı ve invariants

| Sınıf / DocType | Fields / state | Permission / server validator | Bağımlılık ve migration |
|---|---|---|---|
| Native File/User/Role/DocPerm | private attachment refs; native states | Kayıt ve File read ayrı; upload MIME/size; role ve field matrix | Permission fixture'ları; raw credential export yok |
| Native Version | Native değişiklik geçmişi | History okuma rolleri | Immutable yayın yerine kullanılmaz |
| Custom mevcut Brand Profile | semantik brand config, active sender/logo refs | Brand publisher/operator write; allowed keys ve File read | PoC source modeli |
| Custom mevcut Email Template | amaç, owner, brand, active_revision; Draft/Published/Retired katalog | Author edit; publisher active revision seçer; tombstone | Native Email Template projection isteğe bağlı |
| Yeni Crmail Template Revision | template/sıra/project_json/mjml/compiled_html/plain/compiler/schema/checksum/published_by/at | Draft→Published→Retired; Published edit/delete ret; server compile ve content policy | Append-only revision; eski source korunur |
| Custom mevcut Email Draft | template_revision, source, save_revision, CRM/recipient fields | Author owner write; optimistic expected revision; stale conflict | Yeni pointer migrate edilir; eski mutable source retained |
| Custom mevcut Dispatch | sealed source/output hash, asset manifest, refs; mevcut graph | Client hash/status otorite değil; immutable seal | PoC retry adapter ve outbox |
| Yeni sonraki faz | Proposal/Item/Revision | MVP iş kuralları | Financial scope henüz yayınlanmaz |
| Ertelenmiş | Acceptance, Delivery Event, Connector Policy, Audit Evidence | Henüz kurulmaz | İhtiyaç kapıları |

GrapesJS editör kaynak modeli ile HTML ayrıdır; native Version de iş snapshot'ına alternatif değildir. [GrapesJS storage](https://grapesjs.com/docs/modules/Storage.html), [Frappe Document API](https://docs.frappe.io/framework/user/en/api/document). Custom alanlar [backend sözleşmesiyle](../architecture/backend-doctypes.md) uzlaştırılır.

## Uygulama sırası

1. **Source migration:** PoC mutable source'u revision taslağına dönüştür; schema_version ve compiler_version kaydet. Dosya transform'ları reversible mapping ve corpus'la yapılır. Sahip: backend/editor.
2. **Save API:** `save_draft` expected save_revision ister; session expiry/retry duplicate save semantiği test edilir. Local autosave ile server saved state ayrılır. Çatışma görünür, kullanıcı source'u dışa alabilir. Sahip: frontend/backend.
3. **Compiler service:** deterministic server compile, limit/timeout, strict validation, saf token allowlist ve escaped müşteri metni. Arbitrary include/path/fetch kapalı; source hata line/block'a bağlanır. [MJML validation](https://documentation.mjml.io/#validating-mjml), [OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).
4. **Asset service:** native File IDs, authorized bytes, MIME/size/alt text ve transport strategy; public marka ile private teklif görseli ayrılır. URL'yi public'e çevirmek dosya yetkisini gevşetme yolu olmaz. Sahip: backend/QA. [File controller](https://github.com/frappe/frappe/blob/v16.50.0/frappe/core/doctype/file/file.py).
5. **Publish command:** rol, schema, compiler, CTA/asset policy ve output checksum ile immutable Template Revision. Yeni publish eski dispatch'i değiştirmez. Native template projection gerekiyorsa tek yönlü kontrollü çıktı; ikinci source of truth yaratılmaz.
6. **Editor kabuğu:** layout/inspector/action tokenları, block reorder keyboard alternatifi, save status ve focus. GrapesJS canvas kendi component/undo modeliyle kalır. 320→360→375→390→landscape→tablet→desktop sırası. Editor kaynakları yalnız editör route'unda yüklenir.
7. **Transport ayrımı:** copy HTML/plain, backend MIME/CID ve PDF/link output ayrı generator yolları. Clipboard sonucu görünüm/recipient client garantisi değildir; send butonu kopyalamaya bağımlı olmaz. [WebKit Clipboard](https://webkit.org/blog/10855/async-clipboard-api/), [RFC 2392](https://www.rfc-editor.org/rfc/rfc2392).
8. **Bağımsız QA:** kaynak/diff/screenshots/network/failure corpus sunulur; reviewer salt okunur. Uygulayıcı snapshot referanslarını topluca onaylamaz.

## Acceptance ve exit

Önerilen başlangıç: 20 template/source fixture, en az iki CTA/iki image/private PDF ve uzun Türkçe içerik. Baseline bütçeleri frontend araştırmasındaki gerçek production build'e göre seçilir; genel sayılar SLA diye verilmez.

- Save/load/save structural round-trip: editable blok/property korunumu; bilinen unsupported içerik açıklanır; kaynak kaybı sıfır.
- Aynı Published revision'a doğrudan API/import/edit/delete testleri normal roller için ret; eski dispatch checksum sabit.
- İki sekme/expired session/offline→online akışında sessiz overwrite sıfır; save confirmation server revision'a bağlı.
- Compile/asset negatif corpus'unda arbitrary Jinja/SSRF/path/private byte sızıntısı sıfır.
- Final MIME corpus'u PoC'den geçmeye devam eder; wrapper drift çözümü çalışır.
- 320 kritik task ve bütün keyboard control'lerde görünür odak; hücresel/coarse ve fine pointer ayrımı; orientation draft/focus continuity. Editor dışı route cold request initiation'da editor payload sıfır.
- Clipboard target testleri engine/OS ve gerçek client katmanlarıyla ayrı kayıtlanır. WebKit yorum/width dönüşümü özel regresyon; gerçek Safari sertifikası emülasyondan çıkarılmaz.

## Rollback ve sahiplik

Publish gate kapatılır; eski published source/output korunur; compiler upgrade pointer'ı önceki version'a döner. Migration rollback doğrudan revizyon silerek yapılmaz; reversible snapshot/export ve yeni corrective revision tercih edilir. Henüz gerçek müşteri send kapalıysa outbound sink'e döner. Backend kaynak/revision/asset kuralları; frontend editör/save UX; QA dönüşüm ve state corpus'u; Hüseyin Cengiz worker/resource/backup teknik işletim sahibidir.

Yeni “daha fazla marka/şablon” kapasitesi optionaldır; marketing automation/growth bu fazın acceptance'ı değildir. Çıkış, [MVP](03-mvp.md) için güvenilir kaynak/yayın zemini oluşturur; müşteri iş değeri veya PMF sonucu sayılmaz.
