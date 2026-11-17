import { ImageResponse } from "next/og";

export const alt = "Ton tarif te fait perdre de l’argent. Calcule combien en 60 secondes.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f1e8",
          color: "#16140f",
          padding: 72,
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 36 }}>Tarif Juste</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.05 }}>
          <span>
            Ton tarif te fait <span style={{ color: "#b5381f", marginLeft: 18 }}>perdre de l’argent.</span>
          </span>
          <span>Calcule combien en 60 secondes.</span>
        </div>
        <div style={{ fontSize: 30, color: "#1e5a45" }}>Gratuit · 3 questions · sans inscription</div>
      </div>
    ),
    size,
  );
}
