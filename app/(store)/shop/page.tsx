import ProductCard from "@/components/product-card";
import {
  getCategories,
  getProducts,
} from "@/lib/data/products";


type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
  }>;
};


const sortOptions = [
  {
    label: "الأحدث",
    value: "newest",
  },
  {
    label: "السعر: من الأقل",
    value: "price-asc",
  },
  {
    label: "السعر: من الأعلى",
    value: "price-desc",
  },
];


export default async function ShopPage({
  searchParams,
}: ShopPageProps) {


  const params = await searchParams;


  const category =
    params.category || undefined;


  const sort =
    params.sort === "price-asc" ||
    params.sort === "price-desc"
      ? params.sort
      : "newest";


  const [
    categories,
    products,
  ] = await Promise.all([
    getCategories(),
    getProducts({
      category,
      sort: sort as
        | "newest"
        | "price-asc"
        | "price-desc",
    }),
  ]);



  return (

    <main
      dir="rtl"
      className="
        mx-auto
        max-w-7xl
        px-4
        py-12
        sm:px-6
        lg:px-8
      "
    >


      <section
        className="
          mx-auto
          mb-10
          max-w-2xl
          rounded-2xl
          border
          bg-background
          p-8
          text-center
        "
      >

        <p
          className="
            mb-2
            text-xs
            tracking-[0.3em]
            text-muted-foreground
          "
        >
          مجموعة مختارة
        </p>


        <h1
          className="
            text-3xl
            font-bold
          "
        >
          المتجر
        </h1>


        <p
          className="
            mt-3
            text-sm
            text-muted-foreground
          "
        >
          اكتشف أحدث تشكيلات الملابس
        </p>


      </section>





      <section className="mb-8 space-y-5">


        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
          "
        >


          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >

            <a
              href="/shop"
              className={`
                rounded-full
                border
                px-4
                py-2
                text-sm
                ${
                  !category
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-muted"
                }
              `}
            >
              الكل
            </a>


            {categories.map((item) => (

              <a
                key={item.id}
                href={`/shop?category=${item.slug}`}
                className={`
                  rounded-full
                  border
                  px-4
                  py-2
                  text-sm
                  ${
                    category === item.slug
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-muted"
                  }
                `}
              >
                {item.name}
              </a>

            ))}


          </div>





          <form
            method="GET"
            className="
              flex
              items-center
              gap-2
            "
          >


            {category && (

              <input
                type="hidden"
                name="category"
                value={category}
              />

            )}



            <select
              name="sort"
              defaultValue={sort}
              className="
                rounded-full
                border
                bg-background
                px-4
                py-2
                text-sm
              "
            >

              {sortOptions.map((option)=>(

                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>

              ))}

            </select>



            <button
              type="submit"
              className="
                rounded-full
                border
                px-4
                py-2
                text-sm
              "
            >
              تطبيق
            </button>


          </form>


        </div>



        <p
          className="
            text-sm
            text-muted-foreground
          "
        >
          {products.length} منتج
        </p>


      </section>






      {products.length === 0 ? (

        <section
          className="
            rounded-2xl
            border
            py-20
            text-center
          "
        >

          <h2
            className="
              text-xl
              font-semibold
            "
          >
            لا توجد منتجات
          </h2>


          <p className="mt-2 text-muted-foreground">
            جرّب تغيير التصنيف
          </p>


        </section>


      ) : (


        <section
          className="
            grid
            grid-cols-2
            gap-4
            md:grid-cols-4
          "
        >

          {products.map((product)=>(

            <ProductCard
              key={product.id}
              product={product}
            />

          ))}


        </section>


      )}


    </main>

  );
}