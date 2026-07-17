import { useState, useEffect } from "react";
import { styles } from "../styles/styles";
import { printStyles } from "../styles/printStyles";
import { A4_HEIGHT_PX } from "../constants";
import { createEmptyPage } from "../constants";
import { saveToLocalStorage, loadFromLocalStorage } from "../storage";
import { useResponsiveScale } from "../hooks/useResponsiveScale";
import PaperPage from "./PaperPage";

export default function RaporBimbelLorentz({ onLogout }) {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveStatus("Tersimpan");
    const timer = setTimeout(() => setSaveStatus(""), 2000);
    return () => clearTimeout(timer);
  }, [pages]);

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
    if (window.confirm("Yakin ingin menghapus semua data rapor?")) {
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

  const handleLogoutClick = () => {
    if (window.confirm("Yakin ingin keluar?")) {
      onLogout();
    }
    setShowMore(false);
  };

  return (
    <div className="page-wrapper-root" style={styles.pageWrapper}>
      <style>{printStyles}</style>

      <div className="no-print" style={styles.toolbarContainer}>
        <div className="toolbar-header" style={styles.toolbarHeader}>
          <div>
            <div style={styles.toolbarTitle}>Rapor Bimbel Lorentz</div>
            <div style={styles.toolbarSubtitle}>
              {saveStatus || "Tersimpan otomatis"} · {pages.length} siswa
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
                <div style={styles.moreMenuDivider} />
                <button
                  onClick={handleLogoutClick}
                  style={{ ...styles.moreMenuItem, color: "#b3261e" }}
                >
                  Keluar (Logout)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
