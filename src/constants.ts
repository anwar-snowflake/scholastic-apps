import { Student, ClassSession, AttendanceNote } from "./types";

export const MOCK_STUDENTS: Student[] = [
  {
    id: "1",
    name: "Alexander Sterling",
    nis: "LIT-2023-042",
    photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCy6d9YiKdILeNm81NvgS2meYsaaz33BMhj5dDg5FzVIh5kY2VLCXDmDN-eoVtIbifSz8hzYShVM_uiuBNHRsjVxHXaWSBoiDb9ru0LdYNtcjOFPMDsfkgK0Xp87Pabr_3oNO-4Zurj1o82itjkmDvd_XchNCBMHITLmKQdkA4IuuwlUHb3o2-YfoZtj2tp5n3Iob4hx6R1P1-3Wr1OxbiMQR9SO2sJTIMa10hSYEuBEi-2c72yu_V-LkqgRc-YEEW4_DyFl3DACfL7",
    class: "11 - Sastra A",
    attendance: {
      "2023-10-01": "present",
      "2023-10-02": "present",
      "2023-10-03": "absent",
      "2023-10-04": "present",
    }
  },
  {
    id: "2",
    name: "Elena Rodriguez",
    nis: "LIT-2023-018",
    photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqN63ctPbf7q_BvjxUHgtf6skP8ncmiEhJXSZM-vyS5f_POHXwL6eJYi0vWNh-HCQTI4d8FX5FDeQMGRqKQo_8RVpftc19VdOGOvQiGbFTFKSZG15qeTNsZeDswZ8sviYMmtsMnI-U-Lt7xWfj94lh6Wqxkadn68vDeenF9aBoQ-jKvq0f1HWHUGBo__2YYhyEQDysBRc184iix8Z5Tb5gV6rEPfLjNiGus3kcyZj3PSFyKjMaZanf1yTYTRjpJGvYxUu0LuK7HA-Q",
    class: "11 - Sastra A",
    attendance: {
      "2023-10-01": "present",
      "2023-10-02": "absent",
      "2023-10-03": "absent",
      "2023-10-04": "absent",
    }
  },
  {
    id: "3",
    name: "Julian Vance",
    nis: "LIT-2023-094",
    photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBExPFWWfIhl4xxtZwp1icZkuaX8ebed_xXTwhLQ_PJfka2jR0SZxQL6lZRnauBAyeUEbiQu3pLymhR0yRRGR8e3Rjq4hRbcPgV5kcd9ZG_pnwXIW7JKXcCFlSpNnoe7GJiZ14EITO6t642tJWPG0VlnoLDyfRqUwCr1JLZJGGHU3bH2TV_NRfIdKzujSSC1hmGt_Nid171qsn0JKKJpH4JxT1Y_4qorE1fEMOYzjE6vI5J3TEWAe8yBT-ENcMKgDEUhf_kACX5_agE",
    class: "11 - Sastra A",
    attendance: {
      "2023-10-01": "present",
      "2023-10-02": "present",
      "2023-10-03": "present",
      "2023-10-04": "present",
    }
  },
  {
    id: "4",
    name: "Mia Thorne",
    nis: "LIT-2023-005",
    photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8ODS_cd7catGrCrC4f1MbOHaDlpe0iOhrXs9HNgAU8ux_cgvCy9CeXVC-nc0OlchcTU9HGp4KpABmvY_ZVwRvhNwq_W1AeiKUBkWHINcyF4an7k_2a5LKTXuBmuRCNi1mZPrvXNDfWIUJfizPE8OCFA3qUoQL2z6CPKAiACbxuyH3HctXafptUzPO2wg_G-inpZb5MvjG1gbHDhh64IfDLXZCDdrbP01micV3gF0NEgk4rTjmgn92DgRKeecYczDwSc-bnsNWVGGC",
    class: "11 - Sastra A",
    attendance: {
      "2023-10-01": "present",
      "2023-10-02": "present",
      "2023-10-03": "present",
      "2023-10-04": "present",
    }
  }
];

export const MOCK_SESSIONS: ClassSession[] = [
  {
    id: "s1",
    name: "Komposisi Lanjutan",
    room: "Ruang 201",
    startTime: "08:00",
    endTime: "09:30",
    classGroup: "Kelas 11 • Bagian B",
    status: "completed",
    attendanceRate: 98,
    students: ["1", "2", "3", "4"]
  },
  {
    id: "s2",
    name: "Sastra Inggris 301",
    room: "Ruang 402",
    startTime: "10:30",
    endTime: "11:45",
    classGroup: "Kelas 12 • Bagian A",
    status: "ongoing",
    students: ["1", "2", "3", "4"]
  },
  {
    id: "s3",
    name: "Bengkel Penulisan Kreatif",
    room: "Studio Seni",
    startTime: "14:00",
    endTime: "15:30",
    classGroup: "Pilihan • Lintas Tingkat",
    status: "upcoming",
    students: ["1", "2", "3", "4"]
  }
];

export const MOCK_NOTES: AttendanceNote[] = [
  {
    id: "n1",
    studentId: "1",
    date: "2023-10-08",
    type: "sick",
    content: "Izin absen karena demam. Surat keterangan medis telah diunggah oleh orang tua.",
    icon: "Stethoscope"
  },
  {
    id: "n2",
    studentId: "1",
    date: "2023-10-03",
    type: "absent",
    content: "Tidak ada komunikasi yang diterima. Peringatan SMS dikirim ke orang tua pukul 08:45 WIB.",
    icon: "AlertTriangle"
  },
  {
    id: "n3",
    studentId: "1",
    date: "2023-09-28",
    type: "permission",
    content: "Perwakilan Olimpiade Matematika Nasional. ID Peserta: MAT-JKT-12.",
    icon: "Trophy"
  }
];
