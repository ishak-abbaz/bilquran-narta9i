-- =========================================================
-- Admin sales analytics
-- Ranges:
--   24h = current hour + previous 23 hours
--   7d  = today + previous 6 days
--   30d = today + previous 29 days
--
-- Time buckets use Africa/Algiers.
-- Cancelled orders are excluded everywhere.
-- =========================================================


-- =========================================================
-- Internal range helper
-- =========================================================

create or replace function public.sales_range_start(
  p_range text
)
returns timestamptz
language plpgsql
stable
set search_path = pg_catalog, public
as $$
begin
  case p_range
    when '24h' then
      return (
        date_trunc(
          'hour',
          now() at time zone 'Africa/Algiers'
        ) - interval '23 hours'
      ) at time zone 'Africa/Algiers';

    when '7d' then
      return (
        date_trunc(
          'day',
          now() at time zone 'Africa/Algiers'
        ) - interval '6 days'
      ) at time zone 'Africa/Algiers';

    when '30d' then
      return (
        date_trunc(
          'day',
          now() at time zone 'Africa/Algiers'
        ) - interval '29 days'
      ) at time zone 'Africa/Algiers';

    else
      raise exception 'BAD_RANGE';
  end case;
end;
$$;


-- =========================================================
-- Summary cards
-- =========================================================

