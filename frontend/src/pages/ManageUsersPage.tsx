import { useState, useEffect } from 'react';
import { Search, UserCog, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { store } from '@/data/store';
import type { AppUser, Role } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { ROLE_LABELS } from '@/context/AuthContext';

export function ManageUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusTarget, setStatusTarget] = useState<AppUser | null>(null);

  const refresh = () => setUsers(store.getUsers());
  useEffect(() => { refresh(); }, []);

  const filtered = users.filter((u) => {
    if (query && !u.name.toLowerCase().includes(query.toLowerCase()) && !u.email.toLowerCase().includes(query.toLowerCase())) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  const toggleStatus = () => {
    if (!statusTarget) return;
    const all = store.getUsers();
    const idx = all.findIndex((u) => u.id === statusTarget.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], status: all[idx].status === 'active' ? 'suspended' : 'active' };
      store.setUsers(all);
    }
    setStatusTarget(null);
    refresh();
  };

  const roleBadge = (role: Role) => {
    if (role === 'admin') return <Badge variant="accent">{ROLE_LABELS[role]}</Badge>;
    if (role === 'manager') return <Badge variant="gold">{ROLE_LABELS[role]}</Badge>;
    return <Badge variant="outline">{ROLE_LABELS[role]}</Badge>;
  };

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold mb-2">User Management</h1>
      <p className="text-ink-400 mb-6">{users.length} total users • {users.filter((u) => u.status === 'active').length} active</p>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email..." className="w-full bg-ink-850 border border-ink-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div className="w-44">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="manager">Cinema Manager</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-800/50 text-ink-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-ink-300">{u.email}</td>
                  <td className="px-4 py-3">{roleBadge(u.role)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-ink-300">{new Date(u.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3">
                    {u.status === 'active' ? <Badge variant="success"><CheckCircle className="w-3 h-3" /> Active</Badge> : <Badge variant="error"><Ban className="w-3 h-3" /> Suspended</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button onClick={() => setStatusTarget(u)} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title={u.status === 'active' ? 'Suspend user' : 'Reactivate user'}>
                        <UserCog className={`w-4 h-4 ${u.status === 'active' ? 'text-warning' : 'text-success'}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-ink-400">No users found.</div>
        )}
      </Card>

      <Modal open={!!statusTarget} onClose={() => setStatusTarget(null)} title={statusTarget?.status === 'active' ? 'Suspend User' : 'Reactivate User'} size="sm">
        <p className="text-ink-300 mb-2">
          {statusTarget?.status === 'active'
            ? `Suspend ${statusTarget?.name}? They will lose access to their account.`
            : `Reactivate ${statusTarget?.name}? Their access will be restored.`}
        </p>
        <div className="flex gap-3 justify-end mt-5">
          <Button variant="ghost" onClick={() => setStatusTarget(null)}>Cancel</Button>
          <Button variant={statusTarget?.status === 'active' ? 'danger' : 'primary'} onClick={toggleStatus}>
            {statusTarget?.status === 'active' ? 'Suspend' : 'Reactivate'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
