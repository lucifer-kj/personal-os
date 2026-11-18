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
          backgroundColor: "#141413",
          borderRadius: 40,
          border: "2px solid #2B2A27",
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
              "radial-gradient(circle, #D97757 0%, #C96442 50%, #141413 100%)",
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
              "radial-gradient(circle at 35% 35%, #EDEAE6 0%, #D97757 40%, #C96442 100%)",
            boxShadow: "0 0 32px rgba(201, 100, 66, 0.9)",
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
