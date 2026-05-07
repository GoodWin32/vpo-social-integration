'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import ReportPostButton from '@/components/ui/ReportPostButton'
import { formatRelativeTime } from '@/lib/utils'
import { CommunityPost } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Comment = {
  id: string
  content: string
  created_at: string
  author_id: string
  profiles?: { id: string; full_name: string | null; avatar_url: string | null } | null
}

export default function PostItem({
  post,
  currentUserId,
  initialLikes = 0,
  initialLiked = false,
  initialComments = [],
  initialCommentCount = 0,
}: {
  post: CommunityPost
  currentUserId: string | null
  initialLikes?: number
  initialLiked?: boolean
  initialComments?: Comment[]
  initialCommentCount?: number
}) {
  const isOwnPost = currentUserId === post.author_id
  const supabase = createClient()

  // Likes
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(initialLiked)
  const [likingBusy, setLikingBusy] = useState(false)

  // Comments
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentCount, setCommentCount] = useState(initialCommentCount)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(initialComments.length > 0)

  async function toggleLike() {
    if (!currentUserId || likingBusy) return
    setLikingBusy(true)
    if (liked) {
      await supabase.from('post_likes').delete()
        .eq('post_id', post.id).eq('user_id', currentUserId)
      setLikes(l => l - 1)
      setLiked(false)
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: currentUserId })
      setLikes(l => l + 1)
      setLiked(true)
    }
    setLikingBusy(false)
  }

  async function loadComments() {
    if (commentsLoaded) return
    const { data } = await supabase
      .from('post_comments')
      .select('id, content, created_at, author_id, profiles(id, full_name, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments((data as unknown as Comment[]) ?? [])
    setCommentsLoaded(true)
  }

  async function toggleComments() {
    if (!showComments && !commentsLoaded) await loadComments()
    setShowComments(v => !v)
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId || !newComment.trim() || submitting) return
    setSubmitting(true)

    const { data } = await supabase
      .from('post_comments')
      .insert({ post_id: post.id, author_id: currentUserId, content: newComment.trim() })
      .select('id, content, created_at, author_id, profiles(id, full_name, avatar_url)')
      .single()

    if (data) {
      setComments(c => [...c, data as unknown as Comment])
      setCommentCount(n => n + 1)
      setNewComment('')
    }
    setSubmitting(false)
  }

  return (
    <div className="border-t border-gray-50 pt-4 first:border-0 first:pt-0">
      {/* Post header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Link href={`/users/${post.author_id}`}>
            <Avatar src={post.profiles?.avatar_url} name={post.profiles?.full_name} size="sm" />
          </Link>
          <div>
            <Link href={`/users/${post.author_id}`} className="text-sm font-medium text-gray-800 hover:text-blue-600 transition">
              {post.profiles?.full_name}
            </Link>
            <p className="text-xs text-gray-400">{formatRelativeTime(post.created_at)}</p>
          </div>
        </div>
        {currentUserId && !isOwnPost && (
          <ReportPostButton postId={post.id} reporterId={currentUserId} />
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-10 mb-3">
        {post.content}
      </p>

      {/* Actions bar */}
      <div className="pl-10 flex items-center gap-4">
        {/* Like button */}
        <button
          onClick={toggleLike}
          disabled={!currentUserId || likingBusy}
          className={`flex items-center gap-1.5 text-xs transition disabled:opacity-40 ${
            liked ? 'text-red-500 font-medium' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <span className="text-base">{liked ? '❤️' : '🤍'}</span>
          {likes > 0 && <span>{likes}</span>}
        </button>

        {/* Comment toggle */}
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 transition"
        >
          <span className="text-base">💬</span>
          <span>{commentCount > 0 ? commentCount : 'Коментувати'}</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="pl-10 mt-3 space-y-2">
          {comments.map(c => {
            const author = c.profiles
            return (
              <div key={c.id} className="flex gap-2">
                <Link href={`/users/${c.author_id}`} className="shrink-0">
                  <Avatar src={author?.avatar_url} name={author?.full_name} size="xs" />
                </Link>
                <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <Link href={`/users/${c.author_id}`} className="text-xs font-semibold text-gray-700 hover:text-blue-600 transition">
                      {author?.full_name ?? 'Користувач'}
                    </Link>
                    <span className="text-xs text-gray-400">{formatRelativeTime(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
                </div>
              </div>
            )
          })}

          {/* Add comment */}
          {currentUserId && (
            <form onSubmit={submitComment} className="flex gap-2 mt-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Написати коментар..."
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-40"
              >
                →
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
