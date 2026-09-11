import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Smile, 
  Meh, 
  Frown, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Calendar,
  User,
  GraduationCap,
  ShieldAlert,
  Clock
} from "lucide-react";
import { StudentViolationCreditManager } from "./StudentViolationCreditManager";

interface Reflection {
  id: string;
  studentName: string;
  className: string;
  date: string;
  satisfaction: number; // 1-5
  enjoyment: boolean;   // senang pembelajaran hari ini
  unsatisfactory: boolean; // belajar kurang memuaskan
  happyWithTeacher: boolean; // senang dengan gurunya
  narrative: string;   // narasi perasaan
  createdAt: string;
}

interface StudentReflectionProps {
  username: string;
}

export function StudentReflection({ username }: StudentReflectionProps) {
  const [reflections, setReflections] = useState<Reflection[]>(() => {
    const saved = localStorage.getItem("simpati_student_reflections");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [studentClass, setStudentClass] = useState("XI TKR A");

  // Load student's class from localStorage
  useEffect(() => {
    const savedMap = localStorage.getItem("simpati_students_map");
    if (savedMap) {
      try {
        const parsed = JSON.parse(savedMap);
        const foundClass = Object.keys(parsed).find(className => 
          parsed[className].includes(username)
        );
        if (foundClass) {
          setStudentClass(foundClass);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [username]);

  const todayStr = new Date().toISOString().split("T")[0];
  const hasSubmittedToday = reflections.some(
    r => r.studentName === username && r.date === todayStr
  );

  const [isEditingToday, setIsEditingToday] = useState<boolean>(false);
  const [activeStudentTab, setActiveStudentTab] = useState<"reflection" | "violations">("reflection");

  // Form states
  const [satisfaction, setSatisfaction] = useState<number>(4);
  const [enjoyment, setEnjoyment] = useState<boolean>(true);
  const [unsatisfactory, setUnsatisfactory] = useState<boolean>(false);
  const [happyWithTeacher, setHappyWithTeacher] = useState<boolean>(true);
  const [narrative, setNarrative] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Save reflections to localStorage and trigger storage event
  const saveReflections = (newRefls: Reflection[]) => {
    setReflections(newRefls);
    localStorage.setItem("simpati_student_reflections", JSON.stringify(newRefls));
    window.dispatchEvent(new Event("storage"));
  };

  const handleStartEdit = () => {
    const existing = reflections.find(r => r.studentName === username && r.date === todayStr);
    if (existing) {
      setSatisfaction(existing.satisfaction);
      setEnjoyment(existing.enjoyment);
      setUnsatisfactory(existing.unsatisfactory);
      setHappyWithTeacher(existing.happyWithTeacher);
      setNarrative(existing.narrative);
    }
    setIsEditingToday(true);
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalNarrative = narrative.trim() || "Proses pembelajaran hari ini berjalan dengan baik, materi tersampaikan dengan jelas, dan kelas kondusif.";

    const nowTimeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    // Check if updating today's reflection
    const existingIndex = reflections.findIndex(r => r.studentName === username && r.date === todayStr);

    let updatedRefls: Reflection[] = [];
    if (existingIndex >= 0) {
      updatedRefls = [...reflections];
      updatedRefls[existingIndex] = {
        ...updatedRefls[existingIndex],
        className: studentClass,
        satisfaction,
        enjoyment,
        unsatisfactory,
        happyWithTeacher,
        narrative: finalNarrative,
        createdAt: nowTimeStr
      };
    } else {
      const newReflection: Reflection = {
        id: `ref-${Date.now()}`,
        studentName: username,
        className: studentClass,
        date: todayStr,
        satisfaction,
        enjoyment,
        unsatisfactory,
        happyWithTeacher,
        narrative: finalNarrative,
        createdAt: nowTimeStr
      };
      updatedRefls = [newReflection, ...reflections];
    }

    saveReflections(updatedRefls);
    setSuccess(true);
    setIsEditingToday(false);
    setToastMsg("✅ Refleksi harian berhasil disimpan & diteruskan ke Laporan Wali Kelas!");
    setTimeout(() => setToastMsg(null), 4000);
  };

  const myHistory = reflections.filter(r => r.studentName === username);
  const myTodayRecord = reflections.find(
    r => r.studentName === username && r.date === todayStr
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto" id="student-reflection-workspace">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400 shrink-0" />
            <h2 className="text-xl font-bold tracking-tight">Refleksi Harian Pembelajaran</h2>
            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20 uppercase font-mono">
              Wajib Isi
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Halo <strong className="text-white font-extrabold">{username}</strong> ({studentClass}). Suaramu penting bagi kemajuan sekolah! Luangkan waktu 1 menit untuk merefleksikan proses belajar mengajar Anda hari ini.
          </p>
        </div>
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2 shrink-0">
          <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
          <div className="text-left font-mono text-[11px]">
            <div className="text-slate-400 font-bold uppercase leading-none">Hari Ini</div>
            <div className="text-white font-bold leading-none mt-1">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT PORTAL TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveStudentTab("reflection")}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            activeStudentTab === "reflection"
              ? "bg-slate-900 text-white shadow-md font-black"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Refleksi Harian KBM</span>
        </button>

        <button
          onClick={() => setActiveStudentTab("violations")}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            activeStudentTab === "violations"
              ? "bg-slate-900 text-white shadow-md font-black"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ShieldAlert className="h-4 w-4 text-rose-500" />
          <span>Kredit & Poin Pelanggaran Saya (0-100)</span>
        </button>
      </div>

      {toastMsg && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg border border-emerald-500 font-extrabold text-xs flex items-center justify-between animate-bounce">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-white hover:opacity-80 text-sm font-black ml-2">✕</button>
        </div>
      )}

      {activeStudentTab === "violations" ? (
        <StudentViolationCreditManager studentViewMode={true} username={username} targetStudentName={username} />
      ) : (
      /* Main Content Area */
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form Column (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          {(hasSubmittedToday || success) && !isEditingToday ? (
            <div className="bg-white p-6 rounded-2xl border border-indigo-150 shadow-sm space-y-4 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">Refleksi Hari Ini Terkirim!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Terima kasih telah mengisi refleksi harian secara jujur dan mandiri. Rekapan perasaan belajarmu telah diteruskan kepada <strong>Kepala Sekolah</strong> & <strong>Wali Kelas</strong> sebagai bahan evaluasi KBM hari ini.
              </p>

              {/* Show What Was Submitted */}
              {myTodayRecord && (
                <div className="bg-slate-50 p-4 rounded-xl border text-left space-y-3 mt-4 text-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-extrabold uppercase text-slate-400 text-[10px]">Detail Refleksi Anda</span>
                    <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-black">Jam: {myTodayRecord.createdAt}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Kepuasan Belajar:</span>
                      <span className="block font-bold text-slate-800">
                        {myTodayRecord.satisfaction === 5 ? "🥰 Sangat Puas (5/5)" :
                         myTodayRecord.satisfaction === 4 ? "😃 Puas (4/5)" :
                         myTodayRecord.satisfaction === 3 ? "😐 Biasa Saja (3/5)" :
                         myTodayRecord.satisfaction === 2 ? "🙁 Kurang Puas (2/5)" : "🤬 Sangat Kecewa (1/5)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Senang Pembelajaran:</span>
                      <span className="block font-bold text-slate-800">{myTodayRecord.enjoyment ? "✓ Ya, Senang" : "✕ Tidak Senang"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Senang dengan Guru:</span>
                      <span className="block font-bold text-slate-800">{myTodayRecord.happyWithTeacher ? "✓ Ya, Senang" : "✕ Kurang Senang"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Kurang Memuaskan:</span>
                      <span className="block font-bold text-slate-800">{myTodayRecord.unsatisfactory ? "✓ Ya, Kurang Puas" : "✕ Tidak"}</span>
                    </div>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    <span className="text-slate-500">Narasi Perasaan:</span>
                    <p className="font-medium text-slate-700 italic bg-white p-2.5 rounded border border-slate-150 mt-1 leading-relaxed">
                      "{myTodayRecord.narrative}"
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleStartEdit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>✏️ EDIT / KIRIM ULANG REFLEKSI HARI INI</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Formulir Refleksi Harian</h3>
                  <p className="text-[11px] text-slate-500">Evaluasi pembelajaran harian, mohon isi dengan jujur.</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 animate-pulse">
                  Wajib Diisi
                </span>
              </div>

              {/* Class selector */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wide">
                  Kelas Siswa:
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full border border-slate-250 text-xs font-bold rounded-xl p-2.5 bg-slate-50 text-slate-800 focus:outline-indigo-500"
                >
                  <option value="XI TKR A">XI TKR A</option>
                  <option value="XI TKR B">XI TKR B</option>
                  <option value="XI TPK">XI TPK</option>
                  <option value="XI TBSM">XI TBSM</option>
                  <option value="X TKR A">X TKR A</option>
                  <option value="XII TKR A">XII TKR A</option>
                </select>
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-800 text-xs p-3 rounded-xl border border-rose-150 flex items-start gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Satisfaction Rating Selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wide">
                  1. Bagaimana tingkat kepuasan belajarmu hari ini?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 1, label: "Sangat Kecewa", icon: Frown, color: "text-red-500", bg: "hover:bg-red-50 hover:border-red-300" },
                    { value: 2, label: "Kurang", icon: Frown, color: "text-orange-400", bg: "hover:bg-orange-50 hover:border-orange-300" },
                    { value: 3, label: "Biasa Saja", icon: Meh, color: "text-slate-400", bg: "hover:bg-slate-50 hover:border-slate-300" },
                    { value: 4, label: "Puas", icon: Smile, color: "text-indigo-500", bg: "hover:bg-indigo-50 hover:border-indigo-300" },
                    { value: 5, label: "Sangat Puas", icon: Smile, color: "text-emerald-500", bg: "hover:bg-emerald-50 hover:border-emerald-300" }
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isSelected = satisfaction === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSatisfaction(item.value)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                          isSelected 
                            ? "bg-slate-900 border-slate-950 text-white shadow-sm scale-102" 
                            : "bg-slate-50 border-slate-200 text-slate-600 " + item.bg
                        }`}
                      >
                        <IconComp className={`h-6 w-6 ${isSelected ? "text-white" : item.color}`} />
                        <span className="text-[9px] font-bold leading-none">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Yes/No Questions Grid */}
              <div className="space-y-4 border-t pt-4">
                <span className="block text-[11px] font-black uppercase text-slate-500 tracking-wide">
                  2. Tanggapan Pembelajaran & Guru
                </span>

                <div className="space-y-3 text-xs">
                  {/* Enjoyment */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="font-bold text-slate-700">Apakah kamu merasa senang dengan pembelajaran hari ini?</span>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => setEnjoyment(true)}
                        className={`px-4 py-1.5 rounded-lg border text-[11px] font-black uppercase transition-all cursor-pointer ${
                          enjoyment 
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs" 
                            : "bg-white border-slate-250 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Ya, Senang
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnjoyment(false)}
                        className={`px-4 py-1.5 rounded-lg border text-[11px] font-black uppercase transition-all cursor-pointer ${
                          !enjoyment 
                            ? "bg-rose-600 border-rose-600 text-white shadow-xs" 
                            : "bg-white border-slate-250 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Tidak
                      </button>
                    </div>
                  </div>

                  {/* Unsatisfactory */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="font-bold text-slate-700">Apakah proses pembelajaran hari ini terasa kurang memuaskan bagimu?</span>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => setUnsatisfactory(true)}
                        className={`px-4 py-1.5 rounded-lg border text-[11px] font-black uppercase transition-all cursor-pointer ${
                          unsatisfactory 
                            ? "bg-rose-600 border-rose-600 text-white shadow-xs" 
                            : "bg-white border-slate-250 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Ya, Kurang
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnsatisfactory(false)}
                        className={`px-4 py-1.5 rounded-lg border text-[11px] font-black uppercase transition-all cursor-pointer ${
                          !unsatisfactory 
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs" 
                            : "bg-white border-slate-250 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Tidak
                      </button>
                    </div>
                  </div>

                  {/* Happy with Teacher */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="font-bold text-slate-700">Apakah kamu senang dengan guru yang membimbing kelasmu hari ini?</span>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => setHappyWithTeacher(true)}
                        className={`px-4 py-1.5 rounded-lg border text-[11px] font-black uppercase transition-all cursor-pointer ${
                          happyWithTeacher 
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs" 
                            : "bg-white border-slate-250 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Ya, Senang
                      </button>
                      <button
                        type="button"
                        onClick={() => setHappyWithTeacher(false)}
                        className={`px-4 py-1.5 rounded-lg border text-[11px] font-black uppercase transition-all cursor-pointer ${
                          !happyWithTeacher 
                            ? "bg-rose-600 border-rose-600 text-white shadow-xs" 
                            : "bg-white border-slate-250 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Tidak
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Narrative Textarea (Manditory) */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wide">
                    3. Narasi Perasaan Hari Ini:
                  </label>
                  <span className="text-[10px] text-indigo-600 font-bold">Pilih Opsi Cepat:</span>
                </div>

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    "Pembelajaran menyenangkan, materi paham.",
                    "Sangat suka dengan cara mengajar guru hari ini.",
                    "Materi agak sulit tapi penjelasan guru membantu.",
                    "Suasana kelas sangat kondusif & praktik berjalan lancar."
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNarrative(chip)}
                      className="text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <textarea
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="Tuliskan narasi refleksi Anda atau klik salah satu opsi cepat di atas..."
                  className="w-full border border-slate-250 text-xs rounded-xl p-3 h-28 focus:outline-indigo-500 font-medium bg-slate-50 focus:bg-white transition-all leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 block italic leading-tight">
                  *Penting: Guru Anda atau Wali Kelas tidak akan memberikan sanksi atas kejujuran refleksimu. Isilah demi kualitas pengajaran sekolah.
                </span>
              </div>

              <button
                type="submit"
                id="btn-submit-reflection"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Simpan & Kirim Refleksi Harian</span>
              </button>
            </form>
          )}
        </div>

        {/* Right History Column (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <FileText className="h-4.5 w-4.5 text-indigo-500" />
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">Riwayat Refleksi Saya</h4>
            </div>

            {myHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                <Frown className="h-8 w-8 mx-auto stroke-[1.5]" />
                <p>Belum ada catatan refleksi yang pernah Anda kirimkan.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                {myHistory.map((item) => (
                  <div key={item.id} className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-extrabold text-slate-500 flex items-center gap-1 font-mono">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.date}
                      </span>
                      <span className="font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono text-[9px]">{item.createdAt}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] bg-white p-2 rounded-lg border">
                      <div>
                        <span className="text-slate-400 text-[10px]">Kepuasan:</span>
                        <span className="block font-bold">
                          {item.satisfaction >= 4 ? "😃 Puas" : item.satisfaction === 3 ? "😐 Biasa" : "🙁 Kurang"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Senang KBM:</span>
                        <span className={`block font-bold ${item.enjoyment ? "text-emerald-600" : "text-rose-600"}`}>{item.enjoyment ? "Ya" : "Tidak"}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-600 italic font-medium leading-relaxed bg-white/40 p-2 rounded border border-slate-100">
                        "{item.narrative}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
      )}
    </div>
  );
}
