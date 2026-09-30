"use client";

import Link from "next/link";
import {
  Menu,
  Moon,
  ShoppingBag,
  Sun,
} from "lucide-react";

import {
  useTheme,
} from "next-themes";

import {
  useEffect,
  useState,
} from "react";


import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";


import {
  useCartStore,
  getTotalItems,
} from "@/store/cart";


const links = [
  {
    label: "الرئيسية",
    href: "/",
  },
  {
    label: "المتجر",
    href: "/shop",
  },
  {
    label: "من نحن",
    href: "/about",
  },
  {
    label: "اتصل بنا",
    href: "/contact",
  },
];



export default function Header() {

  const {
    theme,
    setTheme,
  } = useTheme();


  const [
    mounted,
    setMounted,
  ] = useState(false);



  const items =
    useCartStore(
      state => state.items,
    );



  useEffect(() => {

    setMounted(true);

  }, []);



  const toggleTheme = () => {

    setTheme(
      theme === "dark"
        ? "light"
        : "dark",
    );

  };



  const cartCount =
    mounted
      ? getTotalItems(items)
      : 0;



  return (

    <header
      className="
        sticky
        top-0
        z-50
        border-b
        bg-background/90
        backdrop-blur
      "
    >

      <div
        className="
          mx-auto
          flex
          h-20
          max-w-7xl
          items-center
          justify-between
          px-6
        "
      >



        <Link
          href="/"
          className="
            text-2xl
            font-bold
            tracking-[0.35em]
          "
        >
          ASTRA
        </Link>




        <nav
          className="
            hidden
            items-center
            gap-8
            md:flex
          "
        >

          {
            links.map(
              link => (

                <Link
                  key={
                    link.href
                  }
                  href={
                    link.href
                  }
                  className="
                    text-sm
                    font-medium
                    transition-opacity
                    hover:opacity-60
                  "
                >
                  {link.label}
                </Link>

              )
            )
          }

        </nav>





        <div
          className="
            flex
            items-center
            gap-3
          "
        >


          <button

            onClick={
              toggleTheme
            }

            aria-label="تغيير الوضع"

            className="
              flex
              size-11
              items-center
              justify-center
              rounded-full
              border
            "

          >

            {
              mounted &&
              theme === "dark"

              ?

              <Sun size={18}/>

              :

              <Moon size={18}/>

            }

          </button>





          <Link

            href="/checkout"

            className="
              hidden
              items-center
              gap-2
              rounded-full
              bg-black
              px-5
              py-3
              text-sm
              text-white
              transition
              hover:opacity-80
              dark:bg-white
              dark:text-black
              md:flex
            "

          >

            <ShoppingBag size={17}/>

            السلة ({cartCount})

          </Link>






          <div
            className="
              md:hidden
            "
          >

            <Sheet>

              <SheetTrigger

                className="
                  flex
                  size-11
                  items-center
                  justify-center
                  rounded-full
                  border
                "

                aria-label="القائمة"

              >

                <Menu size={20}/>

              </SheetTrigger>



              <SheetContent
                side="right"
                className="w-80"
              >

                <SheetHeader>

                  <SheetTitle
                    className="
                      text-end
                    "
                  >
                    ASTRA
                  </SheetTitle>

                </SheetHeader>



                <nav
                  className="
                    mt-8
                    flex
                    flex-col
                    gap-6
                    text-end
                  "
                >


                  {
                    links.map(
                      link => (

                        <Link
                          key={
                            link.href
                          }
                          href={
                            link.href
                          }
                          className="
                            text-lg
                          "
                        >

                          {link.label}

                        </Link>

                      )
                    )
                  }



                  <Link

                    href="/checkout"

                    className="
                      rounded-full
                      bg-black
                      px-5
                      py-3
                      text-center
                      text-white
                      dark:bg-white
                      dark:text-black
                    "

                  >

                    السلة ({cartCount})

                  </Link>


                </nav>


              </SheetContent>


            </Sheet>

          </div>



        </div>


      </div>


    </header>

  );

}