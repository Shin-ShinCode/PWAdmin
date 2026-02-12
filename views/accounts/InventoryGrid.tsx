
import React, { useState } from 'react';
import { InventoryItem, Language, TRANSLATIONS } from '../../types';
import { Edit, Package, X, Save, Hash, Info, Coins } from 'lucide-react';

interface InventoryGridProps {
  items: InventoryItem[];
  title: string;
  icon?: React.ElementType;
  lang: Language;
  money?: number;
  onUpdateItem?: (pos: number, updatedItem: InventoryItem) => void;
}

const ItemEditorModal = ({ item, lang, onClose, onSave }: { item: InventoryItem, lang: Language, onClose: () => void, onSave: (it: InventoryItem) => void }) => {
    const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
    const [edit, setEdit] = useState<InventoryItem>({ ...item });

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h3 className="text-white font-bold text-lg">Editar Item</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center shrink-0">
                            {item.icon ? <img src={`/icons/${item.icon}`} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-6 h-6 text-slate-500" />}
                        </div>
                        <div>
                            <div className="text-white font-bold text-sm">{item.name || `Item ${item.id}`}</div>
                            <div className="text-xs text-slate-500">ID: {item.id}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ID</label>
                            <input type="number" value={edit.id} onChange={e => setEdit({...edit, id: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Count</label>
                            <input type="number" value={edit.count} onChange={e => setEdit({...edit, count: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Octets (Hex)</label>
                        <textarea rows={3} value={edit.data} onChange={e => setEdit({...edit, data: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-300 font-mono text-xs outline-none focus:border-cyan-500" placeholder="00 AA BB..." />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Proctype</label>
                            <input type="number" value={edit.proctype} onChange={e => setEdit({...edit, proctype: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mask</label>
                            <input type="number" value={edit.mask || 0} onChange={e => setEdit({...edit, mask: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs outline-none" />
                        </div>
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expire</label>
                            <input type="number" value={edit.expire_date} onChange={e => setEdit({...edit, expire_date: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs outline-none" />
                        </div>
                    </div>
                </div>
                
                <div className="p-5 border-t border-slate-800 flex justify-end space-x-3 bg-slate-900">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white font-bold text-sm transition-colors">{t('cancel')}</button>
                    <button onClick={() => onSave(edit)} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-sm shadow-lg transition-all flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

const InventoryGrid: React.FC<InventoryGridProps> = ({ items, title, icon: Icon, lang, money, onUpdateItem }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const handleSaveItem = (updated: InventoryItem) => {
      if (onUpdateItem) onUpdateItem(updated.pos, updated);
      setEditingItem(null);
  };

  return (
  <div className="bg-slate-950/30 rounded-xl border border-slate-800 overflow-hidden mb-6">
    <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
      <div className="flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-2 text-cyan-400" />}
        <span className="font-bold text-white text-sm">{title}</span>
      </div>
      {money !== undefined && (
          <div className="flex items-center text-yellow-400 font-bold text-sm">
              <span className="mr-2">{money.toLocaleString()} Moedas</span>
          </div>
      )}
    </div>
    
    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
      <table className="w-full text-left">
        <thead className="bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-wider sticky top-0">
            <tr>
                <th className="px-6 py-3 border-b border-slate-800">Pos</th>
                <th className="px-6 py-3 border-b border-slate-800">ID</th>
                <th className="px-6 py-3 border-b border-slate-800">Name</th>
                <th className="px-6 py-3 border-b border-slate-800">Count</th>
                <th className="px-6 py-3 border-b border-slate-800">Octets</th>
                <th className="px-6 py-3 border-b border-slate-800 w-10"></th>
            </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
            {items.length > 0 ? items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => setEditingItem(item)}>
                    <td className="px-6 py-3 text-slate-400 font-mono text-xs">{item.pos}</td>
                    <td className="px-6 py-3 text-cyan-400 font-mono text-xs">{item.id}</td>
                    <td className="px-6 py-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center">
                                {item.icon ? <img src={`/icons/${item.icon}`} className="w-full h-full object-cover rounded" /> : <Package className="w-4 h-4 text-slate-600" />}
                            </div>
                            <span className="text-white font-bold text-sm">{item.name || `Item ${item.id}`}</span>
                        </div>
                    </td>
                    <td className="px-6 py-3 text-white font-mono text-xs">{item.count}</td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-[10px] max-w-[150px] truncate">{item.data || '∞'}</td>
                    <td className="px-6 py-3 text-right">
                        <Edit className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </td>
                </tr>
            )) : (
                <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-600 italic text-sm">
                        {t('empty')}
                    </td>
                </tr>
            )}
        </tbody>
      </table>
    </div>

    {editingItem && <ItemEditorModal item={editingItem} lang={lang} onClose={() => setEditingItem(null)} onSave={handleSaveItem} />}
  </div>
  );
};

export default InventoryGrid;
