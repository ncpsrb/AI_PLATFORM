import { FormEvent, useEffect, useState } from 'react';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input, TextArea } from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { platformService } from '../services/platform';
import type { Agent, Notification, UsageLog, User } from '../types';

export function AdminPage() {
  const { session, user } = useAuth();
  const token = session?.access_token || '';
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [prompts, setPrompts] = useState<Array<Record<string, unknown>>>([]);
  const [userForm, setUserForm] = useState({ email: 'user@example.com', full_name: 'Demo User', password: 'password123', is_admin: false });
  const [agentForm, setAgentForm] = useState({ owner_id: '', name: 'Support Agent', description: 'Assigned by admin', source_type: 'local', source_reference: '', behavior_prompt: 'Be friendly and concise.', configuration: '{"temperature": 0.1}' });
  const [notificationForm, setNotificationForm] = useState({ user_id: '', title: 'Reminder', message: 'Review your active agents today.', rule_name: 'Daily reminder', generator_agent_id: '' });

  useEffect(() => {
    if (!token || !user?.is_admin) return;
    Promise.all([
      platformService.adminListUsers(token),
      platformService.adminListAgents(token),
      platformService.adminListNotifications(token),
      platformService.adminUsageLogs(token),
      platformService.adminPrompts(token),
    ]).then(([usersData, agentsData, notificationsData, logsData, promptsData]) => {
      setUsers(usersData);
      setAgents(agentsData);
      setNotifications(notificationsData);
      setUsageLogs(logsData);
      setPrompts(promptsData);
    });
  }, [token, user?.is_admin]);

  async function handleCreateUser(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    const created = await platformService.adminCreateUser(token, userForm);
    setUsers((current) => [created, ...current]);
  }

  async function handleAssignAgent(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    const created = await platformService.adminAssignAgent(token, {
      ...agentForm,
      owner_id: Number(agentForm.owner_id),
      configuration: JSON.parse(agentForm.configuration),
    });
    setAgents((current) => [created, ...current]);
  }

  async function handleCreateNotification(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    const created = await platformService.adminCreateNotification(token, {
      ...notificationForm,
      user_id: Number(notificationForm.user_id),
      generator_agent_id: notificationForm.generator_agent_id ? Number(notificationForm.generator_agent_id) : null,
    });
    setNotifications((current) => [created, ...current]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-500">Manage users, assign agents, send notifications, and inspect platform activity.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Create User">
          <form className="space-y-3" onSubmit={handleCreateUser}>
            <Input value={userForm.full_name} onChange={(event) => setUserForm((current) => ({ ...current, full_name: event.target.value }))} placeholder="Full name" />
            <Input value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
            <Input type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={userForm.is_admin} onChange={(event) => setUserForm((current) => ({ ...current, is_admin: event.target.checked }))} />
              Admin user
            </label>
            <Button type="submit">Create user</Button>
          </form>
        </Card>
        <Card title="Assign Agent">
          <form className="space-y-3" onSubmit={handleAssignAgent}>
            <Input value={agentForm.owner_id} onChange={(event) => setAgentForm((current) => ({ ...current, owner_id: event.target.value }))} placeholder="Owner user ID" />
            <Input value={agentForm.name} onChange={(event) => setAgentForm((current) => ({ ...current, name: event.target.value }))} placeholder="Agent name" />
            <TextArea value={agentForm.description} onChange={(event) => setAgentForm((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Description" />
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={agentForm.source_type} onChange={(event) => setAgentForm((current) => ({ ...current, source_type: event.target.value }))}>
              <option value="local">Local agent</option>
              <option value="external">External API agent</option>
            </select>
            <Input value={agentForm.source_reference} onChange={(event) => setAgentForm((current) => ({ ...current, source_reference: event.target.value }))} placeholder="Local path or API URL" />
            <TextArea value={agentForm.behavior_prompt} onChange={(event) => setAgentForm((current) => ({ ...current, behavior_prompt: event.target.value }))} rows={3} placeholder="Behavior prompt" />
            <TextArea value={agentForm.configuration} onChange={(event) => setAgentForm((current) => ({ ...current, configuration: event.target.value }))} rows={3} placeholder='{"temperature": 0.1}' />
            <Button type="submit">Assign agent</Button>
          </form>
        </Card>
        <Card title="Create Notification Rule">
          <form className="space-y-3" onSubmit={handleCreateNotification}>
            <Input value={notificationForm.user_id} onChange={(event) => setNotificationForm((current) => ({ ...current, user_id: event.target.value }))} placeholder="User ID" />
            <Input value={notificationForm.title} onChange={(event) => setNotificationForm((current) => ({ ...current, title: event.target.value }))} placeholder="Notification title" />
            <TextArea value={notificationForm.message} onChange={(event) => setNotificationForm((current) => ({ ...current, message: event.target.value }))} rows={3} placeholder="Notification message" />
            <Input value={notificationForm.rule_name} onChange={(event) => setNotificationForm((current) => ({ ...current, rule_name: event.target.value }))} placeholder="Rule name" />
            <Input value={notificationForm.generator_agent_id} onChange={(event) => setNotificationForm((current) => ({ ...current, generator_agent_id: event.target.value }))} placeholder="Generator agent ID (optional)" />
            <Button type="submit">Create notification</Button>
          </form>
        </Card>
        <Card title="Users">
          <div className="overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr><th className="pb-2">ID</th><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Role</th></tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-200">
                    <td className="py-2">{entry.id}</td>
                    <td className="py-2">{entry.full_name}</td>
                    <td className="py-2">{entry.email}</td>
                    <td className="py-2">{entry.is_admin ? 'Admin' : 'User'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Usage Logs">
          <div className="space-y-2 text-sm">
            {usageLogs.slice(0, 8).map((entry) => (
              <div key={entry.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-medium">{entry.action}</p>
                <p className="text-slate-500">User #{entry.user_id} · Agent #{entry.agent_id ?? 'n/a'} · {new Date(entry.created_at).toLocaleString()}</p>
                {entry.prompt && <p className="mt-1 text-slate-700">{entry.prompt}</p>}
              </div>
            ))}
          </div>
        </Card>
        <Card title="User Prompts">
          <div className="space-y-2 text-sm">
            {prompts.slice(0, 8).map((prompt) => (
              <div key={String(prompt.id)} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-medium">User #{String(prompt.user_id)}</p>
                <p className="text-slate-700">{String(prompt.content)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
