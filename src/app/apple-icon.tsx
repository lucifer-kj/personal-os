import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D0B0A",
          borderRadius: 40,
          border: "2px solid #26211D",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient atmospheric radial glow */}
        <div
          style={{
            position: "absolute",
            width: 130,
            height: 130,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #E05B27 0%, #7C3AED 70%, transparent 100%)",
            opacity: 0.85,
          }}
        />
        {/* Core luminous orb */}
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, #FFF0EA 0%, #FF8A48 40%, #E05B27 100%)",
            boxShadow: "0 0 32px rgba(224, 91, 39, 0.9)",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
