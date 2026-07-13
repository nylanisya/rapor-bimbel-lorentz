import React, { useState, useRef, useEffect } from "react";

const A4_WIDTH_PX = 793.7; // 210mm at 96dpi
const A4_HEIGHT_PX = 1122.5; // 297mm at 96dpi

// Menghitung skala agar kertas A4 tetap utuh proporsinya di layar sempit (HP),
// bukan reflow/wrap seperti elemen web biasa — seluruh kertas diperkecil
// sebagai satu kesatuan (seperti memperkecil foto), bukan diubah tata letaknya.
function useResponsiveScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calc = () => {
      const sidePadding = 16;
      const available = window.innerWidth - sidePadding * 2;
      const next = Math.min(1, available / A4_WIDTH_PX);
      setScale(next);
    };
    calc();
    window.addEventListener("resize", calc);

    const before = () => setScale(1);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", calc);

    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", calc);
    };
  }, []);

  return scale;
}
// ============ FUNGSI DEFAULT ============
const defaultSubjects = () => [
  { mapel: "Matematika", nilai: "" },
  { mapel: "Bahasa Indonesia", nilai: "" },
  { mapel: "Bahasa Inggris", nilai: "" },
  { mapel: "IPA", nilai: "" },
  { mapel: "IPS", nilai: "" },
];

const createEmptyPage = () => ({
  nama: "",
  kelas: "",
  semester: "",
  tahunAjar: "",
  subjects: defaultSubjects(),
  sakit: "",
  izin: "",
  alpa: "",
  catatan: "",
  tempat: "Pekanbaru",
  tanggal: "",
  namaTutor: "",
  namaOrtu: "",
  namaOwner: "Laurentia Dwi Prantanti",
  peringkat: "", // <-- field baru
});

// ============ FUNGSI LOCALSTORAGE ============
const saveToLocalStorage = (pages) => {
  try {
    localStorage.setItem("raporData", JSON.stringify(pages));
  } catch (error) {
    console.error("Gagal simpan:", error);
  }
};

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem("raporData");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Gagal baca:", error);
  }
  return null;
};

