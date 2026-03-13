import React from "react"

export default function Header(){

return (

<div className="flex justify-between items-center mb-12">

<h1 className="text-3xl font-black italic tracking-tighter uppercase">
Gestão de Disparos
</h1>

<div className="flex items-center gap-6">

<div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">

<div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>

<span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
Chatwoot Online
</span>

</div>

<div className="w-10 h-10 rounded-full bg-brand-blue border border-white/20"/>

</div>

</div>

)

}