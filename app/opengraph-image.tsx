import {
  ImageResponse,
} from "next/og";

export const alt =
  "بالقرآن نرتقي، مصاحف وكتب إسلامية في الجزائر";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType =
  "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "#052e16",
        }}
      >
        <div
          style={{
            width: "1040px",
            height: "470px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border:
              "3px solid #4ade80",
            borderRadius:
              "40px",
            background:
              "#0b3d21",
          }}
        >
          <div
            style={{
              width: "430px",
              height: "270px",
              display: "flex",
              alignItems: "stretch",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "205px",
                height: "260px",
                display: "flex",
                border:
                  "12px solid #ffffff",
                borderRadius:
                  "20px 4px 4px 20px",
                transform:
                  "skewY(-5deg)",
              }}
            />

            <div
              style={{
                width: "205px",
                height: "260px",
                display: "flex",
                border:
                  "12px solid #ffffff",
                borderRadius:
                  "4px 20px 20px 4px",
                transform:
                  "skewY(5deg)",
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}