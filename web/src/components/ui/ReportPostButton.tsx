'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ComplaintReason } from '@/lib/types'

const REASONS: { value: ComplaintReason; label: string }[] = [
  { value: 'spam',           label: 'Спам або реклама' },
  { value: 'harassment',     label: 'Образа або переслідування' },
  { value: 'misinformation', label: 'Дезінформація' },
  { value: 'inappropriate',  label: 'Неприйнятний контент' },
  { value: 'other',          label: 'Інше' },
]

export default function ReportPostButton({
  postId,
  reporterId,
}: {
  postId: string
  reporterId: string
}) {
  const [open, setOpen]         = useState(false)
  const [reason, setReason]     = useState<ComplaintReason>('spam')
  const [comment, setComment]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [alreadySent, setAlreadySent] = useState(false)
  const supabase = createClient()
  const panelRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('post_complaints').insert({
      post_id:     postId,
      reporter_id: reporterId,
      reason,
      comment: comment.trim() || null,
    })

    setLoading(false)

    if (error?.code === '23505') {   // unique_violation — already reported
      setAlreadySent(true)
      setOpen(false)
      return
    }

    setDone(true)
    setComment('')
    setTimeout(() => {
      setDone(false)
      setOpen(false)
    }, 2000)
  }

  if (alreadySent) {
    return (
      <span className="text-xs text-gray-400 italic">Скаргу вже надіслано</span>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Поскаржитись на допис"
        className="text-xs text-gray-400 hover:text-red-500 transition flex items-center gap-1"
      >
        🚩 Скарга
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            ref={panelRef}
            className="absolute right-0 top-7 z-20 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4"
          >
            {done ? (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium py-2">
                <span>✓</span>
                <span>Скаргу надіслано. Дякуємо!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-sm font-semibold text-gray-800">Поскаржитись на допис</p>

                <div className="space-y-1.5">
                  {REASONS.map(r => (
                    <label key={r.value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{r.label}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Додатковий коментар (необов'язково)"
                  rows={2}
                  maxLength={500}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                />

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {loading ? 'Надсилання...' : 'Надіслати скаргу'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  )
}
