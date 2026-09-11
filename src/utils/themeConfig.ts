export type ThemeId =
  | "blue-white"
  | "pure-green"
  | "pure-light"
  | "pure-dark"
  | "blue"
  | "green"
  | "dark-blue"
  | "gradient"
  | "sunset"
  | "aurora"
  | "cyberpunk"
  | "ocean"
  | "rose-gold";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  category: "Warna Solid (Bukan Gradasi)" | "Gradasi Keren" | "Gelap & Cyber" | "Klasik & Elegan";
  previewClass: string;
  iconColor: string;
  
  // Login Screen Styles
  login: {
    bgClass: string;
    decorations: {
      blob1: string;
      blob2: string;
      blob3: string;
    };
    brandTextClass: string;
    brandSubClass: string;
    isLight: boolean;
    card: {
      cardBg: string;
      title: string;
      desc: string;
      label: string;
      inputBg: string;
      inputIcon: string;
      selectArrow: string;
      badge: string;
      dividerLine: string;
      dividerText: string;
      demoTitle: string;
      presetBg: string;
      presetName: string;
      presetUser: string;
      presetDesc: string;
      footerText: string;
      footerBadge: string;
      submitBtn: string;
    };
  };

  // Inside App Styles (Matching Login Palette 1:1)
  app: {
    rootBg: string;
    decorations: {
      blob1: string;
      blob2: string;
      blob3: string;
    };
    headerBg: string;
    titleText: string;
    subText: string;
    badge1: string;
    badge2: string;
    controlBox: string;
    userName: string;
    userRole: string;
    mainWrapper: string;
    footerBg: string;
    footerServer: string;
    sidebarBg: string;
    isLight: boolean;
  };
}

