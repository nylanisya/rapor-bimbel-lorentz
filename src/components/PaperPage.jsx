import { useRef, useEffect } from "react";
import { styles } from "../styles/styles";
import Watermark from "./Watermark";
import FieldLine from "./FieldLine";
import AttendanceLine from "./AttendanceLine";

export default function PaperPage({
  page,
  isActive,
  onFieldChange,
  onSubjectChange,
  onRemoveSubject,
}) {
  const set = (field) => (value) => {
    if (isActive) onFieldChange(field, value);
  };

  const noteRef = useRef(null);
  const autoResizeNote = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  useEffect(() => {
    autoResizeNote(noteRef.current);
  }, [page.catatan]);

  const peringkat = page.peringkat || "";

  return (
    <div style={styles.paper} className="paper">
      <Watermark />
      <div style={styles.paperContent}>
        <div style={styles.headerRow}>
          <div style={styles.headerLeft}>
            <FieldLine
              label="Nama"
              value={page.nama}
              onChange={set("nama")}
              placeholder="Nama siswa"
              boldLabel
            />
            <div style={styles.staticLine}>
              <span style={styles.staticLabel}>Nama Bimbel</span>
              <span>: Bimbel Lorentz</span>
            </div>
            <div style={styles.staticLine}>
              <span style={styles.staticLabel}>Alamat</span>
              <span>: Jl. Kapas No 7A Kec. Tenayan Raya</span>
            </div>
          </div>
          <div style={styles.headerRight}>
            <FieldLine
              label="Kelas"
              value={page.kelas}
              onChange={set("kelas")}
              placeholder="—"
            />
            <FieldLine
              label="Semester"
              value={page.semester}
              onChange={set("semester")}
              placeholder="—"
            />
            <FieldLine
              label="Tahun Pelajaran"
              value={page.tahunAjar}
              onChange={set("tahunAjar")}
              placeholder="2025/2026"
            />
          </div>
        </div>

        <div style={styles.divider} />
        <h1 style={styles.title}>LAPORAN HASIL BELAJAR</h1>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.thNo }}>No</th>
              <th style={styles.th}>Mata Pelajaran</th>
              <th style={{ ...styles.th, ...styles.thNilai }}>Nilai Akhir</th>
              <th className="no-print" style={styles.thAction}></th>
            </tr>
          </thead>
          <tbody>
            {page.subjects.map((s, idx) => (
              <tr key={idx}>
                <td style={{ ...styles.td, ...styles.tdNo }}>{idx + 1}</td>
                <td style={styles.td}>
                  <input
                    value={s.mapel}
                    onChange={(e) =>
                      isActive && onSubjectChange(idx, "mapel", e.target.value)
                    }
                    placeholder="Nama mata pelajaran"
                    style={styles.cellInput}
                  />
                </td>
                <td style={{ ...styles.td, ...styles.tdNilai }}>
                  <input
                    value={s.nilai}
                    onChange={(e) =>
                      isActive && onSubjectChange(idx, "nilai", e.target.value)
                    }
                    placeholder="—"
                    style={{ ...styles.cellInput, textAlign: "center" }}
                  />
                </td>
                <td className="no-print" style={styles.tdAction}>
                  <button
                    onClick={() => isActive && onRemoveSubject(idx)}
                    style={styles.btnRemove}
                    title="Hapus baris"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.midSection}>
          <div style={styles.attendanceBlock}>
            <div style={styles.blockLabel}>Ketidakhadiran</div>
            <div style={styles.attendanceBox}>
              <AttendanceLine
                label="Sakit"
                value={page.sakit}
                onChange={set("sakit")}
              />
              <AttendanceLine
                label="Izin"
                value={page.izin}
                onChange={set("izin")}
              />
              <AttendanceLine
                label="Tanpa Keterangan"
                value={page.alpa}
                onChange={set("alpa")}
              />
            </div>
          </div>

          <div style={styles.peringkatBlock}>
            <div style={styles.blockLabel}>Peringkat</div>
            <div style={styles.peringkatLine}>
              <span style={styles.peringkatLabel}>Peringkat</span>
              <span style={styles.peringkatColon}>:</span>
              <input
                value={peringkat}
                onChange={(e) => set("peringkat")(e.target.value)}
                placeholder="—"
                style={styles.peringkatInput}
              />
            </div>
          </div>
        </div>

        <div style={styles.noteBlock}>
          <div style={styles.blockLabel}>Catatan Wali Kelas:</div>
          <textarea
            ref={noteRef}
            value={page.catatan}
            onChange={(e) => {
              set("catatan")(e.target.value);
              autoResizeNote(e.target);
            }}
            placeholder="Tulis catatan wali kelas di sini..."
            style={styles.noteBox}
            rows={1}
          />
        </div>

        <div style={styles.dateRow}>
          <div style={styles.dateLine}>
            <input
              value={page.tempat}
              onChange={(e) => set("tempat")(e.target.value)}
              style={styles.dateInput}
              placeholder="Tempat"
            />
            ,{" "}
            <input
              value={page.tanggal}
              onChange={(e) => set("tanggal")(e.target.value)}
              style={{ ...styles.dateInput, width: "170px" }}
              placeholder="tanggal bulan tahun"
            />
          </div>
        </div>

        <div style={styles.signRow}>
          <div style={styles.signCol}>
            <div style={styles.signHeaderBlock}>
              <div style={styles.signHeader}>Mengetahui:</div>
              <div style={styles.signRole}>Orang Tua/Wali</div>
            </div>
            <div style={styles.signSpace} />
            <input
              value={page.namaOrtu}
              onChange={(e) => set("namaOrtu")(e.target.value)}
              placeholder="(...........................)"
              style={styles.signInput}
            />
          </div>
          <div style={styles.signCol}>
            <div style={styles.signHeaderBlock}>
              <div style={styles.signHeader}>Tutor,</div>
            </div>
            <div style={styles.signSpace} />
            <input
              value={page.namaTutor}
              onChange={(e) => set("namaTutor")(e.target.value)}
              placeholder="(...........................)"
              style={styles.signInput}
            />
          </div>
          <div style={styles.signCol}>
            <div style={styles.signHeaderBlock}>
              <div style={styles.signHeader}>Owner Bimbel Lorentz</div>
            </div>
            <div style={styles.signSpace} />
            <input
              value={page.namaOwner}
              onChange={(e) => set("namaOwner")(e.target.value)}
              placeholder="(...........................)"
              style={styles.signInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
