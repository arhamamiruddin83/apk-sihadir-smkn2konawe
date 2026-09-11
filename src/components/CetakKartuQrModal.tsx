/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import { 
  Printer, 
  X, 
  Search, 
  Download, 
  Filter, 
  CreditCard, 
  Grid, 
  RefreshCw,
  Award,
  CheckCircle2,
  Layers
} from "lucide-react";
import { Student } from "../types";

interface CetakKartuQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialClass?: string;
}

const SCHOOL_LOGO_URL = "https://i.ibb.co.com/TMkWkNY4/LOGO-SMKN-2-KONAWE-BARU.png";
const SCHOOL_LOGO_FALLBACKS = [
  "https://i.ibb.co/TMkWkNY4/LOGO-SMKN-2-KONAWE-BARU.png",
  "https://i.ibb.co.com/TMkWkNY4/LOGO-SMKN-2-KONAWE-BARU.jpg",
  "https://i.ibb.co/L8N2LpL/SMKN2.png"
];

// Helper: Format Jurusan tanpa nama kelas (agar kartu berlaku selama 3 tahun)
function getCleanMajor(student: Student): string {
  const cls = (student.className || "").toUpperCase();
  const maj = (student.major || "").trim();

  // If student has explicit detailed major
  if (maj && maj.length > 3 && !maj.toLowerCase().includes("kejuruan")) {
    return maj;
  }

  // Detect by class acronym
  if (cls.includes("TKR")) return "Teknik Kendaraan Ringan (TKR)";
  if (cls.includes("TSM") || cls.includes("TBSM")) return "Teknik & Bisnis Sepeda Motor (TBSM)";
  if (cls.includes("DPIB")) return "Desain Pemodelan & Informasi Bangunan (DPIB)";
  if (cls.includes("TAV")) return "Teknik Audio Video (TAV)";
  if (cls.includes("DKV")) return "Desain Komunikasi Visual (DKV)";
  if (cls.includes("TKJ")) return "Teknik Komputer & Jaringan (TKJ)";
  if (cls.includes("OTKP") || cls.includes("AP")) return "Otomatisasi & Tata Kelola Perkantoran";
  if (cls.includes("AKL") || cls.includes("AK")) return "Akuntansi & Keuangan Lembaga";

  return maj || "Teknik Kendaraan Ringan (TKR)";
}

