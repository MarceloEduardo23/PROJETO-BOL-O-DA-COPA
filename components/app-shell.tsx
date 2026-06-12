import { SiteHeader } from '@/components/site-header'
import { PageTransition } from '@/components/page-transition'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-8">
        <PageTransition>{children}</PageTransition>
      </main>
      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground">
          Copa Palpite — projeto de demonstração inspirado na Copa do Mundo 2026. Não afiliado à
          FIFA.
        </div>
      </footer>
    </div>
  )
}
