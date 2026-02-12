
import axios from 'axios';

export interface RemoteStatus {
  services: {
    total: number;
    online: number;
    details: Array<{ name: string; status: string; cpu: string; ram: string }>;
  };
  maps: {
    total: number;
    details: Array<{ pid: string; name: string; id: string; cpu: string; ram: string }>;
  };
  players: {
    online_count: number;
    list: Array<{ uid: number; name: string; id: number; details: string }>;
  };
  database: {
    accounts: number;
    factions: number;
    characters: number;
    last_accounts: Array<{ id: number; login: string; email: string; date: string }>;
    last_characters: Array<{ id: number; name: string; level: number; class: string }>;
  };
  system: {
    load_average: string;
    memory: { total: string; used: string; free: string };
    disk: { total: string; used: string; free: string };
  };
  nw_config: { enabled: boolean; details: string };
  chat_logs: Array<{ raw: string }>;
  raw_output: string;
}

export const fetchRemoteStatus = async (): Promise<RemoteStatus> => {
  try {
    const response = await axios.get('http://95.111.235.239/apipw/test_access.php');
    const text = response.data;

    return parseStatusReport(text);
  } catch (error) {
    console.error('Failed to fetch remote status:', error);
    throw new Error('Failed to fetch remote status');
  }
};

