'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import FriendButton from '@/components/ui/FriendButton'
import Link from 'next/link'

type Person = { id: string; full_name: string | null; avatar_url: string | null; city: string | null }

export default function FriendsClient({
  currentUserId,
  friends,
  incoming,
  outgoing,
}: {
  currentUserId: string
  friends: Person[]
  incoming: Person[]
  outgoing: Person[]
}) {
  const [tab, setTab] = useState<'friends' | 'incoming' | 'outgoing'>('friends')

  const tabs = [
    { key: 'friends',  label: 'Друзі',       count: friends.length },
    { key: 'incoming', label: 'Запити',       count: incoming.length },
    { key: 'outgoing', label: 'Надіслані',    count: outgoing.length },
  ] as const

  function PersonRow({ person, action }: { person: Person; action: React.ReactNode }) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
        <Link href={`/users/${person.id}`} className="shrink-0">
          <Avatar src={person.avatar_url} name={person.full_name} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/users/${person.id}`} className="font-medium text-gray-800 hover:text-blue-600 transition truncate block">
            {person.full_name ?? 'Користувач'}
          </Link>
          {person.city && <p className="text-xs text-gray-400">{person.city}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Friends list */}
      {tab === 'friends' && (
        <div className="space-y-2">
          {friends.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400">
              <div className="text-4xl mb-3">👥</div>
              <p className="font-medium text-gray-600">Список друзів порожній</p>
              <p className="text-sm mt-1">Знаходьте людей у спільнотах та подіях</p>
            </div>
          ) : friends.map(person => (
            <PersonRow
              key={person.id}
              person={person}
              action={
                <>
                  <Link
                    href={`/messages?with=${person.id}`}
                    className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  >
                    Написати
                  </Link>
                  <FriendButton
                    currentUserId={currentUserId}
                    targetUserId={person.id}
                    targetName={person.full_name}
                  />
                </>
              }
            />
          ))}
        </div>
      )}

      {/* Incoming requests */}
      {tab === 'incoming' && (
        <div className="space-y-2">
          {incoming.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-medium text-gray-600">Немає нових запитів</p>
            </div>
          ) : incoming.map(person => (
            <PersonRow
              key={person.id}
              person={person}
              action={
                <FriendButton
                  currentUserId={currentUserId}
                  targetUserId={person.id}
                  targetName={person.full_name}
                />
              }
            />
          ))}
        </div>
      )}

      {/* Outgoing requests */}
      {tab === 'outgoing' && (
        <div className="space-y-2">
          {outgoing.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400">
              <div className="text-4xl mb-3">📤</div>
              <p className="font-medium text-gray-600">Немає надісланих запитів</p>
            </div>
          ) : outgoing.map(person => (
            <PersonRow
              key={person.id}
              person={person}
              action={
                <FriendButton
                  currentUserId={currentUserId}
                  targetUserId={person.id}
                  targetName={person.full_name}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
