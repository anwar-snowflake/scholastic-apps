# Panduan Integrasi Supabase - The Scholastic

Berikut adalah langkah-langkah untuk mengintegrasikan Supabase ke dalam aplikasi ini:

### 1. Persiapan di Supabase
1. Buka [Supabase Dashboard](https://supabase.com) dan buat proyek baru.
2. Setelah proyek siap, buka menu **Settings** > **API**.
3. Salin **Project URL** dan **anon key**.

### 2. Konfigurasi Variabel Lingkungan (Environment Variables)
Tambahkan kredensial tersebut ke file `.env.example` (dan pastikan Anda mengaturnya di panel Secrets AI Studio):

```env
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Inisialisasi Supabase Client
Buat file baru di `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase credentials missing!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 4. Contoh Penggunaan (Fetching Data)
Anda dapat mengganti data mock di `src/App.tsx` atau komponen lainnya dengan data real dari Supabase:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// Di dalam komponen:
const [students, setStudents] = useState([]);

useEffect(() => {
  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*');
    
    if (data) setStudents(data);
  };
  
  fetchStudents();
}, []);
```

### 5. Struktur Tabel yang Disarankan
Berdasarkan desain aplikasi ini, Anda bisa membuat tabel berikut:
- `students`: `id`, `name`, `nis`, `photo_url`, `class_name`
- `attendance`: `id`, `student_id`, `date`, `status` (enum: present, sick, permission, absent)
- `notes`: `id`, `student_id`, `date`, `type`, `content`
