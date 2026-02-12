import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, Shield, XCircle, Save } from 'lucide-react';
import { SystemUser, Language, TRANSLATIONS } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface UserManagementProps {
  lang: Language;
}

const UserManagement: React.FC<UserManagementProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  
  // Empty form template
  const emptyUser: SystemUser = {
      id: 0,
      username: '',
      email: '',
      group_id: 2,
      group_name: 'Game Master',
      created_at: new Date().toISOString().split('T')[0],
      permissions: {}
  };

  const fetchUsers = async () => {
     const data = await PWApiService.getSystemUsers();
     setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: number) => {
      if(confirm(t('confirm_delete_user'))) {
          await PWApiService.deleteSystemUser(id);
          fetchUsers();
      }
  };

  const handleEdit = (user: SystemUser) => {
      setEditingUser({ ...user });
      setIsEditing(true);
  };

  const handleAdd = () => {
      setEditingUser({ ...emptyUser });
      setIsEditing(true);
  };

  const handleSave = async () => {
      if(editingUser) {
          await PWApiService.saveSystemUser(editingUser);
          setIsEditing(false);
          setEditingUser(null);
          fetchUsers();
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white flex items-center">
          <Users className="w-5 h-5 mr-2 text-cyan-400" />
          {t('user_management')}
        </h3>
        <button onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" /> {t('add_user')}
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
        <table className="w-full text-left">
           <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-medium">
             <tr>
               <th className="px-6 py-4">{t('user')}</th>
               <th className="px-6 py-4">{t('group')}</th>
               <th className="px-6 py-4">{t('created')}</th>
               <th className="px-6 py-4 text-right">{t('actions')}</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-800">
             {users.map(user => (
               <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                 <td className="px-6 py-4">
                   <div className="flex flex-col">
                     <span className="font-bold text-white">{user.username}</span>
                     <span className="text-xs text-slate-500">{user.email}</span>
                   </div>
                 </td>
                 <td className="px-6 py-4">
                   <div className="flex items-center">
                     <Shield className="w-3 h-3 mr-1 text-purple-400" />
                     <span className="text-sm text-slate-300">{user.group_name}</span>
                   </div>
                 </td>
                 <td className="px-6 py-4 text-sm text-slate-500">{user.created_at}</td>
                 <td className="px-6 py-4 text-right space-x-2">
                   <button onClick={() => handleEdit(user)} className="text-cyan-400 hover:bg-cyan-500/10 p-2 rounded"><Edit2 className="w-4 h-4" /></button>
                   <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      {isEditing && editingUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white">{editingUser.id === 0 ? t('add_user') : t('edit_user')}</h2>
                      <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white"><XCircle className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm text-slate-400 mb-1">{t('user')}</label>
                          <input type="text" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                      </div>
                      <div>
                          <label className="block text-sm text-slate-400 mb-1">{t('email')}</label>
                          <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" />
                      </div>
                      <div>
                          <label className="block text-sm text-slate-400 mb-1">{t('group')}</label>
                          <select 
                            value={editingUser.group_id} 
                            onChange={e => setEditingUser({...editingUser, group_id: parseInt(e.target.value), group_name: e.target.value === '1' ? 'Administrator' : 'Game Master'})}
                            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                          >
                              <option value={1}>{t('administrator')}</option>
                              <option value={2}>Game Master</option>
                          </select>
                      </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-8">
                      <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-300 hover:text-white">{t('cancel')}</button>
                      <button onClick={handleSave} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center">
                          <Save className="w-4 h-4 mr-2" /> {t('save')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default UserManagement;