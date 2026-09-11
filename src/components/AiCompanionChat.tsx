/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, RefreshCw, AlertCircle, HelpCircle, BookOpen, User, GraduationCap } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Component 1: Murid AI Tutor Chat (Refuses Direct Answers, Encourages Thought)
// -----------------------------------------------------------------------------
export function SiswaChat({ isAutomotive }: { isAutomotive: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m01",
      sender: "ai",
      text: "Halo! Saya adalah Tutor AI Belajar Mandiri. Tanyakan apa saja mengenai pelajaran hari ini! Tapi ingat ya, saya tidak akan memberitahukan jawaban instan untuk PR kamu. Sebaliknya, saya akan bimbing kamu memahami rumusnya langkah-demi-langkah agar kamu makin pintar dan kritis!",
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "MU-" + Date.now().toString(),
      sender: "user",
      text: inputText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    const inputToQuery = inputText;
    setInputText("");
    setLoading(true);

    const systemInstruction = 
      "Anda adalah Tutor AI Pembelajaran Mandiri untuk murid SMK.\n" +
      "Aturan Penting:\n" +
      "1. JANGAN PERNAH memberikan jawaban langsung atau kunci jawaban untuk penugasan/PR murid!\n" +
      "2. Selalu gunakan penjelasan konseptual yang sederhana.\n" +
      "3. Berikan analogi dunia nyata (jika otomotif: gunakan analogi aliran air untuk listrik aki/volt, analogi suntikan untuk tekanan kompresi, dsb).\n" +
      "4. Berikan pertanyaan pemicu kritis di akhir jawaban Anda untuk melatih penalaran mandiri murid.";

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: inputToQuery,
          systemInstruction,
          temperature: 0.7
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: ChatMessage = {
        id: "MAI-" + Date.now().toString(),
        sender: "ai",
        text: data.text,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      // Fallback
      let fallbackText = "Wah, koneksi kita sedikit kendala nih! Tapi mari kita diskusikan logikanya. ";
      if (isAutomotive && inputToQuery.toLowerCase().includes("efi")) {
        fallbackText += "Untuk sistem EFI, bayangkan injektor itu seperti kepala semprotan obat parfum otomatis. Semakin lama pompanya menekan, semakin banyak uap cairan yang menyembur keluar (ini namanya width pulse). Nah, dengan gambaran ini, kira-kira apa yang terjadi kalau sensor udara mengabarkan bahwa udara yang masuk sedang luar biasa padat?";
      } else {
        fallbackText += "Mari bayangkan analogi sederhananya: jika ada hambatannya semakin besar, menurutmu apakah aliran air di pipa tersebut akan lancar atau malah tersendat?";
      }

      setMessages(prev => [
        ...prev,
        {
          id: "MAI-F-" + Date.now().toString(),
          sender: "ai",
          text: fallbackText,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]" id="murid-chat-box">
      
      {/* Header bar */}
      <div className="bg-slate-900 text-white px-4 py-3 text-xs font-bold rounded-t-2xl flex items-center justify-between border-b">
        <span className="flex items-center gap-1.5 font-sans uppercase">
          <GraduationCap className="h-4 w-4 text-emerald-400" />
          <span>Tutor AI Murid (Panduan Belajar Mandiri)</span>
        </span>
        <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded font-mono font-bold">Kritis & Analitik</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs font-medium leading-relaxed shadow-sm ${
                m.sender === "user"
                  ? "bg-slate-950 text-white rounded-tr-none"
                  : "bg-white text-slate-850 border border-slate-200/80 rounded-tl-none whitespace-pre-line"
              }`}
            >
              <div className="text-[9px] text-slate-400 font-extrabold pb-0.5 uppercase mb-1 border-b border-slate-150/40">
                {m.sender === "user" ? "Kamu (Murid)" : "Tutor AI Pembina"}
              </div>
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 text-xs p-3.5 rounded-2xl border border-dashed flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin text-emerald-500" />
              <span>Tutor sedang merumuskan analogi berpikir...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Inputs bar */}
      <form onSubmit={handleSendMessage} className="p-3 border-t bg-white rounded-b-2xl flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tanyakan PR atau Teori Mekanis Anda di sini..."
          className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-950 hover:bg-slate-800 text-white p-2.5 rounded-xl cursor-pointer shadow disabled:bg-slate-400"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}


// -----------------------------------------------------------------------------
// Component 2: Guru AI Assistant Chat (Administrative & Innovative Teaching)
// -----------------------------------------------------------------------------
export function GuruChat({ isAutomotive }: { isAutomotive: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "mg01",
      sender: "ai",
      text: "Selamat datang Bapak/Ibu Pendidik! Saya adalah Asisten Profesional Guru SIMPATI AI. Saya siap membantu menyusun kurikulum, memberikan sanksi pembiasaan positif berdiferensiasi bagi murid yang bandel, mencarikan contoh alat peraga inovatif, menyusun format modul ajar tercepat, hingga troubleshooting bengkel. Ada administrasi mengajar apa yang bisa saya ringankan hari ini?",
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "MUG-" + Date.now().toString(),
      sender: "user",
      text: inputText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    const inputToQuery = inputText;
    setInputText("");
    setLoading(true);

    const systemInstruction = 
      "Anda adalah Asisten Profesional Guru SIMPATI AI, ahli kurikulum Merdeka Belajar (SMK Pusat Keunggulan).\n" +
      "Berikan solusi yang sangat taktis, akurat secara akademis, dan ramah pendidik. Bantu meringankan beban administrasi guru.\n" +
      (isAutomotive ? "KHUSUS OTOMOTIF: Bantu guru produktif merumuskan pemelajaran bengkel, diagram kelistrikan ringkas, penanganan kegagalan engine, dan asessmen K3 secara rinci." : "");

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: inputToQuery,
          systemInstruction,
          temperature: 0.8
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: ChatMessage = {
        id: "MAIG-" + Date.now().toString(),
        sender: "ai",
        text: data.text,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      // Fallback
      let fallbackText = "Koneksi ke pangkalan data AI mengalami antrean server, namun mari kita rumuskan sarannya dari SOP Merdeka Belajar. ";
      if (inputToQuery.toLowerCase().includes("remedial") || inputToQuery.toLowerCase().includes("nilai")) {
        fallbackText += "Untuk remedial kelas TKR, salah satu metode inovatif terbaik adalah melakukan 'Peer Tutoring' (Tutor Sebaya). Mintalah murid yang lulus di atas KKTP (misalnya Dedi) mendampingi Bagus dalam praktikum perakitan multimeter harian. Ini melatih gotong royong sekaligus memotong beban waktu membimbing guru.";
      } else {
        fallbackText += "Cobalah menerapkan pembelajaran berbasis asessmen diagnostik non-kognitif, berikan pengelompokan berdasarkan gaya belajar visual, kinestetik, dan auditor-teoritis.";
      }

      setMessages(prev => [
        ...prev,
        {
          id: "MAIG-F-" + Date.now().toString(),
          sender: "ai",
          text: fallbackText,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]" id="guru-chat-box">
      
      {/* Header bar */}
      <div className="bg-slate-900 text-white px-4 py-3 text-xs font-bold rounded-t-2xl flex items-center justify-between border-b">
        <span className="flex items-center gap-1.5 font-sans uppercase">
          <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span>Asisten Profesional Guru (SIMPATI AI Hub)</span>
        </span>
        <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded font-mono font-bold">Admin & Rencana Ajar</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 font-sans">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs font-medium leading-relaxed shadow-sm ${
                m.sender === "user"
                  ? "bg-slate-950 text-white rounded-tr-none"
                  : "bg-white text-slate-850 border border-slate-200/80 rounded-tl-none whitespace-pre-line"
              }`}
            >
              <div className="text-[9px] text-slate-405 font-extrabold pb-0.5 uppercase mb-1 border-b border-slate-150/40">
                {m.sender === "user" ? "Kamu (Pendidik)" : "Asisten Akademik SIMPATI"}
              </div>
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 text-xs p-3.5 rounded-2xl border border-dashed flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin text-emerald-500" />
              <span>Asisten sedang membedah modul kurikulum ...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Inputs bar */}
      <form onSubmit={handleSendMessage} className="p-3 border-t bg-white rounded-b-2xl flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Minta saran sanksi positif, RPP, format nilai di sini..."
          className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-950 hover:bg-slate-800 text-white p-2.5 rounded-xl cursor-pointer shadow disabled:bg-slate-400"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
