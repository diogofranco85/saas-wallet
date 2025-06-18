import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
    typescript: true,
})

// Configurações específicas para PIX no Brasil
export const STRIPE_CONFIG = {
    country: "BR",
    currency: "brl",
    payment_methods: ["pix"],
    // Taxa padrão da plataforma (pode ser configurável por plano)
    platform_fee_percentage: 0.005, // 0.5% da transação
}

// Tipos para o Stripe Connect
export interface StripeAccountData {
    id: string
    type: "express" | "standard" | "custom"
    country: string
    email?: string
    business_type?: string
    charges_enabled: boolean
    payouts_enabled: boolean
    details_submitted: boolean
    requirements?: {
        currently_due: string[]
        eventually_due: string[]
        past_due: string[]
        pending_verification: string[]
    }
}

export interface CreateAccountParams {
    email: string
    country?: string
    type?: "express" | "standard"
    business_type?: "individual" | "company"
    company?: {
        name: string
        tax_id?: string
        phone?: string
    }
    individual?: {
        first_name: string
        last_name: string
        email: string
        phone?: string
    }
}
