/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, BookMarked, ArrowRight, Layers, FileCode, CheckCircle, PlusCircle, AlertCircle, Sparkles } from "lucide-react";
import { CurriculumDoc } from "../types";
import { MOCK_DOCUMENTS } from "../mockData";

interface KurikulumHubProps {
  isAutomotive: boolean;
}

export function KurikulumHub({ isAutomotive }: KurikulumHubProps) {
  // Local state of curriculum documents with persistence
  const [docs, setDocs] = useState<CurriculumDoc[]>(() => {
    const saved = localStorage.getItem("simpati_curriculum_documents");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return MOCK_DOCUMENTS;
  });

  React.useEffect(() => {
    localStorage.setItem("simpati_curriculum_documents", JSON.stringify(docs));
  }, [docs]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  
  // Forms for adding documents
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<"CP" | "ATP" | "TP" | "SOP" | "TATATERTIB">("CP");
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSource, setNewSource] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }

    setSearching(true);
    setSearchResult(null);

    try {
      const response = await fetch("/api/documents/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      setSearchResult(data.text);
    } catch (error) {
      console.error("Search Error:", error);
      // Client-side fallback if server is starting or slow
      const q = searchQuery.toLowerCase();
      const matches = docs.filter(doc =>
        doc.title.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.code.toLowerCase().includes(q)
      );

      if (matches.length > 0) {
        const fallbackText = matches.map(doc => 
          `**${doc.title} (${doc.code})**\n${doc.content}\n\n*Sumber: ${doc.sourceDocument}*`
        ).join("\n\n---\n\n");
        setSearchResult(fallbackText);
      } else {
        setSearchResult("Informasi tidak ditemukan pada dokumen yang tersedia.");
      }
    } finally {
      setSearching(false);
    }
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle || !newContent || !newSource) {
      alert("Semua field formulir harus diisi!");
      return;
    }

    const newDocObj: CurriculumDoc = {
      id: "D" + (docs.length + 1).toString().padStart(2, "0"),
      type: newType,
      code: newCode,
      title: newTitle,
      content: newContent,
      sourceDocument: newSource
    };

    setDocs(prev => [...prev, newDocObj]);
    setFormSuccess("Dokumen baru berhasil disimpan ke memori sistem!");
    
    // Clear forms
    setNewCode("");
    setNewTitle("");
    setNewContent("");
    setNewSource("");

    setTimeout(() => {
      setFormSuccess("");
      setShowAddForm(false);
    }, 2000);
  };

  // Hierarchy representations
  const cpDocs = docs.filter(d => d.type === "CP");
  const atpDocs = docs.filter(d => d.type === "ATP");
  const tpDocs = docs.filter(d => d.type === "TP");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="md:col-span-3 space-y-6"
      id="kurikulum-hub-view"
    >
      {/* Title block */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-emerald-500/20">
            Fase F & Kurikulum Merdeka
          </span>
          <h2 className="text-xl font-extrabold tracking-tight mt-2 flex items-center gap-2">
            Mapping Kurikulum & SOP SMK Negeri 2 Konawe
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualisasikan keterhubungan Capaian Pembelajaran (CP) ➔ Alur Tujuan Pembelajaran (ATP) ➔ Tujuan Pembelajaran (TP).
          </p>
        </div>
        <button
          id="btn-add-doc-trigger"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md self-start md:self-auto flex items-center gap-1.5"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Input CP / ATP / TP Baru</span>
        </button>
      </div>

      {/* Add Form Container */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden"
            id="add-doc-form-panel"
          >
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
              <Layers className="h-4 w-4 text-emerald-500" />
              <span>Formulir Penginputan Dokumen Kurikulum</span>
            </h3>

            {formSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddDoc} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tipe Dokumen</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="CP">Capaian Pembelajaran (CP)</option>
                  <option value="ATP">Alur Tujuan Pembelajaran (ATP)</option>
                  <option value="TP">Tujuan Pembelajaran (TP)</option>
                  <option value="SOP">SOP Sekolah / Guru</option>
                  <option value="TATATERTIB">Tata Tertib Murid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Kode Dokumen</label>
                <input
                  type="text"
                  placeholder="Contoh: CP-TKR-02 atau TP-TKR-03"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  placeholder="Contoh: CP Pemeliharaan Kelistrikan Kendaraan Ringan"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Deskripsi / Isi Konten</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan isi keputusan atau isi detail tujuan pembelajaran di sini..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Sumber Resmi (WAJIB untuk Kutipan)</label>
                <input
                  type="text"
                  placeholder="Contoh: Kurikulum Merdeka SMK Negeri 2 Konawe - SK BK-03"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-950 font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md"
                >
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Official Document Searching Block */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
          <BookMarked className="h-4 w-4 text-emerald-500" />
          <span>Verifikasi & Cari Dokumen Sekolah Resmi (Sumber Primer)</span>
        </h3>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Cari kata kunci: e.g. 'EFI', 'SOP Presensi', 'Kelistrikan', 'K3', 'Knalpot'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white border border-slate-200 text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-950 shadow-inner"
          />
          <button
            type="submit"
            id="btn-search-docs"
            disabled={searching}
            className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md disabled:bg-slate-400"
          >
            {searching ? <motion.div className="h-3 w-3 border-2 border-white rounded-full border-t-transparent animate-spin" /> : <Search className="h-4 w-4" />}
            <span>{searching ? "Mencari..." : "Temukan"}</span>
          </button>
        </form>

        {/* Searching Results */}
        {searchResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-xl text-xs leading-relaxed border ${
              searchResult.includes("Informasi tidak ditemukan") 
                ? "bg-amber-50 text-amber-900 border-amber-200" 
                : "bg-emerald-50/50 text-slate-950 border-emerald-100/80 shadow-md shadow-emerald-500/20"
            }`}
            id="search-result-box"
          >
            {searchResult.includes("Informasi tidak ditemukan") ? (
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">Pengecekan Dokumen Sekolah gagal:</h4>
                  <p className="font-medium text-slate-600">{searchResult}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Validasi Sumber Ditemukan</span>
                </div>
                {searchResult.split("\n\n---\n\n").map((part, index) => {
                  const lines = part.split("\n");
                  const titleLine = lines[0] || "";
                  const contentLines = lines.slice(1, -1).join("\n");
                  const sourceLine = lines[lines.length - 1] || "";
                  return (
                    <div key={index} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-1.5">{titleLine.replace(/\*\*/g, "")}</h4>
                      <p className="text-slate-700 font-medium whitespace-pre-line mb-2">{contentLines}</p>
                      <div className="text-[10px] font-extrabold text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded inline-block">
                        {sourceLine.replace(/\*/g, "")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* CP ➔ ATP ➔ TP Flow Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-500" />
          <span>Interaktivitas Struktur Alur Pembelajaran Kurikulum Merdeka</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Column CP */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
            <div className="flex items-center justify-between border-b pb-2 mb-1">
              <span className="text-xs font-extrabold text-indigo-600 uppercase">1. Capaian Fase F</span>
              <BookMarked className="h-4 w-4 text-indigo-400" />
            </div>
            {cpDocs.map((doc) => (
              <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-xs hover:border-indigo-500 transition-colors">
                <div className="font-bold text-slate-900 font-mono mb-1">{doc.code}</div>
                <p className="text-slate-700 font-medium leading-relaxed">{doc.content}</p>
                <div className="mt-2 text-[10px] text-slate-400 font-bold">{doc.sourceDocument}</div>
              </div>
            ))}
          </div>

          {/* Column ATP */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
            <div className="flex items-center justify-between border-b pb-2 mb-1">
              <span className="text-xs font-extrabold text-amber-600 uppercase font-mono">2. Alur Tujuan (ATP)</span>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </div>
            {atpDocs.map((doc) => (
              <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-xs hover:border-amber-500 transition-all">
                <div className="font-bold text-slate-900 font-mono mb-1">{doc.code}</div>
                <p className="text-slate-700 leading-relaxed font-medium">{doc.content}</p>
                <div className="mt-2 text-[10px] text-slate-400 font-bold">{doc.sourceDocument}</div>
              </div>
            ))}
          </div>

          {/* Column TP */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
            <div className="flex items-center justify-between border-b pb-2 mb-1">
              <span className="text-xs font-extrabold text-emerald-600 uppercase">3. Tujuan Kerja (TP)</span>
              <FileCode className="h-4 w-4 text-emerald-400" />
            </div>
            {tpDocs.map((doc) => (
              <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-xs hover:border-emerald-500 transition-all">
                <div className="font-bold text-slate-900 font-mono mb-1">{doc.code}</div>
                <p className="text-slate-700 font-medium whitespace-pre-line leading-relaxed">{doc.content}</p>
                <div className="mt-2 text-[10px] text-slate-400 font-bold">{doc.sourceDocument}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
