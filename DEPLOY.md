# Deploy: Vercel + Neon

## 1. Banco de dados no Neon

1. Acesse [neon.tech](https://neon.tech) e crie uma conta gratuita
2. Crie um novo projeto → anote a **Connection String** (começa com `postgresql://...`)
3. No painel do Neon, vá em **SQL Editor** e cole todo o conteúdo do arquivo `schema.sql` e execute
4. Isso vai criar as tabelas e o usuário admin padrão (`admin@copapalpite.com` / senha `admin`)

## 2. Deploy no Vercel

1. Faça push do projeto para um repositório GitHub (novo ou existente)
2. Acesse [vercel.com](https://vercel.com) → **New Project** → importe o repositório
3. Em **Environment Variables**, adicione:
   - `DATABASE_URL` → cole a Connection String do Neon
4. Clique em **Deploy**

## 3. Acesso inicial

- Acesse o projeto no Vercel
- Faça login com: `admin@copapalpite.com` / `admin`
- Vá em **Admin → Jogos** para adicionar os jogos do bolão
- O banco começa vazio — nenhum jogo pré-cadastrado

## Credenciais padrão (criadas pelo schema.sql)
| Campo | Valor |
|-------|-------|
| E-mail | admin@copapalpite.com |
| Senha | admin |
| Admin | ✅ |

## Desenvolvimento local

```bash
cp .env.example .env.local
# edite .env.local com sua DATABASE_URL do Neon

pnpm install
pnpm dev
```
