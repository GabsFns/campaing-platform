import { Send, MoreVertical, Calendar, Users, FileText, CheckCircle2 } from 'lucide-react';

export default function CampaignTable() {
  const campaigns = [
    { id: 1, name: 'Coleção Inverno', template: 'PROMO_FRIO', audience: 'Clientes Rio', status: 'Agendado', schedule: '15/03 - 10:00', sent: '0/4250', date: '12/03' },
    // Adicione mais itens aqui
  ];

  return (
    <div className="bg-[#161920]/60 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
      <div className="p-8 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-[#bae6fd] rounded-full shadow-[0_0_10px_#bae6fd]" />
          <h2 className="text-xl font-bold tracking-tight uppercase italic text-white">Relatório de Campanhas</h2>
        </div>
        <button className="px-5 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest">
          Filtrar
        </button>
      </div>

      <div className="overflow-x-auto px-4 pb-8">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">
              <th className="px-6 py-2">Campanha / Template</th>
              <th className="px-6 py-2">Audiência</th>
              <th className="px-6 py-2">Status</th>
              <th className="px-6 py-2 text-center">Agendamento</th>
              <th className="px-6 py-2 text-center">Enviadas</th>
              <th className="px-6 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="group bg-white/[0.02] hover:bg-[#0052ff]/5 transition-all">
                <td className="px-6 py-5 rounded-l-2xl border-l border-y border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0052ff]/10 text-[#bae6fd] flex items-center justify-center border border-[#0052ff]/20">
                      <Send size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{c.name}</p>
                      <p className="text-[9px] text-blue-400 font-black uppercase flex items-center gap-1">
                        <FileText size={10} /> {c.template}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 border-y border-white/5">
                   <div className="flex items-center gap-2 text-gray-300 text-xs font-bold">
                      <Users size={14} className="text-gray-600" /> {c.audience}
                   </div>
                </td>
                <td className="px-6 py-5 border-y border-white/5">
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[9px] font-black uppercase">
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-5 border-y border-white/5 text-center">
                   <p className="text-xs font-mono text-gray-400">{c.schedule}</p>
                </td>
                <td className="px-6 py-5 border-y border-white/5 text-center">
                   <span className="text-xs font-black text-[#bae6fd]">{c.sent}</span>
                </td>
                <td className="px-6 py-5 rounded-r-2xl border-r border-y border-white/5 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}