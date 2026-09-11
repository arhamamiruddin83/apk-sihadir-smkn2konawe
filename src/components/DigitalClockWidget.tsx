import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

interface DigitalClockWidgetProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "dark" | "light" | "header" | "glass" | "emerald";
  showTimezone?: boolean;
  className?: string;
  id?: string;
}

const INDONESIAN_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu"
];

const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

export function DigitalClockWidget({
  size = "lg",
  variant = "dark",
  showTimezone = true,
  className = "",
  id = "digital-clock-widget"
}: DigitalClockWidgetProps) {
  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dayName = INDONESIAN_DAYS[time.getDay()];
  const dateNum = time.getDate();
  const monthName = INDONESIAN_MONTHS[time.getMonth()];
  const yearNum = time.getFullYear();

  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");

  // Variant themes
  const getVariantClasses = () => {
    switch (variant) {
      case "header":
        return {
          wrapper: "bg-slate-900/90 hover:bg-slate-900 text-white border border-cyan-400/40 shadow-lg shadow-cyan-950/40 backdrop-blur-md",
          dateText: "text-cyan-200",
          timeText: "text-white",
          secText: "text-cyan-400",
          tzBadge: "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30",
          iconColor: "text-cyan-400"
        };
      case "emerald":
        return {
          wrapper: "bg-emerald-950/90 text-white border border-emerald-400/40 shadow-lg shadow-emerald-950/30 backdrop-blur-md",
          dateText: "text-emerald-200",
          timeText: "text-white",
          secText: "text-emerald-400",
          tzBadge: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
          iconColor: "text-emerald-400"
        };
      case "glass":
        return {
          wrapper: "bg-white/15 hover:bg-white/20 text-white border border-white/30 shadow-xl backdrop-blur-md",
          dateText: "text-white/90",
          timeText: "text-white",
          secText: "text-amber-300",
          tzBadge: "bg-white/20 text-white border border-white/30",
          iconColor: "text-amber-300"
        };
      case "light":
        return {
          wrapper: "bg-white text-slate-900 border border-indigo-200 shadow-md shadow-indigo-100/50",
          dateText: "text-indigo-900",
          timeText: "text-slate-950",
          secText: "text-indigo-600",
          tzBadge: "bg-indigo-50 text-indigo-700 border border-indigo-200",
          iconColor: "text-indigo-600"
        };
      case "dark":
      default:
        return {
          wrapper: "bg-slate-950/95 text-white border border-slate-700/80 shadow-xl shadow-black/40",
          dateText: "text-sky-300",
          timeText: "text-white",
          secText: "text-sky-400",
          tzBadge: "bg-sky-500/20 text-sky-300 border border-sky-400/30",
          iconColor: "text-sky-400"
        };
    }
  };

  const vStyle = getVariantClasses();

  // Size configurations
  const isLarge = size === "lg" || size === "xl";
  const isXLarge = size === "xl";

  return (
    <div
      id={id}
      className={`inline-flex flex-col items-end justify-center px-3.5 py-1.5 rounded-2xl select-none transition-all duration-200 ${vStyle.wrapper} ${className}`}
      title="Jam Digital Resmi Sistem Absensi SMK Negeri 2 Konawe (WITA)"
    >
      {/* Baris 1: Hari, Tanggal, Bulan, Tahun */}
      <div className="flex items-center gap-1.5 leading-none mb-1">
        <Calendar className={`shrink-0 ${isLarge ? "w-3.5 h-3.5" : "w-3 h-3"} ${vStyle.iconColor}`} />
        <span className={`font-bold tracking-tight uppercase ${isLarge ? "text-[11px] sm:text-xs" : "text-[10px]"} ${vStyle.dateText}`}>
          <strong className="font-black text-amber-300">{dayName}</strong>, {dateNum} {monthName} {yearNum}
        </span>
      </div>

      {/* Baris 2: Jam Digital Besar (HH:MM:SS WITA) */}
      <div className="flex items-center gap-1.5 leading-none">
        <Clock className={`shrink-0 ${isLarge ? "w-4 h-4" : "w-3.5 h-3.5"} ${vStyle.iconColor} animate-pulse`} />
        <div className="flex items-baseline font-mono tracking-widest font-black">
          <span className={`${isXLarge ? "text-3xl sm:text-4xl" : isLarge ? "text-xl sm:text-2xl" : "text-base sm:text-lg"} ${vStyle.timeText}`}>
            {hours}:{minutes}
          </span>
          <span className={`${isXLarge ? "text-xl sm:text-2xl" : isLarge ? "text-sm sm:text-base" : "text-xs"} ml-1 ${vStyle.secText}`}>
            :{seconds}
          </span>
        </div>
        {showTimezone && (
          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md font-mono tracking-wider ml-0.5 ${vStyle.tzBadge}`}>
            WITA
          </span>
        )}
      </div>
    </div>
  );
}
