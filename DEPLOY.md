# Deploy na Hostinger

Projeto: `igreja-oris`

## Plano necessario

Este projeto precisa de Node.js rodando no servidor, porque o Express entrega a API `/api/*` e tambem serve o build do React.

Na Hostinger, use um plano com suporte a **Node.js Web App**, como Business Web Hosting, Cloud Hosting ou VPS.

## Banco de dados

No hPanel da Hostinger, crie um banco MySQL/MariaDB:

- Banco: escolha o nome exibido pela Hostinger
- Usuario: escolha o usuario exibido pela Hostinger
- Senha: use uma senha forte
- Host: normalmente algo como `localhost` ou um host informado no painel

Depois coloque esses dados nas variaveis de ambiente do app.

## Deploy via GitHub

1. Suba este projeto para um repositorio privado chamado `igreja-oris`.
2. No hPanel, abra **Node.js Apps** ou **Web App**.
3. Escolha deploy via GitHub e selecione o repositorio `igreja-oris`.
4. Configure:

```txt
Application root: /
Build command: npm run build
Start command: npm start
Node.js version: 18+ ou 20+
```

O comando `npm run build` instala dependencias do frontend e gera `frontend/dist/`.
O comando `npm start` inicia `backend/src/server.js`.

## Variaveis de ambiente

Configure no painel da Hostinger:

```env
NODE_ENV=production
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_NAME=nome_do_banco_hostinger
DB_USER=usuario_do_banco_hostinger
DB_PASS=senha_do_banco_hostinger

JWT_ACCESS_SECRET=gere_um_hex_de_64_bytes
JWT_REFRESH_SECRET=gere_outro_hex_de_64_bytes
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

CSRF_SECRET=gere_um_hex_de_32_bytes

FRONTEND_URL=https://seudominio.com.br
COOKIE_DOMAIN=seudominio.com.br
COOKIE_SECURE=true
```

Para gerar segredos:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Criar tabelas e dados iniciais

Depois do primeiro deploy, execute uma vez no terminal/console da Hostinger:

```bash
cd backend
npm run migrate
npm run seed
```

Se a Hostinger rodar os comandos a partir da raiz do projeto, use:

```bash
npm run migrate
npm run seed
```

## Acesso

Site:

```txt
https://seudominio.com.br
```

Admin:

```txt
https://seudominio.com.br/admin
```

Credenciais iniciais:

```txt
Email: admin@teste.com
Senha: Admin@PES2026!
```

Troque a senha logo apos o primeiro login.

## Desenvolvimento local

```bash
cd pes
npm install
npm run setup
npm run dev
```

URLs locais:

```txt
Backend: http://localhost:3002
Frontend: http://localhost:5173
Admin: http://localhost:5173/admin
```
