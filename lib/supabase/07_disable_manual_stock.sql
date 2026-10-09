-- =========================================================
-- Hide manual stock management
--
-- The application still keeps products.stock internally
-- because existing order/status SQL uses it.
-- Admins no longer edit or see it in the normal UI.
-- =========================================================


-- Existing books become effectively always available.
update public.products
set stock = 1000000;


-- Future inserts that do not explicitly provide stock
-- will also be effectively always available.
alter table public.products
alter column stock
set default 1000000;


notify pgrst, 'reload schema';