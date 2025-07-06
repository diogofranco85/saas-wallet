export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number
          name: string
          document: string
          email: string
          phone: string
          address: Json,
          plan_id: string,
          status: string
          created_at: Date,
          updated_at: Date,
          pix_key: string
          pix_status: string
          stripe_account_url: string,
          stripe_dashboard_url: string
        },
        Insert: {
          name: string
          document: string
          email: string
          phone: string
          address: Json,
          plan_id: string,
          status: string
          pix_key: string
          pix_status: string
          stripe_account_url: string,
          stripe_dashboard_url: string
        },
        Update: {
          name: string,
          phone: string
          address: Json,
          plan_id: string,
          status: string
          pix_key: string
        }
      }
    }
  }
}