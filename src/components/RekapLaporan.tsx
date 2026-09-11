/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Calendar, 
  Share2, 
  Send, 
  Users, 
  BookOpen, 
  Award, 
  Trash2, 
  Bell, 
  ShieldAlert,
  Check,
  AlertCircle,
  FileText,
  Activity,
  PlusCircle,
  ClipboardList,
  CheckSquare,
  UserCheck,
  Heart,
  Plus,
  ArrowRight,
  RefreshCw,
  Settings,
  Database,
  Building2,
  QrCode,
  Copy,
  Link,
  ExternalLink,
  KeyRound
} from "lucide-react";
import { QrScannerModal } from "./QrScannerModal";
import { Comprehensive15WitaReportModal } from "./Comprehensive15WitaReportModal";

import { isFirebaseConfigured, getFirebaseConfig, dbService } from "../firebase";
import { OFFICIAL_SMK2_SCHEDULES } from "../data/translatedSchedules";
import { autoPruneAllStorageLogs, pruneItemsOlderThan3Weeks, isLogOlderThan3Weeks } from "../utils/dataCleanup";
import {
  buildTuStaffDailyReport,
  dispatchTuStaffDailyReport,
  getTuGroupTarget,
  getTeacherGroupTarget,
  getAdminTuNumber,
  getGuruBkNumber,
  getAdminTuPhone,
  getGuruBkPhone,
  getFonnteApiKey,
  saveFonnteConfig,
  sendFonnteMessage
} from "../services/whatsappFonnteService";

// Types matching other components
interface TeacherAttendance {
  id: string;
  teacherName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  latitude?: number;
  longitude?: number;
  distanceMeter?: number;
  selfie?: string;
  status: "Hadir" | "Sakit" | "Izin" | "Ditolak" | "Tanpa Keterangan";
  rejectionReason?: string;
}

interface JurnalMengajar {
  id: string;
  date: string;
  subject: string;
  className: string;
  tpCode: string;
  material: string;
  attendancePresent: number;
  attendanceAbsent: string[];
  activities?: string;
  reflectionGuru?: string;
  obstacles?: string;
  followUp?: string;
  createdAt?: string;
}

interface StudentAttendanceRecord {
  id: string;
  name: string;
  status: "Hadir" | "Sakit" | "Izin" | "Alfa";
}

interface SavedAttendanceLog {
  id: string;
  date: string;
  className: string;
  subject: string;
  records: StudentAttendanceRecord[];
}

interface BKCounselingCase {
  id: string;
  date: string;
  studentName: string;
  className: string;
  caseType: string; // e.g., "Keterlambatan berulang", "Membolos", "Kurang Disiplin"
  actionTaken: string; // e.g., "Konseling Individu", "Panggilan Orang Tua", "Teguran Simpatik"
  status: "Dalam Bimbingan" | "Selesai" | "Panggilan Orang Tua";
  reportedBy: string;
}

interface GuruPiketLog {
  id: string;
  date: string;
  reporterName: string;
  shift: string;
  classroomCheck: string;
  hygieneCondition: string;
  securityCondition: string;
  incidentNotes: string;
}

interface GuruWaliLog {
  id: string;
  date: string;
  className: string;
  waliName: string;
  developmentNotes: string;
  specialCase: string;
  parentCoordination: string;
}

export const isTuPersonnelName = (name: string): boolean => {
  if (!name) return false;
  const n = name.toLowerCase();
  return (
    n.includes("admin tu") ||
    n.includes("staf tu") ||
    n.includes("tata usaha") ||
    n.includes("sakti") ||
    n.includes("adelia") ||
    n.includes("saktinani") ||
    n.includes("pusparini")
  );
};

// Pre-seeded fallback mock data for realistic presentation if LocalStorage is empty
const SEED_TEACHER_ATTENDANCE: TeacherAttendance[] = [
  {
    id: "TU-01",
    teacherName: "Saktinani Djunaid, S.Sos. (Admin TU)",
    date: new Date().toISOString().split("T")[0],
    clockIn: "06:30",
    clockOut: "15:30",
    distanceMeter: 12,
    status: "Hadir"
  },
  {
    id: "TU-02",
    teacherName: "Adelia Pusparini, A.Md. (Staf TU)",
    date: new Date().toISOString().split("T")[0],
    clockIn: "06:45",
    clockOut: "15:30",
    distanceMeter: 28,
    status: "Hadir"
  },
  {
    id: "A-03",
    teacherName: "Sri Rahayu, S.Pd.",
    date: new Date().toISOString().split("T")[0],
    clockIn: "06:55",
    clockOut: null,
    distanceMeter: 240,
    status: "Hadir"
  }
];

const SEED_JURNAL_MENGAJAR: JurnalMengajar[] = [
  {
    id: "J-01",
    date: new Date().toISOString().split("T")[0],
    subject: "Teknik Kendaraan Ringan (Otomotif)",
    className: "XI TKR A",
    tpCode: "TP-TKR-01",
    material: "Kalibrasi Sensor MAF & Troubleshooting Injeksi EFI",
    attendancePresent: 28,
    attendanceAbsent: ["Bagus (Sakit)", "Dedi (Izin)"],
    activities: "Praktikum di bengkel utama. Murid secara mandiri melakukan diagnosa menggunakan scanner OBD-II Launch X431.",
    reflectionGuru: "Murid sangat antusias melakukan kalibrasi sensor, namun beberapa butuh pendampingan ekstra.",
    obstacles: "Kabel scanner longgar, menyebabkan interupsi beberapa kali.",
    followUp: "Melakukan pengecekan ketat adapter OBD sebelum sesi praktikum berikutnya.",
    createdAt: new Date().toISOString()
  }
];

const SEED_STUDENT_ATTENDANCE: SavedAttendanceLog[] = [
  {
    id: "S-ATT-01",
    date: new Date().toISOString().split("T")[0],
    className: "XI TKR A",
    subject: "Teknik Kendaraan Ringan (Otomotif)",
    records: [
      { id: "S01", name: "Aditya Pratama", status: "Hadir" },
      { id: "S02", name: "Bagus Setiawan", status: "Sakit" }, // Sick Student
      { id: "S03", name: "Dedi Cahyono", status: "Izin" },   // Permission
      { id: "S04", name: "Eko Purwanto", status: "Hadir" },
      { id: "S05", name: "Fajar Ramadan", status: "Hadir" },
      { id: "S06", name: "Guntur Wibowo", status: "Hadir" },
      { id: "S07", name: "Hendra Wijaya", status: "Hadir" },
      { id: "S08", name: "Irfan Hakim", status: "Hadir" },
      { id: "S09", name: "Kurniawan", status: "Alfa" }       // Absent
    ]
  }
];

const SEED_BK_COUNSELING: BKCounselingCase[] = [
  {
    id: "BK-01",
    date: new Date().toISOString().split("T")[0],
    studentName: "Kurniawan",
    className: "XI TKR A",
    caseType: "Tanpa Keterangan (Alfa) di jam produktif",
    actionTaken: "Pemanggilan oleh Guru BK & Konseling persuasif",
    status: "Dalam Bimbingan",
    reportedBy: "Isnawati, S.Pd. (Guru BK)"
  }
];

const SEED_GURU_PIKET: GuruPiketLog[] = [
  {
    id: "PKT-01",
    date: new Date().toISOString().split("T")[0],
    reporterName: "Isnawati, S.Pd. (Guru Piket)",
    shift: "Pagi (07.00 - 12.00)",
    classroomCheck: "Pemantauan berkala seluruh ruang teori & bengkel otomotif. Kelas XI TKR A & B terpantau tertib melaksanakan praktikum EFI.",
    hygieneCondition: "Sangat Bersih & Rapi. Area bengkel utama telah dibersihkan pasca praktikum pertama.",
    securityCondition: "Sangat Aman & Kondusif. Tidak ada murid berkeliaran di luar saat jam pelajaran berlangsung.",
    incidentNotes: "Nihil kejadian menonjol. Gerbang sekolah dikunci rapat pukul 07.30."
  }
];

const SEED_GURU_WALI: GuruWaliLog[] = [
  {
    id: "GW-01",
    date: new Date().toISOString().split("T")[0],
    className: "XI TKR A",
    waliName: "Isnawati, S.Pd.",
    developmentNotes: "Melakukan briefing pagi mengenai kebersihan toolbox bengkel dan kewajiban wearpack lengkap.",
    specialCase: "Murid Kurniawan terpantau terlambat 15 menit, diarahkan ke BK untuk bimbingan preventif.",
    parentCoordination: "Telah menghubungi orang tua Bagus Setiawan untuk konfirmasi surat dokter perihal izin sakit."
  }
];

