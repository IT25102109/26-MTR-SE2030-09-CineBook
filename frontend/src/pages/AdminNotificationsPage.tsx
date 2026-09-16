import { useMemo, useState } from 'react';
import { Plus, Send, Edit2, Trash2, Megaphone, FileText, Mail, Users, CheckCheck, Clock, XCircle, Crown, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  getAllSentNotifications,
  getNotificationTemplates,
  saveNotificationTemplate,
  deleteNotificationTemplate,
  getUsers,
  getBranches,
  broadcastNotification,
} from '@/data/store';
import { NotificationIcon } from '@/components/notifications/NotificationIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import type { Notification, NotificationTemplate, NotificationType, NotificationAudience, Role } from '@/types';

const typeLabels: Record<string, string> = {
  booking_confirmation: 'Booking',
  cancellation_refund: 'Refund',
  showtime_reminder: 'Reminder',
  price_alert: 'Price Alert',
  system_announcement: 'System',
  content_update: 'Content',
  low_availability: 'Low Seats',
  new_booking: 'New Booking',
  scheduling_conflict: 'Conflict',
  revenue_milestone: 'Revenue',
  user_registration: 'User',
};

const roleLabels: Record<Role, string> = {
  customer: 'Customers',
  cinemaManager: 'Cinema Managers',
  admin: 'Admins',
};

const tierTargetLabels: Record<string, string> = {
  all_vips: 'All VIPs (Silver, Gold & Platinum)',
  gold_platinum: 'Gold & Platinum VIPs',
  platinum: 'Platinum Elite Only',
  gold: 'Gold VIPs',
  silver: 'Silver Members',
  bronze: 'Bronze Members',
};

type Tab = 'broadcasts' | 'compose' | 'templates';