// ============ KOMPONEN UTAMA ============
export default function RaporBimbelLorentz() {
  const [pages, setPages] = useState(() => {
    const saved = loadFromLocalStorage();
    return saved && saved.length > 0 ? saved : [createEmptyPage()];
  });

  const [activePage, setActivePage] = useState(0);
  const [saveStatus, setSaveStatus] = useState("");
  const [showMore, setShowMore] = useState(false);
  const scale = useResponsiveScale();

  useEffect(() => {
    if (pages.length === 0) return;
    saveToLocalStorage(pages);
    const showTimer = setTimeout(() => setSaveStatus("Tersimpan"), 0);
    const hideTimer = setTimeout(() => setSaveStatus(""), 2000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [pages]);

  // ============ FUNGSI CRUD ============
  const updateField = (field, value) => {
    setPages((prev) =>
      prev.map((p, i) => (i === activePage ? { ...p, [field]: value } : p))
    );
  };

  const updateSubject = (sIdx, field, value) => {
    setPages((prev) =>
      prev.map((p, i) => {
        if (i !== activePage) return p;
        const next = [...p.subjects];
        next[sIdx] = { ...next[sIdx], [field]: value };
        return { ...p, subjects: next };
      })
    );
  };

  const addSubject = () => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === activePage
          ? { ...p, subjects: [...p.subjects, { mapel: "", nilai: "" }] }
          : p
      )
    );
  };

  const removeSubject = (sIdx) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === activePage
          ? { ...p, subjects: p.subjects.filter((_, si) => si !== sIdx) }
          : p
      )
    );
  };

  const addPage = () => {
    setPages((prev) => [...prev, createEmptyPage()]);
    setActivePage(pages.length);
  };

  const duplicatePage = () => {
    const copy = JSON.parse(JSON.stringify(pages[activePage]));
    setPages((prev) => {
      const next = [...prev];
      next.splice(activePage + 1, 0, copy);
      return next;
    });
    setActivePage(activePage + 1);
  };

  const removePage = () => {
    if (pages.length <= 1) return;
    const idxToRemove = activePage;
    setPages((prev) => prev.filter((_, i) => i !== idxToRemove));
    setActivePage((prev) => Math.max(0, prev - 1));
  };

  const resetData = () => {
    if (
      window.confirm(
        "Yakin ingin menghapus semua data rapor? Tindakan ini tidak bisa dibatalkan."
      )
    ) {
      localStorage.removeItem("raporData");
      setPages([createEmptyPage()]);
      setActivePage(0);
      setSaveStatus("Data direset");
      setTimeout(() => setSaveStatus(""), 2000);
    }
    setShowMore(false);
  };

  const exportData = () => {
    const data = JSON.stringify(pages, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapor_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMore(false);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data) && data.length > 0) {
          setPages(data);
          setActivePage(0);
          setSaveStatus("Data berhasil dipulihkan");
          setTimeout(() => setSaveStatus(""), 3000);
        } else {
          alert("Format file tidak valid!");
        }
      } catch (error) {
        alert("Gagal membaca file: " + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
    setShowMore(false);
  };

  const handlePrint = () => window.print();

  return (
    <div className="page-wrapper-root" style={styles.pageWrapper}>
      <style>{printStyles}</style>

      {/* ===== TOOLBAR ===== */}
      <div className="no-print" style={styles.toolbarContainer}>
        {/* Baris 1: Judul + status + tombol utama (Cetak) */}
        <div className="toolbar-header" style={styles.toolbarHeader}>
          <div>
            <div style={styles.toolbarTitle}>Rapor Bimbel Lorentz</div>
            <div style={styles.toolbarSubtitle}>
              {saveStatus ? saveStatus : "Tersimpan otomatis"} · {pages.length}{" "}
              siswa
            </div>
          </div>
          <button
            className="btn-print"
            onClick={handlePrint}
            style={styles.btnPrint}
          >
            Cetak / Simpan PDF
          </button>
        </div>

        {/* Baris 2: Tab per siswa */}
        <div style={styles.tabSection}>
          <div style={styles.tabWrapper}>
            {pages.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setActivePage(idx)}
                style={{
                  ...styles.tabBtn,
                  ...(idx === activePage ? styles.tabBtnActive : {}),
                }}
              >
                {idx + 1}. {p.nama || `Siswa ${idx + 1}`}
              </button>
            ))}
          </div>
          <button onClick={addPage} style={styles.addBtn}>
            + Siswa Baru
          </button>
        </div>

        {/* Baris 3: Aksi cepat untuk halaman aktif + menu lainnya */}
        <div className="quick-actions" style={styles.quickActions}>
          <button onClick={duplicatePage} style={styles.btnGhost}>
            Duplikat Siswa Ini
          </button>
          <button
            onClick={removePage}
            style={{
              ...styles.btnGhost,
              color: pages.length <= 1 ? "#9aa0a6" : "#b3261e",
              borderColor: pages.length <= 1 ? "#e0e0e0" : "#f2c6c2",
              cursor: pages.length <= 1 ? "not-allowed" : "pointer",
            }}
            disabled={pages.length <= 1}
          >
            Hapus Siswa Ini
          </button>
          <button onClick={addSubject} style={styles.btnGhost}>
            + Mata Pelajaran
          </button>

          <div className="more-wrapper" style={styles.moreWrapper}>
            <button
              onClick={() => setShowMore((v) => !v)}
              style={styles.btnGhost}
            >
              Lainnya ▾
            </button>
            {showMore && (
              <div style={styles.moreMenu}>
                <button onClick={exportData} style={styles.moreMenuItem}>
                  Unduh Cadangan Semua Data (.json)
                </button>
                <label style={styles.moreMenuItem}>
                  Pulihkan dari File Cadangan
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    style={{ display: "none" }}
                  />
                </label>
                <div style={styles.moreMenuDivider} />
                <button
                  onClick={resetData}
                  style={{ ...styles.moreMenuItem, color: "#b3261e" }}
                >
                  Hapus Semua Data Rapor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAPER PAGES */}
      {pages.map((p, idx) => (
        <div
          key={idx}
          className={`paper-wrapper${idx === activePage ? " active-page" : ""}`}
        >
          <div
            className="paper-scale-outer"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              height: scale < 1 ? `${A4_HEIGHT_PX * scale}px` : "auto",
            }}
          >
            <div
              className="paper-scale-inner"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
              }}
            >
              <PaperPage
                page={p}
                isActive={idx === activePage}
                onFieldChange={updateField}
                onSubjectChange={updateSubject}
                onRemoveSubject={removeSubject}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ KOMPONEN PAPER ============
