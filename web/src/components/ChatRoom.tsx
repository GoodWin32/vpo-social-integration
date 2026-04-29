'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Room = { id: string; name: string; description: string | null }
type Profile = { id: string; full_name: string | null; avatar_url: string | null }
type Message = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { full_name: string | null } | null
}

export default function ChatRoom({
  rooms,
  currentUser,
}: {
  rooms: Room[]
  currentUser: Profile
}) {
  const [activeRoom, setActiveRoom] = useState<Room>(rooms[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!activeRoom) return

    // Load existing messages
    supabase
      .from('messages')
      .select('*, profiles(full_name)')
      .eq('room_id', activeRoom.id)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => setMessages((data as Message[]) ?? []))

    // Subscribe to new messages via Realtime
    const channel = supabase
      .channel(`room:${activeRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${activeRoom.id}`,
        },
        async (payload) => {
          const { data: msg } = await supabase
            .from('messages')
            .select('*, profiles(full_name)')
            .eq('id', payload.new.id)
            .single()
          if (msg) setMessages(prev => [...prev, msg as Message])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeRoom])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)

    await supabase.from('messages').insert({
      room_id: activeRoom.id,
      user_id: currentUser.id,
      content: input.trim(),
    })

    setInput('')
    setSending(false)
  }

  return (
    <div className="flex flex-1 max-w-5xl mx-auto w-full px-4 py-6 gap-4 h-[calc(100vh-65px)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white rounded-2xl shadow-sm p-3 flex flex-col gap-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">Кімнати</p>
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => setActiveRoom(room)}
            className={`text-left px-3 py-2 rounded-lg text-sm transition ${
              activeRoom?.id === room.id
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            # {room.name}
          </button>
        ))}
      </aside>

      {/* Chat area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b">
          <p className="font-semibold text-gray-800"># {activeRoom?.name}</p>
          {activeRoom?.description && (
            <p className="text-xs text-gray-400">{activeRoom.description}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.user_id === currentUser.id ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                {msg.profiles?.full_name?.[0] ?? '?'}
              </div>
              <div className={`max-w-xs ${msg.user_id === currentUser.id ? 'items-end' : 'items-start'} flex flex-col`}>
                <p className="text-xs text-gray-400 mb-1">
                  {msg.profiles?.full_name ?? 'Анонім'}
                </p>
                <div className={`px-4 py-2 rounded-2xl text-sm ${
                  msg.user_id === currentUser.id
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="px-5 py-3 border-t flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Напишіть повідомлення..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            Надіслати
          </button>
        </form>
      </div>
    </div>
  )
}
