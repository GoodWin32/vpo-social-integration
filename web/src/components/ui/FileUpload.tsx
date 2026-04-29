'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface FileUploadProps {
  bucket: 'avatars' | 'images'
  folder: string          // e.g. userId for avatars, 'communities' for cover images
  currentUrl?: string | null
  onUpload: (url: string) => void
  shape?: 'circle' | 'rect'
  label?: string
  hint?: string
}

export default function FileUpload({
  bucket,
  folder,
  currentUrl,
  onUpload,
  shape = 'rect',
  label,
  hint,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Оберіть файл зображення (JPEG, PNG, WebP, GIF)')
      return
    }
    const maxMb = bucket === 'avatars' ? 5 : 10
    if (file.size > maxMb * 1024 * 1024) {
      setError(`Розмір файлу не повинен перевищувати ${maxMb} МБ`)
      return
    }

    setError(null)
    setUploading(true)

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setPreview(currentUrl ?? null)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    setPreview(data.publicUrl)
    onUpload(data.publicUrl)
    setUploading(false)
  }

  const isCircle = shape === 'circle'

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-colors ${
          isCircle ? 'rounded-full w-24 h-24' : 'rounded-xl w-full h-40'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {!isCircle && <span className="text-xs text-center px-2">Натисніть щоб завантажити</span>}
          </div>
        )}

        {/* Overlay on hover when image exists */}
        {preview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">Змінити</span>
          </div>
        )}

        {/* Upload progress spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      {hint && !error && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
