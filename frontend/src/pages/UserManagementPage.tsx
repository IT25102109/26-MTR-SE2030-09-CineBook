import { useMemo, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, Award, Building, Lock, CheckCircle2 } from 'lucide-react';
import { getUsers, saveUser, deleteUser, awardLoyaltyPoints, getBranches, STORE_EVENTS } from '@/data/store';
import { useStoreSync } from '@/hooks/useStoreSync';
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
  const storeTick = useStoreSync(STORE_EVENTS.users);
  const users = useMemo(() => getUsers(), [tick, storeTick]);
  const branches = useMemo(() => getBranches(), [tick]);

  const existingAdmin = useMemo(() => users.find(u => u.role === 'admin'), [users]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [pointsTarget, setPointsTarget] = useState<User | null>(null);
  const [pointsDelta, setPointsDelta] = useState('100');
  const [pointsReason, setPointsReason] = useState('Customer appreciation bonus');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'cinemaManager' as Role,
    assignedBranchId: '',
    avatarColor: avatarColors[0],
    password: '',
    confirmPassword: '',
    passwordError: '',
    formError: '',
    nameError: '',
    emailError: '',
    branchError: '',
  });

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (
      search &&
      !u.name.toLowerCase().includes(search.toLowerCase()) &&
      !u.email.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'cinemaManager', // default to cinemaManager since admins frequently create manager profiles
      assignedBranchId: branches[0]?.id || '1',
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      password: '',
      confirmPassword: '',
      passwordError: '',
      formError: '',
      nameError: '',
      emailError: '',
      branchError: '',
    });
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      assignedBranchId: user.assignedBranchId || (branches[0]?.id || ''),
      avatarColor: user.avatarColor,
      password: '',
      confirmPassword: '',
      passwordError: '',
      formError: '',
      nameError: '',
      emailError: '',
      branchError: '',
    });
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    let valid = true;
    const updates = {
      ...formData,
      nameError: '',
      emailError: '',
      branchError: '',
      passwordError: '',
      formError: '',
    };

    if (!updates.name.trim()) {
      updates.nameError = 'Full name / username is required';
      valid = false;
    }
    if (!updates.email.trim()) {
      updates.emailError = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      updates.emailError = 'Invalid email format';
      valid = false;
    }

    if (updates.role === 'cinemaManager' && !updates.assignedBranchId) {
      updates.branchError = 'Please assign a cinema branch to this manager';
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
    } else if (updates.password) {
      if (updates.password.length < 6) {
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

    const existing = getUsers().find(
      u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editing?.id
    );
    if (existing) {
      setFormData({ ...formData, emailError: 'Email already in use' });
      return;
    }

    // Enforce single admin check
    if (formData.role === 'admin' && existingAdmin && (!editing || editing.id !== existingAdmin.id)) {
      toast('error', `Only 1 Admin is allowed in CineBook. Current Admin is ${existingAdmin.name}`);
      return;
    }

    const user: User = {
      id: editing?.id || '',
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      role: formData.role,
      assignedBranchId: formData.role === 'cinemaManager' ? formData.assignedBranchId : undefined,
      avatarColor: formData.avatarColor,
      isVerified: true,
      password: formData.password || editing?.password || 'password123',
    };

    try {
      saveUser(user);
      setModalOpen(false);
      setTick(t => t + 1);
      toast('success', editing ? 'Profile updated successfully' : 'Profile created successfully');
    } catch (err: any) {
      toast('error', err.message || 'Failed to save user');
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.role === 'admin') {
      toast('error', 'The primary administrator account cannot be deleted.');
      setDeleteTarget(null);
      return;
    }

    try {
      deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      setTick(t => t + 1);
      toast('success', 'User deleted');
    } catch (err: any) {
      toast('error', err.message || 'Failed to delete user');
    }
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
          <p className="text-text-secondary">
            Manage profiles, assign cinema branches to managers, and enforce security policies.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add User / Cinema Manager
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['customer', 'cinemaManager', 'admin'] as Role[]).map(role => (
          <Card key={role} className="p-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${roleBadge[role]}-500/10`}
              >
                <Shield className={`w-5 h-5 text-${roleBadge[role]}-400`} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{roleCounts[role]}</p>
                <p className="text-xs text-text-muted">
                  {roleLabels[role]}s {role === 'admin' ? '(Max: 1)' : ''}
                </p>
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
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-cinema-base border border-cinema-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent-primary/50 transition-all text-text-primary placeholder:text-text-muted"
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
            header: 'User & Credentials',
            render: u => (
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                  style={{ backgroundColor: u.avatarColor }}
                >
                  {u.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-text-primary flex items-center gap-1.5">
                    {u.name}
                    {u.role === 'admin' && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.5 rounded">
                        Sole Admin
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-muted">{u.email}</p>
                  {u.phone && <p className="text-[11px] text-text-muted">{u.phone}</p>}
                </div>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Role',
            render: u => <Badge variant={roleBadge[u.role]}>{roleLabels[u.role]}</Badge>,
          },
          {
            key: 'branch',
            header: 'Assigned Branch (Cinema Managers)',
            render: u => {
              if (u.role !== 'cinemaManager') {
                return <span className="text-xs text-text-muted">—</span>;
              }
              const branch = branches.find(b => b.id === u.assignedBranchId);
              return branch ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-text-primary">
                  <Building className="w-3.5 h-3.5 text-accent-primary" />
                  <span>{branch.name}</span>
                </div>
              ) : (
                <span className="text-xs text-accent-destructive">Unassigned</span>
              );
            },
          },
          {
            key: 'loyalty',
            header: 'Loyalty Tier & Points',
            render: u => {
              if (u.role !== 'customer') return <span className="text-xs text-text-muted">—</span>;
              const tier = u.loyaltyTier || 'Bronze';
              const pts = u.loyaltyPoints ?? 0;
              const variant =
                tier === 'Platinum'
                  ? 'purple'
                  : tier === 'Gold'
                  ? 'amber'
                  : tier === 'Silver'
                  ? 'blue'
                  : 'default';
              return (
                <div className="flex items-center gap-2">
                  <Badge variant={variant as any}>{tier}</Badge>
                  <span className="text-xs font-semibold text-text-secondary">{pts} pts</span>
                </div>
              );
            },
          },
          {
            key: 'id',
            header: 'User ID',
            render: u => <span className="text-xs text-text-muted font-mono">{u.id}</span>,
          },
          {
            key: 'actions',
            header: '',
            render: u => (
              <div className="flex gap-2">
                {u.role === 'customer' && (
                  <button
                    onClick={() => {
                      setPointsTarget(u);
                      setPointsDelta('100');
                      setPointsReason('Customer appreciation bonus');
                    }}
                    title="Adjust Customer Loyalty Points"
                    className="text-text-muted hover:text-amber-400 transition-colors p-1"
                  >
                    <Award className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => openEdit(u)}
                  title="Edit profile & branch"
                  className="text-text-muted hover:text-accent-primary transition-colors p-1"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {u.role === 'admin' ? (
                  <button
                    disabled
                    title="Sole Administrator cannot be deleted"
                    className="text-text-muted/30 cursor-not-allowed p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setDeleteTarget(u)}
                    title="Delete User"
                    className="text-text-muted hover:text-accent-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={filtered}
        emptyMessage="No users found."
      />

      {/* CREATE / EDIT USER MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editing
            ? `Edit User: ${editing.name}`
            : formData.role === 'cinemaManager'
            ? 'Create Cinema Manager Profile'
            : 'Add New User'
        }
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editing ? 'Save Changes' : 'Create Profile'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name / Manager Username"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value, nameError: '' })}
            placeholder="e.g. Jordan Lee"
            error={formData.nameError}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value, emailError: '' })}
              placeholder="e.g. jordan@cinebook.com"
              error={formData.emailError}
              required
            />
            <Input
              label="Mobile Phone Number (Optional)"
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +1 555-0144"
            />
          </div>

          <div>
            <Select
              label="Role"
              value={formData.role}
              disabled={!!editing && editing.role === 'admin'}
              onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
            >
              <option value="customer">Customer</option>
              <option value="cinemaManager">Cinema Manager</option>
              <option
                value="admin"
                disabled={!!existingAdmin && (!editing || editing.id !== existingAdmin.id)}
              >
                Admin{' '}
                {existingAdmin && (!editing || editing.id !== existingAdmin.id)
                  ? `(Unavailable — Only 1 Admin allowed)`
                  : ''}
              </option>
            </Select>
            {existingAdmin && (!editing || editing.id !== existingAdmin.id) && (
              <p className="text-xs text-text-muted mt-1">
                Note: CineBook strictly limits the system to a single Admin account (Current Admin:{' '}
                <strong className="text-text-primary">{existingAdmin.name}</strong>).
              </p>
            )}
            {editing && editing.role === 'admin' && (
              <p className="text-xs text-amber-400 mt-1">
                The role of the sole system Administrator cannot be changed.
              </p>
            )}
          </div>

          {/* BRANCH ASSIGNMENT FOR CINEMA MANAGERS */}
          {formData.role === 'cinemaManager' && (
            <div className="p-3.5 rounded-xl bg-accent-primary/5 border border-accent-primary/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent-primary">
                <Building className="w-4 h-4" />
                <span>Cinema Branch Assignment</span>
              </div>
              <p className="text-xs text-text-muted">
                Assign this manager to a cinema branch. They will manage movies, halls, and showtimes
                specifically for this location.
              </p>
              <Select
                value={formData.assignedBranchId}
                onChange={e =>
                  setFormData({ ...formData, assignedBranchId: e.target.value, branchError: '' })
                }
                error={formData.branchError}
              >
                <option value="">Select a branch to assign...</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* PASSWORD SETUP */}
          <div className="pt-2 border-t border-cinema-border space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Lock className="w-3.5 h-3.5" />
              <span>{editing ? 'Change Password (leave blank to keep current)' : 'Set Password'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value, passwordError: '' })
                }
                placeholder={editing ? '••••••••' : 'At least 6 characters'}
                error={formData.passwordError}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={e =>
                  setFormData({ ...formData, confirmPassword: e.target.value, passwordError: '' })
                }
                placeholder={editing ? '••••••••' : 'Re-enter password'}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              Profile Avatar Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {avatarColors.map(color => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setFormData({ ...formData, avatarColor: color })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.avatarColor === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-cinema-card'
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User Account?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Account
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete{' '}
          <strong className="text-text-primary">{deleteTarget?.name}</strong> (
          {deleteTarget ? roleLabels[deleteTarget.role] : ''})? This action cannot be undone.
        </p>
      </Modal>

      {/* LOYALTY POINTS ADJUSTMENT MODAL */}
      <Modal
        open={!!pointsTarget}
        onClose={() => setPointsTarget(null)}
        title="Adjust Customer Loyalty Points"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPointsTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!pointsTarget) return;
                const delta = parseInt(pointsDelta, 10);
                if (isNaN(delta) || delta === 0) {
                  toast('error', 'Please enter a valid points amount');
                  return;
                }
                awardLoyaltyPoints(pointsTarget.id, delta);
                setTick(t => t + 1);
                toast(
                  'success',
                  `Adjusted points for ${pointsTarget.name} (${delta > 0 ? '+' : ''}${delta} pts). Reason: ${pointsReason}`
                );
                setPointsTarget(null);
              }}
            >
              Confirm Adjustment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            Update points balance for <strong className="text-text-primary">{pointsTarget?.name}</strong>.
            Their loyalty tier and benefits will automatically recalculate.
          </p>
          <Input
            label="Points Adjustment (+ or -)"
            type="number"
            value={pointsDelta}
            onChange={e => setPointsDelta(e.target.value)}
            placeholder="e.g. 100 or -50"
          />
          <Input
            label="Reason / Audit Note"
            value={pointsReason}
            onChange={e => setPointsReason(e.target.value)}
            placeholder="e.g. Customer appreciation or compensation"
          />
        </div>
      </Modal>
    </div>
  );
}