const parseStatusReport = (text: string): RemoteStatus => {
  const result: RemoteStatus = {
    services: { total: 9, online: 0, details: [] },
    maps: { total: 0, details: [] },
    players: { online_count: 0, list: [] },
    database: { accounts: 0, factions: 0, characters: 0, last_accounts: [], last_characters: [] },
    system: { load_average: '', memory: { total: '', used: '', free: '' }, disk: { total: '', used: '', free: '' } },
    nw_config: { enabled: false, details: 'Unknown' },
    chat_logs: [],
    raw_output: text
  };

  const lines = text.split('\n');
  let section = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect Sections
    if (trimmed.includes('[1] STATUS DOS SERVIÇOS')) section = 1;
    else if (trimmed.includes('[2] MONITORAMENTO DE MAPAS')) section = 2;
    else if (trimmed.includes('[3] VERIFICAÇÃO DE ESTRUTURA')) section = 3;
    else if (trimmed.includes('[4] ANÁLISE DE DADOS')) section = 4;
    else if (trimmed.includes('[5] DADOS EM TEMPO REAL')) section = 5;
    else if (trimmed.includes('[6] RECURSOS DO SERVIDOR')) section = 6;
    else if (trimmed.includes('[7] CHAT LOGS')) section = 7;
    else if (trimmed.includes('[8] NATION WAR CONFIG')) section = 8;
    
    // ... (Sections 1-7 remain the same)
    
    // Parse Section 8: Nation War
    if (section === 8) {
        if (trimmed.includes('Nation War (Battlefield) habilitado')) {
            result.nw_config.enabled = true;
            result.nw_config.details = 'Enabled in gs.conf';
        } else if (trimmed.includes('não parece estar habilitado')) {
             result.nw_config.enabled = false;
             result.nw_config.details = 'Disabled in gs.conf';
        }
    }

    // ... (Sections 1-6 remain the same)
    
    // Parse Section 7: Chat Logs
    if (section === 7) {
        if (!trimmed.includes('[7] CHAT LOGS') && !trimmed.includes('FIM DO RELATÓRIO')) {
            // Add non-header lines to chat logs
            result.chat_logs.push({ raw: trimmed });
        }
    }

    // Parse Section 1: Services
    if (section === 1) {
      if (trimmed.includes('[ONLINE]') || trimmed.includes('[OFFLINE]')) {
        const parts = trimmed.split(/\s+/);
        // Ex: LOGSERVICE [ONLINE] (PIDs: 123) CPU: 0.1% RAM: 0.0%
        // Simple extraction logic
        const name = parts[0];
        const status = parts[1];
        const cpuIndex = parts.indexOf('CPU:');
        const ramIndex = parts.indexOf('RAM:');
        const cpu = cpuIndex > -1 ? parts[cpuIndex + 1] : '0%';
        const ram = ramIndex > -1 ? parts[ramIndex + 1] : '0%';
        
        result.services.details.push({ name, status, cpu, ram });
        if (status === '[ONLINE]') result.services.online++;
      }
    }

    // Parse Section 2: Maps
    if (section === 2) {
        // Processos 'gamed' detectados: 2
        //    - [PID: 441395] MUNDO Principal (gs01) | CPU: 0.4% | RAM: 0.3%
        if (trimmed.startsWith('- [PID:')) {
            const parts = trimmed.match(/- \[PID: (\d+)\] (.*?) \((.*?)\) \| CPU: (.*?) \| RAM: (.*)/);
            if (parts) {
                result.maps.details.push({
                    pid: parts[1],
                    name: parts[2].trim(),
                    id: parts[3],
                    cpu: parts[4],
                    ram: parts[5]
                });
            }
        }
    }

    // Parse Section 4: Database
    if (section === 4) {
      if (trimmed.includes('Contas Totais:')) result.database.accounts = parseInt(trimmed.split(':')[1]) || 0;
      if (trimmed.includes('Clãs Criados:')) result.database.factions = parseInt(trimmed.split(':')[1]) || 0;
      if (trimmed.includes('Personagens:')) result.database.characters = parseInt(trimmed.split(':')[1]) || 0;
      
      // Last Accounts
      if (trimmed.startsWith('[ID:')) {
         // [ID: 1088] Login: excelled | Email: ...
         if (trimmed.includes('Login:')) {
            const parts = trimmed.match(/\[ID: (\d+)\] Login: (.*?) \| Email: (.*?) \| Data: (.*)/);
            if (parts) {
                result.database.last_accounts.push({
                    id: parseInt(parts[1]),
                    login: parts[2].trim(),
                    email: parts[3].trim(),
                    date: parts[4].trim()
                });
            }
         }
         // Last Characters
         else if (trimmed.includes('Classe:')) {
             const parts = trimmed.match(/\[ID: (\d+)\] Nome: (.*?) \| Nível: (\d+) \| Classe: (.*)/);
             if (parts) {
                 result.database.last_characters.push({
                     id: parseInt(parts[1]),
                     name: parts[2].trim(),
                     level: parseInt(parts[3]),
                     class: parts[4].trim()
                 });
             }
         }
      }
    }

    // Parse Section 5: Players
    if (section === 5) {
        if (trimmed.includes('Jogadores Online:')) {
            result.players.online_count = parseInt(trimmed.split(':')[1]) || 0;
        }
        if (trimmed.startsWith('- [UID:')) {
            // - [UID: 32] Char: Name (ID: 1024) | ...
            const parts = trimmed.match(/- \[UID: (\d+)\] Char: (.*?) \(ID: (\d+)\)(.*)/);
            if (parts) {
                result.players.list.push({
                    uid: parseInt(parts[1]),
                    name: parts[2].trim(),
                    id: parseInt(parts[3]),
                    details: parts[4].trim()
                });
            }
        }
    }

    // Parse Section 6: Resources
    if (section === 6) {
        if (trimmed.startsWith('Load Average:')) {
            result.system.load_average = trimmed.split(':')[1].trim();
        }
        if (trimmed.startsWith('Memória:')) {
            // Total: 7945MB | Usado: 2777MB | Livre: 4659MB
            const parts = trimmed.match(/Total: (.*?) \| Usado: (.*?) \| Livre: (.*)/);
            if (parts) {
                result.system.memory = { total: parts[1], used: parts[2], free: parts[3] };
            }
        }
        if (trimmed.startsWith('Disco')) {
            const parts = trimmed.match(/Total: (.*?) \| Usado: (.*?) \| Livre: (.*)/);
            if (parts) {
                result.system.disk = { total: parts[1], used: parts[2], free: parts[3] };
            }
        }
    }
  }

  return result;
};
