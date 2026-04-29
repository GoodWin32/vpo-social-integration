'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/ui/Avatar'
import { formatRelativeTime } from '@/lib/utils'

type Room    = { id: string; name: string; description: string | null }
type Profile = { id: string; full_name: string | null; avatar_url: string | null }
type Message = {
  id: string; content: string; created_at: string; user_id: string
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

export default function ChatRoom({ rooms, currentUser }: { rooms: Room[]; currentUser: Profile }) {
  const [activeRoom, setActiveRoom] = useState<Room>(rooms[0])
  const [messages, setMessages]     = useState<Message[]>([])
  const [input, setInput]           = useState('')
  const [sending, setSending]       = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase  = createClient()

  useEffect(() => {
    if (!activeRoom) return
    setMessages([])

    supabase
      .from('messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('room_id', activeRoom.id)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => setMessages((data as Message[]) ?? []))

    const channel = supabase
      .channel(`room:${activeRoom.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom.id}` },
        async payload => {
          const { data: msg } = await supabase.from('messages').select('*, profiles(full_name, avatar_url)').eq('id', payload.new.id).single()
          if (msg) setMessages(prev => [...prev, msg as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoom?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    await supabase.from('messages').insert({ room_id: activeRoom.id, user_id: currentUser.id, content: input.trim() })
    setInput('')
    setSending(false)
  }

  if (rooms.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400">Кімнати недоступні</div>
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-white rounded-2xl shadow-sm p-3 flex flex-col gap-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">Кімнати</p>
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => setActiveRoom(room)}
            className={`text-left px-3 py-2 rounded-lg text-sm transition ${
              activeRoom?.id === room.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            # {room.name}
          </button>
        ))}
      </aside>

      {/* Chat */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <p className="font-semibold text-gray-800"># {activeRoom?.name}</p>
          {activeRoom?.description && <p className="text-xs text-gray-400">{activeRoom.description}</p>}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg, i) => {
            const isOwn = msg.user_id === currentUser.id
            const showAvatar = i === 0 || messages[i - 1].user_id !== msg.user_id
            return (
              <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 shrink-0">
                  {showAvatar && (
                    <Avatar src={msg.profiles?.avatar_url} name={msg.profiles?.full_name} size="sm" />
                  )}
                </div>
                <div className={`max-w-sm flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {showAvatar && (
                    <p className={`text-xs text-gray-400 mb-1 ${isOwn ? 'text-right' : ''}`}>
                      {isOwn ? 'Ви' : (msg.profiles?.full_name ?? 'Анонім')}
                      <span className="ml-2">{formatRelativeTime(msg.created_at)}</span>
                    </p>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              Поки немає повідомлень. Будьте першим!
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
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
    </div>
  )
}
