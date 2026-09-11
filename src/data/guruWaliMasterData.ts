// Master Data Guru Wali & Murid Bimbingan
// Berdasarkan SK Resmi: KEPUTUSAN KEPALA SMKN 2 KONAWE
// NOMOR: 521.3/ /800/VII/2026 - TENTANG DAFTAR NAMA GURU WALI SMKN 2 KONAWE PELAJARAN 2026 / 2027

export interface BimbinganMuridItem {
  id: string;
  nama: string;
  kelas: string;
  catatan?: string;
  keterangan?: string;
}

export interface GuruWaliMasterItem {
  id: string;
  no: number;
  namaGuru: string;
  muridList: BimbinganMuridItem[];
}

export const DATA_VERSION_GURU_WALI = "2026-2027-sk-final";

export const INITIAL_GURU_WALI_MASTER_DATA: GuruWaliMasterItem[] = [
  {
    id: "gw-1",
    no: 1,
    namaGuru: "DRS. MUSLIMIN, L. S.Pd",
    muridList: [
      { id: "m-1-1", nama: "ABDUL FATHIR AL-FATH", kelas: "XI TKR A" },
      { id: "m-1-2", nama: "ABI DWI SANJAYA", kelas: "XI TKR A" },
      { id: "m-1-3", nama: "ALFONSUS JIMMY KRISTIANO", kelas: "XI TKR A" },
      { id: "m-1-4", nama: "ARIADI DIDIK NANTA", kelas: "XI TKR A" },
      { id: "m-1-5", nama: "BAYU SAPUTRA", kelas: "X TKR A", keterangan: "TDK NAIK" },
      { id: "m-1-6", nama: "FEBRIAN", kelas: "XI TKR A" },
      { id: "m-1-7", nama: "FITRA TEGUH SETIAWAN", kelas: "XI TKR A" },
      { id: "m-1-8", nama: "GEDE KEVIN", kelas: "XI TKR A" },
      { id: "m-1-9", nama: "HIJAZ AL-MUBARAQ", kelas: "X TKR A", keterangan: "TDK NAIK" },
      { id: "m-1-10", nama: "IHWAL", kelas: "XI TKR A" }
    ]
  },
  {
    id: "gw-2",
    no: 2,
    namaGuru: "HAERUL, S.Pd",
    muridList: [
      { id: "m-2-1", nama: "Iwan Gunawan", kelas: "XI TKR A" },
      { id: "m-2-2", nama: "Komang Suarsana", kelas: "XI TKR A" },
      { id: "m-2-3", nama: "LATIF SUGIARTO", kelas: "XI TKR A" },
      { id: "m-2-4", nama: "M. RIZKY MAULANA", kelas: "XI TKR A" },
      { id: "m-2-5", nama: "MADE SUADITA YASA", kelas: "XI TKR A" },
      { id: "m-2-6", nama: "MOCH. FAKHRI PUTRA NURSYA WIDYA", kelas: "XI TKR A" },
      { id: "m-2-7", nama: "muh asdar", kelas: "XI TKR A" },
      { id: "m-2-8", nama: "MUH. ADRIAN SAFUTRA", kelas: "XI TKR A" },
      { id: "m-2-9", nama: "MUH. AKBAR", kelas: "XI TKR A" },
      { id: "m-2-10", nama: "MUH. FAHMI ALFAROBI", kelas: "XI TKR A" },
      { id: "m-2-11", nama: "Muh. Shabri Al Mughni", kelas: "X TKR A", keterangan: "TDK NAIK" },
      { id: "m-2-12", nama: "Muhamad Ismail", kelas: "X TKR A", keterangan: "TDK NAIK" },
      { id: "m-2-13", nama: "MUHAMAD SHIDIQ FATHONI", kelas: "XI TKR A" },
      { id: "m-2-14", nama: "MUHAMMAD ARJUNA", kelas: "X TKR A", keterangan: "TDK NAIK" },
      { id: "m-2-15", nama: "MUHAMMAD FADIL CANDRA", kelas: "XI TKR A" }
    ]
  },
  {
    id: "gw-3",
    no: 3,
    namaGuru: "I PUTU JUNIASA, S.Pd Mat",
    muridList: [
      { id: "m-3-1", nama: "Radit Aditya", kelas: "X TKR A", keterangan: "TDK NAIK" },
      { id: "m-3-2", nama: "Rehan Jaenuri", kelas: "XI TKR A" },
      { id: "m-3-3", nama: "RIFKY FEBRIYANTO", kelas: "XI TKR A" },
      { id: "m-3-4", nama: "RISKI ARDIANA", kelas: "X TKR A", keterangan: "TDK NAIK" },
      { id: "m-3-5", nama: "RONAL SETIAWAN", kelas: "X TKR A", keterangan: "TDK NAIK" },
      { id: "m-3-6", nama: "USAMAH ABDURRAHMAN", kelas: "XI TKR A" },
      { id: "m-3-7", nama: "VERI SUDANA", kelas: "XI TKR A" },
      { id: "m-3-8", nama: "ABDURAFI ASRIFIN", kelas: "XI TKR B" },
      { id: "m-3-9", nama: "ABI SAIFUL ANZHOR", kelas: "XI TKR B" },
      { id: "m-3-10", nama: "Adi Guna", kelas: "XI TKR B" },
      { id: "m-3-11", nama: "ALOISIUS REVANT GONSALES", kelas: "XI TKR B" },
      { id: "m-3-12", nama: "Arfiqun Al Faturrahman", kelas: "XI TKR B" },
      { id: "m-3-13", nama: "BAYU", kelas: "XI TKR B" }
    ]
  },
  {
    id: "gw-4",
    no: 4,
    namaGuru: "AINAL LAREMBA, S.Ag",
    muridList: [
      { id: "m-4-1", nama: "DIPA PRATAMA", kelas: "XI TKR B" },
      { id: "m-4-2", nama: "FAIZ NUR AFRIANZAH", kelas: "XI TKR B" },
      { id: "m-4-3", nama: "FERDIANSYAH", kelas: "XI TKR B" },
      { id: "m-4-4", nama: "GEDE AGUS PRAYOGA", kelas: "XI TKR B" },
      { id: "m-4-5", nama: "HESSA ADRIANSYAH", kelas: "XI TKR B" },
      { id: "m-4-6", nama: "I WAYAN WARDANA", kelas: "XI TKR B" },
      { id: "m-4-7", nama: "ILHAM NUR FAJAR", kelas: "XI TKR B" },
      { id: "m-4-8", nama: "JARNO MUHAMMAD ARIFIN", kelas: "XI TKR B" },
      { id: "m-4-9", nama: "MADE KEFIN", kelas: "XI TKR B" },
      { id: "m-4-10", nama: "Maximus Wiadnyana", kelas: "XI TKR B" },
      { id: "m-4-11", nama: "MUH RESKY ANUGRAH", kelas: "XI TKR B" },
      { id: "m-4-12", nama: "Muh. Adibintang", kelas: "XI TKR B" },
      { id: "m-4-13", nama: "MUH. FADJRIANSYAH", kelas: "XI TKR B" },
      { id: "m-4-14", nama: "Muh. Fatur Rahman", kelas: "XI TKR B" },
      { id: "m-4-15", nama: "MUH. FIKAL EFFENDY", kelas: "XI TKR B" }
    ]
  },
  {
    id: "gw-5",
    no: 5,
    namaGuru: "IMAN PURNAMA, ST",
    muridList: [
      { id: "m-5-1", nama: "MUH. HAYUP", kelas: "X TKR B", keterangan: "TDK NAIK" },
      { id: "m-5-2", nama: "MUH.ARIPAN", kelas: "XI TKR B" },
      { id: "m-5-3", nama: "MUHAMMAD RANGGA", kelas: "XI TKR B" },
      { id: "m-5-4", nama: "NABIL ALFATAH", kelas: "XI TKR B" },
      { id: "m-5-5", nama: "REHAN AGUS PRAYOGA", kelas: "XI TKR B" },
      { id: "m-5-6", nama: "REZZA BRIAN DINATA", kelas: "XI TKR B" },
      { id: "m-5-7", nama: "Rolansyah", kelas: "XI TKR B" },
      { id: "m-5-8", nama: "UJANG DIDI SURYADI", kelas: "XI TKR B" },
      { id: "m-5-9", nama: "YUSRIANTO", kelas: "XI TKR B" },
      { id: "m-5-10", nama: "A. ZULKIFLI", kelas: "XI TSM A" },
      { id: "m-5-11", nama: "Adil Saputra", kelas: "XI TSM A" },
      { id: "m-5-12", nama: "ADILLA AL FATH", kelas: "XI TSM A" }
    ]
  },
  {
    id: "gw-6",
    no: 6,
    namaGuru: "TITIK HARUMI, S.Pd",
    muridList: [
      { id: "m-6-1", nama: "AKSEL", kelas: "XI TSM A" },
      { id: "m-6-2", nama: "ALFIAT YUDA PRATAMA", kelas: "XI TSM A" },
      { id: "m-6-3", nama: "ANDI MUH. AFKAR DZAKIY", kelas: "XI TSM A" },
      { id: "m-6-4", nama: "ANDRA EFRON'K", kelas: "XI TSM A" },
      { id: "m-6-5", nama: "BAGAS ARI WASITO", kelas: "XI TSM A" },
      { id: "m-6-6", nama: "CIKO PEBRIAN", kelas: "XI TSM A" },
      { id: "m-6-7", nama: "EDRIYANSAH SYALIN", kelas: "XI TSM A" },
      { id: "m-6-8", nama: "Grace Stefanus Joy", kelas: "XI TSM A" },
      { id: "m-6-9", nama: "ILHAM PUTRAWAN", kelas: "XI TSM A" },
      { id: "m-6-10", nama: "KADEK MULYANTARA", kelas: "XI TSM A" },
      { id: "m-6-11", nama: "M. BANGUN WIJAYA", kelas: "XI TSM A" },
      { id: "m-6-12", nama: "Muh. Adril Iqbal", kelas: "XI TSM A" }
    ]
  },
  {
    id: "gw-7",
    no: 7,
    namaGuru: "ISNAWATI, S.Pd",
    muridList: [
      { id: "m-7-1", nama: "Muh. Albiansya", kelas: "XI TSM A" },
      { id: "m-7-2", nama: "Muh. Dahlan", kelas: "XI TSM A" },
      { id: "m-7-3", nama: "MUH. FADHIL", kelas: "XI TSM A" },
      { id: "m-7-4", nama: "MUH. FATWA MALAIKA", kelas: "XI TSM A" },
      { id: "m-7-5", nama: "MUH. ILHAM", kelas: "XI TSM A" },
      { id: "m-7-6", nama: "MUH. SAKTI MUHARRAM", kelas: "XI TSM A" },
      { id: "m-7-7", nama: "MUHAMMAD", kelas: "XI TSM A" },
      { id: "m-7-8", nama: "NIZAR ZULMI FATHURRAHMAN", kelas: "XI TSM A" },
      { id: "m-7-9", nama: "RAYHAN AL-FAHRI", kelas: "XI TSM A" },
      { id: "m-7-10", nama: "REIN AZHAR", kelas: "XI TSM A" },
      { id: "m-7-11", nama: "SABARUDDIN", kelas: "XI TSM A" },
      { id: "m-7-12", nama: "SANDY SEPRIANSYAH", kelas: "XI TSM A" },
      { id: "m-7-13", nama: "SULTAMA FADLI RAMADHAN", kelas: "XI TSM A" }
    ]
  },
  {
    id: "gw-8",
    no: 8,
    namaGuru: "NUNU SOSILOWATI PODADA, S.Pd , M.Pd",
    muridList: [
      { id: "m-8-1", nama: "TEGUH PRASETIO", kelas: "XI TSM A" },
      { id: "m-8-2", nama: "ALFAREL BINTANG PRATAMA", kelas: "XI TSM A" },
      { id: "m-8-3", nama: "ADI BAGAS SAPUTRA", kelas: "X TSM B", keterangan: "TDK NAIK" },
      { id: "m-8-4", nama: "AHMAD FADLAN", kelas: "X TSM B", keterangan: "TDK NAIK" },
      { id: "m-8-5", nama: "ALFANDI", kelas: "XI TSM B" },
      { id: "m-8-6", nama: "Andi Baso Fikri", kelas: "XI TSM B" },
      { id: "m-8-7", nama: "ANDIKA SAPUTRA", kelas: "XI TSM B" },
      { id: "m-8-8", nama: "Asran Asis", kelas: "XI TSM B" },
      { id: "m-8-9", nama: "BILAL AL ZIQRI", kelas: "XI TSM B" },
      { id: "m-8-10", nama: "DANI SAPUTRA", kelas: "XI TSM B" },
      { id: "m-8-11", nama: "FADIL SAPUTRA", kelas: "XI TSM B" },
      { id: "m-8-12", nama: "FILIPUS PIKCA", kelas: "XI TSM B" },
      { id: "m-8-13", nama: "GUSTI ASTA PRASATYA", kelas: "XI TSM B" },
      { id: "m-8-14", nama: "IMRAN", kelas: "XI TSM B" }
    ]
  },
  {
    id: "gw-9",
    no: 9,
    namaGuru: "ELIS SYARIFUDDIN B, S.Pd.T",
    muridList: [
      { id: "m-9-1", nama: "M. Adil", kelas: "XI TSM B" },
      { id: "m-9-2", nama: "MIFTAHUL ICKSAN", kelas: "XI TSM B" },
      { id: "m-9-3", nama: "MUH. ARJA ARDIANSYAH", kelas: "XI TSM B" },
      { id: "m-9-4", nama: "MUH. FARHAN JUNIAWAN", kelas: "XI TSM B" },
      { id: "m-9-5", nama: "MUHAMMAD NUR IQSAL", kelas: "XI TSM B" },
      { id: "m-9-6", nama: "RADIT REZA SAPUTRA", kelas: "XI TSM B" },
      { id: "m-9-7", nama: "Rahmatullah", kelas: "X TSM B", keterangan: "TDK NAIK" },
      { id: "m-9-8", nama: "Rangga", kelas: "XI TSM B" },
      { id: "m-9-9", nama: "RESKI ADITIA SAPUTRA", kelas: "XI TSM B" },
      { id: "m-9-10", nama: "SAEFUL HUDA", kelas: "XI TSM B" },
      { id: "m-9-11", nama: "SILFARO RAMADHAN", kelas: "XI TSM B" },
      { id: "m-9-12", nama: "Syahril", kelas: "XI TSM B" },
      { id: "m-9-13", nama: "Tirta Ramadan", kelas: "XI TSM B" }
    ]
  },
  {
    id: "gw-10",
    no: 10,
    namaGuru: "NYOMAN SULIAWATI, S.Pd.M.Pd",
    muridList: [
      { id: "m-10-1", nama: "ABYSYARAN", kelas: "XI TAV" },
      { id: "m-10-2", nama: "Fajar Saputra Zainal", kelas: "X TSM" },
      { id: "m-10-3", nama: "Rifky Berkah", kelas: "XI TKR A" },
      { id: "m-10-4", nama: "Abd. Rahman Sindaliwu", kelas: "XI TKR B" },
      { id: "m-10-5", nama: "HAFIS IBRAHIM", kelas: "XI DPIB" },
      { id: "m-10-6", nama: "HARDIKA", kelas: "XI DPIB" },
      { id: "m-10-7", nama: "MUHAMMAD RAFLI MARAMIS", kelas: "XI DPIB" },
      { id: "m-10-8", nama: "SERIN", kelas: "XI DPIB" },
      { id: "m-10-9", nama: "TYAS PUTRI PRAMESTI", kelas: "XI DPIB" }
    ]
  },
  {
    id: "gw-11",
    no: 11,
    namaGuru: "EVASYATRIANA, S,SI",
    muridList: [
      { id: "m-11-1", nama: "MUHAMAD SIDIQ", kelas: "X DKV", keterangan: "TDK NAIK" },
      { id: "m-11-2", nama: "MUHAMMAD REVAN AL-FAHQREZI", kelas: "XI DKV" },
      { id: "m-11-3", nama: "REVA OLIVVATUL SAIDA", kelas: "X DKV", keterangan: "TDK NAIK" },
      { id: "m-11-4", nama: "ROBIATUL ADAWIYAH", kelas: "XI DKV" },
      { id: "m-11-5", nama: "SYAHRUL RAMADHAN", kelas: "XI DKV" },
      { id: "m-11-6", nama: "ABD. GOPUR", kelas: "XII TKR A" },
      { id: "m-11-7", nama: "Ade Putra Jasman", kelas: "XII TKR A" },
      { id: "m-11-8", nama: "ADITYA SAPUTRA", kelas: "XII TKR A" },
      { id: "m-11-9", nama: "AGIL DENSULTON", kelas: "XI TKR A", keterangan: "TDK NAIK" },
      { id: "m-11-10", nama: "AKBAR. S", kelas: "XII TKR A" },
      { id: "m-11-11", nama: "ARFAEL PRATAMA", kelas: "XII TKR A" },
      { id: "m-11-12", nama: "AUSTIARANDA", kelas: "XI TKR A", keterangan: "TDK NAIK" },
      { id: "m-11-13", nama: "CHOKY HENDRIAWAN", kelas: "XII TKR A" }
    ]
  },
  {
    id: "gw-12",
    no: 12,
    namaGuru: "SALMAH, S.PdI",
    muridList: [
      { id: "m-12-1", nama: "DANY SAPUTRA", kelas: "XII TKR A" },
      { id: "m-12-2", nama: "FADLI ANDI PRASETYO", kelas: "XII TKR A" },
      { id: "m-12-3", nama: "FENDI JULIANSYAH", kelas: "XII TKR A" },
      { id: "m-12-4", nama: "FIRNANDA SATRIO WICAKSONO", kelas: "XII TKR A" },
      { id: "m-12-5", nama: "Genta Neo Actara", kelas: "XII TKR A" },
      { id: "m-12-6", nama: "Ilham Akbar", kelas: "XI TKR A", keterangan: "TDK NAIK" },
      { id: "m-12-7", nama: "IRFAN FEBRIAN", kelas: "XI TKR A", keterangan: "TDK NAIK" },
      { id: "m-12-8", nama: "Kadek Adisetiawan", kelas: "XII TKR A" },
      { id: "m-12-9", nama: "MADE ARDIKA WIRAWAN", kelas: "XII TKR A" },
      { id: "m-12-10", nama: "MUH. ALIF", kelas: "XI TKR A", keterangan: "TDK NAIK" },
      { id: "m-12-11", nama: "MUH. ASRUL", kelas: "XII TKR A" },
      { id: "m-12-12", nama: "MUH. ILHAM IZMUL IZAM", kelas: "XII TKR A" },
      { id: "m-12-13", nama: "MUH. RIFKI", kelas: "XII TKR A" },
      { id: "m-12-14", nama: "MUHAMMAD RIZKY FEBRIANSYAH", kelas: "XII TKR A" }
    ]
  },
  {
    id: "gw-13",
    no: 13,
    namaGuru: "ARHAM AMIRUDDIN, S.Pd",
    muridList: [
      { id: "m-13-1", nama: "NANDA RAFI SAPUTRA", kelas: "XI TKR A", keterangan: "TDK NAIK" },
      { id: "m-13-2", nama: "NUR ALAM", kelas: "XII TKR A" },
      { id: "m-13-3", nama: "RAMA FITRIANDANU", kelas: "XII TKR A" },
      { id: "m-13-4", nama: "RAMADANA", kelas: "XI TKR A", keterangan: "TDK NAIK" },
      { id: "m-13-5", nama: "REPAN", kelas: "XII TKR A" },
      { id: "m-13-6", nama: "REYHAN PRATAMA RIANTO", kelas: "XII TKR A" },
      { id: "m-13-7", nama: "SANJAYA", kelas: "XII TKR A" },
      { id: "m-13-8", nama: "SHAEQAL EFRANDA EKADITYA", kelas: "XII TKR A" },
      { id: "m-13-9", nama: "WAWAN HIDAYAT", kelas: "XII TKR A" },
      { id: "m-13-10", nama: "ZULHAJI FAJRIN", kelas: "XII TKR A" },
      { id: "m-13-11", nama: "ADI PRATAMA", kelas: "XII TKR B" },
      { id: "m-13-12", nama: "AFDAL SETIAWAN", kelas: "XI TKR B", keterangan: "TDK NAIK" },
      { id: "m-13-13", nama: "AHMAD NAZRIEL", kelas: "XII TKR B" },
      { id: "m-13-14", nama: "AL FAIRA", kelas: "XII TKR B" }
    ]
  },
  {
    id: "gw-14",
    no: 14,
    namaGuru: "ASKIN, S.Ag",
    muridList: [
      { id: "m-14-1", nama: "ALIF", kelas: "XII TKR B" },
      { id: "m-14-2", nama: "ANDI ASHAR", kelas: "XII TKR B" },
      { id: "m-14-3", nama: "ARI SANTOSO", kelas: "XI TKR B", keterangan: "TDK NAIK" },
      { id: "m-14-4", nama: "BASO ASNUR", kelas: "XII TKR B" },
      { id: "m-14-5", nama: "DAMASUS SUTANTO", kelas: "XII TKR B" },
      { id: "m-14-6", nama: "DIAN PRATAMA", kelas: "XI TKR B", keterangan: "TDK NAIK" },
      { id: "m-14-7", nama: "DIMAS", kelas: "XII TKR B" },
      { id: "m-14-8", nama: "FADLI MUBAROK", kelas: "XI TKR B", keterangan: "TDK NAIK" },
      { id: "m-14-9", nama: "fahresa aditya pratama", kelas: "XII TKR B" },
      { id: "m-14-10", nama: "FIKHAL DZUHRAINI", kelas: "XII TKR B" },
      { id: "m-14-11", nama: "GEDE YOGA PRAMANA", kelas: "XII TKR B" },
      { id: "m-14-12", nama: "GUSTI AGUNG WIRA ANDIKA", kelas: "XI TKR B", keterangan: "TDK NAIK" },
      { id: "m-14-13", nama: "JORDAN BIMASAKTI", kelas: "XI TKR B", keterangan: "TDK NAIK" },
      { id: "m-14-14", nama: "KADEK FEBRI ANDIKA", kelas: "XII TKR B" }
    ]
  },
  {
    id: "gw-15",
    no: 15,
    namaGuru: "TRIANA DANIEL, S.Pd",
    muridList: [
      { id: "m-15-1", nama: "Kristian Tanan", kelas: "XII TKR B" },
      { id: "m-15-2", nama: "M. NADIP JOVALDI", kelas: "XII TKR B" },
      { id: "m-15-3", nama: "MIFTAKHUR ROZAK", kelas: "XII TKR B" },
      { id: "m-15-4", nama: "Muh. Andika", kelas: "XII TKR B" },
      { id: "m-15-5", nama: "MUHAMAD HANAFI", kelas: "XII TKR B" },
      { id: "m-15-6", nama: "MUHAMAD SAHRIL APRILIAN", kelas: "XII TKR B" },
      { id: "m-15-7", nama: "Najuan Artha Pratama", kelas: "XII TKR B" },
      { id: "m-15-8", nama: "PUTU RIZKY OKTAPIAN", kelas: "XII TKR B" },
      { id: "m-15-9", nama: "RAFI DWI NURAJI", kelas: "XII TKR B" },
      { id: "m-15-10", nama: "RAHMADDANI", kelas: "XII TKR B" },
      { id: "m-15-11", nama: "REPAN MARIO ARDIANSYAH", kelas: "XII TKR B" },
      { id: "m-15-12", nama: "SAKTI TRITAMA RANDAWULA'A KADIR", kelas: "XII TKR B" },
      { id: "m-15-13", nama: "SATRIADI", kelas: "XI TKR B", keterangan: "TDK NAIK" },
      { id: "m-15-14", nama: "SUDRAJAT MURDANI", kelas: "XII TKR B" }
    ]
  },
  {
    id: "gw-16",
    no: 16,
    namaGuru: "MUHAMMAD MAIMANA, ST",
    muridList: [
      { id: "m-16-1", nama: "Triwira Nata Wijaya", kelas: "XII TKR B" },
      { id: "m-16-2", nama: "VAREL", kelas: "XII TKR B" },
      { id: "m-16-3", nama: "WHILY BHIRA MALDHANI", kelas: "XII TKR B" },
      { id: "m-16-4", nama: "DIKAL", kelas: "XII TSM A" },
      { id: "m-16-5", nama: "DIMAS APRIANSYAH", kelas: "XII TSM A" },
      { id: "m-16-6", nama: "ELVANUS", kelas: "XII TSM A" },
      { id: "m-16-7", nama: "FAHRI RAMADHAN", kelas: "XII TSM A" },
      { id: "m-16-8", nama: "Fausan Irmawan", kelas: "XII TSM A" },
      { id: "m-16-9", nama: "FERDY", kelas: "XII TSM A" },
      { id: "m-16-10", nama: "GUNARTO", kelas: "XII TSM A" },
      { id: "m-16-11", nama: "GUNTUR", kelas: "XI TSM A", keterangan: "TDK NAIK" },
      { id: "m-16-12", nama: "IBRAHIM", kelas: "XI TSM A", keterangan: "TDK NAIK" },
      { id: "m-16-13", nama: "IBRAHIM", kelas: "XI TSM A", keterangan: "TDK NAIK" }
    ]
  },
  {
    id: "gw-17",
    no: 17,
    namaGuru: "MUHARJUN, S.Pd",
    muridList: [
      { id: "m-17-1", nama: "JELY HINO", kelas: "XII TSM A" },
      { id: "m-17-2", nama: "KADEK BAYU SANDI", kelas: "XII TSM A" },
      { id: "m-17-3", nama: "KADEK PAJAR", kelas: "XII TSM A" },
      { id: "m-17-4", nama: "KADEK TATASAN JAYA", kelas: "XII TSM A" },
      { id: "m-17-5", nama: "KOMANG SURYA", kelas: "XII TSM A" },
      { id: "m-17-6", nama: "LINTANG", kelas: "XI TSM A", keterangan: "TDK NAIK" },
      { id: "m-17-7", nama: "MUH. AFDAL USMAN", kelas: "XII TSM A" },
      { id: "m-17-8", nama: "Muh. Alif Alfiansyah", kelas: "XII TSM A" },
      { id: "m-17-9", nama: "Muh. Raden Fauzhan Farid", kelas: "XII TSM A" },
      { id: "m-17-10", nama: "Muh. Ridwan", kelas: "XII TSM A" },
      { id: "m-17-11", nama: "Nanda Aripa Hakim", kelas: "XII TSM A" },
      { id: "m-17-12", nama: "NYOMAN AGUS SUJANA", kelas: "XII TSM A" },
      { id: "m-17-13", nama: "PUTU HERI PRATAMA", kelas: "XII TSM A" },
      { id: "m-17-14", nama: "Rafky Ibnu Hidayah", kelas: "XII TSM A" }
    ]
  },
  {
    id: "gw-18",
    no: 18,
    namaGuru: "SAIFUL ARIFIN , S.Pd",
    muridList: [
      { id: "m-18-1", nama: "RAFLI ADRIYANSAH", kelas: "XII TSM A" },
      { id: "m-18-2", nama: "RANGGA PRAMONO", kelas: "XII TSM A" },
      { id: "m-18-3", nama: "SEKAR SAPUTRA", kelas: "XI TSM A", keterangan: "TDK NAIK" },
      { id: "m-18-4", nama: "WAHYU ADRIANSYAH", kelas: "XI TSM A", keterangan: "TDK NAIK" },
      { id: "m-18-5", nama: "ABDUL FADLI", kelas: "XII TAV" },
      { id: "m-18-6", nama: "ANTONIAS", kelas: "XII TAV" },
      { id: "m-18-7", nama: "DWI SURAJAB", kelas: "XII TAV" },
      { id: "m-18-8", nama: "Fatma Yani", kelas: "XII TAV" },
      { id: "m-18-9", nama: "GALIH ADI PRATAMA", kelas: "XII TAV" },
      { id: "m-18-10", nama: "GEDE ARDIKA SUDANA YASA", kelas: "XI TAV", keterangan: "TDK NAIK" }
    ]
  },
  {
    id: "gw-19",
    no: 19,
    namaGuru: "SITI KHOTIJAH S, Pd",
    muridList: [
      { id: "m-19-1", nama: "HENRI", kelas: "XII TAV" },
      { id: "m-19-2", nama: "IKSAN NUR AJI", kelas: "XII TAV" },
      { id: "m-19-3", nama: "ILHAM", kelas: "XII TAV" },
      { id: "m-19-4", nama: "MUH. FADHIL ADITYA", kelas: "XII TAV" },
      { id: "m-19-5", nama: "MUH. REZKI RAMADHAN", kelas: "XII TAV" },
      { id: "m-19-6", nama: "NOTO TRIATMOJO", kelas: "XII TAV" },
      { id: "m-19-7", nama: "PAISAL", kelas: "XII TAV" },
      { id: "m-19-8", nama: "SYAHLAN", kelas: "XII TAV" },
      { id: "m-19-9", nama: "WAHYU", kelas: "XII TAV" },
      { id: "m-19-10", nama: "Ade Agus Wila Kusuma", kelas: "XII DPIB" },
      { id: "m-19-11", nama: "AKBAR", kelas: "XII DPIB" },
      { id: "m-19-12", nama: "Aris", kelas: "XII DPIB" },
      { id: "m-19-13", nama: "AURA NURAFIFA", kelas: "XII DPIB" },
      { id: "m-19-14", nama: "CHEZAR PRADITA.S", kelas: "XII DPIB" }
    ]
  },
  {
    id: "gw-20",
    no: 20,
    namaGuru: "ARBIANTI, SE",
    muridList: [
      { id: "m-20-1", nama: "ELZI", kelas: "XII DPIB" },
      { id: "m-20-2", nama: "Fladynov", kelas: "XII DPIB" },
      { id: "m-20-3", nama: "HASDIAN GANI", kelas: "XII DPIB" },
      { id: "m-20-4", nama: "KESYA VANIA SAFIRA", kelas: "XII DPIB" },
      { id: "m-20-5", nama: "M. Ridwan H.", kelas: "XII DPIB" },
      { id: "m-20-6", nama: "MUH. IDAM ALFATIH", kelas: "XII DPIB" },
      { id: "m-20-7", nama: "NAJWA AZ-ZAHRA", kelas: "XII DPIB" },
      { id: "m-20-8", nama: "NUR AFNI CAHYANI", kelas: "XII DPIB" },
      { id: "m-20-9", nama: "TASYA PUTRI APRILIA", kelas: "XII DPIB" },
      { id: "m-20-10", nama: "TIARA HANIM PRATIWI", kelas: "XII DPIB" },
      { id: "m-20-11", nama: "ZAKI MUAMAR", kelas: "XII DPIB" }
    ]
  },
  {
    id: "gw-21",
    no: 21,
    namaGuru: "ANGRAENI DAMANIK, S.Pd",
    muridList: [
      { id: "m-21-1", nama: "ABD. AZIZ", kelas: "X TKR A" },
      { id: "m-21-2", nama: "AIMAN", kelas: "X TKR A" },
      { id: "m-21-3", nama: "ALEXA AL MUBARAK", kelas: "X TKR A" },
      { id: "m-21-4", nama: "ALFIN SEPRIANTO", kelas: "X TKR A" },
      { id: "m-21-5", nama: "ANAK AGUNG MADE ARTHA GINA", kelas: "X TKR A" },
      { id: "m-21-6", nama: "BAGUS WICAKSONO", kelas: "X TKR A" },
      { id: "m-21-7", nama: "DIMAS MUHAMAD ILYAS", kelas: "X TKR A" }
    ]
  },
  {
    id: "gw-22",
    no: 22,
    namaGuru: "HISWAN FAGALA, S.Pd",
    muridList: [
      { id: "m-22-1", nama: "FERDI ADRIAN", kelas: "X TKR A" },
      { id: "m-22-2", nama: "GEDE PRAYADYA", kelas: "X TKR A" },
      { id: "m-22-3", nama: "JUNA BASTIAN", kelas: "X TKR A" },
      { id: "m-22-4", nama: "KETUT ARDIANA", kelas: "X TKR A" },
      { id: "m-22-5", nama: "KHOIRUDDIN", kelas: "X TKR A" },
      { id: "m-22-6", nama: "KOMANG PRANATA", kelas: "X TKR A" },
      { id: "m-22-7", nama: "MUH OCTARIANSYAH ALFATIR", kelas: "X TKR A" }
    ]
  },
  {
    id: "gw-23",
    no: 23,
    namaGuru: "SAMSUL SABRI, S.Kom",
    muridList: [
      { id: "m-23-1", nama: "MUH. BAIM AKBAR", kelas: "X TKR A" },
      { id: "m-23-2", nama: "MUH. FAHMI ADZAN", kelas: "X TKR A" },
      { id: "m-23-3", nama: "MUH. MAULANA", kelas: "X TKR A" },
      { id: "m-23-4", nama: "MUH. RAYHAN AL IRSYAD", kelas: "X TKR A" },
      { id: "m-23-5", nama: "MUH. REZA ALFIQAR", kelas: "X TKR A" },
      { id: "m-23-6", nama: "MUH. ZAKIR ASSAJAD", kelas: "X TKR A" },
      { id: "m-23-7", nama: "MUHAMMAD IRSYAD", kelas: "X TKR A" }
    ]
  },
  {
    id: "gw-24",
    no: 24,
    namaGuru: "I GUSTI NGURAH PUTU WAHYU DARMA, S.Pd",
    muridList: [
      { id: "m-24-1", nama: "MUHAMMAD RIZAL", kelas: "X TKR A" },
      { id: "m-24-2", nama: "NATA PARWATA", kelas: "X TKR A" },
      { id: "m-24-3", nama: "NIKODEMUS SEPTIANTO", kelas: "X TKR A" },
      { id: "m-24-4", nama: "NYOMAN SUGIE HARTHA", kelas: "X TKR A" },
      { id: "m-24-5", nama: "REZAL HERFIANSYAH", kelas: "X TKR A" },
      { id: "m-24-6", nama: "SAHRUL", kelas: "X TKR A" }
    ]
  },
  {
    id: "gw-25",
    no: 25,
    namaGuru: "ADRIAN SAPUTRA, S.Pd",
    muridList: [
      { id: "m-25-1", nama: "AGHNAN SUGIAR AZHARY", kelas: "X TKR B" },
      { id: "m-25-2", nama: "AKSAH NURPRANANSAH", kelas: "X TKR B" },
      { id: "m-25-3", nama: "ALFIAN SYAHRUL M.", kelas: "X TKR B" },
      { id: "m-25-4", nama: "ALVIN SABATINO", kelas: "X TKR B" },
      { id: "m-25-5", nama: "ANDI MUHAMMAD HAEKAL", kelas: "X TKR B" },
      { id: "m-25-6", nama: "BASO SABRIN", kelas: "X TKR B" },
      { id: "m-25-7", nama: "FAIZ ALWAN FAHYAAD", kelas: "X TKR B" },
      { id: "m-25-8", nama: "FRANANDA KURNIA ALFAROBI", kelas: "X TKR B" }
    ]
  },
  {
    id: "gw-26",
    no: 26,
    namaGuru: "CICI MURNI, S.Pd",
    muridList: [
      { id: "m-26-1", nama: "ISMAIL", kelas: "X TKR B" },
      { id: "m-26-2", nama: "KADEK DWI SUPRIYANTO", kelas: "X TKR B" },
      { id: "m-26-3", nama: "KETUT JULIANTO", kelas: "X TKR B" },
      { id: "m-26-4", nama: "KIANDRA ADI PRASTYA", kelas: "X TKR B" },
      { id: "m-26-5", nama: "MADE INDRA SAPUTRA", kelas: "X TKR B" },
      { id: "m-26-6", nama: "MUH. ALDI", kelas: "X TKR B" },
      { id: "m-26-7", nama: "MUH. DWI APRILIANO", kelas: "X TKR B" }
    ]
  },
  {
    id: "gw-27",
    no: 27,
    namaGuru: "IZZAT WAHYU SALDI, S.Pd",
    muridList: [
      { id: "m-27-1", nama: "MUH. FORLAND", kelas: "X TKR B" },
      { id: "m-27-2", nama: "MUH. PUTRA ALRIFKI", kelas: "X TKR B" },
      { id: "m-27-3", nama: "MUH. RENALDI P", kelas: "X TKR B" },
      { id: "m-27-4", nama: "MUH. SAFII ADITYA", kelas: "X TKR B" },
      { id: "m-27-5", nama: "MUHAMAD NISWAR", kelas: "X TKR B" },
      { id: "m-27-6", nama: "MUHAMMAD NUR ALAM MATTOREANG", kelas: "X TKR B" },
      { id: "m-27-7", nama: "NANDA FEBRIAN", kelas: "X TKR B" }
    ]
  },
  {
    id: "gw-28",
    no: 28,
    namaGuru: "YOGA NANDA HENDRAWAN, S.Pd",
    muridList: [
      { id: "m-28-1", nama: "NENGAH ARYA DWI ARTHA", kelas: "X TKR B" },
      { id: "m-28-2", nama: "NUR ALIMANSYAH", kelas: "X TKR B" },
      { id: "m-28-3", nama: "REFAN HERMAWAN", kelas: "X TKR B" },
      { id: "m-28-4", nama: "RIFKI RAMDANI", kelas: "X TKR B" },
      { id: "m-28-5", nama: "WAYAN BAYU ADITYA", kelas: "X TKR B" }
    ]
  },
  {
    id: "gw-29",
    no: 29,
    namaGuru: "SAIMAN, ST",
    muridList: [
      { id: "m-29-1", nama: "ABI AHZARIF", kelas: "X TSM" },
      { id: "m-29-2", nama: "ADITYA PRATAMA", kelas: "X TSM" },
      { id: "m-29-3", nama: "AHMAD IRWAN SAPUTRA", kelas: "X TSM" },
      { id: "m-29-4", nama: "AKIL NUR", kelas: "X TSM" },
      { id: "m-29-5", nama: "ALDO ALFIANTO", kelas: "X TSM" },
      { id: "m-29-6", nama: "ARJUN HIRMANSA", kelas: "X TSM" },
      { id: "m-29-7", nama: "ARPAN", kelas: "X TSM" },
      { id: "m-29-8", nama: "BAGAS PANJI SAMUDRA", kelas: "X TSM" },
      { id: "m-29-9", nama: "FAREL ANANTA", kelas: "X TSM" }
    ]
  },
  {
    id: "gw-30",
    no: 30,
    namaGuru: "ANDI ASRUL UMAR, S.Pd",
    muridList: [
      { id: "m-30-1", nama: "GUSTI RAKA PRATAMA", kelas: "X TSM" },
      { id: "m-30-2", nama: "IGNASIUS HENDRA GUNAWAN", kelas: "X TSM" },
      { id: "m-30-3", nama: "JANR ARISTO MATIUS", kelas: "X TSM" },
      { id: "m-30-4", nama: "KADEK ADI DARMAWAN", kelas: "X TSM" },
      { id: "m-30-5", nama: "M. HAFID ALFINSYAH", kelas: "X TSM" },
      { id: "m-30-6", nama: "MADE WIRA NATA", kelas: "X TSM" },
      { id: "m-30-7", nama: "MUH. ALFA RISKY", kelas: "X TSM" }
    ]
  },
  {
    id: "gw-31",
    no: 31,
    namaGuru: "MOCH. YAMIN, S.Pd",
    muridList: [
      { id: "m-31-1", nama: "MUH. ALVHINO APRILLIO", kelas: "X TSM" },
      { id: "m-31-2", nama: "MUH. DESTA", kelas: "X TSM" },
      { id: "m-31-3", nama: "MUH. FAID HIBBAN", kelas: "X TSM" },
      { id: "m-31-4", nama: "MUH. FITRAHTULLAH RAHMAN", kelas: "X TSM" },
      { id: "m-31-5", nama: "MUH. ILHAM IMANSYAH", kelas: "X TSM" },
      { id: "m-31-6", nama: "MUH. RIZAL", kelas: "X TSM" },
      { id: "m-31-7", nama: "MUH. WAHYU HALULANGA", kelas: "X TSM" },
      { id: "m-31-8", nama: "MUH. YOMI ALFADJRIN", kelas: "X TSM" }
    ]
  },
  {
    id: "gw-32",
    no: 32,
    namaGuru: "Putu Anggi Mildayanti, S.Pd",
    muridList: [
      { id: "m-32-1", nama: "MUHAMAD ANUGRA", kelas: "X TSM" },
      { id: "m-32-2", nama: "MUHAMMAD IQBAL", kelas: "X TSM" },
      { id: "m-32-3", nama: "MUHAMMAD RAMADHAN REFANDYBTOONDO", kelas: "X TSM" },
      { id: "m-32-4", nama: "RENDY ADITIA", kelas: "X TSM" },
      { id: "m-32-5", nama: "RESKI ARDI", kelas: "X TSM" },
      { id: "m-32-6", nama: "REVAN ARSYAD APRIANSYAH", kelas: "X TSM" }
    ]
  },
  {
    id: "gw-33",
    no: 33,
    namaGuru: "EPNA SEPTIANA KRISTI, S. Pd",
    muridList: [
      { id: "m-33-1", nama: "RIKI FERDIAN", kelas: "X TSM" },
      { id: "m-33-2", nama: "RIZKY ARDIANSYAH AL-FAUZI", kelas: "X TSM" },
      { id: "m-33-3", nama: "SAIFUDIN DIKA PRATAMA", kelas: "X TSM" },
      { id: "m-33-4", nama: "SULFITRA RAHARJO", kelas: "X TSM" },
      { id: "m-33-5", nama: "WALDY DWI DAFANSYAH", kelas: "X TSM" }
    ]
  },
  {
    id: "gw-34",
    no: 34,
    namaGuru: "MUNATAR TABARA, S.Pd",
    muridList: [
      { id: "m-34-1", nama: "CHINOVAN DWI CAHYA", kelas: "DKV" },
      { id: "m-34-2", nama: "DANIEL FREDY TUNGADY", kelas: "DKV" },
      { id: "m-34-3", nama: "MUHAMAMAD SOFY IFAN HIDAYAT", kelas: "DKV" },
      { id: "m-34-4", nama: "MUHAMMAD NANDA SEPRIAN", kelas: "DKV" },
      { id: "m-34-5", nama: "ANDI ARIAH SAPUTRA", kelas: "DPIB" },
      { id: "m-34-6", nama: "HANAN AFIF", kelas: "DPIB" },
      { id: "m-34-7", nama: "MUH. KHAYRAN AFFAN S.", kelas: "DPIB" },
      { id: "m-34-8", nama: "MUHAMMAD ALRASYID", kelas: "DPIB" }
    ]
  },
  {
    id: "gw-35",
    no: 35,
    namaGuru: "Gusti Himawan Kadiyanto, S.Pd",
    muridList: [
      { id: "m-35-1", nama: "NIA ANISA PUTRI", kelas: "DPIB" },
      { id: "m-35-2", nama: "AHMAD NUR LATIF", kelas: "TEAV" },
      { id: "m-35-3", nama: "MUH. IRFAN", kelas: "TEAV" },
      { id: "m-35-4", nama: "MUHAMMAD BAGAS RIFALDI", kelas: "TEAV" },
      { id: "m-35-5", nama: "NARENDRA JYOTIS KAMA.", kelas: "TEAV" },
      { id: "m-35-6", nama: "RIDO AKBAR MAULANA", kelas: "TEAV" }
    ]
  },
  {
    id: "gw-36",
    no: 36,
    namaGuru: "RUSNI K, S.T",
    muridList: [
      { id: "m-36-1", nama: "AFDHAL FIRAS LAKI LIMA", kelas: "X TAV", keterangan: "TDK NAIK" },
      { id: "m-36-2", nama: "ALDIANSYAH GANI", kelas: "XI TAV" },
      { id: "m-36-3", nama: "ASKAR", kelas: "XI TAV" },
      { id: "m-36-4", nama: "KELANA TEGUH RAHARJA", kelas: "X TAV", keterangan: "TDK NAIK" },
      { id: "m-36-5", nama: "Ketut Aria Rediawan", kelas: "X TAV" },
      { id: "m-36-6", nama: "REHAN", kelas: "X TAV", keterangan: "TDK NAIK" },
      { id: "m-36-7", nama: "RIAS RAHMAT", kelas: "X TAV", keterangan: "TDK NAIK" },
      { id: "m-36-8", nama: "YESIANA", kelas: "X TAV", keterangan: "TDK NAIK" }
    ]
  },
];

