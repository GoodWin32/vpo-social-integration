import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import FriendsClient from './FriendsClient'

type Person = { id: string; full_name: string | null; avatar_url: string | null; city: string | null }
type FriendshipRow = {
  requester_id: string
  addressee_id: string
  status: string
  requester: Person
  addressee: Person
}

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id, status, requester:profiles!requester_id(id, full_name, avatar_url, city), addressee:profiles!addressee_id(id, full_name, avatar_url, city)')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const friendships = (rows ?? []) as unknown as FriendshipRow[]

  const friends  = friendships.filter(f => f.status === 'accepted').map(f =>
    f.requester_id === user.id ? f.addressee : f.requester
  )
  const incoming = friendships.filter(f => f.status === 'pending' && f.addressee_id === user.id).map(f => f.requester)
  const outgoing = friendships.filter(f => f.status === 'pending' && f.requester_id === user.id).map(f => f.addressee)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Друзі"
        description="Керуйте своїми зв'язками на платформі"
      />
      <FriendsClient
        currentUserId={user.id}
        friends={friends}
        incoming={incoming}
        outgoing={outgoing}
      />
    </div>
  )
}
