"use client"

import React, { use, useState } from 'react';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';




export default function AccessKeyPage() {
  const [key, setKey] = useState('');

  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decorativo - Glow Azul Bebê sutil */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#bae6fd]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0052ff]/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-md z-10">
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0052ff] to-[#bae6fd] rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(0,82,255,0.3)] mb-6 group hover:rotate-6 transition-transform duration-500">
             <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            Impecável
          </h1>
          <p className="text-[#bae6fd] text-[10px] font-bold uppercase tracking-[0.4em] mt-2 opacity-80">
            Varejo & Moda • Rio de Janeiro
          </p>
        </div>

        {/* ACCESS CARD */}
        <div className="bg-[#161920]/80 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Chave de Acesso</h2>
            <p className="text-gray-500 text-sm font-medium">Insira sua credencial de administrador para gerenciar os disparos.</p>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#bae6fd] transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#0052ff]/50 focus:bg-white/[0.05] transition-all font-mono tracking-widest"
              />
            </div>

            <button className="w-full bg-[#0052ff] hover:bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl shadow-[0_15px_30px_rgba(0,82,255,0.2)] transition-all flex items-center justify-center gap-3 group active:scale-[0.98]">
              Acessar Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
              Sistema de Disparo Impecável v2.0
            </span>
          </div>
        </div>
        
        <p className="text-center mt-10 text-gray-600 text-[10px] uppercase font-bold tracking-widest">
          © {new Date().getFullYear()} Desenvolvido para Impecável Roupas
        </p>
      </div>
    </div>
  );
}