export const SIHADIR_THEMES: Record<ThemeId, ThemeDefinition> = {
  // ==========================================
  // 1. SOLID: BIRU PADUAN PUTIH
  // ==========================================
  "blue-white": {
    id: "blue-white",
    name: "Biru Paduan Putih",
    tagline: "Solid Biru Royal dengan Kontras Putih Murni",
    category: "Warna Solid (Bukan Gradasi)",
    previewClass: "bg-[#1e40af] border-2 border-white",
    iconColor: "text-blue-500",
    login: {
      bgClass: "bg-[#1e40af]",
      decorations: {
        blob1: "bg-white/10",
        blob2: "bg-white/5",
        blob3: "bg-sky-300/10",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-blue-100",
      isLight: false,
      card: {
        cardBg: "bg-white border-2 border-blue-200 shadow-2xl shadow-blue-950/40",
        title: "text-[#1e3a8a] font-black",
        desc: "text-slate-600",
        label: "text-[#1e3a8a] font-bold",
        inputBg: "bg-slate-50 border border-blue-200 text-slate-900 focus:border-[#1e40af] focus:ring-[#1e40af]",
        inputIcon: "text-[#1e40af]",
        selectArrow: "text-[#1e40af]",
        badge: "bg-[#1e40af] text-white font-bold",
        dividerLine: "border-slate-200",
        dividerText: "text-[#1e3a8a] bg-white border-slate-200 font-bold",
        demoTitle: "text-[#1e3a8a]",
        presetBg: "bg-blue-50/60 hover:bg-blue-100/70 border-blue-200 hover:border-[#1e40af]",
        presetName: "text-slate-900",
        presetUser: "text-[#1e40af]",
        presetDesc: "text-slate-600",
        footerText: "text-slate-600 border-slate-200",
        footerBadge: "bg-blue-100 border-blue-200 text-[#1e40af]",
        submitBtn: "bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-black shadow-lg shadow-blue-950/30 border border-blue-700",
      },
    },
    app: {
      rootBg: "bg-[#1e40af] font-sans flex flex-col md:flex-row antialiased min-h-screen text-slate-900 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-white/10",
        blob2: "bg-white/5",
        blob3: "bg-sky-300/10",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-[#172554] border-b-2 border-blue-400 text-white shadow-xl sticky top-0 z-40 gap-4",
      titleText: "text-white font-black",
      subText: "text-blue-100",
      badge1: "bg-white text-[#1e40af] border border-white font-black",
      badge2: "bg-blue-800 text-blue-100 border border-blue-400",
      controlBox: "bg-[#1e3a8a] border border-blue-300 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-blue-200 font-bold mt-0.5",
      mainWrapper: "bg-white/98 rounded-2xl p-3 md:p-5 shadow-2xl border-2 border-blue-200 space-y-4 flex-1 text-slate-900",
      footerBg: "bg-[#172554] border-t border-blue-800 text-blue-100 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-blue-200",
      sidebarBg: "bg-[#172554] text-white border-r-2 border-blue-800 shadow-xl",
      isLight: false,
    },
  },

  // ==========================================
  // 2. SOLID: HIJAU SAJA (Pure Green)
  // ==========================================
  "pure-green": {
    id: "pure-green",
    name: "Hijau Saja (Solid)",
    tagline: "Solid Hijau Botol Alami Tanpa Gradasi",
    category: "Warna Solid (Bukan Gradasi)",
    previewClass: "bg-[#15803d]",
    iconColor: "text-emerald-500",
    login: {
      bgClass: "bg-[#15803d]",
      decorations: {
        blob1: "bg-white/10",
        blob2: "bg-emerald-300/15",
        blob3: "bg-white/5",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-emerald-100",
      isLight: false,
      card: {
        cardBg: "bg-white border-2 border-emerald-200 shadow-2xl shadow-emerald-950/40",
        title: "text-[#14532d] font-black",
        desc: "text-slate-600",
        label: "text-[#14532d] font-bold",
        inputBg: "bg-slate-50 border border-emerald-200 text-slate-900 focus:border-[#15803d] focus:ring-[#15803d]",
        inputIcon: "text-[#15803d]",
        selectArrow: "text-[#15803d]",
        badge: "bg-[#15803d] text-white font-bold",
        dividerLine: "border-slate-200",
        dividerText: "text-[#14532d] bg-white border-slate-200 font-bold",
        demoTitle: "text-[#14532d]",
        presetBg: "bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-200 hover:border-[#15803d]",
        presetName: "text-slate-900",
        presetUser: "text-[#15803d]",
        presetDesc: "text-slate-600",
        footerText: "text-slate-600 border-slate-200",
        footerBadge: "bg-emerald-100 border-emerald-200 text-[#15803d]",
        submitBtn: "bg-[#15803d] hover:bg-[#16a34a] text-white font-black shadow-lg shadow-emerald-950/30 border border-emerald-700",
      },
    },
    app: {
      rootBg: "bg-[#15803d] font-sans flex flex-col md:flex-row antialiased min-h-screen text-slate-900 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-white/10",
        blob2: "bg-emerald-300/15",
        blob3: "bg-white/5",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-[#14532d] border-b-2 border-emerald-400 text-white shadow-xl sticky top-0 z-40 gap-4",
      titleText: "text-white font-black",
      subText: "text-emerald-100",
      badge1: "bg-white text-[#15803d] border border-white font-black",
      badge2: "bg-emerald-800 text-emerald-100 border border-emerald-400",
      controlBox: "bg-[#166534] border border-emerald-300 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-emerald-200 font-bold mt-0.5",
      mainWrapper: "bg-white/98 rounded-2xl p-3 md:p-5 shadow-2xl border-2 border-emerald-200 space-y-4 flex-1 text-slate-900",
      footerBg: "bg-[#14532d] border-t border-emerald-800 text-emerald-100 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-emerald-200",
      sidebarBg: "bg-[#14532d] text-white border-r-2 border-emerald-800 shadow-xl",
      isLight: false,
    },
  },

  // ==========================================
  // 3. SOLID: LIGHT (Putih Terang)
  // ==========================================
  "pure-light": {
    id: "pure-light",
    name: "Light Solid (Putih)",
    tagline: "Solid Putih Terang & Bersih Standar Administrasi",
    category: "Warna Solid (Bukan Gradasi)",
    previewClass: "bg-[#f8fafc] border-2 border-slate-300",
    iconColor: "text-slate-600",
    login: {
      bgClass: "bg-[#f1f5f9]",
      decorations: {
        blob1: "bg-slate-300/30",
        blob2: "bg-blue-200/25",
        blob3: "bg-slate-200/40",
      },
      brandTextClass: "text-slate-900",
      brandSubClass: "text-slate-600",
      isLight: true,
      card: {
        cardBg: "bg-white border border-slate-300 shadow-2xl shadow-slate-400/30",
        title: "text-slate-950 font-black",
        desc: "text-slate-600",
        label: "text-slate-800 font-bold",
        inputBg: "bg-[#f8fafc] border border-slate-300 text-slate-900 focus:border-slate-900 focus:ring-slate-900",
        inputIcon: "text-slate-600",
        selectArrow: "text-slate-600",
        badge: "bg-slate-900 text-white font-bold",
        dividerLine: "border-slate-200",
        dividerText: "text-slate-600 bg-white border-slate-200 font-bold",
        demoTitle: "text-slate-700",
        presetBg: "bg-[#f8fafc] hover:bg-slate-100 border-slate-200 hover:border-slate-400",
        presetName: "text-slate-900",
        presetUser: "text-slate-700",
        presetDesc: "text-slate-600",
        footerText: "text-slate-600 border-slate-200",
        footerBadge: "bg-slate-100 border-slate-300 text-slate-800",
        submitBtn: "bg-slate-900 hover:bg-slate-800 text-white font-black shadow-lg shadow-slate-400/40 border border-slate-950",
      },
    },
    app: {
      rootBg: "bg-[#f1f5f9] font-sans flex flex-col md:flex-row antialiased min-h-screen text-slate-900 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-slate-300/30",
        blob2: "bg-blue-200/25",
        blob3: "bg-slate-200/40",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-white border-b border-slate-300 text-slate-900 shadow-sm sticky top-0 z-40 gap-4",
      titleText: "text-slate-950 font-black",
      subText: "text-slate-600 font-bold",
      badge1: "bg-slate-900 text-white border border-slate-900 font-black",
      badge2: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold",
      controlBox: "bg-slate-100 border border-slate-300 text-slate-900",
      userName: "text-xs font-black text-slate-900",
      userRole: "text-[10px] text-slate-600 font-bold mt-0.5",
      mainWrapper: "bg-white rounded-2xl p-3 md:p-5 shadow-lg border border-slate-300 space-y-4 flex-1 text-slate-900",
      footerBg: "bg-slate-200 border-t border-slate-300 text-slate-700 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-slate-600",
      sidebarBg: "bg-white text-slate-900 border-r border-slate-300 shadow-md",
      isLight: true,
    },
  },

  // ==========================================
  // 4. SOLID: DARK (Hitam Pekat Solid)
  // ==========================================
  "pure-dark": {
    id: "pure-dark",
    name: "Dark Solid (Hitam)",
    tagline: "Solid Hitam Pekat Tanpa Gradasi (OLED Friendly)",
    category: "Warna Solid (Bukan Gradasi)",
    previewClass: "bg-[#09090b] border-2 border-zinc-700",
    iconColor: "text-zinc-400",
    login: {
      bgClass: "bg-[#09090b]",
      decorations: {
        blob1: "bg-white/5",
        blob2: "bg-zinc-800/40",
        blob3: "bg-white/5",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-zinc-300",
      isLight: false,
      card: {
        cardBg: "bg-[#18181b] border-2 border-zinc-700 shadow-2xl shadow-black",
        title: "text-white font-black",
        desc: "text-zinc-300",
        label: "text-zinc-200 font-bold",
        inputBg: "bg-[#09090b] border border-zinc-700 text-white focus:border-zinc-400 focus:ring-zinc-400 [color-scheme:dark]",
        inputIcon: "text-zinc-400",
        selectArrow: "text-zinc-400",
        badge: "bg-zinc-100 text-zinc-900 font-bold",
        dividerLine: "border-zinc-700",
        dividerText: "text-zinc-300 bg-[#18181b] border-zinc-700 font-bold",
        demoTitle: "text-zinc-300",
        presetBg: "bg-[#09090b] hover:bg-zinc-800 border-zinc-700 hover:border-zinc-500",
        presetName: "text-white",
        presetUser: "text-zinc-300",
        presetDesc: "text-zinc-400",
        footerText: "text-zinc-400 border-zinc-700",
        footerBadge: "bg-zinc-900 border-zinc-700 text-zinc-300",
        submitBtn: "bg-zinc-100 hover:bg-white text-zinc-950 font-black shadow-lg shadow-black/50 border border-zinc-300",
      },
    },
    app: {
      rootBg: "bg-[#09090b] font-sans flex flex-col md:flex-row antialiased min-h-screen text-zinc-100 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-white/5",
        blob2: "bg-zinc-800/40",
        blob3: "bg-white/5",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-[#18181b] border-b-2 border-zinc-700 text-white shadow-xl sticky top-0 z-40 gap-4",
      titleText: "text-white font-black",
      subText: "text-zinc-300",
      badge1: "bg-white text-zinc-950 border border-white font-black",
      badge2: "bg-zinc-800 text-zinc-200 border border-zinc-600 font-bold",
      controlBox: "bg-[#09090b] border border-zinc-700 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-zinc-400 font-bold mt-0.5",
      mainWrapper: "bg-[#18181b] rounded-2xl p-3 md:p-5 shadow-2xl border-2 border-zinc-700 space-y-4 flex-1 text-zinc-100",
      footerBg: "bg-[#09090b] border-t border-zinc-800 text-zinc-400 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-zinc-400",
      sidebarBg: "bg-[#121215] text-zinc-100 border-r-2 border-zinc-800 shadow-2xl",
      isLight: false,
    },
  },

  // ==========================================
  // 5. GRADASI: COSMIC INDIGO
  // ==========================================
  gradient: {
    id: "gradient",
    name: "Cosmic Indigo",
    tagline: "Gradasi Kosmik Sky, Indigo & Violet",
    category: "Gradasi Keren",
    previewClass: "bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600",
    iconColor: "text-indigo-400",
    login: {
      bgClass: "bg-gradient-to-br from-sky-500 via-indigo-700 via-purple-900 to-slate-950",
      decorations: {
        blob1: "bg-sky-400/25",
        blob2: "bg-purple-600/30",
        blob3: "bg-indigo-400/20",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-indigo-200/90",
      isLight: false,
      card: {
        cardBg: "bg-slate-900/85 backdrop-blur-xl border-indigo-500/40 shadow-2xl shadow-indigo-950/60",
        title: "text-white font-black",
        desc: "text-indigo-200",
        label: "text-indigo-200 font-bold",
        inputBg: "bg-slate-950/80 border-indigo-500/40 text-white focus:border-indigo-400 focus:ring-indigo-400 [color-scheme:dark]",
        inputIcon: "text-indigo-400",
        selectArrow: "text-indigo-400",
        badge: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold",
        dividerLine: "border-indigo-500/30",
        dividerText: "text-indigo-200 bg-slate-900 border-indigo-500/30",
        demoTitle: "text-indigo-200",
        presetBg: "bg-white/5 hover:bg-white/12 border-indigo-500/25 hover:border-indigo-400",
        presetName: "text-white",
        presetUser: "text-indigo-300",
        presetDesc: "text-indigo-200/80",
        footerText: "text-indigo-200 border-indigo-500/30",
        footerBadge: "bg-indigo-950/70 border-indigo-500/30 text-indigo-300",
        submitBtn: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black shadow-lg shadow-indigo-950/50 border border-indigo-400/40",
      },
    },
    app: {
      rootBg: "bg-gradient-to-br from-sky-500 via-indigo-700 via-purple-900 to-slate-950 font-sans flex flex-col md:flex-row antialiased min-h-screen text-slate-100 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-sky-400/25",
        blob2: "bg-purple-600/30",
        blob3: "bg-indigo-400/20",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-slate-950/90 backdrop-blur-xl border-b border-indigo-500/30 text-white shadow-xl sticky top-0 z-40 gap-4",
      titleText: "text-white",
      subText: "text-indigo-200/90",
      badge1: "bg-indigo-900/80 text-indigo-100 border border-indigo-500/50",
      badge2: "bg-purple-500/20 text-purple-300 border border-purple-400/40",
      controlBox: "bg-slate-900/80 border border-indigo-500/40 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-indigo-300 font-bold mt-0.5",
      mainWrapper: "bg-slate-900/90 rounded-2xl p-3 md:p-5 shadow-2xl border border-indigo-500/30 backdrop-blur-md space-y-4 flex-1 text-slate-100",
      footerBg: "bg-slate-950 border-t border-indigo-900/60 text-indigo-200 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-indigo-300",
      sidebarBg: "bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950 text-white border-r border-indigo-500/30 shadow-2xl",
      isLight: false,
    },
  },

  // ==========================================
  // 6. GRADASI: SUNSET EMBER
  // ==========================================
  sunset: {
    id: "sunset",
    name: "Sunset Ember",
    tagline: "Gradasi Sunset Hangat, Amber & Crimson",
    category: "Gradasi Keren",
    previewClass: "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600",
    iconColor: "text-amber-400",
    login: {
      bgClass: "bg-gradient-to-br from-amber-600 via-orange-700 via-rose-900 to-slate-950",
      decorations: {
        blob1: "bg-amber-400/25",
        blob2: "bg-rose-500/30",
        blob3: "bg-orange-400/20",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-amber-100/90",
      isLight: false,
      card: {
        cardBg: "bg-slate-900/85 backdrop-blur-xl border-orange-500/40 shadow-2xl shadow-orange-950/60",
        title: "text-white font-black",
        desc: "text-amber-200",
        label: "text-amber-200 font-bold",
        inputBg: "bg-slate-950/80 border-orange-500/40 text-white focus:border-amber-400 focus:ring-amber-400 [color-scheme:dark]",
        inputIcon: "text-amber-400",
        selectArrow: "text-amber-400",
        badge: "bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold",
        dividerLine: "border-orange-500/30",
        dividerText: "text-amber-200 bg-slate-900 border-orange-500/30",
        demoTitle: "text-amber-200",
        presetBg: "bg-white/5 hover:bg-white/12 border-orange-500/25 hover:border-amber-400",
        presetName: "text-white",
        presetUser: "text-amber-300",
        presetDesc: "text-amber-100/80",
        footerText: "text-amber-200 border-orange-500/30",
        footerBadge: "bg-orange-950/70 border-orange-500/30 text-amber-300",
        submitBtn: "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black shadow-lg shadow-orange-950/50 border border-amber-400/40",
      },
    },
    app: {
      rootBg: "bg-gradient-to-br from-amber-600 via-orange-700 via-rose-900 to-slate-950 font-sans flex flex-col md:flex-row antialiased min-h-screen text-stone-100 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-amber-400/25",
        blob2: "bg-rose-500/30",
        blob3: "bg-orange-400/20",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-slate-950/90 backdrop-blur-xl border-b border-orange-500/30 text-white shadow-xl sticky top-0 z-40 gap-4",
      titleText: "text-white",
      subText: "text-amber-200/90",
      badge1: "bg-orange-950/80 text-amber-100 border border-orange-500/50",
      badge2: "bg-rose-500/20 text-rose-300 border border-rose-400/40",
      controlBox: "bg-slate-900/80 border border-orange-500/40 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-amber-400 font-bold mt-0.5",
      mainWrapper: "bg-slate-900/90 rounded-2xl p-3 md:p-5 shadow-2xl border border-orange-500/30 backdrop-blur-md space-y-4 flex-1 text-stone-100",
      footerBg: "bg-slate-950 border-t border-orange-900/60 text-amber-200 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-amber-300",
      sidebarBg: "bg-gradient-to-b from-slate-950 via-stone-950 to-rose-950 text-white border-r border-orange-500/30 shadow-2xl",
      isLight: false,
    },
  },

  // ==========================================
  // 7. GRADASI: AURORA BOREALIS
  // ==========================================
  aurora: {
    id: "aurora",
    name: "Aurora Borealis",
    tagline: "Pancaran Cahaya Kutub Teal, Mint & Cyan",
    category: "Gradasi Keren",
    previewClass: "bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500",
    iconColor: "text-teal-300",
    login: {
      bgClass: "bg-gradient-to-br from-teal-700 via-slate-900 via-emerald-900 to-cyan-950",
      decorations: {
        blob1: "bg-teal-400/25",
        blob2: "bg-cyan-400/25",
        blob3: "bg-emerald-400/20",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-teal-200/90",
      isLight: false,
      card: {
        cardBg: "bg-slate-900/85 backdrop-blur-xl border-teal-500/40 shadow-2xl shadow-teal-950/60",
        title: "text-white font-black",
        desc: "text-teal-200",
        label: "text-teal-200 font-bold",
        inputBg: "bg-slate-950/80 border-teal-500/40 text-white focus:border-teal-400 focus:ring-teal-400 [color-scheme:dark]",
        inputIcon: "text-teal-400",
        selectArrow: "text-teal-400",
        badge: "bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold",
        dividerLine: "border-teal-500/30",
        dividerText: "text-teal-200 bg-slate-900 border-teal-500/30",
        demoTitle: "text-teal-200",
        presetBg: "bg-white/5 hover:bg-white/12 border-teal-500/25 hover:border-teal-400",
        presetName: "text-white",
        presetUser: "text-teal-300",
        presetDesc: "text-teal-100/80",
        footerText: "text-teal-200 border-teal-500/30",
        footerBadge: "bg-teal-950/70 border-teal-500/30 text-teal-300",
        submitBtn: "bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-black shadow-lg shadow-teal-950/50 border border-teal-400/40",
      },
    },
    app: {
      rootBg: "bg-gradient-to-br from-teal-700 via-slate-900 via-emerald-900 to-cyan-950 font-sans flex flex-col md:flex-row antialiased min-h-screen text-teal-100 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-teal-400/25",
        blob2: "bg-cyan-400/25",
        blob3: "bg-emerald-400/20",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-slate-950/90 backdrop-blur-xl border-b border-teal-500/30 text-white shadow-xl sticky top-0 z-40 gap-4",
      titleText: "text-white",
      subText: "text-teal-200/90",
      badge1: "bg-teal-950/80 text-teal-100 border border-teal-500/50",
      badge2: "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40",
      controlBox: "bg-slate-900/80 border border-teal-500/40 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-teal-300 font-bold mt-0.5",
      mainWrapper: "bg-slate-900/90 rounded-2xl p-3 md:p-5 shadow-2xl border border-teal-500/30 backdrop-blur-md space-y-4 flex-1 text-teal-100",
      footerBg: "bg-slate-950 border-t border-teal-900/60 text-teal-200 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-teal-300",
      sidebarBg: "bg-gradient-to-b from-slate-950 via-teal-950 to-slate-950 text-white border-r border-teal-500/30 shadow-2xl",
      isLight: false,
    },
  },

  // ==========================================
  // 8. GRADASI: CYBER NEON
  // ==========================================
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyber Neon",
    tagline: "Futuristik Fuchsia, Magenta & Electric Cyan",
    category: "Gelap & Cyber",
    previewClass: "bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-400",
    iconColor: "text-fuchsia-400",
    login: {
      bgClass: "bg-gradient-to-br from-purple-950 via-slate-950 via-fuchsia-950 to-slate-950",
      decorations: {
        blob1: "bg-fuchsia-500/25",
        blob2: "bg-cyan-500/25",
        blob3: "bg-purple-500/20",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-fuchsia-200/90",
      isLight: false,
      card: {
        cardBg: "bg-slate-950/90 backdrop-blur-xl border-fuchsia-500/40 shadow-2xl shadow-fuchsia-950/60",
        title: "text-white font-black",
        desc: "text-fuchsia-200",
        label: "text-fuchsia-200 font-bold",
        inputBg: "bg-black/80 border-fuchsia-500/40 text-white focus:border-fuchsia-400 focus:ring-fuchsia-400 [color-scheme:dark]",
        inputIcon: "text-fuchsia-400",
        selectArrow: "text-fuchsia-400",
        badge: "bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-slate-950 font-black",
        dividerLine: "border-fuchsia-500/30",
        dividerText: "text-fuchsia-200 bg-slate-950 border-fuchsia-500/30",
        demoTitle: "text-fuchsia-200",
        presetBg: "bg-white/5 hover:bg-white/12 border-fuchsia-500/25 hover:border-fuchsia-400",
        presetName: "text-white",
        presetUser: "text-fuchsia-300",
        presetDesc: "text-fuchsia-100/80",
        footerText: "text-fuchsia-200 border-fuchsia-500/30",
        footerBadge: "bg-fuchsia-950/70 border-fuchsia-500/30 text-fuchsia-300",
        submitBtn: "bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-400 hover:from-fuchsia-400 hover:to-cyan-300 text-white font-black shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40",
      },
    },
    app: {
      rootBg: "bg-gradient-to-br from-purple-950 via-slate-950 via-fuchsia-950 to-slate-950 font-sans flex flex-col md:flex-row antialiased min-h-screen text-fuchsia-50 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-fuchsia-500/25",
        blob2: "bg-cyan-500/25",
        blob3: "bg-purple-500/20",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-black/90 backdrop-blur-xl border-b border-fuchsia-500/30 text-white shadow-xl sticky top-0 z-40 gap-4",
      titleText: "text-white",
      subText: "text-fuchsia-200/90",
      badge1: "bg-fuchsia-950/80 text-fuchsia-100 border border-fuchsia-500/50",
      badge2: "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40",
      controlBox: "bg-slate-950/80 border border-fuchsia-500/40 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-fuchsia-400 font-bold mt-0.5",
      mainWrapper: "bg-slate-950/90 rounded-2xl p-3 md:p-5 shadow-2xl border border-fuchsia-500/30 backdrop-blur-md space-y-4 flex-1 text-fuchsia-50",
      footerBg: "bg-black border-t border-fuchsia-900/60 text-fuchsia-200 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-fuchsia-300",
      sidebarBg: "bg-gradient-to-b from-black via-slate-950 to-purple-950 text-white border-r border-fuchsia-500/30 shadow-2xl",
      isLight: false,
    },
  },

  // ==========================================
  // 9. GRADASI: OCEAN DEEP
  // ==========================================
  ocean: {
    id: "ocean",
    name: "Ocean Deep",
    tagline: "Kedalaman Samudra Biru Laut & Aquamarine",
    category: "Gradasi Keren",
    previewClass: "bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-700",
    iconColor: "text-cyan-400",
    login: {
      bgClass: "bg-gradient-to-br from-cyan-800 via-blue-900 via-sky-950 to-slate-950",
      decorations: {
        blob1: "bg-cyan-400/25",
        blob2: "bg-blue-500/30",
        blob3: "bg-sky-400/20",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-cyan-100/90",
      isLight: false,
      card: {
        cardBg: "bg-slate-900/85 backdrop-blur-xl border-cyan-500/40 shadow-2xl shadow-cyan-950/60",
        title: "text-white font-black",
        desc: "text-cyan-200",
        label: "text-cyan-200 font-bold",
        inputBg: "bg-slate-950/80 border-cyan-500/40 text-white focus:border-cyan-400 focus:ring-cyan-400 [color-scheme:dark]",
        inputIcon: "text-cyan-400",
        selectArrow: "text-cyan-400",
        badge: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold",
        dividerLine: "border-cyan-500/30",
        dividerText: "text-cyan-200 bg-slate-900 border-cyan-500/30",
        demoTitle: "text-cyan-200",
        presetBg: "bg-white/5 hover:bg-white/12 border-cyan-500/25 hover:border-cyan-400",
        presetName: "text-white",
        presetUser: "text-cyan-300",
        presetDesc: "text-cyan-100/80",
        footerText: "text-cyan-200 border-cyan-500/30",
        footerBadge: "bg-cyan-950/70 border-cyan-500/30 text-cyan-300",
        submitBtn: "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black shadow-lg shadow-cyan-950/50 border border-cyan-400/40",
      },
    },
    app: {
      rootBg: "bg-gradient-to-br from-cyan-800 via-blue-900 via-sky-950 to-slate-950 font-sans flex flex-col md:flex-row antialiased min-h-screen text-cyan-50 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-cyan-400/25",
        blob2: "bg-blue-500/30",
        blob3: "bg-sky-400/20",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/30 text-white shadow-xl sticky top-0 z-40 gap-4",
      titleText: "text-white",
      subText: "text-cyan-200/90",
      badge1: "bg-blue-950/80 text-cyan-100 border border-cyan-500/50",
      badge2: "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40",
      controlBox: "bg-slate-900/80 border border-cyan-500/40 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-cyan-300 font-bold mt-0.5",
      mainWrapper: "bg-slate-900/90 rounded-2xl p-3 md:p-5 shadow-2xl border border-cyan-500/30 backdrop-blur-md space-y-4 flex-1 text-cyan-50",
      footerBg: "bg-slate-950 border-t border-cyan-900/60 text-cyan-200 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-cyan-300",
      sidebarBg: "bg-gradient-to-b from-slate-950 via-blue-950 to-cyan-950 text-white border-r border-cyan-500/30 shadow-2xl",
      isLight: false,
    },
  },

  // ==========================================
  // 10. GRADASI: ROSE VELVET
  // ==========================================
  "rose-gold": {
    id: "rose-gold",
    name: "Rose Velvet",
    tagline: "Kemewahan Rose Gold & Deep Velvet Wine",
    category: "Gradasi Keren",
    previewClass: "bg-gradient-to-r from-rose-400 via-pink-500 to-rose-700",
    iconColor: "text-rose-400",
    login: {
      bgClass: "bg-gradient-to-br from-rose-800 via-pink-900 via-purple-950 to-slate-950",
      decorations: {
        blob1: "bg-rose-400/25",
        blob2: "bg-pink-500/30",
        blob3: "bg-rose-400/20",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-rose-100/90",
      isLight: false,
      card: {
        cardBg: "bg-slate-900/85 backdrop-blur-xl border-rose-500/40 shadow-2xl shadow-rose-950/60",
        title: "text-white font-black",
        desc: "text-rose-200",
        label: "text-rose-200 font-bold",
        inputBg: "bg-slate-950/80 border-rose-500/40 text-white focus:border-rose-400 focus:ring-rose-400 [color-scheme:dark]",
        inputIcon: "text-rose-400",
        selectArrow: "text-rose-400",
        badge: "bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold",
        dividerLine: "border-rose-500/30",
        dividerText: "text-rose-200 bg-slate-900 border-rose-500/30",
        demoTitle: "text-rose-200",
        presetBg: "bg-white/5 hover:bg-white/12 border-rose-500/25 hover:border-rose-400",
        presetName: "text-white",
        presetUser: "text-rose-300",
        presetDesc: "text-rose-100/80",
        footerText: "text-rose-200 border-rose-500/30",
        footerBadge: "bg-rose-950/70 border-rose-500/30 text-rose-300",
        submitBtn: "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-black shadow-lg shadow-rose-950/50 border border-rose-400/40",
      },
    },
    app: {
      rootBg: "bg-gradient-to-br from-rose-800 via-pink-900 via-purple-950 to-slate-950 font-sans flex flex-col md:flex-row antialiased min-h-screen text-rose-50 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-rose-400/25",
        blob2: "bg-pink-500/30",
        blob3: "bg-rose-400/20",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-slate-950/90 backdrop-blur-xl border-b border-rose-500/30 text-white shadow-xl sticky top-0 z-40 gap-4",
      titleText: "text-white",
      subText: "text-rose-200/90",
      badge1: "bg-rose-950/80 text-rose-100 border border-rose-500/50",
      badge2: "bg-pink-500/20 text-pink-300 border border-pink-400/40",
      controlBox: "bg-slate-900/80 border border-rose-500/40 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-rose-300 font-bold mt-0.5",
      mainWrapper: "bg-slate-900/90 rounded-2xl p-3 md:p-5 shadow-2xl border border-rose-500/30 backdrop-blur-md space-y-4 flex-1 text-rose-50",
      footerBg: "bg-slate-950 border-t border-rose-900/60 text-rose-200 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-rose-300",
      sidebarBg: "bg-gradient-to-b from-slate-950 via-rose-950 to-purple-950 text-white border-r border-rose-500/30 shadow-2xl",
      isLight: false,
    },
  },

  // ==========================================
  // 11. KLASIK: BIRU SAMUDRA
  // ==========================================
  blue: {
    id: "blue",
    name: "Biru Samudra",
    tagline: "Khas SMK Negeri 2 Konawe Royal Blue",
    category: "Klasik & Elegan",
    previewClass: "bg-blue-600",
    iconColor: "text-blue-400",
    login: {
      bgClass: "bg-blue-600",
      decorations: {
        blob1: "bg-sky-400/20",
        blob2: "bg-white/10",
        blob3: "bg-cyan-300/10",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-blue-100/90",
      isLight: false,
      card: {
        cardBg: "bg-blue-50/95 border-blue-200/80 hover:shadow-blue-300/30",
        title: "text-blue-950 font-black",
        desc: "text-blue-750",
        label: "text-blue-800 font-bold",
        inputBg: "bg-white border-blue-200 text-slate-800 focus:border-blue-600 focus:ring-blue-600",
        inputIcon: "text-blue-500",
        selectArrow: "text-blue-500",
        badge: "bg-blue-600 text-white font-bold",
        dividerLine: "border-blue-200",
        dividerText: "text-blue-700 bg-blue-50 border-blue-200/60",
        demoTitle: "text-blue-800",
        presetBg: "bg-white hover:bg-blue-100/50 border-blue-200 hover:border-blue-500",
        presetName: "text-blue-950",
        presetUser: "text-blue-600",
        presetDesc: "text-blue-700/80",
        footerText: "text-blue-800 border-blue-200/70",
        footerBadge: "bg-blue-100 border-blue-200 text-blue-700",
        submitBtn: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black shadow-md shadow-blue-900/30 border border-blue-500/30",
      },
    },
    app: {
      rootBg: "bg-blue-600 font-sans flex flex-col md:flex-row antialiased min-h-screen text-slate-900 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-sky-400/20",
        blob2: "bg-white/10",
        blob3: "bg-cyan-300/10",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-blue-900/95 backdrop-blur-md border-b border-blue-700/80 text-white shadow-md sticky top-0 z-40 gap-4",
      titleText: "text-white",
      subText: "text-blue-200/90",
      badge1: "bg-blue-800/90 text-blue-100 border border-blue-600/60",
      badge2: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
      controlBox: "bg-blue-950/60 border border-blue-700/70 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-blue-300 font-bold mt-0.5",
      mainWrapper: "bg-blue-50/95 rounded-2xl p-3 md:p-5 shadow-2xl border border-blue-200/80 backdrop-blur-sm space-y-4 flex-1 text-slate-900",
      footerBg: "bg-blue-950 border-t border-blue-800/80 text-blue-200 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-blue-300",
      sidebarBg: "bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 text-white border-r border-blue-700/60 shadow-lg",
      isLight: false,
    },
  },

  // ==========================================
  // 12. KLASIK: HIJAU ZAMRUD
  // ==========================================
  green: {
    id: "green",
    name: "Hijau Zamrud",
    tagline: "Nuansa Alami Zamrud & Hijau Hutan",
    category: "Klasik & Elegan",
    previewClass: "bg-emerald-600",
    iconColor: "text-emerald-400",
    login: {
      bgClass: "bg-emerald-600",
      decorations: {
        blob1: "bg-emerald-300/20",
        blob2: "bg-white/10",
        blob3: "bg-teal-300/10",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-emerald-100/90",
      isLight: false,
      card: {
        cardBg: "bg-emerald-50/95 border-emerald-200/85 hover:shadow-emerald-300/30",
        title: "text-emerald-950 font-black",
        desc: "text-emerald-700",
        label: "text-emerald-800 font-bold",
        inputBg: "bg-white border-emerald-200 text-slate-800 focus:border-emerald-600 focus:ring-emerald-600",
        inputIcon: "text-emerald-500",
        selectArrow: "text-emerald-500",
        badge: "bg-emerald-600 text-white font-bold",
        dividerLine: "border-emerald-200",
        dividerText: "text-emerald-700 bg-emerald-50 border-emerald-200/60",
        demoTitle: "text-emerald-800",
        presetBg: "bg-white hover:bg-emerald-100/50 border-emerald-200 hover:border-emerald-500",
        presetName: "text-emerald-950",
        presetUser: "text-emerald-600",
        presetDesc: "text-emerald-700/80",
        footerText: "text-emerald-800 border-emerald-200/70",
        footerBadge: "bg-emerald-100 border-emerald-200 text-emerald-750",
        submitBtn: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black shadow-md shadow-emerald-900/30 border border-emerald-500/30",
      },
    },
    app: {
      rootBg: "bg-emerald-600 font-sans flex flex-col md:flex-row antialiased min-h-screen text-slate-900 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-emerald-300/20",
        blob2: "bg-white/10",
        blob3: "bg-teal-300/10",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-emerald-900/95 backdrop-blur-md border-b border-emerald-700/80 text-white shadow-md sticky top-0 z-40 gap-4",
      titleText: "text-white",
      subText: "text-emerald-200/90",
      badge1: "bg-emerald-800/90 text-emerald-100 border border-emerald-600/60",
      badge2: "bg-teal-500/20 text-teal-300 border border-teal-400/30",
      controlBox: "bg-emerald-950/60 border border-emerald-700/70 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-emerald-300 font-bold mt-0.5",
      mainWrapper: "bg-emerald-50/95 rounded-2xl p-3 md:p-5 shadow-2xl border border-emerald-200/80 backdrop-blur-sm space-y-4 flex-1 text-slate-900",
      footerBg: "bg-emerald-950 border-t border-emerald-800/80 text-emerald-200 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-emerald-300",
      sidebarBg: "bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white border-r border-emerald-700/60 shadow-lg",
      isLight: false,
    },
  },

  // ==========================================
  // 13. KLASIK: MIDNIGHT NAVY
  // ==========================================
  "dark-blue": {
    id: "dark-blue",
    name: "Midnight Navy",
    tagline: "Elegan Malam Hari & Fokus Tinggi",
    category: "Gelap & Cyber",
    previewClass: "bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900",
    iconColor: "text-blue-300",
    login: {
      bgClass: "bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900",
      decorations: {
        blob1: "bg-sky-500/20",
        blob2: "bg-blue-600/15",
        blob3: "bg-cyan-400/10",
      },
      brandTextClass: "text-white",
      brandSubClass: "text-blue-200/90",
      isLight: false,
      card: {
        cardBg: "bg-slate-900/90 backdrop-blur-md border-blue-900/60 hover:shadow-blue-950/20",
        title: "text-white font-black",
        desc: "text-blue-200",
        label: "text-blue-300 font-bold",
        inputBg: "bg-slate-950/90 border border-blue-800/60 text-white focus:border-blue-500 focus:ring-blue-500 [color-scheme:dark]",
        inputIcon: "text-blue-400",
        selectArrow: "text-blue-400",
        badge: "bg-blue-600 text-white font-bold",
        dividerLine: "border-blue-900/50",
        dividerText: "text-blue-300 bg-[#0b1222] border-blue-900/25",
        demoTitle: "text-blue-300",
        presetBg: "bg-white/5 hover:bg-white/12 border-white/10 hover:border-blue-500/40",
        presetName: "text-white",
        presetUser: "text-blue-300/85",
        presetDesc: "text-slate-300",
        footerText: "text-slate-300 border-blue-900/40",
        footerBadge: "bg-white/10 border-white/15 text-blue-400",
        submitBtn: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black shadow-md shadow-blue-900/30 border border-blue-500/30",
      },
    },
    app: {
      rootBg: "bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 font-sans flex flex-col md:flex-row antialiased min-h-screen text-gray-100 transition-colors duration-500 relative overflow-x-hidden",
      decorations: {
        blob1: "bg-sky-500/20",
        blob2: "bg-blue-600/15",
        blob3: "bg-cyan-400/10",
      },
      headerBg: "flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-5 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-md sticky top-0 z-40 gap-4",
      titleText: "text-white",
      subText: "text-blue-300/90",
      badge1: "bg-slate-800 text-blue-200 border border-slate-700",
      badge2: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
      controlBox: "bg-slate-950/80 border border-slate-800 text-white",
      userName: "text-xs font-black text-white",
      userRole: "text-[10px] text-blue-400 font-bold mt-0.5",
      mainWrapper: "bg-slate-900/90 rounded-2xl p-3 md:p-5 shadow-2xl border border-blue-900/50 backdrop-blur-md space-y-4 flex-1 text-gray-100",
      footerBg: "bg-slate-950 border-t border-slate-800 text-slate-300 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2",
      footerServer: "text-slate-400",
      sidebarBg: "bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-gray-100 border-r border-slate-800/80 shadow-lg",
      isLight: false,
    },
  },
};
