"use client"

import React, { useState } from 'react'
import { 
  FileText, Plus, Search, Filter, 
  MoreVertical, Layout, Type, Globe, 
  Paperclip, PlusCircle, Link as LinkIcon, X
} from 'lucide-react'
import Sidebar from "@/components/Sidebar"

export default function TemplatesPage() {
  const [showModal, setShowModal] = useState(false)

  const templates = [
    { id: 1, name: 'BOAS_VINDAS_IMPECÁVEL', category: 'Marketing', status: 'Aprovado', variables: '{{1}}', lang: 'PT-BR' },
    { id: 2, name: 'AVISO_COLECAO_NOVA', category: 'Marketing', status: 'Pendente', variables: '{{1}}, {{2}}', lang: 'PT-BR' },
    { id: 3, name: 'RECUPERACAO_CARRINHO_V1', category: 'Utility', status: 'Rejeitado', variables: '{{1}}', lang: 'PT-BR' },
  ]

  return (
    <div className="flex min-h-screen bg-[#0f1115] text-white font-sans overflow-hidden">
    
      
      <main className="flex-1 overflow-y-auto p-10 relative bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),transparent)]">
        {/* Camada de brilho azul bebê fixa no fundo */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_bottom_left,_rgba(186,230,253,0.05),transparent)]" />

        <div className="relative z-10">
          {/* HEADER */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2 text-[#bae6fd] mb-2">
                <Layout size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ativos de Mensagem</span>
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">Templates</h1>
            </div>

            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-3 bg-[#0052ff] hover:bg-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(0,82,255,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
              Novo Template
            </button>
          </div>

          {/* BUSCA */}
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou categoria..." 
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#bae6fd]/30 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* TABELA DE TEMPLATES */}
          <div className="bg-[#161920]/60 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">
                    <th className="px-6 py-2">Template</th>
                    <th className="px-6 py-2">Categoria</th>
                    <th className="px-6 py-2">Status</th>
                    <th className="px-6 py-2 text-center">Variáveis</th>
                    <th className="px-6 py-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={t.id} className="group bg-white/[0.02] hover:bg-[#0052ff]/5 transition-all duration-500">
                      <td className="px-6 py-5 rounded-l-2xl border-l border-y border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#0052ff]/10 flex items-center justify-center text-[#bae6fd] border border-[#0052ff]/20">
                            <FileText size={18} />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white block">{t.name}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">{t.lang}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 border-y border-white/5">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.category}</span>
                      </td>
                      <td className="px-6 py-5 border-y border-white/5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                          t.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          t.status === 'Pendente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 border-y border-white/5 text-center">
                        <span className="font-mono text-[11px] bg-white/5 px-2 py-1 rounded text-[#bae6fd]">{t.variables}</span>
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

      {/* MODAL NOVO TEMPLATE */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-[#161920] border border-white/10 rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 shadow-3xl scrollbar-hide">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Criar Template</h2>
                <p className="text-gray-500 text-sm font-medium">Configure seu modelo oficial para WhatsApp.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Nome e Categoria */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-3 block">Nome do Template</label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input type="text" placeholder="EX: BOAS_VINDAS_01" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 pl-12 outline-none focus:border-[#0052ff]/50 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-3 block">Categoria</label>
                  <select className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 outline-none focus:border-[#0052ff]/50 text-sm appearance-none cursor-pointer">
                    <option className="bg-[#161920]">Marketing</option>
                    <option className="bg-[#161920]">Utility</option>
                  </select>
                </div>
              </div>

              {/* Idioma e Arquivo */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-3 block">Idioma</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <select className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 pl-12 outline-none focus:border-[#0052ff]/50 text-sm appearance-none cursor-pointer">
                      <option className="bg-[#161920]">Português (Brasil)</option>
                      <option className="bg-[#161920]">Inglês</option>
                    </select>
                  </div>
                </div>
                <div>
                   <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-3 block text-emerald-400">Cabeçalho (Opcional)</label>
                   <button className="w-full border border-dashed border-white/10 rounded-2xl p-4 flex items-center justify-center gap-2 text-xs text-gray-500 hover:border-[#bae6fd]/40 hover:bg-white/[0.02] transition-all">
                      <Paperclip size={14} /> Clique para anexar
                   </button>
                </div>
              </div>

              {/* Texto do Template */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block">Corpo do Texto</label>
                  <button className="text-[9px] font-black uppercase text-[#bae6fd] flex items-center gap-1 hover:brightness-110">
                    <PlusCircle size={12} /> Adicionar Variável
                  </button>
                </div>
                <textarea 
                  rows={4} 
                  placeholder="Olá {{1}}, bem-vindo à Impecável Roupas! Seu pedido já está..."
                  className="w-full bg-white/[0.03] border border-white/5 rounded-3xl p-6 outline-none focus:border-[#0052ff]/50 text-sm resize-none italic"
                />
              </div>

              {/* Botão URL */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                 <div className="flex items-center gap-3 mb-2">
                    <LinkIcon size={16} className="text-[#0052ff]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Botão de Ação</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <input type="text" placeholder="Texto do botão (ex: Ver Pedido)" className="flex-1 bg-transparent border-b border-white/10 py-2 outline-none text-xs focus:border-[#bae6fd]" />
                    <input type="text" placeholder="https://..." className="flex-[2] bg-transparent border-b border-white/10 py-2 outline-none text-xs focus:border-[#bae6fd]" />
                 </div>
              </div>

              {/* AÇÕES FINAIS */}
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-white/5 transition-all">
                  Cancelar
                </button>
                <button className="flex-[2] bg-[#0052ff] hover:bg-blue-600 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                  Criar Template Oficial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}