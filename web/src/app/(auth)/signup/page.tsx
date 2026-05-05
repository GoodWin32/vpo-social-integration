'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { UKRAINE_REGIONS, INTERESTS } from '@/lib/types'

const regionOptions = UKRAINE_REGIONS.map(r => ({ value: r, label: r }))
const roleOptions = [
  { value: 'vpo',       label: 'Внутрішньо переміщена особа (ВПО)' },
  { value: 'volunteer', label: 'Волонтер' },
  { value: 'ngo',       label: 'Представник організації/НГО' },
  { value: 'other',     label: 'Інше' },
]

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    region: '',
    userRole: '',
    selectedInterests: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  function setField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function toggleInterest(interest: string) {
    setForm(prev => ({
      ...prev,
      selectedInterests: prev.selectedInterests.includes(interest)
        ? prev.selectedInterests.filter(i => i !== interest)
        : [...prev.selectedInterests, interest],
    }))
  }

  function validateStep1() {
    const errs: Record<string, string> = {}
    if (!form.fullName.trim())    errs.fullName = 'Введіть ваше ім\'я'
    if (!form.email.trim())       errs.email = 'Введіть email'
    if (!form.password)           errs.password = 'Введіть пароль'
    if (form.password.length < 6) errs.password = 'Пароль має бути не менше 6 символів'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Паролі не збігаються'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (validateStep1()) setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          city: form.city,
          region: form.region,
          interests: form.selectedInterests,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })

    if (error) {
      setErrors({ submit: error.message })
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Перевірте вашу пошту!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Ми надіслали листа на <strong>{form.email}</strong>.<br />
            Підтвердьте email для завершення реєстрації.
          </p>
          <Link href="/login" className="text-blue-600 hover:underline text-sm font-medium">
            Повернутись до входу
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-2xl shadow-md p-8">
        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-7">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                s <= step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>{s}</div>
              {s === 1 && <div className="h-0.5 w-16 bg-gray-200 rounded" />}
            </div>
          ))}
          <div className="ml-2 text-sm text-gray-500">
            {step === 1 ? 'Основна інформація' : 'Місцезнаходження та інтереси'}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Реєстрація</h1>
        <p className="text-gray-500 text-sm mb-6">
          {step === 1 ? 'Створіть свій акаунт на платформі ВПО' : 'Допоможіть нам знайти для вас відповідну спільноту'}
        </p>

        {step === 1 && (
          <div className="space-y-4">
            <Input label="Повне ім'я" required value={form.fullName} onChange={e => setField('fullName', e.target.value)} error={errors.fullName} placeholder="Іван Іваненко" />
            <Input label="Email" type="email" required value={form.email} onChange={e => setField('email', e.target.value)} error={errors.email} placeholder="your@email.com" />
            <Input label="Пароль" type="password" required value={form.password} onChange={e => setField('password', e.target.value)} error={errors.password} placeholder="Мінімум 6 символів" />
            <Input label="Повторіть пароль" type="password" required value={form.confirmPassword} onChange={e => setField('confirmPassword', e.target.value)} error={errors.confirmPassword} placeholder="••••••••" />
            <Button onClick={handleNext} className="w-full" size="lg">Далі →</Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Місто" value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Київ" />
              <Select label="Регіон" value={form.region} onChange={e => setField('region', e.target.value)} options={regionOptions} placeholder="Оберіть регіон" />
            </div>
            <Select label="Ваш статус / роль" value={form.userRole} onChange={e => setField('userRole', e.target.value)} options={roleOptions} placeholder="Оберіть роль" />

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Інтереси (оберіть кілька)</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                      form.selectedInterests.includes(interest)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                ← Назад
              </Button>
              <Button type="submit" loading={loading} className="flex-1" size="lg">
                Зареєструватись
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Вже є акаунт?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">Увійти</Link>
        </p>
      </div>
    </div>
  )
}
