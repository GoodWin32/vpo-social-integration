'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Resource, ResourceCategory } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { UKRAINE_REGIONS } from '@/lib/types'

const regionOptions = UKRAINE_REGIONS.map(r => ({ value: r, label: r }))

export default function AdminResourcesPage() {
  const supabase = createClient()
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category_id: '', contact_phone: '', contact_email: '', website_url: '', address: '', city: '', region: '' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      supabase.from('resources').select('*, resource_categories(*)').order('created_at', { ascending: false }).limit(100),
      supabase.from('resource_categories').select('*').order('name'),
    ]).then(([{ data: r }, { data: c }]) => {
      setResources((r as Resource[]) ?? [])
      setCategories(c ?? [])
      setLoading(false)
    })
  }, [])

  function setField(f: string, v: string) { setForm(prev => ({ ...prev, [f]: v })) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('resources').insert({
      ...form,
      category_id: form.category_id || null,
      created_by: user?.id,
    }).select('*, resource_categories(*)').single()
    if (data) setResources(prev => [data as Resource, ...prev])
    setForm({ title: '', description: '', category_id: '', contact_phone: '', contact_email: '', website_url: '', address: '', city: '', region: '' })
    setShowForm(false)
    setSaving(false)
  }

  async function handleVerify(id: string, verified: boolean) {
    await supabase.from('resources').update({ is_verified: !verified }).eq('id', id)
    setResources(prev => prev.map(r => r.id === id ? { ...r, is_verified: !verified } : r))
  }

  async function handleDelete(id: string) {
    if (!confirm('Видалити цей ресурс?')) return
    await supabase.from('resources').delete().eq('id', id)
    setResources(prev => prev.filter(r => r.id !== id))
  }

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Управління ресурсами"
        description={`Всього: ${resources.length}`}
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Скасувати' : '+ Додати ресурс'}
          </Button>
        }
      />

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h3 className="font-bold text-gray-900">Новий ресурс</h3>
          <Input label="Назва" required value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Назва організації або служби" />
          <Textarea label="Опис" value={form.description} onChange={e => setField('description', e.target.value)} rows={3} placeholder="Опис послуг..." />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Категорія" value={form.category_id} onChange={e => setField('category_id', e.target.value)} options={catOptions} placeholder="Оберіть категорію" />
            <Input label="Телефон" value={form.contact_phone} onChange={e => setField('contact_phone', e.target.value)} placeholder="+380..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.contact_email} onChange={e => setField('contact_email', e.target.value)} placeholder="info@..." />
            <Input label="Сайт" value={form.website_url} onChange={e => setField('website_url', e.target.value)} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Місто" value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Київ" />
            <Select label="Регіон" value={form.region} onChange={e => setField('region', e.target.value)} options={regionOptions} placeholder="Оберіть регіон" />
          </div>
          <Input label="Адреса" value={form.address} onChange={e => setField('address', e.target.value)} placeholder="вул. ..." />
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Скасувати</Button>
            <Button type="submit" loading={saving} className="flex-1">Зберегти ресурс</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Завантаження...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ресурс</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Категорія</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Додано</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {resources.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{r.title}</p>
                    {r.city && <p className="text-xs text-gray-400">📍 {r.city}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {r.resource_categories
                      ? <Badge variant="blue">{r.resource_categories.icon} {r.resource_categories.name}</Badge>
                      : <span className="text-gray-400">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.is_verified ? 'green' : 'gray'}>
                      {r.is_verified ? '✓ Перевірено' : 'Не перевірено'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleVerify(r.id, r.is_verified)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                          r.is_verified ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {r.is_verified ? 'Скасувати' : 'Підтвердити'}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        Видалити
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {resources.length === 0 && <div className="py-12 text-center text-gray-400">Ресурсів не знайдено</div>}
        </div>
      )}
    </div>
  )
}
