alter table public.orders
add column delivery_type text
check (
  delivery_type in ('home', 'desk')
);

===================================

create or replace function public.create_order_transaction(
  p_order jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$

declare

  new_order_id uuid;

  new_order_number bigint;

  item jsonb;

begin


  insert into public.orders
  (
    customer_name,
    phone,
    wilaya,
    address,
    notes,
    delivery_type,
    subtotal,
    delivery_fee,
    total
  )

  values
  (
    p_order->>'full_name',
    p_order->>'phone',
    p_order->>'wilaya',
    p_order->>'address',
    p_order->>'notes',
    p_order->>'delivery_type',

    (p_order->>'subtotal')::integer,

    (p_order->>'delivery_fee')::integer,

    (p_order->>'total')::integer
  )

  returning
    id,
    order_number

  into
    new_order_id,
    new_order_number;



  for item in
    select *
    from jsonb_array_elements(p_items)

  loop


    insert into public.order_items
    (
      order_id,
      product_id,
      product_name,
      unit_price,
      quantity,
      size,
      color
    )

    values
    (
      new_order_id,

      (item->>'productId')::uuid,

      item->>'productName',

      (item->>'price')::integer,

      (item->>'quantity')::integer,

      item->>'size',

      item->>'color'
    );



    update public.products

    set stock =
      stock -
      (item->>'quantity')::integer

    where id =
      (item->>'productId')::uuid;


  end loop;



  return jsonb_build_object(
    'order_number',
    new_order_number
  );


end;

$$;