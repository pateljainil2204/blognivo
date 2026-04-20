import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Users, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminUserList from '../../components/admin/AdminUserList';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function ManageUsers() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const updateUserRole = async (userId, role) => {
    const { error } = await supabase.from('users').update({ role }).eq('id', userId);
    if (error) {
      toast.error('Role update failed');
    } else {
      toast.success(`Role updated to ${role}`);
      fetchUsers();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    // Check if user is trying to delete themselves
    if (deleteId === user.id) {
      toast.error("You cannot delete your own admin account.");
      setDeleteId(null);
      return;
    }

    const { error } = await supabase.from('users').delete().eq('id', deleteId);
    if (error) {
      toast.error('Deletion failed');
    } else {
      toast.success('User deleted successfully');
      fetchUsers();
    }
    setDeleteId(null);
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
             <Users className="text-indigo-400" size={32} /> User Management
          </h1>
          <p className="text-gray-400 font-medium mt-2">Manage user permissions, roles, and platform access.</p>
        </div>
      </div>

      <AdminUserList
        users={users}
        loading={loading}
        onUpdateRole={updateUserRole}
        onDelete={(id) => setDeleteId(id)}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User?"
        message="Are you sure you want to remove this user from the system? This will delete their profile and may affect their associated content."
      />
    </div>
  );
}
