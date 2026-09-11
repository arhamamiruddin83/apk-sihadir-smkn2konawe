/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Award,
  Search,
  Filter,
  Plus,
  FileText,
  Printer,
  Trash2,
  Edit3,
  X,
  UserCheck,
  GraduationCap,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Calendar,
  Clock,
  User,
  Users,
  Bookmark,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { MOCK_STUDENTS } from "../mockData";
import { getBkCounselorForClass } from "./KelasBimbinganManager";
import { getTeacherPerwalianClass } from "../utils/scheduleHelper";
import { getMuridBinaanForTeacher } from "../data/guruWaliMasterData";

export interface ViolationRule {
  id: string;
  code: string;
  name: string;
  category: "Ringan" | "Sedang" | "Berat" | "Apresiasi";
  points: number; // Positive = violation (+5, +35), Negative = reward/restorative (-10, -25)
  description: string;
  standardAction: string;
}

export interface StudentViolationRecord {
  id: string;
  studentName: string;
  nisn?: string;
  className: string;
  category: "Ringan" | "Sedang" | "Berat" | "Apresiasi";
  violationName: string;
  ruleCode?: string;
  points: number;
  date: string;
  reporterName: string;
  reporterRole: string;
  notes: string;
  handlingStatus: "Dicatat" | "Pembinaan Lisan" | "Pemanggilan Orang Tua" | "SP1" | "SP2" | "SP3" | "Selesai/Tuntas";
  handlingActionNotes?: string;
  createdAt?: string;
}

// DEFAULT MASTER RULES CATALOG (SMK NEGERI 2 KONAWE STANDARD)
export const DEFAULT_VIOLATION_RULES: ViolationRule[] = [
  // --- KATEGORI RINGAN ---
  {
    id: "r-1",
    code: "R01",
    name: "Keterlambatan Masuk Sekolah / Apel Pagi",
    category: "Ringan",
    points: 10,
    description: "Tiba di sekolah setelah bel masuk berbunyi (di atas jam 07.15 WITA)",
    standardAction: "Pencatatan di piket & pembinaan kebersihan lingkungan 15 menit"
  },
  {
    id: "r-2",
    code: "R02",
    name: "Atribut / Seragam Tidak Lengkap & Tidak Sesuai",
    category: "Ringan",
    points: 5,
    description: "Tidak memakai topi/dasi saat upacara, kaos kaki non-hitam, atau sepatu berwarna-warni",
    standardAction: "Teguran lisan & melengkapi atribut"
  },
  {
    id: "r-3",
    code: "R03",
    name: "Penampilan / Rambut Gondrong & Tidak Rapi",
    category: "Ringan",
    points: 10,
    description: "Rambut pria melampaui kerah/telinga, mewarnai rambut, atau memakai perhiasan berlebih",
    standardAction: "Teguran & perapihan rambut mandiri/sekolah"
  },
  {
    id: "r-4",
    code: "R04",
    name: "Membuang Sampah Sembarangan / Mengotori Bengkel",
    category: "Ringan",
    points: 10,
    description: "Membuang sampah tidak pada tempatnya di area kelas, koridor, atau area praktik bengkel",
    standardAction: "Pembersihan area lingkungan sekolah"
  },
  {
    id: "r-5",
    code: "R05",
    name: "Tidak Melaksanakan Tugas Piket Kebersihan Kelas",
    category: "Ringan",
    points: 5,
    description: "Mengabaikan jadwal piket kebersihan kelas yang telah disepakati",
    standardAction: "Mengganti piket kebersihan sore hari"
  },
  {
    id: "r-6",
    code: "R06",
    name: "Membawa Barang Non-KBM (Game Console/Kartu Remi)",
    category: "Ringan",
    points: 15,
    description: "Membawa mainan, kartu remi, speaker berlebih yang mengganggu KBM",
    standardAction: "Penyitaan barang sementara oleh Wali Kelas/Piket"
  },

  // --- KATEGORI SEDANG ---
  {
    id: "s-1",
    code: "S01",
    name: "Bolos KBM / Meninggalkan Kelas Tanpa Izin",
    category: "Sedang",
    points: 20,
    description: "Tidak berada di kelas saat jam pelajaran tanpa izin guru pengampu/piket",
    standardAction: "Pembinaan khusus oleh Wali Kelas & Guru BK"
  },
  {
    id: "s-2",
    code: "S02",
    name: "Keluar Gerbang Sekolah Tanpa Surat Izin Piket",
    category: "Sedang",
    points: 25,
    description: "Menerobos atau keluar dari lingkungan sekolah tanpa surat pas jalan resmi",
    standardAction: "Pemanggilan Wali Kelas & pengerjaan tugas terstruktur"
  },
  {
    id: "s-3",
    code: "S03",
    name: "Tidak Mengikuti Upacara Bendera / Apel Tanpa Alasan",
    category: "Sedang",
    points: 25,
    description: "Sengaja bersembunyi atau tidak mengikuti upacara bendera hari Senin",
    standardAction: "Hormat bendera & pembinaan disiplin nasionalisme"
  },
  {
    id: "s-4",
    code: "S04",
    name: "Merokok / Membawa Vape di Lingkungan Sekolah",
    category: "Sedang",
    points: 35,
    description: "Merokok atau mengonsumsi rokok elektrik di area sekolah/saat berseragam",
    standardAction: "Penyitaan rokok/vape & Surat Peringatan (SP) Lisan"
  },
  {
    id: "s-5",
    code: "S05",
    name: "Tanpa Keterangan (Alpa) Beruntun",
    category: "Sedang",
    points: 10,
    description: "Tidak masuk sekolah tanpa surat dokter atau konfirmasi orang tua (10 Poin per hari)",
    standardAction: "Konfirmasi Wali Kelas via Telp/Home Visit"
  },
  {
    id: "s-6",
    code: "S06",
    name: "Bersikap Tidak Sopan / Meremehkan Guru & Staf TU",
    category: "Sedang",
    points: 35,
    description: "Mengeluarkan perkataan kasar, menantang, atau tidak sopan kepada pendidik",
    standardAction: "Permohonan maaf tertulis & pembinaan intensif BK"
  },
  {
    id: "s-7",
    code: "S07",
    name: "Merusak Sarana & Prasarana Sekolah / Alat Bengkel",
    category: "Sedang",
    points: 40,
    description: "Sengaja merusak meja, kursi, fasilitas toilet, atau peralatan praktik keahlian",
    standardAction: "Ganti rugi perbaikan sarana & SP1"
  },

  // --- KATEGORI BERAT ---
  {
    id: "b-1",
    code: "B01",
    name: "Perkelahian / Tawuran Antar Siswa",
    category: "Berat",
    points: 75,
    description: "Keterlibatan fisik dalam perkelahian di dalam atau di luar lingkungan sekolah",
    standardAction: "Penerbitan SP 2 & Skorsing Pembinaan di Rumah"
  },
  {
    id: "b-2",
    code: "B02",
    name: "Membawa / Mengonsumsi Minuman Keras (Miras)",
    category: "Berat",
    points: 75,
    description: "Membawa atau meminum minuman beralkohol di dalam lingkungan sekolah",
    standardAction: "Penerbitan SP 2 & Pemanggilan Orang Tua Mutlak"
  },
  {
    id: "b-3",
    code: "B03",
    name: "Membawa Senjata Tajam / Berbahaya (Non-Praktik)",
    category: "Berat",
    points: 80,
    description: "Membawa badik, pisau, gir, atau sajam tanpa kaitan KBM/Praktik Bengkel",
    standardAction: "Penyitaan permanent, SP 3 & Perjanjian Terakhir"
  },
  {
    id: "b-4",
    code: "B04",
    name: "Tindakan Asusila / Bullying / Perundungan Siber",
    category: "Berat",
    points: 80,
    description: "Melakukan perundungan fisik/verbal berat atau tindakan tidak terpuji",
    standardAction: "Penerbitan SP 3 & Konseling Khusus BK"
  },
  {
    id: "b-5",
    code: "B05",
    name: "Pencurian Barang Milik Sekolah / Teman / Guru",
    category: "Berat",
    points: 75,
    description: "Mengambil barang, HP, atau helm milik orang lain tanpa hak",
    standardAction: "Pengembalian barang, ganti rugi & SP 2"
  },
  {
    id: "b-6",
    code: "B06",
    name: "Perjudian / Taruhan di Lingkungan Sekolah",
    category: "Berat",
    points: 60,
    description: "Melakukan taruhan uang atau barang di sekolah",
    standardAction: "Penyitaan & Pemanggilan Orang Tua"
  },
  {
    id: "b-7",
    code: "B07",
    name: "Tindak Kriminal / Narkoba / Penyalahgunaan Obat",
    category: "Berat",
    points: 100,
    description: "Keterlibatan tindak pidana, narkotika, atau zat adiktif psikotropika",
    standardAction: "Pengembalian Siswa Kepada Orang Tua (Dikeluarkan)"
  },

  // --- APRESIASI & PEMULIHAN POIN (MINUS POIN) ---
  {
    id: "a-1",
    code: "A01",
    name: "Juara Lomba Akademik / Non-Akademik / LKS SMK",
    category: "Apresiasi",
    points: -30,
    description: "Meraih juara 1, 2, atau 3 tingkat Kabupaten, Provinsi, atau Nasional",
    standardAction: "Pengurangan 30 Poin Pelanggaran + Piagam Apresiasi"
  },
  {
    id: "a-2",
    code: "A02",
    name: "Pengurus OSIS / Ekskul Aktif & Berprestasi",
    category: "Apresiasi",
    points: -15,
    description: "Menunjukkan kepemimpinan positif & keaktifan organisasi sekolah",
    standardAction: "Pengurangan 15 Poin Pelanggaran"
  },
  {
    id: "a-3",
    code: "A03",
    name: "Aksi Sosial / Kerja Bakti Lingkungan Sekolah",
    category: "Apresiasi",
    points: -10,
    description: "Berpartisipasi aktif dalam bakti sosial atau pembenahan fasilitas sekolah",
    standardAction: "Pengurangan 10 Poin Pelanggaran"
  },
  {
    id: "a-4",
    code: "A04",
    name: "Petugas Upacara / Pasbreeze / Tim Kedisiplinan",
    category: "Apresiasi",
    points: -10,
    description: "Menjalankan tugas dengan sangat baik sebagai petugas upacara bendera",
    standardAction: "Pengurangan 10 Poin Pelanggaran"
  },
  {
    id: "a-5",
    code: "A05",
    name: "Nihil Pelanggaran Selama 1 Bulan Berturut-turut",
    category: "Apresiasi",
    points: -15,
    description: "Konsistensi menjaga kedisiplinan tanpa catatan pelanggaran baru dalam 30 hari",
    standardAction: "Pengurangan 15 Poin Pelanggaran (Bonus Konsistensi)"
  }
];

