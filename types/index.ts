export type TradeType = 'plumbing' | 'electrical' | 'hvac' | 'general' | 'roofing' | 'painting' | 'carpentry'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total: number
  category: 'labor' | 'material' | 'equipment' | 'permit' | 'other'
}

export interface Estimate {
  id: string
  user_id: string
  estimate_number: string
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired'
  trade_type: TradeType
  job_title: string
  job_description: string
  job_address: string
  customer_name: string
  customer_email: string
  customer_phone: string
  line_items: LineItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  total: number
  notes: string
  valid_until: string
  created_at: string
  updated_at: string
}

export interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  owner_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  license_number: string
  insurance_number: string
  logo_url: string
  website: string
  payment_terms: string
  default_tax_rate: number
  default_validity_days: number
}

export interface Customer {
  id: string
  user_id: string
  name: string
  email: string
  phone: string
  address: string
  notes: string
  created_at: string
}

export interface AIEstimateRequest {
  trade_type: TradeType
  job_description: string
  job_address: string
  square_footage?: number
  additional_notes?: string
}

export interface SubscriptionStatus {
  active: boolean
  plan: 'starter' | 'pro' | 'enterprise' | null
  current_period_end: string | null
}
