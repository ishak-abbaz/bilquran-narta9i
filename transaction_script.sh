4. SQL RPC transaction
Run this in:
Supabase Dashboard → SQL Editor → New query

create or replace function create_order_transaction(
  p_order jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
as $$

declare

  new_order_id uuid;

  new_order_number text;

  item jsonb;

begin


  new_order_number :=
    'DZ-' ||
    to_char(
      now(),
      'YYYYMMDD'
    ) ||
    '-' ||
    floor(
      random()*9000+1000
    );


  insert into orders
  (
    order_number,
    full_name,
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
    new_order_number,
    p_order->>'full_name',
    p_order->>'phone',
    p_order->>'wilaya',
    p_order->>'address',
    p_order->>'notes',
    p_order->>'delivery_type',
    (p_order->>'subtotal')::numeric,
    (p_order->>'delivery_fee')::numeric,
    (p_order->>'total')::numeric
  )

  returning id
  into new_order_id;



  for item in
    select *
    from jsonb_array_elements(p_items)

  loop


    insert into order_items
    (
      order_id,
      product_id,
      quantity,
      price,
      size,
      color
    )

    values

    (
      new_order_id,
      (item->>'productId')::uuid,
      (item->>'quantity')::integer,
      (item->>'price')::numeric,
      item->>'size',
      item->>'color'
    );



    update products

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


exception

when others then

  raise;

end;

$$;