create or replace function public.get_admin_sales_summary(
  p_range text
)
returns table (
  revenue bigint,
  order_count bigint,
  books_sold bigint,
  average_order_value numeric
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_start timestamptz;
begin
  if not public.is_admin() then
    raise exception 'UNAUTHORIZED';
  end if;

  v_start :=
    public.sales_range_start(
      p_range
    );

  return query
  with valid_orders as (
    select
      o.id,
      coalesce(
        o.total,
        0
      )::bigint as total
    from public.orders as o
    where o.created_at >= v_start
      and o.status <> 'cancelled'
  ),
  order_stats as (
    select
      coalesce(
        sum(vo.total),
        0
      )::bigint as revenue,
      count(*)::bigint as order_count
    from valid_orders as vo
  ),
  item_stats as (
    select
      coalesce(
        sum(oi.quantity),
        0
      )::bigint as books_sold
    from public.order_items as oi
    join valid_orders as vo
      on vo.id = oi.order_id
  )
  select
    os.revenue,
    os.order_count,
    its.books_sold,
    case
      when os.order_count = 0 then 0::numeric
      else
        os.revenue::numeric /
        os.order_count::numeric
    end
  from order_stats as os
  cross join item_stats as its;
end;
$$;


-- =========================================================
-- Revenue timeline
-- Hourly for 24h, daily for 7d / 30d.
-- Empty buckets are returned as zero.
-- =========================================================

create or replace function public.get_admin_sales_timeline(
  p_range text
)
returns table (
  bucket_key text,
  bucket_label text,
  revenue bigint
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_start timestamptz;
  v_local_start timestamp;
  v_local_end timestamp;
begin
  if not public.is_admin() then
    raise exception 'UNAUTHORIZED';
  end if;

  v_start :=
    public.sales_range_start(
      p_range
    );

  if p_range = '24h' then
    v_local_start =
      v_start at time zone
        'Africa/Algiers';

    v_local_end =
      date_trunc(
        'hour',
        now() at time zone
          'Africa/Algiers'
      );

    return query
    with buckets as (
      select
        generate_series(
          v_local_start,
          v_local_end,
          interval '1 hour'
        ) as bucket
    ),
    sales as (
      select
        date_trunc(
          'hour',
          o.created_at at time zone
            'Africa/Algiers'
        ) as bucket,

        coalesce(
          sum(
            coalesce(
              o.total,
              0
            )
          ),
          0
        )::bigint as revenue
      from public.orders as o
      where o.created_at >= v_start
        and o.status <> 'cancelled'
      group by 1
    )
    select
      to_char(
        b.bucket,
        'YYYY-MM-DD HH24:MI'
      ) as bucket_key,

      to_char(
        b.bucket,
        'HH24:00'
      ) as bucket_label,

      coalesce(
        s.revenue,
        0
      )::bigint as revenue
    from buckets as b
    left join sales as s
      on s.bucket = b.bucket
    order by b.bucket;

    return;
  end if;


  v_local_start =
    v_start at time zone
      'Africa/Algiers';

  v_local_end =
    date_trunc(
      'day',
      now() at time zone
        'Africa/Algiers'
    );

  return query
  with buckets as (
    select
      generate_series(
        v_local_start,
        v_local_end,
        interval '1 day'
      ) as bucket
  ),
  sales as (
    select
      date_trunc(
        'day',
        o.created_at at time zone
          'Africa/Algiers'
      ) as bucket,

      coalesce(
        sum(
          coalesce(
            o.total,
            0
          )
        ),
        0
      )::bigint as revenue
    from public.orders as o
    where o.created_at >= v_start
      and o.status <> 'cancelled'
    group by 1
  )
  select
    to_char(
      b.bucket,
      'YYYY-MM-DD'
    ) as bucket_key,

    to_char(
      b.bucket,
      'DD/MM'
    ) as bucket_label,

    coalesce(
      s.revenue,
      0
    )::bigint as revenue
  from buckets as b
  left join sales as s
    on s.bucket = b.bucket
  order by b.bucket;
end;
$$;


-- =========================================================
-- Book performance
--
-- Revenue here is book revenue only:
-- unit_price x quantity.
-- Delivery fees are not attributed to individual books.
-- =========================================================

create or replace function public.get_admin_book_sales(
  p_range text
)
returns table (
  title text,
  quantity_sold bigint,
  revenue bigint
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_start timestamptz;
begin
  if not public.is_admin() then
    raise exception 'UNAUTHORIZED';
  end if;

  v_start :=
    public.sales_range_start(
      p_range
    );

  return query
  select
    coalesce(
      oi.product_name,
      'كتاب محذوف'
    ) as title,

    sum(
      oi.quantity
    )::bigint as quantity_sold,

    sum(
      coalesce(
        oi.unit_price,
        0
      )::bigint *
      oi.quantity::bigint
    )::bigint as revenue
  from public.order_items as oi
  join public.orders as o
    on o.id = oi.order_id
  where o.created_at >= v_start
    and o.status <> 'cancelled'
  group by
    oi.product_id,
    oi.product_name
  order by
    revenue desc,
    quantity_sold desc,
    title;
end;
$$;


-- =========================================================
-- Sales by current category
--
-- order_items does not store a historical category snapshot.
-- Deleted books or books without a category become "غير مصنف".
-- =========================================================

create or replace function public.get_admin_category_sales(
  p_range text
)
returns table (
  category_name text,
  quantity_sold bigint,
  revenue bigint
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_start timestamptz;
begin
  if not public.is_admin() then
    raise exception 'UNAUTHORIZED';
  end if;

  v_start :=
    public.sales_range_start(
      p_range
    );

  return query
  select
    coalesce(
      c.name,
      'غير مصنف'
    ) as category_name,

    sum(
      oi.quantity
    )::bigint as quantity_sold,

    sum(
      coalesce(
        oi.unit_price,
        0
      )::bigint *
      oi.quantity::bigint
    )::bigint as revenue
  from public.order_items as oi
  join public.orders as o
    on o.id = oi.order_id

  left join public.products as p
    on p.id = oi.product_id

  left join public.categories as c
    on c.id = p.category_id

  where o.created_at >= v_start
    and o.status <> 'cancelled'

  group by
    coalesce(
      c.name,
      'غير مصنف'
    )

  order by
    revenue desc,
    quantity_sold desc,
    category_name;
end;
$$;


-- =========================================================
-- Permissions
-- The UI calls these with the authenticated admin session.
-- Each function additionally checks public.is_admin().
-- =========================================================

revoke all
on function public.sales_range_start(text)
from PUBLIC, anon, authenticated;


revoke all
on function public.get_admin_sales_summary(text)
from PUBLIC, anon;

revoke all
on function public.get_admin_sales_timeline(text)
from PUBLIC, anon;

revoke all
on function public.get_admin_book_sales(text)
from PUBLIC, anon;

revoke all
on function public.get_admin_category_sales(text)
from PUBLIC, anon;


grant execute
on function public.get_admin_sales_summary(text)
to authenticated;

grant execute
on function public.get_admin_sales_timeline(text)
to authenticated;

grant execute
on function public.get_admin_book_sales(text)
to authenticated;

grant execute
on function public.get_admin_category_sales(text)
to authenticated;


notify pgrst, 'reload schema';