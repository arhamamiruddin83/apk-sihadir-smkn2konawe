/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Send,
  Plus,
  Search,
  Filter,
  Printer,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  Calendar,
  Eye,
  X,
  FileCheck,
  ShieldCheck,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  Inbox
} from "lucide-react";

export interface SuratMasukItem {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  tanggalDiterima: string;
  pengirim: string;
  perihal: string;
  sifat: "Biasa" | "Penting" | "Rahasia" | "Edaran" | "Undangan" | "Tugas";
  disposisi: string;
  keterangan: string;
  fileName?: string;
  status: "Proses Disposisi" | "Selesai / Diarsipkan" | "Perlu Tindak Lanjut";
}

export interface SuratKeluarItem {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  tujuanSurat: string;
  perihal: string;
  sifat: "Biasa" | "Penting" | "Edaran" | "Undangan" | "Permohonan" | "Tugas" | "Laporan";
  penandatangan: string;
  keterangan: string;
  fileName?: string;
  status: "Draft" | "Dikirim & Diarsipkan" | "Disetujui Kepsek";
}

interface ArsipSuratDigitalProps {
  currentRole?: string;
  username?: string;
  initialTab?: "masuk" | "keluar" | "rekap";
}

export function ArsipSuratDigital({
  currentRole = "tu",
  username = "tu",
  initialTab = "masuk"
}: ArsipSuratDigitalProps) {
  const [activeTab, setActiveTab] = useState<"masuk" | "keluar" | "rekap">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Default Mock Data for Surat Masuk
  const DEFAULT_SURAT_MASUK: SuratMasukItem[] = [
    {
      id: "sm-1",
      nomorSurat: "005/DISDIK-PROV/700/2026",
      tanggalSurat: "2026-07-20",
      tanggalDiterima: "2026-07-21",
      pengirim: "Dinas Pendidikan & Kebudayaan Prov. Sultra",
      perihal: "Undangan Rapat Evaluasi Kurikulum Merdeka & Kesiapan T.A 2026/2027",
      sifat: "Penting",
      disposisi: "Disetujui Kepsek -> Diteruskan ke Waka Kurikulum & Seluruh Guru",
      keterangan: "Wajib dihadiri oleh Kepala Sekolah dan Waka Kurikulum bertempat di Aula Disdik Prov.",
      fileName: "Surat_Undangan_Disdik_Prov.pdf",
      status: "Selesai / Diarsipkan"
    },
    {
      id: "sm-2",
      nomorSurat: "112/CABDIN-KNW/VI/2026",
      tanggalSurat: "2026-07-15",
      tanggalDiterima: "2026-07-16",
      pengirim: "Cabang Dinas Pendidikan Wilayah I Konawe",
      perihal: "Monitoring & Evaluasi Kedisiplinan & Presensi Digital Pendidik",
      sifat: "Penting",
      disposisi: "Diteruskan ke Waka Kesiswaan & Guru Piket",
      keterangan: "Persiapan dokumen rekap harian presensi guru dan murid melalui sistem SIHADIR.",
      fileName: "Monev_Presensi_Konawe.pdf",
      status: "Proses Disposisi"
    },
    {
      id: "sm-3",
      nomorSurat: "450/HRD-AHM/VII/2026",
      tanggalSurat: "2026-07-10",
      tanggalDiterima: "2026-07-12",
      pengirim: "PT. Astra Honda Motor (AHM) Regional Sultra",
      perihal: "Penerimaan Murid Praktik Kerja Lapangan (PKL) Jurusan TSM T.A 2026/2027",
      sifat: "Penting",
      disposisi: "Disetujui Kepsek -> Diserahkan ke Kaprog Keahlian TSM",
      keterangan: "Kuota 15 murid jurusan TSM SMK Negeri 2 Konawe untuk penempatan kuartal III.",
      fileName: "Penerimaan_PKL_Astra_Honda.pdf",
      status: "Selesai / Diarsipkan"
    },
    {
      id: "sm-4",
      nomorSurat: "088/PUSKESMAS-UNAAHA/2026",
      tanggalSurat: "2026-07-05",
      tanggalDiterima: "2026-07-06",
      pengirim: "Puskesmas Unaaha Kabupaten Konawe",
      perihal: "Pemeriksaan Kesehatan Berkala & Penyuluhan Gizi Remaja SMK",
      sifat: "Biasa",
      disposisi: "Diserahkan ke Pembina PMR & Waka Kesiswaan",
      keterangan: "Pelaksanaan dijadwalkan hari Jumat pekan II pukul 08.00 WITA.",
      fileName: "Surat_Gizi_Remaja.pdf",
      status: "Selesai / Diarsipkan"
    }
  ];

  // Default Mock Data for Surat Keluar
  const DEFAULT_SURAT_KELUAR: SuratKeluarItem[] = [
    {
      id: "sk-1",
      nomorSurat: "421.5/101/SMK2-KNW/VII/2026",
      tanggalSurat: "2026-07-22",
      tujuanSurat: "Yth. Orang Tua / Wali Murid Kelas X, XI, & XII SMK Negeri 2 Konawe",
      perihal: "Pemberitahuan Ketentuan Presensi Digital SIHADIR & Jam Masuk Sekolah",
      sifat: "Edaran",
      penandatangan: "Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)",
      keterangan: "Himbauan kedisiplinan dan absensi digital real-time terintegrasi WhatsApp.",
      fileName: "Edaran_Presensi_SIHADIR.pdf",
      status: "Dikirim & Diarsipkan"
    },
    {
      id: "sk-2",
      nomorSurat: "421.5/102/SMK2-KNW/VII/2026",
      tanggalSurat: "2026-07-18",
      tujuanSurat: "Yth. Pimpinan PT. Auto2000 Kendari (Toyota Sultra)",
      perihal: "Permohonan Izin Tempat Praktik Kerja Lapangan (PKL) Murid TKR",
      sifat: "Permohonan",
      penandatangan: "Andi Asrul Umar (Waka Kurikulum)",
      keterangan: "Pengiriman 8 murid Teknik Kendaraan Ringan untuk periode Agustus - November.",
      fileName: "Permohonan_PKL_Auto2000.pdf",
      status: "Dikirim & Diarsipkan"
    },
    {
      id: "sk-3",
      nomorSurat: "421.5/103/SMK2-KNW/VII/2026",
      tanggalSurat: "2026-07-14",
      tujuanSurat: "Yth. Kepala Dinas Pendidikan & Kebudayaan Prov. Sultra",
      perihal: "Laporan Periodik Sarana Prasarana & Laboratorium Komputer DKV",
      sifat: "Laporan",
      penandatangan: "Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)",
      keterangan: "Laporan kondisi riil unit komputer dan kebutuhan upgrade perangkat lunak.",
      fileName: "Laporan_Sarpras_DKV.pdf",
      status: "Dikirim & Diarsipkan"
    },
    {
      id: "sk-4",
      nomorSurat: "421.5/104/SMK2-KNW/VII/2026",
      tanggalSurat: "2026-07-08",
      tujuanSurat: "Yth. Kepala Cabang Dinas Pendidikan Wilayah I Konawe",
      perihal: "Permohonan Penambahan Pendidik Guru Produktif Teknik Otomotif",
      sifat: "Penting",
      penandatangan: "Alam, S.Pd. (Ka. TU)",
      keterangan: "Usulan formasi guru PPPK/ASN bidang keahlian Teknik Kendaraan Ringan.",
      fileName: "Permohonan_Guru_TKR.pdf",
      status: "Dikirim & Diarsipkan"
    }
  ];

  // State initialization
  const [suratMasukList, setSuratMasukList] = useState<SuratMasukItem[]>(() => {
    try {
      const saved = localStorage.getItem("sihadir_arsip_surat_masuk");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SURAT_MASUK;
  });

  const [suratKeluarList, setSuratKeluarList] = useState<SuratKeluarItem[]>(() => {
    try {
      const saved = localStorage.getItem("sihadir_arsip_surat_keluar");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SURAT_KELUAR;
  });

  // Persist local changes
  useEffect(() => {
    localStorage.setItem("sihadir_arsip_surat_masuk", JSON.stringify(suratMasukList));
  }, [suratMasukList]);

  useEffect(() => {
    localStorage.setItem("sihadir_arsip_surat_keluar", JSON.stringify(suratKeluarList));
  }, [suratKeluarList]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSifat, setFilterSifat] = useState<string>("Semua");

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Detail / Preview Modal
  const [selectedDetailItem, setSelectedDetailItem] = useState<{
    type: "masuk" | "keluar";
    data: SuratMasukItem | SuratKeluarItem;
  } | null>(null);

  // Form input states
  const [formDataMasuk, setFormDataMasuk] = useState<Partial<SuratMasukItem>>({
    nomorSurat: "",
    tanggalSurat: new Date().toISOString().split("T")[0],
    tanggalDiterima: new Date().toISOString().split("T")[0],
    pengirim: "",
    perihal: "",
    sifat: "Biasa",
    disposisi: "Disampaikan kepada Kepala Sekolah & Tata Usaha",
    keterangan: "",
    status: "Proses Disposisi",
    fileName: "Dokumen_Surat_Masuk.pdf"
  });

  const [formDataKeluar, setFormDataKeluar] = useState<Partial<SuratKeluarItem>>({
    nomorSurat: "",
    tanggalSurat: new Date().toISOString().split("T")[0],
    tujuanSurat: "",
    perihal: "",
    sifat: "Biasa",
    penandatangan: "Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)",
    keterangan: "",
    status: "Dikirim & Diarsipkan",
    fileName: "Dokumen_Surat_Keluar.pdf"
  });

  const generateAutoNoSuratKeluar = () => {
    const count = suratKeluarList.length + 1;
    const formattedCount = count < 10 ? `0${count}` : `${count}`;
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const currentMonthRoman = romanMonths[new Date().getMonth()];
    const year = new Date().getFullYear();
    return `421.5/10${formattedCount}/SMK2-KNW/${currentMonthRoman}/${year}`;
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    if (activeTab === "masuk") {
      setFormDataMasuk({
        nomorSurat: "",
        tanggalSurat: new Date().toISOString().split("T")[0],
        tanggalDiterima: new Date().toISOString().split("T")[0],
        pengirim: "",
        perihal: "",
        sifat: "Biasa",
        disposisi: "Disampaikan kepada Kepala Sekolah",
        keterangan: "",
        status: "Proses Disposisi",
        fileName: `Surat_Masuk_${Date.now().toString().slice(-4)}.pdf`
      });
    } else {
      setFormDataKeluar({
        nomorSurat: generateAutoNoSuratKeluar(),
        tanggalSurat: new Date().toISOString().split("T")[0],
        tujuanSurat: "",
        perihal: "",
        sifat: "Biasa",
        penandatangan: "Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)",
        keterangan: "",
        status: "Dikirim & Diarsipkan",
        fileName: `Surat_Keluar_${Date.now().toString().slice(-4)}.pdf`
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModalMasuk = (item: SuratMasukItem) => {
    setEditingId(item.id);
    setFormDataMasuk(item);
    setIsModalOpen(true);
  };

  const handleOpenEditModalKeluar = (item: SuratKeluarItem) => {
    setEditingId(item.id);
    setFormDataKeluar(item);
    setIsModalOpen(true);
  };

  const handleDeleteMasuk = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus arsip Surat Masuk ini?")) {
      setSuratMasukList(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleDeleteKeluar = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus arsip Surat Keluar ini?")) {
      setSuratKeluarList(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "masuk") {
      if (!formDataMasuk.nomorSurat || !formDataMasuk.pengirim || !formDataMasuk.perihal) {
        alert("Mohon lengkapi Nomor Surat, Pengirim, dan Perihal.");
        return;
      }

      if (editingId) {
        setSuratMasukList(prev =>
          prev.map(i => (i.id === editingId ? ({ ...i, ...formDataMasuk } as SuratMasukItem) : i))
        );
      } else {
        const newItem: SuratMasukItem = {
          id: `sm-${Date.now()}`,
          nomorSurat: formDataMasuk.nomorSurat!,
          tanggalSurat: formDataMasuk.tanggalSurat || new Date().toISOString().split("T")[0],
          tanggalDiterima: formDataMasuk.tanggalDiterima || new Date().toISOString().split("T")[0],
          pengirim: formDataMasuk.pengirim!,
          perihal: formDataMasuk.perihal!,
          sifat: (formDataMasuk.sifat as any) || "Biasa",
          disposisi: formDataMasuk.disposisi || "-",
          keterangan: formDataMasuk.keterangan || "-",
          fileName: formDataMasuk.fileName || "Surat_Masuk.pdf",
          status: (formDataMasuk.status as any) || "Proses Disposisi"
        };
        setSuratMasukList(prev => [newItem, ...prev]);
      }
    } else {
      if (!formDataKeluar.nomorSurat || !formDataKeluar.tujuanSurat || !formDataKeluar.perihal) {
        alert("Mohon lengkapi Nomor Surat, Tujuan Surat, dan Perihal.");
        return;
      }

      if (editingId) {
        setSuratKeluarList(prev =>
          prev.map(i => (i.id === editingId ? ({ ...i, ...formDataKeluar } as SuratKeluarItem) : i))
        );
      } else {
        const newItem: SuratKeluarItem = {
          id: `sk-${Date.now()}`,
          nomorSurat: formDataKeluar.nomorSurat!,
          tanggalSurat: formDataKeluar.tanggalSurat || new Date().toISOString().split("T")[0],
          tujuanSurat: formDataKeluar.tujuanSurat!,
          perihal: formDataKeluar.perihal!,
          sifat: (formDataKeluar.sifat as any) || "Biasa",
          penandatangan: formDataKeluar.penandatangan || "Saiman, M.Pd. (Kepala Sekolah)",
          keterangan: formDataKeluar.keterangan || "-",
          fileName: formDataKeluar.fileName || "Surat_Keluar.pdf",
          status: (formDataKeluar.status as any) || "Dikirim & Diarsipkan"
        };
        setSuratKeluarList(prev => [newItem, ...prev]);
      }
    }

    setIsModalOpen(false);
  };

  const filteredSuratMasuk = suratMasukList.filter(item => {
    const matchesSearch =
      item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pengirim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.disposisi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSifat = filterSifat === "Semua" || item.sifat === filterSifat;
    return matchesSearch && matchesSifat;
  });

  const filteredSuratKeluar = suratKeluarList.filter(item => {
    const matchesSearch =
      item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tujuanSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.penandatangan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSifat = filterSifat === "Semua" || item.sifat === filterSifat;
    return matchesSearch && matchesSifat;
  });

  const handlePrintArchive = () => {
    window.print();
  };

  const handleShareReportToWhatsApp = () => {
    const text = `*📢 LAPORAN PERSURATAN SUBBAGIAN TATA USAHA (SMK NEGERI 2 KONAWE)*\n` +
      `*Diisi oleh Staf TU:* Saktinani Djunaid & Adelia Pusparini\n` +
      `*Laporan Resmi Kepada:* Kepala Sekolah, Admin Utama (ARHAM AMIRUDDIN), Waka Kurikulum, Waka Kesiswaan\n\n` +
      `*📊 REKAPITULASI PERSURATAN:*\n` +
      `• Total Surat Masuk: ${suratMasukList.length} Berkas\n` +
      `• Total Surat Keluar: ${suratKeluarList.length} Berkas\n` +
      `• Disposisi Selesai: ${suratMasukList.filter(s => s.status.includes("Selesai")).length} Berkas\n\n` +
      `*📥 DAFTAR SURAT MASUK TERBARU:*\n` +
      suratMasukList.slice(0, 3).map((s, i) => `${i+1}. [${s.nomorSurat}] ${s.pengirim} - "${s.perihal}"`).join("\n") +
      `\n\n*📤 DAFTAR SURAT KELUAR TERBARU:*\n` +
      suratKeluarList.slice(0, 3).map((s, i) => `${i+1}. [${s.nomorSurat}] Tujuan: ${s.tujuanSurat} - "${s.perihal}"`).join("\n") +
      `\n\n_Laporan dikirim otomatis melalui Sistem Kearsipan Digital SIHADIR SMK Negeri 2 Konawe._`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <div className="space-y-6" id="arsip-surat-digital-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase px-3 py-1 rounded-lg border border-emerald-500/30 tracking-wider">
                Sistem Tata Usaha & Kearsipan Sekolah
              </span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-slate-300 font-mono text-xs">SMK NEGERI 2 KONAWE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <FolderIcon className="h-8 w-8 text-indigo-400" />
              Arsip Surat Masuk & Surat Keluar
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pengelolaan dokumen resmi, penomoran otomatis, disposisi pimpinan, dan rekapitulasi surat keluar/masuk Tata Usaha SMK Negeri 2 Konawe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePrintArchive}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4 text-emerald-400" />
              <span>Cetak / Download Rekap</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{activeTab === "masuk" ? "Tambah Surat Masuk Baru" : "Buat Surat Keluar Baru"}</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("masuk")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "masuk"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <ArrowDownLeft className={`h-4 w-4 ${activeTab === "masuk" ? "text-emerald-300" : ""}`} />
              <span>Surat Masuk ({suratMasukList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("keluar")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "keluar"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <ArrowUpRight className={`h-4 w-4 ${activeTab === "keluar" ? "text-amber-300" : ""}`} />
              <span>Surat Keluar ({suratKeluarList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rekap")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "rekap"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileCheck className={`h-4 w-4 ${activeTab === "rekap" ? "text-cyan-300" : ""}`} />
              <span>Rekap Laporan Persuratan</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Format Penomoran Baku: 421.5/xxx/SMK2-KNW/2026</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar (Search & Filters) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "masuk"
                ? "Cari berdasarkan Nomor Surat, Pengirim, Perihal, atau Disposisi..."
                : "Cari berdasarkan Nomor Surat, Tujuan Surat, Perihal, atau Penandatangan..."
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-600">
            <Filter className="h-3.5 w-3.5 text-indigo-500" />
            <span>Sifat:</span>
            <select
              value={filterSifat}
              onChange={e => setFilterSifat(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="Semua">Semua Sifat</option>
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
              <option value="Rahasia">Rahasia</option>
              <option value="Undangan">Undangan</option>
              <option value="Edaran">Edaran</option>
              <option value="Permohonan">Permohonan</option>
            </select>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border">
            Total: {activeTab === "masuk" ? filteredSuratMasuk.length : filteredSuratKeluar.length} Record
          </span>
        </div>
      </div>

      {/* MAIN TABLE CONTENT */}
      {activeTab === "masuk" ? (
        /* SURAT MASUK TABLE */
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Daftar Arsip Surat Masuk
                </h3>
                <p className="text-xs text-slate-500">
                  Register surat masuk dari instansi luar, Dinas Pendidikan, DUDI, dan masyarakat.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-4 w-28 text-center">No. Urut Surat</th>
                  <th className="p-4">Tanggal Masuk</th>
                  <th className="p-4">Nomor Surat</th>
                  <th className="p-4">Pengirim Surat</th>
                  <th className="p-4">Perihal / Judul Surat</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuratMasuk.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                      Tidak ada data surat masuk yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredSuratMasuk.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center">
                        <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          #{String(index + 1).padStart(3, "0")}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                          {item.tanggalDiterima}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        <div className="text-indigo-950 font-mono text-[11px] font-extrabold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block">
                          {item.nomorSurat}
                        </div>
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{item.pengirim}</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-2">{item.perihal}</div>
                        {item.keterangan && (
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.keterangan}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem({ type: "masuk", data: item })}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                            title="Lihat Detail & Lembar Disposisi"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModalMasuk(item)}
                            className="p-1.5 bg-slate-100 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                            title="Edit Surat Masuk"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMasuk(item.id)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "keluar" ? (
        /* SURAT KELUAR TABLE */
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Daftar Arsip Surat Keluar
                </h3>
                <p className="text-xs text-slate-500">
                  Registrasi penomoran resmi dan arsip surat keluar SMK Negeri 2 Konawe.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-4 w-28 text-center">No. Urut Surat</th>
                  <th className="p-4">Tanggal Surat</th>
                  <th className="p-4">Nomor Surat Resmi</th>
                  <th className="p-4">Tujuan Surat</th>
                  <th className="p-4">Perihal / Judul Surat</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuratKeluar.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                      Tidak ada data surat keluar yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredSuratKeluar.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center">
                        <span className="font-mono text-xs font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs">
                          #{String(index + 1).padStart(3, "0")}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Calendar className="h-3.5 w-3.5 text-amber-600" />
                          {item.tanggalSurat}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        <div className="text-indigo-950 font-mono text-[11px] font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                          {item.nomorSurat}
                        </div>
                      </td>
                      <td className="p-4 font-extrabold text-slate-900 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{item.tujuanSurat}</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-2">{item.perihal}</div>
                        {item.keterangan && (
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.keterangan}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem({ type: "keluar", data: item })}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                            title="Lihat Detail Surat Resmi"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModalKeluar(item)}
                            className="p-1.5 bg-slate-100 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                            title="Edit Surat Keluar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKeluar(item.id)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* REKAP LAPORAN PERSURATAN VIEW FOR LEADERSHIP (KEPSEK, ADMIN UTAMA, KURIKULUM, KESISWAAN) */
        <div className="space-y-6">
          {/* Executive Summary Header */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Laporan Resmi Subbagian Tata Usaha
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-500 text-xs font-bold">SMK NEGERI 2 KONAWE</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Rekapitulasi Persuratan Masuk & Surat Keluar
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Laporan pertanggungjawaban persuratan resmi sekolah untuk Kepala Sekolah, Admin Utama (ARHAM AMIRUDDIN), Waka Kurikulum, dan Waka Kesiswaan.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleShareReportToWhatsApp}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Kirim Laporan WA Pimpinan</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintArchive}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-emerald-400" />
                  <span>Cetak Dokumen Laporan</span>
                </button>
              </div>
            </div>

            {/* Recipients Badge Row */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
              <span className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider text-indigo-900">
                Penerima Laporan Lintas Jabatan:
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border text-slate-800 font-bold">
                1. Kepala Sekolah
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border text-slate-800 font-bold">
                2. ARHAM AMIRUDDIN (Admin Utama)
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border text-slate-800 font-bold">
                3. Waka Kurikulum
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border text-slate-800 font-bold">
                4. Waka Kesiswaan
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">Total Surat Masuk</span>
                <span className="text-2xl font-black text-emerald-950">{suratMasukList.length} <span className="text-xs font-bold text-emerald-700">Berkas</span></span>
                <p className="text-[10px] text-emerald-600 font-semibold">Surat dinas / instansi luar</p>
              </div>

              <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">Total Surat Keluar</span>
                <span className="text-2xl font-black text-amber-950">{suratKeluarList.length} <span className="text-xs font-bold text-amber-700">Berkas</span></span>
                <p className="text-[10px] text-amber-600 font-semibold">Surat edaran & tugas resmi</p>
              </div>

              <div className="bg-indigo-50/80 border border-indigo-200/80 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider block">Disposisi Selesai</span>
                <span className="text-2xl font-black text-indigo-950">
                  {suratMasukList.filter(s => s.status.includes("Selesai")).length} <span className="text-xs font-bold text-indigo-700">Berkas</span>
                </span>
                <p className="text-[10px] text-indigo-600 font-semibold">Telah ditindaklanjuti</p>
              </div>

              <div className="bg-rose-50/80 border border-rose-200/80 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider block">Proses Disposisi</span>
                <span className="text-2xl font-black text-rose-950">
                  {suratMasukList.filter(s => !s.status.includes("Selesai")).length} <span className="text-xs font-bold text-rose-700">Berkas</span>
                </span>
                <p className="text-[10px] text-rose-600 font-semibold">Dalam penanganan pimpinan</p>
              </div>
            </div>
          </div>

          {/* Table 1: Rekap Surat Masuk */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Laporan Rekapitulasi Surat Masuk
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sifat surat, tanggal diterima, pengirim, dan disposisi tindak lanjut pimpinan.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                {suratMasukList.length} Document
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/80 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4">Tanggal Terima</th>
                    <th className="p-4">Nomor Surat</th>
                    <th className="p-4">Pengirim</th>
                    <th className="p-4">Perihal</th>
                    <th className="p-4">Disposisi Pimpinan</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suratMasukList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{item.tanggalDiterima}</td>
                      <td className="p-4 font-mono font-bold text-indigo-900 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100 inline-block">{item.nomorSurat}</td>
                      <td className="p-4 font-extrabold text-slate-900">{item.pengirim}</td>
                      <td className="p-4 font-semibold text-slate-800 max-w-xs">{item.perihal}</td>
                      <td className="p-4 font-medium text-slate-700 max-w-xs bg-amber-50/50 p-2 rounded-lg border border-amber-100 text-[11px]">{item.disposisi}</td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                          item.status.includes("Selesai") ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Rekap Surat Keluar */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Laporan Rekapitulasi Surat Keluar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Arsip penomoran resmi, perihal, dan penandatangan surat keluar SMK Negeri 2 Konawe.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                {suratKeluarList.length} Document
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/80 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4">Tanggal Surat</th>
                    <th className="p-4">Nomor Surat Resmi</th>
                    <th className="p-4">Tujuan Surat</th>
                    <th className="p-4">Perihal / Judul</th>
                    <th className="p-4">Penandatangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suratKeluarList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{item.tanggalSurat}</td>
                      <td className="p-4 font-mono font-bold text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">{item.nomorSurat}</td>
                      <td className="p-4 font-extrabold text-slate-900 max-w-xs">{item.tujuanSurat}</td>
                      <td className="p-4 font-semibold text-slate-800 max-w-xs">{item.perihal}</td>
                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{item.penandatangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL (ADD / EDIT SURAT MASUK / KELUAR) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {editingId ? "Edit Document" : "Tambah Dokumen"} -{" "}
                      {activeTab === "masuk" ? "Arsip Surat Masuk" : "Arsip Surat Keluar"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Lengkapi data registrasi surat untuk sistem Tata Usaha SMK Negeri 2 Konawe.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                {activeTab === "masuk" ? (
                  /* FORM SURAT MASUK */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-extrabold text-slate-700 uppercase mb-1">
                          Nomor Surat Masuk *
                        </label>
                        <input
                          type="text"
                          value={formDataMasuk.nomorSurat || ""}
                          onChange={e => setFormDataMasuk({ ...formDataMasuk, nomorSurat: e.target.value })}
                          placeholder="Contoh: 005/DISDIK-PROV/700/2026"
                          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-700 uppercase mb-1">
                          Sifat / Kategori Surat
                        </label>
                        <select
                          value={formDataMasuk.sifat || "Biasa"}
                          onChange={e =>
                            setFormDataMasuk({ ...formDataMasuk, sifat: e.target.value as any })
                          }
                          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="Biasa">Biasa</option>
                          <option value="Penting">Penting</option>
                          <option value="Rahasia">Rahasia</option>
                          <option value="Undangan">Undangan</option>
                          <option value="Edaran">Edaran</option>
                          <option value="Tugas">Tugas</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-extrabold text-slate-700 uppercase mb-1">
                          Tanggal Surat
                        </label>
                        <input
                          type="date"
                          value={formDataMasuk.tanggalSurat || ""}
                          onChange={e => setFormDataMasuk({ ...formDataMasuk, tanggalSurat: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-700 uppercase mb-1">
                          Tanggal Diterima Sekolah
                        </label>
                        <input
                          type="date"
                          value={formDataMasuk.tanggalDiterima || ""}
                          onChange={e => setFormDataMasuk({ ...formDataMasuk, tanggalDiterima: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-700 uppercase mb-1">
                        Pengirim Surat (Instansi / Lembaga) *
                      </label>
                      <input
                        type="text"
                        value={formDataMasuk.pengirim || ""}
                        onChange={e => setFormDataMasuk({ ...formDataMasuk, pengirim: e.target.value })}
                        placeholder="Contoh: Dinas Pendidikan & Kebudayaan Provinsi Sultra"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-700 uppercase mb-1">
                        Perihal / Judul Surat *
                      </label>
                      <textarea
                        rows={2}
                        value={formDataMasuk.perihal || ""}
                        onChange={e => setFormDataMasuk({ ...formDataMasuk, perihal: e.target.value })}
                        placeholder="Contoh: Undangan Rapat Evaluasi Kesiapan Pembelajaran..."
                        className="w-full border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-700 uppercase mb-1">
                        Instruksi Disposisi Pimpinan / Kepsek
                      </label>
                      <input
                        type="text"
                        value={formDataMasuk.disposisi || ""}
                        onChange={e => setFormDataMasuk({ ...formDataMasuk, disposisi: e.target.value })}
                        placeholder="Contoh: Disetujui Kepsek -> Diteruskan ke Waka Kurikulum"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-700 uppercase mb-1">
                        Ringkasan / Keterangan Catatan
                      </label>
                      <input
                        type="text"
                        value={formDataMasuk.keterangan || ""}
                        onChange={e => setFormDataMasuk({ ...formDataMasuk, keterangan: e.target.value })}
                        placeholder="Tuliskan catatan singkat terkait tindak lanjut surat..."
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </>
                ) : (
                  /* FORM SURAT KELUAR */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-extrabold text-slate-700 uppercase">
                            Nomor Surat Keluar *
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormDataKeluar({ ...formDataKeluar, nomorSurat: generateAutoNoSuratKeluar() })}
                            className="text-[10px] text-indigo-600 font-bold hover:underline"
                          >
                            Auto No. SMK 2
                          </button>
                        </div>
                        <input
                          type="text"
                          value={formDataKeluar.nomorSurat || ""}
                          onChange={e => setFormDataKeluar({ ...formDataKeluar, nomorSurat: e.target.value })}
                          placeholder="421.5/101/SMK2-KNW/VII/2026"
                          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-700 uppercase mb-1">
                          Sifat Surat
                        </label>
                        <select
                          value={formDataKeluar.sifat || "Biasa"}
                          onChange={e =>
                            setFormDataKeluar({ ...formDataKeluar, sifat: e.target.value as any })
                          }
                          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="Biasa">Biasa</option>
                          <option value="Penting">Penting</option>
                          <option value="Edaran">Edaran</option>
                          <option value="Undangan">Undangan</option>
                          <option value="Permohonan">Permohonan</option>
                          <option value="Laporan">Laporan</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-extrabold text-slate-700 uppercase mb-1">
                          Tanggal Surat
                        </label>
                        <input
                          type="date"
                          value={formDataKeluar.tanggalSurat || ""}
                          onChange={e => setFormDataKeluar({ ...formDataKeluar, tanggalSurat: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-700 uppercase mb-1">
                          Penandatangan Surat
                        </label>
                        <select
                          value={formDataKeluar.penandatangan || "Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)"}
                          onChange={e => setFormDataKeluar({ ...formDataKeluar, penandatangan: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)">Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)</option>
                          <option value="Andi Asrul Umar (Waka Kurikulum)">Andi Asrul Umar (Waka Kurikulum)</option>
                          <option value="Nyoman Suliawati, S.Pd. (Waka Kesiswaan)">Nyoman Suliawati, S.Pd. (Waka Kesiswaan)</option>
                          <option value="ARHAM AMIRUDDIN, S.Pd.Gr (Admin Utama)">ARHAM AMIRUDDIN, S.Pd.Gr (Admin Utama)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-700 uppercase mb-1">
                        Tujuan Surat (Penerima) *
                      </label>
                      <input
                        type="text"
                        value={formDataKeluar.tujuanSurat || ""}
                        onChange={e => setFormDataKeluar({ ...formDataKeluar, tujuanSurat: e.target.value })}
                        placeholder="Contoh: Yth. Orang Tua / Wali Murid Kelas XI TKR A"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-700 uppercase mb-1">
                        Perihal / Judul Surat *
                      </label>
                      <textarea
                        rows={2}
                        value={formDataKeluar.perihal || ""}
                        onChange={e => setFormDataKeluar({ ...formDataKeluar, perihal: e.target.value })}
                        placeholder="Contoh: Permohonan Tempat Praktik Kerja Lapangan (PKL)..."
                        className="w-full border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-700 uppercase mb-1">
                        Catatan Keterangan Tambahan
                      </label>
                      <input
                        type="text"
                        value={formDataKeluar.keterangan || ""}
                        onChange={e => setFormDataKeluar({ ...formDataKeluar, keterangan: e.target.value })}
                        placeholder="Isikan rincian singkat perihal pengiriman surat..."
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md"
                  >
                    Simpan Ke Arsip
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL / PREVIEW MODAL */}
      <AnimatePresence>
        {selectedDetailItem && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Kop Surat Header */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  PEMERINTAH PROVINSI SULAWESI TENGGARA
                </div>
                <div className="text-[11px] font-black uppercase text-slate-800 tracking-wider">
                  DINAS PEDIDIKAN DAN KEBUDAYAAN
                </div>
                <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">
                  SMK NEGERI 2 KONAWE
                </h2>
                <p className="text-[9px] text-slate-500 font-medium">
                  Jl. Poros Unaaha - Kendari, Kab. Konawe, Sulawesi Tenggara | Kode Pos: 93411
                </p>
              </div>

              {/* Document Details */}
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-extrabold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded">
                      {selectedDetailItem.type === "masuk" ? "Surat Masuk" : "Surat Keluar"}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px] font-bold">
                      {selectedDetailItem.data.nomorSurat}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900">
                    {selectedDetailItem.data.perihal}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-white p-2 text-slate-700">
                  {selectedDetailItem.type === "masuk" ? (
                    <>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Pengirim Surat</span>
                        <span className="font-extrabold text-slate-900">
                          {(selectedDetailItem.data as SuratMasukItem).pengirim}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Tgl Masuk</span>
                        <span className="font-bold text-slate-900">
                          {(selectedDetailItem.data as SuratMasukItem).tanggalDiterima}
                        </span>
                      </div>
                      <div className="col-span-2 pt-2 border-t">
                        <span className="text-[10px] font-bold text-indigo-800 block uppercase">Lembar Disposisi</span>
                        <p className="font-semibold text-slate-800 bg-amber-50 p-3 rounded-xl border border-amber-200 mt-1">
                          {(selectedDetailItem.data as SuratMasukItem).disposisi}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Tujuan Surat</span>
                        <span className="font-extrabold text-slate-900">
                          {(selectedDetailItem.data as SuratKeluarItem).tujuanSurat}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Penandatangan</span>
                        <span className="font-bold text-slate-900">
                          {(selectedDetailItem.data as SuratKeluarItem).penandatangan}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {selectedDetailItem.data.keterangan && (
                  <div className="bg-slate-50 p-3 rounded-xl border text-slate-600">
                    <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">Catatan Keterangan</span>
                    {selectedDetailItem.data.keterangan}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <FileCheck className="h-4 w-4" />
                  <span>Dokumen Terverifikasi Subbagian Tata Usaha</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDetailItem(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );
}
