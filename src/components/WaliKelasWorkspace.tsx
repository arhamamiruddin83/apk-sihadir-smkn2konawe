import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, MessageSquare, CheckCircle, AlertTriangle, FileText, Send, Search, Filter, Phone, UserCheck, Shield, ChevronRight, ClipboardList } from "lucide-react";
import { MOCK_STUDENTS } from "../mockData";
import { getTeacherPerwalianClass } from "../utils/scheduleHelper";
import { WALI_KELAS_LIST, getWaliKelasForClass } from "../data/waliKelasData";
import { IndividualStudentReportModal, StudentReportItem } from "./IndividualStudentReportModal";
import { Comprehensive15WitaReportModal } from "./Comprehensive15WitaReportModal";
import { Clock, Megaphone } from "lucide-react";

interface WaliKelasWorkspaceProps {
  username?: string;
  currentRole?: string;
  onNavigateToTab?: (tab: string) => void;
}

export function WaliKelasWorkspace({ username = "Wali Kelas", currentRole = "wali", onNavigateToTab }: WaliKelasWorkspaceProps) {
  // Determine exact homeroom class based on teacher username
  const getDefaultClassForTeacher = (uName: string) => {
    const found = getTeacherPerwalianClass(uName);
    if (found) return found;
    const clean = uName.toLowerCase();
    if (clean.includes("arbianti")) return "X DKV";
    if (clean.includes("haerul")) return "XII TKR A";
    if (clean.includes("hiswan")) return "X TKR A";
    if (clean.includes("muharjun")) return "X TKR B";
    if (clean.includes("khotijah") || clean.includes("sitti")) return "X TSM";
    if (clean.includes("salma")) return "X TAV";
    if (clean.includes("juniasa") || clean.includes("putu")) return "X DPIB";
    if (clean.includes("saiful")) return "XI TKR B";
    if (clean.includes("arham")) return "XI TKR A";
    if (clean.includes("wahyu")) return "XI TSM A";
    if (clean.includes("eva") || clean.includes("syahtriana") || clean.includes("evasyatriana")) return "XI DPIB";
    if (clean.includes("daniel") || (clean.includes("triana") && !clean.includes("eva") && !clean.includes("syah"))) return "XI TSM B";
    if (clean.includes("isnawati")) return "XI TAV";
    if (clean.includes("muslimin")) return "XI DKV";
    if (clean.includes("syamsul")) return "XII TSM";
    if (clean.includes("nyoman") || clean.includes("suliawati")) return "XII TAV";
    if (clean.includes("elis")) return "XII DPIB";
    if (clean.includes("nunung")) return "XII TKR B";
    return "X DKV";
  };

  const [selectedClass, setSelectedClass] = useState(() => getDefaultClassForTeacher(username));
  const [searchQuery, setSearchQuery] = useState("");
  const [noteStudentName, setNoteStudentName] = useState("");
  const [noteType, setNoteType] = useState("Konsultasi");
  const [noteText, setNoteText] = useState("");

  // Modal State for Individual Student Report
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReportStudent, setSelectedReportStudent] = useState<StudentReportItem | null>(null);
  const [comprehensiveModalOpen, setComprehensiveModalOpen] = useState(false);

  // Sync selected class when username changes
  useEffect(() => {
    if (username) {
      const targetClass = getDefaultClassForTeacher(username);
      if (targetClass !== selectedClass) {
        setSelectedClass(targetClass);
      }
    }
  }, [username, selectedClass]);

  const assignedWaliName = getWaliKelasForClass(selectedClass) || username;

  // Load students for selected homeroom class
  const getStudentsForClass = (className: string) => {
    const matched = MOCK_STUDENTS.filter(s => (s.className || "").trim().toUpperCase() === className.trim().toUpperCase());
    if (matched.length > 0) {
      return matched.map((s, idx) => ({
        id: s.id,
        name: s.name,
        nis: s.nis || `210${idx + 1}`,
        attendance: `${90 + (idx % 10)}%`,
        status: (idx % 6 === 2) ? "Perlu Pembinaan" : "Tuntas",
        score: `${80 + (idx % 15)}`,
        parentPhone: s.parentWhatsApp || s.whatsApp || "08123456789",
        lastNote: `Murid terdaftar aktif kelas ${className}`
      }));
    }

    // Default fallback list if class not found
    return [
      { id: "s1", name: "Ahmad Rizky", nis: "21001", attendance: "98%", status: "Tuntas", score: "88", parentPhone: "08123456789", lastNote: "Sangat aktif dalam kegiatan kelas." },
      { id: "s2", name: "Bagus Setiawan", nis: "21002", attendance: "82%", status: "Perlu Pembinaan", score: "70", parentPhone: "08129876543", lastNote: "Membutuhkan perhatian kehadiran." },
      { id: "s3", name: "Candra Wijaya", nis: "21003", attendance: "95%", status: "Tuntas", score: "85", parentPhone: "08134567890", lastNote: "Disiplin dan taat tata tertib." }
    ];
  };

  const students = getStudentsForClass(selectedClass);

  const [classNotes, setClassNotes] = useState([
    { id: "cn1", studentName: students[0]?.name || "Murid Binaan", date: "Hari Ini", type: "Peringatan Absensi", text: "Dipanggil untuk klarifikasi kehadiran minggu ketiga.", author: username }
  ]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteStudentName.trim() || !noteText.trim()) return;
    
    const newNote = {
      id: "cn-" + Date.now(),
      studentName: noteStudentName,
      date: "Hari Ini",
      type: noteType,
      text: noteText,
      author: username
    };

    setClassNotes([newNote, ...classNotes]);
    setNoteStudentName("");
    setNoteText("");
  };

  const handleOpenReportModal = (st: StudentReportItem) => {
    setSelectedReportStudent(st);
    setReportModalOpen(true);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nis.includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl text-white shadow-lg border border-purple-700/40 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/30 text-purple-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-purple-400/30 tracking-wider">
              Workspace Wali Kelas
            </span>
            <span className="text-xs text-purple-300 font-bold">• {username}</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-purple-400" />
            TUGAS & KONTROL WALI KELAS ({selectedClass})
          </h2>
          <p className="text-xs text-purple-200/90 leading-relaxed font-medium max-w-2xl">
            Kelola data presensi, rekapitulasi nilai semua mata pelajaran dari input guru mapel, serta buat laporan individu murid untuk diteruskan ke grup WA Orang Tua.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10 flex-wrap">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">Kelas Perwalian</span>
            <span className="text-sm font-black text-white block">{selectedClass}</span>
            <span className="text-[9px] text-purple-200 block truncate max-w-[180px]">Wali: {assignedWaliName}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem("sihadir_target_perwalian_class", selectedClass);
              onNavigateToTab?.("student-attendance");
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <UserCheck className="h-4 w-4" />
            <span>Presensi {selectedClass}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab?.("parent-report")}
            className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Laporan WA Ortu</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab?.("kredit-pelanggaran")}
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-rose-400/30"
          >
            <Shield className="h-4 w-4" />
            <span>Poin Pelanggaran {selectedClass}</span>
          </button>
          <button
            type="button"
            onClick={() => setComprehensiveModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-amber-300/40"
          >
            <Clock className="h-4 w-4 text-slate-950" />
            <span>Rekap 15.00 WITA</span>
          </button>
        </div>
      </div>

      {/* Banner Siaran Rekapitulasi Presensi Terperinci 15.00 WITA */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-400/30 shrink-0">
            <Megaphone className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Pukul 15.00 WITA
              </span>
              <span className="text-xs font-bold text-amber-300">
                Transparansi Presensi — Menghindari Dusta di Antara Kita
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white">
              Rekapitulasi Presensi Terperinci Seluruh Sekolah (Murid, Guru & Staf TU)
            </h3>
            <p className="text-xs text-emerald-100/80 max-w-3xl">
              Tepat pukul 15.00 WITA saat KBM ditutup, rekap kehadiran murid per kelas, dewan guru yang bertugas & jurnalnya, serta staf Tata Usaha terekap tuntas dan disiarkan ke Saluran / Grup WhatsApp Sekolah.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setComprehensiveModalOpen(true)}
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Clock className="h-4 w-4" />
            <span>Buka Rekap 15.00 WITA</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2-Cols: Daftar Kehadiran & Rekap Laporan Murid Binaan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider block">
                  Kelas Binaan Wali Kelas
                </span>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Daftar Murid Kelas {selectedClass}</span>
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-200">
                    Wali Kelas: {assignedWaliName}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="bg-purple-50 border border-purple-200 text-purple-900 px-3 py-1.5 rounded-xl text-xs font-black shrink-0">
                  📌 {selectedClass}
                </div>

                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama / NIS..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Attendance & Grades Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                    <th className="py-2.5 px-2">Nama Murid</th>
                    <th className="px-2">NIS</th>
                    <th className="px-2">Kehadiran</th>
                    <th className="px-2">Status</th>
                    <th className="px-2">Rata-rata</th>
                    <th className="px-2 text-right">Aksi Laporan & WA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-purple-50/30 transition-all">
                      <td className="py-3 px-2">
                        <div className="font-extrabold text-slate-900">{st.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{st.lastNote}</div>
                      </td>
                      <td className="px-2 font-mono text-slate-500">{st.nis}</td>
                      <td className="px-2 font-black text-indigo-700">{st.attendance}</td>
                      <td className="px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          st.status === "Tuntas" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                        }`}>
                          {st.status}
                        </span>
                      </td>
                      <td className="px-2 font-bold text-slate-800">{st.score}</td>
                      <td className="px-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenReportModal(st)}
                            className="inline-flex items-center gap-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-xs"
                          >
                            <ClipboardList className="h-3 w-3" />
                            <span>Rekap Laporan</span>
                          </button>

                          <a
                            href={`https://wa.me/${st.parentPhone}?text=Halo%20Bapak%2FIbu%20Wali%20dari%20${encodeURIComponent(st.name)},%20berikut%20laporan%20kehadiran%20(${st.attendance})%20dan%20perkembangan%20belajar%20dari%20Wali%20Kelas%20${selectedClass}.`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded-lg transition-all"
                            title="Kirim WA Ortu"
                          >
                            <Phone className="h-3 w-3" />
                            <span>WA</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 italic font-medium">
                        Murid tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1-Col: Kontrol Wali Kelas & Form Catatan */}
        <div className="space-y-4">
          {/* Kontrol Wali Kelas Card */}
          <div className="bg-purple-900 text-white rounded-3xl p-5 shadow-sm space-y-4 border border-purple-800">
            <div className="flex items-center gap-2 border-b border-purple-700 pb-3">
              <Shield className="h-5 w-5 text-purple-300" />
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-100">
                Kontrol Wali Kelas {selectedClass}
              </h3>
            </div>

            <p className="text-xs text-purple-200 leading-relaxed font-medium">
              Data nilai ditarik langsung dari hasil input masing-masing Guru Mata Pelajaran. Anda dapat membuat rekapitulasi narasi WA atau laporan cetak PDF untuk wali murid.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => onNavigateToTab?.("parent-report")}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                Layanan Laporan WA Ortu
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab?.("kredit-pelanggaran")}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-rose-400/30"
              >
                <Shield className="h-4 w-4" />
                Catatan Poin Pelanggaran {selectedClass}
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab?.("rekap-laporan")}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
              >
                <FileText className="h-4 w-4 text-purple-300" />
                Rekap Laporan Kelas Binaan
              </button>
            </div>
          </div>

          {/* Form Input Catatan Khusus Wali Kelas */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              Input Catatan Wali Kelas
            </h4>

            <form onSubmit={handleAddNote} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Pilih / Ketik Nama Murid
                </label>
                <input
                  type="text"
                  value={noteStudentName}
                  onChange={(e) => setNoteStudentName(e.target.value)}
                  placeholder="Contoh: Bagus Setiawan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Kategori Catatan
                </label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold cursor-pointer"
                >
                  <option value="Konsultasi">Konsultasi Personal</option>
                  <option value="Peringatan Absensi">Peringatan Absensi</option>
                  <option value="Apresiasi Prestasi">Apresiasi Prestasi</option>
                  <option value="Koordinasi Ortu">Koordinasi Orang Tua</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Isi Catatan & Tindak Lanjut
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Deskripsikan hasil konseling/catatan wali kelas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold uppercase text-[10px] py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Simpan Catatan Wali Kelas
              </button>
            </form>

            {/* List of Recent Notes */}
            <div className="space-y-2 pt-2 border-t">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Catatan Terbaru
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {classNotes.map(note => (
                  <div key={note.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-extrabold text-slate-900">{note.studentName}</span>
                      <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">{note.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modal Rekapitulasi Laporan Individu Murid */}
      <IndividualStudentReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        student={selectedReportStudent}
        className={selectedClass}
        waliKelasName={assignedWaliName}
      />

      {/* Modal Rekapitulasi Presensi Terpadu 15.00 WITA */}
      <Comprehensive15WitaReportModal
        isOpen={comprehensiveModalOpen}
        onClose={() => setComprehensiveModalOpen(false)}
      />
    </div>
  );
}
