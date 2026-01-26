import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "GoStride - Find Your Next Finish Line";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0b",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              backgroundColor: "#10b981",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 20,
            }}
          >
            <svg width="46" height="46" viewBox="0 0 28 28" fill="none">
              <path
                d="M2 22L8 6L16 16L26 2"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="26" cy="2" r="2" fill="white" />
            </svg>
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span
              style={{
                fontSize: 64,
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-1px",
              }}
            >
              go
            </span>
            <span
              style={{
                fontSize: 64,
                fontWeight: 600,
                color: "#10b981",
                letterSpacing: "-1px",
              }}
            >
              stride
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255, 255, 255, 0.7)",
            marginBottom: 60,
          }}
        >
          Find Your Next Finish Line
        </div>

        {/* Event types */}
        <div
          style={{
            display: "flex",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              backgroundColor: "rgba(249, 115, 22, 0.2)",
              borderRadius: 50,
              border: "1px solid rgba(249, 115, 22, 0.3)",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#f97316",
              }}
            />
            <span style={{ color: "#f97316", fontSize: 20, fontWeight: 500 }}>
              Running
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              borderRadius: 50,
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#8b5cf6",
              }}
            />
            <span style={{ color: "#8b5cf6", fontSize: 20, fontWeight: 500 }}>
              Cycling
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              borderRadius: 50,
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#10b981",
              }}
            />
            <span style={{ color: "#10b981", fontSize: 20, fontWeight: 500 }}>
              Triathlon
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            color: "rgba(255, 255, 255, 0.4)",
            fontSize: 18,
          }}
        >
          Events across New Zealand
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
