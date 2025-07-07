import { NextResponse } from "next/server"

export async function GET() {
  const siteUrl = process.env.SITE_URL;

  const content = `
User-agent: *
Disallow: /dashboard
Disallow: /admin
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`.trim()

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}