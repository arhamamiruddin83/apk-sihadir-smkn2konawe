import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Shield, Save, Edit2, Phone, MapPin, Calendar, 
  Award, BookOpen, Users, ClipboardList, Briefcase, FileText, 
  MessageSquare, Plus, CheckCircle, RefreshCw, AlertCircle, FileCheck,
  ChevronRight, ArrowRight, BookMarked, UserCheck, Trash2, Send, Clock, Sparkles,
  Megaphone, Bell, Cake, PartyPopper, ShieldAlert, Pin, CheckCircle2, Filter, AlertTriangle, Layers,
  HeartHandshake
} from "lucide-react";
import { compressImageFile } from "../lib/imageCompressor";
import BirthDateSelector from "./BirthDateSelector";
import { TeacherScheduleAndWAAlarm } from "./TeacherScheduleAndWAAlarm";
import { GrupGuruWaliBinaanSection } from "./GrupGuruWaliBinaanSection";
import { getMasterGuruWaliData } from "../data/guruWaliMasterData";
import { getTeacherPhoto, syncTeacherProfileUpdate } from "../services/teacherService";

interface TeacherProfile {
  fullName: string;
  nip: string;
  classesTaught: string;
  birthInfo: string;
  whatsapp: string;
  address: string;
  subject: string;
  additionalDuty: string[];
  photoUrl?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  category: "Pengumuman Mutlak" | "Kebijakan Sekolah" | "Kurikulum & KBM" | "Kedisiplinan & Kesiswaan" | "Informasi Umum";
  content: string;
  publisherName: string;
  publisherRole: string;
  publisherRoleKey: string;
  targetAudience: string;
  createdAt: string;
  isMutlak?: boolean;
}

interface TeacherDashboardProps {
  username: string;
  currentRole: string;
  onNavigateToTab?: (tab: string) => void;
}

