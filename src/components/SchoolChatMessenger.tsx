/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Search, 
  Users, 
  MessageSquare, 
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Clock,
  Trash2,
  Smile,
  Info,
  CheckCheck,
  PlusCircle,
  FileText,
  HeartHandshake,
  ShieldCheck,
  ShieldAlert,
  Lock,
  X,
  Sparkles,
  Briefcase,
  Star,
  CornerUpLeft,
  AtSign
} from "lucide-react";
import { ChatMessage, ChatChannel } from "../types";
import { MOCK_TEACHERS, MOCK_STUDENTS } from "../mockData";
import { WALI_KELAS_LIST, getWaliKelasPerwalianClass } from "../data/waliKelasData";
import { OFFICIAL_SMK2_SCHEDULES } from "../data/translatedSchedules";
import { getMasterGuruWaliData, GuruWaliMasterItem } from "../data/guruWaliMasterData";
import { dbService } from "../firebase";

// Clean and normalize teacher name for matching (removes titles, punctuation, degrees)
export function normalizeTeacherName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\b(s\.pd|m\.pd|s\.ag|st|s\.kom|s\.sos|drs|s\.si|se|a\.md|gr|bk|mat|b)\b/gi, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchTeacherNames(name1?: string, name2?: string): boolean {
  if (!name1 || !name2) return false;
  const n1 = normalizeTeacherName(name1);
  const n2 = normalizeTeacherName(name2);
  if (!n1 || !n2) return false;
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  const parts1 = n1.split(" ").filter(p => p.length >= 3);
  const parts2 = n2.split(" ").filter(p => p.length >= 3);
  if (parts1.length > 0 && parts2.length > 0) {
    const common = parts1.filter(p => parts2.includes(p));
    if (common.length >= 2) return true;
    if (parts1[0] === parts2[0] && (parts1.length === 1 || parts2.length === 1 || common.length >= 1)) return true;
    if (parts1.some(p => p.length >= 5 && parts2.includes(p))) return true;
  }
  return false;
}

// Get all classes where the teacher is either Wali Kelas OR teaches in
export function getClassesTaughtByTeacher(teacherName: string, teachersList: any[] = []): string[] {
  if (!teacherName) return [];
  const classesSet = new Set<string>();

  // 1. Check Wali Kelas perwalian
  const perwalian = getWaliKelasPerwalianClass(teacherName);
  if (perwalian) {
    classesSet.add(perwalian);
  }
  WALI_KELAS_LIST.forEach(w => {
    if (matchTeacherNames(teacherName, w.namaWaliKelas)) {
      classesSet.add(w.className);
    }
  });

  // 2. Check teaching schedule (OFFICIAL_SMK2_SCHEDULES)
  OFFICIAL_SMK2_SCHEDULES.forEach(s => {
    if (matchTeacherNames(teacherName, s.teacherName)) {
      classesSet.add(s.className);
    }
  });

  // 3. Check teachers master list classes
  const teacherObj = teachersList.find(t => matchTeacherNames(teacherName, t.name));
  if (teacherObj && Array.isArray(teacherObj.classes)) {
    teacherObj.classes.forEach((c: string) => {
      if (!c || typeof c !== "string") return;
      const lower = c.toLowerCase().trim();
      if (lower.includes("semua") || lower.includes("administrasi") || lower.includes("ruang")) return;
      const clean = lower.replace(/[^a-z0-9]/g, "");
      const matched = WALI_KELAS_LIST.find(w => w.className.toLowerCase().replace(/[^a-z0-9]/g, "") === clean);
      if (matched) {
        classesSet.add(matched.className);
      }
    });
  }

  return Array.from(classesSet);
}

// Get all teachers for a specific class (Wali Kelas + Teaching Subject Teachers)
export function getTeachersForClass(className: string, teachersList: any[] = []): Array<{
  name: string;
  subjectName: string;
  isWali: boolean;
}> {
  const result: Array<{ name: string; subjectName: string; isWali: boolean }> = [];
  const cleanTarget = className.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. Wali Kelas
  const waliObj = WALI_KELAS_LIST.find(w => w.className.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanTarget);
  if (waliObj) {
    result.push({
      name: waliObj.namaWaliKelas,
      subjectName: `Wali Kelas ${waliObj.className}`,
      isWali: true
    });
  }

  // 2. Schedule teaching
  OFFICIAL_SMK2_SCHEDULES.forEach(s => {
    const cClean = s.className.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cClean === cleanTarget) {
      const already = result.some(r => matchTeacherNames(r.name, s.teacherName));
      if (!already) {
        result.push({
          name: s.teacherName,
          subjectName: s.subjectName || "Guru Pengajar",
          isWali: false
        });
      }
    }
  });

  // 3. Teachers master list classes
  teachersList.forEach((t: any) => {
    if (Array.isArray(t.classes)) {
      const teaches = t.classes.some((c: string) => c.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanTarget);
      if (teaches) {
        const already = result.some(r => matchTeacherNames(r.name, t.name));
        if (!already) {
          result.push({
            name: t.name,
            subjectName: t.subject || "Guru Mata Pelajaran",
            isWali: false
          });
        }
      }
    }
  });

  return result;
}

interface CurrentUserInfo {
  id: string;
  name: string;
  role: string;
  roleTitle: string;
  avatar?: string;
  kelas?: string;
}

interface SchoolChatMessengerProps {
  currentUser: CurrentUserInfo;
}

const QUICK_TEMPLATES_STUDENT = [
  "Selamat pagi/siang Bapak/Ibu Guru, izin bertanya materi tugas.",
  "Mohon izin konfirmasi kehadiran dan surat izin sakit hari ini.",
  "Halo teman-teman, jangan lupa tugas kelompok dikumpulkan besok ya.",
  "Terima kasih Bapak/Ibu Guru atas bimbingan dan arahannya! 🙏"
];

const QUICK_TEMPLATES_STAFF = [
  "Pengumuman: Jadwal pelajaran dan praktikum di bengkel hari ini.",
  "Mohon bapak/ibu wali kelas merekap absensi siswa pagi ini.",
  "Koordinasi berkas dan administrasi siswa di ruang Tata Usaha.",
  "Terima kasih atas kerja sama bapak/ibu dewan guru dan staf.",
  "Laporan pembimbingan siswa binaan telah diperbarui di sistem."
];

const EMOJI_LIST = ["👍", "🙏", "👏", "📚", "✍️", "😊", "💡", "🏫", "✅", "⚠️", "💯", "🎯"];

