-- =========================================================
-- Atomic admin order status changes
-- Run after the main schema and order function.
-- =========================================================

create or replace function public.update_order_status_atomic(
  p_order_id uuid,
  p_new_status text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_old_status text;

  v_item record;

  v_current_stock integer;
begin
  -- Defense in depth.
  -- The Server Action also calls requireAdmin().
  if not public.is_admin() then
    raise exception 'UNAUTHORIZED';
  end if;


  if p_new_status not in (
    'pending',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled'
  ) then
    raise exception 'BAD_STATUS';
  end if;


  -- Lock the order so two status changes cannot
  -- process its stock at the same time.
  select status
  into v_old_status
  from public.orders
  where id = p_order_id
  for update;


  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;


  -- No work is needed when the status did not change.
  if v_old_status = p_new_status then
    return;
  end if;


  -- =======================================================
  -- Active order -> cancelled
  -- Restore its reserved stock.
  -- =======================================================

  if v_old_status <> 'cancelled'
     and p_new_status = 'cancelled' then

    for v_item in
      select
        product_id,
        sum(quantity)::integer as quantity
      from public.order_items
      where order_id = p_order_id
        and product_id is not null
      group by product_id
      order by product_id
    loop
      update public.products
      set stock =
        stock + v_item.quantity
      where id =
        v_item.product_id;
    end loop;


  -- =======================================================
  -- Cancelled order -> active status
  -- Reserve the stock again.
  -- =======================================================

  elsif v_old_status = 'cancelled'
        and p_new_status <> 'cancelled' then

    -- If the original product was deleted, its FK may
    -- already be NULL, so the order cannot be reactivated.
    if exists (
      select 1
      from public.order_items
      where order_id = p_order_id
        and product_id is null
    ) then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;


    for v_item in
      select
        product_id,
        sum(quantity)::integer as quantity
      from public.order_items
      where order_id = p_order_id
        and product_id is not null
      group by product_id
      order by product_id
    loop
      -- Lock each product before checking its stock.
      select stock
      into v_current_stock
      from public.products
      where id =
        v_item.product_id
      for update;


      if not found then
        raise exception 'PRODUCT_NOT_FOUND';
      end if;


      if v_current_stock <
         v_item.quantity then
        raise exception 'NO_STOCK';
      end if;


      update public.products
      set stock =
        stock - v_item.quantity
      where id =
        v_item.product_id;
    end loop;
  end if;


  -- Only reached if every stock operation succeeded.
  update public.orders
  set status = p_new_status
  where id = p_order_id;
end;
$$;


-- =========================================================
-- Permissions
-- =========================================================

revoke all
on function public.update_order_status_atomic(
  uuid,
  text
)
from PUBLIC, anon;


grant execute
on function public.update_order_status_atomic(
  uuid,
  text
)
to authenticated;


-- Refresh the Supabase REST schema cache.
notify pgrst, 'reload schema';