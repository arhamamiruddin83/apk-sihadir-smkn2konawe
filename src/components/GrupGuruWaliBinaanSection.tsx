/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, UserCheck, Plus, Search, Trash2, Printer, 
  HeartHandshake, ChevronDown, ChevronUp, CheckCircle, 
  AlertCircle, Sparkles, Filter, FileSpreadsheet, X, 
  Award, BookOpen, GraduationCap, ShieldCheck
} from "lucide-react";
import { 
  getMasterGuruWaliData, 
  saveMasterGuruWaliData, 
  GuruWaliMasterItem, 
  BimbinganMuridItem 
} from "../data/guruWaliMasterData";

interface GrupGuruWaliBinaanSectionProps {
  currentTeacherName: string;
  currentRole?: string;
  onNavigateToTab?: (tab: string) => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export function GrupGuruWaliBinaanSection({
  currentTeacherName,
  currentRole = "guru",
  onNavigateToTab,
  isOpenModal = false,
  onCloseModal
}: GrupGuruWaliBinaanSectionProps) {
  // Load master data with fallback
  const [masterData, setMasterData] = useState<GuruWaliMasterItem[]>(() => {
    return getMasterGuruWaliData();
  });

  const [activeTab, setActiveTab] = useState<"saya" | "semua">("saya");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("Semua");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form add new student to a group
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetGuruId, setTargetGuruId] = useState<string>("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("XI TKR A");
  const [newStudentNote, setNewStudentNote] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Match current teacher to a group in master data
  const matchedMyGroup = useMemo(() => {
    if (!currentTeacherName) return masterData[0] || null;
    const cleanCurrent = currentTeacherName.toLowerCase().replace(/[^a-z0-9]/g, "");

    const found = masterData.find(g => {
      const cleanG = g.namaGuru.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cleanG.includes(cleanCurrent) || cleanCurrent.includes(cleanG);
    });

    if (found) return found;

    // If current teacher name has Arham / Amiruddin
    if (cleanCurrent.includes("arham") || cleanCurrent.includes("amiruddin")) {
      const arham = masterData.find(g => g.namaGuru.toLowerCase().includes("arham"));
      if (arham) return arham;
    }
    // If has Muslimin
    if (cleanCurrent.includes("muslimin")) {
      const m = masterData.find(g => g.namaGuru.toLowerCase().includes("muslimin"));
      if (m) return m;
    }
    // If has Haerul
    if (cleanCurrent.includes("haerul")) {
      const h = masterData.find(g => g.namaGuru.toLowerCase().includes("haerul"));
      if (h) return h;
    }
    // If has Putu
    if (cleanCurrent.includes("putu") || cleanCurrent.includes("juniasa")) {
      const p = masterData.find(g => g.namaGuru.toLowerCase().includes("putu"));
      if (p) return p;
    }

    // Default to first teacher or create virtual matched group
    return masterData[0] || null;
  }, [currentTeacherName, masterData]);

  // Handle adding student to a specific group
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      showToast("Nama murid tidak boleh kosong!");
      return;
    }

    const guruId = targetGuruId || matchedMyGroup?.id || masterData[0]?.id;
    if (!guruId) return;

    const newStudent: BimbinganMuridItem = {
      id: "m-custom-" + Date.now(),
      nama: newStudentName.trim().toUpperCase(),
      kelas: newStudentClass.trim(),
      keterangan: newStudentNote.trim() || undefined
    };

    const updated = masterData.map(g => {
      if (g.id === guruId) {
        return {
          ...g,
          muridList: [newStudent, ...g.muridList]
        };
      }
      return g;
    });

