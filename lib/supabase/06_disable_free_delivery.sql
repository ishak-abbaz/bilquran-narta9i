-- =========================================================
-- Disable free delivery completely
--
-- Delivery is ALWAYS charged according to:
-- delivery_prices.home_price
-- or
-- delivery_prices.desk_price
-- =========================================================


-- Keep the old column for backwards compatibility,
-- but disable any configured threshold.
update public.settings
set free_delivery_threshold = null
where id = 1;


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

  v_subtotal integer;
  v_total integer;

  v_order_id uuid;
  v_order_number bigint;
begin

  if
    p_quantity is null
    or p_quantity <= 0
  then
    raise exception 'BAD_QUANTITY';
  end if;


  if
    p_delivery_type is null
    or p_delivery_type not in (
      'home',
      'desk'
    )
  then
    raise exception 'BAD_WILAYA';
  end if;


  /*
   * Lock the book before checking stock.
   * This prevents two customers from
   * buying the same final copy.
   */
  select *
  into v_product
  from public.products
  where id = p_product_id
  for update;


  if not found then
    raise exception 'NOT_FOUND';
  end if;


  if
    v_product.is_active
    is not true
  then
    raise exception 'INACTIVE';
  end if;


  if
    v_product.stock <
    p_quantity
  then
    raise exception 'NO_STOCK';
  end if;


  /*
   * The delivery fee always comes directly
   * from delivery_prices.
   *
   * There is NO free-delivery threshold.
   */
  select
    dp.wilaya_name,
    case p_delivery_type
      when 'home'
        then dp.home_price
      when 'desk'
        then dp.desk_price
    end
  into
    v_wilaya_name,
    v_delivery_fee
  from public.delivery_prices
    as dp
  where
    dp.wilaya_code =
    p_wilaya_code;


  if not found then
    raise exception 'BAD_WILAYA';
  end if;


  v_subtotal :=
    v_product.price *
    p_quantity;


  v_total :=
    v_subtotal +
    v_delivery_fee;


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
    trim(
      p_customer_name
    ),
    trim(
      p_phone
    ),
    v_wilaya_name,
    p_delivery_type,
    p_address,
    nullif(
      trim(
        p_notes
      ),
      ''
    ),
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


  update public.products
  set
    stock =
      stock -
      p_quantity
  where
    id =
      v_product.id;


  return jsonb_build_object(
    'order_number',
    v_order_number
  );

end;
$$;


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
from public, anon, authenticated;


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


notify pgrst, 'reload schema';