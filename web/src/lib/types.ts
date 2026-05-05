export type UserRole = 'user' | 'admin'
export type UserStatus = 'active' | 'blocked'
export type EventFormat = 'online' | 'offline' | 'hybrid'
export type MemberRole = 'member' | 'moderator' | 'admin'
export type NotificationType = 'message' | 'event' | 'community' | 'admin'

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  city: string | null
  region: string | null
  origin_city: string | null
  origin_region: string | null
  is_vpo: boolean
  bio: string | null
  phone: string | null
  interests: string[]
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

export type Community = {
  id: string
  name: string
  description: string | null
  city: string | null
  region: string | null
  category: string | null
  rules: string | null
  image_url: string | null
  is_approved: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  member_count?: number
  is_member?: boolean
}

export type CommunityMember = {
  id: string
  community_id: string
  user_id: string
  role: MemberRole
  joined_at: string
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'city'>
}

export type CommunityPost = {
  id: string
  community_id: string
  author_id: string
  content: string
  created_at: string
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type ResourceCategory = {
  id: string
  name: string
  slug: string
  icon: string | null
}

export type Resource = {
  id: string
  title: string
  description: string | null
  category_id: string | null
  contact_phone: string | null
  contact_email: string | null
  website_url: string | null
  address: string | null
  city: string | null
  region: string | null
  is_verified: boolean
  created_by: string | null
  created_at: string
  resource_categories?: ResourceCategory
}

export type Event = {
  id: string
  title: string
  description: string | null
  city: string | null
  region: string | null
  address: string | null
  online_link: string | null
  format: EventFormat
  category: string | null
  image_url: string | null
  starts_at: string
  ends_at: string | null
  max_participants: number | null
  community_id: string | null
  organizer_id: string | null
  is_approved: boolean
  created_at: string
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  participant_count?: number
  is_registered?: boolean
}

export type EventParticipant = {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type Room = {
  id: string
  name: string
  description: string | null
  is_public: boolean
  created_by: string | null
  created_at: string
}

export type Message = {
  id: string
  room_id: string
  user_id: string
  content: string
  is_read: boolean
  created_at: string
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type DirectMessage = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  receiver?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type Notification = {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export type AdminAction = {
  id: string
  admin_id: string | null
  action_type: string
  target_type: string | null
  target_id: string | null
  description: string | null
  created_at: string
  profiles?: Pick<Profile, 'id' | 'full_name'>
}

export const COMMUNITY_CATEGORIES = [
  'Загальне',
  'Сім\'ї з дітьми',
  'Молодь',
  'Люди похилого віку',
  'Підприємці',
  'IT та технології',
  'Культура та мистецтво',
  'Спорт',
  'Освіта',
  'Волонтерство',
] as const

export const EVENT_CATEGORIES = [
  'Освіта',
  'Культура',
  'Спорт',
  'Волонтерство',
  'Бізнес',
  'Здоров\'я',
  'Соціальна підтримка',
  'Розваги',
  'Конференція',
  'Воркшоп',
] as const

export const UKRAINE_REGIONS = [
  'Вінницька',
  'Волинська',
  'Дніпропетровська',
  'Донецька',
  'Житомирська',
  'Закарпатська',
  'Запорізька',
  'Івано-Франківська',
  'Київська',
  'Кіровоградська',
  'Луганська',
  'Львівська',
  'Миколаївська',
  'Одеська',
  'Полтавська',
  'Рівненська',
  'Сумська',
  'Тернопільська',
  'Харківська',
  'Херсонська',
  'Хмельницька',
  'Черкаська',
  'Чернівецька',
  'Чернігівська',
  'м. Київ',
] as const

export const INTERESTS = [
  'Освіта',
  'Культура',
  'Спорт',
  'Волонтерство',
  'Бізнес',
  'Здоров\'я',
  'IT',
  'Мистецтво',
  'Музика',
  'Кулінарія',
  'Садівництво',
  'Подорожі',
  'Мови',
  'Психологія',
] as const
