
import Header from "@/components/Header"
import StatsCards from "@/components/StatusCards"
import CampaignTable from "@/components/CampaignTable"
import Sidebar from "@/components/Sidebar"

export default function CampaingPage() {
  return (
    // Mudamos bg-brand-black para um grafite profundo e ajustamos o gradiente
    <div className="flex min-h-screen bg-[#0f1115] text-white font-sans">
     
      <main className="flex-1 overflow-y-auto p-10 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),transparent)]">
        {/* Camada de brilho azul bebê no canto oposto */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_bottom_left,_rgba(186,230,253,0.05),transparent)]" />
        
        <div className="relative z-10">
          <Header />
          <StatsCards />
          <CampaignTable />
        </div>
      </main>
    </div>
  )
}