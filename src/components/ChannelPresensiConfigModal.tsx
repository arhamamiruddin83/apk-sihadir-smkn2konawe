import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Radio, CheckCircle2, AlertTriangle, Send, RefreshCw, Copy, Check,
  Settings, MessageSquare, ExternalLink, HelpCircle, ShieldCheck, ChevronRight,
  Info, Users, Key
} from "lucide-react";
import {
  getSchoolChannelTarget,
  setSchoolChannelTarget,
  isAutoChannelCheckInEnabled,
  setAutoChannelCheckInEnabled,
  isAutoChannelCheckOutEnabled,
  setAutoChannelCheckOutEnabled,
  getFonnteApiKey,
  setFonnteConfig,
  buildTeacherCheckInChannelMessage,
  buildTeacherCheckOutChannelMessage,
  dispatchTeacherAttendanceToChannel,
  buildTeacherSession1Report,
  buildTeacherSession2Report,
  dispatchTwoSessionReport
} from "../services/whatsappFonnteService";

interface ChannelPresensiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTeacherName?: string;
}

interface FetchedGroup {
  id: string;
  name: string;
}

export function ChannelPresensiConfigModal({
  isOpen,
  onClose,
  currentTeacherName = "Dra. Hj. Arbianti, M.Pd."
}: ChannelPresensiConfigModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getFonnteApiKey());
  const [channelTarget, setChannelTargetInput] = useState<string>(() => getSchoolChannelTarget());
  const [autoIn, setAutoIn] = useState<boolean>(() => isAutoChannelCheckInEnabled());
  const [autoOut, setAutoOut] = useState<boolean>(() => isAutoChannelCheckOutEnabled());
  
  const [activePreviewTab, setActivePreviewTab] = useState<"masuk" | "pulang" | "sesi1" | "sesi2">("masuk");
  const [isTestingSend, setIsTestingSend] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; targets?: string[] } | null>(null);
  const [copiedPreview, setCopiedPreview] = useState<boolean>(false);

  // Group fetcher state
  const [isFetchingGroups, setIsFetchingGroups] = useState<boolean>(false);
  const [fetchedGroups, setFetchedGroups] = useState<FetchedGroup[]>([]);
  const [fetchGroupError, setFetchGroupError] = useState<string>("");

  const fonnteToken = apiKeyInput || getFonnteApiKey();
  const isGatewayReady = Boolean(fonnteToken && fonnteToken.length > 5);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getFonnteApiKey());
      setChannelTargetInput(getSchoolChannelTarget());
      setAutoIn(isAutoChannelCheckInEnabled());
      setAutoOut(isAutoChannelCheckOutEnabled());
      setTestResult(null);
    }
  }, [isOpen]);

  const handleSaveConfig = () => {
    const clean = channelTarget.trim() || "120363205084846535@g.us";
    setSchoolChannelTarget(clean);
    setAutoChannelCheckInEnabled(autoIn);
    setAutoChannelCheckOutEnabled(autoOut);
    setFonnteConfig({ 
      apiKey: apiKeyInput.trim() || undefined, 
      schoolChannelTarget: clean,
      schoolChannel: clean,
      teacherGroup: clean
    });
    setTestResult({
      success: true,
      message: `Pengaturan berhasil disimpan! Target siaran aktif: ${clean === "120363205084846535@g.us" ? "Grup SMKN 2 KONAWE" : clean}`
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleFetchGroups = async () => {
    setIsFetchingGroups(true);
    setFetchGroupError("");
    try {
      const res = await fetch("/api/whatsapp/fetch-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customToken: apiKeyInput.trim() || fonnteToken })
      });
      const data = await res.json();
      if (data.status === true && Array.isArray(data.data)) {
        const mapped: FetchedGroup[] = data.data.map((g: any) => ({
          id: g.id || "",
          name: g.name || "Grup Tanpa Nama"
        })).filter((g: FetchedGroup) => Boolean(g.id));

        setFetchedGroups(mapped);
        if (mapped.length === 0) {
          setFetchGroupError("Tidak ada grup yang terdeteksi pada akun bot Fonnte ini.");
        }
      } else {
        setFetchGroupError(data.reason || data.detail || "Gagal mengambil data grup dari server.");
      }
    } catch (e: any) {
      setFetchGroupError(e.message || "Gagal menghubungi API Fonnte");
    } finally {
      setIsFetchingGroups(false);
    }
  };

  const handleTestSend = async (type: "masuk" | "pulang" | "sesi1" | "sesi2") => {
    setIsTestingSend(true);
    setTestResult(null);

    // Temporarily ensure input is saved for testing
    const targetToUse = channelTarget.trim();
    if (!targetToUse) {
      setTestResult({
        success: false,
        message: "Silakan masukkan ID Saluran / Grup WhatsApp terlebih dahulu."
      });
      setIsTestingSend(false);
      return;
    }

    setSchoolChannelTarget(targetToUse);
    if (apiKeyInput.trim()) {
      setFonnteConfig({ apiKey: apiKeyInput.trim(), schoolChannelTarget: targetToUse });
    }

    try {
      if (type === "sesi1" || type === "sesi2") {
        const sessionNum = type === "sesi1" ? 1 : 2;
        const res = await dispatchTwoSessionReport(sessionNum);
        setTestResult({
          success: res.success,
          message: res.message,
          targets: [res.target]
        });
      } else {
        const payload = type === "masuk" ? {
          teacherName: currentTeacherName,
          nip: "197008151998022003",
          date: new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA",
          distance: 14,
          status: "UJI COBA PRESENSI MASUK",
          notes: "Uji Coba Pengiriman Laporan Presensi Datang ke Saluran SMKN 2 Konawe"
        } : {
          teacherName: currentTeacherName,
          nip: "197008151998022003",
          date: new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA",
          clockInTime: "06:48",
          duration: "8 Jam 42 Menit",
          distance: 18,
          status: "UJI COBA PRESENSI PULANG",
          notes: "Uji Coba Pengiriman Laporan Presensi Pulang ke Saluran SMKN 2 Konawe"
        };

        const res = await dispatchTeacherAttendanceToChannel(type, payload);
        setTestResult({
          success: res.success,
          message: res.message,
          targets: res.targetsSent
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Terjadi kesalahan saat memicu pengiriman tes."
      });
    } finally {
      setIsTestingSend(false);
    }
  };

  const currentPreviewMessage = activePreviewTab === "masuk"
    ? buildTeacherCheckInChannelMessage({
        teacherName: currentTeacherName,
        nip: "197008151998022003",
        distance: 15,
        status: "HADIR TEPAT WAKTU"
      })
    : activePreviewTab === "pulang"
    ? buildTeacherCheckOutChannelMessage({
        teacherName: currentTeacherName,
        nip: "197008151998022003",
        clockInTime: "06:48",
        duration: "8 Jam 42 Menit",
        distance: 22,
        status: "SELESAI TUGAS / PULANG LENGKAP"
      })
    : activePreviewTab === "sesi1"
    ? buildTeacherSession1Report().messageText
    : buildTeacherSession2Report().messageText;

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(currentPreviewMessage);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 3000);
  };

  const handleOpenWhatsAppDirect = () => {
    const encoded = encodeURIComponent(currentPreviewMessage);
    const cleanTarget = channelTarget.replace(/[^0-9]/g, "");
    let url = `https://api.whatsapp.com/send?text=${encoded}`;
    if (cleanTarget && !channelTarget.includes("@g.us")) {
      url = `https://api.whatsapp.com/send?phone=${cleanTarget}&text=${encoded}`;
    }
    window.open(url, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
                <Radio className="h-6 w-6 text-emerald-200 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    Koneksi Saluran / Grup WhatsApp SMKN 2 Konawe
                  </h3>
                  <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    Presensi Masuk & Pulang
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-1">
                  Panduan & konfigurasi otomatisasi siaran kehadiran guru ke Saluran Resmi sekolah
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
              title="Tutup Modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 flex-1">
          {/* Status Gateway Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full shrink-0 ${isGatewayReady ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Status Gateway WhatsApp (Fonnte):{" "}
                  <span className={isGatewayReady ? "text-emerald-600 font-black" : "text-amber-600 font-black"}>
                    {isGatewayReady ? "Terhubung & Siap Kirim" : "Perlu Konfigurasi Token"}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Target Saat Ini: <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono font-bold text-slate-800">{channelTarget || "Belum ditentukan"}</code>
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl w-fit">
              SMK Negeri 2 Konawe
            </span>
          </div>

          {/* Configuration Form */}
          <div className="space-y-4">
            {/* Token / API Key Gateway */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-amber-600" />
                  <span>Token Fonnte WhatsApp Gateway:</span>
                </label>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {apiKeyInput ? "Token Terisi" : "Belum Ada"}
                </span>
              </div>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Contoh: LMJoXs8WD3g78VGgFuTM"
                className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-slate-900 font-mono text-xs p-3 rounded-xl transition-all"
              />
              <p className="text-[10.5px] text-slate-500 mt-1">
                Token aktif saat ini: <code className="font-mono font-bold bg-slate-100 px-1 py-0.5 rounded text-slate-700">{apiKeyInput || "LMJoXs8WD3g78VGgFuTM"}</code>
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                  <span>ID Saluran / Grup WhatsApp SMK Negeri 2 Konawe:</span>
                </label>
                <button
                  type="button"
                  onClick={handleFetchGroups}
                  disabled={isFetchingGroups}
                  className="text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${isFetchingGroups ? "animate-spin" : ""}`} />
                  <span>{isFetchingGroups ? "Memuat Grup..." : "Tarik Daftar Grup dari WA"}</span>
                </button>
              </div>
              <input
                type="text"
                value={channelTarget}
                onChange={(e) => setChannelTargetInput(e.target.value)}
                placeholder="Contoh: 120363297411977450@newsletter (Saluran Resmi SMKN 2 Konawe)"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 font-mono text-xs p-3 rounded-xl transition-all"
              />
              <p className="text-[10.5px] text-slate-500 mt-1">
                Format Saluran Resmi berakhiran <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-emerald-800">@newsletter</code> atau ID Grup berakhiran <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-700">@g.us</code>.
              </p>

              {/* Quick Presets for SMK Negeri 2 Konawe */}
              <div className="mt-2.5 p-2.5 bg-slate-100/80 border border-slate-200 rounded-xl space-y-1.5">
                <p className="text-[10.5px] font-extrabold text-slate-700">Pilihan Cepat Target Laporan:</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setChannelTargetInput("120363205084846535@g.us")}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      channelTarget === "120363205084846535@g.us"
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span>👥 Grup SMKN 2 KONAWE (Disarankan)</span>
                    <span className="text-[9.5px] opacity-75 font-mono">(120363205084846535@g.us)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannelTargetInput("120363297411977450@newsletter")}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      channelTarget === "120363297411977450@newsletter"
                        ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                        : "bg-white text-slate-700 hover:bg-amber-50 border-slate-200"
                    }`}
                  >
                    <span>📢 Saluran Resmi (@newsletter)</span>
                    <span className="text-[9.5px] opacity-75 font-mono">(120363297411977450)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannelTargetInput("120363155477246592@g.us")}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      channelTarget === "120363155477246592@g.us"
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span>📋 ADM SMK 2 KNW</span>
                    <span className="text-[9.5px] opacity-75 font-mono">(120363155477246592@g.us)</span>
                  </button>
                </div>
              </div>

              {channelTarget.includes("@newsletter") && (
                <div className="mt-2.5 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Informasi Teknis Saluran WhatsApp (@newsletter):</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900">
                    Server WhatsApp Gateway (Fonnte) saat ini <strong>belum membuka izin pengiriman pesan langsung ke Saluran WhatsApp (@newsletter)</strong> dan merespons dengan status <em>"target input invalid"</em>. Fonnte secara resmi hanya mendukung pengiriman ke <strong>ID Grup WhatsApp (@g.us)</strong> dan nomor HP pribadi.
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-900">
                    Agar laporan presensi masuk langsung dan terbaca otomatis di WhatsApp, sangat disarankan menggunakan <strong>Grup SMKN 2 KONAWE</strong>:
                  </p>
                  <button
                    type="button"
                    onClick={() => setChannelTargetInput("120363205084846535@g.us")}
                    className="mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <span>Ganti ke Grup SMKN 2 KONAWE (120363205084846535@g.us)</span>
                  </button>
                </div>
              )}

              {/* Fetched Groups Picker */}
              {fetchedGroups.length > 0 && (
                <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                  <p className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Pilih dari Grup WhatsApp yang Ditemukan di Bot Anda:</span>
                  </p>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {fetchedGroups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setChannelTargetInput(g.id)}
                        className={`w-full text-left text-xs p-2 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                          channelTarget === g.id
                            ? "bg-emerald-600 text-white font-black shadow-xs"
                            : "bg-white hover:bg-indigo-100 text-slate-800 border border-indigo-100 font-medium"
                        }`}
                      >
                        <span className="truncate">{g.name}</span>
                        <span className="text-[10px] opacity-75 font-mono ml-2 shrink-0">{g.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {fetchGroupError && (
                <p className="text-[11px] text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>{fetchGroupError}</span>
                </p>
              )}
            </div>

            {/* Automation Options (Switches) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={autoIn}
                  onChange={(e) => setAutoIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-slate-800">Kirim Otomatis Presensi Masuk</p>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    Setiap guru menekan tombol Presensi Masuk, laporan langsung dipublikasikan ke saluran.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={autoOut}
                  onChange={(e) => setAutoOut(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-slate-800">Kirim Otomatis Presensi Pulang</p>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    Saat guru absen pulang di jam yang ditentukan, laporan tercatat pada saluran sekolah.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Test & Live Preview Section */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Uji Coba Kirim & Preview Format Laporan</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Lihat format pesan dan kirim langsung tes ke Saluran SMK Negeri 2 Konawe
                </p>
              </div>

              {/* Tabs Preview */}
              <div className="flex bg-slate-100 p-1 rounded-xl flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("masuk")}
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activePreviewTab === "masuk"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Presensi Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("pulang")}
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activePreviewTab === "pulang"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Presensi Pulang
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("sesi1")}
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activePreviewTab === "sesi1"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ☕ Sesi 1 (Istirahat)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("sesi2")}
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activePreviewTab === "sesi2"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🏁 Sesi 2 (Pk 13.00)
                </button>
              </div>
            </div>

            {/* Simulated WhatsApp Bubble */}
            <div className="bg-[#e5ddd5] p-4 rounded-2xl border border-slate-300 relative shadow-inner">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 max-w-xl text-xs font-mono leading-relaxed whitespace-pre-wrap text-slate-800">
                {currentPreviewMessage}
              </div>

              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleCopyPreview}
                  className="bg-white/90 hover:bg-white text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedPreview ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedPreview ? "Tersalin!" : "Salin Format"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsAppDirect}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Buka di WhatsApp Web</span>
                </button>
              </div>
            </div>

            {/* Test Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleTestSend("masuk")}
                disabled={isTestingSend}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className={`h-3.5 w-3.5 ${isTestingSend ? "animate-spin" : ""}`} />
                <span>Kirim Tes Presensi Masuk</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestSend("pulang")}
                disabled={isTestingSend}
                className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className={`h-3.5 w-3.5 ${isTestingSend ? "animate-spin" : ""}`} />
                <span>Kirim Tes Presensi Pulang</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestSend("sesi1")}
                disabled={isTestingSend}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className={`h-3.5 w-3.5 ${isTestingSend ? "animate-spin" : ""}`} />
                <span>Kirim Tes Rekap Sesi 1</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestSend("sesi2")}
                disabled={isTestingSend}
                className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className={`h-3.5 w-3.5 ${isTestingSend ? "animate-spin" : ""}`} />
                <span>Kirim Tes Rekap Sesi 2</span>
              </button>
            </div>

            {/* Test Result Toast/Feedback */}
            <AnimatePresence>
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3.5 rounded-xl text-xs font-bold border flex items-start gap-2.5 ${
                    testResult.success 
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200" 
                      : "bg-rose-50 text-rose-900 border-rose-200"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p>{testResult.message}</p>
                    {testResult.targets && testResult.targets.length > 0 && (
                      <p className="text-[11px] font-normal text-emerald-700 mt-0.5">
                        Terkirim ke ID: {testResult.targets.join(", ")}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Step-by-Step Instructions */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
            <h5 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-amber-600" />
              <span>Petunjuk Praktis Menghubungkan ke Grup / Saluran WhatsApp:</span>
            </h5>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-amber-950/90 leading-relaxed font-medium">
              <li>
                <strong>Masukkan Bot WhatsApp ke Grup/Saluran SMKN 2 Konawe</strong>: Pastikan nomor bot Fonnte Anda telah dimasukkan ke dalam grup/saluran resmi SMK Negeri 2 Konawe.
              </li>
              <li>
                <strong>Dapatkan Group ID</strong>: Di grup WhatsApp, Anda dapat mengetik <code className="bg-amber-200/70 px-1.5 py-0.5 rounded font-mono font-bold text-amber-900">/groupid</code> atau klik tombol <em>"Tarik Daftar Grup dari WA"</em> di atas untuk memilih grup sekolah secara langsung.
              </li>
              <li>
                <strong>Simpan Pengaturan</strong>: Tempelkan ID grup tersebut pada kolom input di atas, lalu klik <strong>Simpan Pengaturan Saluran</strong>.
              </li>
              <li>
                <strong>Uji Coba Pengiriman</strong>: Tekan tombol <em>"Uji Coba Kirim Presensi Masuk"</em> untuk memastikan pesan sukses terkirim ke saluran.
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSaveConfig}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Simpan Pengaturan Saluran</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
