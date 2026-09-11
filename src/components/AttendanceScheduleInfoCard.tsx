import React, { useState, useEffect } from "react";
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  LogIn, 
  LogOut, 
  Info, 
  AlertTriangle,
  BellRing
} from "lucide-react";

export interface AttendanceScheduleInfoCardProps {
  role?: "murid" | "guru" | "staf" | "semua";
  variant?: "full" | "compact" | "banner";
  highlightMode?: "all" | "masuk" | "pulang";
  className?: string;
  id?: string;
}

export const AttendanceScheduleInfoCard: React.FC<AttendanceScheduleInfoCardProps> = ({
  role = "semua",
  variant = "full",
  highlightMode = "all",
  className = "",
  id = "attendance-schedule-info-card"
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayNumber = currentTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  const isFriday = dayNumber === 5;
  const isMonday = dayNumber === 1;
  const isSunday = dayNumber === 0;

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const currentTotalMins = hours * 60 + minutes;

  // Schedule Rules for SMK Negeri 2 Konawe (WITA)
  // Check-In Rules
  const checkInOpenTime = "06:30";
  const checkInOpenMins = 6 * 60 + 30; // 06:30
  const onTimeLimit = isFriday ? "07:20" : "07:15";
  const onTimeLimitMins = isFriday ? 7 * 60 + 20 : 7 * 60 + 15;
  const lateToleranceLimit = "07:30";
  const lateToleranceMins = 7 * 60 + 30;

  // Cut-off Absen Masuk (Batas Akhir Masuk)
  const isTeacherOrStaff = role === "guru" || role === "staf";
  const checkInCutOffTime = isTeacherOrStaff ? "11:30" : "09:30";
  const checkInCutOffMins = isTeacherOrStaff ? 11 * 60 + 30 : 9 * 60 + 30;

  // Check-Out Rules
  const checkOutOpenTime = isFriday 
    ? (isTeacherOrStaff ? "11:30" : "11:00") 
    : (isTeacherOrStaff ? "14:00" : "13:15");
  const checkOutOpenMins = isFriday 
    ? (isTeacherOrStaff ? 11 * 60 + 30 : 11 * 60) 
    : (isTeacherOrStaff ? 14 * 60 : 13 * 60 + 15);
  const bellDismissalTime = isFriday ? "11:30" : "13:30";
  const checkOutCutOffTime = "14:30";
  const checkOutCutOffMins = 14 * 60 + 30; // 14:30 WITA

  // Calculate Active Status State
  let activeStatus: {
    label: string;
    description: string;
    badgeBg: string;
    badgeText: string;
    borderCol: string;
    type: "masuk-tepat" | "masuk-toleransi" | "masuk-terlambat" | "kbm" | "pulang-aktif" | "tutup" | "belum-buka";
  };

  if (isSunday) {
    activeStatus = {
      label: "Hari Libur Sekolah (Minggu)",
      description: "Tidak ada jadwal presensi wajib pada hari ini.",
      badgeBg: "bg-slate-150",
      badgeText: "text-slate-700",
      borderCol: "border-slate-300",
      type: "tutup"
    };
  } else if (currentTotalMins < checkInOpenMins) {
    activeStatus = {
      label: "Sesi Absen Masuk Belum Dibuka",
      description: `Pintu presensi masuk baru akan dibuka pukul ${checkInOpenTime} WITA.`,
      badgeBg: "bg-slate-100",
      badgeText: "text-slate-600",
      borderCol: "border-slate-300",
      type: "belum-buka"
    };
  } else if (currentTotalMins <= onTimeLimitMins) {
    activeStatus = {
      label: "Sesi Absen Masuk: Tepat Waktu (Disiplin)",
      description: `Silakan absen masuk sekarang. Batas tepat waktu pukul ${onTimeLimit} WITA.`,
      badgeBg: "bg-emerald-100",
      badgeText: "text-emerald-800",
      borderCol: "border-emerald-400",
      type: "masuk-tepat"
    };
  } else if (currentTotalMins <= lateToleranceMins) {
    activeStatus = {
      label: "Sesi Absen Masuk: Masa Toleransi Keterlambatan",
      description: `Anda tercatat hadir dengan keterangan terlambat. Batas toleransi pukul ${lateToleranceLimit} WITA.`,
      badgeBg: "bg-amber-100",
      badgeText: "text-amber-900",
      borderCol: "border-amber-400",
      type: "masuk-toleransi"
    };
  } else if (currentTotalMins <= checkInCutOffMins) {
    activeStatus = {
      label: "Sesi Absen Masuk Terlambat — Segera Absen!",
      description: `Batas akhir absen masuk adalah pukul ${checkInCutOffTime} WITA. Setelahnya sistem otomatis mengunci.`,
      badgeBg: "bg-rose-100",
      badgeText: "text-rose-900",
      borderCol: "border-rose-400",
      type: "masuk-terlambat"
    };
  } else if (currentTotalMins < checkOutOpenMins) {
    activeStatus = {
      label: "Jam Pembelajaran / KBM Berlangsung",
      description: `Absen masuk telah ditutup (${checkInCutOffTime} WITA). Absen pulang dibuka mulai ${checkOutOpenTime} WITA.`,
      badgeBg: "bg-sky-100",
      badgeText: "text-sky-900",
      borderCol: "border-sky-300",
      type: "kbm"
    };
  } else if (currentTotalMins <= checkOutCutOffMins) {
    activeStatus = {
      label: "Sesi Absen Pulang / Keluar Terbuka",
      description: `Silakan lakukan absen pulang sebelum meninggalkan sekolah. Batas akhir pukul ${checkOutCutOffTime} WITA.`,
      badgeBg: "bg-indigo-100",
      badgeText: "text-indigo-900",
      borderCol: "border-indigo-400",
      type: "pulang-aktif"
    };
  } else {
    activeStatus = {
      label: "Sesi Presensi Harian Ditutup",
      description: `Batas akhir presensi hari ini (${checkOutCutOffTime} WITA) telah terlewati.`,
      badgeBg: "bg-slate-100",
      badgeText: "text-slate-600",
      borderCol: "border-slate-300",
      type: "tutup"
    };
  }

  const timeString = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const currentDayName = dayNames[dayNumber];

  // Render Compact Mode (e.g. for inside QR Scanner or sticky sidebars)
  if (variant === "compact") {
    return (
      <div id={id} className={`bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 ${className}`}>
        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200">
          <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Aturan Waktu Presensi ({currentDayName})</span>
          </div>
          <span className="font-mono font-black text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            {timeString} WITA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {/* Absen Masuk */}
          <div className={`p-2.5 rounded-xl border ${
            highlightMode === "masuk" || highlightMode === "all"
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
              : "bg-white border-slate-200 text-slate-700"
          }`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="flex items-center gap-1 text-emerald-800">
                <LogIn className="w-3.5 h-3.5" /> Absen Masuk
              </span>
              <span className="text-[10px] font-mono font-black bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                Buka: {checkInOpenTime}
              </span>
            </div>
            <p className="text-[10px] leading-tight text-slate-600">
              Tepat Waktu: <strong className="text-emerald-700 font-bold">&lt; {onTimeLimit} WITA</strong>
            </p>
            <p className="text-[10px] leading-tight text-rose-700 font-bold mt-0.5">
              ⚠️ Batas Akhir: Pukul {checkInCutOffTime} WITA
            </p>
          </div>

          {/* Absen Pulang */}
          <div className={`p-2.5 rounded-xl border ${
            highlightMode === "pulang" || highlightMode === "all"
              ? "bg-indigo-50/80 border-indigo-200 text-indigo-950"
              : "bg-white border-slate-200 text-slate-700"
          }`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="flex items-center gap-1 text-indigo-800">
                <LogOut className="w-3.5 h-3.5" /> Absen Pulang
              </span>
              <span className="text-[10px] font-mono font-black bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded">
                Buka: {checkOutOpenTime}
              </span>
            </div>
            <p className="text-[10px] leading-tight text-slate-600">
              Bel Pulang: <strong className="text-indigo-700 font-bold">{bellDismissalTime} WITA</strong>
            </p>
            <p className="text-[10px] leading-tight text-rose-700 font-bold mt-0.5">
              🔒 Batas Akhir: Pukul {checkOutCutOffTime} WITA
            </p>
          </div>
        </div>

        {/* Live Status Chip */}
        <div className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 ${activeStatus.badgeBg} ${activeStatus.badgeText} ${activeStatus.borderCol}`}>
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
            <span className="truncate">{activeStatus.label}</span>
          </div>
          <span className="shrink-0 text-[9px] uppercase font-mono opacity-80">SMKN 2 Konawe</span>
        </div>
      </div>
    );
  }

  // Render Banner Mode (e.g. for top of portal)
  if (variant === "banner") {
    return (
      <div id={id} className={`bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 border border-indigo-500/30 shadow-md ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-white">Informasi & Batas Waktu Presensi Harian</h4>
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  {currentDayName}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Batas Absen Masuk: <strong className="text-emerald-400">{checkInCutOffTime} WITA</strong> | Batas Absen Pulang: <strong className="text-sky-300">{checkOutCutOffTime} WITA</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-xs font-bold text-amber-300">
              ⏱️ {timeString} WITA
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Full Mode (Default)
  return (
    <div id={id} className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 ${className}`}>
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-sm sm:text-base text-slate-800">
                Jadwal & Batas Waktu Presensi (Absen Masuk & Pulang)
              </h3>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                {currentDayName}, SMK Negeri 2 Konawe
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standar operasional absensi digital real-time untuk murid, guru, dan staf administrasi.
            </p>
          </div>
        </div>

        {/* Live Digital Clock Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900 text-white px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold shadow-xs">
          <Clock className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
          <span>{timeString} WITA</span>
        </div>
      </div>

      {/* Real-time Status Alert Banner */}
      <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-all ${activeStatus.badgeBg} ${activeStatus.badgeText} ${activeStatus.borderCol}`}>
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="mt-0.5 sm:mt-0 p-1 bg-white/70 rounded-full shrink-0">
            {activeStatus.type === "masuk-tepat" || activeStatus.type === "pulang-aktif" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : activeStatus.type === "masuk-terlambat" ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <Info className="w-4 h-4 text-indigo-600" />
            )}
          </div>
          <div>
            <span className="font-black text-xs block leading-tight">{activeStatus.label}</span>
            <span className="text-[11px] opacity-90 block mt-0.5">{activeStatus.description}</span>
          </div>
        </div>

        <div className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 bg-white/80 rounded-md shrink-0 border border-current/20">
          Sesi Saat Ini
        </div>
      </div>

      {/* Two Column Grid: Rules for Absen Masuk & Absen Pulang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: ABSEN MASUK */}
        <div className={`p-4 rounded-2xl border transition-all ${
          highlightMode === "masuk" 
            ? "border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20" 
            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <LogIn className="w-4 h-4" />
              </div>
              <span className="font-black text-xs uppercase tracking-wide text-emerald-950">
                1. Ketentuan Absen Masuk
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Pagi Hari
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-700 py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">Jam Dibuka (Pintu Masuk):</span>
              <span className="font-mono font-extrabold text-slate-900">{checkInOpenTime} WITA</span>
            </div>

            <div className="flex items-center justify-between text-slate-700 py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">
                Batas Tepat Waktu {isMonday ? "(Upacara)" : isFriday ? "(Jumat)" : ""}:
              </span>
              <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Sebelum {onTimeLimit} WITA
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-700 py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">Toleransi Keterlambatan:</span>
              <span className="font-mono font-bold text-amber-700">
                {onTimeLimit} - {lateToleranceLimit} WITA
              </span>
            </div>

            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1 text-[11px] text-rose-800">
                  <AlertCircle className="w-3.5 h-3.5" /> Batas Akhir Absen Masuk:
                </span>
                <span className="font-mono font-black text-xs text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-300">
                  Pukul {checkInCutOffTime} WITA
                </span>
              </div>
              <p className="text-[10px] text-rose-800 mt-1 leading-normal font-medium">
                Lewat dari pukul <strong>{checkInCutOffTime} WITA</strong>, tombol absensi masuk ditutup / terkunci otomatis dan dianggap tidak hadir (Alfa), kecuali telah melapor ke Guru Piket.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: ABSEN PULANG / KELUAR */}
        <div className={`p-4 rounded-2xl border transition-all ${
          highlightMode === "pulang" 
            ? "border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20" 
            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-black text-xs uppercase tracking-wide text-indigo-950">
                2. Ketentuan Absen Pulang
              </span>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
              Siang / Sore
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-700 py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">
                Jam Dibuka {isFriday ? "(Khusus Hari Jumat)" : "(Senin-Kamis & Sabtu)"}:
              </span>
              <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                Mulai {checkOutOpenTime} WITA
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-700 py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">Bel Resmi Kepulangan Sekolah:</span>
              <span className="font-mono font-extrabold text-slate-900">{bellDismissalTime} WITA</span>
            </div>

            <div className="flex items-center justify-between text-slate-700 py-1 border-b border-dashed border-slate-200">
              <span className="text-slate-500 font-medium">Presensi Keluar Guru & Staf:</span>
              <span className="font-mono font-bold text-slate-700">
                {isFriday ? "11:30 WITA" : "14:00 WITA"}
              </span>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1 text-[11px] text-amber-900">
                  <AlertCircle className="w-3.5 h-3.5" /> Batas Akhir Absen Pulang:
                </span>
                <span className="font-mono font-black text-xs text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300">
                  Pukul {checkOutCutOffTime} WITA
                </span>
              </div>
              <p className="text-[10px] text-amber-900 mt-1 leading-normal font-medium">
                Pastikan Anda melakukan absensi pulang sebelum pukul <strong>{checkOutCutOffTime} WITA</strong>. Lewat dari waktu tersebut, sesi presensi hari berjalan telah resmi diarsipkan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Guidance Footer */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-800">Catatan Kedisiplinan:</strong> Presensi mandiri divalidasi dengan radius lokasi GPS sekolah (maksimal 150 meter) dan bukti foto berseragam rapi. Notifikasi ketepatan waktu dikirim secara otomatis ke pemantauan WhatsApp Guru Piket dan Manajemen SMK Negeri 2 Konawe.
        </p>
      </div>
    </div>
  );
};
