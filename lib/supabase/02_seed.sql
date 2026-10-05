-- =========================================================
-- Quran books store seed
-- Run after 01_schema.sql
-- =========================================================


-- =========================================================
-- Categories
-- =========================================================

insert into public.categories (
  name,
  slug,
  image_url,
  sort_order
)
values
(
  'مصاحف',
  'mushafs',
  null,
  1
),
(
  'تفسير القرآن',
  'tafsir',
  null,
  2
),
(
  'كتب الأطفال',
  'children-books',
  null,
  3
),
(
  'أدعية وأذكار',
  'dua-adhkar',
  null,
  4
),
(
  'كتب الفقه والسيرة',
  'fiqh-sirah',
  null,
  5
);


-- =========================================================
-- Products
-- Images remain empty until uploaded through the admin.
-- Publisher values are placeholders.
-- =========================================================

insert into public.products (
  name,
  slug,
  description,
  publisher,
  riwaya,
  price,
  category_id,
  images,
  stock,
  is_featured,
  is_active
)
values

-- 1
(
  'مصحف المدينة النبوية',
  'mushaf-madina',
  'مصحف بطباعة واضحة وتنسيق مريح للقراءة اليومية.',
  'اسم الناشر',
  'حفص عن عاصم',
  1800,
  (
    select id
    from public.categories
    where slug = 'mushafs'
  ),
  array[]::text[],
  40,
  true,
  true
),

-- 2
(
  'مصحف التجويد الملون',
  'mushaf-tajweed-color',
  'مصحف منظم بعلامات لونية مساعدة مع طباعة واضحة وجودة جيدة.',
  'اسم الناشر',
  'حفص عن عاصم',
  2500,
  (
    select id
    from public.categories
    where slug = 'mushafs'
  ),
  array[]::text[],
  30,
  true,
  true
),

-- 3
(
  'مصحف برواية ورش',
  'mushaf-warsh',
  'مصحف برواية ورش بطباعة عربية واضحة وتجليد مناسب للاستعمال اليومي.',
  'اسم الناشر',
  'ورش عن نافع',
  2200,
  (
    select id
    from public.categories
    where slug = 'mushafs'
  ),
  array[]::text[],
  25,
  true,
  true
),

-- 4
(
  'مصحف فاخر بغلاف جلدي',
  'luxury-leather-mushaf',
  'مصحف بتجليد فاخر وغلاف متين مناسب للاقتناء أو الإهداء.',
  'اسم الناشر',
  'حفص عن عاصم',
  4800,
  (
    select id
    from public.categories
    where slug = 'mushafs'
  ),
  array[]::text[],
  15,
  false,
  true
),

-- 5
(
  'التفسير الميسر',
  'tafsir-muyassar',
  'كتاب تفسير مرتب بأسلوب ميسر ومناسب للقراءة والمراجعة.',
  'اسم الناشر',
  null,
  3000,
  (
    select id
    from public.categories
    where slug = 'tafsir'
  ),
  array[]::text[],
  20,
  true,
  true
),

-- 6
(
  'مختصر تفسير القرآن الكريم',
  'concise-quran-tafsir',
  'كتاب مختصر يقدم مادة تفسيرية منظمة في طبعة عملية.',
  'اسم الناشر',
  null,
  2200,
  (
    select id
    from public.categories
    where slug = 'tafsir'
  ),
  array[]::text[],
  18,
  false,
  true
),

-- 7
(
  'قصص الأنبياء للأطفال',
  'prophets-stories-children',
  'كتاب مبسط للأطفال يقدم القصص بأسلوب تعليمي مناسب للناشئة.',
  'اسم الناشر',
  null,
  1200,
  (
    select id
    from public.categories
    where slug = 'children-books'
  ),
  array[]::text[],
  35,
  true,
  true
),

-- 8
(
  'مبادئ العبادات للأطفال',
  'worship-basics-children',
  'كتاب تعليمي مبسط يساعد الأطفال على التعرف على مبادئ العبادات.',
  'اسم الناشر',
  null,
  900,
  (
    select id
    from public.categories
    where slug = 'children-books'
  ),
  array[]::text[],
  30,
  false,
  true
),

-- 9
(
  'كتاب الأدعية والأذكار اليومية',
  'daily-dua-adhkar',
  'كتاب عملي صغير الحجم يجمع موضوعات الأدعية والأذكار للاستخدام اليومي.',
  'اسم الناشر',
  null,
  700,
  (
    select id
    from public.categories
    where slug = 'dua-adhkar'
  ),
  array[]::text[],
  45,
  false,
  true
),

