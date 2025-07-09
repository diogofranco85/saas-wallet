import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabase } from "./supabase"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  jwt: {
    maxAge: 1 * 24 * 60 * 60, // 1 day
    secret: process.env.JWT_SECRET || "default_jwt_secret",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Verificar se usuário já existe
          const { data: existingUser } = await supabase.from("users").select("*").eq("email", user.email).single()

          if (!existingUser) {
            // Criar novo usuário
            await supabase.from("users").insert({
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              google_id: account.providerAccountId,
            })
          }
          return true
        } catch (error) {
          console.error("Error during sign in:", error)
          return false
        }
      }
      return true
    },



    async session({ session, token }: { session: any, token: any }) {
      if (session.user?.email) {
        const { data: user } = await supabase
          .from("users")
          .select("*, companies(*)")
          .eq("email", session.user.email)
          .single()

        if (user) {
          session.user.id = user.id
          session.user.company = user.companies
          session.user.role = user.role
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
