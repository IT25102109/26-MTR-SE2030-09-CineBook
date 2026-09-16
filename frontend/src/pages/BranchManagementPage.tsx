import { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Building2, MapPin, Film, Shield, Lock } from 'lucide-react';
import { getBranches, saveBranch, deleteBranch } from '@/data/store';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import type { Branch, CinemaHall } from '@/types';

export function BranchManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const branches = useMemo(() => getBranches(), [tick]);

  const isCinemaManager = user?.role === 'cinemaManager';
  const assignedBranchId = user?.assignedBranchId;
  const isAdmin = user?.role === 'admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
  });
  const [halls, setHalls] = useState<CinemaHall[]>([]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', city: '', address: '' });
    setHalls([{ id: '', name: 'Hall A', rows: 8, seatsPerRow: 12, premiumRows: 2 }]);
    setModalOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setFormData({ name: branch.name, city: branch.city, address: branch.address });
    setHalls(branch.halls.map(h => ({ ...h })));
    setModalOpen(true);
  };

  const addHall = () => {
    setHalls([...halls, { id: '', name: `Hall ${String.fromCharCode(65 + halls.length)}`, rows: 8, seatsPerRow: 12, premiumRows: 2 }]);
  };

  const updateHall = (idx: number, updates: Partial<CinemaHall>) => {
    setHalls(halls.map((h, i) => i === idx ? { ...h, ...updates } : h));
  };

  const removeHall = (idx: number) => {
    setHalls(halls.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast('error', 'Branch name is required');
      return;
    }
    const branch: Branch = {
      id: editing?.id || '',
      name: formData.name,
      city: formData.city,
      address: formData.address,
      halls: halls.map((h, i) => ({ ...h, id: h.id || `h${Date.now()}_${i}` })),
    };
    saveBranch(branch);
    setModalOpen(false);
    setTick(t => t + 1);
    toast('success', editing ? 'Branch updated' : 'Branch added');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteBranch(deleteTarget.id);
    setDeleteTarget(null);
    setTick(t => t + 1);
    toast('success', 'Branch deleted');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-display font-bold">Branch Management</h1>
            {isCinemaManager && (
              <Badge variant="blue" className="flex items-center gap-1 text-xs">
                <Shield className="w-3 h-3" /> Manager Mode: Scoped
              </Badge>
            )}
          </div>
          <p className="text-text-secondary">
            {isCinemaManager
              ? 'Manage screens, seating configurations and halls for your assigned cinema branch'
              : 'Configure nationwide cinema branch venues, screening halls, and seat layouts'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Branch
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {branches.map((branch, i) => {
          const isAssigned = !assignedBranchId || branch.id === assignedBranchId;
          const canManage = isAdmin || (isCinemaManager && isAssigned);

          return (
            <Card key={branch.id} className={`p-6 animate-fade-in-up group transition-all ${!canManage ? 'opacity-60 border-white/5' : ''}`} hover={canManage}>
              <div style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-accent-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    {isCinemaManager && isAssigned && (
                      <Badge variant="green" className="text-xs">
                        Your Branch
                      </Badge>
                    )}
                    {isCinemaManager && !isAssigned && (
                      <Badge variant="default" className="text-xs text-text-muted flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Read Only
                      </Badge>
                    )}
                    {canManage && (
                      <button
                        onClick={() => openEdit(branch)}
                        title="Edit Branch Layout"
                        className="p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-accent-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteTarget(branch)}
                        title="Delete Branch"
                        className="p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-accent-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">{branch.name}</h3>
                <p className="text-sm text-text-secondary flex items-center gap-1.5 mb-3">
                  <MapPin className="w-3.5 h-3.5" /> {branch.city}
                </p>
                <p className="text-xs text-text-muted mb-4">{branch.address}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="blue"><Film className="w-3 h-3" /> {branch.halls.length} Halls</Badge>
                  <Badge variant="default">
                    {branch.halls.reduce((sum, h) => sum + h.rows * h.seatsPerRow, 0)} seats total
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <h2 className="text-xl font-display font-semibold mb-4 mt-8">All Branches</h2>
      <Table
        columns={[
          {
            key: 'name',
            header: 'Branch Name',
            render: b => (
              <div className="flex items-center gap-2">
                <span className="font-medium">{b.name}</span>
                {isCinemaManager && b.id === assignedBranchId && (
                  <Badge variant="green" className="text-[10px] py-0 px-1.5">Assigned</Badge>
                )}
              </div>
            )
          },
          { key: 'city', header: 'City', render: b => <span className="text-text-secondary">{b.city}</span> },
          { key: 'address', header: 'Address', render: b => <span className="text-text-secondary text-xs">{b.address}</span> },
          {
            key: 'halls',
            header: 'Halls',
            render: b => <Badge variant="blue">{b.halls.length}</Badge>
          },
          {
            key: 'capacity',
            header: 'Total Seats',
            render: b => <span className="text-text-secondary">{b.halls.reduce((s, h) => s + h.rows * h.seatsPerRow, 0)}</span>
          },
          {
            key: 'actions',
            header: '',
            render: (b) => {
              const isAssigned = !assignedBranchId || b.id === assignedBranchId;
              const canManage = isAdmin || (isCinemaManager && isAssigned);

              if (!canManage) {
                return <span className="text-xs text-text-muted italic flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>;
              }

              return (
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} title="Edit" className="text-text-muted hover:text-accent-primary transition-colors p-1">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button onClick={() => setDeleteTarget(b)} title="Delete" className="text-text-muted hover:text-accent-destructive transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            },
          },
        ]}
        data={branches}
        emptyMessage="No branches yet. Add one to get started."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Branch' : 'Add Branch'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Add Branch'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Branch Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="CineBook Downtown" />
            <Input label="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="New York" />
          </div>
          <Input label="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="123 Broadway, NY 10001" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-secondary">Cinema Halls</label>
              <Button size="sm" variant="secondary" onClick={addHall}>
                <Plus className="w-3.5 h-3.5" /> Add Hall
              </Button>
            </div>
            <div className="space-y-3">
              {halls.map((hall, idx) => (
                <div key={idx} className="flex items-end gap-3 p-3 rounded-xl bg-cinema-base border border-white/5">
                  <Input label="Name" value={hall.name} onChange={e => updateHall(idx, { name: e.target.value })} className="flex-1" />
                  <Input label="Rows" type="number" value={hall.rows} onChange={e => updateHall(idx, { rows: parseInt(e.target.value) || 0 })} className="w-20" />
                  <Input label="Seats/Row" type="number" value={hall.seatsPerRow} onChange={e => updateHall(idx, { seatsPerRow: parseInt(e.target.value) || 0 })} className="w-24" />
                  <Input label="Premium" type="number" value={hall.premiumRows} onChange={e => updateHall(idx, { premiumRows: parseInt(e.target.value) || 0 })} className="w-20" />
                  <button onClick={() => removeHall(idx)} className="pb-2.5 text-text-muted hover:text-accent-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Branch?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Delete <span className="font-medium text-text-primary">{deleteTarget?.name}</span> and all its halls? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
