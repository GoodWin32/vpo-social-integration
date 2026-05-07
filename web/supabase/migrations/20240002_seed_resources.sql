-- ============================================================
-- Seed: Resource categories + sample VPO resources
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Categories
insert into resource_categories (id, name, slug, icon) values
  (gen_random_uuid(), 'Соціальна допомога',       'social',    '🤝'),
  (gen_random_uuid(), 'Житло',                    'housing',   '🏠'),
  (gen_random_uuid(), 'Юридична допомога',         'legal',     '⚖️'),
  (gen_random_uuid(), 'Психологічна підтримка',    'psychology','🧠'),
  (gen_random_uuid(), 'Медична допомога',          'medical',   '🏥'),
  (gen_random_uuid(), 'Освіта та навчання',        'education', '📚'),
  (gen_random_uuid(), 'Працевлаштування',          'work',      '💼'),
  (gen_random_uuid(), 'Допомога дітям',            'children',  '👶')
on conflict (slug) do nothing;

-- 2. Resources (використовуємо підзапит для category_id)
insert into resources (title, description, category_id, contact_phone, contact_email, website_url, address, city, region, is_verified) values

-- Соціальна допомога
(
  'Гаряча лінія з питань ВПО',
  'Безкоштовна інформаційна лінія для внутрішньо переміщених осіб. Консультації щодо виплат, документів, реєстрації та соціальних послуг.',
  (select id from resource_categories where slug = 'social'),
  '0800-50-17-01', 'vpo@mlsp.gov.ua', 'https://www.msp.gov.ua', null, null, null, true
),
(
  'Програма грошової допомоги ВПО (ООН)',
  'Програма УВКБ ООН надає одноразову грошову допомогу найбільш вразливим ВПО. Подача заявок онлайн або через партнерські організації.',
  (select id from resource_categories where slug = 'social'),
  null, 'ukraine@unhcr.org', 'https://www.unhcr.org/ua', null, null, null, true
),
(
  'Червоний Хрест України — допомога ВПО',
  'Гуманітарна допомога, продуктові набори, базові речі першої необхідності для переселенців по всій Україні.',
  (select id from resource_categories where slug = 'social'),
  '0800-331-800', 'info@redcross.org.ua', 'https://redcross.org.ua', 'вул. Пушкіна, 30', 'Київ', 'м. Київ', true
),

-- Житло
(
  'Реєстр тимчасового житла для ВПО',
  'Державна платформа для пошуку тимчасового безкоштовного або пільгового житла для переселенців у всіх регіонах України.',
  (select id from resource_categories where slug = 'housing'),
  '1547', null, 'https://www.diia.gov.ua', null, null, null, true
),
(
  'Habitat for Humanity Україна',
  'Організація допомагає ВПО з ремонтом житла, пошуком оренди та консультаціями з житлових питань.',
  (select id from resource_categories where slug = 'housing'),
  '044-390-06-60', 'ukraine@habitat.org', 'https://www.habitat.org.ua', 'вул. Хрещатик, 15', 'Київ', 'м. Київ', true
),
(
  'Програма оренди житла "Прихисток"',
  'Субсидування оренди житла для ВПО від Міністерства розвитку громад. Компенсація до 6 000 грн/місяць залежно від регіону.',
  (select id from resource_categories where slug = 'housing'),
  '1547', null, 'https://pryhystok.gov.ua', null, null, null, true
),

-- Юридична допомога
(
  'Безоплатна правова допомога (БПД)',
  'Мережа центрів безоплатної правової допомоги по всій Україні. Консультації юристів щодо документів, майна, реєстрації ВПО.',
  (select id from resource_categories where slug = 'legal'),
  '0800-213-103', 'info@legalaid.gov.ua', 'https://legalaid.gov.ua', null, null, null, true
),
(
  'Ukrainian Legal Aid Foundation',
  'Онлайн-консультації з юридичних питань для ВПО: відновлення документів, захист прав власності, трудові спори.',
  (select id from resource_categories where slug = 'legal'),
  '044-221-85-15', 'ask@ulaf.org.ua', 'https://ulaf.org.ua', 'вул. Велика Васильківська, 72', 'Київ', 'м. Київ', false
),

