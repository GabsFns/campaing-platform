"use client"

import React, { useState } from 'react'
import { 
  Users, Plus, Search, FileDown, 
  Filter, MoreVertical, Upload,
  Database
} from 'lucide-react'
import Sidebar from "@/components/Sidebar" // Importante manter o mesmo padrão

export default function AudiencePage() {
  const [showModal, setShowModal] = useState(false)

  const audiences = [
    { id: 1, name: 'Clientes Varejo - Rio', contacts: '4.250', status: 'Ativo', date: '12/03/2026' },
    { id: 2, name: 'Leads Inverno 2026', contacts: '890', status: 'Processando', date: '10/03/2026' },
    { id: 3, name: 'Black Friday VIP', contacts: '12.400', status: 'Pausado', date: '01/03/2026' },
  ]

  return (
    // ESTRUTURA IDÊNTICA AO DASHBOARD (bg, flex e font)
    <div className="flex min-h-screen bg-[#0f1115] text-white font-sans overflow-hidden">
    
      
      {/* O MAIN precisa ter os mesmos gradientes para não dar diferença na transição */}
      <main className="flex-1 overflow-y-auto p-10 relative bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),transparent)]">
        
        {/* Glow de contrapartida (Azul Bebê) - O MESMO DO DASHBOARD */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_bottom_left,_rgba(186,230,253,0.05),transparent)]" />

        {/* Conteúdo envolto em Z-10 para ficar acima dos glows */}
        <div className="relative z-10">
          
          {/* HEADER DA PÁGINA */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2 text-[#bae6fd] mb-2">
                <Users size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestão de Base</span>
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">Audiências</h1>
            </div>

            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-3 bg-[#0052ff] hover:bg-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(0,82,255,0.3)] transition-all hover:scale-105"
            >
              <Plus size={20} />
              Nova Audiência
            </button>
          </div>

          {/* BUSCA E FILTROS - Agora com estilo Glass mais claro */}
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar audiência..." 
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#bae6fd]/30 transition-all text-sm font-medium"
              />
            </div>
            <button className="px-6 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-2 text-gray-400 hover:text-white transition-all hover:bg-white/5">
              <Filter size={18} />
              <span className="text-xs font-bold uppercase">Filtros</span>
            </button>
          </div>

          {/* TABELA - Com o mesmo acabamento de borda e transparência do CampaignTable */}
          <div className="bg-[#161920]/60 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">
                    <th className="px-6 py-2">Nome da Lista</th>
                    <th className="px-6 py-2 text-center">Contatos</th>
                    <th className="px-6 py-2">Status</th>
                    <th className="px-6 py-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {audiences.map((list) => (
                    <tr key={list.id} className="group bg-white/[0.02] hover:bg-[#0052ff]/5 transition-all duration-500">
                      <td className="px-6 py-5 rounded-l-2xl border-l border-y border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#0052ff]/10 flex items-center justify-center text-[#bae6fd] border border-[#0052ff]/20">
                            <Database size={18} />
                          </div>
                          <span className="font-bold text-sm text-white">{list.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center border-y border-white/5 font-mono text-[#bae6fd] font-bold">
                        {list.contacts}
                      </td>
                      <td className="px-6 py-5 border-y border-white/5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                          list.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-gray-400 border-white/10'
                        }`}>
                          {list.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 rounded-r-2xl border-r border-y border-white/5 text-right">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 transition-colors">
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL MANTIDO COM ESTILO GLASS */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-[#161920] border border-white/10 rounded-[3rem] w-full max-w-xl p-10 shadow-3xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Nova Audiência</h2>
                <p className="text-gray-500 text-sm">Importe seus contatos via CSV do Chatwoot.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-2 block">Nome da Lista</label>
                <input type="text" placeholder="Ex: Clientes VIP - Verão" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-[#0052ff]/50" />
              </div>

              {/* Área de Dropzone CSV */}
              <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-[#0052ff]/5 hover:border-[#0052ff]/30 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-[#bae6fd]" size={32} />
                </div>
                <p className="font-bold text-sm">Clique para carregar o CSV</p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">Padrão esperado: Nome, Telefone</p>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex gap-4">
                 <div className="text-[#bae6fd]"><FileDown size={20}/></div>
                 <p className="text-[10px] text-blue-200/60 leading-relaxed font-medium uppercase tracking-wider">
                    Dica: Exporte seus contatos no formato .csv para garantir a compatibilidade dos campos.
                 </p>
              </div>

              <button className="w-full bg-[#0052ff] py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">
                Criar Audiência
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}