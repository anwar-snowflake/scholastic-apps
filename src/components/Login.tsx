import React, { useState } from "react";
import { Lock, Mail, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";

interface LoginProps {
  onLoginSuccess: (session: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message === "Invalid login credentials" 
          ? "Email atau password salah." 
          : authError.message);
      } else if (data.session) {
        onLoginSuccess(data.session);
      }
    } catch (err) {
      setError("Gagal terhubung ke Supabase. Cek koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full mx-auto bg-surface-container-lowest p-10 rounded-[2rem] shadow-2xl border border-outline-variant/10"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-container text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock size={32} />
        </div>
        <h2 className="font-headline text-3xl font-black text-on-surface">Masuk Scholastic</h2>
        <p className="text-on-surface-variant font-medium mt-2">Gunakan akun dari Supabase Dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2 pl-4">Alamat Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-outline">
              <Mail size={18} />
            </span>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="nama@sekolah.id"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2 pl-4">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-outline">
              <Lock size={18} />
            </span>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-error text-sm font-bold text-center px-4"
          >
            {error}
          </motion.p>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-on-primary py-5 rounded-2xl font-headline font-black text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : "MASUK"}
        </button>
      </form>
      
    
    </motion.div>
  );
};
