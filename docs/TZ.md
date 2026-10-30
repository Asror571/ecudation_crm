# UzbekCRM Product Specification

> Source: the supplied UzbekCRM specification, version 3.0 (2026-10-30).
> Sections 1–13 are included as the product contract; the embedded agent
> prompt and open-question appendix are intentionally excluded.

UzbekCRM: amoCRM klon (ta'lim markazlari uchun). Tahlil, funksiyalar, UI va AI agent topshirig'i

Versiya: 3.0  |  Sana: 2026-10-30  |  Stek: React + NestJS + MongoDB

Bu hujjat avvalgi TZ v2 ni kengaytiradi. Ziddiyat bo'lsa shu hujjat ustun. Tarkib: amoCRM tahlili, skrinshotlar tahlili, funksiyalar katalogi, UI, ishlash mantig'i, texnik spetsifikatsiya va AI agent uchun to'liq prompt (14-bo'lim).

## 1. Xulosa va asosiy qarorlar

Maqsad: amoCRM'ning funksional klonini ta'lim markazlari uchun yaratish: o'z nomi va dizayni, o'zbek/rus tili, mahalliy integratsiyalar (Eskiz SMS, Telegram, Meta Lead Ads, keyinroq Payme/Click, LMS).

Huquqiy chegara (majburiy): amoCRM'ning kodi, logotipi, ikonkalari, matnlari va rasmlari nusxalanmaydi. Faqat umumiy CRM g'oyalari va foydalanuvchi tajribasi naqshlari (kanban, bitim kartochkasi, avtomatik voronka, vidjet paneli) o'z dizayn va o'z kodimiz bilan qayta quriladi.

Avvalgi TZ v2 dan o'zgarishlar:

Bir nechta pipeline (voronka) qaytadi. Har filial uchun alohida voronka. stages endi pipelineId ga bog'lanadi.

Kontakt va Kompaniya alohida ob'ektlar (bitimga bog'lanadi), dublikatlarni birlashtirish bilan.

Tahlil qilinmagan (Unsorted) bosqichi: integratsiyalardan kelgan lidlar avval shu yerga tushadi, operator qabul qiladi yoki rad etadi.

Digital Pipeline avtomatika dvigateli kengaytiriladi (ko'p trigger va amal).

Chat/Inbox va Salesbot rejaga kiradi (birinchi kanal: Telegram).

Huquqlar matritsasi amoCRM darajasida: rollar, guruhlar, voronka va maydon bo'yicha ruxsat.

Vidjet paneli (SMS, telefoniya, maslahatlar).

Moliya/to'lovlar hali yo'q. LMS keyingi bosqichda.

Mavjud kod bo'lsa: AI agent avval audit qiladi, mos keladigan qismni saqlaydi va faqat farqlarni migratsiya qiladi (hammasini qayta yozmaydi).

## 2. amoCRM nima qiladi (rasmiy sahifa va hujjatlar asosida)

Oddiy interfeys: minimum tugma va sahifa, o'qitish talab qilinmaydi, planshetga moslangan.

Arizalarni avtomatik yig'ish: veb-forma, e-mail, telefon, ijtimoiy tarmoq va chatdan kelgan murojaat avtomatik voronkaga tushadi.

Mobil ilova (vizitka skaneri bilan).

E-mail integratsiyasi: kiruvchi/chiquvchi xatlar mos kartochkaga tushadi.

Telefoniya: 50+ provayder, bir klikda qo'ng'iroq, qo'ng'iroq tarixi va yozuvlari kartochkada, qo'ng'iroq statistikasi.

Ichki messenjer: jamoa ichida muloqot va bildirishnomalar.

Digital voronka: bosqichga trigger va avtomatik amallar (reklama, xabar, Salesbot).

Xaridorlar (Customers): takroriy xaridlar voronkasi.

API va vidjetlar: ochiq API, yuzlab tayyor kengaytma.

Boshqa: vazifalar va eslatmalar, kontaktlar/kompaniyalar, ro'yxatlar (mahsulot katalogi), tahlil va hisobotlar (voronka, xodim faolligi, qo'ng'iroqlar, maqsadlar), huquqlar tizimi, teglar, maxsus maydonlar, import/eksport, 2 bosqichli autentifikatsiya, AI yordamchi.

Digital Pipeline trigger amallari (hujjatlardan): Salesbot ishga tushirish, vazifa qo'shish, bitim yaratish, e-mail yuborish, webhook yuborish, bosqichni o'zgartirish, teg qo'shish, vazifalarni yopish, forma yaratish, mas'ulni o'zgartirish, maydonni o'zgartirish, fayllarni o'chirish. Trigger shartlari: bosqichga o'tganda, bosqichda yaratilganda, mas'ul o'zgarganda, bosqichda N kun turganda; shart (qaysi bitimlarga), faol soatlar.

## 3. Skrinshotlar tahlili

Skrinshotlar haqiqiy bir nemis tili o'quv markazining amoCRM akkauntidan. Shaxsiy ma'lumotlar bu hujjatga ko'chirilmadi.

### 3.1 Rasm 1: Bitimlar (kanban)

Chap ingichka panel: Ish stoli, Bitimlar, integratsiya, so'ng har filial uchun alohida voronka yorlig'i (Mirzo Ulug'bek, Alisher Navoiy, Bodomzor, Samarqand, Farg'ona, Andijon, Qarshi...). Pastda bildirishnoma qo'ng'irog'i (yuzlab o'qilmagan).

