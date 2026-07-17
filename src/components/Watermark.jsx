import { styles } from "../styles/styles";

export default function Watermark({ src = "/logo-bimbel.png" }) {
  return (
    <div style={styles.watermarkWrapper} aria-hidden="true">
      <img
        src={src}
        alt="Watermark Bimbel Lorentz"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
