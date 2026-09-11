/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ClipboardList, Users, UserCheck, MapPin, Clock, Plus, Trash2, 
  AlertCircle, CheckCircle, Share2, Send, Calendar, UserPlus, 
  Search, FileText, Phone, ShieldAlert, Check, X, Briefcase, 
  Camera, Upload, BookOpen, AlertTriangle, Printer, QrCode
} from "lucide-react";
import { QrScannerModal } from "./QrScannerModal";

// Types
interface PiketKbmLog {
  id: string;
  date: string;
  time: string;
  className: string;
  subject: string;
  regularTeacher: string;
  status: "Lancar" | "Tugas Mandiri" | "Kelas Kosong" | "Guru Terlambat" | "Insiden Murid";
  incidentNotes: string;
  piketStaff: string;
}

interface StudentPermissionPass {
  id: string;
  date: string;
  time: string;
  studentName: string;
  className: string;
  type: "Izin Keluar Sekolah" | "Izin Meninggalkan Kelas" | "Izin Terlambat Masuk";
  reason: string;
  approvedBy: string;
  parentNotificationStatus: "Belum Dikirim" | "Terkirim (WA)";
  parentPhone: string;
  photoEvidence: string | null;
}

interface PiketGuestBookEntry {
  id: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  guestName: string;
  organization: string; // Orang Tua, Pengawas, Dinas, Sales, dll.
  purpose: string;
  visitedPerson: string;
  phone: string;
}

interface SubstitutionAssignment {
  id: string;
  date: string;
  className: string;
  period: string; // Jam pelajaran ke-
  absentTeacher: string;
  substituteTeacher: string;
  givenTask: string;
  status: "Menunggu" | "Diberitahukan (WA)" | "Aktif Mengawas" | "Selesai";
}

// Default Teachers and Classes for Dropdowns
const TEACHERS_LIST = [
  "Drs. Muslimin. L, S.Pd.",
  "Haerul, S.Pd.",
  "I Putu Juniyasa, S.Pd.Mat",
  "Isnawati, S.Pd.",
  "Hiswan Pagala, S.Pd.",
  "Saiman, ST.",
  "Cici Murni, S.Pd. (BK)",
  "Ainal Laremba, S.Ag"
];

const CLASSES_LIST = [
  "X TKR A", "X TKR B", "X TSM", "X TAV", "X DPIB", "X DKV",
  "XI TKR A", "XI TKR B", "XI TSM A", "XI TSM B", "XI TAV", "XI DPIB", "XI DKV",
  "XII TKR A", "XII TKR B", "XII TSM", "XII TAV", "XII DPIB"
];

// DATA RESMI SK KEPALA SMK NEGERI 2 KONAWE TP 2026-2027 (NO. 521.3/..../800/VII/2026)
export const JADWAL_PIKET_SMK2_KONAWE = [
  {
    day: "Senin",
    teamName: "Tim Piket Senin (Seluruh Guru)",
    isAllTeachers: true,
    totalCount: "Seluruh Dewan Guru",
    description: "Kolektif Penertiban Upacara Bendera, Apel Pagi, dan Kedisiplinan Awal Pekan",
    members: [
      "Seluruh Dewan Guru SMK Negeri 2 Konawe (Kolektif & Terintegrasi)"
    ]
  },
  {
    day: "Selasa",
    teamName: "Tim Piket Selasa",
    isAllTeachers: false,
    totalCount: "7 Orang Guru",
    description: "Petugas Piket & Pengawasan KBM Hari Selasa",
    members: [
      "Elis Syarifudn, B.S.Pd.T",
      "Evasyahtriana, S.Si",
      "Andi Asrul Umar, S.Pd.",
      "Saiman, ST.",
      "Haerul, S.Pd.",
      "Saiful Arifin, S.Pd.",
      "Muharjun, S.Sos"
    ]
  },
  {
    day: "Rabu",
    teamName: "Tim Piket Rabu",
    isAllTeachers: false,
    totalCount: "7 Orang Guru",
    description: "Petugas Piket & Pengawasan KBM Hari Rabu",
    members: [
      "Munatar Tabara, S.Pd.",
      "Isnawati, S.Pd.",
      "Muhammad Maimana L., ST",
      "Nunung Susilowati Podada, M.Pd.",
      "Triana Daniel, S.Pd.",
      "Hiswan Pagala, S.Pd.",
      "Epna Septiana Kristi, S.Pd."
    ]
  },
  {
    day: "Kamis",
    teamName: "Tim Piket Kamis",
    isAllTeachers: false,
    totalCount: "7 Orang Guru",
    description: "Petugas Piket & Pengawasan KBM Hari Kamis",
    members: [
      "I Putu Juniyasa, S.Pd.Mat",
      "Syamsul Sabir, S.Kom",
      "I Gusti Ngurah Putu Wahyu Darma, S.Pd.",
      "Moch. Yamin, S.Pd.",
      "Salmah, S.Pd.I",
      "Anggraeni Desanik, S.Pd.",
      "Cici Murni, S.Pd."
    ]
  },
  {
    day: "Jum'at",
    teamName: "Tim Piket Jum'at (Pak Ainal Laremba & Rekan)",
    isAllTeachers: false,
    totalCount: "6 Orang Guru",
    description: "Petugas Piket & Bimbingan Karakter Hari Jum'at",
    members: [
      "Ainal Laremba, S.Ag (Penanggung Jawab / Anggota Tim)",
      "Nyoman Suliawati, S.Pd., M.Pd.",
      "Iman Purnama, S.T.",
      "Arham Amiruddin, S.Pd.Gr",
      "Askin, S.Ag",
      "Adrian Sahputra, S.Pd"
    ]
  },
  {
    day: "Sabtu",
    teamName: "Tim Piket Sabtu",
    isAllTeachers: false,
    totalCount: "7 Orang Guru",
    description: "Petugas Piket & Pengawasan KBM / Ekstrakurikuler Hari Sabtu",
    members: [
      "Titik Harumi, S.Pd.",
      "Drs. Muslimin L., S.Pd.",
      "Arbianti, SE.",
      "Sitti Khotijah, S.Pd.",
      "Yoga Nanda Hendrawan, S.Pd.",
      "Izzat Wahyu Zaldi, S.Pd.",
      "Gusti Himawan Kadiyanto, S.Pd."
    ]
  }
];

export const getTodayIndonesianDay = (): string => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
  return days[new Date().getDay()];
};

