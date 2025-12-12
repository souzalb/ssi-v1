🎫 Portal de Chamados Corporativo (SSI)

Uma solução completa e robusta para gestão de solicitações internas (Help Desk), desenhada para centralizar pedidos de TI, Manutenção Predial e Elétrica. O sistema oferece fluxos de trabalho automatizados, métricas de performance em tempo real e uma experiência de utilizador moderna.

✨ Funcionalidades Principais

🔐 Segurança e Acesso

Autenticação Robusta: Login seguro com NextAuth.js.

RBAC (Role-Based Access Control): 4 níveis de permissão distintos:

COMMON: Abre chamados, acompanha status e avalia o atendimento.

TECHNICIAN: Recebe atribuições, comenta e resolve chamados.

MANAGER: Gere a fila da sua área, atribui técnicos e visualiza relatórios.

SUPER_ADMIN: Gestão total do sistema, utilizadores e visão global.

📊 Dashboard de BI (Business Intelligence)

KPIs em Tempo Real: Acompanhamento de SLA, Tempo Médio de Resolução e Satisfação do Cliente.

Visualização de Dados: Gráficos interativos (Tendência, Status, Prioridade) usando Recharts.

Filtros Inteligentes: Dados segmentados automaticamente por área para Gestores.

🛠️ Gestão de Chamados (Data Grid Avançado)

Tabela Poderosa: Construída com @tanstack/react-table.

Filtros Complexos: Pesquisa por texto, data, status, prioridade e técnico.

Ações em Lote: Atualização de status, atribuição e exclusão de múltiplos itens simultaneamente.

Exportação: Relatórios em Excel (.xlsx), CSV e PDF profissional com cabeçalho personalizado.

📝 Experiência do Utilizador

Formulário Wizard: Criação de chamados passo-a-passo com validação progressiva (zod + react-hook-form).

Upload de Anexos: Integração com Vercel Blob para armazenamento seguro de arquivos e imagens.

Notificações: Emails transacionais automáticos (via Resend) para abertura, atribuição, comentários e resolução.

Layout Responsivo: Interface adaptada para mobile com menu de navegação estilo app nativa.

Dark Mode: Suporte nativo a temas Claro/Escuro.

🚀 Tecnologias Utilizadas

Framework: Next.js 14 (App Router)

Linguagem: TypeScript

Estilização: Tailwind CSS

Componentes: Shadcn/ui

Base de Dados: PostgreSQL

ORM: Prisma

Autenticação: NextAuth.js (Auth.js)

Emails: Resend & React Email

Uploads: Vercel Blob

Gráficos: Recharts

Exportação: jspdf, jspdf-autotable, exceljs

⚙️ Configuração e Instalação

Pré-requisitos

Node.js 18+

PostgreSQL (Local ou via Docker/Neon/Supabase)

Passo a Passo

Clone o repositório:

git clone [https://github.com/seu-usuario/seu-projeto.git](https://github.com/seu-usuario/seu-projeto.git)
cd seu-projeto


Instale as dependências:

npm install


Configure as Variáveis de Ambiente:
Crie um arquivo .env na raiz baseado no exemplo:

DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="http://localhost:3000"

# Uploads
BLOB_READ_WRITE_TOKEN="seu-token-vercel-blob"

# Emails
RESEND_API_KEY="re_123..."
EMAIL_FROM="onboarding@resend.dev"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"


Configure o Banco de Dados:

npx prisma db push


Popule o Banco (Seed):
Cria utilizadores e chamados de teste.

npx prisma db seed


Inicie o servidor de desenvolvimento:

npm run dev
