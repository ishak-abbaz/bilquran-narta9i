import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
        }}
      >
        <div
          style={{
            width: "360px",
            height: "250px",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "172px",
              height: "230px",
              display: "flex",
              border: "20px solid #ffffff",
              borderRadius: "24px 6px 6px 24px",
              transform: "skewY(-5deg)",
            }}
          />

          <div
            style={{
              width: "172px",
              height: "230px",
              display: "flex",
              border: "20px solid #ffffff",
              borderRadius: "6px 24px 24px 6px",
              transform: "skewY(5deg)",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}