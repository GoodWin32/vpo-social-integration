'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [success, setSuccess]           = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Пароль має бути не менше 6 символів')
      return
    }
    if (password !== confirm) {
      setError('Паролі не збігаються')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Пароль змінено!</h2>
          <p className="text-gray-500 text-sm">Перенаправлення на головну сторінку...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="text-4xl mb-4 text-center">🔐</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Новий пароль</h1>
        <p className="text-gray-500 text-sm mb-7 text-center">
          Введіть новий пароль для вашого акаунту
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Новий пароль"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Мінімум 6 символів"
          />
          <Input
            label="Повторіть пароль"
            type="password"
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Зберегти новий пароль
          </Button>
        </form>
      </div>
    </div>
  )
}
