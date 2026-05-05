'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function JoinCommunityButton({
  communityId,
  userId,
  isMember,
}: {
  communityId: string
  userId: string
  isMember: boolean
}) {
  const [member, setMember] = useState(isMember)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    if (member) {
      await supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', userId)
      setMember(false)
    } else {
      await supabase.from('community_members').insert({ community_id: communityId, user_id: userId })
      setMember(true)
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      onClick={toggle}
      loading={loading}
      variant={member ? 'outline' : 'primary'}
      size="lg"
    >
      {member ? 'Вийти зі спільноти' : 'Приєднатись'}
    </Button>
  )
}
