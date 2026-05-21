# Deploy na VPS KingHost com dominio na Hostinger

Projeto: `igreja-oris`  
Dominio: `oresong.com`

## 1) DNS na Hostinger

No painel da Hostinger, em `Domains -> Manage -> DNS / Nameservers`:

1. Remova registros antigos `A`, `AAAA` e `CNAME` de `@` e `www` (se existirem).
2. Crie:
   - `A` nome `@` apontando para o IP publico da VPS
   - `A` nome `www` apontando para o IP publico da VPS
3. Aguarde propagacao (pode levar ate 24h).

## 2) Preparar a VPS (Ubuntu)

Conecte via SSH:

```bash
ssh root@SEU_IP_DA_VPS
```

Instale Docker Engine + Compose plugin (repositorio oficial Docker):

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 3) Subir o projeto na VPS

```bash
cd /opt
git clone URL_DO_SEU_REPO igreja-oris
cd igreja-oris
cp env.production.example .env.production
```

Edite `.env.production` e troque todos os segredos/senhas.

Suba os containers em modo producao:

```bash
docker compose --env-file .env.production -f docker-compose.yml -f compose.production.yml up -d --build
```

Rode seed inicial:

```bash
docker compose --env-file .env.production -f docker-compose.yml -f compose.production.yml exec -T backend npm run seed
```

## 4) (Opcional) Importar conteudo legado da ORES no banco novo

Do seu computador local para a VPS:

```bash
scp /caminho/local/sqldump.sql root@SEU_IP_DA_VPS:/tmp/legacy.sql
```

Na VPS:

```bash
cd /opt/igreja-oris
docker compose --env-file .env.production -f docker-compose.yml -f compose.production.yml exec -T -e LEGACY_SQL_PATH=/tmp/legacy.sql backend node backend/src/database/importLegacyOres.js --overwrite
```

## 5) Nginx reverse proxy (dominio unico)

Instale Nginx:

```bash
sudo apt install -y nginx
```

Publique o arquivo de proxy:

```bash
sudo cp deploy/nginx/oresong.com.conf.example /etc/nginx/sites-available/oresong.com
sudo ln -sf /etc/nginx/sites-available/oresong.com /etc/nginx/sites-enabled/oresong.com
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 6) SSL (Let's Encrypt / Certbot)

```bash
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/local/bin/certbot
sudo certbot --nginx -d oresong.com -d www.oresong.com
sudo certbot renew --dry-run
```

## 7) Firewall (se usar UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## 8) Validacao final

```bash
curl -I http://oresong.com
curl -I https://oresong.com
curl -s https://oresong.com/api/health
```

Painel admin:

- `https://oresong.com/admin`
- login atual: `ores@gmail.com`
- senha atual: `1234`

Troque a senha apos primeiro login.
