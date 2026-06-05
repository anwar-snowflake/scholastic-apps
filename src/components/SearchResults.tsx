import React, { useState, useEffect } from "react";
import { Search, User, School, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";

interface SearchResultsProps {
  query: string;
  onSelect: (type: 'student' | 'class', id: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ query, onSelect }) => {
  const [results, setResults] = useState<{ students: any[], classes: any[] }>({ students: [], classes: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;
      setIsLoading(true);

      const [studentRes, classRes] = await Promise.all([
        supabase.from('students').select('*').ilike('name', `%${query}%`).limit(5),
        supabase.from('classes').select('*').ilike('name', `%${query}%`).limit(5)
      ]);

      setResults({
        students: studentRes.data || [],
        classes: classRes.data || []
      });
      setIsLoading(false);
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] text-outline">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="font-bold uppercase tracking-widest text-xs">Mencari database...</p>
      </div>
    );
  }

  const totalResults = results.students.length + results.classes.length;

  if (totalResults === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center text-outline mb-6 opacity-50">
          <Search size={40} />
        </div>
        <h2 className="text-3xl font-black font-headline text-on-surface mb-2">Tidak ada hasil.</h2>
        <p className="text-on-surface-variant max-w-sm">
          Kami tidak menemukan siswa atau kelas yang cocok dengan kata kunci "{query}".
        </p>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl font-black font-headline text-on-surface mb-2">Hasil Pencarian.</h1>
        <p className="text-on-surface-variant text-lg">Ditemukan {totalResults} kecocokan untuk "{query}"</p>
      </header>

      <div className="space-y-12">
        {/* Classes Section */}
        {results.classes.length > 0 && (
          <section>
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-6 pl-4">
              <School size={16} />
              Kelas Ditemukan
            </div>
            <div className="grid gap-3">
              {results.classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => onSelect('class', cls.id)}
                  className="w-full flex items-center justify-between p-6 bg-surface-container-low rounded-3xl hover:bg-primary/10 group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <School size={24} />
                    </div>
                    <span className="text-xl font-bold font-headline">{cls.name}</span>
                  </div>
                  <ArrowRight size={20} className="text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Students Section */}
        {results.students.length > 0 && (
          <section>
            <div className="flex items-center gap-2 text-secondary font-bold uppercase tracking-widest text-xs mb-6 pl-4">
              <User size={16} />
              Siswa Ditemukan
            </div>
            <div className="grid gap-3">
              {results.students.map(student => (
                <button
                  key={student.id}
                  onClick={() => onSelect('student', student.id)}
                  className="w-full flex items-center justify-between p-6 bg-white rounded-3xl hover:bg-secondary/10 group transition-all shadow-sm border border-outline-variant/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-high group-hover:scale-110 transition-transform">
                      <img 
                        src={student.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} 
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <span className="block text-xl font-bold font-headline">{student.name}</span>
                      <span className="text-xs text-outline font-medium tracking-widest uppercase">NIS: {student.nis}</span>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
