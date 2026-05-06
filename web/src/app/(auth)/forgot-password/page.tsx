'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?type=recovery`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-md p-8">
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Перевірте пошту</h2>
            <p className="text-gray-500 text-sm mb-6">
              Ми надіслали посилання для відновлення паролю на <strong>{email}</strong>.
            </p>
            <Link href="/login" className="text-blue-600 hover:underline text-sm font-medium">
              Повернутись до входу
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Відновлення паролю</h1>
            <p className="text-gray-500 text-sm mb-7">
              Введіть email вашого акаунту і ми надішлемо посилання для відновлення паролю.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Надіслати посилання
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Згадали пароль?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">Увійти</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
