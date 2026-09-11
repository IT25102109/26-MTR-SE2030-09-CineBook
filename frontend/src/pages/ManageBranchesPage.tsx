import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Building2, MapPin } from 'lucide-react';
import { store, uid } from '@/data/store';
import type { CinemaBranch, CinemaHall } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export function ManageBranchesPage() {
  const [branches, setBranches] = useState<CinemaBranch[]>([]);
  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CinemaBranch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CinemaBranch | null>(null);
  const [hallModalBranch, setHallModalBranch] = useState<CinemaBranch | null>(null);
  const [hallForm, setHallForm] = useState({ name: '', rows: 8, cols: 12, premiumRows: 2 });

  const emptyForm = { name: '', city: '', address: '' };
  const [form, setForm] = useState(emptyForm);

  const refresh = () => {
    setBranches(store.getBranches());
    setHalls(store.getHalls());
  };
  useEffect(() => { refresh(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (b: CinemaBranch) => { setEditing(b); setForm({ name: b.name, city: b.city, address: b.address }); setFormOpen(true); };

  const save = () => {
    if (!form.name.trim()) return;
    const all = store.getBranches();
    if (editing) {
      const idx = all.findIndex((b) => b.id === editing.id);
      if (idx >= 0) all[idx] = { ...all[idx], ...form };
    } else {
      all.push({ ...form, id: uid('b') });
    }
    store.setBranches(all);
    setFormOpen(false);
    refresh();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    store.setBranches(store.getBranches().filter((b) => b.id !== deleteTarget.id));
    store.setHalls(store.getHalls().filter((h) => h.branchId !== deleteTarget.id));
    store.setShowtimes(store.getShowtimes().filter((s) => s.branchId !== deleteTarget.id));
    setDeleteTarget(null);
    refresh();
  };

  const addHall = () => {
    if (!hallModalBranch || !hallForm.name.trim()) return;
    const all = store.getHalls();
    all.push({ ...hallForm, id: uid('h'), branchId: hallModalBranch.id });
    store.setHalls(all);
    setHallForm({ name: '', rows: 8, cols: 12, premiumRows: 2 });
    refresh();
  };

  const deleteHall = (hallId: string) => {
    store.setHalls(store.getHalls().filter((h) => h.id !== hallId));
    store.setShowtimes(store.getShowtimes().filter((s) => s.hallId !== hallId));
    refresh();
  };

  const branchHalls = (bid: string) => halls.filter((h) => h.branchId === bid);

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Branch Management</h1>
          <p className="text-sm text-ink-400">{branches.length} branches • {halls.length} cinema halls</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Branch</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {branches.map((b) => (
          <Card key={b.id} className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">{b.name}</h3>
                  <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {b.city}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{b.address}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-white/10 transition-colors"><Pencil className="w-4 h-4 text-ink-300" /></button>
                <button onClick={() => setDeleteTarget(b)} className="p-2 rounded-lg hover:bg-error/20 transition-colors"><Trash2 className="w-4 h-4 text-error" /></button>
              </div>
            </div>
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-ink-400">CINEMA HALLS ({branchHalls(b.id).length})</span>
                <button onClick={() => setHallModalBranch(b)} className="text-xs text-accent hover:underline">+ Add Hall</button>
              </div>
              <div className="space-y-1.5">
                {branchHalls(b.id).map((h) => (
                  <div key={h.id} className="flex items-center justify-between bg-ink-800/50 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-sm font-medium">{h.name}</span>
                      <span className="text-xs text-ink-400 ml-2">{h.rows}×{h.cols} ({h.rows * h.cols} seats)</span>
                      {h.premiumRows > 0 && <Badge variant="gold" className="ml-2">{h.premiumRows} premium rows</Badge>}
                    </div>
                    <button onClick={() => deleteHall(h.id)} className="p-1.5 rounded hover:bg-error/20 transition-colors"><Trash2 className="w-3.5 h-3.5 text-error" /></button>
                  </div>
                ))}
                {branchHalls(b.id).length === 0 && <p className="text-xs text-ink-400 py-2">No halls configured.</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Branch modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Branch' : 'Add Branch'} size="md">
        <div className="space-y-4">
          <Input label="Branch Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="CineBook Downtown" />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="New York" />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save' : 'Add Branch'}</Button>
          </div>
        </div>
      </Modal>

      {/* Hall modal */}
      <Modal open={!!hallModalBranch} onClose={() => setHallModalBranch(null)} title={`Add Hall — ${hallModalBranch?.name ?? ''}`} size="md">
        <div className="space-y-4">
          <Input label="Hall Name" value={hallForm.name} onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })} placeholder="Hall A — IMAX" />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Rows" type="number" value={hallForm.rows} onChange={(e) => setHallForm({ ...hallForm, rows: parseInt(e.target.value) || 0 })} />
            <Input label="Columns" type="number" value={hallForm.cols} onChange={(e) => setHallForm({ ...hallForm, cols: parseInt(e.target.value) || 0 })} />
            <Input label="Premium Rows" type="number" value={hallForm.premiumRows} onChange={(e) => setHallForm({ ...hallForm, premiumRows: parseInt(e.target.value) || 0 })} />
          </div>
          <p className="text-xs text-ink-400">Total seats: {hallForm.rows * hallForm.cols} • Premium seats: {hallForm.premiumRows * hallForm.cols}</p>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setHallModalBranch(null)}>Cancel</Button>
            <Button onClick={addHall}>Add Hall</Button>
          </div>
        </div>
      </Modal>

      {/* Delete branch */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Branch" size="sm">
        <p className="text-ink-300 mb-2">Delete <span className="font-semibold">{deleteTarget?.name}</span>?</p>
        <p className="text-xs text-ink-400 mb-5">This removes all halls and showtimes for this branch. This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
