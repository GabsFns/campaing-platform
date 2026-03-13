"use client"
import React, { useState } from "react";
import { CheckCheck, Plus, X, AlertCircle, Calendar, Clock, Phone, Layout, MessageSquare, Zap } from "lucide-react";

export default function StatsCards() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Card Estatística */}
        <div className="bg-white/[0.05] border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg text-[#bae6fd]"><CheckCheck size={20} /></div>
            <span className="text-emerald-400 text-xs font-bold">+2.4%</span>
          </div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Taxa de Entrega</p>
          <h2 className="text-3xl font-bold mt-1 text-white">98.2%</h2>
          <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#bae6fd] shadow-[0_0_10px_#bae6fd] w-[98%]" />
          </div>
        </div>

         {/* RESPOSTAS DA ÚLTIMA CAMPANHA */}
        <div className="bg-white/[0.05] border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><MessageSquare size={20} /></div>
            <span className="text-purple-400 text-xs font-bold">Alta</span>
          </div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Respostas (Últ. 24h)</p>
          <h2 className="text-3xl font-bold mt-1 text-white">1.420</h2>
          <p className="text-[10px] text-gray-500 mt-2 italic">~12% de engajamento</p>
        </div>

        {/* LATÊNCIA DO SISTEMA */}
        <div className="bg-white/[0.05] border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400"><Zap size={20} /></div>
            <span className="text-emerald-400 text-[9px] font-black uppercase">Estável</span>
          </div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Latência API</p>
          <h2 className="text-3xl font-bold mt-1 text-white">42<span className="text-sm ml-1 text-gray-500 font-medium tracking-normal">ms</span></h2>
          <div className="flex gap-1 mt-4 items-end h-4">
            {[4,7,5,8,4,3,6,4,5,7].map((h, i) => (
              <div key={i} style={{height: `${h*10}%`}} className="flex-1 bg-amber-500/40 rounded-t-sm" />
            ))}
          </div>
        </div>


        {/* Card Interativo: NOVO DISPARO */}
        <div 
          onClick={() => setShowModal(true)}
          className="bg-[#0052ff] p-6 rounded-[2rem] shadow-[0_20px_40px_rgba(0,82,255,0.25)] flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all group"
        >
          <h3 className="text-lg font-black leading-tight uppercase italic text-white">Escalar<br />Operação</h3>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[10px] font-bold uppercase text-blue-100">Novo Disparo</span>
            <Plus size={24} className="bg-[#bae6fd] text-[#0052ff] rounded-full p-1 group-hover:rotate-90 transition-transform" />
          </div>
        </div>
      </div>

      {/* MODAL: CRIAR CAMPANHA */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div className="bg-[#161920] border border-white/10 rounded-[3rem] w-full max-w-2xl p-10 shadow-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Nova Campanha</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Disparo em Massa Impecável</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              {/* Nome da Campanha */}
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-2 block">Nome da Campanha</label>
                <input type="text" placeholder="Ex: Promoção Verão 2026" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-[#0052ff]/50" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Audiência */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-2 block">Audiência</label>
                  <div className="relative">
                    <select className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white/50 outline-none appearance-none">
                      <option>Erro ao carregar</option>
                    </select>
                    <AlertCircle size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
                  </div>
                </div>
                {/* Origem */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-2 block text-[#bae6fd]">Origem (WhatsApp)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                    <select className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none appearance-none">
                      <option>Impecável Roupas</option>
                      <option>Suporte Vodorico</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Template */}
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-2 block">Template</label>
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-3">
                  <AlertCircle size={18} className="text-red-500" />
                  <span className="text-xs font-bold text-red-200/60 uppercase">Erro ao carregar templates oficiais</span>
                </div>
              </div>

              {/* Mapeamento de Variáveis (Estado Vazio) */}
              <div className="p-8 border border-dashed border-white/5 rounded-[2rem] text-center bg-white/[0.01]">
                 <Layout size={24} className="mx-auto text-gray-700 mb-2" />
                 <p className="text-[10px] font-bold uppercase text-gray-600 tracking-widest">Mapeamento de Variáveis</p>
                 <p className="text-xs text-gray-500 mt-1">Selecione um template para ver as variáveis.</p>
              </div>

              {/* Agendamento */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-2 block italic text-blue-400">Data do Agendamento</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
                    <input type="date" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-2 block italic text-blue-400">Hora do Disparo</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
                    <input type="time" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none" />
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-4 pt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:bg-white/5 transition-all">
                  Cancelar
                </button>
                <button className="flex-[2] bg-[#0052ff] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(0,82,255,0.2)] hover:bg-blue-600 transition-all active:scale-95">
                  Criar Campanha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}