export function getMasterGuruWaliData(): GuruWaliMasterItem[] {
  try {
    if (typeof window !== "undefined") {
      const storedVersion = localStorage.getItem("sihadir_master_guru_wali_version");
      const saved = localStorage.getItem("sihadir_master_guru_wali_data");
      
      // If version mismatch or not 36 teachers, update to latest official SK data
      if (storedVersion !== DATA_VERSION_GURU_WALI || !saved) {
        localStorage.setItem("sihadir_master_guru_wali_version", DATA_VERSION_GURU_WALI);
        localStorage.setItem("sihadir_master_guru_wali_data", JSON.stringify(INITIAL_GURU_WALI_MASTER_DATA));
        return INITIAL_GURU_WALI_MASTER_DATA;
      }

      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === INITIAL_GURU_WALI_MASTER_DATA.length) {
        return parsed;
      } else {
        localStorage.setItem("sihadir_master_guru_wali_version", DATA_VERSION_GURU_WALI);
        localStorage.setItem("sihadir_master_guru_wali_data", JSON.stringify(INITIAL_GURU_WALI_MASTER_DATA));
        return INITIAL_GURU_WALI_MASTER_DATA;
      }
    }
  } catch (err) {
    console.error("Error loading master guru wali data:", err);
  }
  return INITIAL_GURU_WALI_MASTER_DATA;
}

