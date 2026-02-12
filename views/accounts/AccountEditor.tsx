
import React, { useState, useEffect } from 'react';
import { 
  UserCog, XCircle, Info, Activity, Package, Sword, Archive, Scroll, 
  Save, ShieldCheck
} from 'lucide-react';
import { PWRole, FieldDefinition, Language, TRANSLATIONS, PW_DATA } from '../../types';
import InventoryGrid from './InventoryGrid';
import { getVersionSchema } from '../../pwSchema';

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
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{field.label || field.key}</label>
          <textarea 
            rows={2} 
            defaultValue={value} 
            readOnly={field.readonly} 
            onChange={(e) => handleFieldChange(section, field.key, e.target.value, field.type)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono text-xs outline-none focus:border-cyan-500 shadow-inner resize-none transition-all" 
          />
        </div>
      );
    }
    return (
      <div key={field.key} className="group">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{field.label || field.key}</label>
        <input 
            type={['int','float','byte','short','cuint','lint'].includes(field.type) ? 'number' : 'text'} 
            value={value} 
            readOnly={field.readonly} 
            onChange={(e) => handleFieldChange(section, field.key, e.target.value, field.type)}
            className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white font-bold outline-none focus:border-cyan-500 transition-all ${field.readonly ? 'opacity-40 cursor-not-allowed bg-slate-900' : 'hover:border-slate-600'}`} 
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-7xl h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-fadeIn relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10">
          <div className="flex items-center space-x-4">
            <div className="bg-cyan-600/10 p-3 rounded-full border border-cyan-500/20"><UserCog className="w-6 h-6 text-cyan-400" /></div>
            <div>
              <h2 className="text-xl font-bold text-white">Editor de Personagem</h2>
              <div className="flex items-center space-x-3 text-xs mt-1">
                <span className="text-slate-500">ID: {editingRole.base.id}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-500">Login: {editingRole.user_login}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors group">
            <XCircle className="w-6 h-6 text-slate-500 group-hover:text-white" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex flex-1 overflow-hidden z-10">
          <div className="w-64 bg-slate-950/50 border-r border-slate-800 p-4 space-y-1 shrink-0">
            {[
                { id: 'basic', icon: Info, label: 'Informações Básicas' },
                { id: 'status', icon: Activity, label: 'Status / Atributos' },
                { id: 'pocket', icon: Package, label: 'Inventário' },
                { id: 'equipment', icon: Sword, label: 'Equipamentos' },
                { id: 'storehouse', icon: Archive, label: 'Banco / Fashion' },
                { id: 'task', icon: Scroll, label: 'Quests' }
            ].map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all ${activeTab === tab.id ? 'bg-cyan-600/10 border-l-2 border-cyan-400 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}>
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-cyan-400' : ''}`} />
                  <span className="font-bold text-xs">{tab.label}</span>
               </button>
            ))}
            
            <div className="pt-4 mt-4 border-t border-slate-800">
                <div className="px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status Protocolo</p>
                    <div className="flex items-center text-emerald-500 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 mr-1" /> GamedBD Synced
                    </div>
                </div>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto bg-slate-900 custom-scrollbar">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                 <h3 className="text-white font-bold text-lg mb-4">Base Info (role.base)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {schema.role.base.map(field => renderField(field, 'base'))}
                 </div>
              </div>
            )}
            {activeTab === 'status' && (
               <div className="space-y-6">
                 <h3 className="text-white font-bold text-lg mb-4">Status & Attributes (role.status)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {schema.role.status.map(field => renderField(field, 'status'))}
                 </div>
              </div>
            )}
            {activeTab === 'pocket' && (
               <InventoryGrid 
                items={editingRole.pocket.inv} 
                title="Pocket & Inventory (role.pocket)" 
                lang={lang} 
                money={editingRole.pocket.money}
                onUpdateItem={(pos, it) => setEditingRole({...editingRole, pocket: {...editingRole.pocket, inv: editingRole.pocket.inv.map(x => x.pos === pos ? it : x)}})}
               />
            )}
            {activeTab === 'equipment' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
                   {SLOT_ORDER.map(slotPos => {
                       const item = editingRole.equipment.eqp.find(it => it.pos === slotPos);
                       return (
                           <div key={slotPos} className={`bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center space-x-4 ${item ? 'hover:border-cyan-500/50 shadow-lg' : 'opacity-40'} transition-all`}>
                               <div className="w-10 h-10 bg-slate-950 rounded-lg border border-slate-700 flex items-center justify-center font-mono text-[9px] text-slate-500 uppercase text-center leading-tight">{EQUIP_SLOTS[slotPos] || 'Slot'}</div>
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
                    <InventoryGrid items={editingRole.storehouse.store} title="Banco" icon={Archive} lang={lang} />
                    <InventoryGrid items={editingRole.storehouse.dress} title="Guarda-Roupa (Fashion)" icon={Sword} lang={lang} />
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
        <div className="p-6 border-t border-slate-800 flex justify-end space-x-4 bg-slate-900 z-10">
          <button onClick={onClose} className="px-6 py-2 text-slate-400 hover:text-white font-bold text-sm transition-colors">{t('cancel')}</button>
          <button onClick={() => onSave(editingRole)} className="px-8 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-lg shadow-lg transition-all flex items-center">
            <Save className="w-4 h-4 mr-2" /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountEditor;
