# Pelan Integrasi Model Nano Banana & Persona Pakar Reka Bentuk Poster

Pelan ini mengintegrasikan model **Nano Banana** (`gemini-3.1-flash-lite-image`) ke dalam aplikasi NurGrafik bersama suntikan **System Prompt Persona: Pakar Reka Bentuk Grafik Aktiviti Keagamaan & Kemasyarakatan**, menyokong penstrukturan pintar reka bentuk poster dan penjanaan latar visual AI berimpak tinggi untuk WhatsApp (1:1 · 1080 × 1080).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan jawapan interaktif anda:
> 1. **Model Nano Banana (`gemini-3.1-flash-lite-image`)**: Digunakan secara dwifungsi — (a) Penstrukturan maklumat & cadangan susun atur pintar, dan (b) Penjanaan latar seni visual/poster AI beresolusi tinggi 1:1.
> 2. **Fokus Persona AI**: Kontras tinggi, tipografi gergasi mesra warga emas, tiada ruang terbazir (*zero wasted gaps*), dan kejelasan optimum dalam kumpulan WhatsApp.
> 3. **Aliran Kunci API Berbayar (*Paid Model Flow*)**: Selaras dengan garis panduan platform, model siri Nano Banana memerlukan pengesahan kunci API berbayar pengguna.

- **Keputusan Disahkan 1**: Pelaksanaan `gemini-3.1-flash-lite-image` dengan `systemInstruction` persona pakar grafik masjid & komuniti.
- **Keputusan Disahkan 2**: Tiada `responseMimeType` atau `responseSchema` dihantar kepada siri Nano Banana (mengikut spesifikasi SDK rasmi), sebaliknya menggunakan pengekstrakan JSON mantap melalui ekspresi nalar dan penghuraian terselindung.
- **Keputusan Disahkan 3**: Mod penjanaan hibrid — pengguna boleh menjana susun atur poster standard atau mengaktifkan latar poster AI artistik Nano Banana dengan 1 sentuhan.

---

## 1. Overview & Core Concept

- **Apa yang Dibina**:
  1. **Konfigurasi Model Nano Banana (`gemini-3.1-flash-lite-image`)** di bahagian pelayan (`server.ts`) bagi menggantikan model umum, lengkap dengan pengesanan ralat dan fallback pintar.
  2. **Persona Pakar Reka Bentuk**: AI bertindak sebagai pakar grafik kanan yang arif tentang estetika masjid (zamrud, nilam, kaligrafi, gerbang kubah, hierarki maklumat penceramah) dan memastikan setiap poster mudah dibaca oleh jemaah berumur 60-80 tahun.
  3. **Ciri Penjanaan Latar Belakang AI (Nano Banana Image Gen)**: Butang pilihan "Jana Seni Latar AI" yang membolehkan penganjur menghasikan hiasan latar belakang seni bina Islam kontras tinggi 1:1 terus ke atas kanvas.

---

## 2. User Experience & Visual Design

- **Aliran Pengguna (User Flow)**:
  1. Pengguna memasukkan atau menampal teks aktiviti WhatsApp di panel input.
  2. Apabila butang **Jana Poster** ditekan, pelayan memanggil model **Nano Banana** dengan persona pakar reka bentuk:
     - AI menganalisis kesesuaian tema (Zamrud-Emas, Nilam-Malam, Hijau Harmoni, Merak Anggun, Fajar Lembut).
     - AI mengekstrak nama penceramah, kredential/institusi, tarikh Hijrah, dan nombor perhubungan tanpa sebarang kehilangan info.
  3. Pengguna juga mempunyai suis/butang pilihan baharu: **🎨 Latar Seni AI (Nano Banana)** untuk menjana seni ilustrasi tema masjid/komuniti 1:1 beresolusi tinggi.
  4. Kanvas pratonton segera mengemas kini visual dengan kontras tinggi, teks penceramah tebal gergasi, dan nombor WhatsApp yang menonjol.

- **Tipografi & Kontras Mesra Warga Emas**:
  - Penceramah: **46px – 48px Extra-Bold**.
  - Butiran Program (Tarikh, Masa, Tempat): **28px – 32px Bold**.
  - Tarikh Hijrah: **24px Bold Gold**.
  - Hubungi/WhatsApp: Kotak sorotan emas **25px Bold**.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Pemilihan Model Nano Banana (`gemini-3.1-flash-lite-image`)**:
  - *Pendekatan*: Menetapkan pengecam model rasmi `gemini-3.1-flash-lite-image` di dalam pelayan `@google/genai`.
  - *Sebab*: Memenuhi permintaan khusus pengguna untuk menggunakan model Nano Banana dan memanfaatkan keupayaan dwi-modalnya (teks reka bentuk + imej).
  - *Alternatif*: Model teks sahaja (cth: `gemini-3.8-flash`) ditolak kerana pengguna mahukan Nano Banana.

- **Keputusan 2: Suntikan Persona Pakar Melalui `systemInstruction`**:
  - *Pendekatan*: Memasukkan arahan sistem persona rasmi yang mendefinisikan kepakaran reka bentuk poster aktiviti keagamaan dan kemasyarakatan di peringkat pelayan.
  - *Sebab*: Menghasilkan keputusan penstrukturan reka bentuk yang lebih berwibawa, konsisten, dan peka kepada keperluan kariah masjid.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (React SPA)                 │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │   InputPanel.tsx      │   │  PosterPreview.tsx   │  │
│  │  - Teks Pengumuman    │   │  - Kanvas 1080x1080  │  │
│  │  - Jana Poster AI     │   │  - Mod Simulator WA  │  │
│  │  - Suis Seni Nano     │   │  - Muat Turun PNG    │  │
│  └───────────┬───────────┘   └──────────▲───────────┘  │
└──────────────┼──────────────────────────┼──────────────┘
               │ POST /api/parse-event    │
               │ POST /api/generate-bg    │
               ▼                          │
┌─────────────────────────────────────────┴──────────────┐
│                   BACKEND (server.ts)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  GoogleGenAI SDK (Server-Side)                   │  │
│  │  - Model: 'gemini-3.1-flash-lite-image'          │  │
│  │  - System Prompt: Expert Islamic Poster Designer │  │
│  │  - Output: JSON Design Structure & 1:1 Art Base64│  │
│  │  - Heuristic Fallback: 100% Zero-Downtime Safe   │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

- **Langkah-langkah Pelaksanaan**:
  1. **Konfigurasi Pelayan (`server.ts`)**: Kemas kini panggilan Gemini kepada `gemini-3.1-flash-lite-image`, masukkan `systemInstruction` persona pakar grafik agama & kariah, dan bina endpoint `/api/generate-bg` untuk seni latar AI.
  2. **Pengurusan Kunci Berbayar**: Panggil modal `show_aistudio_ui` untuk `ui_type: "paid_model_flow"` sebelum mengaktifkan siri Nano Banana.
  3. **Antara Muka (`InputPanel.tsx` & `canvasRenderer.ts`)**: Tambah butang jana seni latar AI pilihan Nano Banana dan sokongan render latar pada kanvas 1080x1080.
  4. **Pengesahan & Ujian**: Jalankan `compile_applet` dan `lint_applet` untuk memastikan sifar ralat.
