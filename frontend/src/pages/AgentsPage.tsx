import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input, TextArea } from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { platformService } from '../services/platform';
import type { Agent, Chat, Message } from '../types';

const defaultAgent = {
  name: '',
  description: '',
  source_type: 'local',
  source_reference: '',
  behavior_prompt: '',
  configuration: '{"temperature": 0.2}',
};

export function AgentsPage() {
  const { session } = useAuth();
  const token = session?.access_token || '';
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentForm, setAgentForm] = useState(defaultAgent);
  const [chatTitle, setChatTitle] = useState('New agent conversation');
  const [messageDraft, setMessageDraft] = useState('');
  const [error, setError] = useState('');

  const selectedAgent = useMemo(() => agents.find((agent) => agent.id === selectedAgentId) || null, [agents, selectedAgentId]);

  useEffect(() => {
    if (!token) return;
    platformService.listAgents(token).then((items) => {
      setAgents(items);
      if (items.length > 0) {
        setSelectedAgentId(items[0].id);
      }
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Failed to load agents'));
  }, [token]);

  useEffect(() => {
    if (!token || !selectedAgentId) return;
    platformService.listChats(token, selectedAgentId).then((items) => {
      setChats(items);
      setSelectedChatId(items[0]?.id ?? null);
    }).catch(() => setChats([]));
  }, [selectedAgentId, token]);

  useEffect(() => {
    if (!token || !selectedChatId) return;
    platformService.listMessages(token, selectedChatId).then(setMessages).catch(() => setMessages([]));
  }, [selectedChatId, token]);

  async function handleCreateAgent(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    try {
      const created = await platformService.createAgent(token, {
        ...agentForm,
        configuration: JSON.parse(agentForm.configuration),
      });
      setAgents((current) => [created, ...current]);
      setSelectedAgentId(created.id);
      setAgentForm(defaultAgent);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create agent');
    }
  }

  async function handleCreateChat() {
    if (!token || !selectedAgentId) return;
    const created = await platformService.createChat(token, selectedAgentId, chatTitle);
    setChats((current) => [created, ...current]);
    setSelectedChatId(created.id);
  }

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    if (!token || !selectedChatId || !messageDraft.trim()) return;
    const nextMessages = await platformService.sendMessage(token, selectedChatId, messageDraft);
    setMessages((current) => [...current, ...nextMessages]);
    setMessageDraft('');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Agents</h1>
        <p className="mt-1 text-sm text-slate-500">Create local or external agents, then chat with them from a clean admin-style dashboard.</p>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
        <div className="space-y-6">
          <Card title="Create Agent">
            <form className="space-y-3" onSubmit={handleCreateAgent}>
              <Input placeholder="Agent name" value={agentForm.name} onChange={(event) => setAgentForm((current) => ({ ...current, name: event.target.value }))} />
              <TextArea placeholder="Description" value={agentForm.description} onChange={(event) => setAgentForm((current) => ({ ...current, description: event.target.value }))} rows={3} />
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={agentForm.source_type} onChange={(event) => setAgentForm((current) => ({ ...current, source_type: event.target.value }))}>
                <option value="local">Local agent</option>
                <option value="external">External API agent</option>
              </select>
              <Input placeholder="Source reference or endpoint" value={agentForm.source_reference} onChange={(event) => setAgentForm((current) => ({ ...current, source_reference: event.target.value }))} />
              <TextArea placeholder="Behavior prompt" value={agentForm.behavior_prompt} onChange={(event) => setAgentForm((current) => ({ ...current, behavior_prompt: event.target.value }))} rows={3} />
              <TextArea placeholder='{"temperature": 0.2}' value={agentForm.configuration} onChange={(event) => setAgentForm((current) => ({ ...current, configuration: event.target.value }))} rows={3} />
              <Button className="w-full" type="submit">Create agent</Button>
            </form>
          </Card>
          <Card title="Your Agents">
            <div className="space-y-2">
              {agents.map((agent) => (
                <button key={agent.id} className={`w-full rounded-xl border px-4 py-3 text-left ${selectedAgentId === agent.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`} onClick={() => setSelectedAgentId(agent.id)}>
                  <p className="font-medium text-slate-900">{agent.name}</p>
                  <p className="text-sm text-slate-500">{agent.source_type === 'local' ? 'Local agent' : 'External API agent'}</p>
                </button>
              ))}
              {agents.length === 0 && <p className="text-sm text-slate-500">No agents yet.</p>}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title={selectedAgent ? `${selectedAgent.name} Chat` : 'Select an agent'} actions={selectedAgent ? <Button onClick={handleCreateChat}>New chat</Button> : null}>
            {selectedAgent ? (
              <div className="grid gap-4 lg:grid-cols-[240px,1fr]">
                <div className="space-y-3 border-b border-slate-200 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
                  <Input value={chatTitle} onChange={(event) => setChatTitle(event.target.value)} placeholder="Chat title" />
                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <button key={chat.id} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${selectedChatId === chat.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setSelectedChatId(chat.id)}>
                        {chat.title}
                      </button>
                    ))}
                    {chats.length === 0 && <p className="text-sm text-slate-500">Create a chat to start messaging.</p>}
                  </div>
                </div>
                <div className="flex min-h-[420px] flex-col">
                  <div className="mb-4 flex-1 space-y-3 rounded-xl bg-slate-50 p-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`max-w-xl rounded-xl px-4 py-3 text-sm ${message.role === 'assistant' ? 'bg-white text-slate-800' : 'ml-auto bg-slate-900 text-white'}`}>
                        <p className="mb-1 text-xs uppercase tracking-wide opacity-60">{message.role}</p>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                    {messages.length === 0 && <p className="text-sm text-slate-500">No messages yet.</p>}
                  </div>
                  <form className="space-y-3" onSubmit={handleSendMessage}>
                    <TextArea rows={4} value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Type a prompt for the selected agent..." />
                    <div className="flex justify-end">
                      <Button type="submit">Send</Button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Create an agent to unlock chat and history.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
