import type { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            company: {
                id: string
                name: string
                document: string
                plan_id: string
            } | null
        } & DefaultSession["user"]
    }
}
