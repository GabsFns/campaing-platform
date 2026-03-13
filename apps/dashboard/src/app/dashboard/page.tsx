import Header from "@/components/Header"
import StatsCards from "@/components/StatusCards"
import CampaignTable from "@/components/CampaignTable"
import Sidebar from "@/components/Sidebar"
import { BarChart3, Clock, ArrowUpRight, Activity } from "lucide-react"

export default function PremiumDashboard() {
  return (
    <div className="flex min-h-screen bg-[#0f1115] text-white font-sans overflow-hidden">
     
      
      <main className="flex-1 overflow-y-auto p-10 relative bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),transparent)]">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_bottom_left,_rgba(186,230,253,0.05),transparent)]" />
        
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <Header />
          
          <StatsCards />

          {/* SEÇÃO DE ANALYTICS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* GRÁFICO DE VOLUME (SIMULADO) */}
            <div className="lg:col-span-2 bg-[#161920]/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Volume de Envios</h3>
                  <p className="text-xs text-gray-500">Performance dos últimos 7 dias</p>
                </div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-[#0052ff]" /> Sucesso
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-white/10" /> Falhas
                   </div>
                </div>
              </div>
              
              {/* Barras de Gráfico */}
              <div className="flex items-end justify-between h-48 gap-4 px-4">
                {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="w-full relative flex flex-col justify-end gap-1 h-full">
                      <div style={{height: `${h}%`}} className="w-full bg-[#0052ff] rounded-t-lg group-hover:bg-[#bae6fd] transition-all shadow-[0_0_20px_rgba(0,82,255,0.2)]" />
                      <div style={{height: `${h/4}%`}} className="w-full bg-white/5 rounded-t-sm" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-600 uppercase">Dia {i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ATIVIDADE RECENTE / SAÚDE DO SISTEMA */}
            <div className="bg-[#161920]/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-widest text-white italic mb-6">Status dos Nodes</h3>
              
              <div className="space-y-6">
                {[
                  { label: "Webhook Whatsapp", status: "Online", time: "12ms", color: "bg-emerald-500" },
                  { label: "Servidor de Arquivos", status: "Online", time: "08ms", color: "bg-emerald-500" },
                  { label: "Banco de Dados (RDS)", status: "Carga Alta", time: "142ms", color: "bg-amber-500" },
                ].map((node, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${node.color} shadow-[0_0_8px] shadow-current`} />
                      <span className="text-xs font-bold text-gray-300">{node.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{node.time}</span>
                  </div>
                ))}
              </div>

              <button className="mt-auto w-full py-4 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                <Activity size={14} /> Ver Logs de Sistema
              </button>
            </div>

          </div>

          <CampaignTable />
        </div>
      </main>
    </div>
  )
}