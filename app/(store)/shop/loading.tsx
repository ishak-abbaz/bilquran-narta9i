export default function Loading() {

  return (

    <main
      dir="rtl"
      className="
        mx-auto
        max-w-7xl
        px-4
        py-12
      "
    >

      <div
        className="
          mx-auto
          mb-10
          h-40
          max-w-2xl
          animate-pulse
          rounded-2xl
          bg-muted
        "
      />



      <div
        className="
          grid
          grid-cols-2
          gap-4
          md:grid-cols-4
        "
      >

        {Array.from({
          length: 8,
        }).map((_, index)=>(

          <div
            key={index}
            className="space-y-3"
          >

            <div
              className="
                aspect-square
                animate-pulse
                rounded-xl
                bg-muted
              "
            />


            <div
              className="
                h-4
                w-3/4
                animate-pulse
                rounded
                bg-muted
              "
            />

          </div>

        ))}

      </div>


    </main>

  );
}