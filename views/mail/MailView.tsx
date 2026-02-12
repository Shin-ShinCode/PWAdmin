
import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, Box, Coins, Users, User, Edit, Settings, Calendar, Key, Tag, Hash, Package, Info, Loader2 } from 'lucide-react';
import { Language, TRANSLATIONS, MailPayload } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface MailViewProps {
  lang: Language;
}

const ItemPreview = ({ itemId }: { itemId: number }) => {
    const [error, setError] = useState(false);
    useEffect(() => setError(false), [itemId]);

    if (!itemId) return (
        <div className="w-12 h-12 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed flex items-center justify-center">
            <Package className="w-5 h-5 text-slate-600" />
        </div>
    );

    return (
        <div className="relative group">
            <div className="w-14 h-14 bg-slate-950 rounded-xl border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-lg group-hover:border-cyan-500 transition-all">
                {!error ? (
                    <img 
                        src={`/icons/${itemId}.png`} 
                        alt="Icon" 
                        className="w-full h-full object-cover" 
                        onError={() => setError(true)} 
                    />
                ) : (
                    <Box className="w-8 h-8 text-slate-500" />
                )}
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.6)]"></div>
        </div>
    );
};

export const MailView: React.FC<MailViewProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [isBulk, setIsBulk] = useState(false);
  const [receiverList, setReceiverList] = useState('');
  
  const [form, setForm] = useState<MailPayload>({
      receiverId: 0,
      subject: '',
      message: '',
      itemId: 0,
      itemCount: 1,
      money: 0,
      proctype: 0,
      mask: 0,
      expire_date: 0,
      guid1: 0,
      guid2: 0,
      itemOctets: '00'
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    if (isBulk) {
        const ids = receiverList.split(/[\n,]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        for (const id of ids) {
            await PWApiService.sendMail({ ...form, receiverId: id });
        }
    } else {
        await PWApiService.sendMail(form);
    }

    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
    // Reset subject and message but keep advanced configs if desired
    setForm(prev => ({ ...prev, subject: '', message: '' })); 
    if(isBulk) setReceiverList('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-10">
       <div className="glass-panel p-10 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5">
             <Mail className="w-48 h-48" />
         </div>

         <div className="flex justify-between items-center mb-10 relative z-10">
            <div className="flex items-center">
                <div className="bg-cyan-500/10 p-3 rounded-2xl mr-5 border border-cyan-500/30">
                    <Mail className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">Expresso API Correio</h2>
                    <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Protocolo v156/v1.5.x Core Delivery</p>
                </div>
            </div>
            
            <div className="flex bg-slate-900 rounded-xl p-1.5 border border-slate-800 shadow-inner">
                <button 
                    onClick={() => setIsBulk(false)}
                    className={`px-6 py-2 text-xs font-black rounded-lg flex items-center transition-all uppercase tracking-widest ${!isBulk ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <User className="w-4 h-4 mr-2" /> Único
                </button>
                <button 
                    onClick={() => setIsBulk(true)}
                    className={`px-6 py-2 text-xs font-black rounded-lg flex items-center transition-all uppercase tracking-widest ${isBulk ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Users className="w-4 h-4 mr-2" /> Massa
                </button>
            </div>
         </div>

         <form onSubmit={handleSend} className="space-y-10 relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             <div className="space-y-6">
               {isBulk ? (
                   <div className="group">
                    <label className="text-xs font-black text-slate-500 uppercase mb-3 block tracking-widest">Lista de Destinatários (RoleIDs)</label>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-cyan-400 h-[180px] focus:ring-1 focus:ring-cyan-500 outline-none font-mono text-sm shadow-inner"
                        placeholder="1024, 1025, 2048&#10;3124&#10;..."
                        value={receiverList}
                        onChange={e => setReceiverList(e.target.value)}
                        required
                    />
                    <p className="text-[10px] text-slate-600 mt-2 flex items-center italic"><Info className="w-3 h-3 mr-1"/> Aceita vírgulas ou quebras de linha.</p>
                   </div>
               ) : (
                   <div className="group">
                    <label className="text-xs font-black text-slate-500 uppercase mb-3 block tracking-widest">{t('receiver_id')}</label>
                    <input 
                        type="number" 
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono text-lg shadow-inner" 
                        placeholder="Ex: 1024" 
                        required
                        value={form.receiverId || ''}
                        onChange={e => setForm({...form, receiverId: parseInt(e.target.value)})}
                    />
                   </div>
               )}
             </div>
             
             <div className="space-y-6">
                <div className="group">
                    <label className="text-xs font-black text-slate-500 uppercase mb-3 block tracking-widest">{t('subject')}</label>
                    <input 
                        type="text" 
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-1 focus:ring-cyan-500 outline-none transition-all shadow-inner" 
                        placeholder="Assunto da mensagem..." 
                        required 
                        value={form.subject}
                        onChange={e => setForm({...form, subject: e.target.value})}
                    />
                </div>
                <div className="group">
                    <label className="text-xs font-black text-slate-500 uppercase mb-3 block tracking-widest">{t('message')}</label>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-slate-300 h-32 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none shadow-inner" 
                        placeholder="Conteúdo da mensagem..."
                        value={form.message}
                        onChange={e => setForm({...form, message: e.target.value})}
                    ></textarea>
                </div>
             </div>
           </div>

           <div className="p-8 bg-slate-900/50 rounded-[2rem] border border-slate-800 space-y-8 shadow-inner relative group">
             <div className="absolute top-0 left-0 w-2 h-full bg-cyan-600 rounded-l-[2rem] opacity-40"></div>
             <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em] flex items-center">
               <Box className="w-5 h-5 mr-3" />
               Configuração de Anexos
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
               <div className="flex items-center space-x-5 col-span-2">
                  <ItemPreview itemId={form.itemId} />
                  <div className="flex-1">
                      <label className="text-[10px] text-slate-500 uppercase font-black mb-2 block tracking-widest">{t('item_id')}</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none font-mono shadow-inner" placeholder="0" value={form.itemId || ''} onChange={e => setForm({...form, itemId: parseInt(e.target.value)})} />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black mb-2 block tracking-widest">{t('amount')}</label>
                  <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none shadow-inner" placeholder="1" value={form.itemCount} onChange={e => setForm({...form, itemCount: parseInt(e.target.value)})} />
               </div>
               <div>
                  <label className="text-[10px] text-yellow-500 uppercase font-black mb-2 block tracking-widest flex items-center"><Coins className="w-3.5 h-3.5 mr-2"/> Moedas (Gold)</label>
                  <input type="number" className="w-full bg-slate-950 border border-yellow-800/30 rounded-xl px-4 py-3 text-yellow-400 placeholder-yellow-800 focus:border-yellow-500 outline-none font-mono shadow-inner" placeholder="0" value={form.money || ''} onChange={e => setForm({...form, money: parseInt(e.target.value)})} />
               </div>
             </div>
             
             <div className="pt-8 border-t border-slate-800 mt-6">
                <label className="text-[10px] text-purple-400 mb-6 block flex items-center font-black uppercase tracking-[0.3em]">
                    <Settings className="w-4 h-4 mr-3" />
                    Campos Avançados (API Protocol)
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 shadow-inner">
                        <label className="text-[9px] text-slate-600 mb-2 block font-black uppercase tracking-widest">Proctype</label>
                        <input type="number" className="w-full bg-transparent border-none px-1 text-xs text-purple-300 font-mono outline-none" value={form.proctype} onChange={e => setForm({...form, proctype: parseInt(e.target.value)})} />
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 shadow-inner">
                        <label className="text-[9px] text-slate-600 mb-2 block font-black uppercase tracking-widest">Mask</label>
                        <input type="number" className="w-full bg-transparent border-none px-1 text-xs text-purple-300 font-mono outline-none" value={form.mask} onChange={e => setForm({...form, mask: parseInt(e.target.value)})} />
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 shadow-inner">
                        <label className="text-[9px] text-slate-600 mb-2 block font-black uppercase tracking-widest">Expiração</label>
                        <input type="number" className="w-full bg-transparent border-none px-1 text-xs text-purple-300 font-mono outline-none" value={form.expire_date} onChange={e => setForm({...form, expire_date: parseInt(e.target.value)})} />
                    </div>
                     <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 shadow-inner">
                        <label className="text-[9px] text-slate-600 mb-2 block font-black uppercase tracking-widest">GUID (Hex)</label>
                         <div className="flex space-x-1">
                            <input type="number" className="w-1/2 bg-transparent border-none px-1 text-[10px] text-purple-300 font-mono outline-none" value={form.guid1} onChange={e => setForm({...form, guid1: parseInt(e.target.value)})} />
                            <input type="number" className="w-1/2 bg-transparent border-none px-1 text-[10px] text-purple-300 font-mono outline-none" value={form.guid2} onChange={e => setForm({...form, guid2: parseInt(e.target.value)})} />
                         </div>
                    </div>
                </div>

                <div className="group">
                    <label className="text-[9px] text-purple-500/70 mb-3 block flex items-center font-black uppercase tracking-widest">
                        <Edit className="w-3.5 h-3.5 mr-2" />
                        Octetos de Dados Adicionais (Item Octets Hex)
                    </label>
                    <input 
                        type="text" 
                        className="w-full bg-slate-950 border border-purple-900/30 rounded-xl px-5 py-3 text-purple-400 font-mono text-xs focus:border-purple-500 outline-none transition-all shadow-inner" 
                        placeholder="FF 00 FF 00..."
                        value={form.itemOctets} 
                        onChange={e => setForm({...form, itemOctets: e.target.value})} 
                    />
                </div>
             </div>
           </div>

           <div className="flex justify-end pt-4">
             <button 
               type="submit" 
               disabled={status === 'sending'}
               className={`px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center shadow-2xl ${
                 status === 'success' 
                   ? 'bg-green-600 text-white shadow-green-900/40 scale-105' 
                   : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/40 hover:-translate-y-1 active:translate-y-0'
               }`}
             >
               {status === 'sending' ? (
                 <>
                   <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                   Executando Queue...
                 </>
               ) : status === 'success' ? (
                 <>
                   <CheckCircle className="w-6 h-6 mr-3" />
                   Protocolo Enviado!
                 </>
               ) : (
                 <>
                   <Mail className="w-6 h-6 mr-3" />
                   Distribuir Correio
                 </>
               )}
             </button>
           </div>
         </form>
       </div>
    </div>
  );
};
