'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import PageHeader from '@/components/layout/PageHeader'
import { profileCompletion } from '@/lib/utils'
import { UKRAINE_REGIONS, INTERESTS } from '@/lib/types'

const regionOptions = UKRAINE_REGIONS.map(r => ({ value: r, label: r }))

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) setProfile(data)
        setLoading(false)
      })
    })
  }, [])

  function setField(field: string, value: unknown) {
    setProfile(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function toggleInterest(interest: string) {
    const current = (profile.interests as string[]) ?? []
    setField('interests', current.includes(interest) ? current.filter(i => i !== interest) : [...current, interest])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase.from('profiles').update({
      full_name:     profile.full_name,
      avatar_url:    profile.avatar_url,
      city:          profile.city,
      region:        profile.region,
      origin_city:   profile.origin_city,
      origin_region: profile.origin_region,
      bio:           profile.bio,
      phone:         profile.phone,
      interests:     profile.interests,
    }).eq('id', profile.id as string)

    if (error) setError(error.message)
    else setSaved(true)
    setSaving(false)
  }

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64 text-gray-400">Завантаження...</div>
  }

  const completion = profileCompletion(profile as Parameters<typeof profileCompletion>[0])
  const interests = (profile.interests as string[]) ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Мій профіль"
        description="Керуйте своїми особистими даними та налаштуваннями"
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: avatar + stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="flex justify-center mb-4">
              <Avatar src={profile.avatar_url as string} name={profile.full_name as string} size="xl" />
            </div>
            <h2 className="font-bold text-gray-900">{(profile.full_name as string) || 'Без імені'}</h2>
            <p className="text-sm text-gray-400 mt-1">{(profile.city as string) || 'Місто не вказано'}</p>
            {!!profile.is_vpo && <Badge variant="blue" className="mt-2">ВПО</Badge>}

            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Заповненість профілю</span>
                <span className="font-semibold text-blue-600">{completion}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Інтереси</h3>
            <div className="flex flex-wrap gap-2">
              {interests.length > 0
                ? interests.map(i => <Badge key={i} variant="blue">{i}</Badge>)
                : <p className="text-xs text-gray-400">Не вказано</p>
              }
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-3">Особиста інформація</h3>

            <Input label="Повне ім'я" value={(profile.full_name as string) ?? ''} onChange={e => setField('full_name', e.target.value)} placeholder="Іван Іваненко" />
            <Input label="URL аватару" value={(profile.avatar_url as string) ?? ''} onChange={e => setField('avatar_url', e.target.value)} placeholder="https://..." hint="Посилання на фото профілю" />
            <Textarea label="Про себе" value={(profile.bio as string) ?? ''} onChange={e => setField('bio', e.target.value)} rows={3} placeholder="Розкажіть трохи про себе..." />
            <Input label="Телефон" value={(profile.phone as string) ?? ''} onChange={e => setField('phone', e.target.value)} placeholder="+380 XX XXX XX XX" />

            <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-3 pt-2">Місцезнаходження</h3>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Поточне місто" value={(profile.city as string) ?? ''} onChange={e => setField('city', e.target.value)} placeholder="Київ" />
              <Select label="Поточний регіон" value={(profile.region as string) ?? ''} onChange={e => setField('region', e.target.value)} options={regionOptions} placeholder="Оберіть регіон" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Місто походження" value={(profile.origin_city as string) ?? ''} onChange={e => setField('origin_city', e.target.value)} placeholder="Харків" />
              <Select label="Регіон походження" value={(profile.origin_region as string) ?? ''} onChange={e => setField('origin_region', e.target.value)} options={regionOptions} placeholder="Оберіть регіон" />
            </div>

            <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-3 pt-2">Інтереси</h3>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                    interests.includes(interest)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {saved && <p className="text-sm text-green-600">✅ Профіль збережено</p>}

            <Button type="submit" loading={saving} size="lg">
              Зберегти зміни
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