export function SchoolChatMessenger({ currentUser }: SchoolChatMessengerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customGroups, setCustomGroups] = useState<ChatChannel[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [replyingTo, setReplyingTo] = useState<{ id: string; senderName: string; text: string } | null>(null);
  
  // Modal for creating custom new group (Teachers & Staff only)
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState<"kelas_wali" | "guru_wali" | "tu" | "umum" | "custom" | "guru_staff">("umum");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupBadge, setNewGroupBadge] = useState("");

  // Group Member Drawer & Filter State
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState<"all" | "wali" | "siswa">("all");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Determine if current user is a student
  const isStudent = currentUser.role === "siswa" || currentUser.role === "ketua_kelas";
  const isTuStaff = currentUser.role === "tu" || 
    (currentUser.name || "").toLowerCase().includes("sakti") || 
    (currentUser.name || "").toLowerCase().includes("adelia");

  const MAX_STUDENT_CHARS = 200;
  const STUDENT_COOLDOWN_SECS = 15;

  // Student operational hours rule (06:30 - 17:30 WITA)
  const isStudentAllowedByTime = useMemo(() => {
    if (!isStudent) return true; // Teachers/admins have 24/7 access
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMins = now.getUTCMinutes();
    const witaHours = (utcHours + 8) % 24;
    const currentMinsTotal = witaHours * 60 + utcMins;

    const startMins = 6 * 60 + 30; // 06:30 WITA
    const endMins = 17 * 60 + 30;  // 17:30 WITA

    return currentMinsTotal >= startMins && currentMinsTotal <= endMins;
  }, [isStudent]);

  // Load teachers and students from master data
  const teachersList = useMemo(() => {
    const raw = localStorage.getItem("simpati_teachers_list") || localStorage.getItem("sihadir_master_teachers");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return MOCK_TEACHERS;
  }, []);

  const studentsList = useMemo(() => {
    const raw = localStorage.getItem("simpati_students_list") || localStorage.getItem("sihadir_master_students");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return MOCK_STUDENTS;
  }, []);

  // Master Guru Wali list (36 Teachers with their assigned student list)
  const masterGuruWaliList: GuruWaliMasterItem[] = useMemo(() => {
    return getMasterGuruWaliData();
  }, []);

  // 1. Resolve Student's Registered Class
  const resolvedStudentClass = useMemo(() => {
    if (!isStudent) return "";
    if (currentUser.kelas && currentUser.kelas.trim().length > 0) {
      return currentUser.kelas.trim();
    }
    // Search in students list
    const cleanCurrentName = (currentUser.name || "").toLowerCase().trim();
    const found = studentsList.find((s: any) => {
      const sName = (s.name || "").toLowerCase().trim();
      return sName === cleanCurrentName || (s.id && s.id === currentUser.id);
    });
    if (found && found.class) return found.class;

    const savedKk = localStorage.getItem("sihadir_ketua_kelas_class");
    if (savedKk) return savedKk;

    return "XI TKR A"; // standard default fallback
  }, [isStudent, currentUser, studentsList]);

  // 2. Match Wali Kelas for Student's Class
  const matchedStudentWaliKelas = useMemo(() => {
    if (!isStudent) return null;
    const sClassClean = resolvedStudentClass.toLowerCase().replace(/[^a-z0-9]/g, "");
    const found = WALI_KELAS_LIST.find(item => {
      const cClean = item.className.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cClean === sClassClean || sClassClean.includes(cClean) || cClean.includes(sClassClean);
    });
    return found || WALI_KELAS_LIST[6]; // default XI TKR A (Haerul, S.Pd)
  }, [isStudent, resolvedStudentClass]);

  const studentClassGroupId = useMemo(() => {
    if (!matchedStudentWaliKelas) return "group-kelas-xi-tkr-a";
    return `group-kelas-${matchedStudentWaliKelas.className.toLowerCase().replace(/\s+/g, "-")}`;
  }, [matchedStudentWaliKelas]);

  // 3. Match Guru Wali for Student
  // A student should ONLY match the Guru Wali who has that student's name in their muridList
  const matchedStudentGuruWali = useMemo(() => {
    if (!isStudent) return null;
    const sNameClean = (currentUser.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const sClassClean = resolvedStudentClass.toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. Find by name in muridList
    for (const gw of masterGuruWaliList) {
      const hasStudent = gw.muridList.some(m => {
        const mNameClean = (m.nama || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (mNameClean === sNameClean) return true;
        if (sNameClean.length >= 5 && (mNameClean.includes(sNameClean) || sNameClean.includes(mNameClean))) {
          return true;
        }
        return false;
      });
      if (hasStudent) return gw;
    }

    // 2. Fallback: match by class in muridList
    if (sClassClean) {
      for (const gw of masterGuruWaliList) {
        const hasClass = gw.muridList.some(m => (m.kelas || "").toLowerCase().replace(/[^a-z0-9]/g, "") === sClassClean);
        if (hasClass) return gw;
      }
    }

    return masterGuruWaliList[0] || null;
  }, [isStudent, currentUser.name, resolvedStudentClass, masterGuruWaliList]);

  const studentGuruWaliGroupId = useMemo(() => {
    if (!matchedStudentGuruWali) return null;
    const slug = matchedStudentGuruWali.namaGuru.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 20);
    return `group-gw-${slug}`;
  }, [matchedStudentGuruWali]);

  // Determine if user has administrative or institutional privileges (Kepala Sekolah / Admin)
  const isSuperAdminOrPrincipal = useMemo(() => {
    return (
      currentUser.role === "admin" || 
      currentUser.role === "kepala_sekolah" ||
      (currentUser.name || "").toLowerCase().includes("admin") ||
      (currentUser.name || "").toLowerCase().includes("kepala sekolah")
    );
  }, [currentUser.role, currentUser.name]);

  // Classes where current teacher teaches (schedule) OR serves as Wali Kelas
  // Strictly filter only relevant classes for the teacher/user
  const teacherAssignedClasses = useMemo(() => {
    if (isStudent) return [];
    return getClassesTaughtByTeacher(currentUser.name, teachersList);
  }, [isStudent, currentUser.name, teachersList]);

  // Group IDs for accessible class groups for this teacher
  const myAccessibleClassGroupIds = useMemo(() => {
    return teacherAssignedClasses.map(className => 
      `group-kelas-${className.toLowerCase().replace(/\s+/g, "-")}`
    );
  }, [teacherAssignedClasses]);

  // Current teacher's own Guru Wali group
  const myGuruWaliGroup = useMemo(() => {
    if (isStudent) return null;
    return masterGuruWaliList.find(gw => matchTeacherNames(currentUser.name, gw.namaGuru)) || null;
  }, [isStudent, currentUser.name, masterGuruWaliList]);

  const myGuruWaliGroupId = useMemo(() => {
    if (!myGuruWaliGroup) return null;
    const slug = myGuruWaliGroup.namaGuru.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 20);
    return `group-gw-${slug}`;
  }, [myGuruWaliGroup]);

  // Initial active channel:
  // - Students start on their own class group!
  // - TU staff start on Tata Usaha group
  // - Teachers start on their first assigned class group or Ruang Guru SMK 2
  const [activeChannelId, setActiveChannelId] = useState<string>(() => {
    if (isStudent) {
      return studentClassGroupId;
    }
    if (isTuStaff) {
      return "group-tata-usaha-utama";
    }
    if (myAccessibleClassGroupIds.length > 0) {
      return myAccessibleClassGroupIds[0];
    }
    return "group-guru-smk2";
  });

  // Active Category filter state:
  // For students: "all" (their allowed channels), "kelas_saya", "guru_wali_saya", "teacher" (tanya guru)
  // For teachers/staff: "all", "tu", "guru_staff", "kelas_wali", "guru_wali", "direct"
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Load custom groups from localStorage and Firestore
  useEffect(() => {
    const rawLocal = localStorage.getItem("sihadir_custom_chat_groups");
    if (rawLocal) {
      try {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed)) setCustomGroups(parsed);
      } catch (e) {}
    }

    const unsubGroups = dbService.subscribeRecords("school_chat_custom_groups", (records) => {
      if (records && records.length > 0) {
        setCustomGroups(records as ChatChannel[]);
        localStorage.setItem("sihadir_custom_chat_groups", JSON.stringify(records));
      }
    });

    return () => unsubGroups();
  }, []);

  // Cooldown countdown timer effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Real-time Cloud Firestore subscription for messages
  useEffect(() => {
    const unsub = dbService.subscribeRecords("school_chat_messages", (records) => {
      if (records && records.length > 0) {
        const sorted = (records as ChatMessage[]).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(sorted);
      } else {
        const initialSeed: ChatMessage[] = [
          {
            id: "msg-init-1",
            channelId: "group-guru-smk2",
            senderId: "T03",
            senderName: "ANDI ASRUL UMAR",
            senderRole: "kurikulum",
            senderRoleTitle: "Waka Kurikulum",
            senderAvatar: "https://ui-avatars.com/api/?name=Andi+Asrul&background=1e3a8a&color=fff",
            text: "Selamat datang Bapak/Ibu Guru dan Staf di Kolom Chatting Sihadir SMK Negeri 2 Konawe. Silakan koordinasi KBM dan administrasi kelas secara tertib.",
            timestamp: Date.now() - 1000 * 60 * 60 * 3,
            dateStr: new Date(Date.now() - 1000 * 60 * 60 * 3).toLocaleDateString("id-ID"),
            timeStr: "07:30"
          },
          {
            id: "msg-init-tu",
            channelId: "group-tata-usaha-utama",
            senderId: "TU-01",
            senderName: "ADMIN TATA USAHA",
            senderRole: "tu",
            senderRoleTitle: "Kepala Urusan TU",
            senderAvatar: "https://ui-avatars.com/api/?name=Admin+TU&background=475569&color=fff",
            text: "Grup Tata Usaha dibuka untuk koordinasi persuratan, mutasi siswa, penerbitan surat tugas, dan pengarsipan digital.",
            timestamp: Date.now() - 1000 * 60 * 120,
            dateStr: new Date().toLocaleDateString("id-ID"),
            timeStr: "08:15"
          },
          {
            id: "msg-init-kelas-xi-tkr-a",
            channelId: "group-kelas-xi-tkr-a",
            senderId: "T13",
            senderName: "HAERUL, S.Pd",
            senderRole: "wali",
            senderRoleTitle: "Wali Kelas XI TKR A",
            senderAvatar: "https://ui-avatars.com/api/?name=Haerul&background=047857&color=fff",
            text: "Selamat pagi anak-anak kelas XI TKR A. Silakan gunakan grup kelas resmi ini untuk informasi kehadiran, tugas KBM, dan pengumuman sekolah.",
            timestamp: Date.now() - 1000 * 60 * 45,
            dateStr: new Date().toLocaleDateString("id-ID"),
            timeStr: "08:30"
          }
        ];
        initialSeed.forEach(m => dbService.saveRecord("school_chat_messages", m.id, m));
        setMessages(initialSeed);
      }
    });

    return () => unsub();
  }, []);

  // 4. Build Available Channels with STRICT ROLE ACCESS
  const allChannels: ChatChannel[] = useMemo(() => {
    // === IF CURRENT USER IS STUDENT ===
    // Strictly ONLY:
    // 1. Their own class group
    // 2. Their own Guru Wali group
    // 3. Direct messaging with teachers (for consultation)
    if (isStudent) {
      const studentChannels: ChatChannel[] = [];

      // 1. Student's Own Class Group
      if (matchedStudentWaliKelas) {
        studentChannels.push({
          id: studentClassGroupId,
          type: "group",
          name: `Kelas ${matchedStudentWaliKelas.className} (Wali: ${matchedStudentWaliKelas.namaWaliKelas})`,
          description: `Ruang koordinasi KBM, absensi, dan pengumuman kelas ${matchedStudentWaliKelas.className} bersama Wali Kelas ${matchedStudentWaliKelas.namaWaliKelas}`,
          roleBadge: `⭐ Kelas Saya (${matchedStudentWaliKelas.className})`,
          category: "group",
          subCategory: "kelas_wali",
          targetClass: matchedStudentWaliKelas.className,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedStudentWaliKelas.className)}&background=047857&color=fff&bold=true`
        });
      }

      // 2. Student's Own Guru Wali Group
      if (matchedStudentGuruWali && studentGuruWaliGroupId) {
        studentChannels.push({
          id: studentGuruWaliGroupId,
          type: "group",
          name: `Bimbingan: ${matchedStudentGuruWali.namaGuru}`,
          description: `Ruang pembinaan karakter asuh dan pendampingan belajar bersama Guru Wali ${matchedStudentGuruWali.namaGuru}`,
          roleBadge: `⭐ Guru Wali Saya`,
          category: "group",
          subCategory: "guru_wali",
          assignedStudents: matchedStudentGuruWali.muridList.map(m => m.nama),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedStudentGuruWali.namaGuru.split(",")[0])}&background=0284c7&color=fff&bold=true`
        });
      }

      return studentChannels;
    }

    // === IF CURRENT USER IS GURU, STAF TATA USAHA, OR ADMIN ===
    // All groups are accessible, separated into categories!
    const staffChannels: ChatChannel[] = [];

    // Current teacher's identity for personalized sorting/pinning
    const currentUserNameUpper = (currentUser.name || "").toUpperCase();

    // A. Tata Usaha (TU) Groups
    const tuList: ChatChannel[] = [
      {
        id: "group-tata-usaha-utama",
        type: "group",
        name: "Ruang Layanan Tata Usaha (TU)",
        description: "Saluran koordinasi administrasi sekolah, surat dinas, arsip digital, dan legalisir berkas TU",
        roleBadge: "Admin & Staf TU",
        category: "group",
        subCategory: "tu",
        avatar: `https://ui-avatars.com/api/?name=Tata+Usaha&background=475569&color=fff&bold=true`
      },
      {
        id: "group-tu-layanan-siswa",
        type: "group",
        name: "Pusat Administrasi & Arsip Siswa TU",
        description: "Layanan surat keterangan aktif, validasi NISN, mutasi siswa, dan pencetakan buku induk",
        roleBadge: "Layanan TU",
        category: "group",
        subCategory: "tu",
        avatar: `https://ui-avatars.com/api/?name=Layanan+TU&background=64748b&color=fff&bold=true`
      }
    ];

    // B. Ruang Guru & Staf Groups (Hanya Ruang Guru & Staf Resmi)
    const guruStaffList: ChatChannel[] = [
      {
        id: "group-guru-smk2",
        type: "group",
        name: "Ruang Guru & Staf SMK 2 Konawe",
        description: "Saluran koordinasi kedinasan dewan guru, informasi KBM, dan tenaga kependidikan",
        roleBadge: "Grup Kedinasan",
        category: "group",
        subCategory: "guru_staff",
        avatar: `https://ui-avatars.com/api/?name=SMKN+2+Konawe&background=1e293b&color=fff&bold=true`
      }
    ];

    // C. Class & Wali Kelas Groups (Strict: Hanya kelas perwalian guru atau kelas yang diajar pada jadwal KBM)
    const classGroups: ChatChannel[] = WALI_KELAS_LIST
      .filter(item => {
        const isMyWali = matchTeacherNames(currentUser.name, item.namaWaliKelas) || 
                         getWaliKelasPerwalianClass(currentUser.name) === item.className;
        const isTeaching = teacherAssignedClasses.includes(item.className);
        return isMyWali || isTeaching;
      })
      .map(item => {
        const slug = item.className.toLowerCase().replace(/\s+/g, "-");
        const isMyWaliClass = matchTeacherNames(currentUser.name, item.namaWaliKelas) || 
                              getWaliKelasPerwalianClass(currentUser.name) === item.className;

        return {
          id: `group-kelas-${slug}`,
          type: "group" as const,
          name: `Kelas ${item.className} (Wali: ${item.namaWaliKelas})`,
          description: `Ruang koordinasi KBM, absensi, dan siswa kelas ${item.className} bersama Wali Kelas ${item.namaWaliKelas}`,
          roleBadge: isMyWaliClass ? `⭐ Perwalian Saya (${item.className})` : `Kelas ${item.className}`,
          category: "group" as const,
          subCategory: "kelas_wali" as const,
          targetClass: item.className,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.className)}&background=${isMyWaliClass ? "047857" : "0f766e"}&color=fff&bold=true`
        };
      }).sort((a, b) => {
        if (a.roleBadge?.includes("⭐")) return -1;
        if (b.roleBadge?.includes("⭐")) return 1;
        return a.name.localeCompare(b.name);
      });

    // D. Guru Wali Groups (Filtered: Only teacher's own binaan group, unless Super Admin/Principal)
    const gwGroups: ChatChannel[] = [];
    if (isSuperAdminOrPrincipal) {
      gwGroups.push({
        id: "group-guru-wali-binaan-all",
        type: "group",
        name: "Forum Guru Wali & Seluruh Binaan",
        description: "Saluran umum pendampingan karakter, motivasi belajar, dan komunikasi lintas guru wali dengan seluruh siswa",
        roleBadge: "Forum Guru Wali",
        category: "group",
        subCategory: "guru_wali",
        avatar: `https://ui-avatars.com/api/?name=Guru+Wali&background=0d9488&color=fff&bold=true`
      });

      masterGuruWaliList.forEach(gw => {
        const slug = gw.namaGuru.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 20);
        gwGroups.push({
          id: `group-gw-${slug}`,
          type: "group",
          name: `Bimbingan: ${gw.namaGuru} (${gw.muridList.length} Murid)`,
          description: `Ruang pembinaan khusus ${gw.namaGuru} bersama ${gw.muridList.length} siswa binaan asuh`,
          roleBadge: "Guru Wali",
          category: "group",
          subCategory: "guru_wali",
          assignedStudents: gw.muridList.map(m => m.nama),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(gw.namaGuru.split(",")[0])}&background=0284c7&color=fff&bold=true`
        });
      });
    } else if (myGuruWaliGroup) {
      const slug = myGuruWaliGroup.namaGuru.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 20);
      gwGroups.push({
        id: `group-gw-${slug}`,
        type: "group",
        name: `Bimbingan: ${myGuruWaliGroup.namaGuru} (${myGuruWaliGroup.muridList.length} Murid)`,
        description: `Ruang pembinaan khusus ${myGuruWaliGroup.namaGuru} bersama ${myGuruWaliGroup.muridList.length} siswa binaan asuh Anda`,
        roleBadge: "⭐ Binaan Saya",
        category: "group",
        subCategory: "guru_wali",
        assignedStudents: myGuruWaliGroup.muridList.map(m => m.nama),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(myGuruWaliGroup.namaGuru.split(",")[0])}&background=0284c7&color=fff&bold=true`
      });
    }

    // For custom groups, filter out TU-categorized groups if user is not TU staff or Super Admin
    const accessibleCustomGroups = (isTuStaff || isSuperAdminOrPrincipal)
      ? customGroups
      : customGroups.filter(cg => cg.subCategory !== "tu");

    // Combine in logical order: TU first if TU user, or Ruang Guru first if Teacher
    if (isTuStaff || isSuperAdminOrPrincipal) {
      staffChannels.push(...tuList, ...guruStaffList, ...classGroups, ...gwGroups, ...accessibleCustomGroups);
    } else {
      // Hapus grup Tata Usaha (tuList) untuk akun guru / pendidik di kolom chatting
      staffChannels.push(...guruStaffList, ...classGroups, ...gwGroups, ...accessibleCustomGroups);
    }

    return staffChannels;
  }, [
    isStudent, 
    isTuStaff, 
    isSuperAdminOrPrincipal,
    teacherAssignedClasses,
    myGuruWaliGroup,
    currentUser.name, 
    matchedStudentWaliKelas, 
    studentClassGroupId, 
    matchedStudentGuruWali, 
    studentGuruWaliGroupId, 
    teachersList, 
    studentsList, 
    masterGuruWaliList, 
    customGroups
  ]);

  // Security Check: is a channel allowed for current user?
  const isChannelAllowed = useMemo(() => {
    return (chId: string) => {
      // 1. Institutional Admins / Principal have universal access
      if (isSuperAdminOrPrincipal) return true;

      // 2. Student restrictions:
      if (isStudent) {
        if (chId === studentClassGroupId) return true;
        if (studentGuruWaliGroupId && chId === studentGuruWaliGroupId) return true;
        return false;
      }

      // 3. General teacher channels
      if (chId === "group-guru-smk2") {
        return true;
      }

      // 4. Tata Usaha (TU) channels: Hanya diizinkan untuk Staf Tata Usaha & Admin Utama (bukan akun guru)
      if (chId.startsWith("group-tata-usaha") || chId.startsWith("group-tu-")) {
        return isTuStaff || isSuperAdminOrPrincipal;
      }

      // 5. Class groups: STRICTLY ONLY if teacher is Wali Kelas or teaches in that class
      if (chId.startsWith("group-kelas-")) {
        return myAccessibleClassGroupIds.includes(chId);
      }

      // 6. Guru Wali groups: STRICTLY ONLY teacher's own bimbingan group
      if (chId.startsWith("group-gw-")) {
        return myGuruWaliGroupId === chId;
      }

      // 7. Custom groups created by staff
      const isCustom = customGroups.some(cg => cg.id === chId);
      if (isCustom) return true;

      return false;
    };
  }, [
    isSuperAdminOrPrincipal, 
    isStudent, 
    isTuStaff,
    studentClassGroupId, 
    studentGuruWaliGroupId, 
    myAccessibleClassGroupIds, 
    myGuruWaliGroupId,
    customGroups
  ]);

  // Auto-redirect if user is currently on an unauthorized channel
  useEffect(() => {
    if (!isChannelAllowed(activeChannelId)) {
      if (isStudent) {
        setActiveChannelId(studentClassGroupId);
      } else if (isTuStaff) {
        setActiveChannelId("group-tata-usaha-utama");
      } else {
        if (myAccessibleClassGroupIds.length > 0) {
          setActiveChannelId(myAccessibleClassGroupIds[0]);
        } else {
          setActiveChannelId("group-guru-smk2");
        }
      }
    }
  }, [isStudent, isTuStaff, activeChannelId, isChannelAllowed, studentClassGroupId, myAccessibleClassGroupIds]);

  // Filter channels based on activeCategory and searchQuery
  const filteredChannels = useMemo(() => {
    return allChannels.filter(c => {
      // First ensure it's allowed
      if (!isChannelAllowed(c.id)) return false;

      let matchCat = true;

      if (isStudent) {
        if (activeCategory === "kelas_saya") {
          matchCat = c.id === studentClassGroupId;
        } else if (activeCategory === "guru_wali_saya") {
          matchCat = c.id === studentGuruWaliGroupId;
        }
      } else {
        // Teacher / TU filters
        if (activeCategory === "tu") {
          matchCat = c.subCategory === "tu";
        } else if (activeCategory === "guru_staff") {
          matchCat = c.subCategory === "guru_staff";
        } else if (activeCategory === "kelas_wali") {
          matchCat = c.subCategory === "kelas_wali";
        } else if (activeCategory === "guru_wali") {
          matchCat = c.subCategory === "guru_wali";
        }
      }

      const matchSearch = searchQuery === "" || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.roleBadge && c.roleBadge.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchSearch;
    });
  }, [allChannels, isChannelAllowed, isStudent, activeCategory, searchQuery, studentClassGroupId, studentGuruWaliGroupId]);

  // Messages in active channel
  const activeMessages = useMemo(() => {
    return messages.filter(m => m.channelId === activeChannelId);
  }, [messages, activeChannelId]);

  const activeChannel = useMemo(() => {
    return allChannels.find(c => c.id === activeChannelId) || allChannels[0];
  }, [allChannels, activeChannelId]);

  // Reset member search query and filter when channel changes
  useEffect(() => {
    setMemberSearchQuery("");
    setMemberRoleFilter("all");
  }, [activeChannelId]);

  // Derive ALL Group Members for active channel (Class Wali, Guru Wali, Staf TU, and All Students)
  const activeGroupMembers = useMemo(() => {
    if (!activeChannel) return [];

    // 1. CLASS GROUP (Kelas & Wali)
    if (activeChannel.subCategory === "kelas_wali" || activeChannel.targetClass) {
      const targetClass = activeChannel.targetClass || resolvedStudentClass || "XI TKR A";
      const cleanTarget = targetClass.toLowerCase().replace(/[^a-z0-9]/g, "");

      // Find Wali Kelas
      const waliObj = WALI_KELAS_LIST.find(w => {
        const cClean = w.className.toLowerCase().replace(/[^a-z0-9]/g, "");
        return cClean === cleanTarget || cleanTarget.includes(cClean) || cClean.includes(cleanTarget);
      }) || matchedStudentWaliKelas || { className: targetClass, namaWaliKelas: "ARHAM AMIRUDDIN, S.Pd, Gr." };

      const isWaliMe = !isStudent && matchTeacherNames(currentUser.name, waliObj.namaWaliKelas);

      const waliMember = {
        id: `wali-${waliObj.namaWaliKelas.replace(/[^a-zA-Z0-9]/g, "_")}`,
        name: waliObj.namaWaliKelas,
        role: "wali_kelas" as const,
        roleLabel: `Wali Kelas ${waliObj.className}`,
        kelas: waliObj.className,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(waliObj.namaWaliKelas.split(",")[0])}&background=047857&color=fff&bold=true`,
        isCurrentUser: isWaliMe
      };

      // Get all subject teachers who teach in this class (from schedule & master list)
      const classTeachers = getTeachersForClass(targetClass, teachersList);
      const teachingTeacherMembers = classTeachers
        .filter(t => !matchTeacherNames(t.name, waliObj.namaWaliKelas))
        .map(t => {
          const isMe = !isStudent && matchTeacherNames(currentUser.name, t.name);
          return {
            id: `teacher-${t.name.replace(/[^a-zA-Z0-9]/g, "_")}`,
            name: t.name,
            role: "guru" as const,
            roleLabel: t.subjectName ? `Guru Mapel (${t.subjectName})` : "Guru Pengajar",
            kelas: targetClass,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name.split(",")[0])}&background=${isMe ? "059669" : "1e293b"}&color=fff`,
            isCurrentUser: isMe
          };
        });

      teachingTeacherMembers.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;
        return a.name.localeCompare(b.name);
      });

      // Filter all students registered in this class
      const rawClassStudents = studentsList.filter((s: any) => {
        const cClean = (s.className || s.class || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return cClean === cleanTarget || cClean.includes(cleanTarget) || cleanTarget.includes(cClean);
      });

      // Fallback: If rawClassStudents is empty, check masterGuruWaliList for students of this class
      if (rawClassStudents.length === 0) {
        masterGuruWaliList.forEach(gw => {
          gw.muridList.forEach(m => {
            const mClean = (m.kelas || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            if (mClean === cleanTarget && !rawClassStudents.some((s: any) => s.name.toLowerCase() === m.nama.toLowerCase())) {
              rawClassStudents.push({
                id: m.id,
                name: m.nama,
                className: targetClass,
                nis: "-",
                nisn: "-"
              });
            }
          });
        });
      }

      // Check if current user is student in this class and ensure their name is present
      const isCurrentStudentBelongToThisClass = isStudent && (
        resolvedStudentClass.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanTarget
      );

      const currentNameClean = (currentUser.name || "").toLowerCase().trim();
      const alreadyInList = rawClassStudents.some((s: any) => 
        (s.name || "").toLowerCase().trim() === currentNameClean || (s.id && s.id === currentUser.id)
      );

      const finalStudents = [...rawClassStudents];
      if (isCurrentStudentBelongToThisClass && !alreadyInList) {
        finalStudents.unshift({
          id: currentUser.id || "student-me",
          name: currentUser.name,
          className: targetClass,
          nis: "24099",
          nisn: "0112345678"
        });
      }

      const studentMembers = finalStudents.map((s: any) => {
        const isMe = isStudent && (
          (s.name || "").toLowerCase().trim() === currentNameClean || (s.id && s.id === currentUser.id)
        );
        const isKk = isMe && (currentUser.role === "ketua_kelas");

        return {
          id: s.id || `std-${s.name.replace(/[^a-zA-Z0-9]/g, "_")}`,
          name: s.name,
          role: (isKk ? "ketua_kelas" : "siswa") as "ketua_kelas" | "siswa",
          roleLabel: isKk ? "Ketua Kelas" : "Siswa",
          kelas: s.className || s.class || targetClass,
          nis: s.nis || "-",
          nisn: s.nisn || "-",
          avatar: s.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=${isMe ? "059669" : "0284c7"}&color=fff`,
          isCurrentUser: isMe
        };
      });

      // Sort: current student first, then Ketua Kelas, then alphabetical
      studentMembers.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;
        if (a.role === "ketua_kelas") return -1;
        if (b.role === "ketua_kelas") return 1;
        return a.name.localeCompare(b.name);
      });

      return [waliMember, ...teachingTeacherMembers, ...studentMembers];
    }

    // 2. GURU WALI GROUP (Bimbingan Asuh)
    if (activeChannel.subCategory === "guru_wali") {
      const targetGw = masterGuruWaliList.find(gw => {
        const slug = gw.namaGuru.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 20);
        return activeChannel.id === `group-gw-${slug}` || activeChannel.name.includes(gw.namaGuru);
      }) || matchedStudentGuruWali || masterGuruWaliList[0];

      const isGwMe = !isStudent && matchTeacherNames(currentUser.name, targetGw.namaGuru);

      const gwTeacherMember = {
        id: `gw-${targetGw.namaGuru.replace(/[^a-zA-Z0-9]/g, "_")}`,
        name: targetGw.namaGuru,
        role: "guru_wali" as const,
        roleLabel: "Guru Wali Pembina Asuh",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(targetGw.namaGuru.split(",")[0])}&background=0284c7&color=fff&bold=true`,
        isCurrentUser: isGwMe
      };

      const currentNameClean = (currentUser.name || "").toLowerCase().trim();

      const binaanStudents = targetGw.muridList.map(m => {
        const mNameClean = (m.nama || "").toLowerCase().trim();
        const isMe = isStudent && (
          mNameClean === currentNameClean || 
          (currentNameClean.length > 3 && mNameClean.includes(currentNameClean)) ||
          (mNameClean.length > 3 && currentNameClean.includes(mNameClean))
        );

        return {
          id: m.id,
          name: m.nama,
          role: "siswa" as const,
          roleLabel: `Binaan (${m.kelas})`,
          kelas: m.kelas,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nama)}&background=${isMe ? "059669" : "0284c7"}&color=fff`,
          isCurrentUser: isMe
        };
      });

      const isMyGwGroup = matchedStudentGuruWali && matchedStudentGuruWali.id === targetGw.id;
      const hasMe = binaanStudents.some(b => b.isCurrentUser);
      if (isStudent && isMyGwGroup && !hasMe) {
        binaanStudents.unshift({
          id: "student-binaan-me",
          name: currentUser.name,
          role: "siswa" as const,
          roleLabel: `Binaan (${resolvedStudentClass})`,
          kelas: resolvedStudentClass,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=059669&color=fff`,
          isCurrentUser: true
        });
      }

      binaanStudents.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;
        return a.name.localeCompare(b.name);
      });

      return [gwTeacherMember, ...binaanStudents];
    }

    // 3. TATA USAHA (TU)
    if (activeChannel.subCategory === "tu") {
      return [
        {
          id: "tu-01",
          name: "SAKTINANI DJUNAID",
          role: "staf_tu" as const,
          roleLabel: "Admin Tata Usaha (Kepala Urusan)",
          avatar: "https://ui-avatars.com/api/?name=Saktinani&background=475569&color=fff",
          isCurrentUser: currentUser.name.toUpperCase().includes("SAKTINANI")
        },
        {
          id: "tu-02",
          name: "ADELIA PUSPARINI",
          role: "staf_tu" as const,
          roleLabel: "Staf Tata Usaha (Persuratan)",
          avatar: "https://ui-avatars.com/api/?name=Adelia&background=475569&color=fff",
          isCurrentUser: currentUser.name.toUpperCase().includes("ADELIA")
        },
        {
          id: "tu-03",
          name: "ANDI ARFAN UMAR",
          role: "staf_tu" as const,
          roleLabel: "Staf TU (Keuangan & Administrasi)",
          avatar: "https://ui-avatars.com/api/?name=Andi+Arfan&background=475569&color=fff",
          isCurrentUser: currentUser.name.toUpperCase().includes("ARFAN")
        },
        {
          id: "tu-04",
          name: "ELPI",
          role: "staf_tu" as const,
          roleLabel: "Staf TU (Kearsipan Digital)",
          avatar: "https://ui-avatars.com/api/?name=Elpi&background=475569&color=fff",
          isCurrentUser: currentUser.name.toUpperCase().includes("ELPI")
        },
        {
          id: "tu-05",
          name: "KOMANG HERNY PITRIANI",
          role: "staf_tu" as const,
          roleLabel: "Staf TU (Kepegawaian)",
          avatar: "https://ui-avatars.com/api/?name=Komang&background=475569&color=fff",
          isCurrentUser: currentUser.name.toUpperCase().includes("KOMANG")
        },
        {
          id: "tu-06",
          name: "WIDI AYUDIA NATASYA. B",
          role: "staf_tu" as const,
          roleLabel: "Staf TU (Administrasi Siswa)",
          avatar: "https://ui-avatars.com/api/?name=Widi&background=475569&color=fff",
          isCurrentUser: currentUser.name.toUpperCase().includes("WIDI")
        }
      ];
    }

    // 4. RUANG GURU & STAF (Kedinasan)
    if (activeChannel.subCategory === "guru_staff") {
      return teachersList.slice(0, 37).map((t: any) => ({
        id: t.id || t.nip,
        name: t.name,
        role: "guru" as const,
        roleLabel: t.role || "Guru Pengajar",
        avatar: t.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=1e293b&color=fff`,
        isCurrentUser: !isStudent && currentUser.name.toUpperCase().includes(t.name.toUpperCase().split(",")[0].trim())
      }));
    }

    // 5. DIRECT MESSAGE
    if (activeChannel.type === "direct") {
      return [
        {
          id: currentUser.id,
          name: currentUser.name,
          role: (isStudent ? "siswa" : "guru") as "siswa" | "guru",
          roleLabel: isStudent ? `Siswa (${resolvedStudentClass})` : (currentUser.roleTitle || "Guru"),
          avatar: currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=047857&color=fff`,
          isCurrentUser: true
        },
        {
          id: activeChannel.id,
          name: activeChannel.name,
          role: "guru" as const,
          roleLabel: activeChannel.roleBadge || "Pendidik",
          avatar: activeChannel.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChannel.name)}&background=0284c7&color=fff`,
          isCurrentUser: false
        }
      ];
    }

    return [];
  }, [
    activeChannel, 
    isStudent, 
    currentUser, 
    resolvedStudentClass, 
    matchedStudentWaliKelas, 
    matchedStudentGuruWali, 
    studentsList, 
    teachersList, 
    masterGuruWaliList
  ]);

  // Filtered members for member drawer search and tabs
  const filteredGroupMembers = useMemo(() => {
    return activeGroupMembers.filter(m => {
      // Filter by role
      if (memberRoleFilter === "wali") {
        if (m.role !== "wali_kelas" && m.role !== "guru_wali" && m.role !== "guru" && m.role !== "staf_tu") return false;
      } else if (memberRoleFilter === "siswa") {
        if (m.role !== "siswa" && m.role !== "ketua_kelas") return false;
      }

      // Filter by search text
      if (!memberSearchQuery.trim()) return true;
      const q = memberSearchQuery.toLowerCase().trim();
      return (
        m.name.toLowerCase().includes(q) ||
        (m.roleLabel && m.roleLabel.toLowerCase().includes(q)) ||
        ((m as any).nis && (m as any).nis.includes(q)) ||
        ((m as any).nisn && (m as any).nisn.includes(q)) ||
        ((m as any).kelas && (m as any).kelas.toLowerCase().includes(q))
      );
    });
  }, [activeGroupMembers, memberRoleFilter, memberSearchQuery]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  // Send Message with Student Restrictions
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;

    // Security check
    if (!isChannelAllowed(activeChannelId)) {
      alert("Akses dibatasi! Anda tidak memiliki izin mengirim pesan di grup ini.");
      return;
    }

    // Restriction 1: Student time check
    if (isStudent && !isStudentAllowedByTime) {
      alert("Kolom pesan untuk siswa hanya dibuka pukul 06.30 - 17.30 WITA. Di luar jam tersebut siswa diharapkan beristirahat.");
      return;
    }

    // Restriction 2: Student cooldown check
    if (isStudent && cooldownRemaining > 0) {
      alert(`Mohon tunggu ${cooldownRemaining} detik lagi sebelum mengirim pesan berikutnya (perlindungan anti-spam).`);
      return;
    }

    // Restriction 3: Character length cap
    if (isStudent && clean.length > MAX_STUDENT_CHARS) {
      alert(`Pesan siswa maksimal ${MAX_STUDENT_CHARS} karakter. Mohon persingkat pertanyaan Anda.`);
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    const newMsg: ChatMessage = {
      id: "msg-" + Date.now().toString() + "-" + Math.random().toString(36).substring(2, 6),
      channelId: activeChannelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderRoleTitle: currentUser.roleTitle,
      senderAvatar: currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=047857&color=fff`,
      senderClass: currentUser.kelas || resolvedStudentClass || "",
      text: clean,
      timestamp: Date.now(),
      dateStr: dateStr,
      timeStr: timeStr,
      readBy: [currentUser.id],
      replyTo: replyingTo ? replyingTo : undefined
    };

    // Save to Firestore
    dbService.saveRecord("school_chat_messages", newMsg.id, newMsg);
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setReplyingTo(null);
    setShowEmojiPicker(false);

    // Trigger anti-spam cooldown for students
    if (isStudent) {
      setCooldownRemaining(STUDENT_COOLDOWN_SECS);
    }
  };

  const handleReplyMessage = (msg: ChatMessage) => {
    setReplyingTo({
      id: msg.id,
      senderName: msg.senderName,
      text: msg.text
    });
    const mentionTag = `@${msg.senderName.split(",")[0].trim()} `;
    setInputText(prev => {
      if (prev.includes(mentionTag)) return prev;
      return mentionTag + prev;
    });
  };

  const handleMentionMember = (memberName: string) => {
    const mentionTag = `@${memberName.split(",")[0].trim()} `;
    setInputText(prev => {
      if (prev.includes(mentionTag)) return prev;
      return mentionTag + prev;
    });
    setShowMembersDrawer(false);
  };

  const renderMessageContent = (text: string, isMe: boolean) => {
    const parts = text.split(/(@[A-Za-z0-9_., ]+?)(?=[ \n]|$)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@") && part.length > 2) {
        return (
          <span
            key={i}
            className={`font-semibold px-1 py-0.5 rounded text-[10px] inline-block ${
              isMe
                ? "bg-emerald-700/80 text-emerald-100 border border-emerald-400/40"
                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
            }`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleDeleteMessage = (msgId: string) => {
    if (window.confirm("Hapus pesan ini dari obrolan?")) {
      dbService.deleteRecord("school_chat_messages", msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    }
  };

  // Handler to create a new group (Teachers and Staff only)
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      alert("Nama grup tidak boleh kosong.");
      return;
    }

    const groupId = `custom-group-${Date.now()}`;
    const newGroup: ChatChannel = {
      id: groupId,
      type: "group",
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || `Grup dibuat oleh ${currentUser.name} (${currentUser.roleTitle})`,
      roleBadge: newGroupBadge.trim() || (newGroupCategory === "tu" ? "Tata Usaha" : newGroupCategory === "guru_staff" ? "Ruang Staf" : "Grup Resmi"),
      category: "group",
      subCategory: newGroupCategory,
      createdBy: currentUser.id,
      createdAt: Date.now(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newGroupName.trim())}&background=059669&color=fff&bold=true`
    };

    // Welcome message
    const welcomeMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      channelId: groupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderRoleTitle: currentUser.roleTitle,
      senderAvatar: currentUser.avatar,
      text: `🎉 Grup "${newGroup.name}" resmi dibuat oleh ${currentUser.name}. Mari gunakan ruang ini untuk koordinasi yang efektif, santun, dan bermanfaat!`,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString("id-ID"),
      timeStr: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    // Save group and welcome message
    dbService.saveRecord("school_chat_custom_groups", groupId, newGroup);
    dbService.saveRecord("school_chat_messages", welcomeMsg.id, welcomeMsg);

    const updated = [newGroup, ...customGroups];
    setCustomGroups(updated);
    localStorage.setItem("sihadir_custom_chat_groups", JSON.stringify(updated));

    // Reset and select
    setNewGroupName("");
    setNewGroupDesc("");
    setNewGroupBadge("");
    setShowNewGroupModal(false);
    setActiveChannelId(groupId);
    setIsMobileChatOpen(true);
  };

  const templatesToUse = isStudent ? QUICK_TEMPLATES_STUDENT : QUICK_TEMPLATES_STAFF;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[470px] sm:h-[490px] md:h-[510px] max-h-[calc(100vh-220px)] min-h-[420px] font-sans">
      
      {/* HEADER: Kolom Chatting Sihadir (Compact) */}
      <div className="bg-slate-900 text-white px-3.5 py-2 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-tight">Kolom Chatting Sihadir</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-semibold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                Online
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">
              {isStudent 
                ? `Ruang Khusus Kelas ${resolvedStudentClass} & Guru Wali Binaan`
                : "Akses Terpadu Pendidik, Staf Tata Usaha & Siswa"}
            </p>
          </div>
        </div>

        {/* Action Button: + Tambah Grup (HANYA UNTUK GURU & STAF TU) & User Profile */}
        <div className="flex items-center gap-2">
          {!isStudent && (
            <button
              type="button"
              onClick={() => setShowNewGroupModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Buat Grup Baru"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tambah Grup</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
            <img 
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=047857&color=fff`} 
              alt={currentUser.name} 
              className="w-5 h-5 rounded-full object-cover"
            />
            <div className="text-left hidden md:block">
              <span className="text-[10px] font-semibold text-slate-200 block truncate max-w-[110px] leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[8px] text-emerald-400 block leading-none">
                {isStudent ? `Siswa ${resolvedStudentClass}` : currentUser.roleTitle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ACCESS CONTROL BANNER */}
      {isStudent ? (
        <div className="bg-emerald-50/90 border-b border-emerald-100 px-3 py-1 flex items-center justify-between text-[10px] text-emerald-950 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              <strong>Hak Akses Siswa Terproteksi:</strong> Hanya grup <strong>Kelas {resolvedStudentClass}</strong> & <strong>Binaan {matchedStudentGuruWali?.namaGuru || "Guru Wali"}</strong>.
            </span>
          </div>
          <span className="font-semibold text-emerald-700 shrink-0 pl-1 font-mono text-[9px]">
            {isStudentAllowedByTime ? "🟢 Jam Aktif (06.30 - 17.30)" : "🔴 Di Luar Jam KBM"}
          </span>
        </div>
      ) : (
        <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1 flex items-center justify-between text-[10px] text-slate-700 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              {isTuStaff ? (
                <><strong>Kategori Administrasi:</strong> Saluran Tata Usaha (TU), Ruang Staf, dan Koordinasi Sekolah.</>
              ) : (
                <><strong>Kategori Dewan Guru:</strong> Ruang Guru, Kelas & Wali, dan Bimbingan Guru Wali.</>
              )}
            </span>
          </div>
          <span className="bg-slate-200 text-slate-700 text-[8px] font-bold px-1.5 py-0.2 rounded-md shrink-0">
            {isTuStaff ? "Akses Administrasi TU" : "Akses Pendidik & Guru"}
          </span>
        </div>
      )}

      {/* MAIN CONTAINER: Split View */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        
        {/* LEFT PANEL: Saluran & Kontak */}
        <div className={`
          w-full md:w-72 lg:w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 min-h-0 overflow-hidden
          ${isMobileChatOpen ? "hidden md:flex" : "flex"}
        `}>
          {/* Search bar & Category filters */}
          <div className="p-2 bg-white border-b border-slate-200 shrink-0">
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isStudent ? "Cari ruang kelas atau guru..." : (isTuStaff ? "Cari kelas, wali, TU, guru..." : "Cari kelas, wali kelas, guru...")}
                className="w-full pl-7 pr-2.5 py-1 bg-slate-100 text-slate-800 placeholder:text-slate-400 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Filter categories tabs: CUSTOMIZED FOR STUDENT VS TEACHER */}
            <div className="flex items-center gap-1 mt-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {isStudent ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                      activeCategory === "all" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("kelas_saya")}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      activeCategory === "kelas_saya" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Users className="w-2.5 h-2.5" />
                    Kelas Saya
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("guru_wali_saya")}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      activeCategory === "guru_wali_saya" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <HeartHandshake className="w-2.5 h-2.5" />
                    Guru Wali Saya
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                      activeCategory === "all" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Semua
                  </button>
                  {(isTuStaff || isSuperAdminOrPrincipal) && (
                    <button
                      type="button"
                      onClick={() => setActiveCategory("tu")}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        activeCategory === "tu" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <FileText className="w-2.5 h-2.5" />
                      Tata Usaha (TU)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveCategory("guru_staff")}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      activeCategory === "guru_staff" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Briefcase className="w-2.5 h-2.5" />
                    Ruang Guru
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("kelas_wali")}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      activeCategory === "kelas_wali" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Users className="w-2.5 h-2.5" />
                    Kelas & Wali
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("guru_wali")}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      activeCategory === "guru_wali" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <HeartHandshake className="w-2.5 h-2.5" />
                    Guru Wali
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List Channels */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 bg-white">
            {filteredChannels.length === 0 ? (
              <div className="p-5 text-center text-slate-400 text-xs">
                {isStudent ? (
                  "Tidak ada saluran lain. Anda hanya terhubung dengan kelas dan Guru Wali resmi Anda."
                ) : activeCategory === "kelas_wali" ? (
                  <div className="py-2">
                    <p className="font-bold text-slate-600">Tidak ada grup kelas</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Sistem hanya menampilkan grup kelas tempat Anda mengajar atau bertugas sebagai Wali Kelas.
                    </p>
                  </div>
                ) : activeCategory === "guru_wali" ? (
                  <div className="py-2">
                    <p className="font-bold text-slate-600">Tidak ada grup Guru Wali</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Hanya grup bimbingan asuh Anda sendiri yang ditampilkan.
                    </p>
                  </div>
                ) : (
                  "Tidak ada obrolan ditemukan dalam kategori ini."
                )}
              </div>
            ) : (
              filteredChannels.map(channel => {
                const isActive = channel.id === activeChannelId;
                const channelMsgs = messages.filter(m => m.channelId === channel.id);
                const lastMsg = channelMsgs[channelMsgs.length - 1];
                const isSpecialPinned = channel.roleBadge?.includes("⭐");

                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => {
                      setActiveChannelId(channel.id);
                      setIsMobileChatOpen(true);
                    }}
                    className={`w-full text-left p-2 flex items-start gap-2 transition-colors cursor-pointer ${
                      isActive 
                        ? "bg-emerald-50/90 border-l-3 border-emerald-600" 
                        : isSpecialPinned 
                        ? "bg-amber-50/40 hover:bg-amber-50/70"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={channel.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=0284c7&color=fff`} 
                        alt={channel.name} 
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      {channel.type === "group" && (
                        <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-600 text-white p-0.5 rounded-full text-[7px]">
                          <Users className="w-1.5 h-1.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold truncate pr-1 ${isActive ? "text-emerald-900" : "text-slate-800"}`}>
                          {channel.name}
                        </span>
                        {lastMsg && (
                          <span className="text-[8px] text-slate-400 shrink-0 font-mono">
                            {lastMsg.timeStr}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 my-0.5">
                        <span className={`text-[8px] font-semibold px-1 py-0.2 rounded truncate max-w-[150px] ${
                          channel.roleBadge?.includes("⭐") ? "bg-amber-100 text-amber-900 border border-amber-300/60 font-bold" :
                          channel.subCategory === "kelas_wali" ? "bg-emerald-100 text-emerald-800" :
                          channel.subCategory === "guru_wali" ? "bg-teal-100 text-teal-800" :
                          channel.subCategory === "tu" ? "bg-slate-200 text-slate-800" :
                          channel.subCategory === "guru_staff" ? "bg-indigo-100 text-indigo-800" :
                          channel.category === "teacher" ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {channel.roleBadge}
                        </span>
                      </div>

                      <p className="text-[9px] text-slate-500 truncate">
                        {lastMsg ? (
                          <>
                            <span className="font-semibold text-slate-700">
                              {lastMsg.senderId === currentUser.id ? "Anda: " : `${lastMsg.senderName.split(" ")[0]}: `}
                            </span>
                            {lastMsg.text}
                          </>
                        ) : (
                          channel.description || "Belum ada pesan"
                        )}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Chat Window */}
        <div className={`
          flex-1 min-h-0 flex flex-col bg-slate-50 relative overflow-hidden
          ${isMobileChatOpen ? "flex" : "hidden md:flex"}
        `}>
          {/* Active Chat Header */}
          <div className="bg-white px-3 py-1.5 flex items-center justify-between border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <button 
                type="button"
                onClick={() => setIsMobileChatOpen(false)}
                className="md:hidden p-1 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <img 
                src={activeChannel?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChannel?.name || "Chat")}&background=0284c7&color=fff`} 
                alt={activeChannel?.name || "Chat"} 
                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
              />

              <div className="min-w-0">
                <h3 className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5 truncate">
                  <span className="truncate">{activeChannel?.name}</span>
                  <span className="text-[8px] font-normal text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full shrink-0">
                    {activeChannel?.roleBadge}
                  </span>
                </h3>
                <p className="text-[9px] text-slate-400 truncate">
                  {activeChannel?.description || "Saluran Resmi SIHADIR SMKN 2 Konawe"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Button to toggle Group Members Drawer */}
              {activeChannel?.type === "group" && (
                <button
                  type="button"
                  onClick={() => setShowMembersDrawer(prev => !prev)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    showMembersDrawer
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200"
                  }`}
                  title="Lihat Daftar Anggota Grup"
                >
                  <Users className="w-3.5 h-3.5 text-inherit" />
                  <span className="hidden sm:inline">Anggota</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    showMembersDrawer ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {activeGroupMembers.length}
                  </span>
                </button>
              )}

              <div className="text-[9px] text-slate-400 flex items-center gap-1 shrink-0 pl-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {isStudent ? "Resmi" : "Aktif"}
              </div>
            </div>
          </div>

          {/* Quick Member Overview Banner */}
          {activeChannel?.type === "group" && activeGroupMembers.length > 0 && (
            <div className="bg-emerald-50/80 border-b border-emerald-100 px-3 py-1 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex -space-x-1.5 shrink-0">
                  {activeGroupMembers.slice(0, 4).map((m, idx) => (
                    <img
                      key={m.id || idx}
                      src={m.avatar}
                      alt={m.name}
                      className={`w-5 h-5 rounded-full border border-white object-cover ${m.isCurrentUser ? "ring-2 ring-emerald-500" : ""}`}
                      title={`${m.name} (${m.roleLabel})${m.isCurrentUser ? " - Anda" : ""}`}
                    />
                  ))}
                  {activeGroupMembers.length > 4 && (
                    <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[8px] font-bold flex items-center justify-center border border-white">
                      +{activeGroupMembers.length - 4}
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-emerald-950 truncate">
                  <strong className="font-semibold text-emerald-900">
                    {activeChannel.subCategory === "kelas_wali" 
                      ? `Anggota Kelas ${activeChannel.targetClass || resolvedStudentClass}: `
                      : activeChannel.subCategory === "guru_wali"
                      ? `Anggota Bimbingan Guru Wali: `
                      : "Anggota Grup: "}
                  </strong>
                  <span className="text-emerald-800">
                    {activeGroupMembers[0]?.name} ({activeGroupMembers[0]?.roleLabel}) &bull; {activeGroupMembers.length - 1} Siswa
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMembersDrawer(prev => !prev)}
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0 pl-2 cursor-pointer flex items-center gap-0.5"
              >
                {showMembersDrawer ? "Tutup ✕" : `Lihat Semua (${activeGroupMembers.length}) ›`}
              </button>
            </div>
          )}

          {/* SECURITY BARRIER: If unauthorized channel is selected */}
          {!isChannelAllowed(activeChannelId) ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-100/50">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Akses Saluran Dibatasi</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mt-1 leading-relaxed">
                {isStudent ? (
                  <>Siswa hanya dapat mengakses ruang kelas resmi <strong>Kelas {resolvedStudentClass}</strong> dan ruang pembimbingan Guru Wali Anda.</>
                ) : (
                  <>Anda hanya dapat mengakses grup kelas tempat Anda mengajar atau bertugas sebagai Wali Kelas, serta grup bimbingan Guru Wali binaan Anda sendiri.</>
                )}
              </p>
              <button 
                type="button"
                onClick={() => {
                  if (isStudent) {
                    setActiveChannelId(studentClassGroupId);
                  } else if (isTuStaff) {
                    setActiveChannelId("group-tata-usaha-utama");
                  } else if (myAccessibleClassGroupIds.length > 0) {
                    setActiveChannelId(myAccessibleClassGroupIds[0]);
                  } else {
                    setActiveChannelId("group-guru-smk2");
                  }
                }}
                className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {isStudent ? `Buka Kelas ${resolvedStudentClass}` : "Buka Saluran Terdaftar"}
              </button>
            </div>
          ) : (
            <>
              {/* MESSAGES AREA */}
              <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2 bg-[#f8fafc]">
                {activeMessages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-30 text-slate-400" />
                    <p className="text-xs font-medium">Belum ada obrolan di saluran ini.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Ketik pesan di bawah untuk memulai koordinasi santun.</p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-end gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        {!isMe && (
                          <img 
                            src={msg.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=0284c7&color=fff`} 
                            alt={msg.senderName} 
                            className="w-5 h-5 rounded-full object-cover mb-0.5 border border-slate-200 shrink-0"
                          />
                        )}

                        <div 
                          className={`relative max-w-[85%] md:max-w-[75%] rounded-xl px-2.5 py-1.5 text-xs shadow-xs ${
                            isMe 
                              ? "bg-emerald-600 text-white rounded-br-none" 
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                          }`}
                        >
                          {/* Sender Info for others */}
                          {!isMe && (
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[10px] font-bold text-emerald-700 truncate">
                                {msg.senderName}
                              </span>
                              <span className="text-[7px] font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                                {msg.senderRoleTitle || msg.senderRole}
                              </span>
                            </div>
                          )}

                          {/* Quoted / Replied Message if any */}
                          {msg.replyTo && (
                            <div className={`mb-1 px-2 py-1 rounded-lg text-[9px] border-l-2 ${
                              isMe 
                                ? "bg-emerald-700/60 border-emerald-300 text-emerald-100" 
                                : "bg-slate-100 border-emerald-500 text-slate-600"
                            }`}>
                              <div className="flex items-center gap-1 font-bold">
                                <CornerUpLeft className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{msg.replyTo.senderName}</span>
                              </div>
                              <p className="truncate opacity-90">{msg.replyTo.text}</p>
                            </div>
                          )}

                          {/* Content text with @mentions highlighting */}
                          <p className="leading-snug whitespace-pre-wrap break-words text-[11px]">
                            {renderMessageContent(msg.text, isMe)}
                          </p>

                          {/* Footer: Time, Reply Button, and Delete */}
                          <div className={`flex items-center justify-end gap-1 mt-0.5 text-[8px] ${isMe ? "text-emerald-100" : "text-slate-400"}`}>
                            <span>{msg.timeStr} WITA</span>
                            {isMe && <CheckCheck className="w-2.5 h-2.5 text-emerald-200" />}

                            {/* Balas / Tujukan Button in Group */}
                            <button
                              type="button"
                              onClick={() => handleReplyMessage(msg)}
                              title="Tujukan / Balas pesan di grup"
                              className={`ml-1 flex items-center gap-0.5 opacity-70 hover:opacity-100 cursor-pointer ${
                                isMe ? "text-emerald-100 hover:text-white" : "text-slate-500 hover:text-emerald-700"
                              }`}
                            >
                              <CornerUpLeft className="w-2.5 h-2.5" />
                              <span className="text-[8px] font-medium">Balas</span>
                            </button>

                            {isMe && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Hapus pesan"
                                className="ml-1 opacity-60 hover:opacity-100 text-rose-200 hover:text-rose-100 cursor-pointer"
                              >
                                <Trash2 className="w-2 h-2" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* QUICK TEMPLATES CHIPS (Compact single-line) */}
              <div className="px-2.5 py-1 bg-white border-t border-slate-100 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  Template:
                </span>
                {templatesToUse.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(tmpl)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap border border-slate-200 transition-colors cursor-pointer"
                  >
                    {tmpl.length > 25 ? tmpl.substring(0, 25) + "..." : tmpl}
                  </button>
                ))}
              </div>

              {/* EMOJI BAR (Collapsible) */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white border-t border-slate-200 px-2 py-1 flex items-center gap-1 overflow-x-auto shrink-0"
                  >
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setInputText(prev => prev + emoji)}
                        className="text-sm hover:scale-120 transition-transform p-0.5 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* REPLIED MESSAGE PREVIEW (If replying to someone) */}
              {replyingTo && (
                <div className="px-3 py-1.5 bg-emerald-50/90 border-t border-emerald-200 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CornerUpLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-bold text-emerald-800 shrink-0">Menujukan ke {replyingTo.senderName}:</span>
                    <span className="text-[10px] text-slate-600 truncate max-w-[180px] sm:max-w-md">{replyingTo.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                    title="Batalkan tujuan"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* INPUT FORM: Always Visible Green Button */}
              <form 
                onSubmit={handleSendMessage}
                className="p-1.5 sm:p-2 bg-white border-t border-slate-200 flex items-center gap-1.5 shrink-0"
              >
                {/* Emoji toggle */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    showEmojiPicker ? "bg-emerald-100 text-emerald-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Input field with Character limitation for students */}
                <div className="flex-1 min-w-0 relative">
                  <input
                    type="text"
                    value={inputText}
                    disabled={isStudent && !isStudentAllowedByTime}
                    maxLength={isStudent ? MAX_STUDENT_CHARS : undefined}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isStudent && !isStudentAllowedByTime 
                        ? "Obrolan siswa ditutup (Buka 06.30 - 17.30 WITA)"
                        : "Ketik pesan obrolan sekolah..."
                    }
                    className={`w-full bg-slate-100 text-slate-800 placeholder:text-slate-400 text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                      isStudent && !isStudentAllowedByTime 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" 
                        : "border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                    }`}
                  />

                  {/* Character counter badge for students */}
                  {isStudent && (
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-mono ${
                      inputText.length >= MAX_STUDENT_CHARS ? "text-rose-500 font-bold" : "text-slate-400"
                    }`}>
                      {inputText.length}/{MAX_STUDENT_CHARS}
                    </span>
                  )}
                </div>

                {/* Send Button: PROMINENTLY GREEN AT ALL TIMES */}
                <button
                  type="submit"
                  disabled={
                    (isStudent && !isStudentAllowedByTime) || 
                    (isStudent && cooldownRemaining > 0)
                  }
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer shrink-0 ${
                    (isStudent && !isStudentAllowedByTime) || (isStudent && cooldownRemaining > 0)
                      ? "bg-emerald-600/60 text-white/80 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white ring-2 ring-emerald-400/20"
                  }`}
                >
                  {isStudent && cooldownRemaining > 0 ? (
                    <span className="flex items-center gap-1 font-mono text-[9px] text-white">
                      <Clock className="w-3 h-3 animate-spin text-white" />
                      {cooldownRemaining}s
                    </span>
                  ) : (
                    <>
                      <Send className="w-3 h-3 text-white" />
                      <span className="text-white font-bold">Kirim</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* SLIDING MEMBERS DRAWER */}
          <AnimatePresence>
            {showMembersDrawer && (
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-y-0 right-0 w-full sm:w-80 md:w-96 bg-white border-l border-slate-200 shadow-2xl z-30 flex flex-col"
              >
                {/* Drawer Header */}
                <div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold truncate">Daftar Anggota Grup</h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {activeChannel.subCategory === "kelas_wali" 
                          ? `Kelas ${activeChannel.targetClass || resolvedStudentClass}` 
                          : activeChannel.name}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMembersDrawer(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Tutup Panel Anggota"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search & Filter Controls */}
                <div className="p-2.5 bg-slate-50 border-b border-slate-200 space-y-2 shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      placeholder="Cari nama siswa atau NIS..."
                      className="w-full bg-white pl-8 pr-7 py-1 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    {memberSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMemberSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setMemberRoleFilter("all")}
                      className={`px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                        memberRoleFilter === "all"
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      Semua ({activeGroupMembers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberRoleFilter("wali")}
                      className={`px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                        memberRoleFilter === "wali"
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      Wali / Pendidik ({activeGroupMembers.filter(m => m.role === "wali_kelas" || m.role === "guru_wali" || m.role === "guru" || m.role === "staf_tu").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberRoleFilter("siswa")}
                      className={`px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                        memberRoleFilter === "siswa"
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      Siswa ({activeGroupMembers.filter(m => m.role === "siswa" || m.role === "ketua_kelas").length})
                    </button>
                  </div>
                </div>

                {/* Member List Scroll Area */}
                <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5 divide-y divide-slate-100">
                  {filteredGroupMembers.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <Users className="w-6 h-6 mx-auto mb-1 opacity-40" />
                      <p className="text-xs">Tidak ditemukan anggota dengan kata kunci tersebut.</p>
                    </div>
                  ) : (
                    filteredGroupMembers.map((member, index) => {
                      const isWaliOrGuru = member.role === "wali_kelas" || member.role === "guru_wali" || member.role === "guru" || member.role === "staf_tu";

                      return (
                        <div
                          key={member.id || index}
                          className={`pt-1.5 first:pt-0 flex items-center justify-between gap-2 p-2 rounded-xl transition-all ${
                            member.isCurrentUser 
                              ? "bg-emerald-50/90 border border-emerald-300 shadow-2xs" 
                              : isWaliOrGuru 
                              ? "bg-amber-50/50 border border-amber-200" 
                              : "hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className={`w-8 h-8 rounded-full object-cover border ${
                                  member.isCurrentUser 
                                    ? "border-emerald-500 ring-2 ring-emerald-300" 
                                    : isWaliOrGuru 
                                    ? "border-amber-500" 
                                    : "border-slate-200"
                                }`}
                              />
                              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>
                            </div>

                            {/* Info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {member.name}
                                </span>
                                {member.isCurrentUser && (
                                  <span className="bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                                    ⭐ Anda (Saya)
                                  </span>
                                )}
                                {member.role === "ketua_kelas" && (
                                  <span className="bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                                    Ketua Kelas
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-0.5">
                                <span className={`font-semibold px-1 py-0.2 rounded ${
                                  isWaliOrGuru 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : "bg-slate-100 text-slate-600"
                                }`}>
                                  {member.roleLabel}
                                </span>
                                {(member as any).nis && (member as any).nis !== "-" && (
                                  <span className="font-mono text-slate-400">
                                    NIS: {(member as any).nis}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Member Badge & Tujukan Button in Group */}
                          <div className="shrink-0 flex items-center gap-1.5">
                            {isWaliOrGuru ? (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                Pendidik
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-slate-400">
                                #{index}
                              </span>
                            )}

                            {!member.isCurrentUser && (
                              <button
                                type="button"
                                onClick={() => handleMentionMember(member.name)}
                                className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                title={`Tujukan pesan ke ${member.name} di grup ini`}
                              >
                                <AtSign className="w-3 h-3 text-emerald-600" />
                                <span>Tujukan</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Drawer Footer Info */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center shrink-0">
                  <p className="text-[9px] text-slate-500">
                    👥 Terdaftar resmi pada basis data SIHADIR &bull; Total {activeGroupMembers.length} Anggota
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* MODAL: Tambah Grup Baru (HANYA UNTUK GURU & STAF TU) */}
      <AnimatePresence>
        {!isStudent && showNewGroupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-4 border border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-tight">Buat Grup Obrolan Baru</h3>
                    <p className="text-[10px] text-slate-500">Saluran diskusi terintegrasi SMKN 2 Konawe</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="mt-3 space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Grup Baru *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Contoh: Praktik Bengkel Mesin 2 / Tim OSIS"
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kategori Grup
                    </label>
                    <select
                      value={newGroupCategory}
                      onChange={(e) => setNewGroupCategory(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
                    >
                      {(isTuStaff || isSuperAdminOrPrincipal) && (
                        <option value="tu">Tata Usaha (TU)</option>
                      )}
                      <option value="guru_staff">Ruang Guru & Staf</option>
                      <option value="kelas_wali">Kelas & Wali</option>
                      <option value="guru_wali">Guru Wali & Binaan</option>
                      <option value="umum">Umum & Kegiatan</option>
                      <option value="custom">Khusus / Tim Kerja</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Label / Badge Singkat
                    </label>
                    <input
                      type="text"
                      value={newGroupBadge}
                      onChange={(e) => setNewGroupBadge(e.target.value)}
                      placeholder="Contoh: Tim Kejuruan / Ekstra"
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Deskripsi / Tujuan Grup
                  </label>
                  <textarea
                    rows={2}
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Jelaskan tujuan koordinasi di grup ini..."
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100 flex items-start gap-1.5 text-[10px] text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Grup akan tersimpan di Cloud Firestore dan langsung dapat diakses oleh seluruh anggota yang terlibat.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNewGroupModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    Simpan & Buka Grup
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
