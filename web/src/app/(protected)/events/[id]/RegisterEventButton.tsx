'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function RegisterEventButton({
  eventId,
  userId,
  isRegistered,
  isFull,
  fullWidth,
}: {
  eventId: string
  userId: string
  isRegistered: boolean
  isFull: boolean
  fullWidth?: boolean
}) {
  const [registered, setRegistered] = useState(isRegistered)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    if (registered) {
      await supabase.from('event_participants').delete().eq('event_id', eventId).eq('user_id', userId)
      setRegistered(false)
    } else {
      await supabase.from('event_participants').insert({ event_id: eventId, user_id: userId })
      setRegistered(true)
    }
    setLoading(false)
    router.refresh()
  }

  if (isFull) {
    return (
      <Button variant="outline" disabled className={fullWidth ? 'w-full' : ''}>
        Місця закінчились
      </Button>
    )
  }

  return (
    <Button
      onClick={toggle}
      loading={loading}
      variant={registered ? 'outline' : 'secondary'}
      size="lg"
      className={fullWidth ? 'w-full' : ''}
    >
      {registered ? 'Скасувати реєстрацію' : 'Зареєструватись'}
    </Button>
  )
}
