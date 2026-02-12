import React, { useState, useEffect } from 'react';
import { XCircle, Save, FileCode, CheckCircle, Copy, Loader2, Zap } from 'lucide-react';
import { PWApiService } from '../../services/pwApi';
import { Language, TRANSLATIONS } from '../../types';

interface XmlEditorModalProps {
  roleId: number;
  onClose: () => void;
  lang: Language;
}

const XmlEditorModal: React.FC<XmlEditorModalProps> = ({ roleId, onClose, lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [xmlContent, setXmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadXml = async () => {
      setLoading(true);
      const data = await PWApiService.getRoleXml(roleId);
      setXmlContent(data);
      setLoading(false);
    };
    loadXml();
  }, [roleId]);

  const handleSave = async () => {
    setLoading(true);
    await PWApiService.saveRoleXml(roleId, xmlContent);
    setLoading(false);
    setSaved(true);
    setTimeout(() => {
        setSaved(false);
        onClose();
    }, 1500);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(xmlContent);
      alert("XML Copied!");
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-5xl h-[85vh] flex flex-col rounded-[32px] shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center space-x-5">
             <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                <FileCode className="w-10 h-10 text-orange-400" />
             </div>
             <div>
               <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('xml_editor')}</h2>
               <div className="flex items-center text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">
                   <Zap className="w-3 h-3 mr-1 text-orange-500" /> RoleID: <span className="text-orange-300 ml-1">{roleId}</span> | Raw Octets Simulation
               </div>
             </div>
          </div>
          <div className="flex items-center space-x-3">
              <button onClick={copyToClipboard} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors" title="Copy to clipboard"><Copy className="w-6 h-6" /></button>
              <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-red-500/20 rounded-xl text-slate-500 hover:text-red-500 transition-all"><XCircle className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-0 relative bg-slate-950">
          {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-orange-400">
                 <Loader2 className="w-12 h-12 animate-spin mb-4" />
                 <span className="font-mono text-sm uppercase tracking-widest">{t('loading_xml')}</span>
             </div>
          ) : (
             <textarea 
               className="w-full h-full bg-slate-950 text-orange-200/80 font-mono text-sm p-10 outline-none resize-none custom-scrollbar leading-relaxed"
               value={xmlContent}
               onChange={(e) => setXmlContent(e.target.value)}
               spellCheck={false}
             />
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-800 flex justify-end space-x-4 bg-slate-900/80">
           <button onClick={onClose} className="px-8 py-4 text-slate-500 hover:text-white font-black uppercase tracking-widest text-[11px]">{t('cancel')}</button>
           <button 
                onClick={handleSave} 
                disabled={loading}
                className={`px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center transition-all shadow-2xl ${
                    saved ? 'bg-green-600 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/40'
                }`}
           >
             {saved ? (
                 <>
                    <CheckCircle className="w-4 h-4 mr-3" />
                    Protocol Saved
                 </>
             ) : (
                 <>
                    <Save className="w-4 h-4 mr-3" />
                    Commit XML Change
                 </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default XmlEditorModal;