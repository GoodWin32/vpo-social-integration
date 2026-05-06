'use client'

import Avatar from '@/components/ui/Avatar'
import ReportPostButton from '@/components/ui/ReportPostButton'
import { formatRelativeTime } from '@/lib/utils'
import { CommunityPost } from '@/lib/types'

export default function PostItem({
  post,
  currentUserId,
}: {
  post: CommunityPost
  currentUserId: string | null
}) {
  const isOwnPost = currentUserId === post.author_id

  return (
    <div className="border-t border-gray-50 pt-4 first:border-0 first:pt-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Avatar src={post.profiles?.avatar_url} name={post.profiles?.full_name} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-800">{post.profiles?.full_name}</p>
            <p className="text-xs text-gray-400">{formatRelativeTime(post.created_at)}</p>
          </div>
        </div>

        {/* Report button — only for other users' posts */}
        {currentUserId && !isOwnPost && (
          <ReportPostButton postId={post.id} reporterId={currentUserId} />
        )}
      </div>

      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-10">
        {post.content}
      </p>
    </div>
  )
}
