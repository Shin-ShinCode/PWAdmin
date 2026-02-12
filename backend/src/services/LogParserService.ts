
import axios from 'axios';

// Interfaces baseadas no LogParser do usuário
export interface ChatLog {
  date: string;
  type: string;
  srcId: number;
  srcName: string;
  dstId?: number;
  dstName?: string;
  msg: string;
  channel?: string; // Para chat público
}

export interface TradeLog {
  date: string;
  srcId: number;
  srcName: string;
  dstId: number;
  dstName: string;
  moneySrc: number;
  moneyDst: number;
  itemsSrc: string; // IDs
  itemsDst: string; // IDs
}

// Serviço para buscar logs via API PHP (que lê os arquivos físicos)
export const fetchChatLogs = async (lines: number = 50): Promise<ChatLog[]> => {
    try {
        const response = await axios.get(`http://95.111.235.239/apipw/test_access.php`); 
        // Nota: O endpoint atual retorna tudo misturado. 
        // O ideal seria criar um endpoint dedicado no PHP: /apipw/logs.php?type=chat&lines=50
        // Como não posso criar arquivos no servidor remoto, vou usar o que tenho (test_access.php) 
        // que já modifiquei para retornar logs de chat no final.
        
        // Vamos extrair a seção de logs do texto retornado
        const text = response.data;
        const logs: ChatLog[] = [];
        
        const linesArr = text.split('\n');
        let inChatSection = false;
        
        for (const line of linesArr) {
            if (line.includes('[7] CHAT LOGS')) {
                inChatSection = true;
                continue;
            }
            if (inChatSection && line.includes('FIM DO RELATÓRIO')) break;
            
            if (inChatSection && line.trim()) {
                // Tenta parsear a linha raw do log
                // Ex: 2023-10-20 10:00:00 Chat: src=1024 chl=0 msg=Oi
                const parsed = parseLogLine(line.trim());
                if (parsed) logs.push(parsed);
            }
        }
        
        return logs;
    } catch (error) {
        console.error("Erro ao buscar logs:", error);
        return [];
    }
};

export const sendChatMessage = async (msg: string, channel: number = 9): Promise<boolean> => {
    try {
        // Envia para o PHP executar o WorldChat
        const response = await axios.get(`http://95.111.235.239/apipw/test_access.php`, {
            params: {
                action: 'send_chat',
                msg: msg,
                channel: channel,
                role_id: 1024 // GM ID
            }
        });
        
        return response.data && response.data.success;
    } catch (error) {
        console.error("Erro ao enviar chat:", error);
        return false;
    }
};

const parseLogLine = (line: string): ChatLog | null => {
    // Parser simples baseado no formato padrão do PW
    // Exemplo esperado: "2023-01-01 12:00:00 Chat: src=123 chl=0 msg=Hello"
    try {
        const parts = line.split(' ');
        if (parts.length < 4) return null;
        
        const date = `${parts[0]} ${parts[1]}`;
        const content = line.substring(20); // Pula data/hora
        
        // Chat Público
        if (content.includes('Chat:')) {
            const srcMatch = content.match(/src=(-?\d+)/);
            const chlMatch = content.match(/chl=(\d+)/);
            const msgMatch = content.match(/msg=(.*)/);
            
            if (srcMatch && msgMatch) {
                return {
                    date,
                    type: 'public',
                    srcId: parseInt(srcMatch[1]),
                    srcName: `Role${srcMatch[1]}`, // Nome precisaria de lookup no DB
                    channel: chlMatch ? getChannelName(chlMatch[1]) : 'Geral',
                    msg: msgMatch[1]
                };
            }
        }
        
        // Chat Privado (Whisper)
        if (content.includes('Whisper:')) {
            const srcMatch = content.match(/src=(-?\d+)/);
            const dstMatch = content.match(/dst=(-?\d+)/);
            const msgMatch = content.match(/msg=(.*)/);
            
            if (srcMatch && dstMatch && msgMatch) {
                return {
                    date,
                    type: 'private',
                    srcId: parseInt(srcMatch[1]),
                    srcName: `Role${srcMatch[1]}`,
                    dstId: parseInt(dstMatch[1]),
                    dstName: `Role${dstMatch[1]}`,
                    msg: msgMatch[1]
                };
            }
        }
        
        // GM Operations (Ban, Kick, etc)
        // formatlog:gmoperate:userid=...:type=...:content=...:kickroleid=...
        if (content.includes('formatlog:gmoperate')) {
             return {
                date,
                type: 'system',
                srcId: 0,
                srcName: 'GM Action',
                msg: content.substring(content.indexOf('formatlog:'))
             };
        }

        // Auction / Trade
        if (content.includes('formatlog:auction') || content.includes('formatlog:trade')) {
             return {
                date,
                type: 'trade',
                srcId: 0,
                srcName: 'System',
                msg: content
             };
        }
        
        return {
            date,
            type: 'unknown',
            srcId: 0,
            srcName: 'System',
            msg: line
        };
    } catch (e) {
        return null;
    }
};

const getChannelName = (id: string) => {
    const channels: any = {
        '0': 'Geral', '1': 'Global', '2': 'Grupo', '7': 'Comercio', 
        '9': 'Broadcast', '12': 'Mensageiro', '15': 'InterServidor'
    };
    return channels[id] || `Ch-${id}`;
};
