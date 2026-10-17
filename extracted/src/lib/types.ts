export type Profile = {
  id: string
  email: string
  username: string
  role: 'user' | 'admin'
  created_at: string
}

export type Listing = {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  platform: 'Mobile' | 'PS5' | 'Xbox' | 'PC'
  rank: string
  coins: number
  images: string[]
  status: 'pending' | 'active' | 'sold' | 'rejected'
  created_at: string
  seller?: Profile
}

export type Order = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  amount: number
  commission: number
  status: 'pending_payment' | 'waiting_admin' | 'in_progress' | 'completed' | 'disputed' | 'cancelled'
  payment_proof?: string
  created_at: string
  updated_at: string
  listing?: Listing
  buyer?: Profile
  seller?: Profile
}

export type Message = {
  id: string
  order_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: Profile
}