export const checkIsPiketDutyToday = (
  teacherNameOrUsername?: string,
  selectedPiketDayOverride?: string | null
): {
  isDutyToday: boolean;
  todayDay: string;
  assignedDays: string[];
  matchedDayName: string;
} => {
  const todayDay = getTodayIndonesianDay();
  const storedAssignedDay = localStorage.getItem("sihadir_piket_assigned_day");
  const activeAssignedDay = selectedPiketDayOverride !== undefined ? selectedPiketDayOverride : storedAssignedDay;

  if (activeAssignedDay) {
    if (activeAssignedDay === "Semua Hari") {
      return {
        isDutyToday: true,
        todayDay,
        assignedDays: ["Semua Hari"],
        matchedDayName: todayDay
      };
    }
    const isMatch = activeAssignedDay.toLowerCase().replace("'", "") === todayDay.toLowerCase().replace("'", "");
    if (isMatch) {
      return {
        isDutyToday: true,
        todayDay,
        assignedDays: [activeAssignedDay],
        matchedDayName: todayDay
      };
    }
  }

  // Monday = All teachers on duty
  if (todayDay === "Senin") {
    return {
      isDutyToday: true,
      todayDay,
      assignedDays: ["Senin (Seluruh Dewan Guru)"],
      matchedDayName: "Senin"
    };
  }

  const cleanName = (teacherNameOrUsername || "").toLowerCase();
  const assignedDays: string[] = [];

  if (cleanName) {
    JADWAL_PIKET_SMK2_KONAWE.forEach((item) => {
      if (item.isAllTeachers) {
        assignedDays.push(item.day);
      } else {
        const isMember = item.members.some((m) => {
          const mClean = m.toLowerCase();
          return (
            mClean.includes(cleanName) ||
            (cleanName.length > 3 && mClean.includes(cleanName.split(" ")[0]))
          );
        });
        if (isMember) {
          assignedDays.push(item.day);
        }
      }
    });
  }

  if (assignedDays.length === 0) {
    if (activeAssignedDay) {
      const isMatch = activeAssignedDay.toLowerCase().replace("'", "") === todayDay.toLowerCase().replace("'", "");
      return {
        isDutyToday: isMatch,
        todayDay,
        assignedDays: [activeAssignedDay],
        matchedDayName: activeAssignedDay
      };
    }
    return {
      isDutyToday: true,
      todayDay,
      assignedDays: [todayDay],
      matchedDayName: todayDay
    };
  }

  const isDutyToday = assignedDays.some(
    (d) => d.toLowerCase().replace("'", "") === todayDay.toLowerCase().replace("'", "")
  );

  return {
    isDutyToday,
    todayDay,
    assignedDays,
    matchedDayName: assignedDays.join(", ")
  };
};

