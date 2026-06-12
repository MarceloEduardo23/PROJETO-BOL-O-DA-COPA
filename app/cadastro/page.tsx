'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { User, Mail, Lock, Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/lib/store'

export default function CadastroPage() {
  const router = useRouter()
  const { register } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (name.trim().length < 2) e.name = 'Informe seu nome completo.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Informe um e-mail válido.'
    if (password.length < 6) e.password = 'A senha deve ter ao menos 6 caracteres.'
    if (confirm !== password) e.confirm = 'As senhas não coincidem.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    const res = await register(name, email, password)
    setLoading(false)
    if (res.ok) {
      toast.success('Conta criada! Você já está no bolão.')
      router.push('/')
    } else {
      toast.error(res.error ?? 'Falha ao criar conta.')
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Entre no bolão da Copa 2026 e dispute com seus amigos."
      footer={
        <>
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          id="name"
          label="Nome"
          icon={User}
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={setName}
          error={errors.name}
        />
        <Field
          id="email"
          label="E-mail"
          icon={Mail}
          type="email"
          placeholder="voce@email.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <Field
          id="password"
          label="Senha"
          icon={Lock}
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />
        <Field
          id="confirm"
          label="Confirmar senha"
          icon={Lock}
          type="password"
          placeholder="Repita a senha"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm}
        />

        <Button type="submit" disabled={loading} className="mt-2 gap-2">
          {loading && <Loader2 className="size-4 animate-spin" />}
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  )
}

function Field({
  id,
  label,
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  icon: typeof User
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
          aria-invalid={!!error}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
