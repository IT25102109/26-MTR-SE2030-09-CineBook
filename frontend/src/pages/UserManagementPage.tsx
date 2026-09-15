import { useMemo, useState } from 'react';
import { Plus, Search, Edit2, Trash2, UserCircle, Shield } from 'lucide-react';
import { getUsers, saveUser, deleteUser } from '@/data/store';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import type { User, Role } from '@/types';

const roleLabels: Record<Role, string> = {
  customer: 'Customer',
  cinemaManager: 'Cinema Manager',
  admin: 'Admin',
};

const roleBadge: Record<Role, 'amber' | 'red' | 'blue'> = {
  customer: 'amber',
  cinemaManager: 'red',
  admin: 'blue',
};

const avatarColors = ['#F5C518', '#E50914', '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#06B6D4'];

export function UserManagementPage() {
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const users = useMemo(() => getUsers(), [tick]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer' as Role,
  avatarColor: avatarColors[0],
  password: '',
  confirmPassword: '',
  passwordError: '',
  formError: '',
  nameError: '',
    emailError: '',
  });

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setFormData({
      name: '',
      email: '',
      role: 'customer',
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      password: '',
      confirmPassword: '',
      passwordError: '',
      formError: '',
      nameError: '',
      emailError: '',
    });
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor,
      password: '',
      confirmPassword: '',
      passwordError: '',
      formError: '',
      nameError: '',
      emailError: '',
    });
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    let valid = true;
    const updates = { ...formData, nameError: '', emailError: '', passwordError: '', formError: '' };

    if (!updates.name.trim()) {
      updates.nameError = 'Name is required';
      valid = false;
    }
    if (!updates.email.trim()) {
      updates.emailError = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      updates.emailError = 'Invalid email format';
      valid = false;
    }
    if (!editing) {
      if (!updates.password) {
        updates.passwordError = 'Password is required';
        valid = false;
      } else if (updates.password.length < 6) {
        updates.passwordError = 'Password must be at least 6 characters';
        valid = false;
      } else if (updates.password !== updates.confirmPassword) {
        updates.passwordError = 'Passwords do not match';
        valid = false;
      }
    }
    setFormData(updates);
    return valid;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const existing = getUsers().find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editing?.id);
    if (existing) {
      setFormData({ ...formData, emailError: 'Email already in use' });
      return;
    }

    const user: User = {
      id: editing?.id || '',
      name: formData.name,
      email: formData.email,
      role: formData.role,
      avatarColor: formData.avatarColor,
    };

    saveUser(user);
    setModalOpen(false);
    setTick(t => t + 1);
    toast('success', editing ? 'User updated' : 'User created');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id);
    setDeleteTarget(null);
    setTick(t => t + 1);
    toast('success', 'User deleted');
  };

  const roleCounts = {
    customer: users.filter(u => u.role === 'customer').length,
    cinemaManager: users.filter(u => u.role === 'cinemaManager').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">User Management</h1>
          <p className="text-text-secondary">Manage user accounts and roles</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['customer', 'cinemaManager', 'admin'] as Role[]).map(role => (
          <Card key={role} className="p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${roleBadge[role]}-500/10`}>
                <Shield className={`w-5 h-5 text-${roleBadge[role]}-400`} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{roleCounts[role]}</p>
                <p className="text-xs text-text-muted">{roleLabels[role]}s</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-cinema-base border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent-primary/50 transition-all"
            />
          </div>
          <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="cinemaManager">Cinema Managers</option>
            <option value="admin">Admins</option>
          </Select>
        </div>
      </Card>

      <Table
        columns={[
          {
            key: 'name',
            header: 'User',
            render: (u) => (
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                  style={{ backgroundColor: u.avatarColor }}
                >
                  {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-text-muted">{u.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Role',
            render: (u) => <Badge variant={roleBadge[u.role]}>{roleLabels[u.role]}</Badge>,
          },
          {
            key: 'id',
            header: 'User ID',
            render: (u) => <span className="text-xs text-text-muted font-mono">{u.id}</span>,
          },
          {
            key: 'actions',
            header: '',
            render: (u) => (
              <div className="flex gap-2">
                <button onClick={() => openEdit(u)} className="text-text-muted hover:text-accent-primary transition-colors p-1">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(u)} className="text-text-muted hover:text-accent-destructive transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
        data={filtered}
        emptyMessage="No users found."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit User' : 'Add User'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Create User'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value, nameError: '' })}
            placeholder="John Doe"
            error={formData.nameError}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value, emailError: '' })}
            placeholder="john@cinebook.com"
            error={formData.emailError}
          />
          <Select label="Role" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as Role })}>
            <option value="customer">Customer</option>
            <option value="cinemaManager">Cinema Manager</option>
            <option value="admin">Admin</option>
          </Select>
          {!editing && (
            <>
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value, passwordError: '' })}
                placeholder="At least 6 characters"
                error={formData.passwordError}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value, passwordError: '' })}
                placeholder="Re-enter password"
              />
            </>
          )}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">Avatar Color</label>
            <div className="flex gap-2 flex-wrap">
              {avatarColors.map(color => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, avatarColor: color })}
                  className={`w-8 h-8 rounded-full transition-all ${formData.avatarColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-cinema-card' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Delete <span className="font-medium text-text-primary">{deleteTarget?.name}</span>? This will remove their account but not their past bookings.
        </p>
      </Modal>
    </div>
  );
}