export function CetakKartuQrModal({
  isOpen,
  onClose,
  students,
  initialClass = "ALL"
}: CetakKartuQrModalProps) {
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedMajor, setSelectedMajor] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cardLayout, setCardLayout] = useState<"id_card_front" | "id_card_duplex" | "compact_sticker">("id_card_front");
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Distinct classes for filtering batch prints
  const classList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set).sort();
  }, [students]);

  // Distinct majors
  const majorList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      set.add(getCleanMajor(s));
    });
    return Array.from(set).sort();
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClass === "ALL" || s.className === selectedClass;
      const sMajor = getCleanMajor(s);
      const matchMajor = selectedMajor === "ALL" || sMajor === selectedMajor;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.nisn && s.nisn.toLowerCase().includes(q)) ||
        sMajor.toLowerCase().includes(q);
      return matchClass && matchMajor && matchSearch;
    });
  }, [students, selectedClass, selectedMajor, searchQuery]);

  // Generate QR codes for visible students
  // QR code encodes: Nama Sekolah, Nama Murid, NISN, dan Jurusan
  useEffect(() => {
    if (!isOpen || filteredStudents.length === 0) return;

    let isMounted = true;
    setIsGenerating(true);

    const generateAll = async () => {
      const newMap: Record<string, string> = {};
      const batch = filteredStudents.slice(0, 180);

      for (const st of batch) {
        const stMajor = getCleanMajor(st);
        const stNisn = (st.nisn || st.id || "").trim();

        // Data QR Code memuat: Nama Sekolah, Nama Murid, NISN, dan Jurusan
        const qrPayload = [
          "SMK NEGERI 2 KONAWE",
          `Nama: ${st.name}`,
          `NISN: ${stNisn}`,
          `Jurusan: ${stMajor}`
        ].join("\n");

        try {
          const dataUrl = await QRCode.toDataURL(qrPayload, {
            width: 280,
            margin: 1,
            errorCorrectionLevel: "M",
            color: {
              dark: "#081b4b",
              light: "#ffffff"
            }
          });
          newMap[st.id] = dataUrl;
        } catch (err) {
          console.error("Failed to generate QR for:", st.name, err);
        }
      }

      if (isMounted) {
        setQrMap((prev) => ({ ...prev, ...newMap }));
        setIsGenerating(false);
      }
    };

    generateAll();

    return () => {
      isMounted = false;
    };
  }, [isOpen, filteredStudents]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSingleQr = (student: Student) => {
    const dataUrl = qrMap[student.id];
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `QR_${student.nisn || student.id}_${student.name.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      {/* CSS Cetak / Print Styles Khusus Kartu Pelajar */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-area-kartu-qr, #print-area-kartu-qr * {
            visibility: visible !important;
          }
          #print-area-kartu-qr {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white flex items-center justify-between border-b border-indigo-800/60 no-print">
          <div className="flex items-center gap-3">
            {/* Logo Sekolah di Header Modal */}
            <div className="w-10 h-10 rounded-full bg-white p-0.5 border-2 border-amber-400 shadow-md shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src={SCHOOL_LOGO_URL}
                alt="Logo SMK Negeri 2 Konawe"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  const currentAttempt = parseInt(target.getAttribute("data-attempt") || "0", 10);
                  if (currentAttempt < SCHOOL_LOGO_FALLBACKS.length) {
                    target.setAttribute("data-attempt", (currentAttempt + 1).toString());
                    target.src = SCHOOL_LOGO_FALLBACKS[currentAttempt];
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Cetak Kartu Tanda Pelajar Murid
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/40">
                  SMK NEGERI 2 KONAWE
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Kartu pelajar resmi dengan Logo Sekolah, NISN &amp; Jurusan (tanpa nama kelas, berlaku 3 tahun). QR Code memuat identitas lengkap murid &amp; sekolah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={filteredStudents.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Kartu (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filter Controls */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Rombel Asal */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Filter className="h-3.5 w-3.5 text-blue-600" />
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Rombel:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Rombel ({students.length} Murid)</option>
                {classList.map((cls) => {
                  const count = students.filter((s) => s.className === cls).length;
                  return (
                    <option key={cls} value={cls}>
                      {cls} ({count} anak)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Filter Jurusan */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Award className="h-3.5 w-3.5 text-indigo-600" />
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Jurusan:</label>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="ALL">Semua Jurusan</option>
                {majorList.map((maj) => (
                  <option key={maj} value={maj}>
                    {maj}
                  </option>
                ))}
              </select>
            </div>

            {/* Pilihan Layout Kartu */}
            <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                onClick={() => setCardLayout("id_card_front")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cardLayout === "id_card_front"
                    ? "bg-blue-700 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Kartu Pelajar format depan dengan Logo Sekolah, QR Code & data jurusan"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Kartu Pelajar</span>
              </button>
              <button
                onClick={() => setCardLayout("id_card_duplex")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cardLayout === "id_card_duplex"
                    ? "bg-blue-700 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Cetak bolak-balik: Sisi depan identitas + Sisi belakang QR & Tata Tertib"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Depan &amp; Belakang</span>
              </button>
              <button
                onClick={() => setCardLayout("compact_sticker")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cardLayout === "compact_sticker"
                    ? "bg-blue-700 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>Stiker Ringkas</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama / NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Info Banner: Konfirmasi Fitur Sesuai Permintaan */}
        <div className="px-6 py-2 bg-blue-50/90 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-950 dark:text-blue-200 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Format Aktif: <strong>Logo Resmi Sekolah</strong> • <strong>Cukup NISN</strong> (NIS dihapus) • <strong>Hanya Jurusan</strong> (tanpa nama kelas) • QR Code memuat <strong>Nama Murid, NISN, Jurusan &amp; Nama Sekolah</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
            <span>{filteredStudents.length} murid siap dicetak</span>
            {isGenerating && (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Membuat QR...</span>
              </span>
            )}
          </div>
        </div>

        {/* Printable Area & Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/50">
          <div id="print-area-kartu-qr" className="w-full">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <CreditCard className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Tidak ada murid yang sesuai filter</p>
                <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pilihan rombel, jurusan, atau kata kunci pencarian.</p>
              </div>
            ) : cardLayout === "id_card_front" ? (
              /* FORMAT KARTU DEPAN STANDAR: ID Card 85.6mm x 54mm rasio (2 kolom) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
                {filteredStudents.map((student) => {
                  const qrImage = qrMap[student.id];
                  const studentMajor = getCleanMajor(student);

                  return (
                    <div
                      key={student.id}
                      className="page-break-avoid relative bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                      style={{ height: "250px" }}
                    >
                      {/* Kop Resmi Kartu Pelajar dengan LOGO SEKOLAH & Tanpa Badge Berlaku 3 Tahun di kanan */}
                      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-950 text-white px-3.5 py-2 flex items-center gap-3 border-b-2 border-amber-400 relative">
                        {/* Logo Resmi Sekolah SMK Negeri 2 Konawe */}
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 border-2 border-amber-300 shadow-sm shrink-0 overflow-hidden">
                          <img
                            src={SCHOOL_LOGO_URL}
                            alt="Logo SMK Negeri 2 Konawe"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const currentAttempt = parseInt(target.getAttribute("data-attempt") || "0", 10);
                              if (currentAttempt < SCHOOL_LOGO_FALLBACKS.length) {
                                target.setAttribute("data-attempt", (currentAttempt + 1).toString());
                                target.src = SCHOOL_LOGO_FALLBACKS[currentAttempt];
                              }
                            }}
                          />
                        </div>

                        {/* Identitas Lembaga Pendidikan */}
                        <div className="leading-tight flex-1 min-w-0">
                          <p className="text-[7.5px] text-blue-200 font-bold uppercase tracking-wider truncate">
                            PEMERINTAH PROVINSI SULAWESI TENGGARA
                          </p>
                          <h4 className="text-[12px] font-black uppercase tracking-wide text-white truncate">
                            SMK NEGERI 2 KONAWE
                          </h4>
                          <p className="text-[8px] text-amber-300 font-extrabold uppercase tracking-wider">
                            KARTU TANDA PELAJAR
                          </p>
                        </div>
                      </div>

                      {/* Isi Utama Kartu: Pasfoto, Data Diri, Jurusan, & QR Code */}
                      <div className="p-3 flex items-center justify-between gap-3 flex-1 bg-white">
                        {/* Pasfoto Murid */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                          <div className="w-20 h-24 rounded-lg bg-slate-100 border-2 border-slate-300 overflow-hidden flex items-center justify-center shadow-2xs relative">
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm mb-1">
                                  {student.name.charAt(0)}
                                </div>
                                <span className="text-[7px] font-bold uppercase text-slate-500">FOTO 3X4</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[7px] font-bold text-slate-400 uppercase mt-1">NISN Terverifikasi</span>
                        </div>

                        {/* Rincian Identitas Murid: Hanya Nama, NISN & Jurusan (NIS dihapus, Kelas dihapus) */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          {/* Nama Lengkap Murid */}
                          <div>
                            <p className="text-[7.5px] font-bold uppercase text-slate-400 tracking-wider">Nama Murid</p>
                            <h5 className="text-[12px] font-black text-slate-950 uppercase leading-snug line-clamp-2">
                              {student.name}
                            </h5>
                          </div>

                          {/* NISN Murid (NIS Dihapus Cukup NISN) */}
                          <div>
                            <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">NISN</p>
                            <p className="font-mono font-black text-blue-950 text-xs tracking-wider">
                              {student.nisn || "-"}
                            </p>
                          </div>

                          {/* Program Keahlian / Jurusan (Tanpa Nama Kelas) */}
                          <div>
                            <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Jurusan</p>
                            <div className="inline-block px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-950 rounded-md text-[9.5px] font-black leading-tight max-w-full truncate">
                              {studentMajor}
                            </div>
                          </div>
                        </div>

                        {/* QR Code Presensi Murid (Memuat: Nama Sekolah, Nama Murid, NISN & Jurusan) */}
                        <div className="flex flex-col items-center justify-center p-1.5 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                          {qrImage ? (
                            <img
                              src={qrImage}
                              alt={`QR ${student.name}`}
                              className="w-22 h-22 object-contain rounded"
                            />
                          ) : (
                            <div className="w-22 h-22 flex items-center justify-center bg-slate-100 rounded">
                              <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
                            </div>
                          )}
                          <span className="text-[7.5px] font-mono font-black text-blue-950 mt-1">
                            NISN: {student.nisn || student.id}
                          </span>
                          <span className="text-[6.5px] font-bold uppercase text-slate-400">Scan Presensi</span>
                        </div>
                      </div>

                      {/* Footer Kartu & Pengesahan Kepala Sekolah */}
                      <div className="px-3.5 py-1.5 bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-600">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-700">
                            Berlaku selama menjadi murid aktif SMK Negeri 2 Konawe
                          </p>
                          <p className="text-[7px] text-slate-400">
                            Konawe, Sulawesi Tenggara | Telp: (0408) 242199
                          </p>
                        </div>

                        <div className="text-right leading-tight">
                          <p className="text-[7px] text-slate-400">Kepala Sekolah,</p>
                          <p className="text-[8px] font-black text-slate-900">Drs. H. ABD. MANAN, M.M.</p>
                          <p className="text-[6.5px] font-mono text-slate-500">NIP. 19680510 199403 1 002</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : cardLayout === "id_card_duplex" ? (
              /* FORMAT DUPLEX: SISI DEPAN & SISI BELAKANG */
              <div className="space-y-6">
                {filteredStudents.map((student) => {
                  const qrImage = qrMap[student.id];
                  const studentMajor = getCleanMajor(student);

                  return (
                    <div key={student.id} className="page-break-avoid grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
                      {/* SISI DEPAN (FRONT) */}
                      <div
                        className="relative bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                        style={{ height: "245px" }}
                      >
                        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-950 text-white px-3.5 py-2 flex items-center gap-2.5 border-b-2 border-amber-400">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 border border-amber-300 shrink-0 overflow-hidden">
                            <img src={SCHOOL_LOGO_URL} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="text-[7px] text-blue-200 font-bold uppercase">PEMERINTAH PROVINSI SULAWESI TENGGARA</p>
                            <h4 className="text-[10px] font-black uppercase text-white">SMK NEGERI 2 KONAWE</h4>
                          </div>
                        </div>

                        <div className="p-3 flex items-center gap-3.5 flex-1">
                          <div className="w-20 h-24 rounded-lg bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                            {student.photoUrl ? (
                              <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-base">
                                {student.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <p className="text-[7px] font-bold text-slate-400 uppercase">KARTU TANDA PELAJAR</p>
                            <h4 className="text-xs font-black text-slate-900 uppercase leading-snug">{student.name}</h4>
                            <div className="text-[9px] space-y-1 pt-0.5">
                              <p><span className="text-slate-400 font-bold">NISN:</span> <strong className="font-mono text-blue-950 text-xs ml-1">{student.nisn || "-"}</strong></p>
                              <p><span className="text-slate-400 font-bold">Jurusan:</span> <strong className="text-slate-900 ml-1">{studentMajor}</strong></p>
                            </div>
                          </div>
                        </div>

                        <div className="px-3 py-1 bg-slate-50 border-t border-slate-200 flex justify-between text-[7px] text-slate-500">
                          <span>Kartu Identitas Resmi Murid</span>
                          <span>Kab. Konawe, Prov. Sulawesi Tenggara</span>
                        </div>
                      </div>

                      {/* SISI BELAKANG (BACK) */}
                      <div
                        className="relative bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                        style={{ height: "245px" }}
                      >
                        <div className="bg-slate-900 text-white px-3.5 py-2 flex items-center justify-between border-b border-slate-700">
                          <span className="text-[9px] font-black uppercase text-amber-300 tracking-wider">
                            KETENTUAN &amp; TATA TERTIB KARTU
                          </span>
                          <span className="text-[7px] font-black px-2 py-0.5 bg-slate-700 text-slate-200 rounded-full font-mono">
                            SISI BELAKANG
                          </span>
                        </div>

                        <div className="p-3 flex items-center justify-between gap-3 flex-1">
                          <div className="flex-1 space-y-1 text-[7.5px] text-slate-700 leading-tight">
                            <p><strong>1.</strong> Kartu ini berlaku selama 3 (tiga) tahun atau selama terdaftar sebagai murid aktif SMK Negeri 2 Konawe.</p>
                            <p><strong>2.</strong> Wajib dibawa setiap hari sebagai kartu identitas resmi dan absensi digital.</p>
                            <p><strong>3.</strong> Tidak dapat dipindahtangankan kepada orang lain.</p>
                            <p><strong>4.</strong> Apabila kartu hilang atau rusak, segera melapor ke bagian Tata Usaha Sekolah.</p>

                            <div className="pt-2 text-right">
                              <p className="text-[7px] text-slate-500">Kepala Sekolah,</p>
                              <p className="text-[8.5px] font-black text-slate-950 mt-1">Drs. H. ABD. MANAN, M.M.</p>
                              <p className="text-[6.5px] font-mono text-slate-500">NIP. 19680510 199403 1 002</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center p-1.5 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                            {qrImage ? (
                              <img src={qrImage} alt={`QR ${student.name}`} className="w-20 h-20 object-contain rounded" />
                            ) : (
                              <div className="w-20 h-20 flex items-center justify-center bg-slate-100">
                                <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                              </div>
                            )}
                            <span className="text-[7px] font-mono font-bold text-slate-800 mt-0.5">NISN: {student.nisn || student.id}</span>
                            <span className="text-[6px] uppercase font-bold text-slate-400">QR Presensi Murid</span>
                          </div>
                        </div>

                        <div className="px-3 py-1 bg-slate-50 border-t border-slate-200 text-center text-[7px] text-slate-400">
                          SMK Negeri 2 Konawe • Jl. Poros Kendari - Kolaka
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* FORMAT STIKER RINGKAS MEJA / BUKU (3-4 Kolom) */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
                {filteredStudents.map((student) => {
                  const qrImage = qrMap[student.id];
                  const studentMajor = getCleanMajor(student);

                  return (
                    <div
                      key={student.id}
                      className="page-break-avoid bg-white border border-slate-300 rounded-xl p-2.5 flex flex-col items-center text-center justify-between shadow-2xs"
                      style={{ height: "185px" }}
                    >
                      <div className="w-full flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-white p-0.5 border border-blue-200 mb-1 overflow-hidden">
                          <img src={SCHOOL_LOGO_URL} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <p className="text-[7px] font-black uppercase text-blue-900 tracking-wider">SMK NEGERI 2 KONAWE</p>
                        <p className="text-[10px] font-black text-slate-900 truncate mt-0.5 leading-tight w-full">{student.name}</p>
                        <p className="text-[8px] font-extrabold text-blue-700 truncate w-full">{studentMajor}</p>
                      </div>

                      <div className="p-1 bg-slate-50 border border-slate-200 rounded my-1">
                        {qrImage ? (
                          <img src={qrImage} alt={`QR ${student.name}`} className="w-18 h-18 object-contain" />
                        ) : (
                          <div className="w-18 h-18 flex items-center justify-center bg-slate-100">
                            <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                          </div>
                        )}
                      </div>

                      <div className="w-full">
                        <p className="text-[8px] font-mono font-bold text-slate-800">NISN: {student.nisn || student.id || "-"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs no-print">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Total {filteredStudents.length} kartu siap cetak. Gunakan kertas A4 atau kertas tebal/PVC untuk hasil terbaik.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              disabled={filteredStudents.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 active:scale-95 text-white font-black rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Sekarang (Print / PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
