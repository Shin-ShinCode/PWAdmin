
import React, { useState } from 'react';
import { InventoryItem, Language, TRANSLATIONS } from '../../types';
import { Box, Edit, Package, X, Save, Shield, Calendar, Tag, Hash, Settings, Info } from 'lucide-react';

interface InventoryGridProps {
  items: InventoryItem[];
  title: string;
  icon?: React.ElementType;
  lang: Language;
  onUpdateItem?: (pos: number, updatedItem: InventoryItem) => void;
}

const ItemIcon = ({ item }: { item: InventoryItem }) => {
  const [error, setError] = useState(false);
  const iconSrc = error ? null : item.icon ? `/icons/${item.icon}` : `/icons/${item.id}.png`;

  if (!iconSrc) {
    return (
      <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
        <Box className="w-6 h-6 text-slate-600 opacity-50" />
      </div>
    );
  }

  return (
    <img src={iconSrc} alt={item.name} className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-900 object-cover shrink-0 shadow-lg" onError={() => setError(true)} />
  );
};

const ItemEditorModal = ({ item, lang, onClose, onSave }: { item: InventoryItem, lang: Language, onClose: () => void, onSave: (it: InventoryItem) => void }) => {
    const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
    const [edit, setEdit] = useState<InventoryItem>({ ...item });

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div className="flex items-center space-x-3 text-cyan-400">
                        <Edit className="w-6 h-6" />
                        <span className="font-black uppercase tracking-tighter">Editor Estrutural de Item</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-xl transition-all"><X className="w-6 h-6 text-slate-500" /></button>
                </div>
                
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center space-x-5 bg-slate-950/50 p-4 rounded-2xl border border-slate-800 shadow-inner">
                        <ItemIcon item={item} />
                        <div>
                            <div className="text-white font-black text-lg uppercase tracking-tight">{item.name || `Item ${item.id}`}</div>
                            <div className="text-xs text-slate-500 font-mono uppercase tracking-widest">SLOT: {item.pos} | DB_ID: {item.id}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">ID do Objeto</label>
                            <input type="number" value={edit.id} onChange={e => setEdit({...edit, id: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:border-cyan-500 outline-none transition-all shadow-inner" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Qtd.</label>
                                <input type="number" value={edit.count} onChange={e => setEdit({...edit, count: parseInt(e.target.value) || 1})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white font-mono text-center outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Máx.</label>
                                <input type="number" value={edit.max_count} onChange={e => setEdit({...edit, max_count: parseInt(e.target.value) || 1})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white font-mono text-center outline-none" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-purple-400 mb-2 tracking-widest flex items-center">
                            <Hash className="w-3 h-3 mr-1" /> Dados Binários (Octets/Hex)
                        </label>
                        <textarea rows={3} value={edit.data} onChange={e => setEdit({...edit, data: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-purple-400 font-mono text-xs outline-none focus:border-purple-500 shadow-inner resize-none" placeholder="Ex: 00 AA BB..." />
                        <p className="text-[9px] text-slate-600 mt-2 italic flex items-center"><Info className="w-2.5 h-2.5 mr-1" /> Cuidado: A edição manual de octetos pode corromper o item se o formato for inválido.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Proctype</label>
                            <input type="number" value={edit.proctype} onChange={e => setEdit({...edit, proctype: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Mask (Máscara)</label>
                            <input type="number" value={edit.mask || 0} onChange={e => setEdit({...edit, mask: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Expiração</label>
                            <input type="number" value={edit.expire_date} onChange={e => setEdit({...edit, expire_date: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">GUID Principal (1)</label>
                            <input type="number" value={edit.guid1 || 0} onChange={e => setEdit({...edit, guid1: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">GUID Secundário (2)</label>
                            <input type="number" value={edit.guid2 || 0} onChange={e => setEdit({...edit, guid2: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none" />
                        </div>
                    </div>
                </div>
                
                <div className="p-6 border-t border-slate-800 flex justify-end space-x-4 bg-slate-900/50">
                    <button onClick={onClose} className="px-6 py-2 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all">{t('cancel')}</button>
                    <button onClick={() => onSave(edit)} className="px-10 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-cyan-900/30 transition-all hover:-translate-y-1">
                        <Save className="w-4 h-4 mr-2" /> Commit Protocol Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

const InventoryGrid: React.FC<InventoryGridProps> = ({ items, title, icon: Icon, lang, onUpdateItem }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const handleSaveItem = (updated: InventoryItem) => {
      if (onUpdateItem) onUpdateItem(updated.pos, updated);
      setEditingItem(null);
  };

  return (
  <div className="bg-slate-950/60 rounded-[2rem] border border-slate-800 overflow-hidden font-mono text-sm mb-6 shadow-2xl">
    <div className="bg-slate-900/80 px-8 py-5 border-b border-slate-800 text-slate-300 font-bold flex justify-between items-center backdrop-blur-md">
      <div className="flex items-center">
        {Icon && <Icon className="w-5 h-5 mr-3 text-cyan-500" />}
        <span className="tracking-[0.2em] uppercase text-xs font-black">{title}</span>
      </div>
      <span className="text-[10px] font-black text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">{items.length} SLOTS OCUPADOS</span>
    </div>
    
    <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-800/40 custom-scrollbar">
      {items.length > 0 ? items.map((item, i) => (
        <div key={i} className="px-8 py-4 grid grid-cols-12 gap-6 hover:bg-cyan-500/[0.03] items-center transition-all group">
          <div className="col-span-1 text-slate-600 text-xs font-black font-mono border-r border-slate-800/30">{item.pos}</div>
          
          <div className="col-span-11 flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <ItemIcon item={item} />
                <div>
                    <div className="text-white font-black text-sm uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{item.name || `Item ${item.id}`}</div>
                    <div className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">OBJ_ID: {item.id}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-10">
                  <div className="text-right">
                      <div className="text-[9px] text-slate-700 font-black uppercase tracking-widest mb-0.5">Contagem</div>
                      <div className="text-white font-black text-lg leading-none">{item.count}</div>
                  </div>
                  <div className="text-right w-32 hidden lg:block">
                      <div className="text-[9px] text-slate-700 font-black uppercase tracking-widest mb-0.5">Data Octets</div>
                      <div className="text-purple-500/60 truncate font-mono text-[10px]">{item.data || 'EMPTY'}</div>
                  </div>
                  <button onClick={() => setEditingItem(item)} className="p-3 bg-slate-800 hover:bg-cyan-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg opacity-0 group-hover:opacity-100"><Edit className="w-5 h-5" /></button>
              </div>
          </div>
        </div>
      )) : (
        <div className="p-20 text-center text-slate-700 flex flex-col items-center">
          <Package className="w-12 h-12 opacity-10 mb-4" />
          <span className="font-black uppercase tracking-widest text-xs opacity-30 italic">{t('empty')}</span>
        </div>
      )}
    </div>

    {editingItem && <ItemEditorModal item={editingItem} lang={lang} onClose={() => setEditingItem(null)} onSave={handleSaveItem} />}
  </div>
  );
};

export default InventoryGrid;