Yuqori panel: voronka nomi va sozlash belgilari, qidiruv va filtr, o'ngda umumiy hisob ("312 bitim: 0 so'm"), ko'k + Yangi bitim tugmasi, qo'shimcha menyu.

Ustunlar: Yangi lid (13), Ko'tarmadi (8), Qayta aloqa (158), Shu hafta (32), Ertaga keladi (13), Bugun keladi... Har ustunda nom, soni, summa, rangli chiziq. Birinchi ustunda Tezkor qo'shish.

Kartochka: tepada mas'ul (Filial / Xodim) va sana-vaqt; ko'k havola sarlavha (avtomatik nom, masalan Facebook lid raqami); kontakt ismi; telefon; teglar (filial, reklama ID, manba, "Chiquvchi", "Mijoz javob bermadi", +N); chetda vazifa holati nuqtasi (sariq: vazifa yo'q; yashil: vazifa bor; pushti/qizil: muddati o'tgan).

Qorong'i mavzu. Bitta ustunda 158 ta bitim: virtualizatsiya shart.

### 3.2 Rasm 2: Bitim kartochkasi (3 ustunli)

Chap: sarlavha, #ID, teglar; voronka va bosqich (rangli progress chiziq, sana); tablar (Asosiy, Salesbot, Statistika, Boshqa bitimlar, Meta Reklama); mas'ul; yig'iladigan maydon guruhlari (To'lovlar, Modme_talaba, Filialdagi guruhlar); maxsus maydonlar (Filial, Administrator, Operator, Markazga keldimi?, Qayerdan keldi, Yashash hududi, Audit bo'lim, Mijozning bo'sh vaqti: select, switch, sana); pastda kontakt bloki (ism, kompaniya, telefon, email, lavozim).

