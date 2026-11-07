# Kontrak API Backend (docs/API_CONTRACT.md)

**Platform:** belajar.in  
**Status:** Dokumen Spesifikasi Serah-Terima (Backend-Ready Handover Contract)  
**Versi Spesifikasi:** 1.0.0 (OpenAPI 3.1 & TypeScript Strict Compatible)  
**Protokol:** HTTPS REST API, JSON Payload, JWT Bearer Token Authentication  

---

## 1. Arsitektur Komunikasi & Prinsip Handover

Platform **belajar.in** dibangun dengan prinsip *frontend-first, backend-ready*. Seluruh logika client-side diabstraksikan di balik antarmuka service TypeScript (`src/services/types.ts`):
- `AuthService`
- `ProgressService`
- `LeaderboardService`
- `AIGateway`

Ketika backend resmi diimplementasikan, tim backend cukup mengimplementasikan endpoint di bawah ini sesuai skema data yang ditentukan, dan frontend tinggal mengubah konfigurasi `mode: 'local'` menjadi `mode: 'remote'` tanpa mengubah satupun baris antarmuka komponen UI.

---

## 2. Standar Header & Penanganan Galat Global

### 2.1 Header Permintaan Standar
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt_access_token>
X-Client-Version: 0.1.0
```

### 2.2 Format Respons Galat Baku (RFC 7807 Problem Details)
Semua kegagalan HTTP (4xx / 5xx) wajib mengembalikan format seragam:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email atau kata sandi yang Anda masukkan salah.",
    "details": [
      {
        "field": "password",
        "issue": "Kata sandi minimal 6 karakter."
      }
    ],
    "timestamp": "2026-11-07T04:30:00.000Z"
  }
}
```

---

## 3. Spesifikasi Endpoint

### 3.1 Modul Autentikasi (`/api/auth`)

#### `POST /api/auth/register`
Mendaftarkan akun baru.
- **Request Body:**
```json
{
  "username": "budi_santoso",
  "email": "budi@example.com",
  "password": "PasswordAman123!"
}
```
- **Response 201 Created:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr_9f8e7d6c",
    "username": "budi_santoso",
    "email": "budi@example.com",
    "streak": 1,
    "xp": 10,
    "coins": 50,
    "hoursSpent": 0.1,
    "lastCheckIn": "2026-11-07",
    "createdAt": "2026-11-07T04:30:00.000Z"
  }
}
```

#### `POST /api/auth/login`
Autentikasi kredensial pengguna.
- **Request Body:**
```json
{
  "email": "budi@example.com",
  "password": "PasswordAman123!"
}
```
- **Response 200 OK:** Mengembalikan token JWT dan objek profil pengguna.

#### `POST /api/auth/logout`
Membatalkan sesi token aktif di server (token revocation / denylist).
- **Response 200 OK:**
```json
{ "success": true, "message": "Sesi berhasil ditutup." }
```

---

### 3.2 Modul Pengguna, Gamifikasi & Rank (`/api/user`)

#### `GET /api/user/me`
Mengambil profil akun yang sedang login.
- **Response 200 OK:** Profil lengkap pengguna beserta statistik streak, XP, koin, dan total jam belajar.

#### `POST /api/user/checkin`
Klaim hadiah check-in harian dinamis.
- **Rules:** Menghasilkan 50 koin jika beruntun (streak bertambah), atau 10 koin jika terputus.
- **Response 200 OK:**
```json
{
  "awarded": true,
  "coinsAwarded": 50,
  "newStreak": 5,
  "totalCoins": 420
}
```

#### `POST /api/user/award-xp`
Pemberian XP atas penyelesaian latihan atau kuis.
- **Request Body:**
```json
{
  "exerciseKey": "exercise_javascript_j3_event_loop",
  "xpAmount": 25
}
```
- **Response 200 OK:**
```json
{
  "awarded": true,
  "xpEarned": 25,
  "totalXp": 525,
  "newRank": {
    "tier": "Heroic",
    "badge": "heroic",
    "minXp": 501,
    "maxXp": 700
  }
}
```

---

### 3.3 Modul Papan Peringkat (`/api/leaderboard`)

#### `GET /api/leaderboard?limit=50&offset=0`
Daftar peringkat global 4 kolom (*No | Username | Nama Rank | Total XP*).
- **Response 200 OK:**
```json
{
  "totalParticipants": 1420,
  "leaderboard": [
    {
      "rankNumber": 1,
      "username": "siti_alpro",
      "rankName": "Immortal",
      "totalXp": 3450
    },
    {
      "rankNumber": 2,
      "username": "fajar_py",
      "rankName": "Grandmaster",
      "totalXp": 1820
    }
  ]
}
```

---

### 3.4 Modul Pelacakan Penguasaan BKT & Progres (`/api/bkt`)

#### `GET /api/bkt/mastery`
Mengambil state probabilitas penguasaan Bayesian Knowledge Tracing ($P(L)$) untuk setiap simpul konsep kurikulum pengguna.
- **Response 200 OK:**
```json
{
  "mastery": [
    { "conceptId": "js_event_loop", "pL": 0.88, "isMastered": true, "updatedAt": "2026-11-07T04:30:00Z" },
    { "conceptId": "py_dataclasses", "pL": 0.91, "isMastered": true, "updatedAt": "2026-11-07T04:30:00Z" }
  ]
}
```

#### `POST /api/bkt/update`
Memperbarui state $P(L)$ setelah pelajar menjawab kuis atau latihan.
- **Request Body:**
```json
{
  "conceptId": "js_event_loop",
  "correct": true
}
```
- **Response 200 OK:** Nilai $P(L)$ baru dan status kelulusan mastery gate ($\ge 0.85$).

---

### 3.5 Modul AI Tutor Sokratik (`/api/tutor`)

#### `POST /api/tutor/hint`
Meminta tangga petunjuk Sokratik bertahap dari adapter model yang telah disertifikasi (`eval/GATES.md`).
- **Request Body:**
```json
{
  "conceptTitle": "Event Loop, Microtasks & AbortController (J3)",
  "lessonId": "J3",
  "stage": 1,
  "userQuestion": "Kenapa try/catch tidak bisa menangkap error di dalam setTimeout?",
  "studentCode": "try { setTimeout(() => { throw new Error('err'); }, 100); } catch (e) { ... }"
}
```
- **Response 200 OK:**
```json
{
  "stage": 1,
  "hint": "Coba perhatikan waktu eksekusi: saat timer setTimeout terpicu dan error dilempar, di manakah fungsi try/catch berada di dalam Call Stack?",
  "groundedCitations": ["[Modul J3: JavaScript Asinkron]", "HTML Living Standard §8.1.6"],
  "isDirectSolution": false
}
```