// MOCK INITIAL RECORDS IF NONE EXISTS (EMPTY DEFAULT SO ALL STUDENTS START AT 0 POIN)
const INITIAL_MOCK_RECORDS: StudentViolationRecord[] = [];

// Helper to extract Jurusan from Class Name
export function getJurusanFromClass(className: string): string {
  if (!className) return "Umum";
  const upper = className.toUpperCase();
  if (upper.includes("TKR")) return "TKR (Teknik Kendaraan Ringan)";
  if (upper.includes("TKJ")) return "TKJ (Teknik Komputer & Jaringan)";
  if (upper.includes("RPL")) return "RPL (Rekayasa Perangkat Lunak)";
  if (upper.includes("TSM") || upper.includes("TBSM")) return "TSM (Teknik Sepeda Motor)";
  if (upper.includes("DKV")) return "DKV (Desain Komunikasi Visual)";
  if (upper.includes("DPIB")) return "DPIB (Desain Pemodelan & Informasi Bangunan)";
  if (upper.includes("KULINER") || upper.includes("BOGA") || upper.includes("TBG")) return "Kuliner / Tata Boga";
  if (upper.includes("TFLM") || upper.includes("LAS")) return "TFLM (Teknik Fabrikasi Logam)";
  
  const parts = className.split(" ");
  if (parts.length >= 2) return parts[1];
  return "Lainnya";
}

