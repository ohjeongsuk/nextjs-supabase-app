import { ImageResponse } from "next/og";

export const alt = "Gather - One link, all your event needs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 120,
          fontWeight: 700,
          color: "#1a1a1a",
          marginBottom: 24,
        }}
      >
        Gather
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 40,
          color: "#666666",
        }}
      >
        One link, all your event needs
      </div>
    </div>,
    {
      ...size,
    },
  );
}