-- Психологічна підтримка
(
  'Телефон довіри "Lifeline Ukraine"',
  'Цілодобова безкоштовна лінія психологічної підтримки для всіх, хто переживає кризу. Підтримка людей в складних емоційних ситуаціях.',
  (select id from resource_categories where slug = 'psychology'),
  '7333', null, 'https://www.lifelineukraine.com', null, null, null, true
),
(
  'МОМ — психосоціальна підтримка ВПО',
  'Безкоштовні групові та індивідуальні сесії психологічної підтримки для переселенців від Міжнародної організації з міграції.',
  (select id from resource_categories where slug = 'psychology'),
  '044-568-50-15', 'iomkyiv@iom.int', 'https://ukraine.iom.int', 'вул. Михайлівська, 8', 'Київ', 'м. Київ', true
),
(
  'Простір психологічної підтримки "ВДОМА"',
  'Групи підтримки, арт-терапія та індивідуальні консультації психолога для ВПО та їхніх сімей. Прийом безкоштовно.',
  (select id from resource_categories where slug = 'psychology'),
  '050-123-45-67', 'vdoma.support@gmail.com', null, 'вул. Саксаганського, 44', 'Київ', 'м. Київ', false
),

-- Медична допомога
(
  'Медична допомога ВПО — ЦНАПи',
  'Переселенці мають право на безкоштовну медичну допомогу в закладах первинної медицини за місцем тимчасового проживання.',
  (select id from resource_categories where slug = 'medical'),
  '16', null, 'https://www.moz.gov.ua', null, null, null, true
),
(
  'Лікарі без кордонів (MSF) — Україна',
  'Безкоштовна медична допомога, включаючи ментальне здоров''я, для постраждалого населення в різних регіонах України.',
  (select id from resource_categories where slug = 'medical'),
  null, 'ukraine-oc@amsterdam.msf.org', 'https://www.msf.org.ua', null, null, null, true
),

-- Освіта
(
  'Навчання онлайн для ВПО — Дія.Освіта',
  'Безкоштовні онлайн-курси для дорослих переселенців: IT, мови, soft skills, підприємництво. Понад 200 курсів.',
  (select id from resource_categories where slug = 'education'),
  null, null, 'https://osvita.diia.gov.ua', null, null, null, true
),
(
  'Безкоштовні курси для ВПО від Prometheus',
  'Онлайн-платформа з сотнями безкоштовних курсів для перекваліфікації та підвищення кваліфікації переселенців.',
  (select id from resource_categories where slug = 'education'),
  null, 'info@prometheus.org.ua', 'https://prometheus.org.ua', null, null, null, true
),

-- Працевлаштування
(
  'Портал вакансій — Державна служба зайнятості',
  'Офіційний портал вакансій для внутрішньо переміщених осіб. Понад 50 000 актуальних вакансій по всій Україні.',
  (select id from resource_categories where slug = 'work'),
  '0800-42-17-17', null, 'https://www.dcz.gov.ua', null, null, null, true
),
(
  'ПРООН — підтримка зайнятості ВПО',
  'Програма грантів та підтримки малого бізнесу для переселенців. Навчання підприємництву та стартап-підтримка.',
  (select id from resource_categories where slug = 'work'),
  '044-253-93-63', 'registry.ua@undp.org', 'https://www.ua.undp.org', 'вул. Кловський узвіз, 1', 'Київ', 'м. Київ', true
),

-- Допомога дітям
(
  'ЮНІСЕФ Україна — допомога дітям ВПО',
  'Програми підтримки освіти, психосоціальної допомоги та базових потреб для дітей переселенців.',
  (select id from resource_categories where slug = 'children'),
  '044-254-27-51', 'kyiv@unicef.org', 'https://www.unicef.org/ukraine', 'вул. Кловський узвіз, 1', 'Київ', 'м. Київ', true
),
(
  'Save the Children — програми для дітей',
  'Освітня підтримка, безпечні простори та психосоціальна допомога для дітей, що постраждали від конфлікту.',
  (select id from resource_categories where slug = 'children'),
  null, 'ukraine@savethechildren.org', 'https://www.savethechildren.net/where-we-work/ukraine', null, null, null, true
);
