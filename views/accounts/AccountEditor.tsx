
import React, { useState, useEffect } from 'react';
import { 
  UserCog, XCircle, Info, Activity, Package, Sword, Archive, Scroll, 
  Save, MapPin, Key, Coins, Zap, Hash, User, 
  Star, ArrowUpCircle, DollarSign, Shirt, ShieldCheck, Database
} from 'lucide-react';
import { PWRole, FieldDefinition, Language, TRANSLATIONS, PW_DATA, PW_CULTIVATIONS } from '../../types';
import InventoryGrid from './InventoryGrid';
import { getVersionSchema } from '../../pwSchema';
import { PWApiService } from '../../services/pwApi';

interface AccountEditorProps {
  role: PWRole;
  onClose: () => void;
  onSave: (role: PWRole) => void;
  version: string;
  lang: Language;
}

const EQUIP_SLOTS: Record<number, string> = {
  0: 'Arma', 1: 'Elmo', 2: 'Colar', 3: 'Manto', 4: 'Armadura',
  5: 'Cinto', 6: 'Perneira', 7: 'Botas', 8: 'Anel 1', 9: 'Anel 2',
  10: 'Munição', 11: 'Vôo', 12: 'Corpo Moda', 13: 'Perna Moda',
  14: 'Pé Moda', 15: 'Braço Moda', 16: 'Genie', 17: 'Cabeça Moda',
  18: 'Arma Moda', 21: 'Cartas'
};

const SLOT_ORDER = [0, 10, 11, 1, 17, 2, 3, 4, 12, 5, 13, 6, 14, 7, 15, 8, 9, 16, 18, 21];