Markaz: hodisalar lentasi (yig'ma "Yaratildi: 3 hodisa", "Maydon o'zgardi" + Kengaytirish; Robot yozuvlari: maydon qiymati o'rnatildi, teg qo'shildi), izoh bloki, ogohlantirish "Rejalashtirilgan vazifa yo'q, qo'shish tavsiya etiladi", pastda yozish maydoni (chat, qabul qiluvchi tanlash, ishtirokchilar soni).

O'ng: Vidjetlar paneli (SMS provayder Eskiz, telefoniya, "Maydonlar uchun maslahat", "Bosqichlar uchun maslahat").

### 3.3 Biznes xulosalar (nimani qurish kerak)

Ko'p filial = ko'p voronka + umumiy hisobot.

Meta reklamadan lidlar avtomatik keladi, nomi va teglari robot tomonidan qo'yiladi (filial, reklama ID, manba) → ingestion + avtomatik teglash qoidasi.

Bosqichlar o'quv markaz jarayoni: ko'tarmadi → qayta aloqa → shu hafta/ertaga/bugun keladi (markazga tashrif) → sinov/to'lov.

Maxsus maydonlar ko'p va guruhlangan: maydon guruhlari kerak.

Tashqi LMS (Modme) bilan bog'liq maydonlar bor: keyin LMS integratsiyasi.

SMS (Eskiz), telefoniya va maslahat vidjetlari: vidjet paneli kerak.

Hajm katta (bir ustunda 158, ko'p yuzlab bildirishnoma): virtualizatsiya, bildirishnomalarni guruhlash va "hammasini o'qilgan" qilish.

Hodisalar lentasida robotning har harakati ko'rinadi: audit va ishonch uchun muhim.

## 4. Funksiyalar katalogi (klon qamrovi)

P0 majburiy, P1 muhim, P2 keyin.

| Modul | Funksiya | P |
| --- | --- | --- |
| Bitimlar | Ko'p voronka, sozlanadigan bosqichlar (rang, tur: oddiy/yutildi/yo'qotildi/tahlil qilinmagan) | P0 |
|  | Kanban: drag & drop, ustunda son va summa, lazy load, virtual scroll | P0 |
|  | Ro'yxat (jadval) ko'rinishi, ustunlar tanlash, saralash | P0 |
|  | Tezkor qo'shish (ustun tepasida) va to'liq yaratish | P0 |
|  | Filtr (mas'ul, bosqich, teg, sana, maydonlar, vazifa holati, manba), saqlanadigan filtrlar | P0 |
|  | Ommaviy amallar (mas'ul, bosqich, teg, o'chirish, vazifa) | P0 |
|  | Karta ustidagi vazifa holati nuqtasi | P0 |
|  | Bosqichga o'tganda majburiy maydonlar | P1 |
|  | Yutildi/yo'qotildi (sabab majburiy) va qayta ochish | P0 |
|  | Statistika ko'rinishi (bosqichlar bo'yicha yig'ma) | P1 |
| Tahlil qilinmagan | Integratsiyadan kelgan lidlar ro'yxati: qabul qilish, rad etish, mavjud kontaktga ulash | P0 |
| Bitim kartochkasi | 3 ustun: maydonlar, lenta+yozish, vidjetlar; tablar; maydon guruhlari | P0 |
|  | Hodisalar lentasi (inson, robot, integratsiya, API) | P0 |
|  | Izohlar, @eslatma (mention), fayllar | P0 |
|  | Bosqich progress chizig'i | P0 |
| Kontaktlar | Kontakt va Kompaniya kartochkalari, bitimlarga bog'lash, bir kontaktda ko'p telefon/email | P0 |
|  | Dublikat topish va birlashtirish (telefon/email) | P0 |
| Vazifalar | Turlar (qo'ng'iroq, uchrashuv, kuzatuv), muddat, mas'ul, natija izohi, bajarildi | P0 |
|  | Vazifalar sahifasi: ro'yxat va kalendar | P0 |
| Bildirishnomalar | Markaz, qo'ng'iroqcha, guruhlash, o'qildi, real vaqt | P0 |
| Digital Pipeline | Bosqichga trigger/amallar, shartlar, faol soatlar, jurnal | P0 |
| Salesbot | Vizual senariy (xabar, savol, shart, kutish, amal) | P1 |
| Inbox/Chat | Yagona suhbatlar ro'yxati, bitimga bog'lanish, shablonlar; Telegram birinchi kanal | P1 |
| Forma va sayt | Embed forma yaratuvchi, webhook, UTM yig'ish | P1 |
| Telefoniya | Provayder interfeysi, bir klik qo'ng'iroq, qo'ng'iroq tarixi/yozuvi, webhook | P1 |
| SMS | SmsProvider interfeysi, Eskiz adapteri, shablonlar, bosqichdan avtomatik SMS | P1 |
| Tahlil | Voronka, bitimlar yig'masi, manbalar/UTM, yo'qotish sabablari, xodim faolligi, qo'ng'iroqlar, maqsadlar (reja), hodisalar jurnali | P0 |
| Ish stoli | Vidjetli dashboard: yangi bitimlar, vazifalar, faollik, reja | P0 |
| Sozlamalar | Voronkalar, maydonlar (turlar, guruhlar, majburiylik), teglar, vazifa turlari, sabablar, foydalanuvchilar, rollar, guruhlar, huquqlar, ish vaqti | P0 |
|  | Integratsiyalar/vidjetlar, API kalitlar, webhooklar, shablonlar, import | P1 |
| Import/eksport | CSV/XLSX import (moslashtirish), eksport | P0 |
| Axlat va audit | O'chirilganlarni tiklash, hodisalar jurnali | P1 |
| Xaridorlar/Talabalar | Takroriy qatnashuv voronkasi (LMS bilan) | P2 |
| Ro'yxatlar | Kurslar katalogi (mahsulot), bitimga biriktirish | P1 |
| Pochta | E-mail sinxronizatsiyasi | P2 |
| Mobil | PWA (adaptiv) | P1 |
| AI | Xulosa, keyingi qadam tavsiyasi, javob tahlili | P2 |
| Xavfsizlik | 2 bosqichli tekshiruv (TOTP), sessiyalar, IP cheklash | P1 |

## 5. UI tizimi (amoCRM tuzilmasiga o'xshash, o'z dizaynimiz)

Mavzu: yorug' va qorong'i (qorong'i skrinshotdagidek), tokenlar CSS o'zgaruvchisida. Asosiy rang #2563EB, Inter shrifti, 8px grid. Zich (compact) ko'rinish rejimi.

Qobiq: chap ingichka ikonka paneli (Ish stoli, Bitimlar, Vazifalar, Suhbatlar, Kontaktlar, Tahlil, Ro'yxatlar, Sozlamalar), tagida voronka almashtirgich (filial yorliqlari) va bildirishnoma qo'ng'irog'i; yuqori panel (voronka nomi, qidiruv+filtr, umumiy hisob "N bitim: summa", + Yangi bitim, qo'shimcha menyu).

Kanban kartasi: mas'ul nomi + sana-vaqt; sarlavha (havola); kontakt ismi; telefon; narx (bo'lsa); teglar (+N); vazifa holati nuqtasi (kulrang: vazifa yo'q, yashil: reja bor, qizil: muddati o'tgan). Ustun sarlavhasi: rang, nom, soni, summa, tezkor qo'shish.

Bitim kartochkasi: (1) chap 360px: sarlavha, #ID, teglar, voronka/bosqich progress, tablar, maydon guruhlari, kontakt bloki; (2) markaz: lenta (hodisalarni yig'ish/kengaytirish), pastda yozish paneli (tablar: Chat | Izoh | Vazifa), vazifa yo'qligi ogohlantirishi; (3) o'ng 280px: vidjetlar (SMS, telefoniya, maslahat), yig'iladi.

Boshqa sahifalar: Vazifalar (ro'yxat+kalendar), Kontaktlar/Kompaniyalar (jadval + kartochka), Suhbatlar (3 ustun: ro'yxat, chat, bitim ma'lumoti), Tahlil (tablar), Sozlamalar (chap menyu), Ish stoli (vidjet to'ri).

Interaktsiya: klaviatura (N yangi, / qidiruv, Esc), optimistik yangilash, skeleton/empty/error holatlari, real vaqt (Socket.IO), ommaviy tanlash paneli, drag handle, 150-200 ms animatsiya. WCAG AA, uz/ru.

## 6. Qanday ishlaydi (asosiy oqimlar)

Lid kirishi: forma/Meta/Telegram/API/import → telefon normallashadi → dublikat tekshiruvi → kontakt topiladi yoki yaratiladi → bitim voronkaning Tahlil qilinmagan bosqichida yaratiladi (yoki sozlamaga ko'ra to'g'ri birinchi bosqichda) → robot teg qo'yadi (filial, manba, reklama ID) → mas'ul taqsimlanadi → bildirishnoma.

Qabul: operator Tahlil qilinmagan'dan qabul qiladi (voronka/bosqich tanlaydi) yoki rad etadi (arxivga). Dublikat bo'lsa mavjud kontaktga ulaydi.

Ish: bitim bosqichlardan o'tadi. Har o'tishda: hodisa yoziladi, Digital Pipeline triggerlari ishlaydi (vazifa yaratish, SMS, teg, mas'ul o'zgartirish...), majburiy maydonlar tekshiriladi.

Vazifa nazorati: vazifasiz bitim kartada sariq nuqta va kartochkada ogohlantirish bilan ko'rinadi; muddati o'tgan qizil; rahbar tahlilda ko'radi.

Suhbat: kanal xabari bitimga bog'lanadi, lentada ko'rinadi, Salesbot javob beradi yoki operatorga uzatadi.

Yakun: Yutildi (summa, kurs) yoki Yo'qotildi (sabab majburiy). Qayta ochish mumkin va lentada qayd qilinadi.

Tahlil: hamma hisob hodisalar va bitim ma'lumotidan aggregation orqali; maqsadlar (reja) bilan taqqoslanadi.

Huquqlar: har so'rovda backend rol/guruh/voronka/maydon huquqini tekshiradi; ruxsatsiz resurs 404.

## 7. Ma'lumotlar modeli (MongoDB)

Hamma tenant kolleksiyada: _id, workspaceId (indeks), createdAt, updatedAt, isDeleted (soft delete, axlatdan tiklash uchun). Vaqt UTC. Tenant izolyatsiyasi global plugin orqali (fail closed), begona resurs 404.

workspaces: name, slug, settings{timezone, language, theme, workHours, sla}, isActive.

users: fullName, phone, email, passwordHash, roleId, groupIds[], language, isActive, mustChangePassword, totp{secret,enabled}, refreshTokens[], lastLoginAt, inRotation.

groups (filial/bo'lim): name, parentId?. roles: name, rights (pastda).

pipelines: name, order, color, isDefault, groupIds[] (qaysi guruhlar ko'radi).

stages: pipelineId, name, color, order, type (incoming tahlil qilinmagan | open | won | lost), requiredFieldIds[]. Har voronkada bitta incoming (tizimli, o'chirilmaydi), kamida bitta won va lost.

deals (bitimlar): name, pipelineId, stageId, position (float), price, responsibleUserId, contactIds[], mainContactId, companyId, tagIds[], customFields{}, source{channel, sourceId, utm{}, adId, externalId}, closedAt, lossReasonId, lossComment, stageEnteredAt, lastActivityAt, taskState (none|planned|overdue, kartadagi nuqta uchun denormalizatsiya), nextTaskAt, items[{courseId, qty, price}], createdBy.

contacts: fullName, phones[{value,kind}], emails[{value,kind}], position, companyId, responsibleUserId, tagIds[], customFields{}. companies: name, phones[], emails[], address, customFields{}, responsibleUserId.

fieldDefs: entity (deal|contact|company), name, code, type (text, textarea, number, switch, select, multiselect, date, datetime, url, phone, email, address), options[], groupId, order, isRequired, pipelineIds[] (qaysi voronkada ko'rinadi), visibleRoleIds[], editableRoleIds[]. fieldGroups: entity, name, order, collapsedByDefault.

tags: entity, name, color. lossReasons, taskTypes (name, icon, defaultDeadline), courses (katalog: name, price, isActive).

tasks: entity (deal|contact|company), entityId, typeId, text, dueAt, responsibleUserId, status (open|done), result, completedAt, source (user|robot), ruleId?.

events (lenta/audit): entity, entityId, type (created, field_changed, stage_changed, responsible_changed, tag_added, tag_removed, note_added, task_added, task_done, message_in, message_out, call, sms, robot_action, merged, deleted, restored), actor{kind: user|robot|integration|api, id}, data{before, after}. Indekslar: {workspaceId, entity, entityId, createdAt:-1}.

notes: entity, entityId, authorId, text, mentions[], files[].

channels: type (telegram|instagram|facebook|whatsapp|web), name, config (shifrlangan), isActive. conversations: channelId, externalChatId, contactId, dealId?, status, assignedTo, lastMessageAt, unreadCount. messages: conversationId, direction, text, attachments[], senderKind (client|user|bot), sentAt, status.

templates: kind (sms|chat|email), name, body (o'zgaruvchilar: {{deal.name}}, {{contact.name}}, {{responsible.name}}).

automationRules, automationRuns, bots: 8-bo'lim.

forms: name, fields[], target{pipelineId, stageId|incoming}, tagIds[], embedKey. integrations: provider, config (shifrlangan), isActive. callLogs: dealId?, contactId?, direction, phone, durationSec, recordingUrl, userId, startedAt.

goals: period (YYYY-MM), userId|null, metric (won_count|won_sum|new_deals), target. savedFilters: userId, scope, name, query. dashboards: userId, widgets[{type, config, layout}]. notifications, importJobs, apiKeys (keyHash, scopes[]), webhooks (url, events[], secret).

Huquqlar modeli. role.rights: har ob'ekt (deals, contacts, companies, tasks, conversations) uchun amallar view, add, edit, delete, export, har biri none | own | group | all. Qo'shimcha: pipelineAccess{pipelineId: none|view|edit}, analytics (none|own|group|all), settings{pipelines, fields, users, integrations, templates, api} (boolean), canExportAll, canSeeUnsorted, maydon darajasida visibleRoleIds/editableRoleIds. Backend har so'rovda tekshiradi.

Indekslar (asosiylari): deals{workspaceId,pipelineId,stageId,position}, deals{workspaceId,responsibleUserId,stageId}, deals{workspaceId,createdAt}, deals{workspaceId,closedAt}, deals{workspaceId,taskState}, contacts{workspaceId,phones.value}, contacts{workspaceId,emails.value}, tasks{workspaceId,responsibleUserId,status,dueAt}, messages{conversationId,sentAt}, conversations{workspaceId,assignedTo,lastMessageAt}.

Biznes qoidalar: telefon +998XXXXXXXXX ga normallashadi. Kanban position float (yangi bitim ustun tepasiga min-1; ko'chirishda beforeId/afterId, o'rtacha qiymat; |prev-next|<1e-6 bo'lsa ustun fon vazifada qayta raqamlanadi). taskState vazifa o'zgarishida va har 10 daqiqada (muddati o'tganlar uchun) yangilanadi. Yo'qotildi sababi majburiy. Bosqichning requiredFieldIds to'lmasa o'tish rad etiladi (xato kodi REQUIRED_FIELDS, qaysi maydonlar ko'rsatiladi).

## 8. Digital Pipeline dvigateli

Qoida (automationRules): pipelineId, stageId, isActive, order, trigger (on_enter | on_create | on_responsible_change | after_time_in_stage{amount,unit} | on_incoming_message | on_task_done | on_field_change{fieldId}), conditions[] (maydon/teg/manba/mas'ul/narx bo'yicha: eq, ne, in, contains, gt, lt, empty), activeHours{days, from, to} (ixtiyoriy), actions[].

Amallar (P0 to'plam): create_task{typeId, text, due{anchor: now|field, direction, amount, unit}, responsible: deal_responsible|user|round_robin}, change_stage{pipelineId, stageId}, add_tag, remove_tag, change_field{fieldId, value}, change_responsible{userId|round_robin}, complete_tasks, send_webhook{url, method, headers, body-template}, create_deal{pipelineId, stageId, copyFields[]}. P1: send_sms{templateId}, send_chat_message{templateId}, run_salesbot{botId}, send_email, generate_form_link.

Bajarilish: hodisa (deal.stage_changed, deal.created...) → mos qoidalar topiladi → shart tekshiriladi → BullMQ navbatiga → ijrochi amallarni tartib bilan bajaradi → automationRuns va events (actor robot) ga yoziladi.

Idempotentlik: triggerKey = ruleId + dealId + stageEnteredAt (bir kirishda bir marta).

Kechiktirilgan trigger (after_time_in_stage): bosqichga kirganda scheduled job qo'yiladi, chiqqanda bekor qilinadi.

Sikldan himoya: robot amali yangi hodisa tug'diradi; zanjir chuqurligi maksimum 5, undan keyin to'xtaydi va xato jurnaliga yoziladi.

Xato: amal muvaffaqiyatsiz bo'lsa 3 marta qayta uriniladi, qolgan amallar davom etadi, xato jurnalda ko'rinadi.

UI: voronka sozlash ekrani: bosqich ustunlari tagida + tugmasi, trigger kartalari, qoida muharriri (trigger, shart, amallar, faol soatlar), jurnal.

Salesbot (P1): bots{name, steps graph}; qadam turlari: send_message, ask_question (javobni maydonga yozish), condition, delay, action (yuqoridagi amallar), handoff (operatorga uzatish), stop. Suhbat holati conversations.botState da saqlanadi.

## 9. API

Ichki REST /api/v1, javob { data, meta? }, xato { statusCode, message, code?, errors? }, sahifalash ?page&limit yoki kursor. Swagger.

Auth/Users/Roles/Groups: login, refresh, logout, me, change-password, 2FA; CRUD users, roles, groups.

Pipelines/Stages: CRUD, tartib, stages/:id/required-fields.

Deals: GET /deals (filtr, saralash), GET /pipelines/:id/board (har bosqich: {stage, count, sum, items, nextCursor}), POST /deals, POST /deals/quick, GET/PATCH /deals/:id, PATCH /deals/:id/stage ({stageId, beforeId?, afterId?, lossReasonId?}), POST /deals/bulk, POST /deals/:id/link-contact, GET /deals/:id/events.

Unsorted: GET /unsorted, POST /unsorted/:id/accept ({pipelineId, stageId, responsibleUserId?, contactId?}), POST /unsorted/:id/decline.

Contacts/Companies: CRUD, GET /contacts/duplicates, POST /contacts/merge.

Tasks: CRUD, POST /tasks/:id/complete ({result}), GET /tasks/calendar?from&to.

Notes/Files, Tags, FieldDefs, FieldGroups, LossReasons, TaskTypes, Courses, Templates, SavedFilters CRUD.

Conversations: GET /conversations, GET/POST /conversations/:id/messages, POST /conversations/:id/link-deal; kanal webhook'lari POST /channels/:type/webhook/:channelKey.

Automation: CRUD /automation-rules, GET /automation-runs; Bots CRUD.

Forms: CRUD, ochiq POST /public/forms/:embedKey/submit.

Integrations: SMS (POST /sms/send, provayder sozlamalari), telefoniya webhook POST /telephony/events, POST /telephony/call.

Analytics: /analytics/funnel, /deals-summary, /sources, /loss-reasons, /managers, /calls, /goals (reja/fakt), /events-log; GET/PUT /goals.

Dashboard: GET/PUT /dashboard. Notifications: list, read, WebSocket /ws.

Import/Export: upload, preview, confirm, job status, export.

Public API (API kalit + scope): deals/contacts/companies/tasks uchun CRUD, POST /public/leads (ingestion), chiquvchi webhooklar (deal.created, deal.stage_changed, contact.created, task.done, message.in) HMAC imzo va qayta urinish bilan.

## 10. Arxitektura va stek

Frontend: React 18 + TypeScript, Vite, React Router, TanStack Query + Table, Zustand, React Hook Form + Zod, Tailwind + shadcn/ui, dnd-kit, Recharts, i18next (uz/ru), react-window/virtuoso (virtualizatsiya), dayjs, Socket.IO client.

Backend: NestJS (modulli monolit), Mongoose, Passport JWT, class-validator, Socket.IO, BullMQ + Redis, Pino, Swagger, otplib (TOTP).

DB: MongoDB 7 (replica set). Fayllar: S3-mos saqlash (MinIO) yoki lokal volume (StorageService interfeysi).

Adapterlar (interfeys + implementatsiya): LeadSourceAdapter (webhook, forma, Meta mock, API), ChannelAdapter (Telegram birinchi, Instagram/WhatsApp keyin), SmsProvider (Eskiz adapteri; rasmiy hujjat bo'yicha yoziladi, taxmin qilinmaydi), TelephonyProvider (webhook + click-to-call interfeysi), StorageService, NotificationChannel.

Hodisalar: ichki event bus (deal.created, deal.stage_changed, task.done, message.in...) → events yozuvi, bildirishnoma, avtomatika dvigateli, webhooklar.

Multi-tenant: AsyncLocalStorage + global Mongoose plugin (fail closed). Yagona istisno TenantContext.runWithoutTenant().

Repo: frontend/ va backend/ (har biri mustaqil), deploy/, docs/.

## 11. Bosqichlar

Har bosqich oxirida: testlar, lint, typecheck, docs/PROGRESS.md, hisobot va to'xtash.

| # | Bosqich | Mazmun |
| --- | --- | --- |
| M0 | Audit va poydevor | Mavjud kod auditi, frontend/ va backend/ ajratish, docker-compose, CI, env |
| M1 | Auth, huquqlar | Login, refresh, foydalanuvchilar, guruhlar, rollar va huquqlar matritsasi, tenant izolyatsiyasi |
| M2 | Sozlamalar yadrosi | Voronkalar, bosqichlar, maydonlar va guruhlar, teglar, vazifa turlari, sabablar, kurslar, seed shablon ("Ta'lim markazi") |
| M3 | Kontaktlar | Kontakt va kompaniya, dublikat topish va birlashtirish |
| M4 | Bitimlar | Kanban (ko'p voronka, tezkor qo'shish, virtual scroll, position), ro'yxat, filtrlar, saqlangan filtrlar, ommaviy amallar, yutildi/yo'qotildi |
| M5 | Bitim kartochkasi | 3 ustunli karta, lenta, izoh, mention, fayl, majburiy maydonlar, vazifa ogohlantirishi |
| M6 | Vazifalar va bildirishnomalar | Vazifalar, kalendar, taskState nuqtasi, real vaqt bildirishnomalar |
| M7 | Kirish kanallari | Tahlil qilinmagan, ingestion API, formalar, mock/Meta adapter, avtoteglash, taqsimlash, import/eksport |
| M8 | Digital Pipeline | Avtomatika dvigateli va UI (P0 amallar) |
| M9 | Tahlil va Ish stoli | Hisobotlar, maqsadlar (reja), vidjetli dashboard |
| M10 | Suhbatlar | Inbox, Telegram kanali, shablonlar |
| M11 | Salesbot | Vizual senariy muharriri va ijrochi |
| M12 | Vidjetlar | Vidjet paneli, SMS (Eskiz), telefoniya interfeysi va qo'ng'iroq jurnali |
| M13 | API va xavfsizlik | Public API, webhooklar, axlat, audit, 2FA |
| M14 | Sayqal | Mavzular, zich rejim, responsiv, ru tili, a11y, 50 000 bitim unumdorligi |
| M15 | Deploy va topshirish | Production compose, HTTPS, backup, hujjatlar, handover |

## 12. Nofunksional talablar

API p95 < 400 ms; kanban ustuni 30 tadan lazy load; 50 000 bitimda kanban < 2 s, tahlil < 2 s. Xavfsizlik: JWT xotirada, refresh httpOnly cookie, rotatsiya, rate limit, Helmet, CORS ro'yxati, DTO whitelist, NoSQL injection himoyasi, kanal sirlari shifrlangan, logda telefon maskalanadi. Test: unit, e2e (izolyatsiya va huquqlar majburiy), Playwright (asosiy oqimlar). Kod: TypeScript strict, ESLint, Prettier, Conventional Commits.

## 13. Qabul mezonlari (asosiy ssenariylar)

Meta mock'dan lid kelishi → Tahlil qilinmaganga tushadi, robot filial/manba tegini qo'yadi → operator qabul qiladi → bitim tanlangan voronkada paydo bo'ladi, lentada barcha hodisa ko'rinadi.

Bir xil telefon: yangi kontakt yaratilmaydi, mavjud kontaktga ulanadi; dublikatlarni birlashtirish ishlaydi.

Kanbanda lid siljitiladi → qayta yuklagandan keyin tartib saqlanadi, faqat ko'chirilgan bitimning position i yoziladi.

Bosqichga trigger: "Ertaga keladi" bosqichiga o'tganda vazifa yaratiladi va SMS yuboriladi (mock provayder); ikkinchi marta o'tkazilsa takrorlanmaydi.

after_time_in_stage trigger: bosqichda belgilangan vaqt turganda ishga tushadi; chiqib ketsa bekor bo'ladi.

Vazifasiz bitimda kulrang/sariq nuqta; vazifa qo'shilsa yashil; muddati o'tsa qizil.

Majburiy maydon to'lmagan bitim bosqichga o'tmaydi, xato qaysi maydon ekanini ko'rsatadi.

Rol cheklovi: operator faqat o'z guruhi/voronkasi bitimlarini ko'radi; ruxsatsiz resurs 404; maydon darajasidagi yashirish ishlaydi.

Telegram xabari suhbatga tushadi, bitimga bog'lanadi, operator javob beradi, Salesbot savol so'raydi va javobni maydonga yozadi.

Tahlil raqamlari seed ma'lumotidan qo'lda hisoblangan natijaga mos; reja/fakt to'g'ri.

Tenant izolyatsiyasi: B workspace foydalanuvchisi A ning hech qaysi resursini ola olmaydi (barcha modullar uchun e2e).

Bitta ustunda 5 000 bitim bilan kanban qotmaydi.
