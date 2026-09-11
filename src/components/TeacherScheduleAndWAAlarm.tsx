import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, Clock, BookOpen, Users, AlertTriangle, CheckCircle2, 
  Send, Copy, RefreshCw, Bell, ShieldAlert, Sparkles, Filter, Check, ExternalLink, FileText
} from "lucide-react";
import { 
  getStoredSchedules, 
  getTeacherMatchedSchedules, 
  groupSchedulesByDay, 
  calculateTeacherScheduleStats,
  getTodayTeachersScheduleStatus,
  buildWAAlarmBroadcastMessage,
  MatchedScheduleItem,
  getIndonesianDayName
} from "../utils/scheduleHelper";
import {
  LESSON_PERIODS,
  LessonPeriod,
  getCurrentOrUpcomingPeriod,
  buildTeacherPeriodReport,
  dispatchTeacherPeriodReport,
  getTeacherGroupTarget,
  getLessonPeriods,
  getDayScheduleConfig
} from "../services/whatsappFonnteService";
import { Comprehensive15WitaReportModal } from "./Comprehensive15WitaReportModal";
import { TeacherSubjectGradebookModal } from "./TeacherSubjectGradebookModal";

interface TeacherScheduleAndWAAlarmProps {
  teacherName: string; // Profile name or username
  subject?: string;
  currentRole?: string;
  username?: string;
  additionalDuty?: string[];
  onNavigateToTab?: (tab: string) => void;
}

