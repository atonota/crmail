# Faz 7 — Enterprise: talep edilmiş kontrol ve kanıt

Tarih: 2026-10-06. Durum: koşullu gereksinim planı. Amaç güvenlik/policy/delegation/evidence/saklama ve kurumsal entegrasyonları doğrulanmış müşteri ihtiyacına göre kurmak. Sertifika, compliance veya hukukî e-imza vaadi değildir. Tahmin: seçilmiş kontrol paketi için 30–60 mühendis-günü + bağımsız güvenlik/alan uzmanı incelemesi; procurement/legal beklemesi ayrıca.

## Önkoşullar

[Scale](06-scale.md) veya eşdeğer operasyon/izolasyon kanıtı; yazılı müşteri kontrol listesi, threat model, retention/export/SSO/recovery gereksinimi ve risk kabul sahibi. Her müşteriye SSO/WORM/global tenancy kurmak zorunlu değildir. Finansal/sözleşme scope'u ayrı anlaşılır; teknik Acceptance'i “yasal e-imza” diye pazarlamak kabul edilmez.

Platform izin/role temeli uygulanacak kontrolün yerini tutmaz. Native Frappe DocPerm/permlevel ve site modeli iskelet sağlar; SSO/delegation/evidence ihracı için chosen-version/integration PoC gerekir. [Frappe permissions](https://docs.frappe.io/framework/user/en/basics/users-and-permissions), [multitenancy](https://docs.frappe.io/framework/user/en/bench/guides/setup-multitenancy).

## DocType ve policy kapsamı

| Sınıf / DocType | Fields / state | Permission / server validator | Bağımlılık |
|---|---|---|---|
| Native User/Role/DocPerm/Activity Log/Version | identity/role/permlevel/native audit | Least privilege; native logs sınırsız business evidence değildir | IdP/session policy; operator sınırı |
| Mevcut Approval | reviewer scope/hash/decision/reason/expiry/delegation ref önerisi | Ayrık reviewer, self-approve/expired delegation policy; source mutate invalidates | Proposal/Template Revision |
| Mevcut Acceptance | exact revision/identity/evidence/timestamp | Verification/replay/expiry; GET passive | Kabul yöntemi risk kararı |
| Mevcut Organization Policy | site/org/limits/retention/approvers | Per-site policy admin; default-deny; dış body'ye policy override yok | Scale tenant kararı |
| Koşullu yeni Crmail Audit Evidence | event checksum/retention scope/evidence File/actor | Evidence read/export izinli; append policy; mutable admin DB'ye WORM adı verilmez | Approved storage/export stratejisi |
| Mevcut Connector Policy/Dispatch | allowed sender/account/enabled/sealed refs | Account revoke/session revoke, operator review | Mail/queue |
| Ertelenmiş | Universal e-sign compliance/çok bölgeli active-active/marketplace | İhtiyaç ve independent gate yoksa kurulmaz | Ayrı ticari/mimari süreç |

Custom kayıtlar [backend sözleşmesinin](../architecture/backend-doctypes.md) önerileridir. Audit Evidence adı, altyapının gerçekten immutable storage sunduğunu kanıtlamaz. Cryptographic hash içeriğin değişmediğine yönelik teknik bağlamdır; kimlik ve işlem yetkisi ayrıca gerekir. DKIM alan adı sorumluluğunu assertion eder; ticari imza/kabulün kendisi değildir. [RFC 6376](https://www.rfc-editor.org/rfc/rfc6376).

## Uygulama sırası

1. **Control mapping:** müşteri requirement → risk → uygulanacak policy/API/DocType → evidence → owner → saklama/istisna. “Enterprise-ready” genel etiketi yerine kapsam matrisi. Sahip: product/security/backend.
2. **Identity/SSO pilot:** seçilen IdP/flow, account linking, role mapping, logout/token/session revoke, tenant routing ve acil operator erişimi. SSO çalışıyor diye File/API/worker izinleri atlanmaz. API/MCP UI ile aynı business command'ı kullanır.
3. **Delegated review:** approval yetkisi exact payload/revision ve time-bound delegation'a bağlanır. Offboarding veya role change sonrası cached/replayed request yeniden permission check yapar. Dört göz gerekiyorsa self-approval kapatılır; tek ekibin akışı gereksiz role hierarchy'ye zorlanmaz.
4. **Evidence pipeline:** source/revision/final MIME hash, actor/permission outcome, provider facts ve operator reconciliation saklanır; export sensitivity/redaction/access kontrolü. Public docs'a gerçek buyer body/PDF/recipient listesi verilmez. Append log with hash tek başına privileged operator'a karşı WORM değildir.
5. **Retention/export/deletion:** policy sınıfına göre exact scope, legal/iş ihtiyacı, erişim rolleri, silme request ve purge flow. Backups/cache/generated PDF/provider event residual'ları dahil edilir. Hukukî süre kullanıcı/uzman tarafından belirlenir; belgede evrensel süre icat edilmez.
6. **Business continuity:** approved RPO/RTO ve recovery drill; keys/native Email Account/private Files/sealed intents bütün olarak. Tek SQL backup restore claim'i yeterli değildir. [Backup encryption](https://docs.frappe.io/framework/user/en/guides/basics/how-to-enable-backup-encryption).
7. **Security review:** independent read-only finding ve authorized controlled assessment; cross-site, direct CRUD, export, connector/webhook, template resource boundaries. Bunlar auto server/message izinleri değildir.
8. **Contract-scope release:** pilot tenant/organization'a kademeli aç; policy version ve rollback mapping. Bütün müşterilerin UI'sına kontrol yığını ekleme; capability-driven disclosure ve 320 journey korunur.

## Önerilen exit gates

- Control mapping'teki her MUST için gerçek kanıt veya açık exception/owner; uygulanmamış kontrol için pass/uyumluluk badge yok.
- Role/SSO/delegation/offboarding negatif corpus'u stale token veya değişmiş user permission ile approve/send/export yapamaz.
- Evidence export exact revision/dispatch/actor facts içerir; unauthorized okuyucuya müşteri payload'ı ve secret yok. Hash mismatch belirgin, silent repair yok.
- Retention/deletion/export ve restore tatbikatı policy'de belirtilen sınıfları kapsar; backups/dış provider'ın sınırlamaları raporlanır.
- Accepted sonrası source/price/attachment mutation yeni revision ve review gerektirir; eski Acceptance exact eski hash'e bağlı kalır.
- Approved RPO/RTO gerçekten ölçülür; hedef değerler müşteriye söz verilmeden cost/architecture review olur.
- Gerçek IdP/device/client/platform certification ayrı; emülasyon veya security review görüşü bütün katman için pass sayılmaz.

## Rollback ve sahiplik

Yeni enterprise capability gate kapanabilir; mevcut issued evidence/revision korunur. Identity rollback user'ı yanlış tenant/admin role'a düşürmez; fail-closed session ve operator break-glass yöntemi önceden tasarlanır. Retention/purge işleminden sonra “geri dönüş” yalnız uygun saklanmış authorized recovery ile mümkün olduğundan destructive gate ayrı review ister. SMTP accepted mail geri çekilmiş sayılmaz.

Hüseyin Cengiz identity ingress/secret/storage/DR/security teknik sahibi; Asistan Hüseyin GoDaddy domain/DNS uygulaması; product/customer control owner policy ve ticari scope; backend permission/evidence; frontend role/state görünürlüğü; independent QA/security verifier evidence sahibidir. [Maturity](08-maturity.md) uzun vadeli sözleşme ve işletim yönetimidir; burada özellik checklist'i tamamlanınca otomatik oluşmaz.
