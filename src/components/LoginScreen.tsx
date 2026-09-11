import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, User, ShieldAlert, CheckCircle, GraduationCap, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff, KeyRound } from "lucide-react";
import { OFFICIAL_CLASSES, CLASS_CAPTAIN_MAP, getStudentCaptainClass } from "../data/classCaptains";
import { MOCK_STUDENTS } from "../mockData";
import { SIHADIR_THEMES, ThemeId } from "../utils/themeConfig";
import { DraggableThemeWidget } from "./DraggableThemeWidget";
import { getAllTeachers } from "../services/teacherService";

interface LoginScreenProps {
  onLoginSuccess: (username: string, role: string) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgTheme, setBgTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem("sihadir_bg_theme") as ThemeId;
    if (saved && SIHADIR_THEMES[saved]) return saved;
    return "blue-white";
  });
  const [loginMode, setLoginMode] = useState<"murid" | "ketua_kelas" | "staf">("murid");

  // Save selected background theme to localStorage and dispatch event
  const handleThemeChange = (newTheme: ThemeId) => {
    setBgTheme(newTheme);
    localStorage.setItem("sihadir_bg_theme", newTheme);
    window.dispatchEvent(new Event("sihadir_bg_theme_changed"));
  };

  React.useEffect(() => {
    const syncTheme = () => {
      const saved = localStorage.getItem("sihadir_bg_theme") as ThemeId;
      if (saved && SIHADIR_THEMES[saved]) {
        setBgTheme(saved);
      }
    };
    window.addEventListener("storage", syncTheme);
    window.addEventListener("sihadir_bg_theme_changed", syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("sihadir_bg_theme_changed", syncTheme);
    };
  }, []);

  // List of students loaded from localStorage, or defaults
  const getDynamicStudents = (): any[] => {
    const saved = localStorage.getItem("simpati_students_list");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    // Fallback: build list from static mock/default map
    return MOCK_STUDENTS;
  };

  const allStudents = getDynamicStudents();

  const MAJORS_LIST = [
    { id: "TKR", name: "Teknik Kendaraan Ringan (TKR)", code: "TKR" },
    { id: "TSM", name: "Teknik Sepeda Motor (TSM)", code: "TSM" },
    { id: "TAV", name: "Teknik Audio Video (TAV)", code: "TAV" },
    { id: "DPIB", name: "Desain Pemodelan & Informasi Bangunan (DPIB)", code: "DPIB" },
    { id: "DKV", name: "Desain Komunikasi Visual (DKV)", code: "DKV" }
  ];

  const [selectedMajor, setSelectedMajor] = useState<string>("TKR");

  const filteredStudentsByMajor = allStudents.filter(s => {
    const majorCode = selectedMajor.toUpperCase();
    const studentMajor = (s.major || "").toUpperCase();
    const studentClass = (s.className || "").toUpperCase();
    return studentMajor.includes(majorCode) || studentClass.includes(majorCode);
  });

  // Get list of unique student classes
  const studentClasses = Array.from(new Set(allStudents.map(s => s.className || "XI TKR A"))).sort();

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    return studentClasses[0] || "XI TKR A";
  });

  // Official list of 18 classes for Ketua Kelas
  const KETUA_KELAS_CLASSES = OFFICIAL_CLASSES;

  const [ketuaKelasClass, setKetuaKelasClass] = useState<string>(() => {
    return localStorage.getItem("sihadir_ketua_kelas_class") || "X TKR A";
  });

  const [ketuaKelasName, setKetuaKelasName] = useState<string>(() => {
    const savedClass = localStorage.getItem("sihadir_ketua_kelas_class") || "X TKR A";
    const savedName = localStorage.getItem("sihadir_ketua_kelas_name");
    const officialCaptain = CLASS_CAPTAIN_MAP[savedClass] || "MUH. ZAKIR ASSAJAD";
    if (savedName && savedName !== "Satria Perkasa" && savedName !== "MUHAMAD SHIDIQ FATHONI" && savedName !== "ALFIN SEPRIANTO") {
      return savedName;
    }
    return officialCaptain;
  });

  // Filter students based on selected class
  const filteredStudents = allStudents.filter(s => (s.className || "XI TKR A") === selectedClass);

  const [selectedStudentName, setSelectedStudentName] = useState<string>(() => {
    return allStudents[0]?.name || "";
  });

  // Predefined list of users based on SMK Negeri 2 Konawe classes
  const PRESETS = [
    { name: "Admin Utama — ARHAM AMIRUDDIN", username: "arham", role: "admin", desc: "Akses Penuh Administrator Utama SIHADIR" },
    { name: "Administrator Utama", username: "admin", role: "admin", desc: "Akses Penuh Administrator Utama SIHADIR" },
    { name: "Guru (Terhubung All-In-One)", username: "budi", role: "guru", desc: "Akses Terhubung: Guru Mapel, Guru Wali, Guru Piket & Wali Kelas" },
    { name: "Guru Wali", username: "dian", role: "guru_wali", desc: "Presensi Harian & Pembimbingan (Terhubung)" },
    { name: "Guru Piket", username: "piket", role: "piket", desc: "Monitor KBM, Absen Kelas & Jurnal Harian (Terhubung)" },
    { name: "Wali Kelas", username: "ahmad", role: "wali", desc: "Akses Wali Kelas & Kirim laporan WA (Terhubung)" },
    { name: "Guru BK (Cici Murni & Pak Yoga)", username: "suci", role: "bk", desc: "Khusus Guru BK (Bu Cici Murni & Pak Yoga Nanda Hermawan)" },
    { name: "Admin Tata Usaha (TU)", username: "tu", role: "tu", desc: "Rekap & Arsip Laporan Kehadiran Murid" },
    { name: "Kepala Sekolah", username: "kepsek", role: "kepsek", desc: "Akses menu Review & Laporan Supervisi" },
    { name: "Waka Kesiswaan", username: "kesiswaan", role: "kesiswaan", desc: "Akses menu Waka Kesiswaan & Kedisiplinan Murid" },
    { name: "Waka Kurikulum", username: "kurikulum", role: "kurikulum", desc: "Akses menu Waka Kurikulum" },
  ];

  // Dynamic Teachers & Staff list using centralized teacherService (preserves photos & custom records)
  const getDynamicTeachers = (): any[] => {
    return getAllTeachers();
  };

  const allTeachers = getDynamicTeachers();

  const tuStaff = allTeachers.filter(t => {
    const roleLower = (t.role || "").toLowerCase();
    const nameUpper = (t.name || "").toUpperCase();
    return roleLower.includes("tata usaha") || roleLower.includes("tu") ||
           nameUpper.includes("SAKTINANI") || nameUpper.includes("ADELIA") ||
           nameUpper.includes("ARFAN") || nameUpper.includes("ELPI") ||
           nameUpper.includes("KOMANG") || nameUpper.includes("WIDI");
  });

  const otherTeachers = allTeachers.filter(t => {
    const roleLower = (t.role || "").toLowerCase();
    const nameUpper = (t.name || "").toUpperCase();
    const isTu = roleLower.includes("tata usaha") || roleLower.includes("tu") ||
                 nameUpper.includes("SAKTINANI") || nameUpper.includes("ADELIA") ||
                 nameUpper.includes("ARFAN") || nameUpper.includes("ELPI") ||
                 nameUpper.includes("KOMANG") || nameUpper.includes("WIDI");
    return !isTu;
  });

  const [selectedTeacherName, setSelectedTeacherName] = useState<string>(() => {
    const saved = localStorage.getItem("sihadir_active_teacher_name") || localStorage.getItem("sihadir_username");
    if (saved && !saved.toLowerCase().includes("adrian") && saved.toLowerCase() !== "admin") {
      return saved;
    }
    const admin = allTeachers.find(t => (t.name.toUpperCase().includes("ARHAM") || t.name.toUpperCase().includes("AMIRUDDIN")) && !t.role.toLowerCase().includes("tata usaha"));
    if (admin) return admin.name.replace(/\s*\([^)]*\)/g, "").trim();
    return "ARHAM AMIRUDDIN, S.Pd.Gr";
  });

  const [selectedRole, setSelectedRole] = useState<string>("guru");
  const [customTeacherName, setCustomTeacherName] = useState<string>("");

  const isSelectedSaktiOrAdelia = (() => {
    const nameUpper = (selectedTeacherName || "").toUpperCase();
    return nameUpper.includes("SAKTINANI") || nameUpper.includes("ADELIA") || nameUpper.includes("SAKTI") || nameUpper.includes("ADEL");
  })();

  const STAFF_ROLE_OPTIONS = [
    { label: "Guru Mata Pelajaran", value: "guru" },
    { label: isSelectedSaktiOrAdelia ? "Admin Tata Usaha (TU)" : "Staf Tata Usaha", value: "tu" },
    { label: "Administrator Utama", value: "admin" },
    { label: "Guru Bimbingan Konseling (BK)", value: "bk" },
    { label: "Guru Piket", value: "piket" },
    { label: "Guru Wali", value: "guru_wali" },
    { label: "Wali Kelas", value: "wali" },
    { label: "Kepala Sekolah", value: "kepsek" },
    { label: "Waka Kurikulum", value: "kurikulum" },
    { label: "Waka Kesiswaan", value: "kesiswaan" }
  ];

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);

    if (newRole === "kepsek") {
      const kepsek = allTeachers.find(t => (t.role || "").toLowerCase().includes("kepala sekolah") || t.name.includes("Manan"));
      if (kepsek) setSelectedTeacherName(kepsek.name.replace(/\s*\([^)]*\)/g, "").trim());
    } else if (newRole === "kesiswaan") {
      const kes = allTeachers.find(t => (t.role || "").toLowerCase().includes("kesiswaan") || t.name.includes("Suliawati"));
      if (kes) setSelectedTeacherName(kes.name.replace(/\s*\([^)]*\)/g, "").trim());
    } else if (newRole === "kurikulum") {
      const kur = allTeachers.find(t => (t.role || "").toLowerCase().includes("kurikulum") || t.name.includes("Asrul"));
      if (kur) setSelectedTeacherName(kur.name.replace(/\s*\([^)]*\)/g, "").trim());
    } else if (newRole === "admin") {
      const admin = allTeachers.find(t => (t.name.toUpperCase().includes("ARHAM") || t.name.toUpperCase().includes("AMIRUDDIN")) && !t.role.toLowerCase().includes("tata usaha"));
      if (admin) setSelectedTeacherName(admin.name.replace(/\s*\([^)]*\)/g, "").trim());
    } else if (newRole === "bk") {
      const bk = allTeachers.find(t => (t.role || "").toLowerCase().includes("bk") || t.role.toLowerCase().includes("konseling"));
      if (bk) setSelectedTeacherName(bk.name.replace(/\s*\([^)]*\)/g, "").trim());
    } else if (newRole === "tu") {
      if (tuStaff.length > 0) {
        setSelectedTeacherName(tuStaff[0].name.replace(/\s*\([^)]*\)/g, "").trim());
      }
    }
    // For "piket", "guru_wali", "wali", and "guru", retain the current selectedTeacherName so any teacher can be selected for these positions
  };

  const handleSelectTeacher = (teacherName: string) => {
    setSelectedTeacherName(teacherName);
    if (teacherName === "CUSTOM") return;

    const cleanInput = teacherName.replace(/\s*\([^)]*\)/g, "").trim();
    const foundTeacher = allTeachers.find(t => {
      const cleanT = (t.name || "").replace(/\s*\([^)]*\)/g, "").trim();
      return cleanT.toLowerCase() === cleanInput.toLowerCase() || t.name === teacherName;
    });

    if (foundTeacher) {
      const roleLower = (foundTeacher.role || "").toLowerCase();
      const nameUpper = (foundTeacher.name || "").toUpperCase();

      if (roleLower.includes("tata usaha") || roleLower.includes("staf tu") || nameUpper.includes("SAKTINANI") || nameUpper.includes("ADELIA") || nameUpper.includes("SAKTI") || nameUpper.includes("ADEL")) {
        setSelectedRole("tu");
      } else if (roleLower.includes("kepala sekolah") || nameUpper.includes("MANAN")) {
        setSelectedRole("kepsek");
      } else if (roleLower.includes("kesiswaan") || nameUpper.includes("SULIAWATI")) {
        setSelectedRole("kesiswaan");
      } else if (roleLower.includes("kurikulum") || nameUpper.includes("ASRUL")) {
        setSelectedRole("kurikulum");
      } else if (nameUpper.includes("ARHAM") || nameUpper.includes("AMIRUDDIN") || (roleLower.includes("admin") && !roleLower.includes("tata usaha"))) {
        setSelectedRole("admin");
      } else if (roleLower.includes("bk") || roleLower.includes("konseling")) {
        setSelectedRole("bk");
      } else {
        // For general teacher roles (guru, piket, guru_wali, wali), keep the user's currently chosen role if it's one of these
        if (!["guru", "piket", "guru_wali", "wali"].includes(selectedRole)) {
          setSelectedRole("guru");
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (loginMode === "siswa") {
      if (!selectedStudentName) {
        setError("Silakan pilih Nama Murid.");
        return;
      }
      const activeStudent = allStudents.find(
        (s) => s.name === selectedStudentName
      );
      const expectedNisn = (activeStudent?.nisn || activeStudent?.nis || "").trim();
      if (!expectedNisn) {
        setError("Data NISN tidak ditemukan untuk murid ini. Silakan hubungi Admin Utama.");
        return;
      }
      if (password.trim() !== expectedNisn) {
        setError(`Kata sandi salah! Kata sandi akun murid menggunakan nomor NISN resmi Anda (NISN: ${expectedNisn}).`);
        return;
      }

      // Auto-sync Ketua Kelas assignment ONLY if student is a designated Ketua Kelas
      const studentCaptainCls = getStudentCaptainClass(selectedStudentName);
      if (studentCaptainCls) {
        localStorage.setItem("sihadir_ketua_kelas_class", studentCaptainCls);
        localStorage.setItem("sihadir_ketua_kelas_name", selectedStudentName);
      }

      onLoginSuccess(selectedStudentName, "murid");
      return;
    }

    if (loginMode === "ketua_kelas") {
      if (password !== "ketuakelas") {
        setError("Kata sandi salah! Untuk informasi kata sandi hubungi Admin Utama.");
        return;
      }
      localStorage.setItem("sihadir_ketua_kelas_class", ketuaKelasClass);
      localStorage.setItem("sihadir_ketua_kelas_name", ketuaKelasName);
      onLoginSuccess(ketuaKelasName, "ketua_kelas");
      return;
    }

    if (loginMode === "staf") {
      let finalTeacherName = selectedTeacherName === "CUSTOM" ? customTeacherName.trim() : selectedTeacherName;
      if (selectedRole === "admin" && (!finalTeacherName || finalTeacherName.toUpperCase().includes("ADRIAN"))) {
        finalTeacherName = "ARHAM AMIRUDDIN, S.Pd.Gr";
      }
      if (!finalTeacherName) {
        setError("Silakan pilih atau ketikkan Nama Guru/Staf SMK Negeri 2 Konawe.");
        return;
      }
      const validStaffPasswords = ["adminsihadir", "smkn2konawe", "admin", "tu"];
      if (!validStaffPasswords.includes(password)) {
        setError("Kata sandi salah! Untuk informasi kata sandi hubungi Admin Utama.");
        return;
      }
      localStorage.setItem("sihadir_active_teacher_name", finalTeacherName);
      onLoginSuccess(finalTeacherName, selectedRole);
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const isKetuaKelas = cleanUsername === "ketuakelas" || cleanUsername === "ketua_kelas";
    const isAdminUser = cleanUsername === "admin" || cleanUsername === "arham" || cleanUsername.includes("arham");

    let expectedPasswords = ["smkn2konawe"];
    if (isKetuaKelas) {
      expectedPasswords = ["ketuakelas"];
    } else if (isAdminUser) {
      expectedPasswords = ["adminsihadir", "admin", "smkn2konawe"];
    }

    if (!expectedPasswords.includes(password)) {
      setError("Kata sandi salah! Untuk informasi kata sandi hubungi Admin Utama.");
      return;
    }

    if (!cleanUsername) {
      setError("Username tidak boleh kosong.");
      return;
    }

    // Determine role based on username preset or default to "guru" if custom teacher name
    const foundPreset = PRESETS.find(p => p.username.toLowerCase() === cleanUsername);
    
    let mappedRole = "guru"; // default
    if (cleanUsername === "ketuakelas") {
      mappedRole = "ketua_kelas";
    } else if (isAdminUser) {
      mappedRole = "admin";
    } else if (foundPreset) {
      mappedRole = foundPreset.role;
    }

    const displayName = isAdminUser ? "ARHAM AMIRUDDIN, S.Pd.Gr" : username.trim();
    localStorage.setItem("sihadir_active_teacher_name", displayName);
    onLoginSuccess(displayName, mappedRole);
  };

  const handleApplyPreset = (presetUser: string) => {
    setUsername(presetUser);
    const cleanUser = presetUser.trim().toLowerCase();
    if (cleanUser === "ketuakelas") {
      setPassword("ketuakelas");
    } else if (cleanUser === "arham" || cleanUser === "admin") {
      setPassword("adminsihadir");
    } else {
      setPassword("smkn2konawe");
    }
    setError(null);
  };

  // Dynamic theme styling for the interactive login card block
  const activeThemeDef = SIHADIR_THEMES[bgTheme] || SIHADIR_THEMES.gradient;
  const isWhite = activeThemeDef.login.isLight;
  const style = activeThemeDef.login.card;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-all duration-500 ${activeThemeDef.login.bgClass}`}>
      
      {/* Draggable Theme Widget */}
      <DraggableThemeWidget 
        currentTheme={bgTheme} 
        onThemeChange={handleThemeChange} 
        className="top-4 right-4" 
      />

      {/* Decorative Background Elements adjusted based on active theme */}
      {!isWhite && (
        <>
          <div className={`absolute top-[-20%] left-[-15%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-500 ${activeThemeDef.login.decorations.blob1}`} />
          <div className={`absolute bottom-[-25%] right-[-15%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 ${activeThemeDef.login.decorations.blob2}`} />
          <div className={`absolute top-[35%] left-[25%] w-[380px] h-[380px] rounded-full blur-[100px] pointer-events-none transition-all duration-500 ${activeThemeDef.login.decorations.blob3}`} />
        </>
      )}

      {/* Main Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 z-10">
        
        {/* Left Hand: App branding & logo details */}
        <div className={`md:col-span-12 lg:col-span-5 flex flex-col justify-between p-2 transition-colors duration-300 ${
          isWhite ? "text-slate-800" : "text-slate-200"
        }`}>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {/* Request ImgBB link with robust fallback emblem */}
              <div className="relative shrink-0 flex items-center justify-center">
                <img 
                    src="https://i.ibb.co.com/TMkWkNY4/LOGO-SMKN-2-KONAWE-BARU.png" 
                    alt="Logo SMK Negeri 2 Konawe" 
                    className="w-36 h-36 md:w-40 md:h-40 object-cover rounded-full drop-shadow-lg transition-transform duration-200 hover:scale-105"
                    style={{ clipPath: "circle(50% at 50% 50%)" }}
                    onError={(e) => {
                      // Attempt alternative raw URLs or fall back gracefully
                      const target = e.currentTarget;
                      const paths = [
                        "https://i.ibb.co/TMkWkNY4/LOGO-SMKN-2-KONAWE-BARU.png",
                        "https://i.ibb.co.com/TMkWkNY4/LOGO-SMKN-2-KONAWE-BARU.jpg",
                        "https://i.ibb.co.com/TMkWkNY4/LOGO-SMKN-2-KONAWE-BARU.jpg",
                        "https://i.ibb.co.com/TMkWkNY4/SMKN2.png",
                        "https://i.ibb.co.com/TMkWkNY4/SMKN2.png",
                        "https://i.ibb.co/L8N2LpL/SMKN2.png",
                        "https://i.ibb.co/6wZ2K8R/default.png"
                      ];
                      const currentAttempt = target.getAttribute("data-attempt") || "0";
                      const attemptIdx = parseInt(currentAttempt, 10);
                      if (attemptIdx < paths.length) {
                        target.setAttribute("data-attempt", (attemptIdx + 1).toString());
                        target.src = paths[attemptIdx];
                      }
                    }}
                    referrerPolicy="no-referrer"
                  />
              </div>

              <div>
                <span className={`text-[26px] md:text-[30px] font-black block tracking-wider leading-none ${
                  isWhite ? "text-blue-600" : "text-sky-400"
                }`}>SIHADIR</span>
                <span className={`text-xl md:text-2xl font-extrabold tracking-tight block mt-2 leading-tight ${
                  isWhite ? "text-slate-900" : "text-white"
                }`}>SMK NEGERI 2 KONAWE</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className={`leading-relaxed font-medium space-y-2 ${
                isWhite ? "text-slate-600" : "text-slate-300"
              }`}>
                <p id="login-platform-description" className={`font-bold text-[18px] leading-relaxed ${
                  isWhite ? "text-slate-800" : "text-white"
                }`}>
                  Platform Absensi dan Monitoring Kehadiran Terintegrasi untuk Mendukung Ketertiban, Kedisiplinan, Administrasi, dan Perkembangan Murid, Guru, dan Staf Administrasi di SMK Negeri 2 Konawe
                </p>
              </div>
            </div>
          </div>

          <div className={`border-t pt-6 mt-8 md:mt-0 ${
            isWhite ? "border-slate-200" : "border-white/15"
          }`}>
            <div className={`flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase font-mono ${
              isWhite ? "text-slate-600" : "text-sky-100"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px]">Sistem Aktif - Tahun Ajaran 2026/2027</span>
            </div>
            <p className={`text-[12px] font-bold mt-1.5 font-mono ${
              isWhite ? "text-slate-500" : "text-white/70"
            }`}>SMK Negeri 2 Konawe • Sulawesi Tenggara</p>
          </div>
        </div>

        {/* Right Hand: Interactive Login form (Dynamically adjusted/synchronized with the active background theme) */}
        <div className={`md:col-span-12 lg:col-span-7 backdrop-blur-md rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 border ${style.cardBg}`}>
          
          <div>
            <div className="mb-4">
              <h3 className={`text-lg font-bold tracking-tight transition-colors duration-300 ${style.title}`}>Masuk ke Sistem</h3>
              <p className={`text-xs mt-1 transition-colors duration-300 ${style.desc}`}>
                {loginMode === "staf" 
                  ? "Pilih peran utama terdaftar Anda dan masukkan kata sandi." 
                  : loginMode === "ketua_kelas"
                    ? "Pilih kelas dan masukkan nama Ketua Kelas untuk menginput data laporan harian."
                    : "Cari kelas Anda, pilih nama Anda yang telah diisi oleh Admin Utama, dan masuk."}
              </p>
            </div>

            {/* Custom tab selector for Murid vs Ketua Kelas vs Guru & Staf */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-200/50 dark:bg-black/30 border border-slate-300/40 dark:border-white/5 mb-4">
              <button
                type="button"
                onClick={() => {
                  setLoginMode("murid");
                  setError(null);
                  setPassword("");
                }}
                className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                  loginMode === "siswa"
                    ? isWhite
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white/10 dark:bg-white text-slate-900 dark:text-slate-900 shadow-sm font-black"
                    : isWhite
                      ? "text-slate-600 hover:bg-slate-100"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Murid</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode("ketua_kelas");
                  setError(null);
                  setUsername("ketuakelas");
                  setPassword("");
                }}
                className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                  loginMode === "ketua_kelas"
                    ? isWhite
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white/10 dark:bg-white text-slate-900 dark:text-slate-900 shadow-sm font-black"
                    : isWhite
                      ? "text-slate-600 hover:bg-slate-100"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span className="truncate">Ketua Kelas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode("staf");
                  setError(null);
                  setPassword("");
                }}
                className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                  loginMode === "staf"
                    ? isWhite
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white/10 dark:bg-white text-slate-900 dark:text-slate-900 shadow-sm font-black"
                    : isWhite
                      ? "text-slate-600 hover:bg-slate-100"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Guru & Staf</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Error messages */}
              {error && (
                <div className="border text-xs p-3 rounded-xl flex items-center gap-2.5 animate-bounce bg-red-50 border-red-200 text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {loginMode === "staf" ? (
                /* Dynamic Teacher & Staff selection */
                <div className="space-y-3">
                  {/* Select Teacher/Staff Name */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-wider block transition-colors duration-300 ${style.label}`}>
                      Pilih Nama Guru / Staf SMK Negeri 2 Konawe
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10 transition-colors duration-300 ${style.inputIcon}`} />
                      <select
                        required
                        value={selectedTeacherName}
                        onChange={(e) => handleSelectTeacher(e.target.value)}
                        className={`w-full text-xs rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-1 transition-all font-semibold cursor-pointer appearance-none ${style.inputBg}`}
                      >
                        <optgroup label="👑 Pimpinan Sekolah & Wakil Kepala Sekolah">
                          {allTeachers.filter(t => {
                            const r = (t.role || "").toLowerCase();
                            return r.includes("kepala sekolah") || r.includes("waka");
                          }).map((teacher, idx) => {
                            const cleanName = (teacher.name || "").replace(/\s*\([^)]*\)/g, "").trim();
                            return (
                              <option key={`pimp-${teacher.id || cleanName}-${idx}`} value={cleanName}>
                                {cleanName}
                              </option>
                            );
                          })}
                        </optgroup>
                        <optgroup label="💼 Admin & Staf Tata Usaha (TU)">
                          {tuStaff.map((teacher, idx) => {
                            const cleanName = (teacher.name || "").replace(/\s*\([^)]*\)/g, "").trim();
                            return (
                              <option key={`tu-${teacher.id || cleanName}-${idx}`} value={cleanName}>
                                {cleanName}
                              </option>
                            );
                          })}
                        </optgroup>
                        <optgroup label="👨‍🏫 Daftar Guru & Pendidik SMK Negeri 2 Konawe">
                          {otherTeachers.filter(t => {
                            const r = (t.role || "").toLowerCase();
                            return !r.includes("kepala sekolah") && !r.includes("waka");
                          }).map((teacher, idx) => {
                            const cleanName = (teacher.name || "").replace(/\s*\([^)]*\)/g, "").trim();
                            return (
                              <option key={`guru-${teacher.id || cleanName}-${idx}`} value={cleanName}>
                                {cleanName}
                              </option>
                            );
                          })}
                        </optgroup>
                      </select>
                      <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${style.selectArrow}`}>
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Select Role / Position */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-wider block transition-colors duration-300 ${style.label}`}>
                      Posisi / Jabatan Pengguna
                    </label>
                    <div className="relative">
                      <ShieldAlert className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10 transition-colors duration-300 ${style.inputIcon}`} />
                      <select
                        required
                        value={selectedRole}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className={`w-full text-xs rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-1 transition-all font-semibold cursor-pointer appearance-none ${style.inputBg}`}
                      >
                        {STAFF_ROLE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${style.selectArrow}`}>
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ) : loginMode === "ketua_kelas" ? (
                /* Interactive Ketua Kelas Account block */
                <div className="space-y-3">
                  {/* Select Class for Ketua Kelas */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-wider block transition-colors duration-300 ${style.label}`}>Pilih Kelas & Ketua Kelas Anda</label>
                    <div className="relative">
                      <GraduationCap className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10 transition-colors duration-300 ${style.inputIcon}`} />
                      <select
                        required
                        value={ketuaKelasClass}
                        onChange={(e) => {
                          const selectedCls = e.target.value;
                          setKetuaKelasClass(selectedCls);
                          localStorage.setItem("sihadir_ketua_kelas_class", selectedCls);
                          
                          // Auto select matching official captain name
                          const defaultCaptain = CLASS_CAPTAIN_MAP[selectedCls] || "Ketua Kelas";
                          setKetuaKelasName(defaultCaptain);
                          localStorage.setItem("sihadir_ketua_kelas_name", defaultCaptain);
                        }}
                        className={`w-full text-xs rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-1 transition-all font-semibold cursor-pointer appearance-none ${style.inputBg}`}
                      >
                        {KETUA_KELAS_CLASSES.map(cls => (
                          <option key={cls} value={cls}>
                            {cls} — {CLASS_CAPTAIN_MAP[cls] || "Ketua Kelas"}
                          </option>
                        ))}
                      </select>
                      <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${style.selectArrow}`}>
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dynamic Student selection for Students */
                <div className="space-y-3">
                  {/* Select Jurusan (5 Program Keahlian) */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-wider block transition-colors duration-300 ${style.label}`}>Pilih Jurusan</label>
                    <div className="relative">
                      <GraduationCap className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10 transition-colors duration-300 ${style.inputIcon}`} />
                      <select
                        value={selectedMajor}
                        onChange={(e) => {
                          const newMajor = e.target.value;
                          setSelectedMajor(newMajor);
                          const matching = allStudents.filter(s => {
                            if (!newMajor || newMajor === "ALL") return true;
                            const mCode = newMajor.toUpperCase();
                            const sMajor = (s.major || "").toUpperCase();
                            const sClass = (s.className || "").toUpperCase();
                            return sMajor.includes(mCode) || sClass.includes(mCode);
                          });
                          if (matching.length > 0) {
                            setSelectedStudentName(matching[0].name);
                          }
                        }}
                        className={`w-full text-xs rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-1 transition-all font-semibold cursor-pointer appearance-none ${style.inputBg}`}
                      >
                        {MAJORS_LIST.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${style.selectArrow}`}>
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Select Student Name */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black uppercase tracking-wider block transition-colors duration-300 ${style.label}`}>Pilih Nama Anda</label>
                    <div className="relative">
                      <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10 transition-colors duration-300 ${style.inputIcon}`} />
                      <select
                        required
                        value={selectedStudentName}
                        onChange={(e) => setSelectedStudentName(e.target.value)}
                        className={`w-full text-xs rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-1 transition-all font-semibold cursor-pointer appearance-none ${style.inputBg}`}
                      >
                        {filteredStudentsByMajor.length === 0 ? (
                          <option value="">Belum ada murid terdaftar pada jurusan ini</option>
                        ) : (
                          filteredStudentsByMajor.map(student => (
                            <option key={student.id || student.name} value={student.name}>
                              {student.name} {student.nisn ? `(NISN: ${student.nisn})` : student.nis ? `(NIS: ${student.nis})` : ""}
                            </option>
                          ))
                        )}
                      </select>
                      <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${style.selectArrow}`}>
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Password Input */}
              {(() => {
                const activeStudentObj = allStudents.find(s => s.name === selectedStudentName);
                const currentNisn = (activeStudentObj?.nisn || activeStudentObj?.nis || "").trim();

                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`text-[10px] font-black uppercase tracking-wider block transition-colors duration-300 ${style.label}`}>
                        Kata Sandi / Password {loginMode === "siswa" && "(Gunakan NISN)"}
                      </label>
                      {loginMode === "siswa" && currentNisn && (
                        <button
                          type="button"
                          onClick={() => setPassword(currentNisn)}
                          className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <KeyRound className="h-3 w-3" />
                          <span>Isi NISN Otomatis</span>
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${style.inputIcon}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={loginMode === "siswa" ? "Masukkan Nomor NISN Anda (Kata Sandi)..." : "Masukkan kata sandi..."}
                        className={`w-full text-xs rounded-xl pl-10 pr-10 py-3 placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all font-mono ${style.inputBg}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors duration-300 cursor-pointer ${style.inputIcon} hover:text-slate-700 dark:hover:text-white`}
                        title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })()}

              <button
                type="submit"
                className={`w-full active:scale-[0.99] text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer ${style.submitBtn}`}
              >
                <span>Masuk Portal SIHADIR</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </form>

          </div>

          <div className={`mt-6 pt-4 border-t flex justify-between items-center text-[12px] transition-colors duration-300 ${style.footerText}`}>
            <span className="font-medium text-[12px]">Butuh Bantuan? Hubungi Admin Utama</span>
            <span className={`font-mono px-2 py-0.5 rounded border transition-all duration-300 ${style.footerBadge}`}>v1.2-Stable</span>
          </div>

        </div>

      </div>

    </div>
  );
}
