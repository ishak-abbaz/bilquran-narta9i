-- =========================================================
-- Atomic single-book order function
-- Run after 01_schema.sql and 02_seed.sql
-- =========================================================


-- Remove the old clothing/cart transaction function if present.
drop function if exists public.create_order_transaction(
  jsonb,
  jsonb
);


create or replace function public.create_book_order(
  p_product_id uuid,
  p_quantity integer,
  p_customer_name text,
  p_phone text,
  p_wilaya_code integer,
  p_delivery_type text,
  p_address text,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_product public.products%rowtype;

  v_wilaya_name text;
  v_delivery_fee integer;

  v_free_delivery_threshold integer;

  v_subtotal integer;
  v_total integer;

  v_order_id uuid;
  v_order_number bigint;
begin

  -- Quantity must always be positive.
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'BAD_QUANTITY';
  end if;


  -- Only the two supported delivery methods are accepted.
  -- BAD_WILAYA is used because the API exposes only
  -- the five requested error messages.
  if p_delivery_type is null
     or p_delivery_type not in ('home', 'desk') then
    raise exception 'BAD_WILAYA';
  end if;


  -- Lock the product row until this transaction finishes.
  select *
  into v_product
  from public.products
  where id = p_product_id
  for update;


  if not found then
    raise exception 'NOT_FOUND';
  end if;


  if v_product.is_active is not true then
    raise exception 'INACTIVE';
  end if;


  if v_product.stock < p_quantity then
    raise exception 'NO_STOCK';
  end if;


  -- Read both the wilaya NAME and the correct server-side
  -- delivery price from the delivery table.
  select
    dp.wilaya_name,
    case p_delivery_type
      when 'home' then dp.home_price
      when 'desk' then dp.desk_price
    end
  into
    v_wilaya_name,
    v_delivery_fee
  from public.delivery_prices as dp
  where dp.wilaya_code = p_wilaya_code;


  if not found then
    raise exception 'BAD_WILAYA';
  end if;


  -- Product price always comes from the locked DB row.
  v_subtotal :=
    v_product.price * p_quantity;


  -- The settings row is optional.
  select s.free_delivery_threshold
  into v_free_delivery_threshold
  from public.settings as s
  where s.id = 1;


  -- Apply free delivery only when a threshold is configured.
  if v_free_delivery_threshold is not null
     and v_subtotal >= v_free_delivery_threshold then
    v_delivery_fee := 0;
  end if;


  v_total :=
    v_subtotal + v_delivery_fee;


  -- Create the order.
  -- wilaya contains the NAME, not the numeric code.
  insert into public.orders (
    customer_name,
    phone,
    wilaya,
    delivery_type,
    address,
    notes,
    status,
    subtotal,
    delivery_fee,
    total
  )
  values (
    p_customer_name,
    p_phone,
    v_wilaya_name,
    p_delivery_type,
    p_address,
    nullif(trim(p_notes), ''),
    'pending',
    v_subtotal,
    v_delivery_fee,
    v_total
  )
  returning
    id,
    order_number
  into
    v_order_id,
    v_order_number;


  -- One order contains exactly one book item.
  insert into public.order_items (
    order_id,
    product_id,
    product_name,
    unit_price,
    quantity
  )
  values (
    v_order_id,
    v_product.id,
    v_product.name,
    v_product.price,
    p_quantity
  );


  -- Safe because the product row is still locked.
  update public.products
  set stock = stock - p_quantity
  where id = v_product.id;


  return jsonb_build_object(
    'order_number',
    v_order_number
  );

end;
$$;


-- =========================================================
-- Function permissions
-- Only trusted server-side service_role may execute it.
-- =========================================================

revoke all
on function public.create_book_order(
  uuid,
  integer,
  text,
  text,
  integer,
  text,
  text,
  text
)
from PUBLIC, anon, authenticated;


grant execute
on function public.create_book_order(
  uuid,
  integer,
  text,
  text,
  integer,
  text,
  text,
  text
)
to service_role;