function PaperPage({
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

  // Ambil nilai peringkat, beri default kosong jika belum ada
  const peringkat = page.peringkat || "";

  return (
    <div style={styles.paper} className="paper">
      <Watermark />
      <div style={styles.paperContent}>
        {/* HEADER */}
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

        {/* TABLE */}
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

        {/* KETIDAKHADIRAN & PERINGKAT (sejajar) */}
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

          {/* Peringkat - seperti baris teks dengan garis bawah */}
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

        {/* TANGGAL */}
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

        {/* TANDA TANGAN */}
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

// ============ WATERMARK: "Instituut Lorentz" ============
function Watermark({ src = "/logo-bimbel.png" }) {
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

// ============ KOMPONEN PEMBANTU ============
function FieldLine({ label, value, onChange, placeholder, boldLabel }) {
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

function AttendanceLine({ label, value, onChange }) {
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

// ============ STYLES ============
const FONT = "'Tinos', 'Times New Roman', Times, serif";

const styles = {
  pageWrapper: {
    background: "#f0f2f5",
    minHeight: "100vh",
    padding: "20px 0 60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: FONT,
  },

  // ===== TOOLBAR =====
  toolbarContainer: {
    width: "210mm",
    maxWidth: "94vw",
    background: "#ffffff",
    borderRadius: "10px",
    padding: "18px 20px",
    marginBottom: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #e8eaed",
    fontFamily: "system-ui, sans-serif",
  },
  toolbarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "12px",
  },
  toolbarTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1a1a1a",
  },
  toolbarSubtitle: {
    fontSize: "12.5px",
    color: "#5f6368",
    marginTop: "2px",
  },
  btnPrint: {
    background: "#1f4e3d",
    color: "#ffffff",
    border: "none",
    padding: "11px 22px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  tabSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f0f0f0",
  },
  tabWrapper: {
    display: "flex",
    flex: 1,
    gap: "6px",
    overflowX: "auto",
    padding: "2px 0",
    flexWrap: "nowrap",
  },
  tabBtn: {
    background: "#f8f9fa",
    color: "#3c4043",
    border: "1px solid #dadce0",
    padding: "7px 14px",
    borderRadius: "16px",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  tabBtnActive: {
    background: "#1f4e3d",
    color: "#ffffff",
    border: "1px solid #1f4e3d",
    fontWeight: 600,
  },
  addBtn: {
    background: "#eef4f1",
    color: "#1f4e3d",
    border: "1px dashed #1f4e3d",
    padding: "7px 14px",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  quickActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  btnGhost: {
    background: "#ffffff",
    color: "#3c4043",
    border: "1px solid #dadce0",
    padding: "7px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  moreWrapper: {
    position: "relative",
    marginLeft: "auto",
  },
  moreMenu: {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    minWidth: "230px",
    padding: "6px",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
  },
  moreMenuItem: {
    background: "transparent",
    border: "none",
    textAlign: "left",
    padding: "9px 10px",
    fontSize: "13px",
    color: "#3c4043",
    cursor: "pointer",
    borderRadius: "5px",
    width: "100%",
    boxSizing: "border-box",
  },
  moreMenuDivider: {
    height: "1px",
    background: "#eee",
    margin: "4px 0",
  },

  // ===== PAPER STYLES =====
  paper: {
    background: "#ffffff",
    width: "210mm",
    minHeight: "297mm",
    padding: "16mm 18mm",
    boxSizing: "border-box",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    color: "#1a1a1a",
    marginBottom: "24px",
    position: "relative",
    overflow: "hidden",
  },
  paperContent: {
    position: "relative",
    zIndex: 1,
  },
  watermarkWrapper: {
    position: "absolute",
    top: "40%",
    left: "60%",
    transform: "translate(-50%, -50%)",
    width: "78%",
    zIndex: 0,
    pointerEvents: "none",
    opacity: 0.14,
  },
  watermarkSvg: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    fontSize: "13px",
    lineHeight: 1.45,
  },
  headerLeft: {
    flex: 1.3,
    textAlign: "left",
  },
  headerRight: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
  },
  staticLine: {
    display: "flex",
    gap: "4px",
    alignItems: "baseline",
    width: "100%",
    textAlign: "left",
  },
  staticLabel: {
    minWidth: "112px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  inlineInput: {
    border: "none",
    borderBottom: "1px dotted #999",
    outline: "none",
    fontSize: "13.5px",
    flex: 1,
    minWidth: 0,
    padding: "1px 4px",
    background: "transparent",
    fontFamily: FONT,
  },
  divider: {
    borderTop: "2px solid #1a1a1a",
    marginTop: "12px",
    marginBottom: "6px",
  },
  title: {
    textAlign: "center",
    fontSize: "19px",
    fontWeight: 700,
    letterSpacing: "1px",
    margin: "8px 0 14px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13.5px",
    marginBottom: "16px",
  },
  th: {
    border: "1px solid #1a1a1a",
    padding: "8px 10px",
    background: "#f5f5f4",
    fontWeight: 700,
    textAlign: "left",
  },
  thNo: { width: "42px", textAlign: "center" },
  thNilai: { width: "120px", textAlign: "center" },
  thAction: { width: "30px", border: "none" },
  td: {
    border: "1px solid #1a1a1a",
    padding: "4px 8px",
  },
  tdNo: { textAlign: "center" },
  tdNilai: { textAlign: "center" },
  tdAction: { border: "none", textAlign: "center" },
  cellInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: "13.5px",
    padding: "5px 2px",
    background: "transparent",
    fontFamily: FONT,
    boxSizing: "border-box",
  },
  btnRemove: {
    border: "none",
    background: "#f5ecec",
    color: "#8a1f1f",
    width: "22px",
    height: "22px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    lineHeight: 1,
  },
  midSection: {
    display: "flex",
    marginBottom: "12px",
    gap: "20px",
  },
  attendanceBlock: {
    width: "48%",
  },
  blockLabel: {
    fontWeight: 700,
    fontSize: "13.5px",
    marginBottom: "6px",
    textAlign: "left",
  },
  attendanceBox: {
    border: "1px solid #1a1a1a",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  attendanceLine: {
    display: "flex",
    alignItems: "baseline",
    fontSize: "13.5px",
    textAlign: "left",
    width: "100%",
    marginBottom: "6px",
  },
  attendanceLabel: {
    minWidth: "125px",
    textAlign: "left",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  attendanceColon: {
    marginRight: "6px",
  },
  attendanceInput: {
    width: "45px",
    border: "none",
    borderBottom: "1px dotted #999",
    outline: "none",
    textAlign: "center",
    fontSize: "13.5px",
    background: "transparent",
    fontFamily: FONT,
    marginRight: "6px",
  },
  attendanceUnit: {
    flexShrink: 0,
  },

  // ===== PERINGKAT (seperti baris teks) =====
  peringkatBlock: {
    width: "48%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  peringkatLine: {
    display: "flex",
    alignItems: "baseline",
    fontSize: "13.5px",
    textAlign: "left",
    width: "100%",
    border: "1px solid #1a1a1a", // tambahkan border kotak agar sejajar dengan attendanceBox
    padding: "10px 12px",
    boxSizing: "border-box",
    minHeight: "80px", // sejajar
    flex: 1,
  },
  peringkatLabel: {
    minWidth: "80px", // sesuai
    textAlign: "left",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  peringkatColon: {
    marginRight: "6px",
  },
  peringkatInput: {
    width: "100%",
    border: "none",
    borderBottom: "1px dotted #999",
    outline: "none",
    fontSize: "13.5px",
    padding: "4px 2px",
    background: "transparent",
    fontFamily: FONT,
    textAlign: "center",
    flex: 1,
  },

  noteBlock: {
    marginBottom: "10px",
  },
  noteBox: {
    width: "100%",
    minHeight: "28px",
    border: "1px solid #1a1a1a",
    padding: "10px 12px",
    fontSize: "13.5px",
    outline: "none",
    resize: "none",
    overflow: "hidden",
    boxSizing: "border-box",
    fontFamily: FONT,
    display: "block",
  },
  dateRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "14px",
    marginBottom: "10px",
    fontSize: "13.5px",
  },
  dateLine: {
    display: "flex",
    alignItems: "baseline",
    gap: "2px",
  },
  dateInput: {
    border: "none",
    borderBottom: "1px dotted #999",
    outline: "none",
    fontSize: "13.5px",
    textAlign: "center",
    background: "transparent",
    fontFamily: FONT,
  },
  signRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "16px",
    fontSize: "13.5px",
    width: "100%",
  },
  signCol: {
    width: "33.33%",
    boxSizing: "border-box",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingLeft: "8px",
    paddingRight: "8px",
  },
  signHeaderBlock: {
    height: "40px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    lineHeight: "20px",
  },
  signHeader: {
    fontWeight: 600,
  },
  signRole: {
    marginTop: "0px",
  },
  signSpace: {
    height: "36px",
    flexShrink: 0,
    width: "100%",
  },
  signInput: {
    border: "none",
    borderTop: "1px solid #1a1a1a",
    outline: "none",
    textAlign: "center",
    fontSize: "13.5px",
    width: "100%",
    maxWidth: "170px",
    padding: "4px 0 0",
    background: "transparent",
    fontFamily: FONT,
    boxSizing: "border-box",
  },
};

// ============ PRINT STYLES ============
const printStyles = `
  @media screen {
    .paper-wrapper { display: none; }
    .paper-wrapper.active-page { display: block; }
  }
  @media print {
    html, body { margin: 0; padding: 0; }
    .no-print { display: none !important; }
    .page-wrapper-root {
      padding: 0 !important;
      min-height: 0 !important;
      background: none !important;
    }
    .paper-wrapper {
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      page-break-after: always;
      break-after: page;
    }
    .paper-wrapper:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .paper-scale-outer {
      height: auto !important;
      display: block !important;
    }
    .paper-scale-inner {
      transform: none !important;
    }
    .paper {
      box-shadow: none !important;
      margin: 0 !important;
      width: 210mm !important;
      min-height: 297mm !important;
      padding: 11mm 16mm !important;  
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    * {
      box-sizing: border-box !important;
    }
    @page { size: A4; margin: 0; }
    input::placeholder, textarea::placeholder {
      color: transparent !important;
    }
  }
  input, textarea {
    font-family: 'Times New Roman', Times, serif;
    box-sizing: border-box;
  }
  input::placeholder, textarea::placeholder {
    color: #b0b0b0;
    font-style: italic;
  }

  /* ===== RESPONSIVE TOOLBAR (mobile web) ===== */
  @media screen and (max-width: 640px) {
    .toolbar-header {
      flex-direction: column;
      align-items: stretch !important;
      gap: 10px !important;
    }
    .btn-print {
      width: 100%;
      text-align: center;
    }
    .quick-actions {
      justify-content: flex-start !important;
    }
    .more-wrapper {
      margin-left: 0 !important;
    }
  }
`;
