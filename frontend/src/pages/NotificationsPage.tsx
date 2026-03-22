import { useEffect, useState } from 'react';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../hooks/useAuth';
import { platformService } from '../services/platform';
import type { Notification } from '../types';

export function NotificationsPage() {
  const { session } = useAuth();
  const token = session?.access_token || '';
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!token) return;
    platformService.listNotifications(token).then(setNotifications).catch(() => setNotifications([]));
  }, [token]);

  async function markAsRead(notificationId: number) {
    if (!token) return;
    const updated = await platformService.markNotification(token, notificationId, true);
    setNotifications((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Notification Agent</h1>
        <p className="mt-1 text-sm text-slate-500">Messages generated or assigned by admins appear here for each user.</p>
      </div>
      <Card title="Inbox">
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{notification.title}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{notification.rule_name || 'Manual rule'}</p>
                </div>
                {!notification.is_read && <Button onClick={() => markAsRead(notification.id)}>Mark read</Button>}
              </div>
              <p className="text-sm text-slate-700">{notification.message}</p>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications assigned yet.</p>}
        </div>
      </Card>
    </div>
  );
}
