import { styles } from "../styles/styles";

export default function FieldLine({
  label,
  value,
  onChange,
  placeholder,
  boldLabel,
}) {
  return (
    <div style={styles.staticLine}>
      <span
        style={{ ...styles.staticLabel, fontWeight: boldLabel ? 700 : 600 }}
      >
        {label}
      </span>
      <span>:</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.inlineInput}
      />
    </div>
  );
}