export function AdminNotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refresh } = useNotifications();
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('broadcasts');

  const sentNotifications = useMemo(() => getAllSentNotifications(), [tick]);
  const templates = useMemo(() => getNotificationTemplates(), [tick]);
  const users = useMemo(() => getUsers(), []);
  const branches = useMemo(() => getBranches(), []);

  const [composeOpen, setComposeOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NotificationTemplate | null>(null);

  const [compose, setCompose] = useState({
    title: '',
    message: '',
    type: 'system_announcement' as NotificationType,
    audience: 'all' as NotificationAudience,
    targetRole: 'customer' as Role,
    targetBranch: '',
    targetTier: 'all_vips',
    link: '',
  });

  const [templateForm, setTemplateForm] = useState({
    type: 'system_announcement' as NotificationType,
    title: '',
    message: '',
  });

  const estimatedRecipientCount = useMemo(() => {
    if (compose.audience === 'all') return users.length;
    if (compose.audience === 'role') return users.filter(u => u.role === compose.targetRole).length;
    if (compose.audience === 'branch') return users.filter(u => u.role === 'customer').length;
    if (compose.audience === 'loyaltyTier') {
      return users.filter(u => {
        if (u.role !== 'customer') return false;
        const tier = u.loyaltyTier || 'Bronze';
        if (compose.targetTier === 'all_vips') return tier === 'Silver' || tier === 'Gold' || tier === 'Platinum';
        if (compose.targetTier === 'gold_platinum') return tier === 'Gold' || tier === 'Platinum';
        return tier.toLowerCase() === compose.targetTier.toLowerCase();
      }).length;
    }
    return 0;
  }, [compose, users]);

  const openCompose = () => {
    setCompose({
      title: '',
      message: '',
      type: 'system_announcement',
      audience: 'all',
      targetRole: 'customer',
      targetBranch: branches[0]?.id || '',
      targetTier: 'all_vips',
      link: '',
    });
    setComposeOpen(true);
  };

  const handleSend = () => {
    if (!compose.title.trim() || !compose.message.trim()) {
      toast('error', 'Title and message are required');
      return;
    }
    if (!user) return;

    let targetUserIds: string[] = [];
    if (compose.audience === 'all') {
      targetUserIds = users.map(u => u.id);
    } else if (compose.audience === 'role') {
      targetUserIds = users.filter(u => u.role === compose.targetRole).map(u => u.id);
    } else if (compose.audience === 'branch') {
      targetUserIds = users.filter(u => u.role === 'customer').map(u => u.id);
    } else if (compose.audience === 'loyaltyTier') {
      targetUserIds = users.filter(u => {
        if (u.role !== 'customer') return false;
        const tier = u.loyaltyTier || 'Bronze';
        if (compose.targetTier === 'all_vips') return tier === 'Silver' || tier === 'Gold' || tier === 'Platinum';
        if (compose.targetTier === 'gold_platinum') return tier === 'Gold' || tier === 'Platinum';
        return tier.toLowerCase() === compose.targetTier.toLowerCase();
      }).map(u => u.id);
    }

    if (targetUserIds.length === 0) {
      toast('error', 'No users match the selected audience criteria');
      return;
    }

    broadcastNotification(
      {
        type: compose.type,
        title: compose.title,
        message: compose.message,
        link: compose.link || undefined,
        audience: compose.audience,
        audienceTarget:
          compose.audience === 'role'
            ? compose.targetRole
            : compose.audience === 'branch'
            ? compose.targetBranch
            : compose.audience === 'loyaltyTier'
            ? compose.targetTier
            : undefined,
        createdBy: user.id,
      },
      targetUserIds
    );

    setComposeOpen(false);
    setTick(t => t + 1);
    refresh();
    toast('success', `Broadcast sent to ${targetUserIds.length} user${targetUserIds.length > 1 ? 's' : ''}`);
  };

  const openCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ type: 'system_announcement', title: '', message: '' });
    setTemplateModalOpen(true);
  };

  const openEditTemplate = (tpl: NotificationTemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm({ type: tpl.type, title: tpl.title, message: tpl.message });
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!templateForm.title.trim() || !templateForm.message.trim()) {
      toast('error', 'Title and message are required');
      return;
    }
    const tpl: NotificationTemplate = {
      id: editingTemplate?.id || '',
      type: templateForm.type,
      title: templateForm.title,
      message: templateForm.message,
    };
    saveNotificationTemplate(tpl);
    setTemplateModalOpen(false);
    setTick(t => t + 1);
    toast('success', editingTemplate ? 'Template updated' : 'Template created');
  };

  const handleDeleteTemplate = () => {
    if (!deleteTarget) return;
    deleteNotificationTemplate(deleteTarget.id);
    setDeleteTarget(null);
    setTick(t => t + 1);
    toast('success', 'Template deleted');
  };

  const statusIcon = (status?: string) => {
    if (status === 'read') return <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />;
    if (status === 'failed') return <XCircle className="w-3.5 h-3.5 text-accent-destructive" />;
    return <Clock className="w-3.5 h-3.5 text-accent-primary" />;
  };

  const stats = {
    total: sentNotifications.length,
    read: sentNotifications.filter(n => n.status === 'read').length,
    sent: sentNotifications.filter(n => n.status === 'sent').length,
    openRate: sentNotifications.length > 0
      ? Math.round((sentNotifications.filter(n => n.status === 'read').length / sentNotifications.length) * 100)
      : 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Notification Management</h1>
          <p className="text-text-secondary">Broadcast announcements, manage templates, and track delivery</p>
        </div>
        <Button onClick={openCompose}>
          <Send className="w-4 h-4" /> New Broadcast
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-accent-primary/10 flex items-center justify-center">
              <Megaphone className="w-4.5 h-4.5 text-accent-primary" />
            </div>
            <span className="text-xs text-text-muted">Total Sent</span>
          </div>
          <p className="text-2xl font-display font-bold">{stats.total}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCheck className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <span className="text-xs text-text-muted">Read</span>
          </div>
          <p className="text-2xl font-display font-bold">{stats.read}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-accent-primary/10 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-accent-primary" />
            </div>
            <span className="text-xs text-text-muted">Pending</span>
          </div>
          <p className="text-2xl font-display font-bold">{stats.sent}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Mail className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <span className="text-xs text-text-muted">Open Rate</span>
          </div>
          <p className="text-2xl font-display font-bold">{stats.openRate}%</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-cinema-card hairline rounded-xl p-1 w-fit">
        {([
          { id: 'broadcasts', label: 'Delivery Log', icon: Send },
          { id: 'templates', label: 'Templates', icon: FileText },
        ] as { id: Tab; label: string; icon: typeof Send }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-accent-primary text-black' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'broadcasts' && (
        <Table
          columns={[
            {
              key: 'type',
              header: 'Type',
              render: (n: Notification) => (
                <div className="flex items-center gap-2">
                  <NotificationIcon type={n.type} className="w-4 h-4" />
                  <span className="text-text-secondary text-xs">{typeLabels[n.type] || n.type}</span>
                </div>
              ),
            },
            {
              key: 'title',
              header: 'Title',
              render: (n: Notification) => <span className="font-medium">{n.title}</span>,
            },
            {
              key: 'message',
              header: 'Message',
              render: (n: Notification) => <span className="text-text-secondary text-xs line-clamp-1 max-w-xs">{n.message}</span>,
            },
            {
              key: 'audience',
              header: 'Audience',
              render: (n: Notification) => {
                if (!n.audience) return <span className="text-text-muted">—</span>;
                if (n.audience === 'all') return <Badge variant="blue">All Users</Badge>;
                if (n.audience === 'role') return <Badge variant="blue">{roleLabels[n.audienceTarget as Role] || 'Role'}</Badge>;
                if (n.audience === 'loyaltyTier') return <Badge variant="amber">{tierTargetLabels[n.audienceTarget || ''] || n.audienceTarget || 'Loyalty'}</Badge>;
                const label = branches.find(b => b.id === n.audienceTarget)?.name || 'Branch';
                return <Badge variant="blue">{label}</Badge>;
              },
            },
            {
              key: 'status',
              header: 'Status',
              render: (n: Notification) => (
                <div className="flex items-center gap-1.5">
                  {statusIcon(n.status)}
                  <span className="text-xs text-text-secondary capitalize">{n.status || 'sent'}</span>
                </div>
              ),
            },
            {
              key: 'createdAt',
              header: 'Sent At',
              render: (n: Notification) => (
                <span className="text-xs text-text-muted">
                  {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                  {new Date(n.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              ),
            },
          ]}
          data={sentNotifications}
          emptyMessage="No broadcasts sent yet. Click 'New Broadcast' to send one."
        />
      )}

      {activeTab === 'templates' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">{templates.length} notification templates</p>
            <Button size="sm" variant="secondary" onClick={openCreateTemplate}>
              <Plus className="w-4 h-4" /> Add Template
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tpl => (
              <Card key={tpl.id} className="p-5 group hover:bg-cinema-elevated transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <NotificationIcon type={tpl.type} className="w-5 h-5" />
                    <Badge variant="default">{typeLabels[tpl.type] || tpl.type}</Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditTemplate(tpl)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-accent-primary transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(tpl)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-accent-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="font-medium text-sm mb-1">{tpl.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed">{tpl.message}</p>
              </Card>
            ))}
          </div>
          {templates.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">No templates yet</p>
            </Card>
          )}
        </div>
      )}

      {/* Compose Modal */}
      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Compose Broadcast"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button onClick={handleSend}>
              <Send className="w-4 h-4" /> Send Now
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Notification Type" value={compose.type} onChange={e => setCompose({ ...compose, type: e.target.value as NotificationType })}>
            <option value="system_announcement">System Announcement</option>
            <option value="price_alert">Price Alert</option>
            <option value="content_update">Content Update</option>
            <option value="showtime_reminder">Showtime Reminder</option>
          </Select>
          <Input
            label="Title"
            value={compose.title}
            onChange={e => setCompose({ ...compose, title: e.target.value })}
            placeholder="Notification title"
          />
          <Textarea
            label="Message"
            value={compose.message}
            onChange={e => setCompose({ ...compose, message: e.target.value })}
            placeholder="Write your broadcast message..."
            rows={4}
          />
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">Target Audience</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {([
                { value: 'all', label: 'All Users', icon: Users },
                { value: 'role', label: 'By Role', icon: Users },
                { value: 'branch', label: 'By Branch', icon: Mail },
                { value: 'loyaltyTier', label: 'By Loyalty Tier', icon: Crown },
              ] as { value: NotificationAudience; label: string; icon: typeof Users }[]).map(aud => (
                <button
                  key={aud.value}
                  type="button"
                  onClick={() => setCompose({ ...compose, audience: aud.value })}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all ${
                    compose.audience === aud.value
                      ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary'
                      : 'border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <aud.icon className="w-3.5 h-3.5 flex-shrink-0" /> {aud.label}
                </button>
              ))}
            </div>
            {compose.audience === 'role' && (
              <Select label="Filter by Role" value={compose.targetRole} onChange={e => setCompose({ ...compose, targetRole: e.target.value as Role })}>
                <option value="customer">Customers</option>
                <option value="cinemaManager">Cinema Managers</option>
                <option value="admin">Admins</option>
              </Select>
            )}
            {compose.audience === 'branch' && (
              <Select label="Filter by Cinema Branch" value={compose.targetBranch} onChange={e => setCompose({ ...compose, targetBranch: e.target.value })}>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            )}
            {compose.audience === 'loyaltyTier' && (
              <Select label="Select Customer Loyalty Tier" value={compose.targetTier} onChange={e => setCompose({ ...compose, targetTier: e.target.value })}>
                <option value="all_vips">All VIPs (Silver, Gold & Platinum)</option>
                <option value="gold_platinum">High Value (Gold & Platinum VIPs)</option>
                <option value="platinum">Platinum Elite Only (1200+ pts)</option>
                <option value="gold">Gold VIPs Only (700-1199 pts)</option>
                <option value="silver">Silver Members Only (300-699 pts)</option>
                <option value="bronze">Bronze Members Only (0-299 pts)</option>
              </Select>
            )}

            {/* Live Recipient Counter Badge */}
            <div className="mt-3 flex items-center justify-between p-2.5 rounded-lg bg-cinema-elevated border border-white/5 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-accent-primary" />
                <span>Audience Reach Preview:</span>
              </div>
              <span className="font-semibold text-accent-primary">
                {estimatedRecipientCount} {estimatedRecipientCount === 1 ? 'user' : 'users'} matched
              </span>
            </div>
          </div>
          <Input
            label="Link (optional)"
            value={compose.link}
            onChange={e => setCompose({ ...compose, link: e.target.value })}
            placeholder="/movies/m1"
          />
        </div>
      </Modal>

      {/* Template Modal */}
      <Modal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title={editingTemplate ? 'Edit Template' : 'Add Template'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTemplateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>{editingTemplate ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Type" value={templateForm.type} onChange={e => setTemplateForm({ ...templateForm, type: e.target.value as NotificationType })}>
            <option value="booking_confirmation">Booking Confirmation</option>
            <option value="cancellation_refund">Cancellation/Refund</option>
            <option value="showtime_reminder">Showtime Reminder</option>
            <option value="price_alert">Price Alert</option>
            <option value="system_announcement">System Announcement</option>
            <option value="content_update">Content Update</option>
            <option value="low_availability">Low Availability</option>
          </Select>
          <Input
            label="Title"
            value={templateForm.title}
            onChange={e => setTemplateForm({ ...templateForm, title: e.target.value })}
            placeholder="Template title"
          />
          <Textarea
            label="Message Template"
            value={templateForm.message}
            onChange={e => setTemplateForm({ ...templateForm, message: e.target.value })}
            placeholder="Use {{movie}}, {{branch}}, {{seats}}, etc. as placeholders"
            rows={4}
          />
          <p className="text-xs text-text-muted">Available placeholders: {'{{movie}}, {{branch}}, {{hall}}, {{seats}}, {{seatList}}, {{amount}}, {{time}}, {{timeHint}}, {{price}}, {{percent}}, {{remaining}}, {{message}}'}</p>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Template?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Delete template <span className="font-medium text-text-primary">{deleteTarget?.title}</span>?
        </p>
      </Modal>
    </div>
  );
}
