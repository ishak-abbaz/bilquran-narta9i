-- ==========================================
-- Seed categories
-- ==========================================

insert into public.categories (name, slug, image_url, sort_order)
values
('تيشرتات', 't-shirts', null, 1),
('أطقم', 'sets', null, 2),
('شورتات', 'shorts', null, 3),
('بناطيل', 'pants', null, 4);


-- ==========================================
-- Seed products
-- images kept empty until upload
-- ==========================================

insert into public.products
(name, slug, description, price, compare_at_price, category_id, images, sizes, colors, stock, is_featured)
values

(
'تيشرت كلاسيكي أبيض',
'classic-white-tshirt',
'تيشرت قطني فاخر بتصميم بسيط ومريح للاستخدام اليومي.',
2500,
3000,
(select id from categories where slug='t-shirts'),
'{}',
ARRAY['S','M','L','XL','XXL'],
ARRAY['أبيض','أسود','رمادي'],
50,
true
),

(
'تيشرت أسود ستايل عصري',
'modern-black-tshirt',
'تيشرت أسود بقصة عصرية وخامة ناعمة عالية الجودة.',
2800,
null,
(select id from categories where slug='t-shirts'),
'{}',
ARRAY['S','M','L','XL','XXL'],
ARRAY['أسود','أبيض'],
40,
true
),

(
'تيشرت أوفر سايز',
'oversize-tshirt',
'تيشرت واسع مناسب لإطلالة شبابية عصرية.',
3200,
3800,
(select id from categories where slug='t-shirts'),
'{}',
ARRAY['M','L','XL','XXL'],
ARRAY['أسود','بيج','أخضر'],
35,
false
),

(
'طقم رياضي أسود',
'black-sport-set',
'طقم رياضي مريح يتكون من تيشرت وشورت مناسب للخروج والرياضة.',
5500,
6500,
(select id from categories where slug='sets'),
'{}',
ARRAY['S','M','L','XL','XXL'],
ARRAY['أسود','رمادي'],
30,
true
),

(
'طقم كاجوال صيفي',
'summer-casual-set',
'طقم خفيف وأنيق مناسب لفصل الصيف.',
4800,
null,
(select id from categories where slug='sets'),
'{}',
ARRAY['M','L','XL'],
ARRAY['أبيض','بيج','أزرق'],
25,
false
),

(
'طقم فاخر للشباب',
'premium-young-set',
'طقم بتصميم فاخر وخامة مريحة للاستخدام اليومي.',
7500,
8500,
(select id from categories where slug='sets'),
'{}',
ARRAY['S','M','L','XL','XXL'],
ARRAY['أسود','بني'],
20,
true
),

(
'شورت قطني أسود',
'black-cotton-shorts',
'شورت قطني مريح بقصة عملية.',
1800,
2200,
(select id from categories where slug='shorts'),
'{}',
ARRAY['S','M','L','XL'],
ARRAY['أسود','رمادي'],
60,
false
),

(
'شورت كارجو',
'cargo-shorts',
'شورت كارجو بجيوب متعددة وتصميم عصري.',
3500,
4000,
(select id from categories where slug='shorts'),
'{}',
ARRAY['M','L','XL','XXL'],
ARRAY['كاكي','أسود','زيتي'],
35,
true
),

(
'شورت رياضي',
'sport-shorts',
'شورت خفيف مناسب للرياضة والنشاط اليومي.',
2200,
null,
(select id from categories where slug='shorts'),
'{}',
ARRAY['S','M','L','XL'],
ARRAY['أزرق','أسود','أبيض'],
45,
false
),

(
'بنطال جينز كلاسيكي',
'classic-jeans-pants',
'بنطال جينز بتصميم كلاسيكي وخامة قوية.',
6500,
7500,
(select id from categories where slug='pants'),
'{}',
ARRAY['S','M','L','XL','XXL'],
ARRAY['أزرق','أسود'],
30,
true
),

(
'بنطال رياضي مريح',
'comfortable-sport-pants',
'بنطال رياضي ناعم مناسب للراحة والاستخدام اليومي.',
4500,
5000,
(select id from categories where slug='pants'),
'{}',
ARRAY['M','L','XL','XXL'],
ARRAY['أسود','رمادي'],
40,
false
),

(
'بنطال كلاسيكي فاخر',
'luxury-classic-pants',
'بنطال أنيق مناسب للإطلالات الرسمية والكاجوال.',
8000,
9000,
(select id from categories where slug='pants'),
'{}',
ARRAY['S','M','L','XL','XXL'],
ARRAY['أسود','بني','كحلي'],
15,
true
);


-- ==========================================
-- Default store settings
-- ==========================================

insert into public.settings
(store_name, phone, email, instagram, address, free_delivery_threshold)
values
(
'متجر الأناقة',
'0550000000',
'contact@example.com',
'@store_name',
'الجزائر',
5000
)
on conflict (id) do nothing;


-- ==========================================
-- Delivery prices (editable placeholders)
-- ==========================================

insert into public.delivery_prices
(wilaya_code, wilaya_name, home_price, desk_price)
values
(1,'أدرار',1000,700),
(2,'الشلف',700,500),
(3,'الأغواط',800,600),
(4,'أم البواقي',800,600),
(5,'باتنة',700,500),
(6,'بجاية',700,500),
(7,'بسكرة',800,600),
(8,'بشار',1000,700),
(9,'البليدة',600,400),
(10,'البويرة',700,500),
(11,'تمنراست',1000,700),
(12,'تبسة',800,600),
(13,'تلمسان',700,500),
(14,'تيارت',800,600),
(15,'تيزي وزو',700,500),
(16,'الجزائر',600,400),
(17,'الجلفة',800,600),
(18,'جيجل',700,500),
(19,'سطيف',700,500),
(20,'سعيدة',800,600),
(21,'سكيكدة',700,500),
(22,'سيدي بلعباس',700,500),
(23,'عنابة',700,500),
(24,'قالمة',700,500),
(25,'قسنطينة',700,500),
(26,'المدية',700,500),
(27,'مستغانم',700,500),
(28,'المسيلة',800,600),
(29,'معسكر',700,500),
(30,'ورقلة',900,600),
(31,'وهران',600,400),
(32,'البيض',900,700),
(33,'إليزي',1000,700),
(34,'برج بوعريريج',700,500),
(35,'بومرداس',600,400),
(36,'الطارف',800,600),
(37,'تندوف',1000,700),
(38,'تيسمسيلت',800,600),
(39,'الوادي',900,600),
(40,'خنشلة',800,600),
(41,'سوق أهراس',800,600),
(42,'تيبازة',600,400),
(43,'ميلة',700,500),
(44,'عين الدفلى',700,500),
(45,'النعامة',900,700),
(46,'عين تموشنت',700,500),
(47,'غرداية',900,600),
(48,'غليزان',700,500),
(49,'المغير',900,600),
(50,'برج باجي مختار',1000,700),
(51,'أولاد جلال',900,600),
(52,'بني عباس',1000,700),
(53,'عين صالح',1000,700),
(54,'عين قزام',1000,700),
(55,'تقرت',900,600),
(56,'جانت',1000,700),
(57,'المغير',900,600),
(58,'المنيعة',900,600)
on conflict (wilaya_code) do nothing;