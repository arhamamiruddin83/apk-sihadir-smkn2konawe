import React, { useState, useEffect } from "react";

interface BirthDateSelectorProps {
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD or raw string
  onPlaceChange: (place: string) => void;
  onDateChange: (dateYYYYMMDD: string, formattedIndoStr: string) => void;
  minYear?: number;
  maxYear?: number;
  labelPlace?: string;
  labelDate?: string;
  className?: string;
}

const MONTH_NAMES = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" }
];

export default function BirthDateSelector({
  birthPlace,
  birthDate,
  onPlaceChange,
  onDateChange,
  minYear = 1950,
  maxYear = 2026,
  labelPlace = "Tempat Lahir",
  labelDate = "Tanggal Lahir (Pilih Tanggal, Bulan & Tahun)",
  className = ""
}: BirthDateSelectorProps) {
  // Parse day, month, year from incoming birthDate string
  const parseDate = (dStr: string) => {
    if (!dStr) return { day: "01", month: "01", year: "2000" };
    // Try YYYY-MM-DD format
    if (dStr.includes("-")) {
      const parts = dStr.split("-");
      if (parts.length >= 3) {
        const y = parts[0] || "2000";
        const m = parts[1] ? parts[1].padStart(2, "0") : "01";
        const d = parts[2] ? parts[2].substring(0, 2).padStart(2, "0") : "01";
        return { day: d, month: m, year: y };
      }
    }
    // Try "Konawe, 5 Mei 1989" format
    const monthIndexMap: Record<string, string> = {
      januari: "01", februari: "02", maret: "03", april: "04",
      mei: "05", juni: "06", juli: "07", agustus: "08",
      september: "09", oktober: "10", november: "11", desember: "12"
    };
    const tokens = dStr.replace(/,/g, " ").trim().split(/\s+/);
    let foundDay = "01";
    let foundMonth = "01";
    let foundYear = "2000";

    tokens.forEach(tok => {
      const lower = tok.toLowerCase();
      if (monthIndexMap[lower]) {
        foundMonth = monthIndexMap[lower];
      } else if (/^\d{4}$/.test(tok)) {
        foundYear = tok;
      } else if (/^\d{1,2}$/.test(tok) && parseInt(tok, 10) <= 31) {
        foundDay = tok.padStart(2, "0");
      }
    });

    return { day: foundDay, month: foundMonth, year: foundYear };
  };

  const initial = parseDate(birthDate);
  const [day, setDay] = useState<string>(initial.day);
  const [month, setMonth] = useState<string>(initial.month);
  const [year, setYear] = useState<string>(initial.year);

  // Sync internal state when external birthDate changes drastically
  useEffect(() => {
    const parsed = parseDate(birthDate);
    if (parsed.day !== day || parsed.month !== month || parsed.year !== year) {
      setDay(parsed.day);
      setMonth(parsed.month);
      setYear(parsed.year);
    }
  }, [birthDate]);

  const handleSelectChange = (newDay: string, newMonth: string, newYear: string) => {
    setDay(newDay);
    setMonth(newMonth);
    setYear(newYear);

    const formattedISO = `${newYear}-${newMonth.padStart(2, "0")}-${newDay.padStart(2, "0")}`;
    const monthObj = MONTH_NAMES.find(m => m.value === newMonth.padStart(2, "0"));
    const monthLabel = monthObj ? monthObj.label : "Januari";
    const formattedIndo = `${parseInt(newDay, 10)} ${monthLabel} ${newYear}`;

    onDateChange(formattedISO, formattedIndo);
  };

  // Generate Year options (maxYear down to minYear)
  const yearOptions = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearOptions.push(y);
  }

  // Generate Day options (1 to 31)
  const dayOptions = [];
  for (let d = 1; d <= 31; d++) {
    dayOptions.push(d.toString().padStart(2, "0"));
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      {/* Tempat Lahir */}
      <div className="space-y-1">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
          {labelPlace}
        </label>
        <input
          type="text"
          value={birthPlace}
          onChange={(e) => onPlaceChange(e.target.value)}
          placeholder="Contoh: Konawe / Unaaha"
          className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Tanggal Lahir (Drop-down Tanggal, Bulan, Tahun) */}
      <div className="space-y-1">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
          {labelDate}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {/* Tanggal Dropdown */}
          <select
            value={day}
            onChange={(e) => handleSelectChange(e.target.value, month, year)}
            className="text-xs p-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {parseInt(d, 10)}
              </option>
            ))}
          </select>

          {/* Bulan Dropdown */}
          <select
            value={month}
            onChange={(e) => handleSelectChange(day, e.target.value, year)}
            className="text-xs p-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate"
          >
            {MONTH_NAMES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Tahun Dropdown */}
          <select
            value={year}
            onChange={(e) => handleSelectChange(day, month, e.target.value)}
            className="text-xs p-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
