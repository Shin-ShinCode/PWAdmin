
import React, { useState, useEffect } from 'react';
import { Loader2, Map as MapIcon, Shield, Swords, Info, AlertTriangle, Edit3, CheckCircle } from 'lucide-react';
import { PWTerritory, PWFaction, Language } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface TerritoryMapProps {
    lang: Language;
    factions: PWFaction[];
}

const getTerritoryName = (id: number) => {
    // Basic mapping for standard PW map (1-52)
    // This could be moved to a constants file
    const names: Record<number, string> = {
        1: "Cidade do Gelo", 2: "Terra Congelada", 3: "Vale da Nevasca", 4: "Campo de Gelo",
        5: "Montanha das Neves", 6: "Cidade das Plumas", 7: "Lago das Plumas", 8: "Ponte das Plumas",
        9: "Vila dos Bambus", 10: "Passagem Secreta", 11: "Cidade das Feras", 12: "Montanha Selvagem",
        // ... abbreviated for brevity, logic will handle generically if missing
    };
    return names[id] || `Território #${id}`;
};

// Helper to convert integer color to hex
const intToHex = (intColor: number) => {
    if (!intColor || intColor === -1) return '#334155'; // Slate-700
    // PW colors are often BGR or similar, or just standard int. 
    // Assuming standard RGB int.
    // Sometimes they are signed.
    const hex = (intColor & 0xFFFFFF).toString(16).padStart(6, '0');
    return `#${hex}`;
};

export const TerritoryMap: React.FC<TerritoryMapProps> = ({ lang, factions }) => {
    const [territories, setTerritories] = useState<PWTerritory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTerritory, setSelectedTerritory] = useState<PWTerritory | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ owner: 0, color: 0, level: 1 });

    const loadTerritories = async () => {
        setLoading(true);
        try {
            const data = await PWApiService.getTerritories();
            // Sort by ID to ensure grid alignment
            if (data) {
                setTerritories(data.sort((a: any, b: any) => a.id - b.id));
            }
        } catch (error) {
            console.error("Failed to load territories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTerritories();
    }, []);

    const getFactionName = (fid: number) => {
        if (fid === 0) return "NPC (Sem Dono)";
        const f = factions.find(fac => fac.fid === fid);
        return f ? f.name : `Facção ID: ${fid}`;
    };

    const handleSave = async () => {
        if (!selectedTerritory) return;
        // Call API to update territory (Need to implement in PHP/TS if not exists)
        // For now, mock success or alert
        alert("Funcionalidade de Salvar Território será implementada no backend na próxima etapa.");
        setEditMode(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                        <MapIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Mapa Territorial</h2>
                        <p className="text-xs text-slate-400 font-mono">Status em Tempo Real (52 Territórios)</p>
                    </div>
                </div>
                <div className="flex space-x-4">
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span className="w-3 h-3 bg-slate-700 rounded-sm"></span>
                        <span>NPC</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
                        <span>Ocupado</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span className="w-3 h-3 border-2 border-yellow-500 rounded-sm"></span>
                        <span>Em Guerra</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* MAP GRID */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-700 rounded-[2rem] p-8 shadow-2xl overflow-hidden relative min-h-[500px]">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <span className="text-xs uppercase tracking-widest font-bold">Carregando Mapa...</span>
                        </div>
                    ) : territories.length === 0 ? (
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
                            <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                            <span className="text-xs uppercase tracking-widest font-bold">Erro: Mapa Vazio ou Falha na Leitura</span>
                            <button onClick={loadTerritories} className="mt-4 px-4 py-2 bg-slate-800 rounded-lg text-white text-xs hover:bg-slate-700">Tentar Novamente</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-8 gap-2">
                            {/* Simple Grid Layout 1-52 */}
                            {territories.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => { setSelectedTerritory(t); setEditMode(false); }}
                                    className={`
                                        aspect-square rounded-lg border-2 flex items-center justify-center relative group transition-all
                                        ${selectedTerritory?.id === t.id ? 'border-white scale-110 z-10 shadow-xl' : 'border-slate-800 hover:border-slate-600'}
                                    `}
                                    style={{ 
                                        backgroundColor: t.owner > 0 ? intToHex(t.color) : '#1e293b',
                                        borderColor: t.challenger > 0 ? '#eab308' : undefined // Yellow border if war
                                    }}
                                    title={`ID: ${t.id} - ${getTerritoryName(t.id)}`}
                                >
                                    <span className="text-[10px] font-bold text-white/50 group-hover:text-white">{t.id}</span>
                                    {t.level === 3 && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-500 rounded-full" title="Cidade Principal"></div>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* DETAILS PANEL */}
                <div className="bg-slate-800/30 border border-slate-700 rounded-[2rem] p-6 h-fit">
                    {selectedTerritory ? (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="border-b border-slate-700 pb-4">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{getTerritoryName(selectedTerritory.id)}</h3>
                                <div className="text-xs text-slate-500 font-mono">Território ID: {selectedTerritory.id}</div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Dominante (Owner)</div>
                                    <div className={`text-lg font-bold ${selectedTerritory.owner > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {getFactionName(selectedTerritory.owner)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Nível</div>
                                        <div className="text-white font-bold">Level {selectedTerritory.level}</div>
                                    </div>
                                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Imposto</div>
                                        <div className="text-yellow-400 font-bold font-mono">{selectedTerritory.maxbonus || 0}kk</div>
                                    </div>
                                </div>

                                {selectedTerritory.challenger > 0 && (
                                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl animate-pulse">
                                        <div className="flex items-center text-red-500 font-bold text-sm uppercase mb-2">
                                            <Swords className="w-4 h-4 mr-2" /> Guerra Declarada
                                        </div>
                                        <div className="text-white font-bold">
                                            {getFactionName(selectedTerritory.challenger)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-700 flex space-x-3">
                                <button onClick={() => setEditMode(true)} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                                    Editar Dados
                                </button>
                            </div>
                            
                            {editMode && (
                                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-4 mt-4 animate-fadeIn">
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold">Novo Dono (ID Facção)</label>
                                        <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm mt-1" placeholder="Faction ID" />
                                    </div>
                                    <button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold text-xs uppercase">Salvar</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
                            <Info className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest text-center">Selecione um território<br/>no mapa para ver detalhes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
