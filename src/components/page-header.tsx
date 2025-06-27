"use client"

import * as React from "react"
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: { title: string; href?: string }[]
  action?: React.ReactNode
}

export function PageHeader({ title, description, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 py-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <div>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.title}</BreadcrumbPage>
                  )}
                </div>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-pink-700">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  )
}
