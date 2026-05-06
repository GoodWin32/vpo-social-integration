'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Status = 'loading' | 'none' | 'pending_sent' | 'pending_received' | 'accepted'

export default function FriendButton({
  currentUserId,
  targetUserId,
  targetName,
}: {
  currentUserId: string
  targetUserId: string
  targetName?: string | null
}) {
  const [status, setStatus] = useState<Status>('loading')
  const [acting, setActing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (currentUserId === targetUserId) { setStatus('none'); return }

    supabase
      .from('friendships')
      .select('requester_id, status')
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.eq.${targetUserId}),` +
        `and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUserId})`
      )
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return setStatus('none')
        if (data.status === 'accepted') return setStatus('accepted')
        setStatus(data.requester_id === currentUserId ? 'pending_sent' : 'pending_received')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, targetUserId])

  async function sendRequest() {
    setActing(true)

    // Fetch the current user's name for the notification body
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', currentUserId)
      .single()

    await supabase.from('friendships').insert({
      requester_id: currentUserId,
      addressee_id: targetUserId,
    })
    await supabase.from('notifications').insert({
      user_id: targetUserId,
      type: 'community',
      title: 'Запит у друзі',
      body: `${myProfile?.full_name ?? 'Користувач'} хоче додати вас до друзів`,
      link: '/friends',
    })
    setStatus('pending_sent')
    setActing(false)
  }

  async function acceptAndNotify() {
    setActing(true)
    await supabase
      .from('friendships')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('requester_id', targetUserId)
      .eq('addressee_id', currentUserId)

    // Notify the requester that their request was accepted
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', currentUserId)
      .single()

    await supabase.from('notifications').insert({
      user_id: targetUserId,
      type: 'community',
      title: 'Запит у друзі прийнято',
      body: `${myProfile?.full_name ?? 'Користувач'} прийняв(ла) ваш запит у друзі`,
      link: '/friends',
    })
    setStatus('accepted')
    setActing(false)
  }


  async function remove() {
    setActing(true)
    await supabase
      .from('friendships')
      .delete()
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.eq.${targetUserId}),` +
        `and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUserId})`
      )
    setStatus('none')
    setActing(false)
  }

  if (status === 'loading' || currentUserId === targetUserId) return null

  if (status === 'accepted') {
    return (
      <button
        onClick={remove}
        disabled={acting}
        title="Натисніть щоб видалити з друзів"
        className="text-xs px-3 py-1 rounded-full border border-green-200 text-green-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40"
      >
        ✓ Друзі
      </button>
    )
  }

  if (status === 'pending_sent') {
    return (
      <button
        onClick={remove}
        disabled={acting}
        title="Скасувати запит"
        className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
      >
        Запит надіслано
      </button>
    )
  }

  if (status === 'pending_received') {
    return (
      <div className="flex gap-1.5">
        <button
          onClick={acceptAndNotify}
          disabled={acting}
          className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-40"
        >
          Прийняти
        </button>
        <button
          onClick={remove}
          disabled={acting}
          className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition disabled:opacity-40"
        >
          Відхилити
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={sendRequest}
      disabled={acting}
      className="text-xs px-3 py-1 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition disabled:opacity-40"
    >
      + Додати в друзі
    </button>
  )
}