export const AccountEditor: React.FC<AccountEditorProps> = ({ role, onClose, onSave, version, lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [activeTab, setActiveTab] = useState<'basic'|'status'|'pocket'|'equipment'|'storehouse'|'task'>('basic');
  const [editingRole, setEditingRole] = useState<PWRole>(JSON.parse(JSON.stringify(role)));
  
  const schema = getVersionSchema(version as any);

  useEffect(() => {
    setEditingRole(JSON.parse(JSON.stringify(role)));
  }, [role]);

  const handleFieldChange = (section: 'base' | 'status', key: string, value: string, type: string) => {
    let parsedValue: any = value;
    if (['int', 'byte', 'short', 'lint', 'cuint'].includes(type)) parsedValue = parseInt(value) || 0;
    else if (type === 'float') parsedValue = parseFloat(value) || 0.0;
    setEditingRole(prev => ({ ...prev, [section]: { ...prev[section], [key]: parsedValue } }));
  };

  const renderField = (field: FieldDefinition, section: 'base' | 'status') => {
    const value = editingRole?.[section]?.[field.key];
    if (field.type === 'octets') {
      return (
        <div key={field.key} className="col-span-2 group">
          <label className="block text-[10px] text-purple-400 uppercase mb-1 font-black tracking-widest group-focus-within:text-purple-300">{field.label || field.key}</label>
          <textarea 
            rows={2} 
            defaultValue={value} 
            readOnly={field.readonly} 
            onChange={(e) => handleFieldChange(section, field.key, e.target.value, field.type)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-purple-300 font-mono text-[11px] outline-none focus:border-purple-500 shadow-inner resize-none transition-all" 
          />
        </div>
      );
    }
    return (
      <div key={field.key} className="group">
        <label className="block text-[10px] text-slate-500 uppercase mb-1 font-black tracking-widest group-focus-within:text-cyan-500 transition-colors">{field.label || field.key}</label>
        <input 
            type={['int','float','byte','short','cuint','lint'].includes(field.type) ? 'number' : 'text'} 
            value={value} 
            readOnly={field.readonly} 
            onChange={(e) => handleFieldChange(section, field.key, e.target.value, field.type)}
            className={`w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold outline-none focus:border-cyan-500 transition-all ${field.readonly ? 'opacity-40 cursor-not-allowed bg-slate-900' : 'hover:border-slate-600'}`} 
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-7xl h-[95vh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeIn relative">
        
        {/* Animated Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl z-10">
          <div className="flex items-center space-x-6">
            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-4 rounded-[1.5rem] shadow-xl shadow-cyan-900/20"><UserCog className="w-8 h-8 text-white" /></div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{editingRole.base.name}</h2>
              <div className="flex items-center space-x-4 text-[10px] mt-2 font-black uppercase tracking-widest">
                <span className="text-slate-500 font-mono tracking-normal">DB_ID: {editingRole.base.id}</span>
                <span className="text-slate-700">|</span>
                <span className="text-cyan-500">{PW_DATA.classes.find(c => c.id === editingRole.base.cls)?.[lang]}</span>
                <span className="text-slate-700">|</span>
                <div className="flex items-center bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/20 text-cyan-400">LVL {editingRole.status.level}</div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-red-500/20 rounded-2xl transition-all hover:rotate-90 group">
            <XCircle className="w-8 h-8 text-slate-500 group-hover:text-red-500" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex flex-1 overflow-hidden z-10">
          <div className="w-72 bg-slate-950/40 border-r border-slate-800 p-6 space-y-2 shrink-0">
            {[
                { id: 'basic', icon: Info, label: 'Base Info' },
                { id: 'status', icon: Activity, label: 'Status & Realms' },
                { id: 'pocket', icon: Package, label: 'Pocket (Inventário)' },
                { id: 'equipment', icon: Sword, label: 'Equipment Grid' },
                { id: 'storehouse', icon: Archive, label: 'Banco / Fashion' },
                { id: 'task', icon: Scroll, label: 'Quests & Missões' }
            ].map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center space-x-4 transition-all ${activeTab === tab.id ? 'bg-cyan-600/10 border border-cyan-500/30 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'}`}>
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-cyan-400' : ''}`} />
                  <span className="font-black uppercase tracking-widest text-[11px]">{tab.label}</span>
               </button>
            ))}
            
            <div className="pt-6 mt-6 border-t border-slate-800 space-y-4">
                <div className="px-4 py-3 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Status Protocolo</p>
                    <div className="flex items-center text-emerald-500 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 mr-1" /> GamedBD Synced
                    </div>
                </div>
            </div>
          </div>

          <div className="flex-1 p-10 overflow-y-auto bg-slate-900/30 custom-scrollbar">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
                  {schema.role.base.map(field => renderField(field, 'base'))}
              </div>
            )}
            {activeTab === 'status' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
                  {schema.role.status.map(field => renderField(field, 'status'))}
              </div>
            )}
            {activeTab === 'pocket' && (
               <InventoryGrid items={editingRole.pocket.inv} title="Pocket Slots" lang={lang} 
                onUpdateItem={(pos, it) => setEditingRole({...editingRole, pocket: {...editingRole.pocket, inv: editingRole.pocket.inv.map(x => x.pos === pos ? it : x)}})}
               />
            )}
            {activeTab === 'equipment' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
                   {SLOT_ORDER.map(slotPos => {
                       const item = editingRole.equipment.eqp.find(it => it.pos === slotPos);
                       return (
                           <div key={slotPos} className={`bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4 ${item ? 'hover:border-cyan-500/50 shadow-lg' : 'opacity-30'} transition-all`}>
                               <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center font-mono text-[9px] text-slate-600 uppercase text-center leading-tight">{EQUIP_SLOTS[slotPos] || 'Slot'}</div>
                               <div className="flex-1 min-w-0">
                                   <div className="text-white font-bold text-sm truncate">{item ? (item.name || `Item ${item.id}`) : 'Vazio'}</div>
                                   {item && <div className="text-[10px] text-slate-500 font-mono">ID: {item.id}</div>}
                               </div>
                           </div>
                       );
                   })}
               </div>
            )}
            {activeTab === 'storehouse' && (
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fadeIn">
                    <InventoryGrid items={editingRole.storehouse.store} title="Bank Slots" icon={Archive} lang={lang} />
                    <InventoryGrid items={editingRole.storehouse.dress} title="Fashion Wardrobe" icon={Shirt} lang={lang} />
               </div>
            )}
            {activeTab === 'task' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {schema.role.task.filter(f => !f.key.includes('inventory')).map(field => renderField(field, 'task' as any))}
                </div>
                <InventoryGrid items={editingRole.task.task_inventory} title="Active Quests Inventory" lang={lang} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-800 flex justify-end space-x-4 bg-slate-900/80 backdrop-blur shrink-0 z-10">
          <button onClick={onClose} className="px-8 py-4 text-slate-500 hover:text-white font-black uppercase tracking-[0.2em] text-[11px] transition-colors">{t('cancel')}</button>
          <button onClick={() => onSave(editingRole)} className="px-12 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-2xl shadow-cyan-900/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center">
            <Save className="w-4 h-4 mr-3" /> Aplicar Mudanças Estruturais
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountEditor;