export function RekapLaporan({ currentRole, username }: { currentRole?: string; username?: string } = {}) {
  const userRole = currentRole || localStorage.getItem("sihadir_role") || "guru";
  const authUsername = username || localStorage.getItem("sihadir_username") || "";
  const isSuperAdmin = userRole === "admin" || authUsername === "admin";
  const isExecutiveAdmin = ["admin", "kepsek", "kurikulum", "tu", "piket", "kesiswaan"].includes(userRole) || isSuperAdmin;

  // --- STATE FOR DISK DATA ---
  const [teacherLogs, setTeacherLogs] = useState<TeacherAttendance[]>([]);
  const [journals, setJournals] = useState<JurnalMengajar[]>([]);
  const [studentLogs, setStudentLogs] = useState<SavedAttendanceLog[]>([]);
  const [selfAttendanceLogs, setSelfAttendanceLogs] = useState<any[]>([]);
  const [bkLogs, setBkLogs] = useState<BKCounselingCase[]>([]);
  const [ketuaKelasReports, setKetuaKelasReports] = useState<any[]>([]);
  const [guruPiketLogs, setGuruPiketLogs] = useState<GuruPiketLog[]>([]);
  const [guruWaliLogs, setGuruWaliLogs] = useState<GuruWaliLog[]>([]);
  const [studentReflections, setStudentReflections] = useState<any[]>([]);

  // --- CUSTOM CONFIRM MODAL STATE & HELPER ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      }
    });
  };

  // Form input states for Quick Addition (Wali Kelas / Guru Wali / BK)
  const [activeTabPanel, setActiveTabPanel] = useState<"rekap" | "rekap-murid" | "rekap-guru" | "rekap-tu" | "rekap-piket" | "quick-submit" | "fonnte-config" | "firebase-config" | "rekap-masuk-pulang" | "rekap-refleksi">("rekap");
  const [toast, setToast] = useState<string | null>(null);

  // Share Student Attendance Link Modal state
  const [isShareLinkModalOpen, setIsShareLinkModalOpen] = useState<boolean>(false);
  const [isComprehensive15ModalOpen, setIsComprehensive15ModalOpen] = useState<boolean>(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState<boolean>(false);
  const [firestoreSyncCount, setFirestoreSyncCount] = useState<number>(0);

  // Custom Firebase fields
  const [firebaseApiKey, setFirebaseApiKey] = useState(() => {
    const cfg = getFirebaseConfig();
    return cfg?.apiKey || "";
  });
  const [firebaseProjectId, setFirebaseProjectId] = useState(() => {
    const cfg = getFirebaseConfig();
    return cfg?.projectId || "";
  });
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState(() => {
    const cfg = getFirebaseConfig();
    return cfg?.authDomain || "";
  });
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useState(() => {
    const cfg = getFirebaseConfig();
    return cfg?.storageBucket || "";
  });
  const [firebaseMessagingSenderId, setFirebaseMessagingSenderId] = useState(() => {
    const cfg = getFirebaseConfig();
    return cfg?.messagingSenderId || "";
  });
  const [firebaseAppId, setFirebaseAppId] = useState(() => {
    const cfg = getFirebaseConfig();
    return cfg?.appId || "";
  });
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  // --- MASUK & PULANG STATES ---
  const [mpDateFilter, setMpDateFilter] = useState<string>(new Date().toISOString().split("T")[0]);
  const [mpSearchQuery, setMpSearchQuery] = useState<string>("");
  const [mpClassFilter, setMpClassFilter] = useState<string>("Semua Kelas");

  // --- REKAP GURU PIKET FILTER STATES ---
  const [piketSearchQuery, setPiketSearchQuery] = useState<string>("");
  const [piketShiftFilter, setPiketShiftFilter] = useState<string>("Semua Shift");
  const [piketDateFilter, setPiketDateFilter] = useState<string>("");
  const [piketStatusFilter, setPiketStatusFilter] = useState<string>("Semua Status");

  const handleVerifyPiketLog = (id: number) => {
    const updated = guruPiketLogs.map(p => {
      if (p.id === id) {
        const verifier = authUsername ? `Terverifikasi (${authUsername.toUpperCase()})` : "Terverifikasi Admin Utama";
        return { ...p, status: verifier };
      }
      return p;
    });
    saveGuruPiketLogs(updated);
    triggerToast("Laporan Guru Piket berhasil diverifikasi!");
  };

  const handleDeletePiketLog = (id: number) => {
    triggerConfirm(
      "Hapus Laporan Guru Piket",
      "Apakah Anda yakin ingin menghapus catatan laporan guru piket ini secara permanen?",
      () => {
        const updated = guruPiketLogs.filter(p => p.id !== id);
        saveGuruPiketLogs(updated);
        triggerToast("Laporan Guru Piket berhasil dihapus.");
      }
    );
  };

  // Fonnte WhatsApp Gateway settings states
  const [fonnteApiKey, setFonnteApiKey] = useState(() => getFonnteApiKey());
  const [fonnteTarget, setFonnteTarget] = useState(() => getTeacherGroupTarget());
  const [fonnteTuTarget, setFonnteTuTarget] = useState(() => getTuGroupTarget());
  const [fonnteAdminTuNumber, setFonnteAdminTuNumber] = useState(() => getAdminTuPhone());
  const [fonnteGuruBkNumber, setFonnteGuruBkNumber] = useState(() => getGuruBkPhone());
  const [isSendingWA, setIsSendingWA] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [testSendResult, setTestSendResult] = useState<{ target: string; msg: string; success: boolean } | null>(null);

  const handleSaveFonnteSettings = () => {
    saveFonnteConfig({
      apiKey: fonnteApiKey,
      teacherGroup: fonnteTarget,
      tuGroup: fonnteTuTarget,
      adminTuPhone: fonnteAdminTuNumber,
      guruBkPhone: fonnteGuruBkNumber
    });
    triggerToast("Pengaturan Fonnte Gateway & Nomor WhatsApp berhasil disimpan!");
  };

  const handleTestSendTarget = async (target: string, label: string) => {
    if (!target) {
      alert(`Nomor / Target ${label} belum diisi.`);
      return;
    }
    setTestSendResult(null);
    const testMsg = `🔔 *TES KONEKSI GATEWAY FONNTE SMK NEGERI 2 KONAWE*\n\nHalo, ini adalah pesan uji konektivitas integrasi WhatsApp Fonnte SIHADIR.\nTarget: ${label} (${target})\nWaktu: ${new Date().toLocaleTimeString("id-ID")}\n\nSistem Pelaporan Otomatis Terhubung! ✅`;
    try {
      const res = await sendFonnteMessage(target, testMsg, fonnteApiKey);
      if (res.success) {
        setTestSendResult({ target: label, msg: `Pesan tes berhasil dikirim ke ${label} (${target})!`, success: true });
        triggerToast(`Sukses terhubung ke ${label}!`);
      } else {
        setTestSendResult({ target: label, msg: `Gagal mengirim ke ${label}: ${res.error || "Error"}`, success: false });
      }
    } catch (e: any) {
      setTestSendResult({ target: label, msg: `Error: ${e.message}`, success: false });
    }
  };

  // Dedicated TU Daily 09:00 AM WhatsApp Report States
  const [isSendingTuWa, setIsSendingTuWa] = useState(false);
  const [tuSendFeedback, setTuSendFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedTuText, setCopiedTuText] = useState(false);

  const tuDailyReport = React.useMemo(() => {
    return buildTuStaffDailyReport();
  }, [teacherLogs]);

  const handleSendTuReportNow = async () => {
    setIsSendingTuWa(true);
    setTuSendFeedback(null);
    try {
      const res = await dispatchTuStaffDailyReport(true);
      if (res.success) {
        setTuSendFeedback({ type: "success", text: "🚀 Sukses! Laporan Presensi TU Pukul 09.00 berhasil disiarkan ke Grup WhatsApp TU via Fonnte Gateway." });
      } else {
        setTuSendFeedback({ type: "error", text: `⚠️ Fonnte Gateway: ${res.message}` });
      }
    } catch (e: any) {
      setTuSendFeedback({ type: "error", text: `Kendala: ${e.message || "Gagal menghubungi Fonnte API"}` });
    } finally {
      setIsSendingTuWa(false);
      setTimeout(() => setTuSendFeedback(null), 8000);
    }
  };

  const handleCopyTuText = () => {
    navigator.clipboard.writeText(tuDailyReport.messageText);
    setCopiedTuText(true);
    setTimeout(() => setCopiedTuText(false), 3500);
  };

  // Quick addition fields
  const [formType, setFormType] = useState<"sakit-izin" | "bk-case" | "guru-piket" | "guru-wali">("sakit-izin");
  const [newStudentName, setNewStudentName] = useState("");
  const [newClassName, setNewClassName] = useState("XI TKR A");
  const [newStatus, setNewStatus] = useState<"Sakit" | "Izin" | "Alfa">("Sakit");
  const [newReason, setNewReason] = useState("Sakit demam tinggi, ada surat keterangan dokter");
  
  const [newBkStudent, setNewBkStudent] = useState("");
  const [newBkClass, setNewBkClass] = useState("XI TKR A");
  const [newBkCase, setNewBkCase] = useState("Sering terlambat masuk jam pertama");
  const [newBkAction, setNewBkAction] = useState("Konseling Individu & pembinaan disiplin");
  const [newBkStatus, setNewBkStatus] = useState<"Dalam Bimbingan" | "Selesai" | "Panggilan Orang Tua">("Dalam Bimbingan");

  // Quick addition fields for Guru Piket
  const [piketReporterName, setPiketReporterName] = useState("Isnawati, S.Pd. (Guru Piket)");
  const [piketShift, setPiketShift] = useState("Pagi (07.00 - 12.00)");
  const [piketClassroomCheck, setClassroomCheck] = useState("Semua kelas terpantau tertib melaksanakan pembelajaran sesuai jadwal.");
  const [piketHygiene, setPiketHygiene] = useState("Sangat Bersih & Rapi");
  const [piketSecurity, setPiketSecurity] = useState("Aman & Kondusif");
  const [piketIncidents, setPiketIncidents] = useState("Nihil kejadian menonjol.");

  // Quick addition fields for Guru Wali / Wali Kelas
  const [waliName, setWaliName] = useState("Wali Kelas XI TKR A");
  const [waliClassName, setWaliClassName] = useState("XI TKR A");
  const [waliDevNotes, setWaliDevNotes] = useState("Murid kelas diberikan pembinaan berkala mengenai pemeliharaan wearpack.");
  const [waliSpecialCase, setWaliSpecialCase] = useState("Semua murid mengikuti KBM dengan baik.");
  const [waliParentCoordination, setWaliParentCoordination] = useState("Tidak ada kasus yang mendesak.");

  // Chatbot State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "bot"; text: string; time: string }[]>([
    {
      sender: "bot",
      text: "Halo Bapak/Ibu Guru! Saya SIHADIR, asisten pemantau disiplin, kehadiran, dan bimbingan murid di SMK Negeri 2 Konawe. Saya mengumpulkan data absensi guru, jurnal mengajar harian, laporan wali kelas (murid sakit/izin), serta penanganan Guru BK secara realtime. Ada yang bisa saya bantu menganalisis rekapitulasi laporan hari ini?",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [isBotLoading, setIsBotLoading] = useState(false);

  // Selected signal format for WhatsApp preview
  const [selectedSignalId, setSelectedSignalId] = useState<string>("rekap-harian");
  const [waMessageDraft, setWaMessageDraft] = useState("");
  const [showWASimulator, setShowWASimulator] = useState(false);

  // --- STUDENT ATTENDANCE RECAP FILTER & EDIT STATES ---
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("Semua Kelas");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("");
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>("");
  const [viewSelfieModalUrl, setViewSelfieModalUrl] = useState<string | null>(null);
  const [rekapSiswaSubTab, setRekapSiswaSubTab] = useState<"arsip-kelas" | "presensi-mandiri">("arsip-kelas");

  // --- TEACHING SCHEDULE SELECTOR STATES FOR ADMIN & TU ---
  const [selectedScheduleTeacher, setSelectedScheduleTeacher] = useState<string>("auto");
  const [selectedScheduleSemester, setSelectedScheduleSemester] = useState<string>("Ganjil 2026/2027");

  const scheduleTeacherNames = Array.from(new Set(OFFICIAL_SMK2_SCHEDULES.map(s => s.teacherName))).filter(Boolean).sort();
  const autoTeacherName = scheduleTeacherNames.find(t => t.toLowerCase().includes("syamsul")) || "Syamsul Sabir, S.Kom";
  const effectiveTeacherForSchedule = selectedScheduleTeacher === "auto" ? autoTeacherName : selectedScheduleTeacher;
  const filteredScheduleList = selectedScheduleTeacher === "semua"
    ? OFFICIAL_SMK2_SCHEDULES
    : OFFICIAL_SMK2_SCHEDULES.filter(s => s.teacherName.toLowerCase() === effectiveTeacherForSchedule.toLowerCase() || s.teacherName.toLowerCase().includes(effectiveTeacherForSchedule.toLowerCase()));

  // --- STUDENT REFLECTION RECAP FILTER STATES ---
  const [reflDateFilter, setReflDateFilter] = useState<string>(new Date().toISOString().split("T")[0]);
  const [reflClassFilter, setReflClassFilter] = useState<string>("Semua Kelas");
  const [reflSearchQuery, setReflSearchQuery] = useState<string>("");

  // --- TEACHER ATTENDANCE RECAP FILTER & EDIT STATES ---
  const [selectedTeacherDateFilter, setSelectedTeacherDateFilter] = useState<string>("");
  const [teacherSearchQuery, setTeacherSearchQuery] = useState<string>("");
  const [selectedTeacherStatusFilter, setSelectedTeacherStatusFilter] = useState<string>("Semua Status");
  const [showAddTeacherModal, setShowAddTeacherModal] = useState<boolean>(false);
  
  const [newTeacherFormName, setNewTeacherFormName] = useState<string>("");
  const [newTeacherFormDate, setNewTeacherFormDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newTeacherFormClockIn, setNewTeacherFormClockIn] = useState<string>("07:00");
  const [newTeacherFormClockOut, setNewTeacherFormClockOut] = useState<string>("");
  const [newTeacherFormStatus, setNewTeacherFormStatus] = useState<"Hadir" | "Sakit" | "Izin" | "Ditolak" | "Tanpa Keterangan">("Hadir");
  const [newTeacherFormDistance, setNewTeacherFormDistance] = useState<string>("50");

  // --- ADMIN & STAF TATA USAHA (TU) RECAP FILTER & EDIT STATES ---
  const [tuDateFilter, setTuDateFilter] = useState<string>(new Date().toISOString().split("T")[0]);
  const [tuSearchQuery, setTuSearchQuery] = useState<string>("");
  const [tuStatusFilter, setTuStatusFilter] = useState<string>("Semua Status");
  const [showAddTuModal, setShowAddTuModal] = useState<boolean>(false);

  const [newTuFormName, setNewTuFormName] = useState<string>("Saktinani Djunaid, S.Sos. (Admin TU)");
  const [newTuFormRole, setNewTuFormRole] = useState<string>("Admin TU");
  const [newTuFormDate, setNewTuFormDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newTuFormClockIn, setNewTuFormClockIn] = useState<string>("06:30");
  const [newTuFormClockOut, setNewTuFormClockOut] = useState<string>("15:30");
  const [newTuFormStatus, setNewTuFormStatus] = useState<"Hadir" | "Sakit" | "Izin" | "Ditolak" | "Tanpa Keterangan">("Hadir");
  const [newTuFormDistance, setNewTuFormDistance] = useState<string>("15");

  const handleAddTuLogManualSubmit = () => {
    if (!newTuFormName.trim()) {
      alert("Silakan pilih atau masukkan nama personel TU terlebih dahulu!");
      return;
    }

    const fullNameWithRole = newTuFormName.includes("(") 
      ? newTuFormName.trim() 
      : `${newTuFormName.trim()} (${newTuFormRole})`;

    const newLog: TeacherAttendance = {
      id: "TU-" + Date.now(),
      teacherName: fullNameWithRole,
      date: newTuFormDate,
      clockIn: newTuFormClockIn ? newTuFormClockIn : null,
      clockOut: newTuFormClockOut ? newTuFormClockOut : null,
      distanceMeter: parseFloat(newTuFormDistance) || 12,
      status: newTuFormStatus
    };

    const updated = [newLog, ...teacherLogs];
    saveTeacherLogs(updated);
    setShowAddTuModal(false);
    triggerToast(`Presensi manual Admin/Staf TU ${fullNameWithRole} berhasil ditambahkan!`);
  };

  // --- TEACHER ATTENDANCE MANAGEMENT HELPERS ---
  const handleDeleteTeacherLog = (id: string, teacherName: string) => {
    triggerConfirm(
      "Hapus Log Presensi Guru",
      `Apakah Anda yakin ingin menghapus log presensi guru ${teacherName}?`,
      () => {
        const updated = teacherLogs.filter(log => log.id !== id);
        saveTeacherLogs(updated);
        triggerToast(`Log presensi guru ${teacherName} berhasil dihapus.`);
      }
    );
  };

  const handleUpdateTeacherStatus = (id: string, newStatus: "Hadir" | "Sakit" | "Izin" | "Ditolak" | "Tanpa Keterangan") => {
    const updated = teacherLogs.map(log => {
      if (log.id === id) {
        return { ...log, status: newStatus };
      }
      return log;
    });
    saveTeacherLogs(updated);
    triggerToast(`Status presensi guru berhasil diperbarui menjadi ${newStatus}.`);
  };

  const handleUpdateTeacherClockTimes = (id: string, newIn: string | null, newOut: string | null) => {
    const updated = teacherLogs.map(log => {
      if (log.id === id) {
        return { ...log, clockIn: newIn || null, clockOut: newOut || null };
      }
      return log;
    });
    saveTeacherLogs(updated);
    triggerToast("Jam presensi guru berhasil diperbarui.");
  };

  const handleAddTeacherLogManualSubmit = () => {
    if (!newTeacherFormName.trim()) {
      alert("Silakan masukkan nama guru mapel terlebih dahulu!");
      return;
    }

    const newLog: TeacherAttendance = {
      id: "TCH-" + Date.now(),
      teacherName: newTeacherFormName.trim(),
      date: newTeacherFormDate,
      clockIn: newTeacherFormClockIn ? newTeacherFormClockIn : null,
      clockOut: newTeacherFormClockOut ? newTeacherFormClockOut : null,
      distanceMeter: parseFloat(newTeacherFormDistance) || undefined,
      status: newTeacherFormStatus
    };

    const updated = [newLog, ...teacherLogs];
    saveTeacherLogs(updated);
    
    // Reset Form & Close
    setNewTeacherFormName("");
    setNewTeacherFormClockIn("07:00");
    setNewTeacherFormClockOut("");
    setNewTeacherFormStatus("Hadir");
    setNewTeacherFormDistance("50");
    setShowAddTeacherModal(false);
    triggerToast(`Berhasil menambahkan log presensi manual untuk ${newLog.teacherName}!`);
  };

  // --- STUDENT ATTENDANCE RECAP MANAGEMENT HELPERS ---
  const handleDeleteClassRecord = (logId: string, studentName: string) => {
    triggerConfirm(
      "Hapus Catatan Presensi Murid",
      `Apakah Anda yakin ingin menghapus catatan presensi murid ${studentName}?`,
      () => {
        const updated = studentLogs.map(log => {
          if (log.id === logId) {
            return {
              ...log,
              records: log.records.filter(r => r.name !== studentName)
            };
          }
          return log;
        }).filter(log => log.records.length > 0);
        saveStudentLogs(updated);
        triggerToast(`Berhasil menghapus presensi ${studentName}.`);
      }
    );
  };

  const handleUpdateClassRecordStatus = (logId: string, studentName: string, newStatus: "Hadir" | "Sakit" | "Izin" | "Alfa") => {
    let targetLog: SavedAttendanceLog | null = null;
    const updated = studentLogs.map(log => {
      if (log.id === logId) {
        targetLog = {
          ...log,
          records: log.records.map(r => r.name === studentName ? { ...r, status: newStatus } : r)
        };
        return targetLog;
      }
      return log;
    });
    saveStudentLogs(updated);
    if (targetLog) {
      dbService.saveRecord("saved_attendance_logs", logId, targetLog);
    }
    triggerToast(`Status ${studentName} diperbarui menjadi ${newStatus}.`);
  };

  const handleDeleteSelfLog = (id: string, studentName: string) => {
    triggerConfirm(
      "Hapus Presensi Mandiri Murid",
      `Apakah Anda yakin ingin menghapus log presensi mandiri murid ${studentName}?`,
      () => {
        const updated = selfAttendanceLogs.filter(log => log.id !== id);
        saveSelfAttendanceLogs(updated);
        dbService.deleteRecord("student_self_attendance", id);
        triggerToast(`Log presensi mandiri ${studentName} berhasil dihapus.`);
      }
    );
  };

  const handleUpdateSelfLogStatus = (id: string, newStatus: string) => {
    let targetSelf: any = null;
    const updated = selfAttendanceLogs.map(log => {
      if (log.id === id) {
        targetSelf = { ...log, status: newStatus };
        return targetSelf;
      }
      return log;
    });
    saveSelfAttendanceLogs(updated);
    if (targetSelf) {
      dbService.saveRecord("student_self_attendance", id, targetSelf);
    }
    triggerToast(`Status presensi mandiri diperbarui menjadi ${newStatus}.`);
  };

  const handleDeleteEntireClassLog = (logId: string) => {
    triggerConfirm(
      "Hapus Seluruh Laporan Kelas",
      "Apakah Anda yakin ingin menghapus seluruh rekaman presensi kelas untuk sesi ini?",
      () => {
        const updated = studentLogs.filter(log => log.id !== logId);
        saveStudentLogs(updated);
        dbService.deleteRecord("saved_attendance_logs", logId);
        triggerToast("Seluruh laporan presensi kelas berhasil dihapus.");
      }
    );
  };

  const handleDeleteReflection = (id: string, studentName: string) => {
    triggerConfirm(
      "Hapus Refleksi Murid",
      `Apakah Anda yakin ingin menghapus catatan refleksi dari murid ${studentName}?`,
      () => {
        const savedRefl = localStorage.getItem("simpati_student_reflections");
        const reflList: any[] = savedRefl ? JSON.parse(savedRefl) : [];
        const updated = reflList.filter(r => r.id !== id);
        localStorage.setItem("simpati_student_reflections", JSON.stringify(updated));
        setStudentReflections(updated);
        triggerToast(`Refleksi dari ${studentName} berhasil dihapus.`);
      }
    );
  };

  // --- TRIGGER TOAST ---
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- READ DATA FROM LOCALSTORAGE ONCE AND KEEP IN SYNC ---
  const loadSharedData = () => {
    // Perform automatic pruning for logs > 21 days (3 weeks)
    autoPruneAllStorageLogs();

    // 1. Teacher Attendance
    const savedTeachers = localStorage.getItem("simpati_teacher_attendance_logs");
    let loadedTeachers: TeacherAttendance[] = [];
    if (savedTeachers) {
      try { 
        loadedTeachers = JSON.parse(savedTeachers);
        if (Array.isArray(loadedTeachers)) {
          loadedTeachers = loadedTeachers.filter(t => 
            !t.teacherName?.includes("Alam") && 
            !t.teacherName?.includes("Budi Santoso") && 
            !t.teacherName?.includes("Budi Raharjo") &&
            !t.teacherName?.includes("Budi") &&
            !t.teacherName?.includes("Sri")
          );
        }
      } catch (e) { console.error(e); }
    } else {
      loadedTeachers = SEED_TEACHER_ATTENDANCE.filter(t =>
        !t.teacherName?.includes("Alam") &&
        !t.teacherName?.includes("Budi") &&
        !t.teacherName?.includes("Sri")
      );
    }
    loadedTeachers = pruneItemsOlderThan3Weeks(loadedTeachers, t => t.date).items;
    localStorage.setItem("simpati_teacher_attendance_logs", JSON.stringify(loadedTeachers));
    setTeacherLogs(loadedTeachers);

    // 2. Jurnal Mengajar
    const savedJournals = localStorage.getItem("simpati_jurnal_mengajar_logs");
    let loadedJournals: JurnalMengajar[] = [];
    if (savedJournals) {
      try { loadedJournals = JSON.parse(savedJournals); } catch (e) { console.error(e); }
    } else {
      loadedJournals = SEED_JURNAL_MENGAJAR;
      localStorage.setItem("simpati_jurnal_mengajar_logs", JSON.stringify(SEED_JURNAL_MENGAJAR));
    }
    loadedJournals = pruneItemsOlderThan3Weeks(loadedJournals, j => j.date).items;
    setJournals(loadedJournals);

    // 3. Student Attendance Logs
    const savedStudents = localStorage.getItem("simpati_saved_attendance_logs");
    let loadedStudents: SavedAttendanceLog[] = [];
    if (savedStudents) {
      try { loadedStudents = JSON.parse(savedStudents); } catch (e) { console.error(e); }
    } else {
      loadedStudents = SEED_STUDENT_ATTENDANCE;
      localStorage.setItem("simpati_saved_attendance_logs", JSON.stringify(SEED_STUDENT_ATTENDANCE));
    }
    loadedStudents = pruneItemsOlderThan3Weeks(loadedStudents, s => s.date).items;
    setStudentLogs(loadedStudents);

    // 3b. Student Self Attendance Logs
    const savedSelf = localStorage.getItem("simpati_student_self_attendance");
    let loadedSelf: any[] = [];
    if (savedSelf) {
      try { loadedSelf = JSON.parse(savedSelf); } catch (e) { console.error(e); }
    }
    loadedSelf = pruneItemsOlderThan3Weeks(loadedSelf, s => s.date || s.timestamp).items;
    setSelfAttendanceLogs(loadedSelf);

    // 4. BK Counseling Logs
    const savedBK = localStorage.getItem("simpati_bk_counseling_logs");
    let loadedBK: BKCounselingCase[] = [];
    if (savedBK) {
      try { loadedBK = JSON.parse(savedBK); } catch (e) { console.error(e); }
    } else {
      loadedBK = SEED_BK_COUNSELING;
      localStorage.setItem("simpati_bk_counseling_logs", JSON.stringify(SEED_BK_COUNSELING));
    }
    loadedBK = pruneItemsOlderThan3Weeks(loadedBK, b => b.date).items;
    setBkLogs(loadedBK);

    // 5. Ketua Kelas Reports
    const savedKetuaKelas = localStorage.getItem("sihadir_ketua_kelas_reports");
    let loadedKetuaKelas = [];
    if (savedKetuaKelas) {
      try { loadedKetuaKelas = JSON.parse(savedKetuaKelas); } catch (e) { console.error(e); }
    }
    loadedKetuaKelas = pruneItemsOlderThan3Weeks(loadedKetuaKelas, k => k.date || k.timestamp || k.created_at).items;
    setKetuaKelasReports(loadedKetuaKelas);

    // 6. Guru Piket Logs
    const savedPiket = localStorage.getItem("simpati_guru_piket_logs");
    let loadedPiket: GuruPiketLog[] = [];
    if (savedPiket) {
      try { loadedPiket = JSON.parse(savedPiket); } catch (e) { console.error(e); }
    } else {
      loadedPiket = SEED_GURU_PIKET;
      localStorage.setItem("simpati_guru_piket_logs", JSON.stringify(SEED_GURU_PIKET));
    }
    loadedPiket = pruneItemsOlderThan3Weeks(loadedPiket, p => p.date).items;
    setGuruPiketLogs(loadedPiket);

    // 7. Guru Wali Logs
    const savedWali = localStorage.getItem("simpati_guru_wali_logs");
    let loadedWali: GuruWaliLog[] = [];
    if (savedWali) {
      try { loadedWali = JSON.parse(savedWali); } catch (e) { console.error(e); }
    } else {
      loadedWali = SEED_GURU_WALI;
      localStorage.setItem("simpati_guru_wali_logs", JSON.stringify(SEED_GURU_WALI));
    }
    loadedWali = pruneItemsOlderThan3Weeks(loadedWali, w => w.date).items;
    setGuruWaliLogs(loadedWali);

    // 8. Student Reflections
    const savedRefl = localStorage.getItem("simpati_student_reflections");
    let loadedRefl = [];
    if (savedRefl) {
      try { loadedRefl = JSON.parse(savedRefl); } catch (e) { console.error(e); }
    }
    loadedRefl = pruneItemsOlderThan3Weeks(loadedRefl, r => r.date || r.timestamp).items;
    setStudentReflections(loadedRefl);
  };

  useEffect(() => {
    loadSharedData();

    // Live Realtime Subscriptions to Cloud Firestore
    const unsubSelf = dbService.subscribeRecords("student_self_attendance", (records) => {
      if (records && records.length > 0) {
        setSelfAttendanceLogs(records);
        setFirestoreSyncCount(prev => prev + 1);
      }
    });

    const unsubStudentLogs = dbService.subscribeRecords("saved_attendance_logs", (records) => {
      if (records && records.length > 0) {
        setStudentLogs(records);
        setFirestoreSyncCount(prev => prev + 1);
      }
    });

    const unsubTeacherLogs = dbService.subscribeRecords("teacher_attendance_logs", (records) => {
      if (records && records.length > 0) {
        setTeacherLogs(records);
        setFirestoreSyncCount(prev => prev + 1);
      }
    });

    const unsubKetua = dbService.subscribeRecords("ketua_kelas_reports", (records) => {
      if (records && records.length > 0) {
        setKetuaKelasReports(records);
        setFirestoreSyncCount(prev => prev + 1);
      }
    });

    const handleDataUpdated = () => {
      loadSharedData();
    };
    window.addEventListener("sihadir_data_updated", handleDataUpdated);

    // Set up local interval to pull fresh logs
    const interval = setInterval(() => {
      loadSharedData();
    }, 4000);

    return () => {
      if (unsubSelf) unsubSelf();
      if (unsubStudentLogs) unsubStudentLogs();
      if (unsubTeacherLogs) unsubTeacherLogs();
      if (unsubKetua) unsubKetua();
      window.removeEventListener("sihadir_data_updated", handleDataUpdated);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!isSuperAdmin && !isExecutiveAdmin && (activeTabPanel === "quick-submit" || activeTabPanel === "fonnte-config" || activeTabPanel === "firebase-config")) {
      setActiveTabPanel("rekap");
    }
  }, [activeTabPanel, isSuperAdmin, isExecutiveAdmin]);

  // Sync state helpers to LocalStorage
  const saveTeacherLogs = (newLogs: TeacherAttendance[]) => {
    setTeacherLogs(newLogs);
    localStorage.setItem("simpati_teacher_attendance_logs", JSON.stringify(newLogs));
  };

  const saveJournalLogs = (newLogs: JurnalMengajar[]) => {
    setJournals(newLogs);
    localStorage.setItem("simpati_jurnal_mengajar_logs", JSON.stringify(newLogs));
  };

  const saveStudentLogs = (newLogs: SavedAttendanceLog[]) => {
    setStudentLogs(newLogs);
    localStorage.setItem("simpati_saved_attendance_logs", JSON.stringify(newLogs));
  };

  const saveSelfAttendanceLogs = (newLogs: any[]) => {
    setSelfAttendanceLogs(newLogs);
    localStorage.setItem("simpati_student_self_attendance", JSON.stringify(newLogs));
  };

  const saveBkLogs = (newLogs: BKCounselingCase[]) => {
    setBkLogs(newLogs);
    localStorage.setItem("simpati_bk_counseling_logs", JSON.stringify(newLogs));
  };

  const saveGuruPiketLogs = (newLogs: GuruPiketLog[]) => {
    setGuruPiketLogs(newLogs);
    localStorage.setItem("simpati_guru_piket_logs", JSON.stringify(newLogs));
  };

  const saveGuruWaliLogs = (newLogs: GuruWaliLog[]) => {
    setGuruWaliLogs(newLogs);
    localStorage.setItem("simpati_guru_wali_logs", JSON.stringify(newLogs));
  };

  // --- AUTOMATED EVALUATION OF TODAY'S ALERTS & WARNINGS (SIHADIR) ---
  const getSihadirWarnings = () => {
    const list: string[] = [];
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Check teachers clocked-in status today
    const teachersToday = teacherLogs.filter(t => t.date === todayStr || !t.date);

    // Check teachers delay
    teachersToday.forEach(t => {
      if (t.clockIn) {
        const [h, m] = t.clockIn.split(":").map(Number);
        if (h > 7 || (h === 7 && m > 45)) {
          list.push(`⚠️ DISIPLIN GURU: ${t.teacherName} terdeteksi terlambat masuk kelas (Presensi masuk pukul ${t.clockIn})!`);
        }
      }
    });

    // Check student absences today
    let sickCount = 0;
    let permissionCount = 0;
    let absentCount = 0;

    studentLogs.forEach(log => {
      log.records.forEach(r => {
        if (r.status === "Sakit") sickCount++;
        else if (r.status === "Izin") permissionCount++;
        else if (r.status === "Alfa") absentCount++;
      });
    });

    if (absentCount > 0) {
      list.push(`⚠️ PANTAUAN MURID: Terdeteksi ${absentCount} murid tidak hadir tanpa keterangan (ALFA). Mohon perhatian Wali Kelas & BK!`);
    }

    if (sickCount > 1) {
      list.push(`ℹ️ LAPORAN KESEHATAN: Sebanyak ${sickCount} murid hari ini sakit. Wali kelas memantau kondisi murid tersebut.`);
    }

    // BK active cases
    const activeBk = bkLogs.filter(b => b.status === "Dalam Bimbingan");
    if (activeBk.length > 0) {
      list.push(`⚖️ TINDAKAN BK: Terdeteksi ${activeBk.length} murid sedang dalam bimbingan aktif hari ini.`);
    }

    return list;
  };

  const activeWarnings = getSihadirWarnings();

  // --- COMPILE REALTIME ACTIVITIES / CHRONOLOGICAL SIGNAL FEED ---
  const generateRealtimeSignals = () => {
    const signals: Array<{
      id: string;
      time: string;
      category: "guru" | "jurnal" | "murid" | "bk";
      title: string;
      description: string;
      meta: string;
      rawDraftText: string;
    }> = [];

    // Process Teacher Presences
    teacherLogs.forEach(t => {
      const timeStr = t.clockIn || "07:00";
      const isLate = t.clockIn ? (parseInt(t.clockIn.split(":")[0]) > 7 || (parseInt(t.clockIn.split(":")[0]) === 7 && parseInt(t.clockIn.split(":")[1]) > 30)) : false;
      
      signals.push({
        id: `sig-t-${t.id}`,
        time: timeStr,
        category: "guru",
        title: `Kehadiran Guru: ${t.teacherName}`,
        description: t.clockIn 
          ? `Absen Masuk berhasil terverifikasi GPS (${t.distanceMeter || 0}m). Status: ${isLate ? "Hadir Lambat" : "Hadir Tepat Waktu"}`
          : "Belum Melakukan Absensi Masuk",
        meta: `Status: ${t.status}`,
        rawDraftText: `⏱️ *PRESENSI HARIAN GURU*\nTanggal: ${t.date || new Date().toISOString().split("T")[0]}\nNama: ${t.teacherName}\nJam Masuk: ${t.clockIn || "Belum Absen"}\nStatus: ${t.status} ${isLate ? "(Terlambat)" : "(Tepat Waktu)"}\n`
      });
    });

    // Process Jurnal Mengajar
    journals.forEach(j => {
      signals.push({
        id: `sig-j-${j.id}`,
        time: "08:15",
        category: "jurnal",
        title: `Jurnal Pembelajaran: Kelas ${j.className}`,
        description: `Materi "${j.material}" diisi oleh Guru. Kehadiran: ${j.attendancePresent} murid hadir, ${j.attendanceAbsent?.length || 0} berhalangan.`,
        meta: j.subject,
        rawDraftText: `📝 *JURNAL BELAJAR GURU*\nTanggal: ${j.date}\nKelas: ${j.className}\nMata Pelajaran: ${j.subject}\nMateri: ${j.material}\nSiswa Hadir: ${j.attendancePresent}\nSiswa Absen: ${j.attendanceAbsent?.join(", ") || "-"}\nTindak Lanjut AI: ${j.followUp || "Stabil"}\n`
      });
    });

    // Process Student Absences from logs
    studentLogs.forEach((log, logIdx) => {
      log.records.forEach(r => {
        if (r.status !== "Hadir") {
          signals.push({
            id: `sig-s-${log.id}-${r.id}`,
            time: "07:45",
            category: "murid",
            title: `Pantauan Wali Kelas: ${r.name} (${r.status})`,
            description: `Murid dari kelas ${log.className} dilaporkan memiliki status ketidakhadiran: [${r.status}].`,
            meta: `Kelas ${log.className} • ${log.subject}`,
            rawDraftText: `📢 *LAPORAN WALI KELAS - KETIDAKHADIRAN MURID*\nTanggal: ${log.date}\nKelas: ${log.className}\nNama Murid: ${r.name}\nKeterangan: ${r.status}\n_Telah diverifikasi oleh Wali Kelas untuk rekapitulasi sekolah._\n`
          });
        }
      });
    });

    // Process BK Counseling
    bkLogs.forEach(b => {
      signals.push({
        id: `sig-bk-${b.id}`,
        time: "09:30",
        category: "bk",
        title: `Tindakan BK: Kasus ${b.studentName} (${b.className})`,
        description: `Kasus: "${b.caseType}". Tindakan diambil: "${b.actionTaken}".`,
        meta: `Status: ${b.status} • Dilaporkan oleh: ${b.reportedBy}`,
        rawDraftText: `⚖️ *LAPORAN PENANGANAN GURU BK*\nTanggal: ${b.date}\nSiswa: ${b.studentName} (${b.className})\nKasus: ${b.caseType}\nTindakan: ${b.actionTaken}\nStatus Kasus: *${b.status}*\n_Upaya penegakan disiplin preventif._\n`
      });
    });

    // Process Ketua Kelas Reports
    ketuaKelasReports.forEach(r => {
      signals.push({
        id: `sig-kk-${r.id}`,
        time: "10:00",
        category: "jurnal",
        title: `Laporan Jurnal Mandiri Ketua Kelas: ${r.className}`,
        description: `Dilaporkan oleh ${r.reportedBy}. Catatan Kelas: "${r.classNotes}". Hadir: ${r.countHadir}, Tidak Hadir: ${r.countAbsent}.`,
        meta: `Pelajaran Hari Ini • Fonnte WA Terintegrasi`,
        rawDraftText: r.reportText
      });
    });

    // Process Guru Piket
    guruPiketLogs.forEach(p => {
      signals.push({
        id: `sig-piket-${p.id}`,
        time: p.shift.includes("Pagi") ? "11:30" : "14:30",
        category: "guru",
        title: `Laporan Guru Piket: ${p.reporterName}`,
        description: `Kondisi Kelas: "${p.classroomCheck}". Kebersihan: ${p.hygieneCondition}. Keamanan: ${p.securityCondition}.`,
        meta: `Shift: ${p.shift}`,
        rawDraftText: `🏫 *LAPORAN GURU PIKET HARIAN*\nTanggal: ${p.date}\nPelapor: ${p.reporterName}\nShift: ${p.shift}\nKondisi Kelas: ${p.classroomCheck}\nKebersihan: ${p.hygieneCondition}\nKeamanan: ${p.securityCondition}\nCatatan Kejadian: ${p.incidentNotes}\n`
      });
    });

    // Process Guru Wali
    guruWaliLogs.forEach(w => {
      signals.push({
        id: `sig-wali-${w.id}`,
        time: "12:00",
        category: "murid",
        title: `Laporan Wali Kelas ${w.className}: ${w.waliName}`,
        description: `Pembinaan: "${w.developmentNotes}". Kasus Murid: "${w.specialCase}". Hubungan Ortu: "${w.parentCoordination}".`,
        meta: `Kelas: ${w.className}`,
        rawDraftText: `👤 *LAPORAN WALI KELAS / GURU WALI*\nTanggal: ${w.date}\nKelas: ${w.className}\nWali Kelas: ${w.waliName}\nPembinaan: ${w.developmentNotes}\nKasus Khusus: ${w.specialCase}\nKoordinasi Orang Tua: ${w.parentCoordination}\n`
      });
    });

    // Return sorted signals by time (simulated sort or reverse input)
    return signals;
  };

  const liveSignals = generateRealtimeSignals();

  // --- BUILD COMPILED FINAL REPORT DRAFT (REKAP HARIAN) ---
  const getCompiledReportText = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Guru Recap
    const totalTeachers = teacherLogs.length;
    const presentTeachers = teacherLogs.filter(t => t.clockIn).length;
    const lateTeachers = teacherLogs.filter(t => {
      if (!t.clockIn) return false;
      const [h, m] = t.clockIn.split(":").map(Number);
      return h > 7 || (h === 7 && m > 30);
    }).length;

    // Students Sickness/Absence Recap
    const sickStudents: string[] = [];
    const permissionStudents: string[] = [];
    const absentStudents: string[] = [];

    studentLogs.forEach(log => {
      log.records.forEach(r => {
        const item = `${r.name} (${log.className})`;
        if (r.status === "Sakit" && !sickStudents.includes(item)) sickStudents.push(item);
        if (r.status === "Izin" && !permissionStudents.includes(item)) permissionStudents.push(item);
        if (r.status === "Alfa" && !absentStudents.includes(item)) absentStudents.push(item);
      });
    });

    // BK Recap
    const activeBk = bkLogs.map(b => `${b.studentName} (${b.className}) - ${b.caseType} [Status: ${b.status}]`);

    // Jurnal Recap
    const activeJournals = journals.map(j => `• ${j.className}: ${j.material}`);

    // Ketua Kelas Recap
    const activeKK = ketuaKelasReports.map(r => `• Kelas ${r.className} (Oleh: ${r.reportedBy}): Notes: "${r.classNotes}" [Hadir: ${r.countHadir}, Tidak Hadir: ${r.countAbsent}]`);

    // Guru Piket Recap
    const activePiket = guruPiketLogs.map(p => `• Oleh ${p.reporterName} (${p.shift}): Kelas: "${p.classroomCheck}", Kebersihan: ${p.hygieneCondition}, Keamanan: ${p.securityCondition}, Catatan: "${p.incidentNotes}"`);

    // Guru Wali Recap
    const activeWali = guruWaliLogs.map(w => `• Kelas ${w.className} (Oleh: ${w.waliName}): Pembinaan: "${w.developmentNotes}", Kasus: "${w.specialCase}", Hubungan Ortu: "${w.parentCoordination}"`);

    return `📢 *LAPORAN REKAPITULASI HARIAN INTEGRASI - SMK NEGERI 2 KONAWE*\n` +
           `---------------------------------------------\n` +
           `📅 *Tanggal:* ${todayStr}\n` +
           `🏫 *Wilayah Monitoring:* SMK Negeri 2 Konawe\n\n` +
           `⏱️ *1. KEPATUHAN & PRESENSI GURU:*\n` +
           `  - Total Terdata: ${totalTeachers} Orang Guru\n` +
           `  - Sudah Absen Masuk: ${presentTeachers} Orang\n` +
           `  - Terlambat (>07.30): ${lateTeachers} Orang\n` +
           `  - Belum Absen: ${totalTeachers - presentTeachers} Orang\n\n` +
           `📝 *2. JURNAL MENGAJAR HARIAN GURU:*\n` +
           `${activeJournals.length > 0 ? activeJournals.join("\n") : "  - Belum ada jurnal pembelajaran diunggah hari ini."}\n\n` +
           `📢 *3. LAPORAN MANDIRI KETUA KELAS (REAL-TIME):*\n` +
           `${activeKK.length > 0 ? activeKK.join("\n") : "  - Belum ada laporan jurnal ketua kelas di-submit hari ini."}\n\n` +
           `🏫 *4. LAPORAN PENGAWASAN GURU PIKET:*\n` +
           `${activePiket.length > 0 ? activePiket.join("\n") : "  - Belum ada laporan guru piket diunggah hari ini."}\n\n` +
           `👤 *5. LAPORAN PEMBINAAN WALI KELAS (GURU WALI):*\n` +
           `${activeWali.length > 0 ? activeWali.join("\n") : "  - Belum ada laporan pembinaan kelas diunggah hari ini."}\n\n` +
           `📢 *6. LAPORAN WALI KELAS (KETIDAKHADIRAN MURID):*\n` +
           `  - 🤒 *Murid Sakit:* ${sickStudents.length > 0 ? sickStudents.join(", ") : "Tidak ada"}\n` +
           `  - ✉️ *Murid Izin:* ${permissionStudents.length > 0 ? permissionStudents.join(", ") : "Tidak ada"}\n` +
           `  - ❌ *Murid Alfa:* ${absentStudents.length > 0 ? absentStudents.join(", ") : "Tidak ada"}\n\n` +
           `⚖️ *7. LAPORAN PEMANTAUAN & TINDAKAN GURU BK:*\n` +
           `${activeBk.length > 0 ? activeBk.map(item => `  • ${item}`).join("\n") : "  - Kondisi kondusif, belum ada rujukan bimbingan hari ini."}\n\n` +
           `📊 *8. REKAPITULASI KEPATUHAN & DISIPLIN SEKOLAH:*\n` +
           `${activeWarnings.length > 0 ? activeWarnings.map(w => `• ${w}`).join("\n") : "• Disiplin Prima, tidak ada pelanggaran disiplin terdeteksi hari ini."}\n\n` +
           `---------------------------------------------\n` +
           `_Pusat Penyiaran Laporan Otomatis Terintegrasi SIHADIR SMK Negeri 2 Konawe._`;
  };

  const triggerAutoWA = async (messageText: string) => {
    const key = localStorage.getItem("simpati_fonnte_api_key") || "";
    const target = localStorage.getItem("simpati_fonnte_target") || "";
    if (!key || !target) {
      console.log("Fonnte API Key or Target is empty, skipping auto background WhatsApp broadcast.");
      return;
    }
    
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: target,
          message: messageText,
          customToken: key
        })
      });
      const resData = await response.json();
      if (resData.status === true || resData.status === "true" || (resData.hasOwnProperty("status") && resData.status !== false)) {
        console.log("Auto background WhatsApp broadcast successful:", resData);
        triggerToast("🚀 Laporan otomatis berhasil disiarkan ke Grup WhatsApp via Fonnte!");
      } else {
        console.warn("Auto background WhatsApp broadcast returned failure status:", resData);
      }
    } catch (e) {
      console.error("Auto background WhatsApp broadcast connection failed:", e);
    }
  };

  // --- SUBMIT QUICK ADDITIONS ---
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const todayStr = new Date().toISOString().split("T")[0];

    if (formType === "sakit-izin") {
      if (!newStudentName.trim()) {
        triggerToast("Harap isi nama murid!");
        return;
      }

      // Add student record to student logs
      const updatedLogs = [...studentLogs];
      const matchLog = updatedLogs.find(l => l.className === newClassName && l.date === todayStr);

      const newRecord: StudentAttendanceRecord = {
        id: "ST-Q-" + Date.now(),
        name: newStudentName,
        status: newStatus
      };

      if (matchLog) {
        // filter out existing record of the same student if any to prevent duplicate
        matchLog.records = matchLog.records.filter(r => r.name !== newStudentName);
        matchLog.records.push(newRecord);
      } else {
        // create new attendance log for the class
        updatedLogs.push({
          id: "S-ATT-Q-" + Date.now(),
          date: todayStr,
          className: newClassName,
          subject: "Teknik Kendaraan Ringan (Otomotif)",
          records: [newRecord]
        });
      }

      saveStudentLogs(updatedLogs);
      triggerToast(`Berhasil menambahkan laporan ketidakhadiran murid: ${newStudentName} (${newStatus})`);

      // Trigger SIHADIR AI notification message in bot
      setChatMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: `📢 Laporan Wali Kelas Diterima: Murid bernama *${newStudentName}* (${newClassName}) dicatat *${newStatus}* harian. Keterangan: "${newReason}". Laporan WA otomatis dan analisis rekap harian kini telah disinkronkan.`,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      // Automatically broadcast via Fonnte WA in background
      const waMsg = `*📢 SIHADIR AUTOMATED BROADCAST*\n\nLaporan baru ketidakhadiran murid diinput oleh Wali Kelas:\nNama: *${newStudentName}*\nKelas: *${newClassName}*\nStatus Kehadiran: *${newStatus}*\nAlasan/Keterangan: *${newReason || "Tidak ada keterangan"}*\nTanggal: *${todayStr}*\n\n_Status laporan telah diperbarui di sistem. Terima kasih._`;
      triggerAutoWA(waMsg);

      // Reset
      setNewStudentName("");
    } else if (formType === "bk-case") {
      // BK Counseling Case
      if (!newBkStudent.trim()) {
        triggerToast("Harap isi nama murid rujukan!");
        return;
      }

      const newCase: BKCounselingCase = {
        id: "BK-Q-" + Date.now(),
        date: todayStr,
        studentName: newBkStudent,
        className: newBkClass,
        caseType: newBkCase,
        actionTaken: newBkAction,
        status: newBkStatus,
        reportedBy: "Guru / Staf Pelapor"
      };

      const updatedBk = [newCase, ...bkLogs];
      saveBkLogs(updatedBk);
      triggerToast(`Berhasil menyimpan data tindakan Guru BK untuk murid: ${newBkStudent}`);

      // Trigger SIHADIR AI notification
      setChatMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: `⚖️ Laporan Tindakan Guru BK Baru: Murid *${newBkStudent}* (${newBkClass}) sedang ditindak dengan metode *${newBkAction}* untuk kasus *${newBkCase}*. Status penanganan: [${newBkStatus}].`,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      // Automatically broadcast via Fonnte WA in background
      const waMsg = `*📢 SIHADIR BK REPORT BROADCAST*\n\nLaporan kasus rujukan konseling murid baru:\nNama Murid: *${newBkStudent}*\nKelas: *${newBkClass}*\nKasus/Pelanggaran: *${newBkCase}*\nTindakan Guru BK: *${newBkAction}*\nStatus Kasus: *${newBkStatus}*\nPelapor: *Guru / Staf Pelapor*\nTanggal: *${todayStr}*\n\n_Laporan ini tersinkronisasi otomatis dengan dasbor bimbingan konseling SIHADIR._`;
      triggerAutoWA(waMsg);

      // Reset
      setNewBkStudent("");
      setNewBkCase("Sering terlambat masuk jam pertama");
      setNewBkAction("Konseling Individu & pembinaan disiplin");
    } else if (formType === "guru-piket") {
      const newPiket: GuruPiketLog = {
        id: "PKT-Q-" + Date.now(),
        date: todayStr,
        reporterName: piketReporterName,
        shift: piketShift,
        classroomCheck: piketClassroomCheck,
        hygieneCondition: piketHygiene,
        securityCondition: piketSecurity,
        incidentNotes: piketIncidents
      };

      const updatedPiket = [newPiket, ...guruPiketLogs];
      saveGuruPiketLogs(updatedPiket);
      triggerToast(`Berhasil menyimpan laporan Guru Piket: ${piketReporterName}`);

      // Trigger SIHADIR AI notification
      setChatMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: `🏫 Laporan Guru Piket Baru: Dilaporkan oleh *${piketReporterName}* (${piketShift}). Situasi Kelas: "${piketClassroomCheck}", Kebersihan: [${piketHygiene}], Keamanan: [${piketSecurity}]. Catatan Kejadian: "${piketIncidents}".`,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      // Automatically broadcast via Fonnte WA in background
      const waMsg = `*🏫 SIHADIR GURU PIKET REPORT BROADCAST*\n\nLaporan baru pengawasan piket harian sekolah:\nPelapor: *${piketReporterName}*\nShift Piket: *${piketShift}*\nKondisi Kelas: *${piketClassroomCheck}*\nKebersihan Lingkungan: *${piketHygiene}*\nKetertiban Keamanan: *${piketSecurity}*\nCatatan Kejadian: *${piketIncidents}*\nTanggal: *${todayStr}*\n\n_Laporan ini terintegrasi langsung dengan Rekap Utama TU, Kepala Sekolah, dan Admin._`;
      triggerAutoWA(waMsg);

      // Reset
      setClassroomCheck("Semua kelas terpantau tertib melaksanakan pembelajaran sesuai jadwal.");
      setPiketIncidents("Nihil kejadian menonjol.");
    } else if (formType === "guru-wali") {
      const newWali: GuruWaliLog = {
        id: "GW-Q-" + Date.now(),
        date: todayStr,
        className: waliClassName,
        waliName: waliName,
        developmentNotes: waliDevNotes,
        specialCase: waliSpecialCase,
        parentCoordination: waliParentCoordination
      };

      const updatedWali = [newWali, ...guruWaliLogs];
      saveGuruWaliLogs(updatedWali);
      triggerToast(`Berhasil menyimpan laporan Wali Kelas: ${waliClassName}`);

      // Trigger SIHADIR AI notification
      setChatMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: `👤 Laporan Wali Kelas Baru: Kelas *${waliClassName}* oleh Wali *${waliName}*. Pembinaan: "${waliDevNotes}". Kasus Murid: "${waliSpecialCase}". Hubungan Ortu: "${waliParentCoordination}".`,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      // Automatically broadcast via Fonnte WA in background
      const waMsg = `*👤 SIHADIR WALI KELAS REPORT BROADCAST*\n\nLaporan pembinaan wali kelas harian:\nWali Kelas: *${waliName}*\nKelas Bimbingan: *${waliClassName}*\nCatatan Pembinaan: *${waliDevNotes}*\nKasus Khusus: *${waliSpecialCase}*\nKoordinasi Orang Tua: *${waliParentCoordination}*\nTanggal: *${todayStr}*\n\n_Laporan ini terintegrasi langsung dengan Rekap Utama TU, Kepala Sekolah, dan Admin._`;
      triggerAutoWA(waMsg);

      // Reset
      setWaliDevNotes("Murid kelas diberikan pembinaan berkala mengenai pemeliharaan wearpack.");
      setWaliSpecialCase("Semua murid mengikuti KBM dengan baik.");
      setWaliParentCoordination("Tidak ada kasus yang mendesak.");
    }

    setActiveTabPanel("rekap");
  };

  // --- DELETE LOGS ---
  const handleDeleteBKLog = (id: string) => {
    triggerConfirm(
      "Hapus Data Pemantauan BK",
      "Apakah Anda yakin ingin menghapus data pemantauan bimbingan konseling (BK) ini?",
      () => {
        const filtered = bkLogs.filter(b => b.id !== id);
        saveBkLogs(filtered);
        triggerToast("Catatan bimbingan BK berhasil dihapus.");
      }
    );
  };

  const handleClearAllReports = () => {
    triggerConfirm(
      "Setel Ulang Semua Data",
      "Apakah Anda yakin ingin menyetel ulang rekap laporan harian dan menghapus data kustom Anda? Data bawaan akan dipulihkan.",
      () => {
        localStorage.removeItem("simpati_teacher_attendance_logs");
        localStorage.removeItem("simpati_jurnal_mengajar_logs");
        localStorage.removeItem("simpati_saved_attendance_logs");
        localStorage.removeItem("simpati_bk_counseling_logs");
        localStorage.removeItem("simpati_guru_piket_logs");
        localStorage.removeItem("simpati_guru_wali_logs");
        loadSharedData();
        triggerToast("Seluruh database lokal berhasil disetel ulang ke kondisi bersih!");
      }
    );
  };

  // --- FIREBASE HELPER HANDLERS ---
  const handleSaveFirebaseConfig = () => {
    if (!firebaseApiKey || !firebaseProjectId) {
      alert("Harap isi setidaknya API Key dan Project ID untuk menghubungkan ke Firebase.");
      return;
    }
    const configObj = {
      apiKey: firebaseApiKey.trim(),
      projectId: firebaseProjectId.trim(),
      authDomain: firebaseAuthDomain.trim(),
      storageBucket: firebaseStorageBucket.trim(),
      messagingSenderId: firebaseMessagingSenderId.trim(),
      appId: firebaseAppId.trim()
    };
    localStorage.setItem("simpati_firebase_custom_config", JSON.stringify(configObj));
    triggerToast("Konfigurasi Firebase berhasil disimpan! Memuat ulang sistem...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleClearFirebaseConfig = () => {
    triggerConfirm(
      "Putuskan Koneksi Firebase",
      "Apakah Anda yakin ingin memutuskan koneksi Firebase dan kembali menggunakan database offline lokal (LocalStorage)?",
      () => {
        localStorage.removeItem("simpati_firebase_custom_config");
        triggerToast("Koneksi Firebase diputuskan. Mengembalikan ke database lokal...");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    );
  };

  const handleMigrateAllData = async () => {
    if (!isFirebaseConfigured()) {
      alert("Harap konfigurasikan dan hubungkan Firebase terlebih dahulu sebelum melakukan migrasi.");
      return;
    }
    setIsSyncingFirebase(true);
    triggerToast("Memulai sinkronisasi seluruh data lokal ke Firebase Cloud...");
    
    try {
      const collections = [
        "teacher_attendance_logs",
        "jurnal_mengajar_logs",
        "saved_attendance_logs",
        "bk_counseling_logs",
        "student_self_attendance",
        "student_reflections"
      ];

      let successMsg = "";
      for (const col of collections) {
        const res = await dbService.uploadLocalToFirebase(col);
        if (res.status) {
          successMsg += `\n- ${col}: Berhasil`;
        } else {
          successMsg += `\n- ${col}: Gagal (${res.message})`;
        }
      }

      alert("Hasil Migrasi Database ke Firebase Cloud:\n" + successMsg + "\n\nSeluruh data lokal Anda sekarang telah aman disalin ke cloud!");
      triggerToast("Migrasi database ke Firebase Cloud selesai!");
    } catch (e: any) {
      alert("Terjadi kesalahan migrasi: " + e.message);
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  const getCompiledTeacherReportText = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const total = teacherLogs.length;
    const hadir = teacherLogs.filter(t => t.status === "Hadir").length;
    const nowDay = new Date().getDay();
    const isFriday = nowDay === 5;
    const isMonday = nowDay === 1;
    const jamMasukStr = isFriday ? "07:20" : "07:15";
    const jamIstirahatStr = isFriday ? "10:00 - 10:10" : (isMonday ? "09:55 - 10:10" : "10:15 - 10:30");
    const jamPulangStr = isFriday ? "11:30" : "13:30";

    const terlambat = teacherLogs.filter(t => t.status === "Hadir" && t.clockIn && t.clockIn > jamMasukStr).length;
    const tepatWaktu = hadir - terlambat;
    const sakitIzin = teacherLogs.filter(t => t.status === "Sakit" || t.status === "Izin");
    const alpa = teacherLogs.filter(t => t.status === "Tanpa Keterangan" || !t.status || (t.status !== "Hadir" && t.status !== "Sakit" && t.status !== "Izin" && t.status !== "Ditolak"));
    
    let text = `📢 *LAPORAN REKAP KEHADIRAN GURU MAPEL - SMK NEGERI 2 KONAWE*\n` +
               `---------------------------------------------\n` +
               `📅 *Tanggal:* ${todayStr}\n` +
               `⏰ *Jam Masuk:* ${jamMasukStr} WITA | ☕ *Istirahat:* ${jamIstirahatStr} WITA | 🏁 *Pulang:* ${jamPulangStr} WITA\n\n` +
               `⏱️ *RINGKASAN PRESENSI GURU:*\n` +
               `  - Total Guru Mapel: ${total} Orang\n` +
               `  - Hadir (Tepat Waktu <= ${jamMasukStr}): ${tepatWaktu} Orang\n` +
               `  - Hadir (Terlambat > ${jamMasukStr}): ${terlambat} Orang\n` +
               `  - Sakit/Izin: ${sakitIzin.length} Orang\n` +
               `  - Tanpa Keterangan (Alpa): ${alpa.length} Orang\n\n` +
               `👤 *DETAIL KETERANGAN JADWAL GURU HARI INI:*\n`;

    teacherLogs.forEach(t => {
      let detail = `  • *${t.teacherName}*: `;
      if (t.status === "Hadir") {
        detail += `Hadir (Masuk: ${t.clockIn || "-"}, Pulang: ${t.clockOut || "Belum Pulang"})`;
        if (t.clockIn && t.clockIn > jamMasukStr) {
          detail += ` ⚠️ *TERLAMBAT*`;
        } else {
          detail += ` ✅ *TEPAT WAKTU*`;
        }
      } else {
        detail += `${t.status || "Tanpa Keterangan"}`;
      }
      text += detail + `\n`;
    });

    text += `\n---------------------------------------------\n` +
            `_Dilaporkan oleh: Admin Tata Usaha SMK Negeri 2 Konawe_`;
    return text;
  };

  const getCompiledMasukPulangReportText = () => {
    const dateStr = mpDateFilter || new Date().toISOString().split("T")[0];
    const isTuPersonnel = (name: string) => {
      const n = (name || "").toLowerCase();
      return n.includes("admin tu") || n.includes("staf tu") || n.includes("tata usaha") || n.includes("sakti") || n.includes("adelia") || n.includes("saktinani") || n.includes("pusparini");
    };

    const filteredTs = teacherLogs.filter(t => {
      const matchesDate = !dateStr || t.date === dateStr;
      const matchesSearch = !mpSearchQuery || t.teacherName.toLowerCase().includes(mpSearchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });

    const tuLogs = filteredTs.filter(t => isTuPersonnel(t.teacherName));
    const guruOnlyLogs = filteredTs.filter(t => !isTuPersonnel(t.teacherName));

    const filteredSs = selfAttendanceLogs.filter(s => {
      const matchesDate = !dateStr || s.date === dateStr;
      const matchesSearch = !mpSearchQuery || s.studentName.toLowerCase().includes(mpSearchQuery.toLowerCase());
      const matchesClass = mpClassFilter === "Semua Kelas" || s.className === mpClassFilter;
      return matchesDate && matchesSearch && matchesClass;
    });

    const tuHadir = tuLogs.filter(t => t.status === "Hadir" && t.clockIn).length;
    const tuPulang = tuLogs.filter(t => t.status === "Hadir" && t.clockOut).length;

    const tHadir = guruOnlyLogs.filter(t => t.status === "Hadir" && t.clockIn).length;
    const tPulang = guruOnlyLogs.filter(t => t.status === "Hadir" && t.clockOut).length;
    
    const sHadir = filteredSs.filter(s => s.status === "Hadir" && s.clockIn).length;
    const sPulang = filteredSs.filter(s => s.status === "Hadir" && s.clockOut).length;

    let text = `📢 *REKAP PRESENSI MASUK & PULANG TU, GURU & MURID - SMK NEGERI 2 KONAWE*\n` +
               `---------------------------------------------\n` +
               `📅 *Tanggal:* ${dateStr}\n\n` +
               `💼 *1. RINGKASAN PRESENSI ADMIN & STAF TU:*\n` +
               `  - Admin/Staf TU Masuk (Clock-In): ${tuHadir} Personel\n` +
               `  - Admin/Staf TU Pulang (Clock-Out): ${tuPulang} Personel\n\n` +
               `⏱️ *2. RINGKASAN PRESENSI GURU MAPEL:*\n` +
               `  - Guru Masuk (Clock-In): ${tHadir} Orang\n` +
               `  - Guru Pulang (Clock-Out): ${tPulang} Orang\n\n` +
               `🎓 *3. RINGKASAN PRESENSI MURID MANDIRI:*\n` +
               `  - Murid Masuk (Clock-In): ${sHadir} Orang\n` +
               `  - Murid Pulang (Clock-Out): ${sPulang} Orang\n\n` +
               `📌 *DETAIL PRESENSI ADMIN TU & STAF TU:*\n`;

    if (tuLogs.length === 0) {
      text += `  (Belum ada data presensi Admin/Staf TU)\n`;
    } else {
      tuLogs.forEach(t => {
        text += `  • *${t.teacherName}*: Masuk: ${t.clockIn || "-"} | Pulang: ${t.clockOut || "Belum Pulang"}\n`;
      });
    }

    text += `\n👤 *DETAIL PRESENSI GURU MAPEL:*\n`;
    if (guruOnlyLogs.length === 0) {
      text += `  (Tidak ada data presensi guru)\n`;
    } else {
      guruOnlyLogs.forEach(t => {
        text += `  • *${t.teacherName}*: Masuk: ${t.clockIn || "-"} | Pulang: ${t.clockOut || "Belum Pulang"}\n`;
      });
    }

    text += `\n👤 *DETAIL PRESENSI MURID MANDIRI:*\n`;
    if (filteredSs.length === 0) {
      text += `  (Tidak ada data presensi murid)\n`;
    } else {
      filteredSs.forEach(s => {
        text += `  • *${s.studentName}* (${s.className}): Masuk: ${s.clockIn || "-"} | Pulang: ${s.clockOut || "Belum Pulang"}\n`;
      });
    }

    text += `\n---------------------------------------------\n` +
            `_Dilaporkan oleh: Admin Tata Usaha SMK Negeri 2 Konawe_`;
    return text;
  };

  const getCompiledTuReportText = () => {
    const dateStr = tuDateFilter || new Date().toISOString().split("T")[0];
    const filteredTu = teacherLogs.filter(t => {
      const isTu = isTuPersonnelName(t.teacherName);
      const matchesDate = !dateStr || t.date === dateStr;
      const matchesSearch = !tuSearchQuery || t.teacherName.toLowerCase().includes(tuSearchQuery.toLowerCase());
      return isTu && matchesDate && matchesSearch;
    });

    const tuHadir = filteredTu.filter(t => t.status === "Hadir" && t.clockIn).length;
    const tuPulang = filteredTu.filter(t => t.status === "Hadir" && t.clockOut).length;
    const tuTerlambat = filteredTu.filter(t => t.clockIn && t.clockIn > "07:30").length;

    let text = `📢 *REKAP PRESENSI STAF & ADMIN TATA USAHA - SMK NEGERI 2 KONAWE*\n` +
               `---------------------------------------------\n` +
               `📅 *Tanggal:* ${dateStr}\n` +
               `🏢 *Unit Kerja:* Subbagian Tata Usaha & Administrasi Sekolah\n\n` +
               `📊 *RINGKASAN KEHADIRAN PERSONEL TU:*\n` +
               `  • Total Logged: ${filteredTu.length} Personel\n` +
               `  • Clock-In (Masuk): ${tuHadir} Personel\n` +
               `  • Clock-Out (Pulang): ${tuPulang} Personel\n` +
               `  • Terlambat (Masuk > 07.30): ${tuTerlambat} Personel\n\n` +
               `📋 *RINCIAN PRESENSI HARIAN PERSONEL TU:*\n`;

    if (filteredTu.length === 0) {
      text += `  (Belum ada data presensi Admin/Staf TU tercatat pada tanggal ${dateStr})\n`;
    } else {
      filteredTu.forEach(t => {
        const isLate = t.clockIn && t.clockIn > "07:30";
        const ket = isLate ? "(Terlambat)" : "(Tepat Waktu)";
        text += `  • *${t.teacherName}*\n` +
                `    - Status: ${t.status}\n` +
                `    - Jam Masuk: ${t.clockIn || "-"} ${t.clockIn ? ket : ""}\n` +
                `    - Jam Pulang: ${t.clockOut || "Belum Pulang"}\n`;
        if (t.distanceMeter) {
          text += `    - GPS Radius: ${Math.round(t.distanceMeter)}m dari Sekolah (SAH)\n`;
        }
      });
    }

    text += `\n---------------------------------------------\n` +
            `_Dilaporkan oleh: Subbagian Tata Usaha SMK Negeri 2 Konawe_`;
    return text;
  };

  const getCompiledPiketReportText = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const activePiket = guruPiketLogs.map((p, idx) => 
      `${idx + 1}. *${p.reporterName}* (${p.shift})\n` +
      `   • Pemantauan KBM/Kelas: "${p.classroomCheck}"\n` +
      `   • Kebersihan: ${p.hygieneCondition} | Keamanan: ${p.securityCondition}\n` +
      `   • Catatan Kejadian: "${p.incidentNotes}"\n` +
      `   • Status Otorisasi: ${p.status || "Terverifikasi Waka/Admin Utama"}`
    );

    return `*🏫 SIHADIR SMK NEGERI 2 KONAWE - REKAP LAPORAN GURU PIKET RESMI*\n\n` +
      `Tanggal Laporan: *${todayStr}*\n` +
      `Diotorisasi Oleh: *Administrator Utama / Kepala Sekolah / Waka Kurikulum / Admin TU*\n\n` +
      `*KONSOLIDASI CATATAN PETUGAS PIKET HARIAN:*\n\n` +
      (activePiket.length > 0 ? activePiket.join("\n\n") : "  - Belum ada entri laporan guru piket hari ini.") +
      `\n\n_Laporan resmi dikirim secara otomatis via SIHADIR SMK Negeri 2 Konawe._`;
  };

  // --- WHATSAPP INTEGRATION CENTER PREVIEW LOGIC ---
  const handleOpenWAShare = (signalId: string) => {
    setSelectedSignalId(signalId);
    let text = "";
    if (signalId === "rekap-harian") {
      text = getCompiledReportText();
    } else if (signalId === "rekap-guru") {
      text = getCompiledTeacherReportText();
    } else if (signalId === "rekap-tu") {
      text = getCompiledTuReportText();
    } else if (signalId === "rekap-masuk-pulang") {
      text = getCompiledMasukPulangReportText();
    } else if (signalId === "rekap-piket") {
      text = getCompiledPiketReportText();
    } else {
      const matched = liveSignals.find(s => s.id === signalId);
      if (matched) {
        text = matched.rawDraftText;
      } else {
        text = getCompiledReportText();
      }
    }
    setWaMessageDraft(text);
    setShowWASimulator(true);
  };

  const handleSendToRealWA = () => {
    const encoded = encodeURIComponent(waMessageDraft);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    triggerToast("Mengalihkan ke WhatsApp Web / Aplikasi...");
    setShowWASimulator(false);
  };

  const handleSendToFonnteWA = async () => {
    setIsSendingWA(true);
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: fonnteTarget,
          message: waMessageDraft,
          customToken: fonnteApiKey
        })
      });

      const resData = await response.json();
      // Fonnte can return status: true (boolean or string) or a success response object
      if (resData.status === true || resData.status === "true" || (resData.hasOwnProperty("status") && resData.status !== false)) {
        triggerToast("🚀 Sukses! Laporan disiarkan via Fonnte Gateway.");
        
        setChatMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: `📢 *SIHADIR BROADCAST BERHASIL!*\n\nLaporan disiplin harian berikut telah berhasil disiarkan secara otomatis ke WhatsApp Group melalui Fonnte WhatsApp Gateway:\n\n*Target Penerima:* ${fonnteTarget || "Grup Default (env)"}\n\n*Isi Laporan:*\n${waMessageDraft}`,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          }
        ]);
        
        setShowWASimulator(false);
      } else {
        const errorMsg = resData.reason || resData.message || "Gagal mengirim pesan via Fonnte.";
        alert(`Gagal mengirim via Fonnte: ${errorMsg}\n\nSistem akan mengalihkan Anda ke WhatsApp Web manual.`);
        handleSendToRealWA();
      }
    } catch (e: any) {
      console.error(e);
      alert(`Koneksi error: ${e.message || "Gagal menghubungi API proxy."}\n\nSistem akan mengalihkan Anda ke WhatsApp Web manual.`);
      handleSendToRealWA();
    } finally {
      setIsSendingWA(false);
    }
  };

  // --- GEMINI POWERED BOT CHAT ACTION ---
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }]);
    setIsBotLoading(true);

    try {
      // Build context of today's reports for AI
      const activeJournals = journals.map(j => `• Kelas ${j.className} (${j.subject}): Materi "${j.material}"`).join("\n");
      const activeTeachers = teacherLogs.map(t => `• ${t.teacherName} (Status: ${t.status}, Clock In: ${t.clockIn || "Belum"})`).join("\n");
      
      const sickStudents: string[] = [];
      const permissionStudents: string[] = [];
      const absentStudents: string[] = [];

      studentLogs.forEach(log => {
        log.records.forEach(r => {
          const item = `${r.name} (Kelas ${log.className})`;
          if (r.status === "Sakit") sickStudents.push(item);
          else if (r.status === "Izin") permissionStudents.push(item);
          else if (r.status === "Alfa") absentStudents.push(item);
        });
      });

      const activeBkStr = bkLogs.map(b => `• ${b.studentName} (${b.className}): ${b.caseType} -> Tindakan: ${b.actionTaken} (${b.status})`).join("\n");

      const promptText = `
Anda adalah "SIHADIR AI", asisten AI monitor disiplin, rekapitulasi sekolah, dan penegak ketertiban terintegrasi beralmamater SMK Negeri 2 Konawe.
Gunakan data riil sekolah hari ini untuk menjawab pertanyaan guru dengan bahasa Indonesia yang ramah, sopan, mendidik, ringkas, dan profesional:

DATA REAL-TIME SEKOLAH HARI INI:
---------------------------------------------
1. DATA PRESENSI GURU:
${activeTeachers || "Tidak ada guru absen harian tercatat."}

2. JURNAL MENGAJAR GURU:
${activeJournals || "Belum ada guru mengunggah jurnal mengajar hari ini."}

3. STATUS KETIDAKHADIRAN MURID (WALI KELAS):
- Murid Sakit (Sakit): ${sickStudents.join(", ") || "Nihil"}
- Murid Izin (Izin): ${permissionStudents.join(", ") || "Nihil"}
- Murid Alfa (Alfa): ${absentStudents.join(", ") || "Nihil"}

4. STATUS BIMBINGAN MURID & GURU BK:
${activeBkStr || "Nihil, semua murid kondusif."}

5. AKTIF PERINGATAN (WARNING ALERTS):
${activeWarnings.length > 0 ? activeWarnings.join("\n") : "Semua terkendali / Disiplin Prima."}

Pertanyaan Guru: "${userMsg}"
      `;

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: "Anda adalah SIHADIR AI, asisten AI sekolah SMK Negeri 2 Konawe yang cerdas, sopan, terhormat, dan mendidik. Jawab pertanyaan guru dengan akurat bersumber dari data realtime yang diberikan. Berikan rekomendasi bimbingan, apresiasi disiplin guru, atau ingatkan murid sakit/alfa dengan format poin-poin yang elegan."
        })
      });

      const data = await response.json();
      if (data.text) {
        setChatMessages(prev => [...prev, { sender: "bot", text: data.text, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }]);
      } else {
        setChatMessages(prev => [...prev, { sender: "bot", text: "Maaf, koneksi AI mengalami hambatan singkat. Namun data laporan Anda tersinkronisasi aman di LocalStorage.", time: "Realtime" }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { sender: "bot", text: "Maaf, sistem AI sedang memproses pemutakhiran data laporan lainnya. Silakan coba kembali sesaat lagi.", time: "Realtime" }]);
    } finally {
      setIsBotLoading(false);
    }
  };

  // --- AUTO RE-CALCULATE ACCUMULATIONS ---
  const getSakitCount = () => {
    let count = 0;
    studentLogs.forEach(log => {
      log.records.forEach(r => {
        if (r.status === "Sakit") count++;
      });
    });
    return count;
  };

  const getIzinCount = () => {
    let count = 0;
    studentLogs.forEach(log => {
      log.records.forEach(r => {
        if (r.status === "Izin") count++;
      });
    });
    return count;
  };

  const getAlfaCount = () => {
    let count = 0;
    studentLogs.forEach(log => {
      log.records.forEach(r => {
        if (r.status === "Alfa") count++;
      });
    });
    return count;
  };

  return (
    <div className="space-y-6" id="rekap-laporan-workspace">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-slate-900 border border-indigo-500 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50 flex items-center gap-2 font-medium"
          >
            <Check className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner - Sleek Minimalist & High Contrast */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-indigo-600 text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded-full tracking-wider">
              SISTEM REKAPITULASI SIHADIR
            </span>
            <span className="bg-emerald-600 text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded-full tracking-wider">
              SMK NEGERI 2 KONAWE
            </span>
            <span className="bg-slate-800 text-indigo-300 font-extrabold text-[9px] uppercase px-2.5 py-1 rounded-full tracking-wider border border-slate-700">
              REAL-TIME INTEGRASI
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-indigo-400 shrink-0" />
            <span>Pusat Integrasi & Rekap Laporan Sekolah</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Sistem pengumpulan rekap harian otomatis dari data presensi guru, jurnal mengajar, ketidakhadiran murid (wali kelas), serta penindakan rujukan oleh Guru BK.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsShareLinkModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-400/30"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Bagikan Link Absen Murid</span>
          </button>

          <button
            onClick={() => {
              loadSharedData();
              triggerToast("Database Cloud Firestore & Local tersinkronisasi!");
            }}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
            <span>Refresh Sinkronisasi</span>
          </button>

          <button
            onClick={handleClearAllReports}
            className="bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-rose-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset database LocalStorage"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Live Warning Alerts Panel - SIHADIR AI Alerts */}
      {activeWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <span>PUSAT DETEKSI KEPATUHAN & DISIPLIN (SIHADIR)</span>
                <span className="bg-amber-600 text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse">
                  {activeWarnings.length} ALERTS
                </span>
              </h4>
              <p className="text-[10px] text-amber-700">
                Peringatan kedisiplinan guru & absensi murid harian yang terdeteksi secara otomatis dari formulir yang di-submit:
              </p>

              <div className="mt-3 space-y-1.5">
                {activeWarnings.map((warning, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-xl p-2.5 border-l-4 border-amber-500 shadow-sm text-xs font-medium text-slate-800 flex items-start gap-2"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Realtime KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Presensi Guru</span>
            <span className="text-lg font-black text-slate-900">
              {teacherLogs.filter(t => t.clockIn).length} / {teacherLogs.length}
            </span>
            <span className="text-[9px] text-slate-500 block">Tercatat Aktif</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Jurnal Mengajar</span>
            <span className="text-lg font-black text-slate-900">{journals.length} Kelas</span>
            <span className="text-[9px] text-slate-500 block">Telah Mengisi</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <Heart className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Sakit & Izin Murid</span>
            <span className="text-lg font-black text-slate-900">
              🤒 {getSakitCount()} S | ✉️ {getIzinCount()} I
            </span>
            <span className="text-[9px] text-slate-500 block">Verifikasi Wali Kelas</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Dalam Bimbingan BK</span>
            <span className="text-lg font-black text-slate-900">{bkLogs.filter(b => b.status === "Dalam Bimbingan").length} Kasus</span>
            <span className="text-[9px] text-slate-500 block">Sedang Ditindak</span>
          </div>
        </div>

      </div>

      <div className="space-y-6">

        {/* MAIN COLUMN: REAL-TIME FEED & REPORT BUILDERS */}
        <div className="space-y-6">
          
          {/* Menu Selector Tabs */}
          <div className="flex border-b border-slate-200 gap-4 flex-wrap">
            <button
              onClick={() => setIsComprehensive15ModalOpen(true)}
              className="pb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 border-emerald-500 text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/80 px-3 py-1 rounded-t-xl transition-all cursor-pointer shadow-xs"
            >
              <Clock className="h-4 w-4 text-emerald-600 animate-pulse" />
              <span>Rekap Presensi 15.00 WITA</span>
              <span className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black">OTOMATIS WA</span>
            </button>

            <button
              onClick={() => setActiveTabPanel("rekap")}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTabPanel === "rekap" 
                  ? "border-indigo-600 text-indigo-700 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Realtime Feed & Rekap WA</span>
            </button>

            <button
              onClick={() => setActiveTabPanel("rekap-murid")}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTabPanel === "rekap-murid" 
                  ? "border-indigo-600 text-indigo-700 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Rekap Absensi Murid</span>
            </button>

            <button
              onClick={() => setActiveTabPanel("rekap-guru")}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTabPanel === "rekap-guru" 
                  ? "border-indigo-600 text-indigo-700 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Rekap Kehadiran Guru</span>
            </button>

            <button
              onClick={() => setActiveTabPanel("rekap-tu")}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTabPanel === "rekap-tu" 
                  ? "border-indigo-600 text-indigo-700 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>Rekap Staf & Admin TU</span>
            </button>

            <button
              onClick={() => setActiveTabPanel("rekap-piket")}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTabPanel === "rekap-piket" 
                  ? "border-indigo-600 text-indigo-700 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-indigo-600" />
              <span>Rekap Laporan Guru Piket</span>
            </button>

            <button
              onClick={() => setActiveTabPanel("rekap-masuk-pulang")}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTabPanel === "rekap-masuk-pulang" 
                  ? "border-indigo-600 text-indigo-700 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Rekap Masuk & Pulang Harian</span>
            </button>

            <button
              onClick={() => setActiveTabPanel("rekap-refleksi")}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTabPanel === "rekap-refleksi" 
                  ? "border-indigo-600 text-indigo-700 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>Rekap Refleksi Murid</span>
            </button>

            {(isSuperAdmin || isExecutiveAdmin) && (
              <button
                onClick={() => setActiveTabPanel("quick-submit")}
                className={`pb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTabPanel === "quick-submit" 
                    ? "border-indigo-600 text-indigo-700 font-extrabold" 
                    : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Submit Laporan Tambahan</span>
              </button>
            )}

            {(isSuperAdmin || isExecutiveAdmin) && (
              <button
                onClick={() => setActiveTabPanel("fonnte-config")}
                className={`pb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTabPanel === "fonnte-config" 
                    ? "border-indigo-600 text-indigo-700 font-extrabold" 
                    : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Pengaturan Fonnte Gateway</span>
              </button>
            )}

            {isSuperAdmin && (
              <button
                onClick={() => setActiveTabPanel("firebase-config")}
                className={`pb-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTabPanel === "firebase-config" 
                    ? "border-rose-600 text-rose-700 font-extrabold" 
                    : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
                }`}
              >
                <Database className={`h-4 w-4 ${isFirebaseConfigured() ? "text-emerald-500 animate-pulse" : "text-rose-500"}`} />
                <span>Database Cloud Firebase {isFirebaseConfigured() ? "🟢" : "🔴"}</span>
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            
            {/* TAB 1: REALTIME INTEGRATION & WA DRAFTS */}
            {activeTabPanel === "rekap" && (
              <motion.div
                key="tab-rekap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Real-time Signals Timeline Feed */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-indigo-500 animate-pulse" />
                          <span>Sinyal Real-time / Aktivitas Sekolah Hari Ini</span>
                        </h3>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                          <Clock className="h-3 w-3 text-emerald-600" />
                          Auto-Clean 3 Minggu (21 Hari) Aktif
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Sinyal laporan langsung terunggah saat guru melakukan absensi harian, mengisi jurnal, atau wali kelas/BK meng-input data. Data aktivitas yang tersimpan lebih dari 3 minggu (21 hari) secara otomatis dibersihkan sistem secara berkala.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const removed = autoPruneAllStorageLogs();
                          loadSharedData();
                          if (removed > 0) {
                            triggerToast(`Pembersihan otomatis berhasil! ${removed} data aktivitas lama (> 3 minggu) telah dibersihkan.`);
                          } else {
                            triggerToast("Sistem Bersih: Tidak ada data aktivitas yang lebih lama dari 3 minggu (21 hari).");
                          }
                        }}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Pindai & bersihkan data aktivitas tersimpan yang sudah berusia lebih dari 3 minggu (21 hari)"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                        <span>Pindai Data &gt; 3 Minggu</span>
                      </button>

                      <button
                        onClick={() => handleOpenWAShare("rekap-harian")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Rekap Akhir WA</span>
                      </button>
                    </div>
                  </div>

                  {liveSignals.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic">
                      Belum ada sinyal aktivitas terekam untuk hari ini. Silakan tambahkan laporan pada tab "Submit Laporan Tambahan".
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {liveSignals.map((sig) => (
                        <div 
                          key={sig.id}
                          className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 rounded-xl p-3 flex justify-between items-start gap-4 transition-all"
                        >
                          <div className="flex gap-2.5 items-start">
                            <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                              {sig.time} WITA
                            </span>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  sig.category === "guru" ? "bg-emerald-500" :
                                  sig.category === "jurnal" ? "bg-indigo-500" :
                                  sig.category === "murid" ? "bg-rose-500" : "bg-amber-500"
                                }`} />
                                <span className="font-black text-slate-800 text-xs">{sig.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">{sig.description}</p>
                              <span className="text-[10px] font-medium text-slate-400 italic block">{sig.meta}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenWAShare(sig.id)}
                            className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-500 hover:text-emerald-700 p-2 rounded-lg cursor-pointer transition-all shrink-0"
                            title="Pratinjau Laporan WA"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pantauan Aktif Guru BK / Sedang Ditindak */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-indigo-500" />
                        <span>Daftar Murid Sedang Ditindaklanjuti Guru BK</span>
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Memantau murid yang dirujuk ke Guru BK untuk bimbingan preventif dan penertiban perilaku harian.
                      </p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                      {bkLogs.filter(b => b.status === "Dalam Bimbingan").length} Active
                    </span>
                  </div>

                  {bkLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      Tidak ada kasus bimbingan aktif hari ini. Kondisi belajar mengajar sangat kondusif!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {bkLogs.map((log) => (
                        <div 
                          key={log.id}
                          className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2.5 relative hover:border-slate-200 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-slate-800 text-xs block">{log.studentName}</span>
                              <span className="text-[10px] text-slate-500 block">Kelas: {log.className}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              log.status === "Dalam Bimbingan" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                              log.status === "Selesai" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                              "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}>
                              {log.status}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px] border-t border-slate-200/50 pt-2 text-slate-700">
                            <div><span className="font-bold text-slate-500">Kasus:</span> {log.caseType}</div>
                            <div><span className="font-bold text-slate-500">Tindakan:</span> {log.actionTaken}</div>
                            <div className="text-[10px] text-slate-400 italic block mt-1">Dilaporkan oleh: {log.reportedBy}</div>
                          </div>

                          <button
                            onClick={() => handleDeleteBKLog(log.id)}
                            className="absolute bottom-2.5 right-2.5 text-slate-300 hover:text-rose-600 transition-all cursor-pointer p-1"
                            title="Hapus laporan BK"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* TAB 1B: REKAP ABSENSI MURID (SEMUA KELAS - ARSIP & SELFIE) */}
            {activeTabPanel === "rekap-murid" && (
              <motion.div
                key="tab-rekap-murid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* 📅 PILIH DARI JADWAL MENGAJAR GURU MATAPELAJARAN */}
                <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/70 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                          PILIH DARI JADWAL MENGAJAR GURU MATAPELAJARAN
                        </h3>
                        {selectedScheduleTeacher !== "semua" && (
                          <span className="text-[10px] font-bold text-indigo-600 block mt-0.5">
                            📍 Menampilkan Jadwal Khusus: <span className="font-extrabold underline">{effectiveTeacherForSchedule}</span> ({filteredScheduleList.length} Kelas)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filter Guru:</span>
                        <select
                          value={selectedScheduleTeacher}
                          onChange={(e) => setSelectedScheduleTeacher(e.target.value)}
                          className="bg-slate-50 border border-slate-200 py-1.5 px-3 text-xs rounded-xl font-bold text-slate-800 focus:outline-indigo-500 transition-all max-w-[210px] truncate cursor-pointer shadow-xs"
                        >
                          <option value="auto">
                            🤖 Auto ({effectiveTeacherForSchedule.split(",")[0]})
                          </option>
                          <option value="semua">Semua Guru (Seluruh Jadwal)</option>
                          {scheduleTeacherNames.map((tName, i) => (
                            <option key={i} value={tName}>{tName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Semester:</span>
                        <select
                          value={selectedScheduleSemester}
                          onChange={(e) => setSelectedScheduleSemester(e.target.value)}
                          className="bg-slate-50 border border-slate-200 py-1.5 px-3 text-xs rounded-xl font-bold text-slate-800 focus:outline-indigo-500 transition-all cursor-pointer shadow-xs"
                        >
                          <option value="Ganjil 2026/2027">Ganjil 2026/2027</option>
                          <option value="Genap 2026/2027">Genap 2026/2027</option>
                          <option value="Ganjil 2027/2028">Ganjil 2027/2028</option>
                          <option value="Genap 2027/2028">Genap 2027/2028</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {filteredScheduleList.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 font-medium text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Tidak ada jadwal mengajar terdaftar untuk guru ini di semester {selectedScheduleSemester}.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {filteredScheduleList.map((sch, idx) => {
                        const isSelected = selectedClassFilter === sch.className;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedClassFilter(sch.className);
                              triggerToast(`Jadwal dipilih: ${sch.className} - ${sch.subjectName} (${sch.day}). Menyaring laporan murid.`);
                            }}
                            className={`text-left p-3 rounded-xl border text-[11px] leading-tight transition-all flex flex-col justify-between hover:scale-[1.01] cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                                : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 w-full">
                              <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? "text-indigo-100" : "text-indigo-700"}`}>
                                {sch.className}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${isSelected ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>
                                {sch.day}
                              </span>
                            </div>

                            <div className="mt-1.5 space-y-0.5">
                              <p className="font-extrabold text-xs truncate">{sch.subjectName}</p>
                              <p className={`text-[10px] ${isSelected ? "text-indigo-200" : "text-slate-500"}`}>
                                Diajar oleh: <span className="font-bold">{sch.teacherName}</span> • Jam {sch.period} ({sch.time})
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="bg-indigo-50/70 border border-indigo-100/80 rounded-xl px-3.5 py-2 flex items-center gap-2 text-[10px] text-indigo-900 font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span>Memilih jadwal otomatis mengonfigurasi Kelas & Mata Pelajaran serta menampilkan daftar murid terkait.</span>
                  </div>
                </div>

                {/* 🔍 FILTER REKAP ABSENSI */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 text-white">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                        Sistem Informasi Rekap Kehadiran Murid (SIHADIR Murid)
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Mengonsolidasikan laporan absensi kelas dari guru piket/wali kelas serta absensi mandiri murid berfoto & GPS.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Filter Kelas */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Kelas:</label>
                      <select
                        value={selectedClassFilter}
                        onChange={(e) => setSelectedClassFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 py-2 px-3 text-xs rounded-xl font-bold text-indigo-300 focus:outline-indigo-500 transition-all cursor-pointer"
                      >
                        <option value="Semua Kelas">Semua Kelas</option>
                        {Array.from(new Set([
                          "XI TKR A",
                          "XI TKR B",
                          "XI TSM A",
                          "XI TSM B",
                          ...studentLogs.map(l => l.className),
                          ...selfAttendanceLogs.map(l => l.className)
                        ])).filter(Boolean).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Tanggal */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Tanggal:</label>
                      <input
                        type="date"
                        value={selectedDateFilter}
                        onChange={(e) => setSelectedDateFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 py-1.5 px-3 text-xs rounded-xl font-bold text-indigo-300 focus:outline-indigo-500 transition-all"
                      />
                    </div>

                    {/* Cari Nama Murid */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cari Nama Murid:</label>
                      <input
                        type="text"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        placeholder="Ketik nama murid..."
                        className="w-full bg-slate-950 border border-slate-800 py-2 px-3 text-xs rounded-xl font-medium text-slate-100 placeholder-slate-500 focus:outline-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Reset Filters button if any filter is active */}
                  {(selectedClassFilter !== "Semua Kelas" || selectedDateFilter !== "" || studentSearchQuery !== "") && (
                    <div className="flex justify-end pt-1 border-t border-slate-800/50">
                      <button
                        onClick={() => {
                          setSelectedClassFilter("Semua Kelas");
                          setSelectedDateFilter("");
                          setStudentSearchQuery("");
                        }}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>🔄 Reset Penyaringan Laporan</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub-Tabs Selector inside Rekap Murid */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
                  <button
                    onClick={() => setRekapSiswaSubTab("arsip-kelas")}
                    className={`flex-1 py-2 text-xs font-black uppercase rounded-lg text-center cursor-pointer transition-all ${
                      rekapSiswaSubTab === "arsip-kelas"
                        ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    📂 Jurnal Absensi Kelas ({
                      studentLogs.filter(log => {
                        const matchClass = selectedClassFilter === "Semua Kelas" || log.className === selectedClassFilter;
                        const matchDate = !selectedDateFilter || log.date === selectedDateFilter;
                        return matchClass && matchDate;
                      }).length
                    })
                  </button>
                  <button
                    onClick={() => setRekapSiswaSubTab("presensi-mandiri")}
                    className={`flex-1 py-2 text-xs font-black uppercase rounded-lg text-center cursor-pointer transition-all ${
                      rekapSiswaSubTab === "presensi-mandiri"
                        ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    🤳 Selfie Mandiri Murid ({
                      selfAttendanceLogs.filter(log => {
                        const matchClass = selectedClassFilter === "Semua Kelas" || log.className === selectedClassFilter;
                        const matchDate = !selectedDateFilter || log.date === selectedDateFilter;
                        const matchSearch = !studentSearchQuery || log.studentName.toLowerCase().includes(studentSearchQuery.toLowerCase());
                        return matchClass && matchDate && matchSearch;
                      }).length
                    })
                  </button>
                </div>

                {/* TAB CONTENT 1: 📂 JURNAL ABSENSI KELAS (DARI GURU / WALI) */}
                {rekapSiswaSubTab === "arsip-kelas" && (
                  <div className="space-y-4">
                    {studentLogs.filter(log => {
                      const matchClass = selectedClassFilter === "Semua Kelas" || log.className === selectedClassFilter;
                      const matchDate = !selectedDateFilter || log.date === selectedDateFilter;
                      return matchClass && matchDate;
                    }).length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs italic">
                        Belum ada laporan absen kelas dari guru piket/wali kelas yang cocok untuk kelas & tanggal saat ini.
                      </div>
                    ) : (
                      studentLogs.filter(log => {
                        const matchClass = selectedClassFilter === "Semua Kelas" || log.className === selectedClassFilter;
                        const matchDate = !selectedDateFilter || log.date === selectedDateFilter;
                        return matchClass && matchDate;
                      }).map((log) => {
                        const filteredRecords = log.records.filter(r => 
                          !studentSearchQuery || r.name.toLowerCase().includes(studentSearchQuery.toLowerCase())
                        );

                        const totalRecords = log.records.length;
                        const hadirCount = log.records.filter(r => r.status === "Hadir").length;
                        const sakitCount = log.records.filter(r => r.status === "Sakit").length;
                        const izinCount = log.records.filter(r => r.status === "Izin").length;
                        const alfaCount = log.records.filter(r => r.status === "Alfa").length;
                        const rate = totalRecords > 0 ? Math.round((hadirCount / totalRecords) * 100) : 0;

                        if (studentSearchQuery && filteredRecords.length === 0) return null;

                        return (
                          <div key={log.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-all">
                            <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-slate-900 text-sm">{log.className}</span>
                                  <span className="bg-indigo-100 text-indigo-800 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full">
                                    {log.subject}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono mt-1 block">Input Harian: {log.date}</span>
                              </div>

                              <div className="flex flex-wrap gap-2 items-center">
                                <div className="bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-600 flex gap-2 items-center shadow-2xs">
                                  <span>H: <strong className="text-emerald-600">{hadirCount}</strong></span>
                                  <span>S: <strong className="text-blue-600">{sakitCount}</strong></span>
                                  <span>I: <strong className="text-amber-600">{izinCount}</strong></span>
                                  <span>A: <strong className="text-rose-600">{alfaCount}</strong></span>
                                </div>
                                <span className={`text-[10px] font-black uppercase font-mono px-2.5 py-1 rounded-xl border shadow-2xs ${
                                  rate >= 90 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                  Disiplin: {rate}%
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEntireClassLog(log.id)}
                                  className="text-rose-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                  title="Hapus seluruh laporan kelas ini"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="p-3 overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                    <th className="py-2 px-1">Nama Murid</th>
                                    <th className="py-2 text-center">Status Kehadiran</th>
                                    <th className="py-2 text-right">Ubah Presensi Cepat (Piket/Wali)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-xs">
                                  {filteredRecords.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="py-2.5 px-1 font-bold text-slate-800">{r.name}</td>
                                      <td className="py-2.5 text-center">
                                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-block ${
                                          r.status === "Hadir" ? "bg-emerald-100 text-emerald-800" :
                                          r.status === "Sakit" ? "bg-blue-100 text-blue-800" :
                                          r.status === "Izin" ? "bg-amber-100 text-amber-800" :
                                          "bg-rose-100 text-rose-800"
                                        }`}>
                                          {r.status}
                                        </span>
                                      </td>
                                      <td className="py-2.5 text-right flex gap-1 justify-end items-center">
                                        {(["Hadir", "Sakit", "Izin", "Alfa"] as const).map((st) => (
                                          <button
                                            key={st}
                                            onClick={() => handleUpdateClassRecordStatus(log.id, r.name, st)}
                                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                                              r.status === st 
                                                ? "bg-slate-800 border-slate-900 text-white shadow-xs scale-105" 
                                                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500"
                                            }`}
                                          >
                                            {st}
                                          </button>
                                        ))}
                                        <span className="text-slate-200 mx-1">|</span>
                                        <button
                                          onClick={() => handleDeleteClassRecord(log.id, r.name)}
                                          className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                                          title="Hapus rekaman absen"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* TAB CONTENT 2: 🤳 SELFIE MANDIRI MURID (REAL-TIME GPS & PHOTO) */}
                {rekapSiswaSubTab === "presensi-mandiri" && (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-900 tracking-wider block">
                        Log Real-Time Presensi Mandiri Murid (Wearpack & Selfie Live)
                      </span>
                    </div>

                    {selfAttendanceLogs.filter(log => {
                      const matchClass = selectedClassFilter === "Semua Kelas" || log.className === selectedClassFilter;
                      const matchDate = !selectedDateFilter || log.date === selectedDateFilter;
                      const matchSearch = !studentSearchQuery || log.studentName.toLowerCase().includes(studentSearchQuery.toLowerCase());
                      return matchClass && matchDate && matchSearch;
                    }).length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-xs italic">
                        Belum ada log presensi mandiri terdaftar untuk penyaringan kelas, tanggal, atau pencarian saat ini.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                              <th className="p-3">Foto Selfie</th>
                              <th className="p-3">Murid & Kelas</th>
                              <th className="p-3">Tanggal & Waktu</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Alasan/Keterangan</th>
                              <th className="p-3">GPS & Jarak</th>
                              <th className="p-3 text-right">Aksi Wali/Admin</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {selfAttendanceLogs.filter(log => {
                              const matchClass = selectedClassFilter === "Semua Kelas" || log.className === selectedClassFilter;
                              const matchDate = !selectedDateFilter || log.date === selectedDateFilter;
                              const matchSearch = !studentSearchQuery || log.studentName.toLowerCase().includes(studentSearchQuery.toLowerCase());
                              return matchClass && matchDate && matchSearch;
                            }).map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="p-3">
                                  {log.photo ? (
                                    <div 
                                      onClick={() => setViewSelfieModalUrl(log.photo)}
                                      className="w-10 h-10 rounded-lg border overflow-hidden cursor-zoom-in hover:scale-105 transition-all bg-slate-950 flex items-center justify-center p-0.5 shadow-xs"
                                    >
                                      <img src={log.photo} alt="Selfie" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg border bg-slate-100 flex items-center justify-center text-slate-300">
                                      <Users className="h-4 w-4" />
                                    </div>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className="font-extrabold text-slate-800 block">{log.studentName}</span>
                                  <span className="text-[10px] text-slate-400 block">{log.className}</span>
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-slate-700 block">{log.date}</span>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    Masuk: <strong className="text-emerald-600">{log.clockIn || "--:--"}</strong> • Pulang: <strong className="text-amber-600">{log.clockOut || "--:--"}</strong>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full block text-center max-w-[80px] ${
                                    log.status === "Hadir" ? "bg-emerald-100 text-emerald-800" :
                                    log.status === "Sakit" ? "bg-blue-100 text-blue-800" :
                                    log.status === "Izin" ? "bg-amber-100 text-amber-800" :
                                    "bg-rose-100 text-rose-800"
                                  }`}>
                                    {log.status}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-500 max-w-[150px] truncate" title={log.reason}>
                                  {log.reason || <span className="text-slate-300 italic">Tanpa keterangan</span>}
                                </td>
                                <td className="p-3">
                                  <div className="flex flex-col gap-0.5 font-mono text-[10px] text-slate-500">
                                    <span className="font-bold text-indigo-600">
                                      📍 {log.distanceMeter ? `${Math.round(log.distanceMeter)}m dari sekolah` : "Koordinat Terbuka"}
                                    </span>
                                    <span className="text-[9px] text-slate-400">Lat: {log.latitude?.toFixed(5)}, Lon: {log.longitude?.toFixed(5)}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-right flex items-center justify-end gap-1.5">
                                  <select
                                    value={log.status}
                                    onChange={(e) => handleUpdateSelfLogStatus(log.id, e.target.value)}
                                    className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg py-1 px-1.5 text-slate-700 focus:outline-indigo-500 cursor-pointer"
                                  >
                                    <option value="Hadir">Hadir</option>
                                    <option value="Sakit">Sakit</option>
                                    <option value="Izin">Izin</option>
                                    <option value="Alfa">Alfa</option>
                                  </select>
                                  <button
                                    onClick={() => handleDeleteSelfLog(log.id, log.studentName)}
                                    className="text-rose-400 hover:text-rose-600 p-1.5 cursor-pointer transition-colors"
                                    title="Hapus log mandiri"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 1C: REKAP KEHADIRAN GURU MAPEL (UNTUK TATA USAHA & ADMIN) */}
            {activeTabPanel === "rekap-guru" && (
              <motion.div
                key="tab-rekap-guru"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* 🔍 FILTER REKAP PRESENSI GURU */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 text-white">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center text-white bg-indigo-600">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                          Sistem Rekap Kehadiran Guru Mapel (SIHADIR Guru)
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          Pencatatan masuk/keluar harian, analisis keterlambatan, serta rekapitulasi data presensi seluruh guru mata pelajaran.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenWAShare("rekap-guru")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Kirim Rekap Guru (WA)</span>
                      </button>

                      <button
                        onClick={() => setShowAddTeacherModal(!showAddTeacherModal)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Input Absen Guru Manual</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Form to Add Teacher Manual */}
                  {showAddTeacherModal && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="bg-slate-950 border border-indigo-900/40 rounded-xl p-4 space-y-3 text-xs overflow-hidden"
                    >
                      <h4 className="font-extrabold text-indigo-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <span>➕ Form Input Presensi Guru Manual</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Nama Lengkap Guru Mapel:</label>
                          <input 
                            type="text"
                            placeholder="Contoh: Drs. H. Ahmad Fauzi"
                            value={newTeacherFormName}
                            onChange={(e) => setNewTeacherFormName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Tanggal Presensi:</label>
                          <input 
                            type="date"
                            value={newTeacherFormDate}
                            onChange={(e) => setNewTeacherFormDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Status Kehadiran:</label>
                          <select
                            value={newTeacherFormStatus}
                            onChange={(e: any) => setNewTeacherFormStatus(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Hadir">Hadir</option>
                            <option value="Sakit">Sakit</option>
                            <option value="Izin">Izin</option>
                            <option value="Tanpa Keterangan">Tanpa Keterangan (Alpa)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Jam Masuk (Clock-In):</label>
                          <input 
                            type="time"
                            value={newTeacherFormClockIn}
                            onChange={(e) => setNewTeacherFormClockIn(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Jam Pulang (Clock-Out):</label>
                          <input 
                            type="time"
                            placeholder="Opsional"
                            value={newTeacherFormClockOut}
                            onChange={(e) => setNewTeacherFormClockOut(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Akurasi GPS (m dari Sekolah):</label>
                          <input 
                            type="number"
                            value={newTeacherFormDistance}
                            onChange={(e) => setNewTeacherFormDistance(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                        <button
                          type="button"
                          onClick={() => setShowAddTeacherModal(false)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleAddTeacherLogManualSubmit}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          Simpan Presensi Guru
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                    {/* Filter Tanggal */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Filter Tanggal:</label>
                      <input
                        type="date"
                        value={selectedTeacherDateFilter}
                        onChange={(e) => setSelectedTeacherDateFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 py-1.5 px-3 text-xs rounded-xl font-bold text-indigo-300 focus:outline-indigo-500 transition-all"
                      />
                      {selectedTeacherDateFilter && (
                        <button 
                          onClick={() => setSelectedTeacherDateFilter("")}
                          className="text-[9px] text-indigo-400 hover:underline block text-right mt-0.5 animate-pulse"
                        >
                          Reset Filter Tanggal
                        </button>
                      )}
                    </div>

                    {/* Filter Status */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Filter Status:</label>
                      <select
                        value={selectedTeacherStatusFilter}
                        onChange={(e) => setSelectedTeacherStatusFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 py-2 px-3 text-xs rounded-xl font-bold text-indigo-300 focus:outline-indigo-500 transition-all cursor-pointer"
                      >
                        <option value="Semua Status">Semua Status</option>
                        <option value="Hadir">Hadir</option>
                        <option value="Tepat Waktu">Tepat Waktu (&lt;= 07:30)</option>
                        <option value="Terlambat">Terlambat (&gt; 07:30)</option>
                        <option value="Sakit">Sakit</option>
                        <option value="Izin">Izin</option>
                        <option value="Tanpa Keterangan">Tanpa Keterangan (Alpa)</option>
                      </select>
                    </div>

                    {/* Cari Nama Guru */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cari Guru:</label>
                      <input
                        type="text"
                        placeholder="Ketik nama guru mapel..."
                        value={teacherSearchQuery}
                        onChange={(e) => setTeacherSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 py-1.5 px-3 text-xs rounded-xl font-bold text-indigo-300 focus:outline-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 📊 KPI GURU RESUME */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-xs text-center">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Total Guru Mapel</span>
                    <span className="text-xl font-black text-slate-950 block">{teacherLogs.length}</span>
                    <span className="text-[9px] text-slate-500 block">Orang Terdata</span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 shadow-xs text-center">
                    <span className="text-[9px] font-bold text-emerald-600 block uppercase">Hadir Tepat Waktu</span>
                    <span className="text-xl font-black text-emerald-800 block">
                      {teacherLogs.filter(t => t.status === "Hadir" && t.clockIn && t.clockIn <= "07:30").length}
                    </span>
                    <span className="text-[9px] text-emerald-600 block">Masuk Sebelum 07:30</span>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 shadow-xs text-center">
                    <span className="text-[9px] font-bold text-amber-600 block uppercase">Hadir Terlambat</span>
                    <span className="text-xl font-black text-amber-800 block">
                      {teacherLogs.filter(t => t.status === "Hadir" && t.clockIn && t.clockIn > "07:30").length}
                    </span>
                    <span className="text-[9px] text-amber-600 block">Masuk Lewat 07:30</span>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 shadow-xs text-center">
                    <span className="text-[9px] font-bold text-blue-600 block uppercase">Sakit & Izin</span>
                    <span className="text-xl font-black text-blue-800 block">
                      {teacherLogs.filter(t => t.status === "Sakit" || t.status === "Izin").length}
                    </span>
                    <span className="text-[9px] text-blue-600 block">Guru Berhalangan</span>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3.5 shadow-xs text-center col-span-2 sm:col-span-1">
                    <span className="text-[9px] font-bold text-indigo-600 block uppercase">Rasio Kedisiplinan</span>
                    <span className="text-xl font-black text-indigo-800 block">
                      {teacherLogs.filter(t => t.status === "Hadir").length > 0 
                        ? `${Math.round((teacherLogs.filter(t => t.status === "Hadir" && t.clockIn && t.clockIn <= "07:30").length / teacherLogs.filter(t => t.status === "Hadir").length) * 100)}%`
                        : "0%"}
                    </span>
                    <span className="text-[9px] text-indigo-600 block">Persentase Tepat Waktu</span>
                  </div>
                </div>

                {/* 📋 TABLE KEHADIRAN GURU */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                      <ClipboardList className="h-4 w-4 text-indigo-600" />
                      <span>Daftar Presensi Guru Mapel Hari Ini & Historis ({teacherLogs.filter(t => {
                        const matchesSearch = t.teacherName.toLowerCase().includes(teacherSearchQuery.toLowerCase());
                        const matchesDate = selectedTeacherDateFilter ? t.date === selectedTeacherDateFilter : true;
                        const matchesStatus = selectedTeacherStatusFilter === "Semua Status" 
                          ? true 
                          : selectedTeacherStatusFilter === "Terlambat" 
                            ? (t.status === "Hadir" && t.clockIn && t.clockIn > "07:30")
                            : selectedTeacherStatusFilter === "Tepat Waktu"
                              ? (t.status === "Hadir" && t.clockIn && t.clockIn <= "07:30")
                              : t.status === selectedTeacherStatusFilter;
                        return matchesSearch && matchesDate && matchesStatus;
                      }).length} Rekaman)</span>
                    </h3>
                  </div>

                  {teacherLogs.filter(t => {
                    const matchesSearch = t.teacherName.toLowerCase().includes(teacherSearchQuery.toLowerCase());
                    const matchesDate = selectedTeacherDateFilter ? t.date === selectedTeacherDateFilter : true;
                    const matchesStatus = selectedTeacherStatusFilter === "Semua Status" 
                      ? true 
                      : selectedTeacherStatusFilter === "Terlambat" 
                        ? (t.status === "Hadir" && t.clockIn && t.clockIn > "07:30")
                        : selectedTeacherStatusFilter === "Tepat Waktu"
                          ? (t.status === "Hadir" && t.clockIn && t.clockIn <= "07:30")
                          : t.status === selectedTeacherStatusFilter;
                    return matchesSearch && matchesDate && matchesStatus;
                  }).length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic space-y-2">
                      <p>🔍 Tidak ditemukan log presensi guru mapel yang cocok dengan kriteria pencarian.</p>
                      <button 
                        onClick={() => {
                          setTeacherSearchQuery("");
                          setSelectedTeacherDateFilter("");
                          setSelectedTeacherStatusFilter("Semua Status");
                        }}
                        className="text-indigo-600 hover:underline font-bold text-[11px] cursor-pointer"
                      >
                        Reset Semua Filter Pencarian
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider border-b border-slate-100">
                            <th className="p-3">Nama Guru</th>
                            <th className="p-3">Tanggal</th>
                            <th className="p-3 text-center">Jam Masuk</th>
                            <th className="p-3 text-center">Jam Pulang</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3">Lokasi / GPS</th>
                            <th className="p-3 text-right">Aksi Manajemen (TU)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {teacherLogs.filter(t => {
                            const matchesSearch = t.teacherName.toLowerCase().includes(teacherSearchQuery.toLowerCase());
                            const matchesDate = selectedTeacherDateFilter ? t.date === selectedTeacherDateFilter : true;
                            const matchesStatus = selectedTeacherStatusFilter === "Semua Status" 
                              ? true 
                              : selectedTeacherStatusFilter === "Terlambat" 
                                ? (t.status === "Hadir" && t.clockIn && t.clockIn > "07:30")
                                : selectedTeacherStatusFilter === "Tepat Waktu"
                                  ? (t.status === "Hadir" && t.clockIn && t.clockIn <= "07:30")
                                  : t.status === selectedTeacherStatusFilter;
                            return matchesSearch && matchesDate && matchesStatus;
                          }).map((log) => {
                            const isLate = log.clockIn && log.clockIn > "07:30";
                            return (
                              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-[10px] shrink-0">
                                    {log.teacherName.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{log.teacherName}</span>
                                    <span className="text-[9px] text-slate-400 block font-mono">ID: {log.id}</span>
                                  </div>
                                </td>
                                
                                <td className="p-3 text-slate-600 font-semibold font-mono">
                                  {log.date}
                                </td>

                                <td className="p-3 text-center">
                                  {log.clockIn ? (
                                    <div className="space-y-1">
                                      <span className="font-black text-slate-900 font-mono text-xs">{log.clockIn}</span>
                                      {isLate ? (
                                        <span className="block text-[8px] bg-rose-50 text-rose-600 font-bold px-1 py-0.5 rounded-sm">
                                          Terlambat
                                        </span>
                                      ) : (
                                        <span className="block text-[8px] bg-emerald-50 text-emerald-600 font-bold px-1 py-0.5 rounded-sm">
                                          Tepat Waktu
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 italic text-[10px]">-</span>
                                  )}
                                </td>

                                <td className="p-3 text-center font-mono font-bold text-slate-800">
                                  {log.clockOut || (
                                    <span className="text-slate-300 italic text-[10px] font-normal">Belum Pulang</span>
                                  )}
                                </td>

                                <td className="p-3 text-center">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    log.status === "Hadir" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                    log.status === "Sakit" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                    log.status === "Izin" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                    "bg-rose-50 text-rose-700 border border-rose-100"
                                  }`}>
                                    {log.status === "Tanpa Keterangan" ? "ALPA" : log.status}
                                  </span>
                                </td>

                                <td className="p-3 text-slate-500 text-[10px]">
                                  {log.distanceMeter ? (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-extrabold text-indigo-600">
                                        📍 {Math.round(log.distanceMeter)}m dari sekolah
                                      </span>
                                      <span className="text-[9px] text-slate-400">Radius Aman (Presensi Sah)</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic text-[9px]">Input Operator (TU)</span>
                                  )}
                                </td>

                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Quick Change Status Dropdown */}
                                    <select
                                      value={log.status}
                                      onChange={(e) => handleUpdateTeacherStatus(log.id, e.target.value as any)}
                                      className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg py-1 px-1.5 text-slate-700 focus:outline-indigo-500 cursor-pointer"
                                    >
                                      <option value="Hadir">Set Hadir</option>
                                      <option value="Sakit">Set Sakit</option>
                                      <option value="Izin">Set Izin</option>
                                      <option value="Tanpa Keterangan">Set Alpa</option>
                                    </select>

                                    {/* Edit times trigger */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cin = prompt("Ubah Jam Masuk (format HH:MM atau kosongkan):", log.clockIn || "07:00");
                                        const cout = prompt("Ubah Jam Pulang (format HH:MM atau kosongkan):", log.clockOut || "15:30");
                                        if (cin !== null || cout !== null) {
                                          handleUpdateTeacherClockTimes(log.id, cin, cout);
                                        }
                                      }}
                                      className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] px-2 py-1 rounded-lg font-bold"
                                      title="Edit Jam Masuk/Pulang"
                                    >
                                      Jam
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTeacherLog(log.id, log.teacherName)}
                                      className="text-rose-400 hover:text-rose-600 p-1.5 cursor-pointer transition-colors"
                                      title="Hapus log guru"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: QUICK SUBMIT ADDITIONAL MONITORING (WALI KELAS & BK) */}
            {(isSuperAdmin || isExecutiveAdmin) && activeTabPanel === "quick-submit" && (
              <motion.div
                key="tab-submit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                      <PlusCircle className="h-4 w-4 text-indigo-500" />
                      <span>Formulir Pengisian Laporan Tambahan Harian</span>
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Wali Kelas, Guru Wali, maupun Guru BK dapat mengisi laporan tambahan sakit/izin murid atau rujukan kasus di bawah ini.
                    </p>
                  </div>
                  
                  {/* Form Type Switch */}
                  <div className="bg-slate-100 p-1 rounded-xl flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setFormType("sakit-izin")}
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                        formType === "sakit-izin" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      🤒 Sakit & Izin
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType("bk-case")}
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                        formType === "bk-case" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      ⚖️ Rujukan BK
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType("guru-piket")}
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                        formType === "guru-piket" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      🏫 Guru Piket
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType("guru-wali")}
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                        formType === "guru-wali" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      👤 Guru Wali
                    </button>
                  </div>
                </div>

                <form onSubmit={handleQuickSubmit} className="space-y-4 text-xs">
                  
                  {formType === "sakit-izin" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Nama Murid Berhalangan:</label>
                          <input 
                            type="text"
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            placeholder="Contoh: Bagus Setiawan"
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Pilih Kelas Rujukan:</label>
                          <select
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          >
                            <option value="XI TKR A">XI TKR A (Otomotif)</option>
                            <option value="XI TKR B">XI TKR B (Otomotif)</option>
                            <option value="X TKR A">X TKR A (Otomotif)</option>
                            <option value="XII TKR A">XII TKR A (Otomotif)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Kategori Absen:</label>
                          <div className="flex gap-2">
                            {(["Sakit", "Izin", "Alfa"] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setNewStatus(st)}
                                className={`flex-1 py-2 rounded-xl border text-center font-bold uppercase text-[10px] cursor-pointer transition-all ${
                                  newStatus === st 
                                    ? "bg-indigo-550 bg-indigo-650 text-white border-indigo-600 bg-indigo-600" 
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="font-bold text-slate-700">Keterangan / Alasan Tambahan:</label>
                          <input 
                            type="text"
                            value={newReason}
                            onChange={(e) => setNewReason(e.target.value)}
                            placeholder="Contoh: Demam tinggi, orang tua mengirimkan surat izin WA"
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formType === "bk-case" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Nama Murid Dirujuk:</label>
                          <input 
                            type="text"
                            value={newBkStudent}
                            onChange={(e) => setNewBkStudent(e.target.value)}
                            placeholder="Contoh: Kurniawan"
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Pilih Kelas:</label>
                          <select
                            value={newBkClass}
                            onChange={(e) => setNewBkClass(e.target.value)}
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          >
                            <option value="XI TKR A">XI TKR A (Otomotif)</option>
                            <option value="XI TKR B">XI TKR B (Otomotif)</option>
                            <option value="X TKR A">X TKR A (Otomotif)</option>
                            <option value="XII TKR A">XII TKR A (Otomotif)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Jenis Kasus Murid:</label>
                          <input 
                            type="text"
                            value={newBkCase}
                            onChange={(e) => setNewBkCase(e.target.value)}
                            placeholder="Contoh: Terdeteksi alfa 3 hari berturut-turut di jam mengajar"
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Tindakan Preventif Guru BK:</label>
                          <input 
                            type="text"
                            value={newBkAction}
                            onChange={(e) => setNewBkAction(e.target.value)}
                            placeholder="Contoh: Melakukan panggilan orang tua & bimbingan kepribadian"
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">Status Penanganan Kasus:</label>
                        <select
                          value={newBkStatus}
                          onChange={(e: any) => setNewBkStatus(e.target.value)}
                          className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none"
                        >
                          <option value="Dalam Bimbingan">Dalam Bimbingan BK Aktif</option>
                          <option value="Selesai">Selesai / Teratasi Teratur</option>
                          <option value="Panggilan Orang Tua">Pemanggilan Orang Tua / Surat Peringatan</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {formType === "guru-piket" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Nama Guru Piket:</label>
                          <input 
                            type="text"
                            value={piketReporterName}
                            onChange={(e) => setPiketReporterName(e.target.value)}
                            placeholder="Contoh: Budi Santoso, M.T."
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Pilih Shift Piket:</label>
                          <select
                            value={piketShift}
                            onChange={(e) => setPiketShift(e.target.value)}
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          >
                            <option value="Pagi (07.00 - 12.00)">Pagi (07.00 - 12.00)</option>
                            <option value="Siang (12.00 - 16.00)">Siang (12.00 - 16.00)</option>
                            <option value="Penuh (07.00 - 16.00)">Penuh (07.00 - 16.00)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">Hasil Pemantauan Kelas & KBM:</label>
                        <textarea 
                          value={piketClassroomCheck}
                          onChange={(e) => setClassroomCheck(e.target.value)}
                          rows={2}
                          placeholder="Tuliskan hasil pengecekan keliling ruangan kelas dan aktivitas belajar..."
                          className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Kondisi Kebersihan Lingkungan:</label>
                          <select
                            value={piketHygiene}
                            onChange={(e) => setPiketHygiene(e.target.value)}
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          >
                            <option value="Sangat Bersih & Rapi">Sangat Bersih & Rapi</option>
                            <option value="Bersih Wajar">Bersih Wajar</option>
                            <option value="Perlu Ditingkatkan">Perlu Ditingkatkan</option>
                            <option value="Kotor (Diberikan Sanksi Kebersihan)">Kotor (Diberikan Sanksi Kebersihan)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Kondisi Keamanan & Ketertiban:</label>
                          <select
                            value={piketSecurity}
                            onChange={(e) => setPiketSecurity(e.target.value)}
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          >
                            <option value="Aman & Kondusif">Aman & Kondusif</option>
                            <option value="Tertib Terkendali">Tertib Terkendali</option>
                            <option value="Ada Teguran Murid">Ada Teguran Murid</option>
                            <option value="Rawan (Butuh Koordinasi Keamanan)">Rawan (Butuh Koordinasi Keamanan)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">Catatan Kejadian Khusus / Kejadian Menonjol:</label>
                        <input 
                          type="text"
                          value={piketIncidents}
                          onChange={(e) => setPiketIncidents(e.target.value)}
                          placeholder="Tulis nihil jika kondisi aman..."
                          className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {formType === "guru-wali" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Nama Wali Kelas / Guru Wali:</label>
                          <input 
                            type="text"
                            value={waliName}
                            onChange={(e) => setWaliName(e.target.value)}
                            placeholder="Contoh: Alam, S.Pd."
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Pilih Kelas Bimbingan:</label>
                          <select
                            value={waliClassName}
                            onChange={(e) => setWaliClassName(e.target.value)}
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          >
                            <option value="XI TKR A">XI TKR A (Otomotif)</option>
                            <option value="XI TKR B">XI TKR B (Otomotif)</option>
                            <option value="X TKR A">X TKR A (Otomotif)</option>
                            <option value="XII TKR A">XII TKR A (Otomotif)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">Catatan Pembinaan & Perkembangan Kelas:</label>
                        <textarea 
                          value={waliDevNotes}
                          onChange={(e) => setWaliDevNotes(e.target.value)}
                          rows={2}
                          placeholder="Tuliskan bimbingan rutin atau pesan khusus yang disampaikan kepada kelas..."
                          className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Kasus Khusus / Masalah Murid (Jika Ada):</label>
                          <input 
                            type="text"
                            value={waliSpecialCase}
                            onChange={(e) => setWaliSpecialCase(e.target.value)}
                            placeholder="Contoh: Kurniawan dinasihati perihal keterlambatan berulang..."
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Koordinasi & Komunikasi Orang Tua:</label>
                          <input 
                            type="text"
                            value={waliParentCoordination}
                            onChange={(e) => setWaliParentCoordination(e.target.value)}
                            placeholder="Contoh: Menghubungi ibu Bagus Setiawan menanyakan kondisi sakit..."
                            className="border border-slate-200 rounded-xl p-2.5 w-full text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTabPanel("rekap")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>Submit Laporan & Sinkronkan</span>
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

            {/* TAB 3: FONNTE GATEWAY CONFIGURATION */}
            {isSuperAdmin && activeTabPanel === "fonnte-config" && (
              <motion.div
                key="tab-fonnte"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                    <Settings className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Konfigurasi Fonnte WhatsApp Gateway</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Hubungkan chatbot SIhadir AI dengan nomor WhatsApp Anda atau grup WhatsApp sekolah menggunakan API Key dari Fonnte.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-slate-600 leading-relaxed">
                    <h4 className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <span>💡 Cara Mendapatkan Kredensial Fonnte:</span>
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-[11.5px]">
                      <li>Masuk ke akun Fonnte Anda di <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-bold">fonnte.com</a>.</li>
                      <li>Buka menu <span className="font-bold">Devices</span> dan salin <span className="font-bold">Token API (API Key)</span> milik perangkat aktif Anda.</li>
                      <li>Untuk mengirim ke grup, pastikan bot/nomor Anda telah bergabung di grup tujuan. Anda bisa mendapatkan ID Grup melalui menu <span className="font-bold">Groups</span> di dasbor Fonnte atau ketik <code className="bg-slate-200 text-indigo-700 px-1 py-0.5 rounded text-[10.5px]">/groupid</code> jika fitur autodetect grup menyala.</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">Fonnte API Token / Key:</label>
                      <input 
                        type="password"
                        defaultValue={fonnteApiKey}
                        id="fonnte-api-key-input"
                        placeholder="Contoh: xYz_AbCdEfGhIjKlMnOpQrSt"
                        className="border border-slate-200 rounded-xl p-3 w-full text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Token disimpan dengan aman di LocalStorage browser Anda untuk penyiaran data privat Anda.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">Nomor WhatsApp / ID Grup Penerima:</label>
                      <input 
                        type="text"
                        defaultValue={fonnteTarget}
                        id="fonnte-target-input"
                        placeholder="Contoh: 12036302484739281@g.us (ID Grup) atau 08123456789 (Nomor Pribadi)"
                        className="border border-slate-200 rounded-xl p-3 w-full text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Gunakan format nomor lokal Indonesia (misalnya <code className="bg-slate-100 px-1 py-0.5 rounded">08xxx</code> atau <code className="bg-slate-100 px-1 py-0.5 rounded">628xxx</code>), atau tempelkan ID Group WhatsApp untuk penyiaran grup.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        <span>ID Saluran / Grup WhatsApp SMK Negeri 2 Konawe (Presensi Masuk & Pulang Guru):</span>
                      </label>
                      <input 
                        type="text"
                        defaultValue={localStorage.getItem("simpati_fonnte_school_channel_target") || localStorage.getItem("simpati_fonnte_school_target") || "120363223018241031@g.us"}
                        id="fonnte-school-channel-input"
                        placeholder="Contoh: 120363223018241031@g.us (ID Saluran / Grup)"
                        className="border border-emerald-200 bg-emerald-50/20 rounded-xl p-3 w-full text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Laporan presensi masuk dan presensi pulang harian guru akan terbit otomatis dan tercatat pada saluran/grup resmi ini.
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveTabPanel("rekap")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const keyEl = document.getElementById("fonnte-api-key-input") as HTMLInputElement;
                        const targetEl = document.getElementById("fonnte-target-input") as HTMLInputElement;
                        const channelEl = document.getElementById("fonnte-school-channel-input") as HTMLInputElement;
                        if (keyEl && targetEl) {
                          setFonnteApiKey(keyEl.value.trim());
                          setFonnteTarget(targetEl.value.trim());
                          localStorage.setItem("simpati_fonnte_api_key", keyEl.value.trim());
                          localStorage.setItem("simpati_fonnte_target", targetEl.value.trim());
                          if (channelEl) {
                            localStorage.setItem("simpati_fonnte_school_channel_target", channelEl.value.trim());
                            localStorage.setItem("simpati_fonnte_school_target", channelEl.value.trim());
                          }
                          triggerToast("Pengaturan Fonnte WhatsApp Gateway berhasil disimpan!");
                          setActiveTabPanel("rekap");
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>Simpan Pengaturan Gateway</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: FIREBASE DATABASE CLOUD CONFIGURATION */}
            {isSuperAdmin && activeTabPanel === "firebase-config" && (
              <motion.div
                key="tab-firebase-config"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6"
              >
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black uppercase text-rose-600 tracking-wider flex items-center gap-2">
                      <Database className="h-4.5 w-4.5 text-rose-500" />
                      <span>Konfigurasi Google Firebase & Cloud Firestore</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Koneksikan SIMPATI AI secara langsung ke database cloud milik sekolah Anda untuk sinkronisasi multidevice secara real-time.
                    </p>
                  </div>
                  <div>
                    {isFirebaseConfigured() ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] px-3 py-1 rounded-full border border-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Terhubung ke Cloud
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 font-bold text-[10px] px-3 py-1 rounded-full border border-slate-200">
                        <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                        Offline Lokal (LocalStorage)
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Status Banner */}
                  {isFirebaseConfigured() ? (
                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                          <span>🚀 Database Cloud Aktif</span>
                        </h4>
                        <p className="text-[11px] text-emerald-700 leading-relaxed max-w-xl">
                          Sistem SIMPATI AI saat ini menggunakan Google Cloud Firestore di Project ID <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold text-[10px]">{getFirebaseConfig()?.projectId}</code>. Semua laporan tersinkronisasi otomatis.
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={isSyncingFirebase}
                          onClick={handleMigrateAllData}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase px-4 py-2.5 rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                        >
                          <RefreshCw className={`h-3 w-3 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
                          <span>Migrasikan Data Lokal</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearFirebaseConfig}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-[10px] uppercase px-4 py-2.5 rounded-xl cursor-pointer transition-all border border-rose-200"
                        >
                          Putuskan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-4 space-y-2">
                      <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                        <span>ℹ️ Mode Offline-First (LocalStorage)</span>
                      </h4>
                      <p className="text-[11.5px] text-amber-700 leading-relaxed">
                        Aplikasi saat ini menyimpan semua rekap secara mandiri di dalam browser (offline). <strong>Kapan saja sekolah siap rilis untuk banyak perangkat</strong>, Anda hanya perlu memasukkan konfigurasi Firebase milik sekolah di bawah ini. Anda juga bisa langsung memigrasikan seluruh data offline lokal ke cloud dengan satu klik tombol migrasi yang akan muncul setelah terhubung.
                      </p>
                    </div>
                  )}

                  {/* Kredensial Form */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5">Kredensial Firebase SDK Sekolah</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">Firebase API Key <span className="text-rose-500">*</span></label>
                        <input 
                          type="password"
                          value={firebaseApiKey}
                          onChange={(e) => setFirebaseApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="border border-slate-200 rounded-xl p-3 w-full text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white shadow-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">Firebase Project ID <span className="text-rose-500">*</span></label>
                        <input 
                          type="text"
                          value={firebaseProjectId}
                          onChange={(e) => setFirebaseProjectId(e.target.value)}
                          placeholder="smk-simpati-attendance"
                          className="border border-slate-200 rounded-xl p-3 w-full text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white shadow-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">Auth Domain (Opsional)</label>
                        <input 
                          type="text"
                          value={firebaseAuthDomain}
                          onChange={(e) => setFirebaseAuthDomain(e.target.value)}
                          placeholder="smk-simpati-attendance.firebaseapp.com"
                          className="border border-slate-200 rounded-xl p-3 w-full text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white shadow-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">Storage Bucket (Opsional)</label>
                        <input 
                          type="text"
                          value={firebaseStorageBucket}
                          onChange={(e) => setFirebaseStorageBucket(e.target.value)}
                          placeholder="smk-simpati-attendance.appspot.com"
                          className="border border-slate-200 rounded-xl p-3 w-full text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white shadow-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">Messaging Sender ID (Opsional)</label>
                        <input 
                          type="text"
                          value={firebaseMessagingSenderId}
                          onChange={(e) => setFirebaseMessagingSenderId(e.target.value)}
                          placeholder="828530235505"
                          className="border border-slate-200 rounded-xl p-3 w-full text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white shadow-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">App ID (Opsional)</label>
                        <input 
                          type="text"
                          value={firebaseAppId}
                          onChange={(e) => setFirebaseAppId(e.target.value)}
                          placeholder="1:828530235505:web:abcdef123456"
                          className="border border-slate-200 rounded-xl p-3 w-full text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveTabPanel("rekap")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveFirebaseConfig}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-black px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>Simpan & Hubungkan Database Cloud</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 1D: REKAP MASUK & PULANG HARIAN */}
            {activeTabPanel === "rekap-masuk-pulang" && (
              <motion.div
                key="tab-rekap-masuk-pulang"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* FILTER CARD */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Clock className="h-4.5 w-4.5 text-indigo-600" />
                        <span>Filter Rekap Presensi Masuk & Pulang</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Pantau kedisiplinan jam kedatangan dan kepulangan seluruh guru dan murid mandiri.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Search Input */}
                      <input 
                        type="text" 
                        value={mpSearchQuery}
                        onChange={(e) => setMpSearchQuery(e.target.value)}
                        placeholder="Cari nama..."
                        className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-44 bg-slate-50"
                      />

                      {/* Class Filter */}
                      <select
                        value={mpClassFilter}
                        onChange={(e) => setMpClassFilter(e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="Semua Kelas">Semua Kelas Murid</option>
                        {Array.from(new Set(selfAttendanceLogs.map(s => s.className))).filter(Boolean).map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>

                      {/* Date Filter */}
                      <input 
                        type="date" 
                        value={mpDateFilter}
                        onChange={(e) => setMpDateFilter(e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      />

                      {/* Action Broadcast WA */}
                      <button
                        onClick={() => handleOpenWAShare("rekap-masuk-pulang")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Kirim rekap harian ini ke WhatsApp"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Kirim WA</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* KPI METRICS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3.5 shadow-2xs">
                    <span className="text-[10px] font-black text-indigo-700 block uppercase tracking-wider">Admin/Staf TU Masuk</span>
                    <span className="text-xl font-black text-indigo-950 block mt-1">
                      {teacherLogs.filter(t => isTuPersonnelName(t.teacherName) && (!mpDateFilter || t.date === mpDateFilter) && t.status === "Hadir" && t.clockIn).length} Personel
                    </span>
                    <span className="text-[9px] text-indigo-600 block mt-0.5 font-medium">Clock-In Tercatat</span>
                  </div>

                  <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3.5 shadow-2xs">
                    <span className="text-[10px] font-black text-purple-700 block uppercase tracking-wider">Admin/Staf TU Pulang</span>
                    <span className="text-xl font-black text-purple-950 block mt-1">
                      {teacherLogs.filter(t => isTuPersonnelName(t.teacherName) && (!mpDateFilter || t.date === mpDateFilter) && t.status === "Hadir" && t.clockOut).length} Personel
                    </span>
                    <span className="text-[9px] text-purple-600 block mt-0.5 font-medium">Clock-Out Selesai</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Guru Masuk</span>
                    <span className="text-xl font-black text-slate-900 block mt-1">
                      {teacherLogs.filter(t => !isTuPersonnelName(t.teacherName) && (!mpDateFilter || t.date === mpDateFilter) && t.status === "Hadir" && t.clockIn).length} Orang
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Tercatat Hadir</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Guru Pulang</span>
                    <span className="text-xl font-black text-indigo-700 block mt-1">
                      {teacherLogs.filter(t => !isTuPersonnelName(t.teacherName) && (!mpDateFilter || t.date === mpDateFilter) && t.status === "Hadir" && t.clockOut).length} Orang
                    </span>
                    <span className="text-[9px] text-indigo-500 block mt-0.5">Sudah Checkout</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Murid Masuk</span>
                    <span className="text-xl font-black text-slate-900 block mt-1">
                      {selfAttendanceLogs.filter(s => (!mpDateFilter || s.date === mpDateFilter) && s.status === "Hadir" && s.clockIn).length} Murid
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Mandiri Logged</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Murid Pulang</span>
                    <span className="text-xl font-black text-indigo-700 block mt-1">
                      {selfAttendanceLogs.filter(s => (!mpDateFilter || s.date === mpDateFilter) && s.status === "Hadir" && s.clockOut).length} Murid
                    </span>
                    <span className="text-[9px] text-indigo-500 block mt-0.5">Sudah Checkout</span>
                  </div>
                </div>

                {/* MAIN TABLES CONTAINER */}
                <div className="space-y-6">
                  
                  {/* PANEL 1: ADMIN TU & STAF TU REKAP MASUK & PULANG */}
                  <div className="bg-gradient-to-br from-indigo-900/5 via-purple-900/5 to-slate-50 border-2 border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                          <UserCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                            <span>Absensi Masuk & Pulang Admin TU & Staf TU</span>
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full">Khusus Personel TU</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Rekapitulasi jam kedatangan (Clock-In) dan jam kepulangan (Clock-Out) Admin Tata Usaha & Staf Tata Usaha
                          </p>
                        </div>
                      </div>
                      <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        {teacherLogs.filter(t => isTuPersonnelName(t.teacherName) && (!mpDateFilter || t.date === mpDateFilter)).length} Personel TU
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-indigo-100 text-[10px] font-black uppercase text-indigo-900 tracking-wider bg-indigo-50/50">
                            <th className="py-2.5 pl-3">Nama Personel TU</th>
                            <th className="py-2.5 text-center">Jabatan / Role</th>
                            <th className="py-2.5 text-center">Jam Masuk (Clock-In)</th>
                            <th className="py-2.5 text-center">Jam Pulang (Clock-Out)</th>
                            <th className="py-2.5 text-center">Status Kehadiran</th>
                            <th className="py-2.5 pr-3 text-right">Lokasi GPS & Verifikasi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs bg-white">
                          {teacherLogs
                            .filter(t => {
                              const isTu = isTuPersonnelName(t.teacherName);
                              const matchesDate = !mpDateFilter || t.date === mpDateFilter;
                              const matchesSearch = !mpSearchQuery || t.teacherName.toLowerCase().includes(mpSearchQuery.toLowerCase());
                              return isTu && matchesDate && matchesSearch;
                            })
                            .map((t) => {
                              const isLate = t.clockIn && t.clockIn > "07:30";
                              const isAdmin = t.teacherName.toLowerCase().includes("admin tu") || t.teacherName.toLowerCase().includes("sakti");
                              return (
                                <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                                  <td className="py-3 pl-3 font-bold text-slate-900">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white ${isAdmin ? "bg-indigo-600" : "bg-sky-600"}`}>
                                        {t.teacherName.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <span className="block font-bold text-slate-900">{t.teacherName}</span>
                                        <span className="block text-[9px] text-slate-400 font-mono">ID: {t.id} • Tgl: {t.date}</span>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                      isAdmin 
                                        ? "bg-indigo-100 text-indigo-800 border border-indigo-200" 
                                        : "bg-sky-100 text-sky-800 border border-sky-200"
                                    }`}>
                                      {isAdmin ? "Admin Tata Usaha" : "Staf Tata Usaha"}
                                    </span>
                                  </td>

                                  <td className="py-3 text-center font-mono">
                                    {t.clockIn ? (
                                      <div className="inline-flex flex-col items-center">
                                        <span className="font-black text-slate-900 text-xs">{t.clockIn}</span>
                                        {isLate ? (
                                          <span className="text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.25 rounded font-black mt-0.5">TERLAMBAT</span>
                                        ) : (
                                          <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.25 rounded font-black mt-0.5">TEPAT WAKTU</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 font-medium italic">-</span>
                                    )}
                                  </td>

                                  <td className="py-3 text-center font-mono">
                                    {t.clockOut ? (
                                      <div className="inline-flex flex-col items-center">
                                        <span className="font-black text-purple-700 text-xs">{t.clockOut}</span>
                                        <span className="text-[8px] bg-purple-100 text-purple-800 px-1.5 py-0.25 rounded font-black mt-0.5">SUDAH PULANG</span>
                                      </div>
                                    ) : t.clockIn ? (
                                      <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Sedang Bertugas</span>
                                    ) : (
                                      <span className="text-slate-400 font-medium italic">-</span>
                                    )}
                                  </td>

                                  <td className="py-3 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                      t.status === "Hadir" 
                                        ? "bg-emerald-100 text-emerald-800" 
                                        : t.status === "Sakit" || t.status === "Izin"
                                          ? "bg-indigo-100 text-indigo-800"
                                          : "bg-rose-100 text-rose-800"
                                    }`}>
                                      {t.status}
                                    </span>
                                  </td>

                                  <td className="py-3 pr-3 text-right">
                                    {t.distanceMeter ? (
                                      <div className="inline-flex flex-col items-end">
                                        <span className="font-extrabold text-indigo-700 text-[10px]">
                                          📍 {Math.round(t.distanceMeter)}m dari Sekolah
                                        </span>
                                        <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">Presensi Sah</span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic text-[9px]">Sistem Admin</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}

                          {teacherLogs.filter(t => isTuPersonnelName(t.teacherName) && (!mpDateFilter || t.date === mpDateFilter)).length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 font-medium italic">
                                Belum ada logs presensi Admin TU & Staf TU tercatat pada tanggal {mpDateFilter}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* GRID PANEL 2 & PANEL 3: GURU & MURID */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* GURU TABLE PANEL */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4.5 w-4.5 text-indigo-600" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Absensi Masuk & Pulang Guru Mapel
                          </h4>
                        </div>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                          {teacherLogs.filter(t => !isTuPersonnelName(t.teacherName) && (!mpDateFilter || t.date === mpDateFilter)).length} Logged
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              <th className="pb-3 pl-2">Nama Guru</th>
                              <th className="pb-3 text-center">Jam Masuk</th>
                              <th className="pb-3 text-center">Jam Pulang</th>
                              <th className="pb-3 text-right">Status Kerja</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-xs">
                            {teacherLogs
                              .filter(t => {
                                const isGuruOnly = !isTuPersonnelName(t.teacherName);
                                const matchesDate = !mpDateFilter || t.date === mpDateFilter;
                                const matchesSearch = !mpSearchQuery || t.teacherName.toLowerCase().includes(mpSearchQuery.toLowerCase());
                                return isGuruOnly && matchesDate && matchesSearch;
                              })
                              .map((t) => {
                                const isLate = t.clockIn && t.clockIn > "07:30";
                                return (
                                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-3 pl-2 font-bold text-slate-800">
                                      {t.teacherName}
                                      <span className="block text-[9px] text-slate-400 font-normal">Tanggal: {t.date}</span>
                                    </td>
                                    <td className="py-3 text-center font-mono">
                                      {t.clockIn ? (
                                        <div className="inline-flex flex-col items-center">
                                          <span className="font-extrabold text-slate-800">{t.clockIn}</span>
                                          {isLate ? (
                                            <span className="text-[8px] bg-amber-50 text-amber-700 px-1 py-0.25 rounded font-black mt-0.5">TERLAMBAT</span>
                                          ) : (
                                            <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 py-0.25 rounded font-black mt-0.5">TEPAT WAKTU</span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-slate-400 font-medium">-</span>
                                      )}
                                    </td>
                                    <td className="py-3 text-center font-mono">
                                      {t.clockOut ? (
                                        <div className="inline-flex flex-col items-center">
                                          <span className="font-extrabold text-indigo-700">{t.clockOut}</span>
                                          <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1 py-0.25 rounded font-black mt-0.5">SUDAH PULANG</span>
                                        </div>
                                      ) : t.clockIn ? (
                                        <span className="text-amber-500 font-semibold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full">Sedang Mengajar</span>
                                      ) : (
                                        <span className="text-slate-400 font-medium">-</span>
                                      )}
                                    </td>
                                    <td className="py-3 text-right">
                                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                        t.status === "Hadir" 
                                          ? "bg-emerald-50 text-emerald-700" 
                                          : t.status === "Sakit" || t.status === "Izin"
                                            ? "bg-indigo-50 text-indigo-700"
                                            : "bg-rose-50 text-rose-700"
                                      }`}>
                                        {t.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            {teacherLogs.filter(t => !isTuPersonnelName(t.teacherName) && (!mpDateFilter || t.date === mpDateFilter)).length === 0 && (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-400 font-medium italic">
                                  Belum ada logs presensi guru tercatat pada tanggal {mpDateFilter}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  {/* MURID TABLE PANEL */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4.5 w-4.5 text-indigo-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Absensi Masuk & Pulang Murid Mandiri
                        </h4>
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                        {selfAttendanceLogs.filter(s => s.date === mpDateFilter).length} Logged
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            <th className="pb-3 pl-2">Nama Murid</th>
                            <th className="pb-3 text-center">Kelas</th>
                            <th className="pb-3 text-center">Jam Masuk</th>
                            <th className="pb-3 text-center">Jam Pulang</th>
                            <th className="pb-3 text-right">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs">
                          {selfAttendanceLogs
                            .filter(s => {
                              const matchesDate = !mpDateFilter || s.date === mpDateFilter;
                              const matchesSearch = !mpSearchQuery || s.studentName.toLowerCase().includes(mpSearchQuery.toLowerCase());
                              const matchesClass = mpClassFilter === "Semua Kelas" || s.className === mpClassFilter;
                              return matchesDate && matchesSearch && matchesClass;
                            })
                            .map((s) => {
                              const isLate = s.clockIn && s.clockIn > "07:15";
                              return (
                                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-3 pl-2 font-bold text-slate-800">
                                    {s.studentName}
                                    <span className="block text-[9px] text-slate-400 font-normal">Tanggal: {s.date}</span>
                                  </td>
                                  <td className="py-3 text-center font-bold text-slate-600">
                                    {s.className}
                                  </td>
                                  <td className="py-3 text-center font-mono">
                                    {s.clockIn ? (
                                      <div className="inline-flex flex-col items-center">
                                        <span className="font-extrabold text-slate-800">{s.clockIn}</span>
                                        {isLate ? (
                                          <span className="text-[8px] bg-amber-50 text-amber-700 px-1 py-0.25 rounded font-black mt-0.5">TERLAMBAT</span>
                                        ) : (
                                          <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 py-0.25 rounded font-black mt-0.5">TEPAT WAKTU</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 font-medium">-</span>
                                    )}
                                  </td>
                                  <td className="py-3 text-center font-mono">
                                    {s.clockOut ? (
                                      <div className="inline-flex flex-col items-center">
                                        <span className="font-extrabold text-indigo-700">{s.clockOut}</span>
                                        <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1 py-0.25 rounded font-black mt-0.5">SUDAH PULANG</span>
                                      </div>
                                    ) : s.clockIn ? (
                                      <span className="text-amber-500 font-semibold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full">Belum Pulang</span>
                                    ) : (
                                      <span className="text-slate-400 font-medium">-</span>
                                    )}
                                  </td>
                                  <td className="py-3 text-right">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      s.status === "Hadir" 
                                        ? "bg-emerald-50 text-emerald-700" 
                                        : s.status === "Sakit" || s.status === "Izin"
                                          ? "bg-indigo-50 text-indigo-700"
                                          : "bg-rose-50 text-rose-700"
                                    }`}>
                                      {s.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          {selfAttendanceLogs.filter(s => (!mpDateFilter || s.date === mpDateFilter) && (mpClassFilter === "Semua Kelas" || s.className === mpClassFilter)).length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400 font-medium italic">
                                Belum ada logs presensi mandiri murid tercatat pada tanggal {mpDateFilter} {mpClassFilter !== "Semua Kelas" ? `kelas ${mpClassFilter}` : ""}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
            )}

            {/* TAB 1E: REKAP REFLEKSI HARIAN MURID */}
            {activeTabPanel === "rekap-refleksi" && (() => {
              const reflList: any[] = studentReflections;

              // Filtered list
              const filteredRefl = reflList.filter(r => {
                const matchesDate = !reflDateFilter || r.date === reflDateFilter;
                const matchesClass = reflClassFilter === "Semua Kelas" || r.className === reflClassFilter;
                const matchesSearch = !reflSearchQuery || r.studentName.toLowerCase().includes(reflSearchQuery.toLowerCase());
                return matchesDate && matchesClass && matchesSearch;
              });

              // Statistics Calculations
              const totalCount = filteredRefl.length;
              const avgSatisfaction = totalCount > 0 
                ? (filteredRefl.reduce((acc, r) => acc + (r.satisfaction || 0), 0) / totalCount).toFixed(1)
                : "0.0";
              
              const enjoymentCount = filteredRefl.filter(r => r.enjoyment).length;
              const enjoymentRate = totalCount > 0 ? Math.round((enjoymentCount / totalCount) * 100) : 0;

              const happyTeacherCount = filteredRefl.filter(r => r.happyWithTeacher).length;
              const happyTeacherRate = totalCount > 0 ? Math.round((happyTeacherCount / totalCount) * 100) : 0;

              const unsatisfactoryCount = filteredRefl.filter(r => r.unsatisfactory).length;
              const unsatisfactoryRate = totalCount > 0 ? Math.round((unsatisfactoryCount / totalCount) * 100) : 0;

              return (
                <motion.div
                  key="tab-rekap-refleksi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* FILTER CARD */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                          <Sparkles className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                          <span>Filter Rekap Refleksi Harian Murid</span>
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Pantau kepuasan, perasaan, dan keluhan pembelajaran murid secara langsung.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {/* Class Filter */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wide">Kelas</span>
                          <select
                            value={reflClassFilter}
                            onChange={(e) => setReflClassFilter(e.target.value)}
                            className="border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-bold bg-slate-50 text-slate-700 outline-none focus:bg-white"
                          >
                            <option value="Semua Kelas">Semua Kelas</option>
                            <option value="XI TKR A">XI TKR A</option>
                            <option value="XI TKR B">XI TKR B</option>
                            <option value="XI TSM">XI TSM</option>
                            <option value="X TKR">X TKR</option>
                          </select>
                        </div>

                        {/* Date Filter */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wide">Tanggal</span>
                          <input
                            type="date"
                            value={reflDateFilter}
                            onChange={(e) => setReflDateFilter(e.target.value)}
                            className="border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-bold bg-slate-50 text-slate-700 outline-none focus:bg-white font-mono"
                          />
                        </div>

                        {/* Search Input */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wide">Cari Murid</span>
                          <input
                            type="text"
                            placeholder="Cari nama..."
                            value={reflSearchQuery}
                            onChange={(e) => setReflSearchQuery(e.target.value)}
                            className="border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-bold bg-slate-50 text-slate-700 outline-none focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STATISTICS WIDGETS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat 1: Total Submission */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Refleksi Masuk</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900">{totalCount}</span>
                        <span className="text-xs font-bold text-slate-500">Murid</span>
                      </div>
                      <div className="text-[9px] text-slate-500">Pada filter kelas & tanggal terpilih</div>
                    </div>

                    {/* Stat 2: Avg Satisfaction */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Kepuasan Belajar</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900">{avgSatisfaction}</span>
                        <span className="text-xs font-bold text-slate-500">/ 5.0</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-bold text-indigo-600">
                        {parseFloat(avgSatisfaction) >= 4.0 ? "🥰 Sangat Memuaskan" : parseFloat(avgSatisfaction) >= 3.0 ? "😐 Kondusif / Biasa" : "🙁 Butuh Evaluasi"}
                      </div>
                    </div>

                    {/* Stat 3: KBM Enjoyment Rate */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Senang Pembelajaran (KBM)</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900">{enjoymentRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${enjoymentRate}%` }} />
                      </div>
                    </div>

                    {/* Stat 4: Teacher Sentiment Rate */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Senang dengan Guru</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900">{happyTeacherRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${happyTeacherRate}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* MAIN FEED AND DETAIL LIST */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Catatan & Narasi Refleksi Harian Murid
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Daftar masukan, kritik, dan keluhan langsung dari siswaSMK.</p>
                      </div>
                    </div>

                    {filteredRefl.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs italic space-y-2">
                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                          <Sparkles className="h-6 w-6 stroke-[1.5]" />
                        </div>
                        <p>Tidak ada catatan refleksi masuk untuk filter Kelas: "{reflClassFilter}" dan Tanggal: "{reflDateFilter}"</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredRefl.map((item) => {
                          const ratingEmoji = 
                            item.satisfaction === 5 ? "🥰" :
                            item.satisfaction === 4 ? "😃" :
                            item.satisfaction === 3 ? "😐" :
                            item.satisfaction === 2 ? "🙁" : "🤬";
                          
                          return (
                            <div key={item.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3.5 text-xs hover:bg-slate-50 hover:border-slate-300 transition-all">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h5 className="font-extrabold text-slate-800 leading-none">{item.studentName}</h5>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">{item.className}</span>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 shrink-0 font-mono text-[9px]">
                                    <span className="font-extrabold text-slate-500">{item.date}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.25 rounded font-black">Jam: {item.createdAt || "Sore"}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteReflection(item.id, item.studentName)}
                                        className="text-rose-400 hover:text-rose-600 p-0.5 cursor-pointer transition-colors"
                                        title="Hapus refleksi murid"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-white/80 p-2 rounded-xl border border-slate-150">
                                  <div>
                                    <span className="text-slate-400 block font-medium">Kepuasan:</span>
                                    <span className="font-extrabold text-slate-700">{ratingEmoji} {item.satisfaction}/5</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block font-medium">Senang Guru:</span>
                                    <span className={`font-extrabold ${item.happyWithTeacher ? "text-emerald-600" : "text-rose-600"}`}>
                                      {item.happyWithTeacher ? "✓ Ya" : "✕ Tidak"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block font-medium">Senang KBM:</span>
                                    <span className={`font-extrabold ${item.enjoyment ? "text-emerald-600" : "text-rose-600"}`}>
                                      {item.enjoyment ? "✓ Ya" : "✕ Tidak"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block font-medium">Kurang Puas:</span>
                                    <span className={`font-extrabold ${item.unsatisfactory ? "text-rose-600" : "text-emerald-600"}`}>
                                      {item.unsatisfactory ? "✓ Ya" : "✕ Tidak"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white p-3 rounded-xl border border-slate-150 relative">
                                <span className="absolute -top-2 left-3 bg-slate-100 text-slate-500 font-mono text-[8px] px-1 rounded uppercase font-black">Narasi Perasaan</span>
                                <p className="text-slate-600 italic font-medium leading-relaxed pt-1">
                                  "{item.narrative}"
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}

            {/* TAB 1F: REKAP STAF DAN ADMIN TATA USAHA (TU) */}
            {activeTabPanel === "rekap-tu" && (() => {
              const filteredTu = teacherLogs.filter(t => {
                const isTu = isTuPersonnelName(t.teacherName);
                const matchesDate = !tuDateFilter || t.date === tuDateFilter;
                const matchesSearch = !tuSearchQuery || t.teacherName.toLowerCase().includes(tuSearchQuery.toLowerCase());
                const matchesStatus = tuStatusFilter === "Semua Status" || t.status === tuStatusFilter;
                return isTu && matchesDate && matchesSearch && matchesStatus;
              });

              const tuHadirCount = filteredTu.filter(t => t.status === "Hadir" && t.clockIn).length;
              const tuPulangCount = filteredTu.filter(t => t.status === "Hadir" && t.clockOut).length;
              const tuTerlambatCount = filteredTu.filter(t => t.clockIn && t.clockIn > "07:30").length;
              const tuTepatWaktuCount = filteredTu.filter(t => t.clockIn && t.clockIn <= "07:30").length;
              const tuGpsValidCount = filteredTu.filter(t => t.distanceMeter !== undefined && t.distanceMeter <= 100).length;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* HERO BANNER REKAP STAF & ADMIN TU */}
                  <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/50 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>Subbagian Tata Usaha & Ketatausahaan</span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                          <span>Rekapitulasi Presensi Admin & Staf Tata Usaha</span>
                        </h3>
                        <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
                          Pemantauan khusus jam kerja (Clock-In & Clock-Out), disiplin jam layanan administrasi, ketepatan waktu, serta koordinat lokasi presensi jajaran Tata Usaha SMK Negeri 2 Konawe.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setIsQrScannerOpen(true)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer animate-pulse"
                        >
                          <QrCode className="h-4 w-4 text-slate-950" />
                          <span>Scanner QR Code Admin TU</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenWAShare("rekap-tu")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>Bagikan Laporan WA TU</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Cetak Laporan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowAddTuModal(true)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Input Log Manual TU</span>
                        </button>
                      </div>
                    </div>

                    {/* KPI RINGKASAN REKAP TU */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-indigo-800/40">
                      <div className="bg-indigo-950/60 border border-indigo-700/50 rounded-2xl p-3">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase block tracking-wider">Total Personel TU</span>
                        <span className="text-xl font-black text-white mt-0.5 block">{filteredTu.length} Personel</span>
                        <span className="text-[9px] text-indigo-300 block mt-0.5">Admin & Staf Terdata</span>
                      </div>

                      <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-2xl p-3">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase block tracking-wider">Jam Masuk (Clock-In)</span>
                        <span className="text-xl font-black text-emerald-300 mt-0.5 block">{tuHadirCount} Personel</span>
                        <span className="text-[9px] text-emerald-400 block mt-0.5">Sudah Hadir Di Kantor</span>
                      </div>

                      <div className="bg-purple-950/60 border border-purple-700/50 rounded-2xl p-3">
                        <span className="text-[10px] font-bold text-purple-300 uppercase block tracking-wider">Jam Pulang (Clock-Out)</span>
                        <span className="text-xl font-black text-purple-300 mt-0.5 block">{tuPulangCount} Personel</span>
                        <span className="text-[9px] text-purple-400 block mt-0.5">Selesai Jam Layanan</span>
                      </div>

                      <div className="bg-sky-950/60 border border-sky-700/50 rounded-2xl p-3">
                        <span className="text-[10px] font-bold text-sky-300 uppercase block tracking-wider">Tepat Waktu (&le; 07:30)</span>
                        <span className="text-xl font-black text-sky-300 mt-0.5 block">{tuTepatWaktuCount} Personel</span>
                        <span className="text-[9px] text-sky-400 block mt-0.5">{tuTerlambatCount} Terlambat</span>
                      </div>

                      <div className="bg-amber-950/60 border border-amber-700/50 rounded-2xl p-3 col-span-2 md:col-span-1">
                        <span className="text-[10px] font-bold text-amber-300 uppercase block tracking-wider">Verifikasi GPS Sah</span>
                        <span className="text-xl font-black text-amber-300 mt-0.5 block">{tuGpsValidCount} Valid</span>
                        <span className="text-[9px] text-amber-400 block mt-0.5">Radius &le; 100 Meter</span>
                      </div>
                    </div>
                  </div>

                  {/* 📲 KOTAK SIARAN WHATSAPP FONNTE KHUSUS GRUP TATA USAHA (PUKUL 09.00 WITA) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                          <Send className="h-4 w-4 text-emerald-600" />
                          <span>Laporan Presensi Harian Staf TU ke Grup WA (Pukul 09.00 WITA)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Target Grup WA: <code className="bg-slate-100 px-2 py-0.5 rounded text-indigo-700 font-mono font-bold">{getTuGroupTarget()}</code> | Bot otomatis menyiarkan laporan setiap hari tepat pukul 09.00 pagi.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Scheduler 09:00 Aktif
                        </span>
                      </div>
                    </div>

                    {/* WhatsApp Text Preview */}
                    <textarea
                      readOnly
                      rows={6}
                      value={tuDailyReport.messageText}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none scrollbar-thin"
                    />

                    {/* Feedback Message */}
                    {tuSendFeedback && (
                      <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                        tuSendFeedback.type === "success" 
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
                          : "bg-rose-50 border border-rose-200 text-rose-800"
                      }`}>
                        {tuSendFeedback.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />}
                        <span>{tuSendFeedback.text}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyTuText}
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-200"
                      >
                        <Copy className="h-4 w-4 text-indigo-600" />
                        <span>{copiedTuText ? "Berhasil Disalin!" : "Salin Format WA TU (09.00)"}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(tuDailyReport.messageText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all"
                          title="Kirim manual via WhatsApp Web"
                        >
                          <ExternalLink className="h-4 w-4 text-emerald-600" />
                          <span>Kirim Manual WA</span>
                        </a>

                        <button
                          type="button"
                          onClick={handleSendTuReportNow}
                          disabled={isSendingTuWa}
                          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Send className="h-4 w-4 fill-current" />
                          <span>
                            {isSendingTuWa 
                              ? "Menghubungkan ke Fonnte Gateway..." 
                              : "Kirim Laporan TU (Pukul 09.00) via Fonnte Sekarang 🚀"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* FILTER BAR FOR TU */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Filter Tanggal:</label>
                        <input
                          type="date"
                          value={tuDateFilter}
                          onChange={(e) => setTuDateFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Filter Status:</label>
                        <select
                          value={tuStatusFilter}
                          onChange={(e) => setTuStatusFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Semua Status">Semua Status</option>
                          <option value="Hadir">Hadir</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Izin">Izin</option>
                          <option value="Tanpa Keterangan">Tanpa Keterangan</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pencarian Nama / Role:</label>
                        <input
                          type="text"
                          placeholder="Cari Saktinani, Adelia, Admin TU..."
                          value={tuSearchQuery}
                          onChange={(e) => setTuSearchQuery(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTuDateFilter(new Date().toISOString().split("T")[0]);
                          setTuSearchQuery("");
                          setTuStatusFilter("Semua Status");
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  </div>

                  {/* MAIN TABLE: DETAIL PRESENSI ADMIN & STAF TATA USAHA */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                          <UserCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">
                            Daftar Presensi Harian Admin & Staf Tata Usaha
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Rincian jam masuk, jam pulang, verifikasi lokasi GPS, serta status kehadiran resmi
                          </p>
                        </div>
                      </div>

                      <span className="bg-indigo-50 text-indigo-700 text-xs font-black px-3 py-1 rounded-full">
                        {filteredTu.length} Data Ditampilkan
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider bg-slate-50">
                            <th className="py-3 pl-3">Nama & Jabatan TU</th>
                            <th className="py-3 text-center">NIP / ID</th>
                            <th className="py-3 text-center">Tanggal</th>
                            <th className="py-3 text-center">Jam Masuk (Clock-In)</th>
                            <th className="py-3 text-center">Jam Pulang (Clock-Out)</th>
                            <th className="py-3 text-center">Status Kehadiran</th>
                            <th className="py-3 text-center">Radius GPS Sekolah</th>
                            <th className="py-3 pr-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredTu.map((t) => {
                            const isLate = t.clockIn && t.clockIn > "07:30";
                            const isAdmin = t.teacherName.toLowerCase().includes("admin tu") || t.teacherName.toLowerCase().includes("sakti");

                            return (
                              <tr key={t.id} className="hover:bg-indigo-50/20 transition-colors">
                                <td className="py-3.5 pl-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shadow-xs ${
                                      isAdmin ? "bg-gradient-to-br from-indigo-600 to-indigo-800" : "bg-gradient-to-br from-sky-600 to-sky-800"
                                    }`}>
                                      {t.teacherName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="block font-black text-slate-900">{t.teacherName}</span>
                                      <span className={`inline-block px-2 py-0.25 rounded text-[9px] font-black uppercase tracking-wider mt-0.5 ${
                                        isAdmin ? "bg-indigo-100 text-indigo-800" : "bg-sky-100 text-sky-800"
                                      }`}>
                                        {isAdmin ? "Admin Tata Usaha" : "Staf Tata Usaha"}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 text-center font-mono text-slate-500 text-[11px]">
                                  {t.id}
                                </td>

                                <td className="py-3.5 text-center font-mono text-slate-700 font-bold">
                                  {t.date}
                                </td>

                                <td className="py-3.5 text-center font-mono">
                                  {t.clockIn ? (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="font-black text-slate-900 text-sm">{t.clockIn}</span>
                                      {isLate ? (
                                        <span className="text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.25 rounded font-black mt-0.5">TERLAMBAT</span>
                                      ) : (
                                        <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.25 rounded font-black mt-0.5">TEPAT WAKTU</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-medium italic">-</span>
                                  )}
                                </td>

                                <td className="py-3.5 text-center font-mono">
                                  {t.clockOut ? (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="font-black text-purple-700 text-sm">{t.clockOut}</span>
                                      <span className="text-[8px] bg-purple-100 text-purple-800 px-1.5 py-0.25 rounded font-black mt-0.5">SUDAH PULANG</span>
                                    </div>
                                  ) : t.clockIn ? (
                                    <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                      Sedang Bertugas
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-medium italic">-</span>
                                  )}
                                </td>

                                <td className="py-3.5 text-center">
                                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                    t.status === "Hadir" 
                                      ? "bg-emerald-100 text-emerald-800" 
                                      : t.status === "Sakit" || t.status === "Izin"
                                        ? "bg-indigo-100 text-indigo-800"
                                        : "bg-rose-100 text-rose-800"
                                  }`}>
                                    {t.status}
                                  </span>
                                </td>

                                <td className="py-3.5 text-center">
                                  {t.distanceMeter !== undefined ? (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="font-extrabold text-indigo-700 text-[11px] flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-indigo-600" />
                                        <span>{Math.round(t.distanceMeter)} m</span>
                                      </span>
                                      <span className="text-[8px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.25 rounded mt-0.5">
                                        Radius Valid
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-[10px] italic">Presensi Web Admin</span>
                                  )}
                                </td>

                                <td className="py-3.5 pr-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newIn = prompt(`Ubah Jam Masuk (Clock-In) untuk ${t.teacherName}:`, t.clockIn || "06:30");
                                        const newOut = prompt(`Ubah Jam Pulang (Clock-Out) untuk ${t.teacherName}:`, t.clockOut || "15:30");
                                        if (newIn !== null || newOut !== null) {
                                          handleUpdateTeacherClockTimes(t.id, newIn, newOut);
                                        }
                                      }}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                      title="Edit Jam Masuk / Pulang"
                                    >
                                      Edit Jam
                                    </button>

                                    {isSuperAdmin && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTeacherLog(t.id, t.teacherName)}
                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition-colors"
                                        title="Hapus Record TU"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {filteredTu.length === 0 && (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400 font-medium italic">
                                Belum ada record presensi Admin / Staf Tata Usaha untuk filter tanggal "{tuDateFilter}"
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* LAYANAN ADMINISTRASI & TUGAS POKOK TATA USAHA */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wider">
                        <FileText className="h-4 w-4" />
                        <span>Pengelolaan Persuratan Digital</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Pengarsipan resmi Surat Masuk, Surat Keluar, Disposisi Kepala Sekolah, dan Penerbitan Surat Tugas Guru & Staf SMK Negeri 2 Konawe.
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wider">
                        <CheckSquare className="h-4 w-4" />
                        <span>Verifikasi Presensi & Gaji</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Validasi harian kehadiran Guru Mapel, jam mengajar, jam piket, dan rekapitulasi kedisiplinan sebagai bahan laporan dinas pendidikan.
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-wider">
                        <Database className="h-4 w-4" />
                        <span>Sinkronisasi Data Dapodik</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Pembaruan berkala database murid, kualifikasi pendidik, inventaris sarana prasarana sekolah, serta integrasi SIHADIR Realtime.
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* TAB 1G: REKAP LAPORAN GURU PIKET */}
            {activeTabPanel === "rekap-piket" && (() => {
              const filteredPiket = guruPiketLogs.filter(p => {
                const matchesSearch = !piketSearchQuery || 
                  p.reporterName.toLowerCase().includes(piketSearchQuery.toLowerCase()) ||
                  p.classroomCheck.toLowerCase().includes(piketSearchQuery.toLowerCase()) ||
                  p.incidentNotes.toLowerCase().includes(piketSearchQuery.toLowerCase());
                const matchesShift = piketShiftFilter === "Semua Shift" || p.shift.toLowerCase().includes(piketShiftFilter.toLowerCase());
                const matchesDate = !piketDateFilter || p.date === piketDateFilter;
                const matchesStatus = piketStatusFilter === "Semua Status" || 
                  (piketStatusFilter === "Terverifikasi" && (p.status || "").toLowerCase().includes("verifikasi")) ||
                  (piketStatusFilter === "Kejadian Khusus" && p.incidentNotes && !p.incidentNotes.toLowerCase().startsWith("nihil"));
                return matchesSearch && matchesShift && matchesDate && matchesStatus;
              });

              const totalReports = guruPiketLogs.length;
              const verifiedCount = guruPiketLogs.filter(p => p.status && p.status.toLowerCase().includes("verifikasi")).length;
              const incidentCount = guruPiketLogs.filter(p => p.incidentNotes && !p.incidentNotes.toLowerCase().startsWith("nihil")).length;
              const pristineClassrooms = guruPiketLogs.filter(p => p.hygieneCondition.includes("Sangat Bersih")).length;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* HERO BANNER REKAP GURU PIKET */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/50 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>Sistem Pengawasan Piket Harian Sekolah</span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                          <span>Rekapitulasi Laporan Guru Piket & Jurnal Pengawasan</span>
                        </h3>
                        <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
                          Konsolidasi hasil pemantauan KBM, kondisi kelas, kebersihan, ketertiban gerbang, serta catatan kejadian khusus petugas piket yang diotorisasi penuh untuk Administrator Utama, Kepala Sekolah, Waka Kurikulum, dan Admin TU.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleOpenWAShare("rekap-piket")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>Bagikan WA Rekap Piket</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTabPanel("quick-submit");
                            setFormType("guru-piket");
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg hover:shadow-indigo-900/30 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Tambah Laporan Piket</span>
                        </button>
                      </div>
                    </div>

                    {/* METRICS ROW */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                        <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Total Laporan Piket</span>
                        <div className="text-2xl font-black text-white mt-1">{totalReports} <span className="text-xs font-normal text-slate-300">Entri</span></div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Terverifikasi Management</span>
                        <div className="text-2xl font-black text-emerald-400 mt-1">{verifiedCount} <span className="text-xs font-normal text-slate-300">Laporan</span></div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Kejadian Khusus / Catatan</span>
                        <div className="text-2xl font-black text-amber-300 mt-1">{incidentCount} <span className="text-xs font-normal text-slate-300">Kasus</span></div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                        <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider block">Kelas Bersih & Rapi</span>
                        <div className="text-2xl font-black text-sky-300 mt-1">{pristineClassrooms} <span className="text-xs font-normal text-slate-300">Area</span></div>
                      </div>
                    </div>
                  </div>

                  {/* FILTER BAR */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Cari pelapor, hasil pemantauan kelas, atau catatan..."
                          value={piketSearchQuery}
                          onChange={(e) => setPiketSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="date"
                          value={piketDateFilter}
                          onChange={(e) => setPiketDateFilter(e.target.value)}
                          className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        <select
                          value={piketShiftFilter}
                          onChange={(e) => setPiketShiftFilter(e.target.value)}
                          className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Semua Shift">Semua Shift</option>
                          <option value="Pagi">Shift Pagi</option>
                          <option value="Siang">Shift Siang</option>
                          <option value="Penuh">Shift Penuh</option>
                        </select>

                        <select
                          value={piketStatusFilter}
                          onChange={(e) => setPiketStatusFilter(e.target.value)}
                          className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Semua Status">Semua Status</option>
                          <option value="Terverifikasi">Terverifikasi</option>
                          <option value="Kejadian Khusus">Ada Kejadian Khusus</option>
                        </select>

                        {(piketSearchQuery || piketDateFilter || piketShiftFilter !== "Semua Shift" || piketStatusFilter !== "Semua Status") && (
                          <button
                            onClick={() => {
                              setPiketSearchQuery("");
                              setPiketDateFilter("");
                              setPiketShiftFilter("Semua Shift");
                              setPiketStatusFilter("Semua Status");
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Reset Filter
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TABLE DATA REKAP PIKET */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                        <h4 className="font-black text-slate-800 text-sm">Daftar Laporan Petugas Piket ({filteredPiket.length})</h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">Otorisasi: Administrator Utama / Kepsek / Kurikulum / TU</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] uppercase font-black tracking-wider text-slate-500 border-b border-slate-200">
                            <th className="py-3 pl-4">Tanggal & Shift</th>
                            <th className="py-3">Guru Petugas Piket</th>
                            <th className="py-3">Pemantauan Kelas & KBM</th>
                            <th className="py-3">Kondisi Lingkungan</th>
                            <th className="py-3">Catatan Kejadian</th>
                            <th className="py-3 text-center">Status Verifikasi</th>
                            <th className="py-3 pr-4 text-right">Aksi Management</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredPiket.map((p) => {
                            const isVerified = (p.status || "").toLowerCase().includes("verifikasi");
                            const hasIncident = p.incidentNotes && !p.incidentNotes.toLowerCase().startsWith("nihil");

                            return (
                              <tr key={p.id} className="hover:bg-indigo-50/20 transition-colors">
                                <td className="py-3.5 pl-4 whitespace-nowrap">
                                  <div className="font-bold text-slate-900">{p.date || new Date().toISOString().split("T")[0]}</div>
                                  <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 mt-0.5">
                                    {p.shift}
                                  </span>
                                </td>

                                <td className="py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                      {p.reporterName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="block font-black text-slate-900">{p.reporterName}</span>
                                      <span className="text-[10px] text-slate-500 font-medium">Petugas Piket Resmi</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 max-w-xs">
                                  <p className="text-slate-700 font-medium text-xs leading-relaxed">
                                    {p.classroomCheck}
                                  </p>
                                </td>

                                <td className="py-3.5 whitespace-nowrap">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[11px]">
                                      <span className="text-slate-400 font-medium">Kebersihan:</span>
                                      <span className="font-bold text-slate-800">{p.hygieneCondition}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px]">
                                      <span className="text-slate-400 font-medium">Keamanan:</span>
                                      <span className="font-bold text-slate-800">{p.securityCondition}</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 max-w-xs">
                                  <span className={`inline-block text-xs font-semibold p-2 rounded-xl border ${
                                    hasIncident 
                                      ? "bg-amber-50 text-amber-900 border-amber-200" 
                                      : "bg-slate-50 text-slate-600 border-slate-100"
                                  }`}>
                                    {p.incidentNotes}
                                  </span>
                                </td>

                                <td className="py-3.5 text-center whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                    isVerified
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse"
                                  }`}>
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>{p.status || "Terverifikasi Waka/Admin"}</span>
                                  </span>
                                </td>

                                <td className="py-3.5 pr-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyPiketLog(p.id)}
                                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer"
                                      title="Verifikasi Laporan Guru Piket"
                                    >
                                      Verifikasi
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePiketLog(p.id)}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                      title="Hapus Laporan Guru Piket"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {filteredPiket.length === 0 && (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400 font-medium italic">
                                Belum ada data Laporan Guru Piket yang cocok dengan kriteria filter saat ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* TAB: PENGATURAN FONNTE WHATSAPP GATEWAY */}
            {activeTabPanel === "fonnte-config" && (
              <motion.div
                key="tab-fonnte-config"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* HEADER BANNER */}
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Fonnte WhatsApp API Hub SMK Negeri 2 Konawe</span>
                      </div>
                      <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                        <span>Konfigurasi WhatsApp Gateway & Otomatisasi Terjadwal</span>
                      </h3>
                      <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
                        Kelola token Fonnte, target Grup WA Guru (laporan pergantian jam), Grup WA Tata Usaha (laporan 09.00 pagi), serta nomor darurat Admin TU dan Guru BK untuk notifikasi langsung saat murid scan QR atau absensi manual.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveFonnteSettings}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg hover:shadow-emerald-900/40 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Simpan Semua Konfigurasi</span>
                    </button>
                  </div>

                  {/* STATUS AUTOMATION ROW */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-800/40 text-xs">
                    <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-2xl p-3 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-[11px]">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Laporan Khusus Guru</span>
                      </div>
                      <p className="text-[10px] text-slate-300">
                        Otomatis dikirim ke Grup WA Guru setiap <strong>pergantian jam pelajaran</strong>.
                      </p>
                    </div>

                    <div className="bg-indigo-900/30 border border-indigo-700/40 rounded-2xl p-3 space-y-1">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold text-[11px]">
                        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span>Laporan Tata Usaha (09:00)</span>
                      </div>
                      <p className="text-[10px] text-slate-300">
                        Otomatis dikompilasi & dikirim 1x sehari setiap <strong>pukul 09.00 WITA</strong>.
                      </p>
                    </div>

                    <div className="bg-purple-900/30 border border-purple-700/40 rounded-2xl p-3 space-y-1">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-[11px]">
                        <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                        <span>Notifikasi Instan Murid</span>
                      </div>
                      <p className="text-[10px] text-slate-300">
                        Realtime ke <strong>WA Admin TU & Guru BK</strong> saat scan barcode / manual.
                      </p>
                    </div>
                  </div>
                </div>

                {/* TEST SEND FEEDBACK BANNER */}
                {testSendResult && (
                  <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-sm ${
                    testSendResult.success 
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
                      : "bg-rose-50 border border-rose-200 text-rose-800"
                  }`}>
                    <div className="flex items-center gap-2">
                      {testSendResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />}
                      <span>{testSendResult.msg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTestSendResult(null)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* MAIN CONFIGURATION CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* CARD 1: TOKEN FONNTE */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                          1. API Token Fonnte (Gateway Key)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Kunci otorisasi resmi akun Fonnte Anda untuk penyiaran pesan WhatsApp
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Fonnte API Key:
                      </label>
                      <input
                        type="text"
                        value={fonnteApiKey}
                        onChange={(e) => setFonnteApiKey(e.target.value)}
                        placeholder="Contoh: LMJoXs8WD3g78VGgFuTM"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Kunci ini digunakan oleh proxy server <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">/api/whatsapp/send</code> untuk menyiarkan laporan langsung ke WhatsApp tanpa membuka jendela peramban.
                      </p>
                    </div>
                  </div>

                  {/* CARD 2: GRUP WA GURU (PERGANTIAN JAM) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                            2. Target Grup WA Guru
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Laporan absensi guru setiap pergantian jam pelajaran
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Target ID Grup WhatsApp Guru:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={fonnteTarget}
                          onChange={(e) => setFonnteTarget(e.target.value)}
                          placeholder="Contoh: 120363223018241031@g.us"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleTestSendTarget(fonnteTarget, "Grup WA Guru")}
                          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap border border-indigo-200 shrink-0"
                        >
                          Tes Kirim
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        ID Grup WA Fonnte berakhiran <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">@g.us</code> atau nomor pengawas.
                      </p>
                    </div>
                  </div>

                  {/* CARD 3: GRUP WA TATA USAHA (09.00 WITA) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                            3. Target Grup WA Tata Usaha
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Laporan rekap presensi seluruh staf TU tepat pukul 09.00 pagi
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Target ID Grup WhatsApp TU:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={fonnteTuTarget}
                          onChange={(e) => setFonnteTuTarget(e.target.value)}
                          placeholder="Contoh: 120363223018241031@g.us"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleTestSendTarget(fonnteTuTarget, "Grup WA Tata Usaha")}
                          className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap border border-purple-200 shrink-0"
                        >
                          Tes Kirim
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Scheduler otomatis akan menyiarkan rekap kehadiran jajaran TU ke target ini tepat pukul 09.00 WITA.
                      </p>
                    </div>
                  </div>

                  {/* CARD 4: NOTIFIKASI INSTAN MURID (ADMIN TU & GURU BK) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                            4. Nomor WA Admin TU & Guru BK
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Penerima notifikasi instan langsung saat murid presensi QR / manual
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Nomor WhatsApp Admin Tata Usaha:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={fonnteAdminTuNumber}
                            onChange={(e) => setFonnteAdminTuNumber(e.target.value)}
                            placeholder="Contoh: 085241445566"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleTestSendTarget(fonnteAdminTuNumber, "Admin Tata Usaha")}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap border border-amber-200 shrink-0"
                          >
                            Tes WA TU
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Nomor WhatsApp Guru BK (Bimbingan Konseling):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={fonnteGuruBkNumber}
                            onChange={(e) => setFonnteGuruBkNumber(e.target.value)}
                            placeholder="Contoh: 085322223333"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleTestSendTarget(fonnteGuruBkNumber, "Guru BK")}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap border border-amber-200 shrink-0"
                          >
                            Tes WA BK
                          </button>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400">
                        Setiap kali ada murid yang scan barcode atau dicatat izin/sakit/alfa, ringkasan instan langsung masuk ke nomor WhatsApp ini.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BOTTOM SAVE BUTTON */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveFonnteSettings}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Simpan Seluruh Pengaturan Fonnte WhatsApp</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB: STATUS DATABASE CLOUD FIREBASE */}
            {activeTabPanel === "firebase-config" && (
              <motion.div
                key="tab-firebase-config"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/40 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-600 text-white">
                      <Database className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                        <span>Database Cloud Firestore SMK Negeri 2 Konawe</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isFirebaseConfigured() ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}>
                          {isFirebaseConfigured() ? "TERHUBUNG (ONLINE)" : "MODE LOCALSTORAGE OFFLINE"}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300">
                        Seluruh entri presensi murid, guru, jurnal KBM, dan log guru piket otomatis dicadangkan dan disinkronkan secara aman.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Statistik Koleksi Data Terhubung
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Log Murid</span>
                      <span className="text-lg font-black text-slate-900">{studentLogs.length} Sesi Kelas</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Log Guru</span>
                      <span className="text-lg font-black text-slate-900">{teacherLogs.length} Presensi</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Jurnal Mengajar</span>
                      <span className="text-lg font-black text-slate-900">{journals.length} Jurnal</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Laporan Piket</span>
                      <span className="text-lg font-black text-slate-900">{guruPiketLogs.length} Laporan</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

      {/* WHATSAPP GROUP SIMULATOR MODAL (Pusat Penyiaran Laporan) */}
      <AnimatePresence>
        {showWASimulator && (
          <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
                    WA
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-100">Grup WA Guru SMK Negeri 2 Konawe</h4>
                    <span className="text-[10px] text-emerald-400">Pratinjau Integrasi Gateway WhatsApp</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWASimulator(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full p-1.5 cursor-pointer"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Draf Laporan Terformat:</label>
                  <span className="bg-emerald-950 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded border border-emerald-900/40">
                    Real-time Gateway Sync
                  </span>
                </div>
                <textarea 
                  value={waMessageDraft}
                  onChange={(e) => setWaMessageDraft(e.target.value)}
                  rows={13}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-2xl p-4 w-full font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(waMessageDraft);
                      triggerToast("Teks laporan disalin ke clipboard!");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Salin Teks
                  </button>

                  <button
                    type="button"
                    onClick={handleSendToRealWA}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                    title="Kirim secara manual menggunakan WhatsApp Web"
                  >
                    WA Web (Manual)
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isSendingWA}
                  onClick={handleSendToFonnteWA}
                  className={`text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                    isSendingWA ? "bg-emerald-800 cursor-not-allowed opacity-80" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isSendingWA ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>Menyiarkan...</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 text-white" />
                      <span>Siarkan via Fonnte Gateway</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PHOTO VERIFICATION ZOOM MODAL */}
      <AnimatePresence>
        {viewSelfieModalUrl && (
          <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50" onClick={() => setViewSelfieModalUrl(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-850 text-white rounded-3xl p-5 w-full max-w-lg shadow-2xl space-y-4 relative"
            >
              <button
                onClick={() => setViewSelfieModalUrl(null)}
                className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full p-1.5 cursor-pointer z-10 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
              
              <div className="border-b border-slate-800 pb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-400" />
                <h4 className="text-xs font-black uppercase text-slate-100 tracking-wider">Verifikasi Foto Selfie Murid</h4>
              </div>

              <div className="w-full h-[360px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                <img src={viewSelfieModalUrl} alt="Selfie Zoomed" className="w-full h-full object-contain" />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Status: Terverifikasi Atribut Seragam Lengkap</span>
                <button
                  onClick={() => setViewSelfieModalUrl(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase px-4 py-1.5 rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 bg-slate-950/85 flex items-center justify-center p-4 z-55 animate-fade-in" onClick={() => setConfirmModal(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 relative"
            >
              <button
                onClick={() => setConfirmModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-1.5 cursor-pointer z-10 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-2 text-rose-600 border-b border-slate-100 pb-2">
                <AlertCircle className="h-5 w-5 animate-bounce" />
                <h4 className="text-xs font-black uppercase tracking-wider">{confirmModal.title}</h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {confirmModal.message}
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase px-4 py-2 rounded-xl cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL INPUT MANUAL PRESENSI ADMIN & STAF TATA USAHA */}
        {showAddTuModal && (
          <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 border border-slate-200"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Input Manual Presensi Tata Usaha</h4>
                    <p className="text-[11px] text-slate-500">Tambah / koreksi kehadiran Admin & Staf TU</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTuModal(false)}
                  className="bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full p-1.5 cursor-pointer"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Pilih / Input Nama Personel TU:
                  </label>
                  <select
                    value={newTuFormName}
                    onChange={(e) => setNewTuFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                  >
                    <option value="Saktinani Djunaid, S.Sos. (Admin TU)">Saktinani Djunaid, S.Sos. (Admin TU)</option>
                    <option value="Adelia Pusparini, A.Md. (Staf TU)">Adelia Pusparini, A.Md. (Staf TU)</option>
                    <option value="Lainnya">Lainnya (Ketik Manual)</option>
                  </select>

                  {newTuFormName === "Lainnya" && (
                    <input
                      type="text"
                      placeholder="Masukkan Nama Personel TU Lengkap + Gelar"
                      onChange={(e) => setNewTuFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Jabatan / Subbagian:
                    </label>
                    <select
                      value={newTuFormRole}
                      onChange={(e) => setNewTuFormRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Admin TU">Admin TU</option>
                      <option value="Staf TU">Staf TU</option>
                      <option value="Bendahara Sekolah">Bendahara Sekolah</option>
                      <option value="Operator DAPODIK">Operator DAPODIK</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Tanggal Presensi:
                    </label>
                    <input
                      type="date"
                      value={newTuFormDate}
                      onChange={(e) => setNewTuFormDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Jam Masuk (Clock-In):
                    </label>
                    <input
                      type="time"
                      value={newTuFormClockIn}
                      onChange={(e) => setNewTuFormClockIn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Jam Pulang (Clock-Out):
                    </label>
                    <input
                      type="time"
                      value={newTuFormClockOut}
                      onChange={(e) => setNewTuFormClockOut(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Status Kehadiran:
                    </label>
                    <select
                      value={newTuFormStatus}
                      onChange={(e) => setNewTuFormStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Izin">Izin</option>
                      <option value="Tanpa Keterangan">Tanpa Keterangan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Estimasi Radius GPS (Meter):
                    </label>
                    <input
                      type="number"
                      value={newTuFormDistance}
                      onChange={(e) => setNewTuFormDistance(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTuModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddTuLogManualSubmit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Simpan Log TU
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Bagikan Link Presensi Murid */}
      <AnimatePresence>
        {isShareLinkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-800"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">Bagikan Tautan Presensi Murid</h3>
                    <p className="text-xs text-slate-500">Kirim tautan presensi mandiri ke murid agar langsung terisi & terekap otomatis di dashboard ini.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareLinkModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Share URL Box */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Tautan Langsung Presensi Murid:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${window.location.pathname}?mode=absen_siswa`}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}${window.location.pathname}?mode=absen_siswa`;
                      navigator.clipboard.writeText(link);
                      setCopyLinkSuccess(true);
                      setTimeout(() => setCopyLinkSuccess(false), 2500);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all shrink-0 cursor-pointer shadow-sm ${
                      copyLinkSuccess ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copyLinkSuccess ? "Tersalin! ✓" : "Salin Link"}</span>
                  </button>
                </div>
              </div>

              {/* Direct WhatsApp Share Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const link = `${window.location.origin}${window.location.pathname}?mode=absen_siswa`;
                    const waText = encodeURIComponent(
                      `*LINK PRESENSI HARIAN MURID SMK NEGERI 2 KONAWE* 📲\n\n` +
                      `Halo murid-murid SMK Negeri 2 Konawe, silakan lakukan presensi masuk/pulang hari ini melalui tautan resmi:\n` +
                      `👉 ${link}\n\n` +
                      `*Langkah Pengisian:*\n` +
                      `1. Buka tautan di atas melalui browser HP (Chrome/Safari).\n` +
                      `2. Pilih Jurusan, Kelas, dan Nama Lengkap Anda.\n` +
                      `3. Masukkan NISN Anda sebagai kata sandi.\n` +
                      `4. Lakukan pengambilan foto selfie berseragam rapi & pastikan GPS diaktifkan.\n` +
                      `5. Klik "Simpan Presensi". Hasil presensi otomatis terekap langsung di dashboard Guru Pengajar & Admin Tata Usaha SMK Negeri 2 Konawe!`
                    );
                    window.open(`https://api.whatsapp.com/send?text=${waText}`, "_blank");
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Kirim Tautan ke Grup WhatsApp Murid / Kelas</span>
                </button>
              </div>

              {/* Informative Guidance */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-600">
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                  Sinkronisasi Real-Time Cloud Firestore
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                  <li>Setiap presensi yang di-submit murid langsung terunggah ke Cloud Firestore.</li>
                  <li>Laporan di tab <strong>Rekap Presensi Murid</strong>, <strong>Selfie Mandiri Murid</strong>, dan <strong>Absensi Masuk & Pulang</strong> otomatis ter-update tanpa perlu refresh halaman.</li>
                  <li>Bukti foto selfie wearpack murid, jam masuk, jam pulang, dan koordinat GPS tersimpan aman.</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareLinkModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal for Admin TU */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        role="Admin Tata Usaha"
      />

      {/* Modal Rekapitulasi Presensi Terpadu 15.00 WITA */}
      <Comprehensive15WitaReportModal
        isOpen={isComprehensive15ModalOpen}
        onClose={() => setIsComprehensive15ModalOpen(false)}
      />

    </div>
  );
}