export function saveMasterGuruWaliData(data: GuruWaliMasterItem[]) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("sihadir_master_guru_wali_data", JSON.stringify(data));
      localStorage.setItem("sihadir_master_guru_wali_version", DATA_VERSION_GURU_WALI);
    }
  } catch (err) {
    console.error("Error saving master guru wali data:", err);
  }
}

// Helper to find guru wali match by name or username
export function findGuruWaliMatch(uName: string, dataList: GuruWaliMasterItem[] = getMasterGuruWaliData()): GuruWaliMasterItem | null {
  if (!uName) return null;
  const clean = uName.toLowerCase().trim();

  return dataList.find(g => {
    const gName = g.namaGuru.toLowerCase();
    if (gName.includes(clean) || clean.includes(gName)) return true;
    if (clean.includes("arbianti") && gName.includes("arbianti")) return true;
    if (clean.includes("putu") && gName.includes("putu")) return true;
    if (clean.includes("juniyasa") && gName.includes("juni")) return true;
    if (clean.includes("haerul") && gName.includes("haerul")) return true;
    if (clean.includes("muslimin") && gName.includes("muslimin")) return true;
    if (clean.includes("ainal") && gName.includes("ainal")) return true;
    if ((clean.includes("hiswan") || clean.includes("iswan")) && gName.includes("hiswan")) return true;
    if (clean.includes("isnawati") && gName.includes("isna")) return true;
    if (clean.includes("muharjun") && gName.includes("muharjun")) return true;
    if (clean.includes("khotijah") && gName.includes("khotijah")) return true;
    if (clean.includes("salma") && gName.includes("salma")) return true;
    if (clean.includes("saiful") && gName.includes("saiful")) return true;
    if (clean.includes("arham") && gName.includes("arham")) return true;
    if (clean.includes("wahyu") && gName.includes("wahyu")) return true;
    if (clean.includes("eva") && gName.includes("eva")) return true;
    if (clean.includes("daniel") && gName.includes("daniel")) return true;
    if (clean.includes("syamsul") && gName.includes("syamsul")) return true;
    if (clean.includes("nyoman") && gName.includes("nyoman")) return true;
    if (clean.includes("elis") && gName.includes("elis")) return true;
    if (clean.includes("nunung") && gName.includes("nunung")) return true;
    return false;
  }) || null;
}

// Get array of mentored students for a given teacher
export function getMuridBinaanForTeacher(uName: string): BimbinganMuridItem[] {
  const match = findGuruWaliMatch(uName);
  return match?.muridList || [];
}
