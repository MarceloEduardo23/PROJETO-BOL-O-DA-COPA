export function Emblem({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center font-heading font-black leading-none tracking-tight ${className}`}
      aria-hidden="true"
    >
      <span className="text-foreground">26</span>
    </span>
  )
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary font-heading text-lg font-black text-primary-foreground">
        26
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-base font-extrabold tracking-tight text-foreground">
            COPA PALPITE
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Bolão da Copa 2026
          </span>
        </span>
      )}
    </span>
  )
}
