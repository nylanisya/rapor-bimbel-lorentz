import { styles } from "../styles/styles";

export default function AttendanceLine({ label, value, onChange }) {
  return (
    <div style={styles.attendanceLine}>
      <span style={styles.attendanceLabel}>{label}</span>
      <span style={styles.attendanceColon}>:</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.attendanceInput}
        placeholder="0"
      />
      <span style={styles.attendanceUnit}>hari</span>
    </div>
  );
}
