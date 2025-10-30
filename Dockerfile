# --- 1. Estágio de Dependências ---
# Usamos uma imagem base leve do Node.js (ATUALIZADO PARA 20)
FROM node:20-alpine AS deps
WORKDIR /app

# Copia apenas os ficheiros de gestão de pacotes
COPY package.json package-lock.json ./

# Instala as dependências (incluindo 'prisma' e 'tsx')
RUN npm install

# --- 2. Estágio de Build ---
# Começa de novo para manter a imagem limpa (ATUALIZADO PARA 20)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gera o cliente Prisma (necessário para o build)
# Precisamos da DATABASE_URL aqui, mesmo que seja 'dummy',
# para o 'prisma generate' não falhar.
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
RUN npx prisma generate

# Constrói a aplicação Next.js
RUN npm run build

# --- 3. Estágio de Produção ---
# A imagem final, otimizada para produção (ATUALIZADO PARA 20)
FROM node:20-alpine AS runner
WORKDIR /app

# Variável de ambiente para produção
ENV NODE_ENV production

# Copia os artefactos de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Expõe a porta que o Next.js usa
EXPOSE 3000

# O comando para iniciar a app
CMD ["npm", "start"]
