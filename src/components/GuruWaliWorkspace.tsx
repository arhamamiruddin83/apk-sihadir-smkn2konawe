import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HeartHandshake,
  MessageSquare, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Phone, 
  Search, 
  ShieldCheck, 
  User, 
  Sparkles,
  UserPlus,
  Trash2,
  GraduationCap,
  Layers,
  BookOpen,
  UserCheck
} from "lucide-react";
import { 
  getMasterGuruWaliData, 
  saveMasterGuruWaliData, 
  GuruWaliMasterItem 
} from "../data/guruWaliMasterData";

interface BimbinganStudent {
  id: string;
  name: string;
  nisn: string;
  kelas: string;
  jurusan: string;
  addedAt?: string;
}

interface BimbinganSession {
  id: string;
  studentName: string;
  nisn?: string;
  className: string;
  jurusan?: string;
  focus: string;
  date: string;
  status: "Selesai Konsultasi" | "Butuh Pendampingan" | "Terjadwal";
  notes: string;
}

interface GuruWaliWorkspaceProps {
  username?: string;
  currentRole?: string;
  onNavigateToTab?: (tab: string) => void;
}

const DEFAULT_STUDENTS: BimbinganStudent[] = [
  { id: "m-3-1", name: "Radit Aditya", nisn: "0065432101", kelas: "X TKR A", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-2", name: "Rehan Jaenuri", nisn: "0065432102", kelas: "XI TKR A", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-3", name: "RIFKY FEBRIYANTO", nisn: "0065432103", kelas: "XI TKR A", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-4", name: "RISKI ARDIANA", nisn: "0065432104", kelas: "X TKR A", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-5", name: "RONAL SETIAWAN", nisn: "0065432105", kelas: "XI TKR A", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-6", name: "USAMAH ABDURRAHMAN", nisn: "0065432106", kelas: "XI TKR A", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-7", name: "VERI SUDANA", nisn: "0065432107", kelas: "XI TKR A", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-8", name: "ABDURAFI ASRIFIN", nisn: "0065432108", kelas: "XI TKR B", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-9", name: "ABI SAIFUL ANZHOR", nisn: "0065432109", kelas: "XI TKR B", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-10", name: "Adi Guna", nisn: "0065432110", kelas: "XI TKR B", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-11", name: "ALOISIUS REVANT GONSALES", nisn: "0065432111", kelas: "XI TKR B", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-12", name: "Arfiqun Al Faturrahman", nisn: "0065432112", kelas: "XI TKR B", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-13", name: "BAYU", nisn: "0065432113", kelas: "XI TKR B", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-14", name: "DIPA PRATAMA", nisn: "0065432114", kelas: "XI TKR B", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-15", name: "FAIZ NUR AFRIANZAH", nisn: "0065432115", kelas: "XI TKR B", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" },
  { id: "m-3-16", name: "FERDIANSYAH", nisn: "0065432116", kelas: "XI TKR B", jurusan: "Teknik Kendaraan Ringan (TKR)", addedAt: "2026-08-01" }
];

const DEFAULT_SESSIONS: BimbinganSession[] = [
  { id: "w1", studentName: "Radit Aditya", nisn: "0065432101", className: "X TKR A", jurusan: "Teknik Kendaraan Ringan (TKR)", focus: "Pendampingan Khusus (TDK NAIK)", date: "Hari Ini", status: "Selesai Konsultasi", notes: "Murid menyanggupi melengkapi tugas dan kehadiran harian semester ini." },
  { id: "w2", studentName: "Rehan Jaenuri", nisn: "0065432102", className: "XI TKR A", jurusan: "Teknik Kendaraan Ringan (TKR)", focus: "Akademik & Kerapian", date: "Kemarin", status: "Selesai Konsultasi", notes: "Progres kehadiran sangat baik dan aktif dalam praktikum." },
  { id: "w3", studentName: "ABDURAFI ASRIFIN", nisn: "0065432108", className: "XI TKR B", jurusan: "Teknik Kendaraan Ringan (TKR)", focus: "Sikap & Kehadiran", date: "3 Hari Lalu", status: "Butuh Pendampingan", notes: "Diingatkan pentingnya kedisiplinan dan berpakaian rapi di lingkungan sekolah." }
];

// Helper function to match username to master guru wali item
function findGuruWaliMatch(uName: string, dataList: ReturnType<typeof getMasterGuruWaliData>) {
  if (!uName) return null;
  const clean = uName.toLowerCase();

  return dataList.find(g => {
    const gName = g.namaGuru.toLowerCase();
    if (gName.includes(clean) || clean.includes(gName)) return true;
    if (clean.includes("arbianti") && gName.includes("arbianti")) return true;
    if (clean.includes("putu") && gName.includes("putu")) return true;
    if (clean.includes("juniyasa") && gName.includes("juni")) return true;
    if (clean.includes("haerul") && gName.includes("haerul")) return true;
    if (clean.includes("muslimin") && gName.includes("muslimin")) return true;
    if (clean.includes("ainal") && gName.includes("ainal")) return true;
    if ((clean.includes("hiswan") || clean.includes("iswan")) && gName.includes("hiswan")) return true;
    if (clean.includes("isnawati") && gName.includes("isna")) return true;
    return false;
  }) || null;
}

function convertMuridListToStudents(guruWali: ReturnType<typeof getMasterGuruWaliData>[0]): BimbinganStudent[] {
  if (!guruWali || !guruWali.muridList || guruWali.muridList.length === 0) {
    return DEFAULT_STUDENTS;
  }
  return guruWali.muridList.map((m, idx) => {
    const kUpper = (m.kelas || "").toUpperCase();
    let jurusan = "Kejuruan SMK Negeri 2 Konawe";
    if (kUpper.includes("DPIB")) jurusan = "Desain Pemodelan & Informasi Bangunan (DPIB)";
    else if (kUpper.includes("TKR")) jurusan = "Teknik Kendaraan Ringan (TKR)";
    else if (kUpper.includes("TSM")) jurusan = "Teknik Sepeda Motor (TSM)";
    else if (kUpper.includes("TAV")) jurusan = "Teknik Audio Video (TAV)";
    else if (kUpper.includes("DKV")) jurusan = "Desain Komunikasi Visual (DKV)";
    else if (kUpper.includes("TITL")) jurusan = "Teknik Instalasi Tenaga Listrik (TITL)";
    else if (kUpper.includes("TP")) jurusan = "Teknik Pemesinan (TP)";

    return {
      id: m.id || "m-" + idx,
      name: m.nama,
      nisn: `00${65432100 + idx}`,
      kelas: m.kelas,
      jurusan,
      addedAt: "2026-08-01"
    };
  });
}

export function GuruWaliWorkspace({ username = "Guru Wali", currentRole = "guru_wali", onNavigateToTab }: GuruWaliWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"daftar-murid" | "catat-sesi">("daftar-murid");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const masterGuruWaliData = useMemo(() => getMasterGuruWaliData(), []);
  const [selectedGuruWaliId, setSelectedGuruWaliId] = useState<string>(() => {
    const match = findGuruWaliMatch(username, masterGuruWaliData);
    if (match) return match.id;
    const arbiantiGw = masterGuruWaliData.find(g => g.id === "gw-20" || g.namaGuru.toLowerCase().includes("arbianti"));
    if (arbiantiGw && username.toLowerCase().includes("arbianti")) return arbiantiGw.id;
    const putuGw = masterGuruWaliData.find(g => g.id === "gw-3" || g.namaGuru.toLowerCase().includes("putu"));
    return putuGw ? putuGw.id : masterGuruWaliData[0]?.id || "";
  });

  // Sync selectedGuruWaliId when username prop changes
  useEffect(() => {
    const match = findGuruWaliMatch(username, masterGuruWaliData);
    if (match && match.id !== selectedGuruWaliId) {
      setSelectedGuruWaliId(match.id);
    }
  }, [username, masterGuruWaliData, selectedGuruWaliId]);

  const currentGuruWali = useMemo(() => {
    return masterGuruWaliData.find(g => g.id === selectedGuruWaliId) || masterGuruWaliData[0];
  }, [selectedGuruWaliId, masterGuruWaliData]);

  // State for Bimbingan Students List initialized directly from currentGuruWali
  const [students, setStudents] = useState<BimbinganStudent[]>(() => {
    return convertMuridListToStudents(currentGuruWali);
  });

  // Sync students when selected Guru Wali ID changes
  useEffect(() => {
    if (currentGuruWali) {
      setStudents(convertMuridListToStudents(currentGuruWali));
    }
  }, [selectedGuruWaliId]);

  // State for Consultation Sessions List
  const [consultations, setConsultations] = useState<BimbinganSession[]>(() => {
    try {
      const saved = localStorage.getItem("sihadir_guru_wali_sessions");
      return saved ? JSON.parse(saved) : DEFAULT_SESSIONS;
    } catch {
      return DEFAULT_SESSIONS;
    }
  });

  // Save to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem("sihadir_guru_wali_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("sihadir_guru_wali_sessions", JSON.stringify(consultations));
  }, [consultations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- FORM ADD NEW STUDENT ---
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentNisn, setNewStudentNisn] = useState("");
  const [newStudentKelas, setNewStudentKelas] = useState("XI TSM A");
  const [newStudentJurusan, setNewStudentJurusan] = useState("Teknik Sepeda Motor (TSM)");

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentNisn.trim()) {
      showToast("Harap isi Nama Murid dan NISN!");
      return;
    }

    const newStudent: BimbinganStudent = {
      id: "std-" + Date.now(),
      name: newStudentName.trim(),
      nisn: newStudentNisn.trim(),
      kelas: newStudentKelas,
      jurusan: newStudentJurusan,
      addedAt: new Date().toISOString().split("T")[0]
    };

    setStudents([newStudent, ...students]);
    setNewStudentName("");
    setNewStudentNisn("");
    showToast(`Berhasil menambahkan ${newStudent.name} ke daftar bimbingan!`);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Hapus ${name} dari daftar murid binaan Guru Wali?`)) {
      setStudents(students.filter(s => s.id !== id));
      showToast(`Data ${name} berhasil dihapus.`);
    }
  };

  // --- FORM ADD SESSION ---
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [sessionStudentName, setSessionStudentName] = useState("");
  const [sessionNisn, setSessionNisn] = useState("");
  const [sessionClass, setSessionClass] = useState("XI TSM A");
  const [sessionJurusan, setSessionJurusan] = useState("Teknik Sepeda Motor (TSM)");
  const [sessionFocus, setSessionFocus] = useState("Akademik (Kerapian Nilai)");
  const [sessionStatus, setSessionStatus] = useState<"Selesai Konsultasi" | "Butuh Pendampingan" | "Terjadwal">("Terjadwal");
  const [sessionNotes, setSessionNotes] = useState("");

  const handleSelectStudentForSession = (stdId: string) => {
    setSelectedStudentId(stdId);
    const found = students.find(s => s.id === stdId);
    if (found) {
      setSessionStudentName(found.name);
      setSessionNisn(found.nisn);
      setSessionClass(found.kelas);
      setSessionJurusan(found.jurusan);
    }
  };

  const handleQuickAddSessionForStudent = (std: BimbinganStudent) => {
    setSelectedStudentId(std.id);
    setSessionStudentName(std.name);
    setSessionNisn(std.nisn);
    setSessionClass(std.kelas);
    setSessionJurusan(std.jurusan);
    setActiveTab("catat-sesi");
  };

  const handleAddConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionStudentName.trim() || !sessionNotes.trim()) {
      showToast("Harap isi Nama Murid dan Catatan Bimbingan!");
      return;
    }

    const newEntry: BimbinganSession = {
      id: "c-" + Date.now(),
      studentName: sessionStudentName.trim(),
      nisn: sessionNisn.trim() || undefined,
      className: sessionClass,
      jurusan: sessionJurusan,
      focus: sessionFocus,
      date: "Hari Ini",
      status: sessionStatus,
      notes: sessionNotes.trim()
    };

    setConsultations([newEntry, ...consultations]);
    setSessionNotes("");
    showToast(`Sesi bimbingan ${sessionStudentName} berhasil dicatat!`);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.jurusan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConsultations = consultations.filter(c => 
    c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.nisn || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.focus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs font-bold"
          >
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl text-white shadow-lg border border-teal-700/40 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-teal-500/30 text-teal-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-teal-400/30 tracking-wider">
              Workspace Khusus Guru Wali
            </span>
            <select
              value={selectedGuruWaliId}
              onChange={(e) => setSelectedGuruWaliId(e.target.value)}
              className="bg-teal-950/90 text-teal-100 font-extrabold text-xs px-2.5 py-1 rounded-xl border border-teal-500/50 focus:outline-none cursor-pointer"
            >
              {masterGuruWaliData.map(gw => (
                <option key={gw.id} value={gw.id} className="bg-slate-900 text-white font-semibold">
                  {gw.no}. {gw.namaGuru} ({gw.muridList.length} Murid Bina)
                </option>
              ))}
            </select>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HeartHandshake className="h-7 w-7 text-teal-400" />
            TUGAS & KONTROL PEMBIMBINGAN GURU WALI
          </h2>
          <p className="text-xs text-teal-200/90 leading-relaxed font-medium max-w-2xl">
            Layanan bimbingan personal, pencatatan murid binaan (NISN, Kelas, Jurusan), konsultasi akademik/karakter, serta rekapitulasi pembimbingan terintegrasi.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10 flex-wrap">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-teal-300 block">Murid Binaan</span>
            <span className="text-sm font-black text-white">{students.length} Murid Terdaftar</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-teal-300 block">Record Bimbingan</span>
            <span className="text-sm font-black text-white">{consultations.length} Sesi Terpaut</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const primaryClass = students[0]?.kelas || "XII DPIB";
              localStorage.setItem("sihadir_target_perwalian_class", primaryClass);
              onNavigateToTab?.("student-attendance");
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <UserCheck className="h-4 w-4" />
            <span>Lihat Presensi Murid Binaan ({students[0]?.kelas || "XII DPIB"})</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab?.("parent-report")}
            className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Laporan Ortu (WA)</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("daftar-murid")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "daftar-murid"
              ? "bg-teal-700 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>Daftar & Input Murid Bimbingan ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("catat-sesi")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "catat-sesi"
              ? "bg-teal-700 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Catat & Rekap Sesi Bimbingan ({consultations.length})</span>
        </button>
      </div>

      {/* MAIN VIEW TAB 1: DAFTAR & INPUT MURID BIMBINGAN */}
      {activeTab === "daftar-murid" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2-COLS: DAFTAR MURID BIMBINGAN GURU WALI */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Binaan Guru Wali
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    Daftar Murid Masuk Bimbingan Guru Wali
                  </h3>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari NISN, nama, kelas, jurusan..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              {/* TABLE DATA MURID BIMBINGAN */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="py-3 px-3">No</th>
                      <th className="py-3 px-3">NISN</th>
                      <th className="py-3 px-3">Nama Murid</th>
                      <th className="py-3 px-3">Kelas & Jurusan</th>
                      <th className="py-3 px-3 text-right">Aksi Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredStudents.map((std, idx) => (
                      <tr key={std.id} className="hover:bg-teal-50/20 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-mono font-bold text-teal-700">{std.nisn}</td>
                        <td className="py-3 px-3">
                          <div className="font-black text-slate-900">{std.name}</div>
                          <span className="text-[9px] text-slate-400 font-medium">Binaan Aktif</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="inline-block px-2 py-0.5 bg-slate-100 font-extrabold text-[10px] text-slate-800 rounded mb-0.5">
                            {std.kelas}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold">{std.jurusan}</div>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickAddSessionForStudent(std)}
                              className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Sesi Bimbingan</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(std.id, std.name)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
                              title="Hapus Murid"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-medium italic">
                          Belum ada murid bimbingan yang tercatat. Silakan tambah melalui form di sebelah kanan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT 1-COL: FORM TAMBAH MURID BIMBINGAN */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <UserPlus className="h-5 w-5 text-teal-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Tambah Murid Bimbingan Guru Wali
                </h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Daftarkan nama murid, NISN, kelas, dan jurusan untuk dimasukkan ke dalam buku kendali bimbingan Guru Wali.
              </p>

              <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs font-medium">
                <div>
                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    Nama Lengkap Murid *
                  </label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Contoh: Muhammad Al-Fatih"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    NISN (Nomor Induk Murid Nasional) *
                  </label>
                  <input
                    type="text"
                    value={newStudentNisn}
                    onChange={(e) => setNewStudentNisn(e.target.value)}
                    placeholder="Contoh: 0068912345"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    Kelas *
                  </label>
                  <select
                    value={newStudentKelas}
                    onChange={(e) => setNewStudentKelas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="X TSM A">X TSM A</option>
                    <option value="X TSM B">X TSM B</option>
                    <option value="X TKR A">X TKR A</option>
                    <option value="X TKR B">X TKR B</option>
                    <option value="XI TSM A">XI TSM A</option>
                    <option value="XI TSM B">XI TSM B</option>
                    <option value="XI TKR A">XI TKR A</option>
                    <option value="XI TKR B">XI TKR B</option>
                    <option value="XII TAV">XII TAV</option>
                    <option value="XII TKJ">XII TKJ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    Jurusan / Program Keahlian *
                  </label>
                  <select
                    value={newStudentJurusan}
                    onChange={(e) => setNewStudentJurusan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Teknik Sepeda Motor (TSM)">Teknik Sepeda Motor (TSM)</option>
                    <option value="Teknik Kendaraan Ringan (TKR)">Teknik Kendaraan Ringan (TKR)</option>
                    <option value="Teknik Audio Video (TAV)">Teknik Audio Video (TAV)</option>
                    <option value="Teknik Komputer & Jaringan (TKJ)">Teknik Komputer & Jaringan (TKJ)</option>
                    <option value="Multimedia / Desain Grafis">Multimedia / Desain Grafis</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black uppercase tracking-wider text-[11px] py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Simpan Murid Bimbingan</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* MAIN VIEW TAB 2: CATAT & REKAP SESI BIMBINGAN */}
      {activeTab === "catat-sesi" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2-COLS: DAFTAR REKAP SESI BIMBINGAN */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Jurnal Bimbingan
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    Histori & Record Sesi Bimbingan Murid
                  </h3>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari murid, fokus, atau catatan..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              {/* Consultation Cards List */}
              <div className="space-y-3">
                {filteredConsultations.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50/50 hover:bg-teal-50/30 border border-slate-200/80 rounded-2xl transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                          {item.studentName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                            <span>{item.studentName}</span>
                            {item.nisn && (
                              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                NISN: {item.nisn}
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-bold">
                            {item.className} {item.jurusan ? `• ${item.jurusan}` : ""} • {item.date}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${
                        item.status === "Selesai Konsultasi"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.status === "Butuh Pendampingan"
                          ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="bg-white border border-slate-100 p-3 rounded-xl text-xs space-y-1">
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide block">
                        Fokus Bimbingan: {item.focus}
                      </span>
                      <p className="text-slate-600 font-medium leading-relaxed">{item.notes}</p>
                    </div>
                  </div>
                ))}

                {filteredConsultations.length === 0 && (
                  <div className="text-center py-10 text-slate-400 font-medium italic bg-slate-50 rounded-2xl">
                    Belum ada sesi konsultasi/bimbingan tercatat.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT 1-COL: FORM CATAT SESI BIMBINGAN */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                <Plus className="h-4 w-4 text-teal-600" />
                Catat Sesi Bimbingan Baru
              </h4>

              <form onSubmit={handleAddConsultation} className="space-y-3 text-xs font-medium">
                <div>
                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    Pilih Dari Daftar Murid Bimbingan
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleSelectStudentForSession(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold cursor-pointer text-slate-800"
                  >
                    <option value="">-- Manual / Ketik Sendiri --</option>
                    {students.map(std => (
                      <option key={std.id} value={std.id}>
                        {std.name} ({std.nisn}) - {std.kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    Nama Murid Binaan *
                  </label>
                  <input
                    type="text"
                    value={sessionStudentName}
                    onChange={(e) => setSessionStudentName(e.target.value)}
                    placeholder="Contoh: Rian Hidayat"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    NISN Murid
                  </label>
                  <input
                    type="text"
                    value={sessionNisn}
                    onChange={(e) => setSessionNisn(e.target.value)}
                    placeholder="Contoh: 0065432101"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                      Kelas
                    </label>
                    <input
                      type="text"
                      value={sessionClass}
                      onChange={(e) => setSessionClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                      Jurusan
                    </label>
                    <input
                      type="text"
                      value={sessionJurusan}
                      onChange={(e) => setSessionJurusan(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    Fokus Pembimbingan *
                  </label>
                  <select
                    value={sessionFocus}
                    onChange={(e) => setSessionFocus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold cursor-pointer"
                  >
                    <option value="Akademik (Kerapian Nilai)">Akademik (Kerapian Nilai)</option>
                    <option value="Sikap & Kehadiran">Sikap & Kehadiran</option>
                    <option value="Minat / Bakat Kejuruan">Minat / Bakat Kejuruan</option>
                    <option value="Adaptasi Lingkungan Sekolah">Adaptasi Lingkungan Sekolah</option>
                    <option value="Bimbingan Karakter & Disiplin">Bimbingan Karakter & Disiplin</option>
                    <option value="Persiapan Magang PKL / Uji Kompetensi">Persiapan Magang PKL / Uji Kompetensi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    Status Bimbingan *
                  </label>
                  <select
                    value={sessionStatus}
                    onChange={(e) => setSessionStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold cursor-pointer"
                  >
                    <option value="Selesai Konsultasi">Selesai Konsultasi</option>
                    <option value="Butuh Pendampingan">Butuh Pendampingan</option>
                    <option value="Terjadwal">Terjadwal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-wider mb-1">
                    Catatan Sesi & Rekomendasi *
                  </label>
                  <textarea
                    rows={3}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Catat hasil pembimbingan dan arahan khusus..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black uppercase text-[10px] py-3 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Simpan Record Bimbingan</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