// Helper to determine threshold status from point accumulation
export function getPointThresholdInfo(totalPoints: number) {
  const p = Math.max(0, totalPoints);
  if (p >= 100) {
    return {
      status: "Dikeluarkan / Dikembalikan ke Ortu",
      code: "DROPOUT",
      badgeClass: "bg-slate-900 text-rose-300 border-rose-500",
      bgAlert: "bg-rose-950/20 border-rose-800 text-rose-200",
      actionText: "Proses Pengembalian Siswa Kepada Orang Tua / Wali (Dikeluarkan)",
      iconColor: "text-rose-500",
      level: 5
    };
  }
  if (p >= 90) {
    return {
      status: "Surat Peringatan 3 (SP 3)",
      code: "SP3",
      badgeClass: "bg-rose-600 text-white border-rose-700 font-black animate-pulse",
      bgAlert: "bg-rose-100 border-rose-300 text-rose-950",
      actionText: "Penerbitan SP 3 & Surat Perjanjian Terakhir Bermaterai Rp 10.000",
      iconColor: "text-rose-600",
      level: 4
    };
  }
  if (p >= 75) {
    return {
      status: "Surat Peringatan 2 (SP 2)",
      code: "SP2",
      badgeClass: "bg-pink-600 text-white border-pink-700 font-bold",
      bgAlert: "bg-pink-100 border-pink-300 text-pink-950",
      actionText: "Penerbitan SP 2 & Skorsing Pembinaan di Rumah (3 - 6 Hari)",
      iconColor: "text-pink-600",
      level: 3
    };
  }
  if (p >= 50) {
    return {
      status: "Surat Peringatan 1 (SP 1)",
      code: "SP1",
      badgeClass: "bg-amber-500 text-slate-950 border-amber-600 font-black",
      bgAlert: "bg-amber-100 border-amber-300 text-amber-950",
      actionText: "Penerbitan SP 1 & Pemanggilan Orang Tua/Wali ke Sekolah oleh BK",
      iconColor: "text-amber-600",
      level: 2
    };
  }
  if (p >= 25) {
    return {
      status: "Peringatan Lisan & Pembinaan",
      code: "WARNING",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
      bgAlert: "bg-amber-50 border-amber-200 text-amber-900",
      actionText: "Konseling Khusus Wali Kelas & Bimbingan Konseling (BK)",
      iconColor: "text-amber-500",
      level: 1
    };
  }
  return {
    status: "Aman & Taat",
    code: "SAFE",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold",
    bgAlert: "bg-emerald-50 border-emerald-200 text-emerald-900",
    actionText: "Siswa Taat & Tertib (Tetap Pertahankan Prestasi Kedisiplinan)",
    iconColor: "text-emerald-600",
    level: 0
  };
}

interface StudentViolationCreditManagerProps {
  currentRole?: string;
  username?: string;
  studentViewMode?: boolean; // If true, locked to viewing logged-in student's own records
  targetStudentName?: string;
}