-- 10
(
  'مختارات من الأدعية والأذكار',
  'selected-dua-adhkar',
  'كتاب مرتب في أبواب واضحة ومناسب للحمل والقراءة اليومية.',
  'اسم الناشر',
  null,
  500,
  (
    select id
    from public.categories
    where slug = 'dua-adhkar'
  ),
  array[]::text[],
  50,
  false,
  true
),

-- 11
(
  'مبادئ الفقه للمبتدئين',
  'fiqh-basics-beginners',
  'مدخل مبسط ومنظم إلى موضوعات الفقه الأساسية للمبتدئين.',
  'اسم الناشر',
  null,
  1500,
  (
    select id
    from public.categories
    where slug = 'fiqh-sirah'
  ),
  array[]::text[],
  24,
  true,
  true
),

-- 12
(
  'السيرة النبوية الميسرة',
  'simplified-seerah',
  'كتاب يعرض موضوعات السيرة النبوية بأسلوب مرتب وميسر للقارئ.',
  'اسم الناشر',
  null,
  1800,
  (
    select id
    from public.categories
    where slug = 'fiqh-sirah'
  ),
  array[]::text[],
  22,
  false,
  true
);


-- =========================================================
-- Default store settings
-- Replace placeholders from the admin panel later.
-- =========================================================

insert into public.settings (
  store_name,
  phone,
  email,
  instagram,
  address,
  free_delivery_threshold
)
values (
  '[YOUR STORE NAME]',
  '0550000000',
  'contact@example.com',
  '@store_name',
  'الجزائر',
  5000
)
on conflict (id) do nothing;


-- =========================================================
-- Delivery prices
-- 58-wilaya dataset requested for this project.
-- Prices remain editable from the admin.
-- =========================================================

insert into public.delivery_prices (
  wilaya_code,
  wilaya_name,
  home_price,
  desk_price
)
values
(1,  'أدرار',           1000, 700),
(2,  'الشلف',            700, 500),
(3,  'الأغواط',          800, 600),
(4,  'أم البواقي',       800, 600),
(5,  'باتنة',            700, 500),
(6,  'بجاية',            700, 500),
(7,  'بسكرة',            800, 600),
(8,  'بشار',            1000, 700),
(9,  'البليدة',          600, 400),
(10, 'البويرة',          700, 500),
(11, 'تمنراست',         1000, 700),
(12, 'تبسة',             800, 600),
(13, 'تلمسان',           700, 500),
(14, 'تيارت',            800, 600),
(15, 'تيزي وزو',         700, 500),
(16, 'الجزائر',          600, 400),
(17, 'الجلفة',           800, 600),
(18, 'جيجل',             700, 500),
(19, 'سطيف',             700, 500),
(20, 'سعيدة',            800, 600),
(21, 'سكيكدة',           700, 500),
(22, 'سيدي بلعباس',      700, 500),
(23, 'عنابة',            700, 500),
(24, 'قالمة',            700, 500),
(25, 'قسنطينة',          700, 500),
(26, 'المدية',           700, 500),
(27, 'مستغانم',          700, 500),
(28, 'المسيلة',          800, 600),
(29, 'معسكر',            700, 500),
(30, 'ورقلة',            900, 600),
(31, 'وهران',            600, 400),
(32, 'البيض',            900, 700),
(33, 'إليزي',           1000, 700),
(34, 'برج بوعريريج',     700, 500),
(35, 'بومرداس',          600, 400),
(36, 'الطارف',           800, 600),
(37, 'تندوف',           1000, 700),
(38, 'تيسمسيلت',         800, 600),
(39, 'الوادي',           900, 600),
(40, 'خنشلة',            800, 600),
(41, 'سوق أهراس',        800, 600),
(42, 'تيبازة',           600, 400),
(43, 'ميلة',             700, 500),
(44, 'عين الدفلى',       700, 500),
(45, 'النعامة',          900, 700),
(46, 'عين تموشنت',       700, 500),
(47, 'غرداية',           900, 600),
(48, 'غليزان',           700, 500),
(49, 'تيميمون',          900, 600),
(50, 'برج باجي مختار',  1000, 700),
(51, 'أولاد جلال',       900, 600),
(52, 'بني عباس',        1000, 700),
(53, 'عين صالح',        1000, 700),
(54, 'عين قزام',        1000, 700),
(55, 'تقرت',             900, 600),
(56, 'جانت',            1000, 700),
(57, 'المغير',           900, 600),
(58, 'المنيعة',          900, 600)
on conflict (wilaya_code) do nothing;