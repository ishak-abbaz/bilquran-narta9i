-- not runned
-- =========================================================
-- Permanently delete an order safely
--
-- pending / confirmed / shipped:
--   restore reserved stock, then delete
--
-- cancelled:
--   stock was already restored when cancelled
--
-- delivered:
--   do NOT restore stock because the sale was completed
--
-- order_items are deleted automatically through
-- ON DELETE CASCADE.
-- =========================================================

create or replace function public.delete_order_atomic(
  p_order_id uuid
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_status text;
  v_order_number bigint;
begin
  if not public.is_admin() then
    raise exception 'UNAUTHORIZED';
  end if;

  select
    o.status,
    o.order_number
  into
    v_status,
    v_order_number
  from public.orders as o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  /*
   * Stock was deducted when the order was created.
   *
   * If the order never reached delivered/cancelled,
   * deleting it is effectively cancelling it, so restore
   * the stock first.
   */
  if v_status in (
    'pending',
    'confirmed',
    'shipped'
  ) then
    update public.products as p
    set stock =
      p.stock +
      restored.quantity
    from (
      select
        oi.product_id,
        sum(oi.quantity)::integer
          as quantity
      from public.order_items as oi
      where oi.order_id = p_order_id
        and oi.product_id is not null
      group by oi.product_id
    ) as restored
    where p.id =
      restored.product_id;
  end if;

  /*
   * order_items are removed automatically because
   * order_items.order_id uses ON DELETE CASCADE.
   */
  delete from public.orders
  where id = p_order_id;

  return v_order_number;
end;
$$;


revoke all
on function public.delete_order_atomic(uuid)
from public;

revoke all
on function public.delete_order_atomic(uuid)
from anon;

grant execute
on function public.delete_order_atomic(uuid)
to authenticated;


notify pgrst, 'reload schema';