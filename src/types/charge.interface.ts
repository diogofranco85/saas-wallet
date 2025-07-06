export interface IChargeDetails {
  id: string
  amount: number
  description: string
  status: string
  payer_name?: string
  payer_email?: string
  payer_document?: string
  pix_key?: string
  qr_code?: string
  expires_at: string
  paid_at?: string
  created_at: string
  payment_id?: string
  endtoend: string
  companies?: {
    id: string
    name: string
  }
}