export function GuruPiketDashboard({ username, currentRole }: { username: string; currentRole: string }) {
  // Navigation Tabs within the Piket Panel
  const [activeSubTab, setActiveSubTab] = useState<"summary" | "jadwal-piket" | "kbm-logs" | "student-passes" | "guest-book" | "substitutions">("summary");
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>("Jum'at");
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [assignedPiketDay, setAssignedPiketDay] = useState<string | null>(() => {
    return localStorage.getItem("sihadir_piket_assigned_day") || null;
  });

  const dutyCheck = checkIsPiketDutyToday(username, assignedPiketDay);

  // State Management with Local Storage
  const [kbmLogs, setKbmLogs] = useState<PiketKbmLog[]>(() => {
    const saved = localStorage.getItem("sihadir_piket_kbm_logs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return [
      {
        id: "kbm-1",
        date: new Date().toISOString().split("T")[0],
        time: "08:15",
        className: "XI TKR A",
        subject: "Pemeliharaan Mesin Kendaraan Ringan",
        regularTeacher: "Isnawati, S.Pd.",
        status: "Tugas Mandiri",
        incidentNotes: "Guru sedang ada rapat di Dinas Pendidikan. Murid diberikan tugas merangkum Bab 4 di perpustakaan.",
        piketStaff: username || "Guru Piket"
      },
      {
        id: "kbm-2",
        date: new Date().toISOString().split("T")[0],
        time: "09:30",
        className: "X TSM",
        subject: "Gambar Teknik Otomotif",
        regularTeacher: "Elis Syarifuddin. B, S.Pd.T",
        status: "Lancar",
        incidentNotes: "KBM berlangsung kondusif di bengkel las.",
        piketStaff: username || "Guru Piket"
      }
    ];
  });

  const [studentPasses, setStudentPasses] = useState<StudentPermissionPass[]>(() => {
    const saved = localStorage.getItem("sihadir_piket_student_passes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return [
      {
        id: "pass-1",
        date: new Date().toISOString().split("T")[0],
        time: "08:45",
        studentName: "Aditya Bagus",
        className: "X TKR A",
        type: "Izin Keluar Sekolah",
        reason: "Sakit demam tinggi, dipulangkan setelah diperiksa di UKS.",
        approvedBy: username || "Guru Piket",
        parentNotificationStatus: "Terkirim (WA)",
        parentPhone: "081234567890",
        photoEvidence: null
      }
    ];
  });

  const [guestBook, setGuestBook] = useState<PiketGuestBookEntry[]>(() => {
    const saved = localStorage.getItem("sihadir_piket_guest_book");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return [
      {
        id: "guest-1",
        date: new Date().toISOString().split("T")[0],
        timeIn: "08:00",
        timeOut: "09:15",
        guestName: "Bpk. H. Siswanto",
        organization: "Pengawas Dinas Provinsi Sultra",
        purpose: "Monitoring pelaksanaan Kurikulum Merdeka",
        visitedPerson: "Drs. Muslimin. L, S.Pd. (Waka Kurikulum)",
        phone: "085299991111"
      }
    ];
  });

  const [substitutions, setSubstitutions] = useState<SubstitutionAssignment[]>(() => {
    const saved = localStorage.getItem("sihadir_piket_substitutions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return [
      {
        id: "sub-1",
        date: new Date().toISOString().split("T")[0],
        className: "XI TKR A",
        period: "Jam 2 - 4 (08:00 - 10:15)",
        absentTeacher: "Isnawati, S.Pd.",
        substituteTeacher: "I Putu Juniyasa, S.Pd.Mat",
        givenTask: "Merangkum Bab 4 sistem pelumasan mesin di perpustakaan.",
        status: "Diberitahukan (WA)"
      }
    ];
  });

  // Sync with Local Storage
  useEffect(() => {
    localStorage.setItem("sihadir_piket_kbm_logs", JSON.stringify(kbmLogs));
  }, [kbmLogs]);

  useEffect(() => {
    localStorage.setItem("sihadir_piket_student_passes", JSON.stringify(studentPasses));
  }, [studentPasses]);

  useEffect(() => {
    localStorage.setItem("sihadir_piket_guest_book", JSON.stringify(guestBook));
  }, [guestBook]);

  useEffect(() => {
    localStorage.setItem("sihadir_piket_substitutions", JSON.stringify(substitutions));
  }, [substitutions]);

  // Modals for Actions
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
    type: "success" | "warning" | "info";
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      }
    });
  };

  const triggerAlert = (title: string, message: string, type: "success" | "warning" | "info" = "success") => {
    setAlertModal({ title, message, type });
  };

  // --- FORM STATES ---
  // KBM Log Form
  const [formKbmClass, setFormKbmClass] = useState("X TKR A");
  const [formKbmSubject, setFormKbmSubject] = useState("");
  const [formKbmTeacher, setFormKbmTeacher] = useState(TEACHERS_LIST[0]);
  const [formKbmStatus, setFormKbmStatus] = useState<PiketKbmLog["status"]>("Lancar");
  const [formKbmNotes, setFormKbmNotes] = useState("");

  // Student Pass Form
  const [formPassName, setFormPassName] = useState("");
  const [formPassClass, setFormPassClass] = useState("X TKR A");
  const [formPassType, setFormPassType] = useState<StudentPermissionPass["type"]>("Izin Keluar Sekolah");
  const [formPassReason, setFormPassReason] = useState("");
  const [formPassPhone, setFormPassPhone] = useState("");
  const [formPassPhoto, setFormPassPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Guest Book Form
  const [formGuestName, setFormGuestName] = useState("");
  const [formGuestOrg, setFormGuestOrg] = useState("Orang Tua Murid");
  const [formGuestPurpose, setFormGuestPurpose] = useState("");
  const [formGuestVisited, setFormGuestVisited] = useState("");
  const [formGuestPhone, setFormGuestPhone] = useState("");

  // Substitution Form
  const [formSubClass, setFormSubClass] = useState("X TKR A");
  const [formSubPeriod, setFormSubPeriod] = useState("Jam 1 - 2 (07:15 - 08:45)");
  const [formSubAbsent, setFormSubAbsent] = useState(TEACHERS_LIST[0]);
  const [formSubSubstitute, setFormSubSubstitute] = useState(TEACHERS_LIST[1]);
  const [formSubTask, setFormSubTask] = useState("");

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");

  // --- HELPER SUBMISSIONS ---
  // Camera simulation
  const startCamera = async () => {
    setIsCapturing(true);
    setFormPassPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) {
      // Fallback if no camera found
      setTimeout(() => {
        const mockAvatars = [
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60",
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=60"
        ];
        const randomAvatar = mockAvatars[Math.floor(Math.random() * mockAvatars.length)];
        setFormPassPhoto(randomAvatar);
        setIsCapturing(false);
        triggerAlert("Simulasi Kamera", "Berhasil mengambil foto bukti surat/murid via kamera virtual.", "info");
      }, 1500);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setFormPassPhoto(dataUrl);
        // stop stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCapturing(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormPassPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Submit KBM Log
  const handleAddKbmLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKbmSubject.trim() || !formKbmNotes.trim()) {
      triggerAlert("Form Belum Lengkap", "Harap isi semua kolom deskripsi log pantauan.", "warning");
      return;
    }

    const newLog: PiketKbmLog = {
      id: "kbm-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      className: formKbmClass,
      subject: formKbmSubject,
      regularTeacher: formKbmTeacher,
      status: formKbmStatus,
      incidentNotes: formKbmNotes,
      piketStaff: username || "Guru Piket"
    };

    setKbmLogs(prev => [newLog, ...prev]);
    setFormKbmSubject("");
    setFormKbmNotes("");
    triggerAlert("Berhasil Disimpan", "Jurnal Pemantauan KBM berhasil dicatat dalam rekapitulasi harian.", "success");
  };

  // 2. Submit Student Pass
  const handleAddStudentPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPassName.trim() || !formPassReason.trim()) {
      triggerAlert("Form Belum Lengkap", "Harap masukkan nama murid dan alasan pemberian izin.", "warning");
      return;
    }

    const newPass: StudentPermissionPass = {
      id: "pass-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      studentName: formPassName,
      className: formPassClass,
      type: formPassType,
      reason: formPassReason,
      approvedBy: username || "Guru Piket",
      parentNotificationStatus: "Belum Dikirim",
      parentPhone: formPassPhone || "08123456789",
      photoEvidence: formPassPhoto
    };

    setStudentPasses(prev => [newPass, ...prev]);
    setFormPassName("");
    setFormPassReason("");
    setFormPassPhone("");
    setFormPassPhoto(null);
    triggerAlert("Surat Izin Diterbitkan", `Surat ${formPassType} berhasil dibuat untuk ${formPassName}. Silakan bagikan via WhatsApp ke wali murid.`, "success");
  };

  // Send WhatsApp Broadcast Template for Student Permission
  const sendStudentPassWA = (pass: StudentPermissionPass) => {
    const message = `*SIHADIR SMK NEGERI 2 KONAWE - SURAT IZIN GURU PIKET*%0A%0A` +
      `Yth. Orang Tua / Wali dari murid:*%0A` +
      `👤 Nama: *${pass.studentName}*%0A` +
      `🏫 Kelas: *${pass.className}*%0A%0A` +
      `Menerangkan bahwa murid tersebut telah diberikan izin oleh Guru Piket untuk:*%0A` +
      `🎫 Jenis Izin: *${pass.type}*%0A` +
      `⏰ Jam Keluar/Masuk: *${pass.time} WITA*%0A` +
      `📝 Alasan/Keterangan: *${pass.reason}*%0A` +
      `✍️ Disetujui Oleh: *${pass.approvedBy}* (Staf Guru Piket)%0A%0A` +
      `Mohon agar dipantau keberadaan putra/putri Bapak/Ibu setelah jam izin tersebut. Terima kasih.`;
    
    const waUrl = `https://wa.me/${pass.parentPhone.replace(/[^0-9]/g, "")}?text=${message}`;
    window.open(waUrl, "_blank");

    // Update status in list
    setStudentPasses(prev => prev.map(p => p.id === pass.id ? { ...p, parentNotificationStatus: "Terkirim (WA)" } : p));
  };

  // 3. Submit Guest Book Entry
  const handleAddGuestEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGuestName.trim() || !formGuestPurpose.trim() || !formGuestVisited.trim()) {
      triggerAlert("Form Belum Lengkap", "Harap isi nama tamu, tujuan, dan personil yang ingin ditemui.", "warning");
      return;
    }

    const newGuest: PiketGuestBookEntry = {
      id: "guest-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      timeIn: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      timeOut: null,
      guestName: formGuestName,
      organization: formGuestOrg,
      purpose: formGuestPurpose,
      visitedPerson: formGuestVisited,
      phone: formGuestPhone || "08123456789"
    };

    setGuestBook(prev => [newGuest, ...prev]);
    setFormGuestName("");
    setFormGuestPurpose("");
    setFormGuestVisited("");
    setFormGuestPhone("");
    triggerAlert("Tamu Terdaftar", "Data kunjungan tamu berhasil dicatat dalam Buku Tamu Piket harian.", "success");
  };

  // Checkout guest (record timeout)
  const handleCheckoutGuest = (guestId: string) => {
    setGuestBook(prev => prev.map(g => {
      if (g.id === guestId) {
        return {
          ...g,
          timeOut: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        };
      }
      return g;
    }));
    triggerAlert("Checkout Berhasil", "Waktu keluar tamu telah berhasil dicatat.", "success");
  };

  // 4. Submit Substitution Assignment
  const handleAddSubstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (formSubAbsent === formSubSubstitute) {
      triggerAlert("Pilihan Guru Bentrok", "Guru yang berhalangan tidak bisa dijadikan guru pengganti sekaligus.", "warning");
      return;
    }
    if (!formSubTask.trim()) {
      triggerAlert("Form Belum Lengkap", "Harap isikan petunjuk tugas/materi yang ditinggalkan guru.", "warning");
      return;
    }

    const newSub: SubstitutionAssignment = {
      id: "sub-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      className: formSubClass,
      period: formSubPeriod,
      absentTeacher: formSubAbsent,
      substituteTeacher: formSubSubstitute,
      givenTask: formSubTask,
      status: "Menunggu"
    };

    setSubstitutions(prev => [newSub, ...prev]);
    setFormSubTask("");
    triggerAlert("Jadwal Infal Dibuat", `Guru Infal '${formSubSubstitute}' berhasil ditugaskan di kelas ${formSubClass}.`, "success");
  };

  // Send WA to Substitution Teacher
  const sendSubstitutionWA = (sub: SubstitutionAssignment) => {
    const message = `*SIHADIR SMK NEGERI 2 KONAWE - PENUGASAN GURU PENGGANTI (INFAL)*%0A%0A` +
      `Yth. Bapak/Ibu *${sub.substituteTeacher}*,%0A%0A` +
      `Sehubungan dengan berhalangannya hadir rekan kita:*%0A` +
      `👤 Guru Utama: *${sub.absentTeacher}*%0A` +
      `🏫 Mengajar di Kelas: *${sub.className}*%0A` +
      `⏰ Waktu/Jam: *${sub.period}*%0A%0A` +
      `Berdasarkan kesepakatan Guru Piket harian, memohon kesediaan Bapak/Ibu untuk mengawasi kelas tersebut dengan memberikan arahan tugas:*%0A` +
      `📝 Materi / Tugas Murid: *"${sub.givenTask}"*%0A%0A` +
      `Terima kasih atas bantuan dan dedikasi Bapak/Ibu dalam menjaga proses belajar mandiri murid tetap tertib.`;

    const waUrl = `https://wa.me/?text=${message}`;
    window.open(waUrl, "_blank");

    // Update status in list
    setSubstitutions(prev => prev.map(s => s.id === sub.id ? { ...s, status: "Diberitahukan (WA)" } : s));
  };

  // Broadcast WA Schedule Piket
  const sendPiketScheduleWA = (item: typeof JADWAL_PIKET_SMK2_KONAWE[0]) => {
    const message = `*SIHADIR SMK NEGERI 2 KONAWE - JADWAL PETUGAS PIKET RESMI*%0A` +
      `📌 *Hari: ${item.day.toUpperCase()}*%0A` +
      `📋 *${item.teamName}*%0A` +
      `👥 Total Petugas: ${item.totalCount}%0A` +
      `📝 Deskripsi Tugas: ${item.description}%0A%0A` +
      `*Daftar Anggota Petugas Piket:*%0A` +
      item.members.map((m, i) => `${i + 1}. ${m}`).join("%0A") + `%0A%0A` +
      `_Berdasarkan SK Kepala SMK Negeri 2 Konawe No. 521.3/..../800/VII/2026_`;

    const waUrl = `https://wa.me/?text=${message}`;
    window.open(waUrl, "_blank");
  };

  // --- DELETE ACTIONS ---
  const handleDeleteLog = (id: string, type: "kbm" | "pass" | "guest" | "sub") => {
    triggerConfirm(
      "Hapus Data",
      "Apakah Anda yakin ingin menghapus catatan data kerja guru piket ini permanen?",
      () => {
        if (type === "kbm") setKbmLogs(prev => prev.filter(l => l.id !== id));
        if (type === "pass") setStudentPasses(prev => prev.filter(l => l.id !== id));
        if (type === "guest") setGuestBook(prev => prev.filter(l => l.id !== id));
        if (type === "sub") setSubstitutions(prev => prev.filter(l => l.id !== id));
        triggerAlert("Terhapus", "Data berhasil dihapus dari penyimpanan lokal.", "success");
      }
    );
  };

  // Date formatted helper
  const getTodayFormatted = () => {
    return new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner - High density slate elegance */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute inset-0 bg-radial-at-t from-slate-800 via-transparent to-transparent opacity-60"></div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-xl shadow-md">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md">
                Tugas Tambahan Aktif
              </span>
              <h2 className="text-xl font-black tracking-tight mt-1">WORKSPACE GURU PIKET</h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-xl font-medium">
            Monitor Kegiatan Belajar Mengajar (KBM), log kehadiran guru, terbitkan izin keluar/masuk murid, catat buku tamu, dan atur penugasan guru infal/pengganti.
          </p>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const currentCheck = checkIsPiketDutyToday(username, assignedPiketDay);
              if (!currentCheck.isDutyToday) {
                triggerAlert(
                  "⛔ AKSES SCAN QR KEHADIRAN DITOLAK",
                  `Maaf, Anda (${username || 'Guru Piket'}) hanya berwenang melakukan Scan QR Kehadiran Murid pada HARI PIKET Anda (${currentCheck.assignedDays.join(", ")}).\n\nHari ini adalah hari ${currentCheck.todayDay}. Di luar hari piket Anda, Kios Scanner QR Kehadiran Murid dikunci.\n\nJika Anda bertugas menggantikan rekan guru lain hari ini, Anda dapat memilih/menyetel 'Setel Hari Piket' pada kontrol status di bawah.`,
                  "warning"
                );
                return;
              }
              setIsQrScannerOpen(true);
            }}
            className={`font-black text-xs px-4 py-2.5 rounded-2xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 border border-amber-300 shrink-0 ${
              dutyCheck.isDutyToday
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse"
                : "bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed opacity-80"
            }`}
          >
            <QrCode className="h-4.5 w-4.5 text-slate-950" />
            <span>Kios Scan QR Gerbang {dutyCheck.isDutyToday ? "" : "(Terkunci)"}</span>
          </button>
          <div className="space-y-1 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 self-stretch md:self-auto flex md:flex-col justify-between items-center md:items-end">
            <div className="text-left md:text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Tanggal Kerja</span>
              <span className="text-xs font-black text-amber-400">{getTodayFormatted()}</span>
            </div>
            <div className="hidden md:block border-t border-slate-700 w-full my-1.5"></div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Petugas Piket</span>
              <span className="text-xs font-extrabold text-white">{username || "Staf Piket Utama"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Piket Schedule Duty Status Bar */}
      <div className={`p-4 rounded-3xl border transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3.5 shadow-xs ${
        dutyCheck.isDutyToday
          ? "bg-emerald-50 border-emerald-200 text-emerald-950"
          : "bg-rose-50 border-rose-200 text-rose-950"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl text-white font-black shrink-0 ${
            dutyCheck.isDutyToday ? "bg-emerald-600 shadow-sm" : "bg-rose-600 shadow-sm"
          }`}>
            {dutyCheck.isDutyToday ? <CheckCircle className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                dutyCheck.isDutyToday ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
              }`}>
                {dutyCheck.isDutyToday ? "Hak Akses Scan QR: Terbuka" : "Hak Akses Scan QR: Terkunci"}
              </span>
              <span className="text-xs font-bold text-slate-600">
                Hari Ini: <strong className="text-slate-900">{dutyCheck.todayDay}</strong>
              </span>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              {dutyCheck.isDutyToday ? (
                <span>
                  🟢 Anda dapat melakukan Scan QR Kehadiran Murid karena hari ini (<strong>{dutyCheck.todayDay}</strong>) adalah jadwal piket Anda (<strong>{dutyCheck.assignedDays.join(", ")}</strong>).
                </span>
              ) : (
                <span>
                  🔴 Hari ini (<strong>{dutyCheck.todayDay}</strong>) BUKAN jadwal piket Anda (Jadwal Anda: <strong>{dutyCheck.assignedDays.join(", ")}</strong>). Fitur Scan QR Kehadiran Murid khusus Guru Piket dikunci.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch lg:self-auto shrink-0 bg-white/80 p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <label className="text-[10px] font-extrabold uppercase text-slate-700 shrink-0 pl-1">
            Setel Hari Piket:
          </label>
          <select
            value={assignedPiketDay || ""}
            onChange={(e) => {
              const val = e.target.value;
              setAssignedPiketDay(val || null);
              if (val) {
                localStorage.setItem("sihadir_piket_assigned_day", val);
              } else {
                localStorage.removeItem("sihadir_piket_assigned_day");
              }
              window.dispatchEvent(new Event("sihadir_data_updated"));
            }}
            className="bg-white border border-slate-300 text-slate-900 text-xs font-extrabold rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
          >
            <option value="">Otomatis (Sesuai SK Official)</option>
            <option value="Senin">Senin (Seluruh Dewan Guru)</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jum'at">Jum'at</option>
            <option value="Sabtu">Sabtu</option>
            <option value="Semua Hari">Semua Hari (Akses Penguji/Admin)</option>
          </select>
        </div>
      </div>

      {/* Internal Navigation Menu / Segmented Controls */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("summary")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "summary"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Dasbor & Statistik</span>
        </button>
        <button
          onClick={() => setActiveSubTab("jadwal-piket")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "jadwal-piket"
              ? "bg-amber-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Pemetaan Tim Piket (SK Official)</span>
        </button>
        <button
          onClick={() => setActiveSubTab("kbm-logs")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "kbm-logs"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Jurnal KBM Kelas</span>
        </button>
        <button
          onClick={() => setActiveSubTab("student-passes")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "student-passes"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Izin Keluar/Masuk</span>
        </button>
        <button
          onClick={() => setActiveSubTab("guest-book")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "guest-book"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>Buku Tamu Piket</span>
        </button>
        <button
          onClick={() => setActiveSubTab("substitutions")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "substitutions"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Guru Pengganti (Infal)</span>
        </button>
      </div>

      {/* SUB-TABS VIEWS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: SUMMARY & STATS */}
        {activeSubTab === "summary" && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">KBM Kelas Terpantau</span>
                  <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg"><BookOpen className="h-4 w-4" /></div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{kbmLogs.length}</span>
                  <span className="text-[10px] font-bold text-emerald-600">Hari Ini</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Izin Murid Keluar</span>
                  <div className="bg-amber-50 text-amber-600 p-1.5 rounded-lg"><Users className="h-4 w-4" /></div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{studentPasses.length}</span>
                  <span className="text-[10px] font-bold text-slate-500">Izin Aktif</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Kunjungan Tamu</span>
                  <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg"><UserPlus className="h-4 w-4" /></div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{guestBook.length}</span>
                  <span className="text-[10px] font-bold text-slate-500">Kunjungan</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Guru Infal / Pengganti</span>
                  <div className="bg-rose-50 text-rose-600 p-1.5 rounded-lg"><Briefcase className="h-4 w-4" /></div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {substitutions.filter(s => s.status !== "Selasai").length}
                  </span>
                  <span className="text-[10px] font-bold text-rose-600">Pending</span>
                </div>
              </div>
            </div>

            {/* Split Grid for Daily Alert and Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Alert & Duty Guidelines */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5 shrink-0 animate-bounce" />
                  <h4 className="text-xs font-black uppercase tracking-wider">PROSEDUR GURU PIKET</h4>
                </div>
                
                <ul className="text-xs text-slate-700 space-y-3 font-medium">
                  <li className="flex gap-2 items-start">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shrink-0">1</span>
                    <span>Hadir di lobi/pintu gerbang sekolah mulai pukul 07:00 untuk memantau kehadiran murid terlambat.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shrink-0">2</span>
                    <span>Berkeliling setiap pergantian jam pelajaran untuk memantau kelas tanpa guru (kosong) dan menginstruksikan tugas mandiri.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shrink-0">3</span>
                    <span>Menerbitkan Surat Izin Keluar Sekolah bermaterai foto murid sebagai bukti sah meninggalkan sekolah saat jam aktif.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shrink-0">4</span>
                    <span>Menunjuk Guru Infal / Pengganti bilamana terdapat pemberitahuan resmi guru yang berhalangan hadir demi menjaga iklim KBM tetap berjalan.</span>
                  </li>
                </ul>

                <div className="bg-white/80 border border-amber-200/60 p-3.5 rounded-2xl flex items-center gap-2 text-[11px] text-amber-900 font-bold shadow-sm">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>Seluruh surat izin murid WAJIB dikirimkan notifikasinya secara realtime ke WhatsApp Wali Murid!</span>
                </div>
              </div>

              {/* Today's KBM Monitored Incidents */}
              <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-indigo-50 text-indigo-700 rounded-lg"><ClipboardList className="h-4 w-4" /></span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Kronologi / Insiden KBM Hari Ini</h4>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kbmLogs.length} Terpeta</span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {kbmLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium">Belum ada kejadian KBM dicatat hari ini.</div>
                  ) : (
                    kbmLogs.map((log) => (
                      <div key={log.id} className="pt-3 first:pt-0 flex justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] bg-slate-100 border text-slate-700 font-extrabold px-1.5 py-0.5 rounded-md">{log.time}</span>
                            <span className="font-extrabold text-slate-900">{log.className}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-semibold">{log.subject}</span>
                          </div>
                          <p className="text-slate-600 font-medium leading-relaxed italic">
                            &ldquo;{log.incidentNotes}&rdquo;
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <span>Guru: {log.regularTeacher}</span>
                            <span>•</span>
                            <span>Piket: {log.piketStaff}</span>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border tracking-wider ${
                            log.status === "Lancar"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : log.status === "Tugas Mandiri"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 1.5: JADWAL & PEMETAAN TIM PIKET RESMI (SK KEPSEK) */}
        {activeSubTab === "jadwal-piket" && (
          <motion.div
            key="jadwal-piket"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Banner SK Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white p-6 rounded-3xl shadow-lg space-y-2 border border-amber-500/30">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-500/30 pb-3">
                <div>
                  <span className="bg-white text-amber-900 font-black text-[10px] uppercase px-2.5 py-1 rounded-md shadow-xs">
                    SK Kepala Sekolah
                  </span>
                  <h3 className="text-lg font-black tracking-tight mt-1.5">
                    PEMBAGIAN TUGAS TAMBAHAN PETUGAS PIKET SMK NEGERI 2 KONAWE
                  </h3>
                  <p className="text-xs text-amber-100 font-medium">
                    Tahun Pelajaran 2026-2027 • Keputusan No. 521.3 / .... / 800 / VII / 2026 (22 Juli 2026)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const activeTeam = JADWAL_PIKET_SMK2_KONAWE.find(j => j.day === selectedScheduleDay) || JADWAL_PIKET_SMK2_KONAWE[4];
                    sendPiketScheduleWA(activeTeam);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span>Broadcast WA Tim Hari Ini</span>
                </button>
              </div>

              <p className="text-xs text-amber-100/90 leading-relaxed font-medium pt-1">
                Seluruh petugas piket pada hari yang bersangkutan secara otomatis terintegrasi ke dalam satu akun kerja Guru Piket. Untuk hari <strong>Senin</strong>, tugas piket dilaksanakan oleh <strong>Seluruh Guru SMK Negeri 2 Konawe</strong> secara kolektif.
              </p>
            </div>

            {/* Day Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {JADWAL_PIKET_SMK2_KONAWE.map((item) => {
                const isSelected = selectedScheduleDay.toLowerCase().replace("'", "") === item.day.toLowerCase().replace("'", "");
                return (
                  <button
                    key={item.day}
                    onClick={() => {
                      setSelectedScheduleDay(item.day);
                      const detailElem = document.getElementById("detail-tim-piket");
                      if (detailElem) {
                        detailElem.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-amber-500/40"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-wider">{item.day}</span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-600"
                      }`}>
                        {item.totalCount}
                      </span>
                    </div>
                    <span className="text-[10px] block font-semibold truncate opacity-80">
                      {item.isAllTeachers ? "Seluruh Guru" : `${item.members.length} Petugas`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Detailed Mapped View for Selected Day */}
            {(() => {
              const activeItem = JADWAL_PIKET_SMK2_KONAWE.find(j => j.day.toLowerCase().replace("'", "") === selectedScheduleDay.toLowerCase().replace("'", "")) || JADWAL_PIKET_SMK2_KONAWE[4];
              return (
                <div id="detail-tim-piket" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 scroll-mt-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                          Tim Piket Hari {activeItem.day}
                        </span>
                        <span className="text-xs font-bold text-slate-400">•</span>
                        <span className="text-xs font-bold text-slate-500">{activeItem.totalCount}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        {activeItem.teamName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{activeItem.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => sendPiketScheduleWA(activeItem)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Kirim Laporan Tim WA</span>
                    </button>
                  </div>

                  {/* List of Personnel mapped */}
                  <div className="space-y-3">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                      Anggota Tim Piket Terpetakan ({activeItem.day})
                    </span>

                    {activeItem.isAllTeachers ? (
                      <div className="p-5 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl text-center space-y-2">
                        <Users className="h-8 w-8 text-indigo-600 mx-auto" />
                        <h4 className="text-sm font-black text-indigo-950">SELURUH DEWAN GURU SMK NEGERI 2 KONAWE</h4>
                        <p className="text-xs text-indigo-800/80 max-w-xl mx-auto font-medium">
                          Pada hari Senin, seluruh guru bertugas sebagai tim piket kolektif untuk menertibkan jalannya Upacara Bendera, Apel Awal Pekan, dan monitoring kedisiplinan gerbang sekolah.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeItem.members.map((member, idx) => {
                          const isCurrentUser = username && member.toLowerCase().includes(username.toLowerCase());
                          return (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                                isCurrentUser
                                  ? "bg-amber-50 border-amber-300 shadow-sm ring-2 ring-amber-400/30"
                                  : "bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`h-8 w-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                                  isCurrentUser ? "bg-amber-500 text-slate-950" : "bg-slate-200 text-slate-700"
                                }`}>
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-extrabold text-xs text-slate-900 block leading-snug">{member}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold block">Petugas Piket Hari {activeItem.day}</span>
                                </div>
                              </div>

                              {isCurrentUser && (
                                <span className="bg-amber-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Matrix View of All 6 Days */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b pb-3">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Rekapitulasi Pemetaan Petugas Piket Sepekan (Senin - Sabtu)
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Satu akun Guru Piket menampung anggota piket yang bertugas pada hari berkenaan secara terintegrasi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {JADWAL_PIKET_SMK2_KONAWE.map((item) => {
                  const isSelected = selectedScheduleDay.toLowerCase().replace("'", "") === item.day.toLowerCase().replace("'", "");
                  return (
                    <div
                      key={item.day}
                      className={`border rounded-2xl p-4 space-y-3 flex flex-col justify-between transition-all ${
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-500 shadow-md ring-2 ring-indigo-500/30"
                          : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                          <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-md ${
                            isSelected ? "bg-indigo-600 text-white" : "text-indigo-900 bg-indigo-100/80"
                          }`}>
                            {item.day} {isSelected && "• Aktif"}
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-500 bg-white border px-2 py-0.5 rounded-md">
                            {item.totalCount}
                          </span>
                        </div>

                        <ul className="space-y-1 text-xs font-medium text-slate-700">
                          {item.members.map((m, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isSelected ? "bg-indigo-600" : "bg-amber-500"}`}></span>
                              <span className="truncate">{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedScheduleDay(item.day);
                          const detailElem = document.getElementById("detail-tim-piket");
                          if (detailElem) {
                            detailElem.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className={`w-full font-extrabold text-[11px] py-2 rounded-xl cursor-pointer text-center transition-all ${
                          isSelected
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                            : "bg-white hover:bg-slate-100 border text-slate-800"
                        }`}
                      >
                        {isSelected ? `✓ Sedang Dilihat (${item.day})` : `Lihat Tim ${item.day}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: JURNAL KBM KELAS */}
        {activeSubTab === "kbm-logs" && (
          <motion.div
            key="kbm-logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-5"
          >
            {/* Input Form Column */}
            <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 self-start">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Plus className="h-5 w-5 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Input Pantauan Kelas</h4>
              </div>

              <form onSubmit={handleAddKbmLog} className="space-y-3.5 text-xs font-medium">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Kelas Pantauan</label>
                  <select
                    value={formKbmClass}
                    onChange={(e) => setFormKbmClass(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2 font-bold cursor-pointer"
                  >
                    {CLASSES_LIST.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={formKbmSubject}
                    onChange={(e) => setFormKbmSubject(e.target.value)}
                    placeholder="Contoh: Pemeliharaan Sasis Motor"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white transition-all font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Guru Mata Pelajaran</label>
                  <select
                    value={formKbmTeacher}
                    onChange={(e) => setFormKbmTeacher(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2 cursor-pointer"
                  >
                    {TEACHERS_LIST.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Status KBM</label>
                  <select
                    value={formKbmStatus}
                    onChange={(e) => setFormKbmStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border rounded-xl p-2 font-bold cursor-pointer"
                  >
                    <option value="Lancar">Lancar (Guru Hadir)</option>
                    <option value="Tugas Mandiri">Guru Absen (Tugas Mandiri)</option>
                    <option value="Kelas Kosong">Guru Absen (Kelas Kosong)</option>
                    <option value="Guru Terlambat">Guru Terlambat Hadir</option>
                    <option value="Insiden Murid">Terdapat Kejadian Murid</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Catatan Detail Kejadian</label>
                  <textarea
                    rows={3}
                    value={formKbmNotes}
                    onChange={(e) => setFormKbmNotes(e.target.value)}
                    placeholder="Contoh: Jam 1 guru belum hadir, kelas dialihkan ke modul latihan mandiri oleh piket."
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] py-3 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Simpan ke Jurnal Piket
                </button>
              </form>
            </div>

            {/* List Table Column */}
            <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-indigo-50 text-indigo-700 rounded-lg"><BookOpen className="h-4 w-4" /></span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Rekap Monitoring KBM Harian</h4>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kelas, guru, mapel..."
                    className="w-full pl-8 pr-3 py-1 bg-slate-50 border rounded-xl text-xs focus:bg-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                      <th className="py-2.5">Waktu</th>
                      <th>Kelas</th>
                      <th>Guru / Mapel</th>
                      <th>Status</th>
                      <th>Catatan / Insiden</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {kbmLogs
                      .filter(log => {
                        const q = searchQuery.toLowerCase();
                        return log.className.toLowerCase().includes(q) || 
                               log.subject.toLowerCase().includes(q) || 
                               log.regularTeacher.toLowerCase().includes(q) ||
                               log.status.toLowerCase().includes(q);
                      })
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="py-3 font-mono font-bold text-slate-500">{log.time}</td>
                          <td className="font-extrabold text-slate-900">{log.className}</td>
                          <td>
                            <div className="font-bold">{log.subject}</div>
                            <div className="text-[10px] text-slate-400">{log.regularTeacher}</div>
                          </td>
                          <td>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                              log.status === "Lancar"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : log.status === "Tugas Mandiri"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="max-w-xs text-slate-500 text-[11px] truncate" title={log.incidentNotes}>
                            {log.incidentNotes}
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => handleDeleteLog(log.id, "kbm")}
                              className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                    ))}
                    {kbmLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">Belum ada jurnal monitoring kelas hari ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 3: IZIN KELUAR/MASUK MURID */}
        {activeSubTab === "student-passes" && (
          <motion.div
            key="student-passes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-5"
          >
            {/* Permission slip form */}
            <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 self-start">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Plus className="h-5 w-5 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Terbitkan Surat Izin</h4>
              </div>

              <form onSubmit={handleAddStudentPass} className="space-y-3.5 text-xs font-medium">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Nama Murid</label>
                  <input
                    type="text"
                    value={formPassName}
                    onChange={(e) => setFormPassName(e.target.value)}
                    placeholder="Contoh: Ridwan Al-Farizi"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white transition-all font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Kelas</label>
                    <select
                      value={formPassClass}
                      onChange={(e) => setFormPassClass(e.target.value)}
                      className="w-full bg-slate-50 border rounded-xl p-2 font-bold cursor-pointer"
                    >
                      {CLASSES_LIST.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Jenis Izin</label>
                    <select
                      value={formPassType}
                      onChange={(e) => setFormPassType(e.target.value as any)}
                      className="w-full bg-slate-50 border rounded-xl p-2 font-bold cursor-pointer"
                    >
                      <option value="Izin Keluar Sekolah">Izin Pulang Cepat</option>
                      <option value="Izin Meninggalkan Kelas">Meninggalkan Kelas</option>
                      <option value="Izin Terlambat Masuk">Izin Terlambat Masuk</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Alasan Izin</label>
                  <textarea
                    rows={2}
                    value={formPassReason}
                    onChange={(e) => setFormPassReason(e.target.value)}
                    placeholder="Contoh: Mengalami demam mendadak & pusing setelah KBM jam pertama."
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">No. Telepon / WA Orang Tua</label>
                  <input
                    type="text"
                    value={formPassPhone}
                    onChange={(e) => setFormPassPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white transition-all font-mono"
                  />
                </div>

                {/* Evidence Attachment Section */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Lampiran / Bukti Fisik</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    
                    {/* Camera Capture */}
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Ambil Foto</span>
                    </button>

                    {/* File Upload Hidden */}
                    <label className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl transition-all cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span>Unggah Slip</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>

                    {formPassPhoto && (
                      <button
                        type="button"
                        onClick={() => setFormPassPhoto(null)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-2.5 py-2 rounded-xl transition-all"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>

                  {/* Camera view if active */}
                  {isCapturing && (
                    <div className="relative mt-2 border rounded-2xl overflow-hidden bg-black max-w-[240px] mx-auto">
                      <video ref={videoRef} className="w-full h-auto object-cover transform scale-x-[-1]"></video>
                      <button
                        type="button"
                        onClick={captureSnapshot}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-full text-[10px]"
                      >
                        Potret Sekarang
                      </button>
                    </div>
                  )}

                  {formPassPhoto && !isCapturing && (
                    <div className="relative mt-2 border rounded-2xl overflow-hidden w-28 h-20 bg-slate-150">
                      <img src={formPassPhoto} alt="Bukti Slip" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-650 hover:bg-indigo-750 text-white font-black uppercase text-[10px] py-3 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Terbitkan Surat Izin
                </button>
              </form>
            </div>

            {/* Permissions list Column */}
            <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-50 text-amber-700 rounded-lg"><ClipboardList className="h-4 w-4" /></span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Daftar Izin Keluar/Masuk Hari Ini</h4>
                </div>
              </div>

              <div className="space-y-4">
                {studentPasses.map((pass) => (
                  <div key={pass.id} className="border rounded-2xl p-4 space-y-3 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-800 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {pass.type}
                        </span>
                        <h5 className="text-sm font-black text-slate-900 mt-1">{pass.studentName} <span className="text-slate-400 font-bold">({pass.className})</span></h5>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Dibuat Pukul {pass.time} WITA</span>
                          <span>•</span>
                          <span>Oleh: {pass.approvedBy}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          pass.parentNotificationStatus.includes("Terkirim")
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {pass.parentNotificationStatus}
                        </span>
                        <button
                          onClick={() => sendStudentPassWA(pass)}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-sm transition-all cursor-pointer"
                        >
                          <Share2 className="h-3 w-3" />
                          <span>Kirim WA</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl text-xs font-medium">
                      <div className="md:col-span-3 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Keterangan / Alasan Resmi</span>
                        <p className="text-slate-700">{pass.reason}</p>
                      </div>
                      
                      {/* Photo evidence if any */}
                      <div className="md:col-span-1 flex flex-col justify-end">
                        {pass.photoEvidence ? (
                          <div className="relative border rounded-lg overflow-hidden h-14 w-full bg-slate-200">
                            <img src={pass.photoEvidence} alt="Bukti Lampiran" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="text-[10px] italic text-slate-400 border border-dashed rounded-lg p-2 text-center">Tanpa bukti foto</div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1 border-t">
                      <button
                        onClick={() => handleDeleteLog(pass.id, "pass")}
                        className="text-rose-500 hover:text-rose-700 flex items-center gap-1 text-[10px] font-extrabold cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus Catatan Izin</span>
                      </button>
                    </div>
                  </div>
                ))}

                {studentPasses.length === 0 && (
                  <div className="text-center py-12 border border-dashed rounded-3xl text-slate-400 text-xs font-medium">
                    Belum ada surat izin yang diterbitkan hari ini.
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 4: BUKU TAMU PIKET */}
        {activeSubTab === "guest-book" && (
          <motion.div
            key="guest-book"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-5"
          >
            {/* Guest book form */}
            <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 self-start">
              <div className="flex items-center gap-2 pb-2 border-b">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Registrasi Tamu Baru</h4>
              </div>

              <form onSubmit={handleAddGuestEntry} className="space-y-3.5 text-xs font-medium">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Nama Lengkap Tamu</label>
                  <input
                    type="text"
                    value={formGuestName}
                    onChange={(e) => setFormGuestName(e.target.value)}
                    placeholder="Contoh: Dra. Herlina Sugiarti"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white transition-all font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Instansi / Hubungan</label>
                  <select
                    value={formGuestOrg}
                    onChange={(e) => setFormGuestOrg(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2 font-bold cursor-pointer"
                  >
                    <option value="Orang Tua / Wali Murid">Orang Tua / Wali Murid</option>
                    <option value="Dinas Pendidikan / Pengawas">Dinas Pendidikan / Pengawas</option>
                    <option value="Sales / Vendor Sekolah">Sales / Vendor Kemitraan</option>
                    <option value="Alumni Murid">Alumni Murid</option>
                    <option value="Tamu Umum / Masyarakat">Tamu Umum / Masyarakat</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Keperluan Kunjungan</label>
                  <textarea
                    rows={2}
                    value={formGuestPurpose}
                    onChange={(e) => setFormGuestPurpose(e.target.value)}
                    placeholder="Contoh: Berkoordinasi dengan wali kelas mengenai progres remedial putra beliau."
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Menemui Siapa (Tujuan)</label>
                  <input
                    type="text"
                    value={formGuestVisited}
                    onChange={(e) => setFormGuestVisited(e.target.value)}
                    placeholder="Contoh: Bpk. Ahmad Fauzi (Wali Kelas XI TKR A)"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white transition-all font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Nomor Kontak / WA</label>
                  <input
                    type="text"
                    value={formGuestPhone}
                    onChange={(e) => setFormGuestPhone(e.target.value)}
                    placeholder="Contoh: 085211112222"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white transition-all font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] py-3 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Registrasi Masuk Tamu
                </button>
              </form>
            </div>

            {/* Guest book list Column */}
            <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-indigo-50 text-indigo-700 rounded-lg"><UserCheck className="h-4 w-4" /></span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Buku Tamu Piket Harian</h4>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                      <th className="py-2.5">Tamu / Instansi</th>
                      <th>No. Telp</th>
                      <th>Keperluan / Bertemu</th>
                      <th>Jam Masuk</th>
                      <th>Jam Keluar</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {guestBook.map((guest) => (
                      <tr key={guest.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="py-3">
                          <div className="font-extrabold text-slate-900">{guest.guestName}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{guest.organization}</div>
                        </td>
                        <td className="font-mono">{guest.phone}</td>
                        <td>
                          <div className="font-semibold text-slate-800">{guest.purpose}</div>
                          <div className="text-[10px] text-indigo-600 font-bold">Bertemu: {guest.visitedPerson}</div>
                        </td>
                        <td className="font-bold text-emerald-600">{guest.timeIn} WITA</td>
                        <td>
                          {guest.timeOut ? (
                            <span className="font-bold text-slate-500">{guest.timeOut} WITA</span>
                          ) : (
                            <button
                              onClick={() => handleCheckoutGuest(guest.id)}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-extrabold text-[9px] px-2 py-1 rounded-lg transition-all cursor-pointer"
                            >
                              Checkout Tamu
                            </button>
                          )}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleDeleteLog(guest.id, "guest")}
                            className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {guestBook.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">Belum ada kunjungan tamu hari ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 5: GURU PENGGANTI (INFAL) */}
        {activeSubTab === "substitutions" && (
          <motion.div
            key="substitutions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-5"
          >
            {/* Substitution form */}
            <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 self-start">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Buat Jadwal Guru Infal</h4>
              </div>

              <form onSubmit={handleAddSubstitution} className="space-y-3.5 text-xs font-medium">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Kelas yang Kosong</label>
                  <select
                    value={formSubClass}
                    onChange={(e) => setFormSubClass(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2 font-bold cursor-pointer"
                  >
                    {CLASSES_LIST.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Jam Pelajaran</label>
                  <select
                    value={formSubPeriod}
                    onChange={(e) => setFormSubPeriod(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2 font-bold cursor-pointer"
                  >
                    <option value="Jam 1 - 2 (07:15 - 08:45)">Jam 1 - 2 (07:15 - 08:45)</option>
                    <option value="Jam 3 - 4 (08:45 - 10:15)">Jam 3 - 4 (08:45 - 10:15)</option>
                    <option value="Jam 5 - 6 (10:30 - 12:00)">Jam 5 - 6 (10:30 - 12:00)</option>
                    <option value="Jam 7 - 8 (12:30 - 14:00)">Jam 7 - 8 (12:30 - 14:00)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Guru Utama (Absen)</label>
                  <select
                    value={formSubAbsent}
                    onChange={(e) => setFormSubAbsent(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2 cursor-pointer"
                  >
                    {TEACHERS_LIST.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Ditugaskan Kepada (Guru Infal)</label>
                  <select
                    value={formSubSubstitute}
                    onChange={(e) => setFormSubSubstitute(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2 font-bold cursor-pointer"
                  >
                    {TEACHERS_LIST.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Instruksi Tugas Murid</label>
                  <textarea
                    rows={2}
                    value={formSubTask}
                    onChange={(e) => setFormSubTask(e.target.value)}
                    placeholder="Contoh: Mengerjakan soal pilihan ganda di halaman 85 pada buku cetak produktif otomotif..."
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] py-3 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Tugaskan Guru Pengganti
                </button>
              </form>
            </div>

            {/* Substitution lists Column */}
            <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-indigo-50 text-indigo-700 rounded-lg"><ClipboardList className="h-4 w-4" /></span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Daftar Penggantian Mengajar (Infal)</h4>
                </div>
              </div>

              <div className="space-y-3.5">
                {substitutions.map((sub) => (
                  <div key={sub.id} className="border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between gap-4 hover:shadow-sm transition-all bg-slate-50/20">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-extrabold text-indigo-950 bg-indigo-50 border border-indigo-150 px-1.5 py-0.5 rounded-md">{sub.className}</span>
                        <span className="text-slate-400 font-bold">{sub.period}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Guru Utama (Absen)</span>
                          <span className="text-slate-700 font-bold">{sub.absentTeacher}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Guru Pengganti (Infal)</span>
                          <span className="text-indigo-700 font-extrabold">{sub.substituteTeacher}</span>
                        </div>
                      </div>

                      <div className="bg-white border rounded-xl p-2.5 text-xs text-slate-600 font-medium leading-relaxed shadow-inner">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Tugas yang Ditinggalkan:</span>
                        &ldquo;{sub.givenTask}&rdquo;
                      </div>
                    </div>

                    <div className="shrink-0 flex md:flex-col justify-between items-end gap-2 border-t md:border-t-0 pt-2.5 md:pt-0">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-wider ${
                        sub.status === "Selasai"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {sub.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => sendSubstitutionWA(sub)}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-xl shadow-sm cursor-pointer transition-all"
                        >
                          <Share2 className="h-3 w-3" />
                          <span>Notif WA Guru</span>
                        </button>
                        <button
                          onClick={() => handleDeleteLog(sub.id, "sub")}
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {substitutions.length === 0 && (
                  <div className="text-center py-12 border border-dashed rounded-3xl text-slate-400 text-xs font-medium">
                    Belum ada penugasan guru infal hari ini.
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* --- CONFIRM MODAL --- */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 text-left font-sans text-slate-800"
            >
              <div className="flex items-center gap-2.5 text-rose-600">
                <Trash2 className="h-5 w-5" />
                <h4 className="text-sm font-black uppercase tracking-wider">{confirmModal.title}</h4>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ALERT MODAL --- */}
      <AnimatePresence>
        {alertModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 text-left font-sans text-slate-800"
            >
              <div className="flex items-center gap-2.5 text-indigo-600">
                <span className="text-xl">⚠️</span>
                <h4 className="text-sm font-black uppercase tracking-wider">{alertModal.title}</h4>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {alertModal.message}
              </p>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAlertModal(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        role="Guru Piket"
      />

    </div>
  );
}
