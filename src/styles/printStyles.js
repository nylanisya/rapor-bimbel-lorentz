export const printStyles = `
  @media screen {
    .paper-wrapper { display: none; }
    .paper-wrapper.active-page { display: block; }
  }
  @media print {
    html, body { margin: 0; padding: 0; }
    .no-print { display: none !important; }
    .page-wrapper-root { padding: 0 !important; min-height: 0 !important; background: none !important; }
    .paper-wrapper { display: block !important; margin: 0 !important; padding: 0 !important; page-break-after: always; break-after: page; }
    .paper-wrapper:last-child { page-break-after: auto; break-after: auto; }
    .paper-scale-outer { height: auto !important; display: block !important; }
    .paper-scale-inner { transform: none !important; }
    .paper { box-shadow: none !important; margin: 0 !important; width: 210mm !important; min-height: 297mm !important; padding: 11mm 16mm !important; box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    * { box-sizing: border-box !important; }
    @page { size: A4; margin: 0; }
    input::placeholder, textarea::placeholder { color: transparent !important; }
  }
  input, textarea { font-family: 'Times New Roman', Times, serif; box-sizing: border-box; }
  input::placeholder, textarea::placeholder { color: #b0b0b0; font-style: italic; }
  @media screen and (max-width: 640px) {
    .toolbar-header { flex-direction: column; align-items: stretch !important; gap: 10px !important; }
    .btn-print { width: 100%; text-align: center; }
    .quick-actions { justify-content: flex-start !important; }
    .more-wrapper { margin-left: 0 !important; }
  }
`;
