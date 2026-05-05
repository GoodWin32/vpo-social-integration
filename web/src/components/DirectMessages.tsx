'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/ui/Avatar'
import { formatRelativeTime } from '@/lib/utils'

type Profile = { id: string; full_name: string | null; avatar_url: string | null }
type DM = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: Profile
}
type Conversation = {
  partner: Profile
  lastMessage: DM
  unreadCount: number
}

export default function DirectMessages({
  currentUser,
  initialConversations,
}: {
  currentUser: Profile
  initialConversations: Conversation[]
}) {
  const searchParams = useSearchParams()
  const withUserId = searchParams.get('with')

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activePartnerId, setActivePartnerId] = useState<string | null>(
    withUserId ?? initialConversations[0]?.partner.id ?? null
  )
  const [messages, setMessages] = useState<DM[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const activePartner = conversations.find(c => c.partner.id === activePartnerId)?.partner

  // If opened with ?with=userId, load that user's profile and open thread
  useEffect(() => {
    if (!withUserId || conversations.find(c => c.partner.id === withUserId)) return
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', withUserId)
      .single()
      .then(({ data }) => {
        if (!data) return
        setConversations(prev => [{
          partner: data as Profile,
          lastMessage: { id: '', sender_id: currentUser.id, receiver_id: withUserId, content: '', is_read: true, created_at: new Date().toISOString() },
          unreadCount: 0,
        }, ...prev])
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withUserId])

  // Load thread when active partner changes
  useEffect(() => {
    if (!activePartnerId) return
    setMessages([])

    supabase
      .from('direct_messages')
      .select('*, sender:profiles!sender_id(id, full_name, avatar_url)')
      .or(
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${activePartnerId}),` +
        `and(sender_id.eq.${activePartnerId},receiver_id.eq.${currentUser.id})`
      )
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => setMessages((data ?? []) as DM[]))

    // Mark incoming messages as read
    supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('receiver_id', currentUser.id)
      .eq('sender_id', activePartnerId)
      .eq('is_read', false)
      .then(() => {
        setConversations(prev =>
          prev.map(c => c.partner.id === activePartnerId ? { ...c, unreadCount: 0 } : c)
        )
      })

    // Realtime subscription for this thread
    const channel = supabase
      .channel(`dm:${[currentUser.id, activePartnerId].sort().join(':')}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        async (payload) => {
          const dm = payload.new as DM
          const inThread =
            (dm.sender_id === currentUser.id && dm.receiver_id === activePartnerId) ||
            (dm.sender_id === activePartnerId && dm.receiver_id === currentUser.id)
          if (!inThread) return

          const { data: msg } = await supabase
            .from('direct_messages')
            .select('*, sender:profiles!sender_id(id, full_name, avatar_url)')
            .eq('id', dm.id)
            .single()
          if (msg) {
            setMessages(prev => [...prev, msg as DM])
            // Mark as read immediately if we're the receiver
            if (dm.receiver_id === currentUser.id) {
              supabase
                .from('direct_messages')
                .update({ is_read: true })
                .eq('id', dm.id)
                .then(() => {})
            }
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePartnerId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Debounced user search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .neq('id', currentUser.id)
        .ilike('full_name', `%${searchQuery}%`)
        .limit(8)
      setSearchResults((data ?? []) as Profile[])
    }, 300)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !activePartnerId || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')

    const { data: msg } = await supabase
      .from('direct_messages')
      .insert({ sender_id: currentUser.id, receiver_id: activePartnerId, content })
      .select('*, sender:profiles!sender_id(id, full_name, avatar_url)')
      .single()

    if (msg) {
      setConversations(prev => {
        const exists = prev.find(c => c.partner.id === activePartnerId)
        if (exists) {
          return prev.map(c =>
            c.partner.id === activePartnerId ? { ...c, lastMessage: msg as DM } : c
          )
        }
        return prev
      })
    }
    setSending(false)
  }

  function openConversation(partner: Profile) {
    if (!conversations.find(c => c.partner.id === partner.id)) {
      setConversations(prev => [{
        partner,
        lastMessage: { id: '', sender_id: currentUser.id, receiver_id: partner.id, content: '', is_read: true, created_at: new Date().toISOString() },
        unreadCount: 0,
      }, ...prev])
    }
    setActivePartnerId(partner.id)
    setShowSearch(false)
    setSearchQuery('')
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Conversations list */}
      <aside className="w-64 shrink-0 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={() => setShowSearch(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-xl transition"
          >
            + Нове повідомлення
          </button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8 px-4">
              Немає повідомлень.<br />Почніть нову розмову.
            </div>
          ) : conversations.map(conv => (
            <button
              key={conv.partner.id}
              onClick={() => setActivePartnerId(conv.partner.id)}
              className={`w-full text-left px-3 py-3 flex gap-3 items-center hover:bg-gray-50 transition ${
                activePartnerId === conv.partner.id ? 'bg-blue-50' : ''
              }`}
            >
              <Avatar src={conv.partner.avatar_url} name={conv.partner.full_name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {conv.partner.full_name ?? 'Користувач'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {conv.lastMessage.content || 'Почати розмову'}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {conv.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Message thread */}
      {activePartnerId ? (
        <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 shrink-0 flex items-center gap-3">
            <Avatar src={activePartner?.avatar_url} name={activePartner?.full_name} size="sm" />
            <p className="font-semibold text-gray-800">{activePartner?.full_name ?? 'Користувач'}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                Починайте розмову!
              </div>
            )}
            {messages.map((msg, i) => {
              const isOwn = msg.sender_id === currentUser.id
              const showMeta = i === 0 || messages[i - 1].sender_id !== msg.sender_id
              return (
                <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 shrink-0">
                    {showMeta && (
                      <Avatar src={msg.sender?.avatar_url} name={msg.sender?.full_name} size="sm" />
                    )}
                  </div>
                  <div className={`max-w-sm flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    {showMeta && (
                      <p className="text-xs text-gray-400 mb-1">
                        {isOwn ? 'Ви' : (msg.sender?.full_name ?? 'Анонім')}
                        <span className="ml-2">{formatRelativeTime(msg.created_at)}</span>
                      </p>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="px-5 py-3 border-t border-gray-100 flex gap-3 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Написати повідомлення..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              Надіслати
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 text-sm">
          Оберіть розмову або почніть нову
        </div>
      )}

      {/* New message search modal */}
      {showSearch && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) { setShowSearch(false); setSearchQuery('') } }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Нове повідомлення</h3>
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Пошук користувача за іменем..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {searchResults.map(user => (
                <button
                  key={user.id}
                  onClick={() => openConversation(user)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition"
                >
                  <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                  <span className="text-sm text-gray-800">{user.full_name ?? 'Користувач'}</span>
                </button>
              ))}
              {searchQuery.trim() && searchResults.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Нікого не знайдено</p>
              )}
              {!searchQuery.trim() && (
                <p className="text-sm text-gray-400 text-center py-4">Введіть ім&apos;я для пошуку</p>
              )}
            </div>
            <button
              onClick={() => { setShowSearch(false); setSearchQuery('') }}
              className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
