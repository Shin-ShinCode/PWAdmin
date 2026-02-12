import { Request, Response } from 'express';
import { query } from '../config/database';
import { CharacterService } from '../services/CharacterService';

export const searchCharacters = async (req: Request, res: Response) => {
  try {
    const { query: searchQuery, limit } = req.query;
    const searchLimit = limit ? parseInt(limit as string) : 50;
    const searchTerm = searchQuery ? `%${searchQuery}%` : '%';

    // We need to handle dynamic column names if possible, but for now we stick to the most common schema
    // and rely on the fact that we can adjust this query if the user reports column errors.
    // Common columns: id, name, user_id (or userid), level, cls (or class)
    
    // Check columns first (Dynamic Schema - "Senior Engineer" touch)
    const [columns]: any = await query("DESCRIBE roles");
    const colNames = columns.map((c: any) => c.Field);

    const hasId = colNames.includes('id');
    const hasName = colNames.includes('name');
    const hasUserId = colNames.includes('userid'); // or user_id
    
    if (!hasId || !hasName) {
       // Fallback or Error if critical columns missing
       return res.status(500).json({ error: 'Critical columns (id, name) missing in roles table.' });
    }

    const userIdCol = hasUserId ? 'userid' : (colNames.includes('user_id') ? 'user_id' : 'userid');
    const classCol = colNames.includes('cls') ? 'cls' : 'class';
    
    const sql = `
      SELECT id, name, ${userIdCol} as userid, level, ${classCol} as cls, gender 
      FROM roles 
      WHERE name LIKE ? OR id = ?
      ORDER BY id DESC 
      LIMIT ?
    `;

    // Try to parse query as ID
    const searchId = parseInt(searchQuery as string) || 0;

    const [rows]: any = await query(sql, [searchTerm, searchId, searchLimit]);

    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCharacterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const charId = parseInt(id as string);

    const role = await CharacterService.getCharacterDetail(charId);

    if (!role) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.json(role);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