export function StudentViolationCreditManager({
  currentRole = "bk",
  username = "",
  studentViewMode = false,
  targetStudentName
}: StudentViolationCreditManagerProps) {
  // Piket role is restricted from viewing or editing violation notes
  if (currentRole?.toLowerCase() === "piket") {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center space-y-4">
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-black text-slate-900">
            Akses Catatan Poin Pelanggaran Dialihkan
          </h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Sesuai kebijakan sekolah, menu dan catatan poin pelanggaran murid telah dialihkan secara terfokus ke <strong>Wali Kelas</strong> (khusus untuk murid perwalian) dan <strong>Guru Wali</strong> (khusus untuk murid binaan), serta <strong>Guru BK</strong>. Guru Piket fokus pada pemantauan KBM harian, izin murid, dan jurnal piket.
          </p>
        </div>
      </div>
    );
  }

  // Role permissions
  const isBkRole = currentRole?.toLowerCase() === "bk" || currentRole?.toLowerCase() === "guru bk";
  const isWaliRole = currentRole?.toLowerCase() === "wali" || currentRole?.toLowerCase() === "wali kelas";
  const isGuruWaliRole = currentRole?.toLowerCase() === "guru_wali" || currentRole?.toLowerCase() === "guru wali";
  const isAdminRole = currentRole?.toLowerCase() === "admin" || currentRole?.toLowerCase() === "kesiswaan";
  const canEdit = isBkRole || isWaliRole || isGuruWaliRole || isAdminRole;

  // Resolve teacher perwalian class and murid binaan
  const teacherPerwalianClass = React.useMemo(() => {
    if (!username) return null;
    return getTeacherPerwalianClass(username);
  }, [username]);

  const teacherMuridBinaan = React.useMemo(() => {
    if (!username) return [];
    return getMuridBinaanForTeacher(username);
  }, [username]);

  const binaanNamesSet = React.useMemo(() => {
    return new Set(teacherMuridBinaan.map(m => m.nama.trim().toUpperCase()));
  }, [teacherMuridBinaan]);

  const [activeTab, setActiveTab] = useState<"directory" | "rules" | "history">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJurusan, setSelectedJurusan] = useState<string>("Semua Jurusan");
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (isWaliRole && teacherPerwalianClass) return teacherPerwalianClass;
    if (isGuruWaliRole) return "Semua Kelas Binaan";
    return "Semua Kelas";
  });
  const [selectedCounselor, setSelectedCounselor] = useState<string>("Semua BK");
  const [statusFilter, setStatusFilter] = useState<string>("Semua Status");

  // Load Violation Records from LocalStorage
  const [records, setRecords] = useState<StudentViolationRecord[]>(() => {
    const saved = localStorage.getItem("sihadir_student_violation_logs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove old mock sample violation records if present
          return parsed.filter((r) => !["viol-101", "viol-102", "viol-103", "viol-104"].includes(r.id));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MOCK_RECORDS;
  });

  // Load Rules Catalog (supports custom added rules)
  const [rules, setRules] = useState<ViolationRule[]>(() => {
    const saved = localStorage.getItem("sihadir_violation_rules");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map((r: ViolationRule) => ({
            ...r,
            standardAction: r.standardAction ? r.standardAction.replace(/Pemberihan/g, "Pembersihan") : r.standardAction
          }));
          return sanitized;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_VIOLATION_RULES;
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedStudentForPrint, setSelectedStudentForPrint] = useState<string | null>(null);

  // Add Form States
  const [formStudentName, setFormStudentName] = useState("");
  const [formClassName, setFormClassName] = useState(() => teacherPerwalianClass || "XI TKR A");
  const [formRuleId, setFormRuleId] = useState("");
  const [formCustomRuleName, setFormCustomRuleName] = useState("");
  const [formCategory, setFormCategory] = useState<"Ringan" | "Sedang" | "Berat" | "Apresiasi">("Ringan");
  const [formPoints, setFormPoints] = useState<number>(10);
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formReporterName, setFormReporterName] = useState(username || "Cici Murni, S.Pd.");
  const [formReporterRole, setFormReporterRole] = useState(() => {
    if (isWaliRole) return "Wali Kelas";
    if (isGuruWaliRole) return "Guru Wali";
    if (isBkRole) return "Guru BK";
    return "Guru / Petugas";
  });
  const [formNotes, setFormNotes] = useState("");
  const [formHandlingStatus, setFormHandlingStatus] = useState<
    "Dicatat" | "Pembinaan Lisan" | "Pemanggilan Orang Tua" | "SP1" | "SP2" | "SP3" | "Selesai/Tuntas"
  >("Dicatat");

  // Students in selected form class
  const studentsInSelectedFormClass = React.useMemo(() => {
    return MOCK_STUDENTS.filter((s) => s.className === formClassName);
  }, [formClassName]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("sihadir_student_violation_logs", JSON.stringify(records));
    window.dispatchEvent(new Event("sihadir_data_updated"));
  }, [records]);

  useEffect(() => {
    localStorage.setItem("sihadir_violation_rules", JSON.stringify(rules));
  }, [rules]);

  // Handle rule selector change
  const handleRuleChange = (ruleId: string) => {
    setFormRuleId(ruleId);
    if (ruleId === "custom") {
      setFormCustomRuleName("");
      setFormPoints(10);
      setFormCategory("Ringan");
      return;
    }
    const found = rules.find((r) => r.id === ruleId);
    if (found) {
      setFormCustomRuleName(found.name);
      setFormCategory(found.category);
      setFormPoints(found.points);
    }
  };

  // Submit New Violation Record
  const handleAddRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentName.trim()) {
      alert("Silakan pilih atau masukkan nama murid.");
      return;
    }

    const ruleName = formRuleId === "custom" ? formCustomRuleName : rules.find((r) => r.id === formRuleId)?.name || formCustomRuleName;

    if (!ruleName.trim()) {
      alert("Silakan isi nama jenis pelanggaran.");
      return;
    }

    const newRecord: StudentViolationRecord = {
      id: "viol-" + Date.now(),
      studentName: formStudentName.trim(),
      className: formClassName,
      category: formCategory,
      violationName: ruleName.trim(),
      ruleCode: formRuleId !== "custom" ? rules.find((r) => r.id === formRuleId)?.code : "KUSTOM",
      points: Number(formPoints),
      date: formDate,
      reporterName: formReporterName.trim() || (username || "Petugas BK"),
      reporterRole: formReporterRole,
      notes: formNotes.trim() || "Tidak ada catatan tambahan.",
      handlingStatus: formHandlingStatus,
      createdAt: new Date().toISOString()
    };

    setRecords((prev) => [newRecord, ...prev]);
    setIsAddModalOpen(false);

    // Reset Form
    setFormStudentName("");
    setFormNotes("");
    setFormRuleId("");
  };

  // Delete Record
  const handleDeleteRecord = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus catatan pelanggaran ini?")) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Compute student point summaries (scoped for Wali Kelas & Guru Wali)
  const studentSummaries = React.useMemo(() => {
    const map = new Map<string, { studentName: string; className: string; totalPoints: number; records: StudentViolationRecord[] }>();

    // Determine base student population based on teacher role scope
    let baseStudents = MOCK_STUDENTS;
    if (isWaliRole) {
      baseStudents = MOCK_STUDENTS.filter((s) => {
        const matchesClass = teacherPerwalianClass && s.className.toLowerCase() === teacherPerwalianClass.toLowerCase();
        const matchesBinaan = binaanNamesSet.has(s.name.trim().toUpperCase());
        return matchesClass || matchesBinaan;
      });
    } else if (isGuruWaliRole) {
      baseStudents = MOCK_STUDENTS.filter((s) => binaanNamesSet.has(s.name.trim().toUpperCase()));
    }

    // Seed from baseStudents
    baseStudents.forEach((s) => {
      map.set(s.name.toUpperCase(), {
        studentName: s.name,
        className: s.className,
        totalPoints: 0,
        records: []
      });
    });

    // Populate from actual records
    records.forEach((r) => {
      const key = r.studentName.toUpperCase();
      if (isWaliRole) {
        const matchesClass = teacherPerwalianClass && r.className.toLowerCase() === teacherPerwalianClass.toLowerCase();
        const matchesBinaan = binaanNamesSet.has(key);
        if (!matchesClass && !matchesBinaan) return;
      } else if (isGuruWaliRole) {
        if (!binaanNamesSet.has(key)) return;
      }

      if (!map.has(key)) {
        map.set(key, {
          studentName: r.studentName,
          className: r.className,
          totalPoints: 0,
          records: []
        });
      }
      const item = map.get(key)!;
      item.records.push(r);
      item.totalPoints += r.points;
    });

    return Array.from(map.values()).map((s) => ({
      ...s,
      totalPoints: Math.max(0, s.totalPoints),
      threshold: getPointThresholdInfo(Math.max(0, s.totalPoints))
    }));
  }, [records, isWaliRole, isGuruWaliRole, teacherPerwalianClass, binaanNamesSet]);

  // Extract all available jurusan and classes
  const availableJurusanList = React.useMemo(() => {
    const set = new Set<string>();
    studentSummaries.forEach((s) => {
      const j = getJurusanFromClass(s.className);
      if (j) set.add(j);
    });
    return ["Semua Jurusan", ...Array.from(set).sort()];
  }, [studentSummaries]);

  const availableClasses = React.useMemo(() => {
    const set = new Set<string>();
    studentSummaries.forEach((s) => {
      if (selectedJurusan === "Semua Jurusan" || getJurusanFromClass(s.className) === selectedJurusan) {
        set.add(s.className);
      }
    });
    const classes = Array.from(set).sort();
    if (isWaliRole || isGuruWaliRole) {
      if (classes.length <= 1) return classes;
      return ["Semua Kelas Binaan/Perwalian", ...classes];
    }
    return ["Semua Kelas", ...classes];
  }, [studentSummaries, selectedJurusan, isWaliRole, isGuruWaliRole]);

  // Filtered Summaries
  const filteredSummaries = studentSummaries.filter((s) => {
    // If studentViewMode, filter strictly to logged in student or targetStudentName
    if (studentViewMode) {
      const activeTarget = (targetStudentName || username || "").toLowerCase().trim();
      if (activeTarget && !s.studentName.toLowerCase().includes(activeTarget)) {
        return false;
      }
    }

    if (selectedJurusan !== "Semua Jurusan" && getJurusanFromClass(s.className) !== selectedJurusan) {
      return false;
    }

    if (selectedClass !== "Semua Kelas" && selectedClass !== "Semua Kelas Binaan/Perwalian" && s.className !== selectedClass) return false;

    if (selectedCounselor !== "Semua BK") {
      const counselor = getBkCounselorForClass(s.className);
      if (selectedCounselor === "Ibu Cici" && counselor.id !== "CICI") return false;
      if (selectedCounselor === "Pak Yoga" && counselor.id !== "YOGA") return false;
    }

    if (statusFilter !== "Semua Status") {
      if (statusFilter === "Aman" && s.threshold.code !== "SAFE") return false;
      if (statusFilter === "Peringatan" && s.threshold.code !== "WARNING") return false;
      if (statusFilter === "SP1" && s.threshold.code !== "SP1") return false;
      if (statusFilter === "SP2" && s.threshold.code !== "SP2") return false;
      if (statusFilter === "SP3" && s.threshold.code !== "SP3") return false;
      if (statusFilter === "Dikeluarkan" && s.threshold.code !== "DROPOUT") return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.studentName.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Calculate High-level Dashboard Metrics
  const metrics = React.useMemo(() => {
    let totalRecordedStudents = studentSummaries.length;
    let totalSafe = 0;
    let totalWarning = 0;
    let totalSP1 = 0;
    let totalSP2 = 0;
    let totalSP3 = 0;
    let totalDropout = 0;

    studentSummaries.forEach((s) => {
      if (s.threshold.code === "SAFE") totalSafe++;
      if (s.threshold.code === "WARNING") totalWarning++;
      if (s.threshold.code === "SP1") totalSP1++;
      if (s.threshold.code === "SP2") totalSP2++;
      if (s.threshold.code === "SP3") totalSP3++;
      if (s.threshold.code === "DROPOUT") totalDropout++;
    });

    return { totalRecordedStudents, totalSafe, totalWarning, totalSP1, totalSP2, totalSP3, totalDropout };
  }, [studentSummaries]);

  // Printable student record details
  const activePrintStudent = React.useMemo(() => {
    if (!selectedStudentForPrint) return null;
    return studentSummaries.find((s) => s.studentName.toUpperCase() === selectedStudentForPrint.toUpperCase()) || null;
  }, [selectedStudentForPrint, studentSummaries]);

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl shadow-sm">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-md">
                Sistem Akumulasi Kredit Poin (0 - 100 Poin)
              </span>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                {studentViewMode
                  ? "KREDIT & CATATAN PELANGGARAN SAYA"
                  : isWaliRole
                  ? `KREDIT PELANGGARAN MURID PERWALIAN ${teacherPerwalianClass ? `(${teacherPerwalianClass})` : ""}`
                  : isGuruWaliRole
                  ? "KREDIT PELANGGARAN MURID BINAAN"
                  : "KREDIT PELANGGARAN & SP MURID"}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
            Sistem rekapitulasi poin kedisiplinan murid SMK Negeri 2 Konawe. Poin diakumulasikan dari <strong>0 Poin (Murid Taat)</strong> hingga maksimal <strong>100 Poin (Surat Pengembalian Orang Tua)</strong>. Murid juga dapat memulihkan poin melalui kegiatan prestasi/apresiasi.
          </p>
        </div>

        {!studentViewMode && canEdit && (
          <div className="relative z-10 flex items-center gap-2 shrink-0 self-stretch md:self-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300 animate-pulse w-full md:w-auto"
            >
              <Plus className="h-4 w-4 text-slate-950" />
              <span>
                {isWaliRole
                  ? "Catat Pelanggaran Murid Perwalian"
                  : isGuruWaliRole
                  ? "Catat Poin Murid Binaan"
                  : "Catat Pelanggaran / Apresiasi"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* SCOPE BANNER FOR WALI KELAS */}
      {isWaliRole && (
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl border border-purple-500/30 flex items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-400/30 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-purple-500/30 text-purple-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-purple-400/30">
                  Fokus Perwalian & Binaan
                </span>
                {teacherPerwalianClass && (
                  <span className="text-xs font-black text-amber-300">
                    Kelas Perwalian: {teacherPerwalianClass}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-white">
                Catatan Poin Pelanggaran Khusus Murid Perwalian {teacherPerwalianClass ? `(${teacherPerwalianClass})` : ""} & Binaan Anda
              </h3>
              <p className="text-[11px] text-purple-200/80 max-w-2xl leading-relaxed">
                Hanya menampilkan data anak perwalian dan binaan Anda ({studentSummaries.length} murid) agar terfokus, rapi, dan tidak menumpuk.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SCOPE BANNER FOR GURU WALI */}
      {isGuruWaliRole && !isWaliRole && (
        <div className="bg-gradient-to-r from-indigo-950 via-blue-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl border border-indigo-500/30 flex items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30 shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                Fokus Binaan Guru Wali
              </span>
              <h3 className="text-sm font-black text-white">
                Catatan Poin Pelanggaran Khusus Murid Binaan Anda
              </h3>
              <p className="text-[11px] text-indigo-200/80 max-w-2xl leading-relaxed">
                Hanya menampilkan data {studentSummaries.length} murid binaan resmi sesuai SK Pembimbingan Guru Wali Anda agar tidak menumpuk.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* READ-ONLY MONITORING BANNER FOR NON-BK ROLES */}
      {!studentViewMode && !canEdit && (
        <div className="bg-indigo-900/90 text-indigo-100 p-4 rounded-2xl border border-indigo-700/60 flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-indigo-300 shrink-0" />
            <div>
              <span className="font-extrabold text-white block">
                Mode Pemantauan & Tinjauan Laporan ({currentRole.toUpperCase()})
              </span>
              <span className="text-[11px] text-indigo-200 leading-relaxed block">
                Pencatatan dan pembinaan poin pelanggaran murid dikelola terfokus oleh <strong>Wali Kelas</strong>, <strong>Guru Wali</strong>, dan <strong>Guru BK</strong>. Akses Anda ditujukan sebagai peninjau dan pemantau laporan.
              </span>
            </div>
          </div>
          <span className="bg-indigo-800 text-indigo-200 font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-xl border border-indigo-600/50 shrink-0 hidden md:inline-block">
            Laporan Real-Time
          </span>
        </div>
      )}

      {/* DASHBOARD SUMMARY STATS (Only in Teacher/Admin View) */}
      {!studentViewMode && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Total Siswa</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-900">{metrics.totalRecordedStudents}</span>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 block">Terdaftar Sistem</span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider block">Aman & Taat</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-emerald-950">{metrics.totalSafe}</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 block">&lt; 25 Poin</span>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block">Peringatan Lisan</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-amber-950">{metrics.totalWarning}</span>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold text-amber-800 block">25 - 49 Poin</span>
          </div>

          <div className="bg-amber-100/80 p-4 rounded-2xl border border-amber-300 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-950 tracking-wider block">Terkena SP 1</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-amber-950">{metrics.totalSP1}</span>
              <FileText className="h-4 w-4 text-amber-700" />
            </div>
            <span className="text-[10px] font-black text-amber-900 block">50 - 74 Poin</span>
          </div>

          <div className="bg-pink-50 p-4 rounded-2xl border border-pink-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-pink-800 tracking-wider block">Terkena SP 2</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-pink-950">{metrics.totalSP2}</span>
              <AlertTriangle className="h-4 w-4 text-pink-600" />
            </div>
            <span className="text-[10px] font-black text-pink-800 block">75 - 89 Poin</span>
          </div>

          <div className="bg-rose-100 p-4 rounded-2xl border border-rose-300 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-rose-900 tracking-wider block">Kritis SP 3 / DO</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-rose-950">{metrics.totalSP3 + metrics.totalDropout}</span>
              <ShieldAlert className="h-4 w-4 text-rose-600" />
            </div>
            <span className="text-[10px] font-black text-rose-900 block">90 - 100+ Poin</span>
          </div>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "directory"
                ? "bg-slate-900 text-white shadow-md font-black"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>{studentViewMode ? "Status Poin Saya" : "Direktori Poin Siswa"}</span>
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "rules"
                ? "bg-slate-900 text-white shadow-md font-black"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Katalog & Aturan Poin</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "history"
                ? "bg-slate-900 text-white shadow-md font-black"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Riwayat Seluruh Catatan ({records.length})</span>
          </button>
        </div>

        {/* THRESHOLD LEGEND ACCORDION / BADGE */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-[10px] font-extrabold text-slate-600 border border-slate-200">
          <span className="px-2 text-slate-500 uppercase tracking-wider">Level SP:</span>
          <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-lg">&lt;25 Aman</span>
          <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-lg">25-49 Pembinaan</span>
          <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg">50-74 SP1</span>
          <span className="bg-pink-300 text-pink-950 px-2 py-0.5 rounded-lg">75-89 SP2</span>
          <span className="bg-rose-500 text-white px-2 py-0.5 rounded-lg">90-99 SP3</span>
          <span className="bg-slate-900 text-rose-300 px-2 py-0.5 rounded-lg">100 DO</span>
        </div>
      </div>

      {/* TAB 1: DIREKTORI POIN SISWA */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {!studentViewMode && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa atau NISN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400">Jurusan:</span>
                  <select
                    value={selectedJurusan}
                    onChange={(e) => {
                      setSelectedJurusan(e.target.value);
                      setSelectedClass("Semua Kelas");
                    }}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {availableJurusanList.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
                  <select
                    value={selectedCounselor}
                    onChange={(e) => setSelectedCounselor(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="Semua BK">Semua Guru BK</option>
                    <option value="Ibu Cici">Bina Ibu Cici</option>
                    <option value="Pak Yoga">Bina Pak Yoga</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="Semua Status">Semua Status</option>
                    <option value="Aman">Aman (&lt;25 Poin)</option>
                    <option value="Peringatan">Peringatan Lisan (25-49 Poin)</option>
                    <option value="SP1">SP 1 (50-74 Poin)</option>
                    <option value="SP2">SP 2 (75-89 Poin)</option>
                    <option value="SP3">SP 3 (90-99 Poin)</option>
                    <option value="Dikeluarkan">Dikeluarkan (100+ Poin)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STUDENT CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSummaries.map((item) => {
              const pPercentage = Math.min(100, Math.max(0, (item.totalPoints / 100) * 100));

              return (
                <div
                  key={item.studentName}
                  className={`p-5 rounded-3xl border transition-all shadow-2xs space-y-4 relative overflow-hidden bg-white ${
                    item.threshold.code === "DROPOUT"
                      ? "border-rose-300 ring-2 ring-rose-500/20"
                      : item.threshold.code === "SP3"
                      ? "border-rose-300 bg-rose-50/30"
                      : item.threshold.code === "SP2"
                      ? "border-pink-300 bg-pink-50/20"
                      : item.threshold.code === "SP1"
                      ? "border-amber-300 bg-amber-50/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-900 text-white rounded-2xl font-black text-sm shrink-0 shadow-md">
                        {item.studentName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{item.studentName}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[11px] font-bold text-slate-600 block">{item.className}</span>
                          <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                            {getJurusanFromClass(item.className)}
                          </span>
                          {(() => {
                            const c = getBkCounselorForClass(item.className);
                            return (
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${c.badgeBg}`}>
                                BK: {c.shortName}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2.5 py-1 rounded-xl border ${item.threshold.badgeClass}`}>
                      {item.threshold.status}
                    </span>
                  </div>

                  {/* VISUAL POINT GAUGE */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        Akumulasi Poin
                      </span>
                      <div className="font-black text-slate-900">
                        <span
                          className={`text-base ${
                            item.totalPoints >= 100
                              ? "text-rose-600"
                              : item.totalPoints >= 50
                              ? "text-amber-600"
                              : "text-slate-900"
                          }`}
                        >
                          {item.totalPoints}
                        </span>
                        <span className="text-slate-400 text-xs font-medium"> / 100 Poin</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pPercentage >= 100
                            ? "bg-slate-900"
                            : pPercentage >= 90
                            ? "bg-rose-600"
                            : pPercentage >= 75
                            ? "bg-pink-600"
                            : pPercentage >= 50
                            ? "bg-amber-500"
                            : pPercentage >= 25
                            ? "bg-amber-400"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.max(5, pPercentage)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 pt-0.5">
                      <span>0 (Sempurna)</span>
                      <span>50 (SP1)</span>
                      <span>100 (Pengembalian)</span>
                    </div>
                  </div>

                  {/* THRESHOLD ACTION ALERT */}
                  <div className={`p-3 rounded-2xl border text-xs font-semibold ${item.threshold.bgAlert}`}>
                    <div className="flex items-start gap-2">
                      <Info className={`h-4 w-4 shrink-0 mt-0.5 ${item.threshold.iconColor}`} />
                      <p className="leading-snug">{item.threshold.actionText}</p>
                    </div>
                  </div>

                  {/* RECENT RECORDS PREVIEW */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>Catatan Pelanggaran & Apresiasi ({item.records.length})</span>
                    </div>

                    {item.records.length === 0 ? (
                      <p className="text-[11px] text-emerald-700 font-semibold italic bg-emerald-50/50 p-2 rounded-xl text-center">
                        ✨ Belum ada catatan pelanggaran. Siswa sangat taat!
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {item.records.map((r) => (
                          <div
                            key={r.id}
                            className={`p-2 rounded-xl border text-[11px] flex items-center justify-between gap-2 ${
                              r.category === "Apresiasi"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                                : r.category === "Berat"
                                ? "bg-rose-50 border-rose-200 text-rose-950"
                                : "bg-slate-50 border-slate-200 text-slate-900"
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0">
                              <span className="font-extrabold truncate block">{r.violationName}</span>
                              <span className="text-[9px] text-slate-500 font-medium block">
                                {r.date} • oleh {r.reporterName}
                              </span>
                            </div>
                            <span
                              className={`font-black text-xs shrink-0 px-2 py-0.5 rounded-lg ${
                                r.points < 0 ? "bg-emerald-600 text-white" : "bg-slate-900 text-amber-400"
                              }`}
                            >
                              {r.points > 0 ? `+${r.points}` : r.points} P
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {!studentViewMode && canEdit && (
                      <button
                        onClick={() => {
                          setFormStudentName(item.studentName);
                          setFormClassName(item.className);
                          setIsAddModalOpen(true);
                        }}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Catat Poin (BK)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedStudentForPrint(item.studentName);
                        setIsPrintModalOpen(true);
                      }}
                      className={`${canEdit ? 'shrink-0' : 'w-full'} bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs px-3 py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5`}
                      title="Cetak Rapor Poin Pelanggaran & Surat Peringatan (SP)"
                    >
                      <Printer className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Cetak SP / Rapor</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSummaries.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-900">Tidak Ada Data Siswa Ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Siswa dengan kriteria pencarian tersebut belum memiliki catatan poin atau tidak ditemukan.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KATALOG & ATURAN POIN */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  BUKU PEDOMAN KRITERIA PELANGGARAN & POIN (SMK NEGERI 2 KONAWE)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Aturan resmi bobot kredit poin akumulasi pelanggaran siswa serta bentuk penanganan BK / Sekolah.
                </p>
              </div>

              <span className="text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-900 px-3 py-1 rounded-xl border border-indigo-200 shrink-0">
                Total {rules.length} Aturan Baku
              </span>
            </div>

            {/* RULES TABLE / LIST */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                    <th className="p-3 rounded-tl-xl">Kode</th>
                    <th className="p-3">Nama Jenis Pelanggaran / Apresiasi</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-center">Bobot Poin</th>
                    <th className="p-3">Deskripsi & Standar Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-3 font-mono font-black text-slate-800">{rule.code}</td>
                      <td className="p-3">
                        <span className="font-extrabold text-slate-900 block">{rule.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{rule.description}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            rule.category === "Apresiasi"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : rule.category === "Berat"
                              ? "bg-rose-100 text-rose-900 border border-rose-300"
                              : rule.category === "Sedang"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-slate-100 text-slate-800 border border-slate-300"
                          }`}
                        >
                          {rule.category}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-black text-xs px-2.5 py-1 rounded-lg ${
                            rule.points < 0
                              ? "bg-emerald-600 text-white"
                              : rule.points >= 50
                              ? "bg-rose-600 text-white"
                              : rule.points >= 20
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-800 text-white"
                          }`}
                        >
                          {rule.points > 0 ? `+${rule.points}` : rule.points} Poin
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-semibold leading-relaxed">
                        {rule.standardAction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RIWAYAT TRANSAKSI POIN */}
      {activeTab === "history" && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">RIWAYAT LOG PENCATATAN POIN SISWA</h3>
              <p className="text-xs text-slate-500 font-medium">
                Daftar kronologi pencatatan poin pelanggaran & apresiasi terbaru seluruh kelas.
              </p>
            </div>
          </div>

          {records.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs italic">Belum ada riwayat catatan poin.</div>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900">{r.studentName}</span>
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {r.className}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          r.category === "Apresiasi"
                            ? "bg-emerald-100 text-emerald-900"
                            : r.category === "Berat"
                            ? "bg-rose-100 text-rose-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {r.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{r.date}</span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-800">{r.violationName}</h5>
                    <p className="text-xs text-slate-600 font-medium italic">"{r.notes}"</p>
                    <span className="text-[10px] text-slate-500 font-bold block pt-1">
                      Pelapor: {r.reporterName} ({r.reporterRole}) • Status:{" "}
                      <strong className="text-slate-900">{r.handlingStatus}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <span
                      className={`text-sm font-black px-3 py-1 rounded-xl ${
                        r.points < 0 ? "bg-emerald-600 text-white" : "bg-slate-900 text-amber-400"
                      }`}
                    >
                      {r.points > 0 ? `+${r.points}` : r.points} Poin
                    </span>

                    {!studentViewMode && canEdit && (
                      <button
                        onClick={() => handleDeleteRecord(r.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        title="Hapus Catatan (Hanya BK)"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CATAT PELANGGARAN / APRESIASI BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-700 rounded-xl">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">PENCATATAN POIN PELANGGARAN / APRESIASI</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    SMK NEGERI 2 KONAWE
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecordSubmit} className="space-y-4">
              {/* Nama Siswa & Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 block">
                    Nama Siswa Murid: <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-1">
                    {studentsInSelectedFormClass.length > 0 ? (
                      <select
                        value={formStudentName}
                        onChange={(e) => setFormStudentName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white cursor-pointer"
                        required
                      >
                        <option value="">-- Pilih Siswa Kelas {formClassName} --</option>
                        {studentsInSelectedFormClass.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} ({s.nisn || s.nis || "No NISN"})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="Ketik nama lengkap siswa..."
                        value={formStudentName}
                        onChange={(e) => setFormStudentName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 block">Kelas:</label>
                  <select
                    value={formClassName}
                    onChange={(e) => {
                      setFormClassName(e.target.value);
                      setFormStudentName("");
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-extrabold text-slate-900 cursor-pointer focus:ring-2 focus:ring-amber-500"
                  >
                    {availableClasses
                      .filter((c) => c !== "Semua Kelas")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Pilih Aturan / Preset Pelanggaran */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-600 block">
                  Pilih Aturan / Jenis Pelanggaran:
                </label>
                <select
                  value={formRuleId}
                  onChange={(e) => handleRuleChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 cursor-pointer focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Pilih dari Katalog Aturan Resmi --</option>
                  <option value="custom">✏️ [Input Bebas / Custom Pelanggaran Baru]</option>
                  <optgroup label="🔴 Pelanggaran Berat (50 - 100 Poin)">
                    {rules
                      .filter((r) => r.category === "Berat")
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.code} - {r.name} (+{r.points} Poin)
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🟡 Pelanggaran Sedang (20 - 45 Poin)">
                    {rules
                      .filter((r) => r.category === "Sedang")
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.code} - {r.name} (+{r.points} Poin)
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="⚪ Pelanggaran Ringan (5 - 15 Poin)">
                    {rules
                      .filter((r) => r.category === "Ringan")
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.code} - {r.name} (+{r.points} Poin)
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🟢 Apresiasi / Pemulihan Poin (-Minus Poin)">
                    {rules
                      .filter((r) => r.category === "Apresiasi")
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.code} - {r.name} ({r.points} Poin)
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Detail Kategori & Poin */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 block">Kategori:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="Ringan">Ringan (5 - 15 Poin)</option>
                    <option value="Sedang">Sedang (20 - 45 Poin)</option>
                    <option value="Berat">Berat (50 - 100 Poin)</option>
                    <option value="Apresiasi">Apresiasi (-Minus Poin)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 block">Bobot Poin:</label>
                  <input
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-black text-slate-900 text-center"
                  />
                </div>
              </div>

              {/* Tanggal & Pelapor */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 block">Tanggal Kejadidan:</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-600 block">Nama Pelapor:</label>
                  <input
                    type="text"
                    value={formReporterName}
                    onChange={(e) => setFormReporterName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Catatan / Kronologi */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-600 block">
                  Uraian Kronologi & Catatan:
                </label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan kronologi singkat atau detail pelanggaran..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                ></textarea>
              </div>

              {/* Handling Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-600 block">
                  Tindakan Penanganan Saat Ini:
                </label>
                <select
                  value={formHandlingStatus}
                  onChange={(e) => setFormHandlingStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 cursor-pointer"
                >
                  <option value="Dicatat">Dicatat di Log Kedisiplinan</option>
                  <option value="Pembinaan Lisan">Pembinaan Lisan Wali Kelas / BK</option>
                  <option value="Pemanggilan Orang Tua">Pemanggilan Orang Tua ke Sekolah</option>
                  <option value="SP1">Penerbitan Surat Peringatan 1 (SP1)</option>
                  <option value="SP2">Penerbitan Surat Peringatan 2 (SP2)</option>
                  <option value="SP3">Penerbitan Surat Peringatan 3 (SP3)</option>
                  <option value="Selesai/Tuntas">Selesai / Tuntas Ditangani</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Simpan Catatan Poin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CETAK RAPOR POIN & SURAT PERINGATAN (PRINTABLE FORM) */}
      {isPrintModalOpen && activePrintStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
              <span className="text-xs font-black uppercase text-slate-700">
                DOKUMEN RESMI REKAPITULASI KEDISIPLINAN & SP
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Surat / Laporan</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE AREA */}
            <div className="space-y-6 p-4 border border-slate-300 rounded-2xl bg-white text-slate-900">
              {/* KOP SURAT RESMI */}
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  PEMERINTAH PROVINSI SULAWESI TENGGARA
                </h4>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </h3>
                <h2 className="text-base font-black uppercase tracking-wider text-slate-950">
                  SEKOLAH MENENGAH KEJURUAN NEGERI 2 KONAWE
                </h2>
                <p className="text-[10px] text-slate-600 font-medium">
                  Jl. Inolobunggadue No. 02 Unaaha, Kab. Konawe, Sultra | Email: smkn2konawe@gmail.com
                </p>
              </div>

              {/* JUDUL SURAT */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black uppercase underline tracking-wide text-slate-950">
                  REKAPITULASI POIN KEDISIPLINAN SISWA
                </h3>
                <p className="text-[11px] font-bold text-slate-600">
                  Status Level: <strong className="text-slate-900">{activePrintStudent.threshold.status}</strong>
                </p>
              </div>

              {/* BIODATA SISWA */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">NAMA SISWA:</span>
                  <strong className="text-sm text-slate-950">{activePrintStudent.studentName}</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">KELAS & JURUSAN:</span>
                  <strong className="text-sm text-slate-950">{activePrintStudent.className}</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">TOTAL AKUMULASI POIN:</span>
                  <strong className="text-sm text-rose-600">{activePrintStudent.totalPoints} / 100 POIN</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">TANGGAL CETAK:</span>
                  <strong className="text-sm text-slate-950">{new Date().toLocaleDateString("id-ID")}</strong>
                </div>
              </div>

              {/* TABLE PELANGGARAN */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Rincian Catatan Pelanggaran & Apresiasi ({activePrintStudent.records.length}):
                </h4>

                <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 text-[10px] font-black uppercase">
                      <th className="p-2 border border-slate-300">Tgl</th>
                      <th className="p-2 border border-slate-300">Jenis Pelanggaran / Prestasi</th>
                      <th className="p-2 border border-slate-300 text-center">Poin</th>
                      <th className="p-2 border border-slate-300">Pelapor & Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activePrintStudent.records.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-3 text-center italic text-slate-500 text-xs">
                          Nihil pelanggaran. Siswa memiliki catatan kedisiplinan yang bersih.
                        </td>
                      </tr>
                    ) : (
                      activePrintStudent.records.map((r) => (
                        <tr key={r.id}>
                          <td className="p-2 border border-slate-300 font-mono text-[10px]">{r.date}</td>
                          <td className="p-2 border border-slate-300 font-bold">{r.violationName}</td>
                          <td className="p-2 border border-slate-300 text-center font-black">
                            {r.points > 0 ? `+${r.points}` : r.points}
                          </td>
                          <td className="p-2 border border-slate-300 text-[10px] text-slate-700">
                            {r.notes} ({r.reporterName})
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PERNYATAAN PENANGANAN */}
              <div className="p-3 bg-slate-100 rounded-xl text-xs space-y-1 border border-slate-300">
                <span className="font-extrabold uppercase text-slate-900 block">INSTRUKSI & TINDAKAN BK:</span>
                <p className="font-medium text-slate-800">{activePrintStudent.threshold.actionText}</p>
              </div>

              {/* TANDA TANGAN */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs pt-8">
                <div>
                  <span className="block text-slate-600 font-medium">Orang Tua / Wali Siswa,</span>
                  <div className="h-16"></div>
                  <strong className="block text-slate-900 underline">( ...................................... )</strong>
                </div>

                <div>
                  <span className="block text-slate-600 font-medium">Guru Bimbingan Konseling,</span>
                  <div className="h-16"></div>
                  <strong className="block text-slate-900 underline">Cici Murni, S.Pd.</strong>
                  <span className="text-[9px] text-slate-500">NIP. 19890915 201402 2 003</span>
                </div>

                <div>
                  <span className="block text-slate-600 font-medium">Wali Kelas,</span>
                  <div className="h-16"></div>
                  <strong className="block text-slate-900 underline">( ...................................... )</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentViolationCreditManager;