export function TeacherDashboard({ username, currentRole, onNavigateToTab }: TeacherDashboardProps) {
  // 1. Load active profile based on username
  const profileKey = `sihadir_teacher_profile_${username.trim().toLowerCase() || "default"}`;
  
  const getInitialProfile = (): TeacherProfile => {
    const saved = localStorage.getItem(profileKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.additionalDuty === "string") {
          if (parsed.additionalDuty === "Tidak Ada") {
            parsed.additionalDuty = [];
          } else {
            parsed.additionalDuty = [parsed.additionalDuty];
          }
        } else if (!parsed.additionalDuty) {
          parsed.additionalDuty = [];
        }

        // Sanitize additional duties according to permissions
        const u = (username || "").trim().toLowerCase();
        const f = (parsed.fullName || "").trim().toLowerCase();
        const isAsrul = u.includes("asrul") || f.includes("asrul") || u === "kurikulum";
        const isNyoman = u.includes("suliawati") || f.includes("suliawati") || u.includes("nyoman") || f.includes("nyoman") || u === "kesiswaan";
        const isCici = u.includes("cici") || f.includes("cici") || u === "bk" || u.includes("suci") || f.includes("suci") || currentRole === "bk";
        const isYoga = u.includes("yoga") || f.includes("yoga");
        const isBk = isCici || isYoga || u.includes("bk") || f.includes("bk") || u.includes("konselor") || f.includes("konselor") || currentRole === "bk" || (parsed.subject && (parsed.subject.toLowerCase().includes("bk") || parsed.subject.toLowerCase().includes("bimbingan")));

        parsed.additionalDuty = (parsed.additionalDuty || []).filter((duty: string) => {
          if (duty === "Waka Kesiswaan" && isAsrul) {
            return false;
          }
          if (duty === "Waka Kurikulum" && isNyoman) {
            return false;
          }
          if ((duty === "Waka Kurikulum" || duty === "Waka Kesiswaan") && !isAsrul && !isNyoman) {
            return false;
          }
          if (duty === "Guru BK" && !isBk) {
            return false;
          }
          if ((duty === "Guru Mata Pelajaran" || duty === "Guru Mapel") && isBk) {
            return false;
          }
          return true;
        });

        if (isBk) {
          parsed.subject = "Bimbingan Konseling (BK)";
          if (!parsed.additionalDuty.includes("Guru BK")) {
            parsed.additionalDuty.push("Guru BK");
          }
        }

        const isTriana = (u.includes("daniel") || u.includes("triana")) && !u.includes("eva");
        if (isTriana) {
          parsed.fullName = "TRIANA DANIEL, S.Pd.";
          parsed.nip = "19920113 201701 2 025";
          parsed.subject = "Bahasa Inggris";
          if (!parsed.classesTaught || parsed.classesTaught.includes("TAV")) {
            parsed.classesTaught = "X TSM, XI TSM B, XI TSM A, XI TKR B, XII TSM A, X TKR A, XI DKV, XI DPIB";
          }
        }
        const isEva = u.includes("eva") || u.includes("syahtriana") || u.includes("evasyatriana");
        if (isEva) {
          parsed.fullName = "EVASYAHTRIANA, S.Si";
          parsed.nip = "19930909 201801 2 009";
          parsed.subject = "IPAS";
          if (!parsed.classesTaught || parsed.classesTaught.includes("TKR")) {
            parsed.classesTaught = "X TSM, XI TAV, X DKV, X DPIB";
          }
        }

        if (!parsed.photoUrl) {
          parsed.photoUrl = getTeacherPhoto(username) || getTeacherPhoto(parsed.fullName) || (parsed.nip ? getTeacherPhoto(parsed.nip) : "") || "";
        }
        return parsed;
      } catch (e) {
        console.error("Error reading teacher profile", e);
      }
    }

    // Default profiles
    const cleanUser = username.trim().toLowerCase();
    if (cleanUser === "arham" || (cleanUser === "admin" && !currentRole.includes("tu")) || cleanUser.includes("arham")) {
      return {
        fullName: "ARHAM AMIRUDDIN",
        nip: "19890505 201401 1 005",
        classesTaught: "Semua Kelas X, XI & XII",
        birthInfo: "Konawe, 5 Mei 1989",
        whatsapp: "081234567806",
        address: "Jl. Poros Utama SMK Negeri 2 Konawe, Unaaha",
        subject: "Admin Utama",
        additionalDuty: ["Administrator Utama"]
      };
    } else if (cleanUser.includes("sakti") || cleanUser.includes("saktinani")) {
      return {
        fullName: "SAKTINANI DJUNAID",
        nip: "19900518 201503 2 002",
        classesTaught: "Semua Kelas X, XI & XII",
        birthInfo: "Konawe, 18 Mei 1990",
        whatsapp: "085711112222",
        address: "Jl. Poros Unaaha No. 12, Konawe",
        subject: "Admin Tata Usaha (TU)",
        additionalDuty: []
      };
    } else if (cleanUser.includes("adelia") || cleanUser.includes("pusparini")) {
      return {
        fullName: "ADELIA PUSPARINI",
        nip: "19920714 201604 2 003",
        classesTaught: "Semua Kelas X, XI & XII",
        birthInfo: "Konawe, 14 Juli 1992",
        whatsapp: "085722223333",
        address: "Jl. Poros Unaaha No. 12, Konawe",
        subject: "Admin Tata Usaha (TU)",
        additionalDuty: []
      };
    } else if (cleanUser === "tu") {
      return {
        fullName: "SAKTINANI DJUNAID",
        nip: "19900518 201503 2 002",
        classesTaught: "Semua Kelas X, XI & XII",
        birthInfo: "Konawe, 18 Mei 1990",
        whatsapp: "085711112222",
        address: "Jl. Poros Unaaha No. 12, Konawe",
        subject: "Admin Tata Usaha (TU)",
        additionalDuty: []
      };
    } else if (cleanUser === "kepsek" || cleanUser.includes("manan") || currentRole === "kepsek") {
      return {
        fullName: "Drs. H. ABD. MANAN, M.M.",
        nip: "19650812 199003 1 008",
        classesTaught: "-",
        birthInfo: "Konawe, 12 Agustus 1965",
        whatsapp: "081234567809",
        address: "Jl. Poros Unaaha No. 01, Konawe",
        subject: "Kepala Sekolah",
        additionalDuty: []
      };
    } else if (cleanUser === "suci" || cleanUser === "bk" || cleanUser.includes("cici") || cleanUser.includes("yoga")) {
      const isYoga = cleanUser.includes("yoga");
      const isCici = cleanUser.includes("cici");
      return {
        fullName: isYoga ? "YOGA, S.Pd. (Guru BK)" : isCici ? "CICI, S.Pd. (Guru BK)" : "Guru Bimbingan Konseling (BK)",
        nip: isYoga ? "19920814 201903 1 004" : "19890915 201402 2 003",
        classesTaught: "Semua Kelas X, XI & XII",
        birthInfo: isYoga ? "Konawe, 14 Agustus 1992" : "Konawe, 15 September 1989",
        whatsapp: "085322223333",
        address: "Perumahan Dosen Unaaha Blok C-2, Konawe",
        subject: "Bimbingan Konseling (BK)",
        additionalDuty: ["Guru BK"]
      };
    } else if ((cleanUser.includes("daniel") || cleanUser.includes("triana")) && !cleanUser.includes("eva") && !cleanUser.includes("syah")) {
      return {
        fullName: "TRIANA DANIEL, S.Pd.",
        nip: "19920113 201701 2 025",
        classesTaught: "X TSM, XI TSM B, XI TSM A, XI TKR B, XII TSM A, X TKR A, XI DKV, XI DPIB",
        birthInfo: "Konawe, 13 Januari 1992",
        whatsapp: "081234567834",
        address: "Jl. Poros Unaaha No. 34, Konawe",
        subject: "Bahasa Inggris",
        additionalDuty: ["Wali Kelas XI TSM B", "Guru Mapel Bahasa Inggris"]
      };
    } else if (cleanUser.includes("eva") || cleanUser.includes("syahtriana") || cleanUser.includes("evasyatriana")) {
      return {
        fullName: "EVASYAHTRIANA, S.Si",
        nip: "19930909 201801 2 009",
        classesTaught: "X TSM, XI TAV, X DKV, X DPIB",
        birthInfo: "Konawe, 9 September 1993",
        whatsapp: "081234567811",
        address: "Jl. Poros Unaaha No. 11, Konawe",
        subject: "IPAS",
        additionalDuty: ["Wali Kelas XI DPIB", "Guru Mapel IPAS"]
      };
    }

    // Generic fallback
    const resolvedFallbackPhoto = getTeacherPhoto(username) || getTeacherPhoto(cleanUser) || "";
    return {
      fullName: username || "Guru SMK Negeri 2 Konawe",
      nip: "19910523 201802 1 023",
      classesTaught: "XI TKR A",
      birthInfo: "Konawe, 23 Mei 1991",
      whatsapp: "081299887766",
      address: "Jl. Melati No. 10, Unaaha, Konawe",
      subject: "Teknik Sepeda Motor (Produktif)",
      additionalDuty: [],
      photoUrl: resolvedFallbackPhoto
    };
  };

  const [profile, setProfile] = useState<TeacherProfile>(getInitialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<TeacherProfile>(profile);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGrupWaliModalOpen, setIsGrupWaliModalOpen] = useState(false);
  const [showInlineGuruWaliPreview, setShowInlineGuruWaliPreview] = useState(false);

  const masterGuruWaliData = useMemo(() => getMasterGuruWaliData(), []);

  const currentGuruWaliGroup = useMemo(() => {
    const teacherName = editedProfile?.fullName || profile.fullName || username;
    if (!teacherName) return masterGuruWaliData[0] || null;
    const cleanCurrent = teacherName.toLowerCase().replace(/[^a-z0-9]/g, "");

    const found = masterGuruWaliData.find(g => {
      const cleanG = g.namaGuru.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cleanG.includes(cleanCurrent) || cleanCurrent.includes(cleanG);
    });
    if (found) return found;

    if (cleanCurrent.includes("arham") || cleanCurrent.includes("amiruddin")) {
      const a = masterGuruWaliData.find(g => g.namaGuru.toLowerCase().includes("arham"));
      if (a) return a;
    }
    if (cleanCurrent.includes("muslimin")) {
      const m = masterGuruWaliData.find(g => g.namaGuru.toLowerCase().includes("muslimin"));
      if (m) return m;
    }
    if (cleanCurrent.includes("haerul")) {
      const h = masterGuruWaliData.find(g => g.namaGuru.toLowerCase().includes("haerul"));
      if (h) return h;
    }
    if (cleanCurrent.includes("putu") || cleanCurrent.includes("juniasa")) {
      const p = masterGuruWaliData.find(g => g.namaGuru.toLowerCase().includes("putu"));
      if (p) return p;
    }
    return masterGuruWaliData[0] || null;
  }, [editedProfile?.fullName, profile.fullName, username, masterGuruWaliData]);

  const isArhamAmiruddin = (() => {
    const u = (username || "").trim().toLowerCase();
    const f = (profile.fullName || "").trim().toLowerCase();
    return u === "arham" || u === "admin" || u === "alam" || u.includes("arham") || f.includes("arham");
  })();

  const isAndiAsrul = (() => {
    const u = (username || "").trim().toLowerCase();
    const f = (profile.fullName || "").trim().toLowerCase();
    return u.includes("asrul") || f.includes("asrul") || u === "kurikulum";
  })();

  const isNyomanSuliawati = (() => {
    const u = (username || "").trim().toLowerCase();
    const f = (profile.fullName || "").trim().toLowerCase();
    return u.includes("suliawati") || f.includes("suliawati") || u.includes("nyoman") || f.includes("nyoman") || u === "kesiswaan";
  })();

  const isBkTeacher = (() => {
    const u = (username || "").trim().toLowerCase();
    const f = (profile.fullName || "").trim().toLowerCase();
    const ef = (editedProfile?.fullName || "").trim().toLowerCase();
    const r = (currentRole || "").trim().toLowerCase();
    const s = (profile.subject || "").trim().toLowerCase();
    const es = (editedProfile?.subject || "").trim().toLowerCase();
    const duties = profile?.additionalDuty || [];
    return (
      u.includes("cici") || f.includes("cici") || ef.includes("cici") ||
      u.includes("yoga") || f.includes("yoga") || ef.includes("yoga") ||
      u.includes("suci") || f.includes("suci") || ef.includes("suci") ||
      u.includes("bk") || f.includes("bk") || ef.includes("bk") ||
      u.includes("konselor") || f.includes("konselor") || ef.includes("konselor") ||
      r.includes("bk") || r.includes("konselor") ||
      s.includes("bk") || es.includes("bk") ||
      s.includes("bimbingan") || es.includes("bimbingan") ||
      duties.includes("Guru BK")
    );
  })();

  const isBuCici = (() => {
    const u = (username || "").trim().toLowerCase();
    const f = (profile.fullName || "").trim().toLowerCase();
    const ef = (editedProfile?.fullName || "").trim().toLowerCase();
    const r = (currentRole || "").trim().toLowerCase();
    return u.includes("cici") || f.includes("cici") || ef.includes("cici") || u.includes("suci") || f.includes("suci") || ef.includes("suci") || u.includes("bk") || r === "bk" || isBkTeacher;
  })();

  const isPakYoga = (() => {
    const u = (username || "").trim().toLowerCase();
    const f = (profile.fullName || "").trim().toLowerCase();
    const ef = (editedProfile?.fullName || "").trim().toLowerCase();
    return u.includes("yoga") || f.includes("yoga") || ef.includes("yoga") || isBkTeacher;
  })();

  const isBkUser = isBuCici || isPakYoga || isBkTeacher;

  const isTuUser = (() => {
    const u = (username || "").trim().toLowerCase();
    const f = (profile.fullName || "").trim().toLowerCase();
    const ef = (editedProfile?.fullName || "").trim().toLowerCase();
    const r = (currentRole || "").trim().toLowerCase();
    const s = (profile.subject || "").trim().toLowerCase();
    return (
      r === "tu" ||
      r.includes("tata usaha") ||
      u === "tu" ||
      u.includes("sakti") ||
      u.includes("adelia") ||
      f.includes("tata usaha") ||
      ef.includes("tata usaha") ||
      s.includes("tata usaha")
    );
  })();

  const isKepsekUser = (() => {
    const u = (username || "").trim().toLowerCase();
    const f = (profile.fullName || "").trim().toLowerCase();
    const ef = (editedProfile?.fullName || "").trim().toLowerCase();
    const r = (currentRole || "").trim().toLowerCase();
    const s = (profile.subject || "").trim().toLowerCase();
    return (
      r === "kepsek" ||
      r.includes("kepala sekolah") ||
      u === "kepsek" ||
      u.includes("manan") ||
      f.includes("kepala sekolah") ||
      ef.includes("kepala sekolah") ||
      s.includes("kepala sekolah")
    );
  })();

  const isSaktiOrAdelia = (() => {
    const u = (username || "").toLowerCase();
    const f = (profile?.fullName || "").toLowerCase();
    const ef = (editedProfile?.fullName || "").toLowerCase();
    return (
      u.includes("sakti") || u.includes("adelia") || u.includes("saktinani") || u.includes("pusparini") ||
      f.includes("sakti") || f.includes("adelia") || f.includes("saktinani") || f.includes("pusparini") ||
      ef.includes("sakti") || ef.includes("adelia") || ef.includes("saktinani") || ef.includes("pusparini")
    );
  })();

  // Sync profile info to specific storage and contextual keys safely
  useEffect(() => {
    if (!profile) return;
    const currentStoredRaw = localStorage.getItem(profileKey);
    let toStore = { ...profile };
    if (currentStoredRaw) {
      try {
        const parsed = JSON.parse(currentStoredRaw);
        if (!toStore.photoUrl && parsed.photoUrl) {
          toStore.photoUrl = parsed.photoUrl;
        }
      } catch (e) {}
    }
    localStorage.setItem(profileKey, JSON.stringify(toStore));
    // Set active teacher details for the currently active session
    if (username) {
      localStorage.setItem(`sihadir_teacher_profile_${username.trim().toLowerCase()}`, JSON.stringify(toStore));
    }
  }, [profile, profileKey, username]);

  const handleStartEdit = () => {
    let initial = { ...profile };
    if (isBkUser) {
      initial.subject = "Bimbingan Konseling (BK)";
      initial.additionalDuty = (initial.additionalDuty || []).filter(d => d !== "Guru Mata Pelajaran" && d !== "Guru Mapel");
      if (!initial.additionalDuty.includes("Guru BK")) {
        initial.additionalDuty.push("Guru BK");
      }
    }
    setEditedProfile(initial);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalProfile = { ...editedProfile };
    if (isBkUser) {
      finalProfile.subject = "Bimbingan Konseling (BK)";
      finalProfile.additionalDuty = (finalProfile.additionalDuty || []).filter(d => d !== "Guru Mata Pelajaran" && d !== "Guru Mapel");
      if (!finalProfile.additionalDuty.includes("Guru BK")) {
        finalProfile.additionalDuty.push("Guru BK");
      }
    }
    if (!finalProfile.photoUrl && profile.photoUrl) {
      finalProfile.photoUrl = profile.photoUrl;
    }
    setProfile(finalProfile);

    await syncTeacherProfileUpdate(username, finalProfile);

    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Simulating live data metrics
  const activeClassCount = profile.classesTaught.split(",").length;
  
  // Simulated stats based on role
  const getDutyColorBadge = (duty: string) => {
    switch (duty) {
      case "Guru Piket":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Wali Kelas":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Guru Wali":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "Guru BK":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // State for simulated duty actions
  const [piketLogs, setPiketLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("sihadir_piket_logs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 1, time: "07:15", teacher: "Ahmad Fauzi", class: "XI TKR A", status: "KBM Dimulai", note: "Murid hadir lengkap" },
      { id: 2, time: "08:30", student: "Rian Hidayat", class: "XI TKR B", status: "Terlambat", note: "Ban motor bocor, diizinkan masuk" }
    ];
  });

  const [newPiketNote, setNewPiketNote] = useState("");
  const [newPiketStatus, setNewPiketStatus] = useState("KBM Lancar");
  const [newPiketClass, setNewPiketClass] = useState("XI TKR A");

  const handleAddPiketLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPiketNote) return;
    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const newLog = {
      id: piketLogs.length + 1,
      time: timeStr,
      teacher: profile.fullName,
      class: newPiketClass,
      status: newPiketStatus,
      note: newPiketNote
    };
    const updated = [newLog, ...piketLogs];
    setPiketLogs(updated);
    localStorage.setItem("sihadir_piket_logs", JSON.stringify(updated));
    setNewPiketNote("");
  };

  // Wali Kelas simulation stats
  const [waliStudents, setWaliStudents] = useState(() => {
    return [
      { id: "s1", name: "Aditya Pratama", attendance: "98%", score: 85, status: "Tuntas", parentWA: "0812345678" },
      { id: "s2", name: "Bagus Setiawan", attendance: "90%", score: 72, status: "Remedial", parentWA: "0852998811" },
      { id: "s3", name: "Dedi Cahyono", attendance: "95%", score: 80, status: "Tuntas", parentWA: "0813948574" },
      { id: "s4", name: "Eko Purwanto", attendance: "85%", score: 65, status: "Remedial", parentWA: "0877224466" },
      { id: "s5", name: "Fajar Ramadan", attendance: "100%", score: 92, status: "Tuntas", parentWA: "0811223344" }
    ];
  });

  // Guru BK simulation stats
  const [bkCases, setBkCases] = useState(() => {
    return [
      { name: "Eko Purwanto", class: "XI TKR A", issue: "Sering Terlambat (3x seminggu)", status: "Dipanggil Mandiri", action: "Pemberian motivasi & pembinaan wali kelas" },
      { name: "Bagus Setiawan", class: "XI TKR A", issue: "Sakit berulang tanpa surat", status: "Kunjungan Rumah", action: "Berkoordinasi dengan orangtua murid" }
    ];
  });

  const [newBkName, setNewBkName] = useState("");
  const [newBkClass, setNewBkClass] = useState("XI TKR A");
  const [newBkIssue, setNewBkIssue] = useState("");

  const handleAddBkCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBkName || !newBkIssue) return;
    const newCase = {
      name: newBkName,
      class: newBkClass,
      issue: newBkIssue,
      status: "Kasus Baru",
      action: "Menunggu penjadwalan bimbingan"
    };
    setBkCases([newCase, ...bkCases]);
    setNewBkName("");
    setNewBkIssue("");
  };

  // --- ANNOUNCEMENT BROADCAST SYSTEM (PAPAN INFORMASI TERKINI) ---
  const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
    {
      id: "ann-1",
      title: "Implementasi Sistem Presensi Digital & Dual-Verifikasi KBM",
      category: "Pengumuman Mutlak",
      content: "Diberitahukan kepada seluruh Guru dan Staf SMK Negeri 2 Konawe bahwa presensi harian wajib diisi setiap pagi sebelum jam 07.15 WITA. Admin Utama akan memantau rekapitulasi kehadiran dan jurnal mengajar secara berkala.",
      publisherName: "ARHAM AMIRUDDIN, S.Pd.Gr (Admin Utama)",
      publisherRole: "Administrator Utama",
      publisherRoleKey: "admin",
      targetAudience: "Semua Guru & Staf",
      createdAt: "27 Juli 2026, 07:00 WITA",
      isMutlak: true
    },
    {
      id: "ann-2",
      title: "Himbauan Peningkatan Kedisiplinan & Penegakan Budaya Industri 5S/5R",
      category: "Kebijakan Sekolah",
      content: "Seluruh pendidik diharapkan senantiasa mendampingi murid dalam menjaga kebersihan lingkungan bengkel dan kelas (Budaya Industri 5S). Laporan kedisiplinan mingguan akan dievaluasi setiap hari Sabtu.",
      publisherName: "Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)",
      publisherRole: "Kepala Sekolah",
      publisherRoleKey: "kepsek",
      targetAudience: "Semua Guru & Staf",
      createdAt: "26 Juli 2026, 08:30 WITA"
    },
    {
      id: "ann-3",
      title: "Jadwal Penyusunan Modul Ajar AI & Penilaian Sumatif Semester Ganjil",
      category: "Kurikulum & KBM",
      content: "Bapak/Ibu Guru Mata Pelajaran dapat menggunakan Generator Modul Ajar AI yang tersedia di portal Kurikulum untuk melengkapi administrasi pembelajaran T.A 2026/2027.",
      publisherName: "Andi Asrul Umar, S.Pd. (Waka Kurikulum)",
      publisherRole: "Waka Kurikulum",
      publisherRoleKey: "kurikulum",
      targetAudience: "Guru Mata Pelajaran",
      createdAt: "25 Juli 2026, 10:15 WITA"
    },
    {
      id: "ann-4",
      title: "Monitoring Ketertiban Murid Terlambat & Penanganan Kasus Konseling",
      category: "Kedisiplinan & Kesiswaan",
      content: "Tim Piket bersama Guru BK dan Wali Kelas mohon melakukan rekapitulasi bagi murid dengan catatan keterlambatan lebih dari 3 kali untuk diberikan pembinaan terpadu.",
      publisherName: "Nyoman Suliawati, S.Pd., M.Pd. (Waka Kesiswaan)",
      publisherRole: "Waka Kesiswaan",
      publisherRoleKey: "kesiswaan",
      targetAudience: "Wali Kelas & Guru Piket",
      createdAt: "24 Juli 2026, 09:00 WITA"
    }
  ];

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    try {
      const saved = localStorage.getItem("sihadir_school_announcements");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Refresh legacy publisher names if present
          return parsed.map((item: AnnouncementItem) => {
            if (item.id === "ann-1") return { ...item, publisherName: "ARHAM AMIRUDDIN, S.Pd.Gr (Admin Utama)" };
            if (item.id === "ann-2") return { ...item, publisherName: "Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)" };
            if (item.id === "ann-3") return { ...item, publisherName: "Andi Asrul Umar, S.Pd. (Waka Kurikulum)" };
            if (item.id === "ann-4") return { ...item, publisherName: "Nyoman Suliawati, S.Pd., M.Pd. (Waka Kesiswaan)" };
            return item;
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ANNOUNCEMENTS;
  });

  useEffect(() => {
    localStorage.setItem("sihadir_school_announcements", JSON.stringify(announcements));
  }, [announcements]);

  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<AnnouncementItem["category"]>("Informasi Umum");
  const [newContent, setNewContent] = useState("");
  const [newTarget, setNewTarget] = useState("Semua Guru & Staf");
  const [newPublisherChoice, setNewPublisherChoice] = useState("");
  const [newIsMutlak, setNewIsMutlak] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("Semua");

  const isAuthorizedToPost = 
    ["admin", "kepsek", "kesiswaan", "kurikulum", "bk"].includes(currentRole.toLowerCase()) ||
    ["admin", "kepsek", "kesiswaan", "kurikulum", "bk"].includes(username.toLowerCase()) ||
    isBkUser;

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    let pubRole = "Administrator Utama";
    let pubKey = "admin";
    let defaultPubName = "ARHAM AMIRUDDIN, S.Pd.Gr (Admin Utama)";

    if (currentRole === "kepsek" || username === "kepsek") {
      pubRole = "Kepala Sekolah";
      pubKey = "kepsek";
      defaultPubName = "Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)";
    } else if (currentRole === "kesiswaan" || username === "kesiswaan") {
      pubRole = "Waka Kesiswaan";
      pubKey = "kesiswaan";
      defaultPubName = "Nyoman Suliawati, S.Pd., M.Pd. (Waka Kesiswaan)";
    } else if (currentRole === "kurikulum" || username === "kurikulum") {
      pubRole = "Waka Kurikulum";
      pubKey = "kurikulum";
      defaultPubName = "Andi Asrul Umar, S.Pd. (Waka Kurikulum)";
    } else if (currentRole === "bk" || isBkUser) {
      pubRole = "Guru BK";
      pubKey = "bk";
      defaultPubName = profile.fullName ? `${profile.fullName} (Guru BK)` : "Cici Murni, S.Pd. (Guru BK)";
    }

    const selectedPubName = newPublisherChoice.trim() || defaultPubName;

    const nowFormatted = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) + " WITA";

    const newItem: AnnouncementItem = {
      id: "ann-" + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      publisherName: selectedPubName,
      publisherRole: pubRole,
      publisherRoleKey: pubKey,
      targetAudience: newTarget,
      createdAt: nowFormatted,
      isMutlak: currentRole === "admin" ? newIsMutlak || newCategory === "Pengumuman Mutlak" : newCategory === "Pengumuman Mutlak"
    };

    const updated = [newItem, ...announcements];
    setAnnouncements(updated);
    setShowPostModal(false);
    setNewTitle("");
    setNewContent("");
    setNewPublisherChoice("");
    setNewIsMutlak(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengumuman ini dari dasbor?")) {
      const updated = announcements.filter((a) => a.id !== id);
      setAnnouncements(updated);
    }
  };

  return (
    <div className="space-y-6" id="teacher-profile-dashboard">
      {/* Toast alert on success */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg border border-emerald-500 flex items-center gap-2 text-xs font-bold"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Data Profil Guru Berhasil Diperbaharui & Disinkronkan!</span>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Header Profile Dashboard */}
      <div className="bg-[#ffffff] rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f1cfcf] rounded-full blur-2xl -mr-10 -mt-10 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/40 rounded-full blur-xl -ml-8 -mb-8 opacity-40"></div>
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#ffffff]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-sm border-2 border-indigo-100 overflow-hidden shrink-0">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                profile.fullName.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">{profile.fullName}</h2>
                {isKepsekUser ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border bg-amber-950 text-amber-100 border-amber-800">
                    Kepala Sekolah
                  </span>
                ) : isTuUser ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border bg-slate-900 text-white border-slate-800">
                    Admin Tata Usaha (TU)
                  </span>
                ) : profile.additionalDuty && profile.additionalDuty.length > 0 ? (
                  profile.additionalDuty.map((duty) => (
                    <span key={duty} className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getDutyColorBadge(duty)}`}>
                      Tugas: {duty}
                    </span>
                  ))
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border bg-slate-900 text-white border-slate-800">
                    Pendidik Utama
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-800 font-bold">NIP: {profile.nip} {isKepsekUser ? "| Pimpinan Utama (Kepala Sekolah)" : isTuUser ? (isSaktiOrAdelia ? "| Admin Tata Usaha (TU)" : "| Staf Tata Usaha") : `| Guru ${profile.subject}`}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-700 mt-1 font-bold">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-900" /> {profile.address}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-emerald-800" /> {profile.whatsapp}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="bg-[#0068ff] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl border border-[#0068ff] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Edit2 className="h-3.5 w-3.5" />
                {isKepsekUser ? "Ubah Biodata Kepala Sekolah" : isTuUser ? (isSaktiOrAdelia ? "Ubah Biodata Admin TU" : "Ubah Biodata Staf") : "Ubah Biodata Guru"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border transition-colors cursor-pointer"
              >
                Batal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editing Form Panel */}
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-6"
        >
          <div className="border-b border-indigo-100 pb-3 mb-4">
            <h3 className="text-sm font-black text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
              Formulir Update Informasi Profil {isTuUser ? (isSaktiOrAdelia ? "Admin Tata Usaha" : "Staf Tata Usaha") : "Pendidik"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Semua data di bawah ini digunakan untuk melengkapi berkas administrasi dan laporan SIHADIR.</p>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-indigo-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-200 overflow-hidden flex items-center justify-center text-indigo-700 font-extrabold text-base uppercase shrink-0 shadow-2xs">
                {editedProfile.photoUrl ? (
                  <img src={editedProfile.photoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-indigo-400" />
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Foto Profil {isTuUser ? (isSaktiOrAdelia ? "Admin TU" : "Staf TU") : "Guru / Pendidik"}</label>
                <div className="flex items-center gap-2">
                  <label className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Unggah Foto Profil</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImageFile(file, 400, 400, 0.8);
                            setEditedProfile(prev => ({ ...prev, photoUrl: compressed }));
                          } catch (err) {
                            console.error("Error compressing photo:", err);
                          }
                        }
                      }}
                    />
                  </label>
                  {editedProfile.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setEditedProfile(prev => ({ ...prev, photoUrl: "" }))}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Format JPG/PNG/WEBP. Foto akan ditampilkan di bagian atas sebelah kiri nama Anda.</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Lengkap & Gelar</label>
              <input
                type="text"
                value={editedProfile.fullName}
                onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor Induk Pegawai (NIP)</label>
              <input
                type="text"
                value={editedProfile.nip}
                onChange={(e) => setEditedProfile({ ...editedProfile, nip: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono"
                placeholder="Contoh: 19850412 201001 1 002"
                required
              />
            </div>

            <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-slate-200">
              <BirthDateSelector
                birthPlace={editedProfile.birthInfo.includes(",") ? editedProfile.birthInfo.split(",")[0].trim() : (editedProfile.birthInfo || "Konawe")}
                birthDate={editedProfile.birthInfo}
                onPlaceChange={(place) => {
                  const parts = editedProfile.birthInfo.split(",");
                  const datePart = parts.length > 1 ? parts.slice(1).join(",") : " 5 Mei 1989";
                  setEditedProfile({ ...editedProfile, birthInfo: `${place},${datePart}` });
                }}
                onDateChange={(_dateIso, formattedIndo) => {
                  const parts = editedProfile.birthInfo.split(",");
                  const placePart = parts[0] ? parts[0].trim() : "Konawe";
                  setEditedProfile({ ...editedProfile, birthInfo: `${placePart}, ${formattedIndo}` });
                }}
                minYear={1950}
                maxYear={2026}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor WA Aktif (Notifikasi Laporan)</label>
              <input
                type="text"
                value={editedProfile.whatsapp}
                onChange={(e) => setEditedProfile({ ...editedProfile, whatsapp: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 font-bold"
                placeholder="Contoh: 08123456789"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alamat Lengkap Domisili</label>
              <input
                type="text"
                value={editedProfile.address}
                onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
                placeholder="Contoh: Jl. Poros Unaaha No. 45, Konawe, Sultra"
                required
              />
            </div>

            {isKepsekUser && (
              <div className="sm:col-span-2 bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                  Peran Kerja Utama (Pimpinan Sekolah)
                </label>
                <div className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 font-black text-amber-950 flex items-center gap-2 shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse"></span>
                  <span>Kepala Sekolah SMK Negeri 2 Konawe</span>
                </div>
                <p className="text-[10px] text-amber-800 font-semibold mt-1.5">
                  Sebagai Kepala Sekolah, Anda adalah penanggung jawab utama manajemen, supervisi KBM, dan kebijakan seluruh unit sekolah.
                </p>
              </div>
            )}

            {!isTuUser && !isKepsekUser && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    {isBkUser ? "Peran Kerja Utama" : "Peran Kerja Utama / Mata Pelajaran"}
                  </label>
                  <select
                    value={isBkUser ? "Bimbingan Konseling (BK)" : editedProfile.subject}
                    onChange={(e) => setEditedProfile({ ...editedProfile, subject: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none font-bold text-slate-850 cursor-pointer"
                  >
                    {isArhamAmiruddin && (
                      <>
                        <option value="Admin Utama">Admin Utama (System SIHADIR)</option>
                        <option value="Administrator Utama">Administrator Utama</option>
                      </>
                    )}
                    {isBkUser ? (
                      <option value="Bimbingan Konseling (BK)">Bimbingan Konseling (BK)</option>
                    ) : (
                      <>
                        <option value="Guru Mapel">Guru Mapel</option>
                        <option value="Guru Mata Pelajaran">Guru Mata Pelajaran</option>
                        <option value="Teknik Kendaraan Ringan (Otomotif)">Teknik Kendaraan Ringan (Otomotif)</option>
                        <option value="Teknik Sepeda Motor (Produktif)">Teknik Sepeda Motor (Produktif)</option>
                        <option value="Mesin Otomotif & K3">Mesin Otomotif & K3</option>
                        <option value="Bahasa Inggris Teknik">Bahasa Inggris Teknik</option>
                        <option value="Mata Pelajaran Umum">Mata Pelajaran Umum</option>
                        <option value="Guru Piket">Guru Piket</option>
                        <option value="Guru Wali">Guru Wali</option>
                        <option value="Wali Kelas">Wali Kelas</option>
                        {isAndiAsrul && <option value="Waka Kurikulum">Waka Kurikulum</option>}
                        {isNyomanSuliawati && <option value="Waka Kesiswaan">Waka Kesiswaan</option>}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kelas yang Diajar (Gunakan Koma)</label>
                  <input
                    type="text"
                    value={editedProfile.classesTaught}
                    onChange={(e) => setEditedProfile({ ...editedProfile, classesTaught: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
                    placeholder="Contoh: XI TKR A, XI TKR B, XI TSM"
                  />
                </div>

                <div className="sm:col-span-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 space-y-2">
                  <label className="block text-xs font-black text-indigo-950 uppercase tracking-wide">
                    Pilih Tugas Tambahan / Integrasi Peran Pendidik
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {[
                      ...(isArhamAmiruddin ? [{ value: "Administrator Utama", label: "Admin Utama", note: "Akses Penuh" }] : []),
                      ...(isBkUser ? [] : [{ value: "Guru Mata Pelajaran", label: "Guru Mapel", note: "Terhubung" }]),
                      { value: "Guru Piket", label: "Guru Piket", note: "Terhubung" },
                      { value: "Wali Kelas", label: "Wali Kelas", note: "Terhubung" },
                      { value: "Guru Wali", label: "Guru Wali", note: `${currentGuruWaliGroup?.muridList?.length || 12} Binaan` },
                      ...(isBkUser ? [{ value: "Guru BK", label: "Guru BK", note: "Terhubung" }] : []),
                      ...(isAndiAsrul ? [
                        { value: "Waka Kurikulum", label: "Waka Kurikulum", note: "Kurikulum" }
                      ] : []),
                      ...(isNyomanSuliawati ? [
                        { value: "Waka Kesiswaan", label: "Waka Kesiswaan", note: "Kesiswaan" }
                      ] : [])
                    ].map((item) => {
                      const isSelected = (editedProfile.additionalDuty || []).includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            const currentDuties = editedProfile.additionalDuty || [];
                            let nextDuties;
                            if (isSelected) {
                              nextDuties = currentDuties.filter((d) => d !== item.value);
                            } else {
                              nextDuties = [...currentDuties, item.value];
                              if (item.value === "Guru Wali") {
                                setShowInlineGuruWaliPreview(true);
                              }
                            }
                            setEditedProfile({ ...editedProfile, additionalDuty: nextDuties });
                            if (item.value === "Guru Wali" && isSelected) {
                              setShowInlineGuruWaliPreview(!showInlineGuruWaliPreview);
                            }
                          }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1 ${
                            isSelected 
                              ? "bg-indigo-600 text-white border-transparent shadow-xs font-extrabold ring-2 ring-indigo-400/40"
                              : "bg-white border-slate-200 hover:border-indigo-300 text-slate-700 font-semibold"
                          }`}
                        >
                          <span className="text-[11px] uppercase tracking-wide block">{item.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected 
                              ? "bg-indigo-700 text-indigo-100" 
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {item.note}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    {isBuCici || isPakYoga 
                      ? "Terhubung dengan tugas khusus Bimbingan Konseling (BK), Guru Piket, Guru Wali, dan Wali Kelas." 
                      : "Seluruh guru terhubung dengan tugas Guru Mapel, Guru Wali, Piket, dan Wali Kelas."}
                  </p>

                  {/* INLINE EXPANDED GURU WALI BINAAN PREVIEW */}
                  {((editedProfile.additionalDuty || []).includes("Guru Wali") || showInlineGuruWaliPreview) && (
                    <div className="mt-3 bg-teal-50/90 border border-teal-200 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-teal-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                          <div>
                            <h5 className="text-xs font-black text-teal-950 uppercase tracking-wide">
                              Murid Binaan Guru Wali ({currentGuruWaliGroup?.namaGuru || editedProfile.fullName}): {currentGuruWaliGroup?.muridList?.length || 0} Murid Terdaftar
                            </h5>
                            <p className="text-[10px] text-teal-800 font-medium">
                              Sesuai SK Resmi Kepala SMKN 2 Konawe untuk pembimbingan mandiri
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsGrupWaliModalOpen(true)}
                          className="bg-teal-700 hover:bg-teal-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>Kelola Grup Ini & Lihat Seluruh Guru Wali (36 Guru) →</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                        {(currentGuruWaliGroup?.muridList || []).map((m, idx) => (
                          <div key={m.id || idx} className="bg-white border border-teal-100 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] shadow-2xs">
                            <span className="font-bold text-slate-800 truncate" title={m.nama}>
                              {idx + 1}. {m.nama}
                            </span>
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded font-mono shrink-0 ml-1">
                              {m.kelas}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-teal-800 font-medium italic">
                          * Klik tombol di atas untuk menambah murid baru, mencetak rekap, atau melihat kelompok guru lainnya.
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsGrupWaliModalOpen(true)}
                          className="text-[11px] text-teal-800 font-bold hover:underline"
                        >
                          + Tambah Murid Binaan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl border border-transparent shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                Simpan & Sinkronkan
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* KPI METRIC CARDS GRID */}
      {!isKepsekUser && (
        <div className={`grid grid-cols-2 ${isTuUser ? "sm:grid-cols-2" : "sm:grid-cols-4"} gap-4`}>
          {!isTuUser && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Jam Mengajar Utama</span>
              <div className="my-2">
                <span className="text-2xl font-black text-indigo-950">24</span>
                <span className="text-xs text-slate-500 font-bold ml-1">JP / Minggu</span>
              </div>
              <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded w-fit">Terpenuhi Kemdikbud</span>
            </div>
          )}

          {!isTuUser && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Kelas Ajar</span>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900">{activeClassCount}</span>
                <span className="text-xs text-slate-500 font-bold ml-1">Rombel</span>
              </div>
              <span className="text-[9px] text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded w-fit tracking-wide uppercase truncate">
                {profile.classesTaught}
              </span>
            </div>
          )}

          <div 
            onClick={() => onNavigateToTab?.("absensi-guru")}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-3xs flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Presensi Absensi Anda</span>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Buka Absen</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-emerald-600">HADIR</span>
            </div>
            <span className="text-[9px] text-slate-500 font-bold">Terverifikasi GPS Sekolah →</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Status Layanan Administrasi</span>
            <div className="my-2">
              <span className="text-2xl font-black text-amber-600">AKTIF</span>
            </div>
            <span className="text-[9px] text-amber-600 font-bold uppercase bg-amber-50 px-2 py-0.5 rounded w-fit">
              {isTuUser ? "Sistem Kearsipan & Presensi" : "Pencairan Triwulan 2"}
            </span>
          </div>
        </div>
      )}

      {/* JADWAL MENGAJAR TERKONEKSI & ALARM KEHADIRAN KBM GURU KE GRUP WA */}
      {!isTuUser && !isKepsekUser && (
        <TeacherScheduleAndWAAlarm 
          teacherName={profile.fullName || username} 
          subject={profile.subject} 
          currentRole={currentRole}
          username={username}
          additionalDuty={profile.additionalDuty}
          onNavigateToTab={onNavigateToTab} 
        />
      )}

      {/* GRUP GURU WALI & MURID BINAAN TERINTEGRASI - Hanya untuk role Guru Wali, dihilangkan untuk guru mapel */}
      {currentRole === "guru_wali" && !isTuUser && !isKepsekUser && (
        <GrupGuruWaliBinaanSection 
          currentTeacherName={profile.fullName || username} 
          currentRole={currentRole} 
          onNavigateToTab={onNavigateToTab} 
        />
      )}

      {/* MODAL KELOLA SELURUH GRUP GURU WALI (JIKA DIBUKA SECARA POPUP) */}
      {isGrupWaliModalOpen && (
        <GrupGuruWaliBinaanSection 
          currentTeacherName={editedProfile?.fullName || profile.fullName || username} 
          currentRole={currentRole} 
          onNavigateToTab={onNavigateToTab}
          isOpenModal={true}
          onCloseModal={() => setIsGrupWaliModalOpen(false)}
        />
      )}

      {/* PAPAN INFORMASI TERKINI & PENGUMUMAN RESMI (AUTOMATIC INFO RECEIVER & BROADCASTER) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm shrink-0">
              <Megaphone className="h-6 w-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-indigo-200">
                  Pusat Informasi Terkini
                </span>
                <span className="text-slate-300 text-xs">|</span>
                <span className="text-xs font-bold text-slate-500">Otomatis Terintegrasi Akun</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">
                Papan Pengumuman & Informasi Resmi Sekolah
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Penerimaan data informasi mutlak dan kebijakan resmi untuk pemilik akun Guru & Staf SMK Negeri 2 Konawe.
              </p>
            </div>
          </div>

          {/* Broadcaster Button for Authorized Roles (Admin Utama, Kepsek, Kesiswaan, Kurikulum, Guru BK) */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {isAuthorizedToPost ? (
              <button
                type="button"
                onClick={() => setShowPostModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Siarkan Pengumuman Resmi</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Akses Kirim: Admin, Kepsek, Waka & BK
              </span>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3 text-indigo-500" /> Filter:
            </span>
            {["Semua", "Pengumuman Mutlak", "Kebijakan Sekolah", "Kurikulum & KBM", "Kedisiplinan & Kesiswaan"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilterCategory(cat)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  selectedFilterCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-slate-400 font-bold">
            Total: {announcements.length} Informasi Siar
          </span>
        </div>

        {/* Broadcaster Modal / Form */}
        <AnimatePresence>
          {showPostModal && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-indigo-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                    <Send className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                      Form Siarkan Informasi Resmi (Admin, Pimpinan & Guru BK)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Informasi yang dikirim akan tampil secara otomatis di seluruh dasbor akun guru & staf.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm px-2 py-1 rounded-lg hover:bg-slate-200/50"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Judul Pengumuman / Informasi
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Contoh: Himbauan Kelengkapan Perangkat KBM Semester Ganjil"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Kategori Informasi
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as AnnouncementItem["category"])}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none"
                    >
                      {currentRole === "admin" && <option value="Pengumuman Mutlak">Pengumuman Mutlak (Admin Utama)</option>}
                      <option value="Kebijakan Sekolah">Kebijakan Sekolah (Kepala Sekolah)</option>
                      <option value="Kurikulum & KBM">Kurikulum & KBM (Waka Kurikulum)</option>
                      <option value="Kedisiplinan & Kesiswaan">Kedisiplinan & Kesiswaan (Waka Kesiswaan & BK)</option>
                      <option value="Informasi Umum">Informasi Umum</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Disiarkan Oleh (Pengeluar Informasi)
                    </label>
                    <select
                      value={newPublisherChoice}
                      onChange={(e) => setNewPublisherChoice(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-extrabold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">-- Otomatis Sesuai Role ({currentRole.toUpperCase()}) --</option>
                      <option value="Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)">Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)</option>
                      <option value="Andi Asrul Umar, S.Pd. (Waka Kurikulum)">Andi Asrul Umar, S.Pd. (Waka Kurikulum)</option>
                      <option value="Nyoman Suliawati, S.Pd., M.Pd. (Waka Kesiswaan)">Nyoman Suliawati, S.Pd., M.Pd. (Waka Kesiswaan)</option>
                      <option value="ARHAM AMIRUDDIN, S.Pd.Gr (Admin Utama)">ARHAM AMIRUDDIN, S.Pd.Gr (Admin Utama)</option>
                      <option value="Cici Murni, S.Pd. (Guru BK)">Cici Murni, S.Pd. (Guru BK)</option>
                      <option value="Yoga Nanda Hermawan, S.Pd. (Guru BK)">Yoga Nanda Hermawan, S.Pd. (Guru BK)</option>
                      {profile.fullName && (
                        <option value={`${profile.fullName} (${profile.additionalDuty?.[0] || "Guru"})`}>
                          {profile.fullName} ({profile.additionalDuty?.[0] || "Guru"})
                        </option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Target Penerima Informasi
                    </label>
                    <select
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value="Semua Guru & Staf">Semua Guru & Staf (Seluruh Akun)</option>
                      <option value="Guru Mata Pelajaran">Guru Mata Pelajaran</option>
                      <option value="Wali Kelas & Guru Wali">Wali Kelas & Guru Wali</option>
                      <option value="Staf TU & Piket">Staf TU & Guru Piket</option>
                    </select>
                  </div>

                  {currentRole === "admin" && (
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="mutlak-check"
                        checked={newIsMutlak}
                        onChange={(e) => setNewIsMutlak(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <label htmlFor="mutlak-check" className="text-xs font-bold text-rose-700 cursor-pointer">
                        Tandai sebagai INFO MUTLAK (Prioritas Tertinggi)
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Isi Pesan / Instruksi Informasi
                  </label>
                  <textarea
                    rows={3}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Tuliskan detail instruksi atau pengumuman penting secara jelas..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                  >
                    Siarkan Informasi Now
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Announcements List */}
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
          {announcements
            .filter((item) => {
              if (selectedFilterCategory === "Semua") return true;
              return item.category === selectedFilterCategory;
            })
            .map((item) => {
              const isMutlak = item.isMutlak || item.category === "Pengumuman Mutlak";
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all relative ${
                    isMutlak
                      ? "bg-gradient-to-r from-rose-50/90 via-amber-50/50 to-white border-rose-200 shadow-xs"
                      : item.publisherRoleKey === "kepsek"
                      ? "bg-purple-50/40 border-purple-200/80"
                      : item.publisherRoleKey === "kurikulum"
                      ? "bg-indigo-50/40 border-indigo-200/80"
                      : item.publisherRoleKey === "kesiswaan"
                      ? "bg-emerald-50/40 border-emerald-200/80"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isMutlak ? (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                          <ShieldAlert className="h-3 w-3" />
                          INFO MUTLAK (ADMIN UTAMA)
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            item.publisherRoleKey === "kepsek"
                              ? "bg-purple-100 text-purple-800 border-purple-300"
                              : item.publisherRoleKey === "kurikulum"
                              ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                              : item.publisherRoleKey === "kesiswaan"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-slate-200 text-slate-800 border-slate-300"
                          }`}
                        >
                          <Pin className="h-3 w-3" />
                          {item.category}
                        </span>
                      )}

                      <span className="text-[10px] font-bold text-slate-500 bg-white/80 border px-2 py-0.5 rounded-md">
                        Penerima: {item.targetAudience}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {item.createdAt}
                      </span>

                      {(currentRole === "admin" || username === "admin") && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-100/50 transition-colors"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-700 font-normal leading-relaxed mt-1">
                    {item.content}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-indigo-900 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                      Disiarkan oleh: <span className="text-slate-800">{item.publisherName}</span>
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