export function TeacherScheduleAndWAAlarm({ 
  teacherName, 
  subject, 
  currentRole,
  username,
  additionalDuty,
  onNavigateToTab 
}: TeacherScheduleAndWAAlarmProps) {
  const [selectedDayTab, setSelectedDayTab] = useState<string>("Semua");
  const [copied, setCopied] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // Check authorization for WA Group Alarm & Pelaporan Keterlambatan
  // Only accessible to: Admin Utama, Admin TU, Kepsek, Waka Kesiswaan, Waka Kurikulum
  const isAuthorizedForWaAlarm = React.useMemo(() => {
    const role = (currentRole || "").trim().toLowerCase();
    const uname = (username || "").trim().toLowerCase();
    const duties = (additionalDuty || []).map(d => d.trim().toLowerCase());

    // 1. Admin Utama
    if (role === "admin" || uname === "admin" || uname.includes("arham")) return true;

    // 2. Admin Tata Usaha (TU)
    if (role === "tu" || uname === "tu" || duties.some(d => d.includes("tu") || d.includes("tata usaha"))) return true;

    // 3. Kepala Sekolah (Kepsek) - Removed WA Group alarm broadcast as requested by user
    if (role === "kepsek" || uname === "kepsek" || duties.some(d => d.includes("kepsek") || d.includes("kepala sekolah"))) return false;

    // 4. Waka Kesiswaan
    if (role === "kesiswaan" || uname === "kesiswaan" || duties.some(d => d.includes("kesiswaan"))) return true;

    // 5. Waka Kurikulum
    if (role === "kurikulum" || uname === "kurikulum" || duties.some(d => d.includes("kurikulum"))) return true;

    return false;
  }, [currentRole, username, additionalDuty]);

  // Load schedules matching current teacher
  const [allSchedules, setAllSchedules] = useState(() => getStoredSchedules());
  const matchedSchedules = getTeacherMatchedSchedules(teacherName, allSchedules);
  const stats = calculateTeacherScheduleStats(matchedSchedules);
  const groupedByDay = groupSchedulesByDay(matchedSchedules);

  // Today's WA Alarm Status
  const [todayStatus, setTodayStatus] = useState(() => getTodayTeachersScheduleStatus());
  const [waReport, setWaReport] = useState(() => buildWAAlarmBroadcastMessage());

  const todayDayName = getIndonesianDayName();
  const activeLessonPeriods = React.useMemo(() => getLessonPeriods(todayDayName), [todayDayName]);

  // Period report state
  const { currentPeriod: initialActivePeriod } = getCurrentOrUpcomingPeriod();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    initialActivePeriod?.id || (activeLessonPeriods[0]?.id || "jam-1")
  );
  const [isSendingPeriodWa, setIsSendingPeriodWa] = useState<boolean>(false);
  const [periodSendFeedback, setPeriodSendFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedPeriodText, setCopiedPeriodText] = useState<boolean>(false);
  const [is15ReportModalOpen, setIs15ReportModalOpen] = useState<boolean>(false);
  const [selectedGradebookSchedule, setSelectedGradebookSchedule] = useState<MatchedScheduleItem | null>(null);

  const activePeriodReport = React.useMemo(() => {
    return buildTeacherPeriodReport(selectedPeriodId);
  }, [selectedPeriodId, allSchedules, todayStatus]);

  const handleSendPeriodFonnte = async () => {
    setIsSendingPeriodWa(true);
    setPeriodSendFeedback(null);
    try {
      const res = await dispatchTeacherPeriodReport(selectedPeriodId, true);
      if (res.success) {
        setPeriodSendFeedback({ type: "success", text: `🚀 Sukses! Laporan ${res.periodLabel} terkirim otomatis ke Grup WhatsApp Guru via Fonnte Gateway.` });
      } else {
        setPeriodSendFeedback({ type: "error", text: `⚠️ Fonnte Gateway: ${res.message}` });
      }
    } catch (e: any) {
      setPeriodSendFeedback({ type: "error", text: `Terjadi kendala: ${e.message || "Gagal menghubungi server"}` });
    } finally {
      setIsSendingPeriodWa(false);
      setTimeout(() => setPeriodSendFeedback(null), 7000);
    }
  };

  const handleCopyPeriodText = () => {
    navigator.clipboard.writeText(activePeriodReport.messageText);
    setCopiedPeriodText(true);
    setTimeout(() => setCopiedPeriodText(false), 3500);
  };

  // Refresh data function
  const handleRefreshData = () => {
    const updatedSchedules = getStoredSchedules();
    setAllSchedules(updatedSchedules);
    setTodayStatus(getTodayTeachersScheduleStatus());
    setWaReport(buildWAAlarmBroadcastMessage());
    setLastRefreshed(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  };

  useEffect(() => {
    handleRefreshData();
    // Listen for schedule updates from Master Data Manager
    const handleStorageUpdate = () => handleRefreshData();
    window.addEventListener("sihadir_data_updated", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("sihadir_data_updated", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [teacherName]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(waReport.messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3500);
  };

  // Filtered schedule items for current day tab
  const displaySchedules: MatchedScheduleItem[] = selectedDayTab === "Semua" 
    ? matchedSchedules 
    : (groupedByDay[selectedDayTab] || []);

  return (
    <div className="space-y-6" id="teacher-schedule-wa-alarm-container">
      {/* 1. PERSONAL TEACHING SCHEDULE (JADWAL MENGAJAR TERKONEKSI DATA MASTER) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/70 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Header */}
        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md border border-indigo-200">
                  Data Master Terkoneksi
                </span>
                <span className="text-slate-300 text-xs">|</span>
                <span className="text-xs font-bold text-slate-500">
                  SMK Negeri 2 Konawe (T.A 2026/2027)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5 tracking-tight flex items-center gap-2 flex-wrap">
                <span>Jadwal Mengajar Anda</span>
                {stats.teacherCodeStr && (
                  <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md border border-indigo-200 font-mono">
                    Kode Guru: [{stats.teacherCodeStr}]
                  </span>
                )}
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {matchedSchedules.length} Sesi Terdaftar
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Jadwal resmi mata pelajaran, kelas yang diajar, hari, dan alokasi jam mengajar terhubung otomatis dari Data Master Sekolah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={handleRefreshData}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer border border-slate-200"
            >
              <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
              <span>Sinkronkan Jadwal</span>
            </button>
          </div>
        </div>

        {/* Schedule KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-3.5 rounded-2xl border border-indigo-100">
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">Total Jam Pelajaran</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-indigo-950">{stats.totalJam}</span>
              <span className="text-xs font-bold text-indigo-700">JP / Minggu</span>
            </div>
            <span className="text-[9px] text-indigo-600 font-semibold block mt-0.5">
              Kode: {stats.teacherCodeStr ? `[${stats.teacherCodeStr}]` : "-"}
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3.5 rounded-2xl border border-emerald-100">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">Total Kelas Diajar</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-950">{stats.classesCount}</span>
              <span className="text-xs font-bold text-emerald-800">Rombel</span>
            </div>
            <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5 truncate" title={stats.classesList}>
              {stats.classesList || "Belum ada kelas"}
            </span>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Mata Pelajaran Utama</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-950">{stats.subjectsCount}</span>
              <span className="text-xs font-bold text-amber-800">Mapel</span>
            </div>
            <span className="text-[9px] text-amber-700 font-semibold block mt-0.5 truncate" title={stats.subjectsList}>
              {stats.subjectsList || subject || "Mapel Keahlian"}
            </span>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3.5 rounded-2xl border border-blue-100">
            <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider block">Hari Mengajar Anda</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-950">
                {Object.keys(groupedByDay).filter(d => groupedByDay[d].length > 0).length}
              </span>
              <span className="text-xs font-bold text-blue-800">Hari / Mgg</span>
            </div>
            <span className="text-[9px] text-blue-700 font-semibold block mt-0.5">
              Hari Ini: {todayDayName} ({groupedByDay[todayDayName]?.reduce((sum, item) => sum + (item.durationHours || 2), 0) || 0} JP)
            </span>
          </div>
        </div>

        {/* Official Bell Schedule Timetable Reference (Resmi SMK Negeri 2 Konawe) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
              <Clock className="h-4 w-4 text-indigo-600" />
              Pedoman Jam Masuk, Jam Istirahat & Jam Pulang KBM Resmi:
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
              Aktif Hari Ini: {todayDayName} ({getDayScheduleConfig(todayDayName).jamMasuk} - {getDayScheduleConfig(todayDayName).jamPulang} WITA)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className={`p-2.5 rounded-xl border ${todayDayName.toLowerCase() === "senin" ? "bg-indigo-50/80 border-indigo-300 font-bold" : "bg-white border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <span className="font-black text-indigo-950">Senin (9 JP @ 40 mnt)</span>
                {todayDayName.toLowerCase() === "senin" && <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-black">HARI INI</span>}
              </div>
              <p className="text-slate-600 mt-1">
                ⏰ Masuk: <strong>07:15</strong> (Upacara) | ☕ Istirahat: <strong>09:55 - 10:10</strong> | 🏁 Pulang: <strong>13:30</strong> WITA
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border ${["selasa", "rabu", "kamis", "sabtu"].includes(todayDayName.toLowerCase()) ? "bg-indigo-50/80 border-indigo-300 font-bold" : "bg-white border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <span className="font-black text-indigo-950">Selasa - Kamis & Sabtu (8 JP @ 45 mnt)</span>
                {["selasa", "rabu", "kamis", "sabtu"].includes(todayDayName.toLowerCase()) && <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-black">HARI INI</span>}
              </div>
              <p className="text-slate-600 mt-1">
                ⏰ Masuk: <strong>07:15</strong> | ☕ Istirahat: <strong>10:15 - 10:30</strong> | 🏁 Pulang: <strong>13:30</strong> WITA
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border ${todayDayName.toLowerCase() === "jumat" ? "bg-emerald-50 border-emerald-300 font-bold" : "bg-white border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <span className="font-black text-emerald-950">Jumat (6 JP @ 40 mnt)</span>
                {todayDayName.toLowerCase() === "jumat" && <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black">HARI INI</span>}
              </div>
              <p className="text-slate-600 mt-1">
                ⏰ Masuk: <strong>07:20</strong> | ☕ Istirahat: <strong>10:00 - 10:10</strong> | 🏁 Pulang: <strong>11:30</strong> WITA
              </p>
            </div>
          </div>
        </div>

        {/* Day Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-2 shrink-0 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-indigo-500" /> Filter Hari:
          </span>
          {["Semua", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day) => {
            const countForDay = day === "Semua" ? matchedSchedules.length : (groupedByDay[day]?.length || 0);
            const isToday = day.toLowerCase() === todayDayName.toLowerCase();
            const isActive = selectedDayTab === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDayTab(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : isToday
                    ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <span>{day}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? "bg-indigo-700 text-indigo-100" : "bg-slate-200 text-slate-700"
                }`}>
                  {countForDay}
                </span>
                {isToday && <span className="text-[9px] bg-amber-500 text-white px-1 rounded uppercase font-black">Hari Ini</span>}
              </button>
            );
          })}
        </div>

        {/* Schedule List Cards Grid */}
        {displaySchedules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displaySchedules.map((item, idx) => {
              const isTodaySchedule = item.day.trim().toLowerCase() === todayDayName.toLowerCase();

              return (
                <div 
                  key={item.id || idx}
                  onClick={() => setSelectedGradebookSchedule(item)}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 cursor-pointer group hover:border-indigo-400 hover:shadow-lg hover:scale-[1.01] ${
                    isTodaySchedule
                      ? "bg-gradient-to-br from-indigo-50/60 to-white border-indigo-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                  title="Klik untuk membuka daftar siswa & buku penilaian jam efektif kelas ini"
                >
                  {isTodaySchedule && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl shadow-2xs">
                      Mengajar Hari Ini
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {item.day}
                      </span>
                      <span className="text-xs font-black text-indigo-900 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                        {item.period}
                      </span>
                      {(item.teacherCode || item.teacherId) && (
                        <span className="text-[9.5px] font-mono font-black text-indigo-800 bg-indigo-100 border border-indigo-200 px-1.5 py-0.2 rounded">
                          [{item.teacherCode || item.teacherId.toUpperCase()}]
                        </span>
                      )}
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                        Buku Nilai Siswa
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                      {item.subject}
                    </h4>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-emerald-500" />
                        Kelas: <strong className="text-slate-900 font-extrabold">{item.className}</strong>
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {item.durationHours || 2} JP Efektif
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium truncate max-w-[170px]" title={item.teacherName}>
                        Guru: <strong>{item.teacherName}</strong>
                      </span>
                      {isTodaySchedule ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Terkoneksi
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold shrink-0">Terschedule</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGradebookSchedule(item);
                      }}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 border border-indigo-400/30"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-indigo-200" />
                      <span>Buka Penilaian & Buku Nilai Siswa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Calendar className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Tidak ada jadwal mengajar pada pilihan filter hari ini.</p>
            <p className="text-[11px] text-slate-400">Pilih tab "Semua" untuk melihat keseluruhan jadwal Anda.</p>
          </div>
        )}
      </div>

      {/* 2. WA GROUP ALARM & AUTOMATED REPORT NOTIFICATION (ALARM KEHADIRAN KBM KE GRUP WA) */}
      {isAuthorizedForWaAlarm && (
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
        <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl shadow-sm shrink-0 font-black">
              <Bell className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-400/20 text-emerald-300 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md border border-emerald-400/30">
                  Alarm & Notifikasi WA Guru
                </span>
                <span className="text-slate-500 text-xs">|</span>
                <span className="text-xs font-bold text-emerald-200">
                  Pemantauan KBM Hari Ini ({todayDayName})
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5 tracking-tight flex items-center gap-2">
                <span>Pelaporan Keterlambatan & Presensi Guru Ke Grup WA</span>
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Sistem otomatis mendeteksi guru yang memiliki jam mengajar hari ini namun belum absen atau terlambat masuk kelas, lalu menyiapkan format pesan alarm untuk Grup WA Guru.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={handleRefreshData}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer border border-white/15"
            >
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
              <span>Cek Status Terbaru</span>
            </button>
          </div>
        </div>

        {/* Alarm Monitor Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Terjadwal Hari Ini ({todayDayName})</span>
              <span className="text-2xl font-black text-white mt-1 block">{todayStatus.scheduledToday.length} Jam</span>
            </div>
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Sudah Absen & Masuk Kelas</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{todayStatus.hadirCount} Guru</span>
            </div>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-rose-500/20 border border-rose-500/40 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">Belum Absen / Terlambat</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">
                {todayStatus.scheduledToday.length - todayStatus.hadirCount} Guru
              </span>
            </div>
            <div className="p-2.5 bg-rose-500/30 text-rose-300 rounded-xl">
              <AlertTriangle className="h-5 w-5 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Live List of Scheduled Teachers for Today */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-400" />
            Status Kehadiran Mengajar Guru Hari Ini ({todayDayName}):
          </h4>

          {todayStatus.scheduledToday.length > 0 ? (
            <div className="max-h-52 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/20">
              {todayStatus.scheduledToday.map((item, idx) => {
                const isHadir = item.status === "HADIR";
                const isLate = item.status === "TERLAMBAT";

                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs transition-colors ${
                      isHadir 
                        ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-100" 
                        : isLate
                        ? "bg-rose-950/50 border-rose-500/50 text-rose-100"
                        : "bg-amber-950/40 border-amber-500/40 text-amber-100"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="font-extrabold text-sm">{item.teacherName}</strong>
                        <span className="text-[10px] px-2 py-0.2 rounded font-black bg-white/10 uppercase">
                          {item.className}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-80">
                        {item.subject} | <span className="font-bold">{item.period}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {isHadir ? (
                        <span className="bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg font-black text-[10px] uppercase flex items-center gap-1">
                          <Check className="h-3 w-3" /> Sudah Absen / Mengajar
                        </span>
                      ) : isLate ? (
                        <span className="bg-rose-600 text-white px-2.5 py-1 rounded-lg font-black text-[10px] uppercase flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="h-3 w-3" /> Terlambat Masuk Kelas
                        </span>
                      ) : (
                        <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg font-black text-[10px] uppercase flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Belum Absen KBM
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-slate-400">
              Tidak ada jam pelajaran KBM terjadwal untuk hari {todayDayName}.
            </div>
          )}
        </div>

        {/* WA Broadcast Message Action Box */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
              <Send className="h-4 w-4" />
              Format Teks Laporan Alarm Ke Grup WA Guru:
            </label>
            {copied && (
              <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                <Check className="h-3 w-3" /> Teks Berhasil Disalin!
              </span>
            )}
          </div>

          <textarea
            readOnly
            rows={6}
            value={waReport.messageText}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none scrollbar-thin"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-white/15"
            >
              <Copy className="h-4 w-4 text-emerald-400" />
              <span>{copied ? "Berhasil Disalin" : "Salin Pesan WA"}</span>
            </button>

            <a
              href={waReport.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-102 cursor-pointer"
            >
              <Send className="h-4 w-4 fill-current" />
              <span>Kirim Alarm Peringatan Ke Grup WA Guru</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* 2.5. MODUL KHUSUS: LAPORAN ABSENSI GURU SETIAP PERGANTIAN JAM MENGAJAR (FONNTE GATEWAY) */}
        <div className="bg-gradient-to-br from-indigo-950/90 to-slate-950/95 p-5 rounded-2xl border border-indigo-500/30 space-y-4 text-slate-100 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-indigo-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-sm">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  Laporan Khusus Guru Setiap Pergantian Jam Pelajaran
                  <span className="bg-indigo-500/30 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/40">
                    Fonnte WA Gateway
                  </span>
                </h4>
                <p className="text-[11px] text-indigo-200/80">
                  Laporan otomatis disiarkan ke Grup WhatsApp Guru di setiap pergantian bel jam mengajar KBM.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Auto-Broadcast Aktif
              </span>
            </div>
          </div>

          {/* Period selector pill buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Pilih Sesi Jam Pelajaran KBM:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeLessonPeriods.filter(p => !p.isBreak).map(period => {
                const isSelected = selectedPeriodId === period.id;
                const isCurrentActive = initialActivePeriod?.id === period.id;

                return (
                  <button
                    key={period.id}
                    type="button"
                    onClick={() => setSelectedPeriodId(period.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-md scale-105"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                    }`}
                  >
                    <span>{period.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">({period.startTime})</span>
                    {isCurrentActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Jam Sedang Aktif" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected period details & teacher roster */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">
                  {activePeriodReport.period.label} ({activePeriodReport.timeRange})
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                  {activePeriodReport.scheduledTeachers.length} Guru Terjadwal
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-emerald-400 font-bold">
                  ✓ {activePeriodReport.hadirCount} Hadir / Di Kelas
                </span>
                <span className="text-rose-400 font-bold">
                  ✗ {activePeriodReport.belumHadirCount} Belum Absen KBM
                </span>
              </div>
            </div>

            {/* List of teachers for this period */}
            {activePeriodReport.scheduledTeachers.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {activePeriodReport.scheduledTeachers.map((t, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between border ${
                      t.isHadir
                        ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-200"
                        : "bg-rose-950/30 border-rose-500/30 text-rose-200"
                    }`}
                  >
                    <div>
                      <strong className="font-bold text-white">{t.teacherName}</strong>
                      <span className="text-[11px] opacity-80 block sm:inline sm:ml-2">
                        {t.className} - {t.subject} ({t.periodStr})
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                      t.isHadir ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/30 text-rose-300 animate-pulse"
                    }`}>
                      {t.isHadir ? (t.hasJournal ? "Jurnal Terisi" : "Hadir") : "Belum Masuk"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-1">
                Tidak ada guru yang terjadwal mengajar pada {activePeriodReport.period.label} hari {activePeriodReport.day}.
              </p>
            )}
          </div>

          {/* WhatsApp Text Preview & Direct Fonnte Send Button */}
          <div className="space-y-2">
            <textarea
              readOnly
              rows={4}
              value={activePeriodReport.messageText}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 font-mono focus:outline-none scrollbar-thin"
            />

            {periodSendFeedback && (
              <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                periodSendFeedback.type === "success" 
                  ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-200" 
                  : "bg-rose-950/80 border border-rose-500/40 text-rose-200"
              }`}>
                {periodSendFeedback.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />}
                <span>{periodSendFeedback.text}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyPeriodText}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-white/15"
              >
                <Copy className="h-3.5 w-3.5 text-indigo-300" />
                <span>{copiedPeriodText ? "Tersalin!" : `Salin Teks ${activePeriodReport.period.label}`}</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(activePeriodReport.messageText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/15 transition-all"
                  title="Kirim manual via WhatsApp Web"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Kirim Manual WA</span>
                </a>

                <button
                  type="button"
                  onClick={handleSendPeriodFonnte}
                  disabled={isSendingPeriodWa}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5 fill-current" />
                  <span>
                    {isSendingPeriodWa 
                      ? "Menghubungkan ke Fonnte..." 
                      : `Siarkan Laporan ${activePeriodReport.period.label} via Fonnte 🚀`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 15:00 WITA Comprehensive Daily Report Card (Siswa, Guru, Staf TU) */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 p-5 rounded-3xl border border-emerald-500/40 text-white space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30 tracking-wider">
                  Rekapitulasi 15.00 WITA
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/20">
                  Transparansi Presensi — Menghindari Dusta di Antara Kita
                </span>
              </div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                <span>Siaran Rekapitulasi Presensi Terpadu Pukul 15.00 WITA</span>
              </h3>
              <p className="text-xs text-emerald-200/90 leading-relaxed max-w-3xl">
                Otomatis mengompilasi rekapitulasi presensi siswa 18 kelas (hadir, sakit, izin, alfa dengan nama), 36 Dewan Guru (jam masuk, pulang, jurnal), dan 4 Tenaga Kependidikan / Tata Usaha tepat pukul 15.00 WITA ke Saluran / Grup WhatsApp Sekolah.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIs15ReportModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              <Clock className="h-4 w-4" />
              <span>Buka Rekap 15.00 WITA</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Modal Rekapitulasi Presensi Terpadu 15.00 WITA */}
      <Comprehensive15WitaReportModal
        isOpen={is15ReportModalOpen}
        onClose={() => setIs15ReportModalOpen(false)}
      />

      {/* Modal Buku Penilaian Mandiri Guru Mapel (Jam Efektif, Mingguan, Bulanan, Semester & Cetak PDF) */}
      <TeacherSubjectGradebookModal
        isOpen={Boolean(selectedGradebookSchedule)}
        onClose={() => setSelectedGradebookSchedule(null)}
        schedule={selectedGradebookSchedule}
        teacherName={teacherName}
      />
    </div>
  );
}