    setMasterData(updated);
    saveMasterGuruWaliData(updated);
    setIsAddModalOpen(false);
    setNewStudentName("");
    setNewStudentNote("");
    showToast(`Berhasil menambahkan ${newStudent.nama} ke grup binaan!`);
  };

  // Handle delete student from group
  const handleDeleteStudent = (guruId: string, studentId: string, studentName: string) => {
    if (window.confirm(`Hapus ${studentName} dari kelompok binaan ini?`)) {
      const updated = masterData.map(g => {
        if (g.id === guruId) {
          return {
            ...g,
            muridList: g.muridList.filter(m => m.id !== studentId)
          };
        }
        return g;
      });
      setMasterData(updated);
      saveMasterGuruWaliData(updated);
      showToast(`${studentName} telah dihapus dari kelompok.`);
    }
  };

  // Total metrics
  const totalGuruCount = masterData.length;
  const totalMuridCount = useMemo(() => {
    return masterData.reduce((acc, g) => acc + (g.muridList?.length || 0), 0);
  }, [masterData]);

  // Filtering for "Semua Grup"
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q && selectedClassFilter === "Semua") return masterData;

    return masterData
      .map(g => {
        const matchesGuruName = g.namaGuru.toLowerCase().includes(q);
        const filteredMurid = (g.muridList || []).filter(m => {
          const matchName = m.nama.toLowerCase().includes(q);
          const matchClass = selectedClassFilter === "Semua" || m.kelas.toLowerCase().includes(selectedClassFilter.toLowerCase());
          return (matchesGuruName || matchName) && matchClass;
        });

        if (matchesGuruName || filteredMurid.length > 0) {
          return {
            ...g,
            muridList: matchesGuruName && selectedClassFilter === "Semua" ? g.muridList : filteredMurid
          };
        }
        return null;
      })
      .filter((g): g is GuruWaliMasterItem => g !== null);
  }, [masterData, searchQuery, selectedClassFilter]);

  // Print official SK Rekap Grup Guru Wali
  const handlePrintRekapPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Izinkan pop-up untuk mencetak dokumen PDF.");
      return;
    }

    const todayFormatted = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    let tableRows = "";
    let globalNo = 1;

    masterData.forEach((gw) => {
      const muridCount = gw.muridList?.length || 0;
      if (muridCount === 0) {
        tableRows += `
          <tr>
            <td style="text-align: center;">${globalNo++}</td>
            <td><strong>${gw.namaGuru}</strong></td>
            <td colspan="3" style="text-align: center; color: #64748b; font-style: italic;">Belum ada murid binaan</td>
          </tr>
        `;
      } else {
        gw.muridList.forEach((m, idx) => {
          if (idx === 0) {
            tableRows += `
              <tr>
                <td rowspan="${muridCount}" style="text-align: center; vertical-align: top; font-weight: bold;">${globalNo++}</td>
                <td rowspan="${muridCount}" style="vertical-align: top; font-weight: bold; background-color: #f8fafc;">
                  ${gw.namaGuru}
                  <div style="font-size: 8pt; color: #475569; font-weight: normal; margin-top: 2px;">
                    Total: ${muridCount} Murid Binaan
                  </div>
                </td>
                <td style="text-align: center;">${idx + 1}</td>
                <td><strong>${m.nama}</strong></td>
                <td style="text-align: center;"><span class="badge-class">${m.kelas}</span></td>
                <td style="font-size: 8pt; color: #64748b;">${m.keterangan || "-"}</td>
              </tr>
            `;
          } else {
            tableRows += `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td>${m.nama}</td>
                <td style="text-align: center;"><span class="badge-class">${m.kelas}</span></td>
                <td style="font-size: 8pt; color: #64748b;">${m.keterangan || "-"}</td>
              </tr>
            `;
          }
        });
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>Rekap_Grup_Guru_Wali_SMKN2_Konawe_2026_2027</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 10px;
              font-size: 9pt;
              line-height: 1.3;
            }
            .kop {
              border-bottom: 3px double #000;
              padding-bottom: 8px;
              margin-bottom: 14px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 14px;
            }
            .kop-logo {
              width: 75px;
              height: 75px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .kop-logo img {
              max-height: 75px;
              max-width: 75px;
              width: auto;
              height: auto;
              object-fit: contain;
            }
            .kop-text {
              flex: 1;
              text-align: center;
            }
            .kop-text h4 {
              margin: 0;
              font-size: 10.5pt;
              font-weight: bold;
              letter-spacing: 0.5px;
            }
            .kop-text h2 {
              margin: 2px 0;
              font-size: 12.5pt;
              font-weight: 900;
              letter-spacing: 0.5px;
            }
            .kop-text h1 {
              margin: 2px 0;
              font-size: 15pt;
              font-weight: 900;
              color: #1e3a8a;
              letter-spacing: 1px;
            }
            .kop-text p {
              margin: 2px 0 0 0;
              font-size: 8pt;
              font-style: italic;
            }
            .title-section {
              text-align: center;
              margin-bottom: 14px;
            }
            .title-section h3 {
              margin: 0;
              font-size: 11pt;
              font-weight: 900;
              text-decoration: underline;
              text-transform: uppercase;
            }
            .title-section p {
              margin: 3px 0 0 0;
              font-size: 8.5pt;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              font-size: 8.5pt;
            }
            th, td {
              border: 1px solid #334155;
              padding: 4px 6px;
            }
            th {
              background-color: #f1f5f9;
              font-weight: bold;
              text-align: center;
              text-transform: uppercase;
              font-size: 8pt;
            }
            .badge-class {
              display: inline-block;
              padding: 1px 4px;
              background-color: #e0e7ff;
              color: #3730a3;
              border-radius: 3px;
              font-weight: bold;
              font-size: 7.5pt;
            }
            .signatures {
              margin-top: 25px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .sign-box {
              width: 280px;
              text-align: center;
              font-size: 9pt;
            }
            .sign-space {
              height: 55px;
            }
            .no-print {
              margin-bottom: 15px;
              text-align: right;
            }
            .print-btn {
              background-color: #0f766e;
              color: white;
              padding: 8px 16px;
              border: none;
              border-radius: 6px;
              font-weight: bold;
              cursor: pointer;
              font-size: 10pt;
            }
            @media print {
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button class="print-btn" onclick="window.print()">🖨️ Cetak / Simpan Rekap PDF</button>
          </div>

          <div class="kop">
            <div class="kop-logo" title="Logo Provinsi Sulawesi Tenggara">
              <img 
                src="https://i.ibb.co/kgCmjh0j/kdio.gif" 
                alt="Logo Provinsi Sulawesi Tenggara" 
                onerror="this.onerror=null; this.src='https://i.ibb.co.com/kgCmjh0j/kdio.gif';"
              />
            </div>
            <div class="kop-text">
              <h4>PEMERINTAH PROVINSI SULAWESI TENGGARA</h4>
              <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
              <h1>SMK NEGERI 2 KONAWE</h1>
              <p>Jalan Poros Kendari-Kolaka, Kab. Konawe, Sulawesi Tenggara | NPSN: 40402871</p>
            </div>
            <div class="kop-logo" title="Logo SMK Negeri 2 Konawe">
              <img 
                src="https://i.ibb.co.com/TMkWkNY4/LOGO-SMKN-2-KONAWE-BARU.png" 
                alt="Logo SMK Negeri 2 Konawe" 
                onerror="this.onerror=null; this.src='https://i.ibb.co.com/TMkWkNY4/LOGO-SMKN-2-KONAWE-BARU.png';"
              />
            </div>
          </div>

          <div class="title-section">
            <h3>DAFTAR NAMA GURU WALI DAN MURID BINAAN</h3>
            <p>SURAT KEPUTUSAN KEPALA SEKOLAH SMKN 2 KONAWE TAHUN PELAJARAN 2026/2027</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 25px;">No</th>
                <th style="width: 170px;">Nama Guru Wali</th>
                <th style="width: 25px;">No</th>
                <th>Nama Murid Binaan</th>
                <th style="width: 80px;">Kelas Asal</th>
                <th style="width: 110px;">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="signatures">
            <div class="sign-box">
              <p>Mengetahui,</p>
              <p>Waka Kesiswaan</p>
              <div class="sign-space"></div>
              <p><strong><u>NYOMAN SULIAWATI, S.Pd., M.Pd.</u></strong></p>
              <p>NIP. 19740510 200212 2 006</p>
            </div>

            <div class="sign-box">
              <p>Konawe, ${todayFormatted}</p>
              <p>Kepala SMK Negeri 2 Konawe</p>
              <div class="sign-space"></div>
              <p><strong><u>Drs. H. ABD. MANAN, M.M.</u></strong></p>
              <p>NIP. 19650812 199003 1 008</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const content = (
    <div className="bg-white border border-teal-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/60 rounded-full blur-3xl pointer-events-none" />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg border border-emerald-500 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-teal-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-sm shrink-0">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-teal-100 text-teal-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border border-teal-200 tracking-wider">
                Grup Guru Wali & Murid Binaan
              </span>
              <span className="text-slate-300 text-xs">|</span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                SK SMKN 2 Konawe (NPSN: 40402871)
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">
              Kelompok Guru Wali & Murid Asuh Terintegrasi
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-2xl">
              Setiap guru membina kelompok murid lintas jurusan untuk bimbingan karakter, akademik, dan kedisiplinan secara mandiri.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setTargetGuruId(matchedMyGroup?.id || masterData[0]?.id || "");
              setIsAddModalOpen(true);
            }}
            className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-black px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Murid Binaan</span>
          </button>

          <button
            type="button"
            onClick={handlePrintRekapPDF}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Cetak format tabel dinas resmi PDF"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Rekap SK PDF</span>
          </button>

          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab("kerjaan-guru-wali")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-3 py-2.5 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Buka Workspace Bimbingan Guru Wali"
            >
              <BookOpen className="h-4 w-4" />
              <span>Workspace Bimbingan →</span>
            </button>
          )}

          {isOpenModal && onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-teal-50/70 border border-teal-100 p-3.5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-teal-700 block">Guru Wali Aktif</span>
          <span className="text-xl font-black text-teal-950 mt-0.5 block">{totalGuruCount} Guru</span>
          <span className="text-[9px] text-teal-600 font-semibold">Memiliki grup binaan</span>
        </div>
        <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-indigo-700 block">Total Murid Binaan</span>
          <span className="text-xl font-black text-indigo-950 mt-0.5 block">{totalMuridCount} Murid</span>
          <span className="text-[9px] text-indigo-600 font-semibold">Tersebar di seluruh grup</span>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Binaan Guru Ini</span>
          <span className="text-xl font-black text-emerald-950 mt-0.5 block">
            {matchedMyGroup ? matchedMyGroup.muridList.length : 0} Murid
          </span>
          <span className="text-[9px] text-emerald-700 font-semibold truncate block">
            {matchedMyGroup?.namaGuru || currentTeacherName}
          </span>
        </div>
        <div className="bg-amber-50/70 border border-amber-100 p-3.5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Status Validasi SK</span>
          <span className="text-xl font-black text-amber-950 mt-0.5 block">TERVERIFIKASI</span>
          <span className="text-[9px] text-amber-700 font-semibold">Tahun Ajaran 2026/2027</span>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("saya")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "saya"
              ? "bg-teal-700 text-white shadow-sm"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Murid Binaan Saya ({matchedMyGroup ? matchedMyGroup.muridList.length : 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("semua")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "semua"
              ? "bg-teal-700 text-white shadow-sm"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Semua Grup Guru Wali ({totalGuruCount} Kelompok Guru)</span>
        </button>
      </div>

      {/* TAB 1: MURID BINAAN SAYA */}
      {activeTab === "saya" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-300 block tracking-wider">
                Kelompok Bimbingan Mandiri Pendidik
              </span>
              <h4 className="text-lg font-black text-white mt-0.5">
                {matchedMyGroup?.namaGuru || currentTeacherName}
              </h4>
              <p className="text-xs text-teal-100/80 mt-0.5">
                Mengampu {matchedMyGroup?.muridList.length || 0} murid binaan untuk pendampingan belajar, kehadiran, dan kedisiplinan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTargetGuruId(matchedMyGroup?.id || "");
                setIsAddModalOpen(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>+ Tambah Murid ke Grup Saya</span>
            </button>
          </div>

          {/* Table of Students in My Group */}
          {matchedMyGroup && matchedMyGroup.muridList.length > 0 ? (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Nama Murid</th>
                      <th className="py-3 px-4 w-36 text-center">Kelas Asal</th>
                      <th className="py-3 px-4">Keterangan / Kasus Bimbingan</th>
                      <th className="py-3 px-4 w-28 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {matchedMyGroup.muridList.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-teal-50/40 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-black text-[11px] shrink-0">
                              {m.nama.substring(0, 1)}
                            </div>
                            <span>{m.nama}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg border border-indigo-200 text-[11px] inline-block font-mono">
                            {m.kelas}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {m.keterangan ? (
                            <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                              {m.keterangan}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Bimbingan Rutin Berkala</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(matchedMyGroup.id, m.id, m.nama)}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Hapus dari grup bimbingan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <Users className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 font-bold">Belum ada murid bimbingan yang terdaftar pada nama guru ini.</p>
              <button
                type="button"
                onClick={() => {
                  setTargetGuruId(matchedMyGroup?.id || "");
                  setIsAddModalOpen(true);
                }}
                className="bg-teal-700 text-white text-xs font-black px-4 py-2 rounded-xl"
              >
                + Masukkan Murid Binaan Pertama
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEMUA GRUP GURU WALI */}
      {activeTab === "semua" && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama murid atau nama guru wali di seluruh sekolah..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="Semua">Semua Kelas</option>
                <option value="TKR">Jurusan Otomotif TKR</option>
                <option value="TSM">Jurusan Sepeda Motor TSM</option>
                <option value="DPIB">Jurusan Bangunan DPIB</option>
                <option value="TAV">Jurusan Audio Video TAV</option>
                <option value="TITL">Jurusan Listrik TITL</option>
                <option value="DKV">Jurusan Multimedia / DKV</option>
                <option value="TP">Jurusan Pemesinan TP</option>
              </select>
            </div>
          </div>

          {/* Group Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((gw) => {
              const isMine = matchedMyGroup?.id === gw.id;
              return (
                <div 
                  key={gw.id} 
                  className={`bg-white border rounded-2xl p-4.5 shadow-xs transition-all flex flex-col justify-between space-y-3 ${
                    isMine ? "border-teal-400 ring-2 ring-teal-500/20 bg-teal-50/10" : "border-slate-200 hover:border-teal-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                          {gw.no}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 truncate" title={gw.namaGuru}>
                            {gw.namaGuru}
                          </h4>
                          <span className="text-[10px] text-teal-700 font-bold block">
                            Guru Wali SMKN 2 Konawe
                          </span>
                        </div>
                      </div>

                      <span className="bg-teal-100 text-teal-900 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                        {gw.muridList.length} Murid
                      </span>
                    </div>

                    {/* Student list */}
                    <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {gw.muridList.map((m, mIdx) => (
                        <div 
                          key={m.id} 
                          className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl text-[11px] hover:bg-teal-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-slate-400 text-[10px] font-bold w-4">{mIdx + 1}.</span>
                            <span className="font-bold text-slate-800 truncate" title={m.nama}>
                              {m.nama}
                            </span>
                            {m.keterangan && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1 rounded">
                                {m.keterangan}
                              </span>
                            )}
                          </div>
                          <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0">
                            {m.kelas}
                          </span>
                        </div>
                      ))}

                      {gw.muridList.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic py-2 text-center">
                          Belum ada murid binaan
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetGuruId(gw.id);
                        setIsAddModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Murid</span>
                    </button>

                    {isMine && (
                      <span className="text-[10px] font-black bg-teal-600 text-white px-2 py-0.5 rounded-full">
                        Grup Anda
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Add Student to Group */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Tambah Murid Binaan</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Masukkan ke dalam grup Guru Wali terpilih</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Pilih Guru Wali Penanggung Jawab
                </label>
                <select
                  value={targetGuruId}
                  onChange={(e) => setTargetGuruId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {masterData.map(gw => (
                    <option key={gw.id} value={gw.id}>
                      {gw.no}. {gw.namaGuru} ({gw.muridList.length} Murid)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Nama Lengkap Murid
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Contoh: MUHAMMAD RIZKY PRATAMA"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Kelas Asal
                  </label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  >
                    <option value="X TKR A">X TKR A</option>
                    <option value="XI TKR A">XI TKR A</option>
                    <option value="XI TKR B">XI TKR B</option>
                    <option value="XII TKR A">XII TKR A</option>
                    <option value="X TSM A">X TSM A</option>
                    <option value="XI TSM">XI TSM</option>
                    <option value="XII TSM">XII TSM</option>
                    <option value="X DPIB">X DPIB</option>
                    <option value="XI DPIB">XI DPIB</option>
                    <option value="XII DPIB">XII DPIB</option>
                    <option value="X DKV">X DKV</option>
                    <option value="XI DKV">XI DKV</option>
                    <option value="X TAV">X TAV</option>
                    <option value="XI TAV">XI TAV</option>
                    <option value="X TITL">X TITL</option>
                    <option value="XI TITL">XI TITL</option>
                    <option value="X TP">X TP</option>
                    <option value="XI TP">XI TP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Catatan Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newStudentNote}
                    onChange={(e) => setNewStudentNote(e.target.value)}
                    placeholder="Misal: TDK NAIK / Perlu Pendampingan"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-black shadow-sm"
                >
                  Simpan Murid Binaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (isOpenModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <div className="w-full max-w-6xl my-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
