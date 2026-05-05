'use client'

import Avatar from '@/components/ui/Avatar'
import FriendButton from '@/components/ui/FriendButton'

type Member = {
  user_id: string
  profiles: { id: string; full_name: string | null; avatar_url: string | null; city: string | null } | null
}

export default function MemberList({
  members,
  currentUserId,
}: {
  members: Member[]
  currentUserId: string | null
}) {
  return (
    <div className="space-y-2">
      {members.map(m => (
        <div key={m.user_id} className="flex items-center gap-3">
          <Avatar src={m.profiles?.avatar_url} name={m.profiles?.full_name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {m.profiles?.full_name ?? 'Користувач'}
            </p>
            {m.profiles?.city && (
              <p className="text-xs text-gray-400">{m.profiles.city}</p>
            )}
          </div>
          {currentUserId && m.user_id !== currentUserId && (
            <FriendButton
              currentUserId={currentUserId}
              targetUserId={m.user_id}
              targetName={m.profiles?.full_name}
            />
          )}
        </div>
      ))}
    </div>
  )
}
