import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

import { Role, Status } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { CommentSection } from './comment-section';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';

import db from '@/app/_lib/prisma';
import { Badge } from '@/app/_components/ui/badge';
import { TicketActions } from './ticket-actions';
import { AttachmentList } from './attachment-list';
import { TicketRating } from './ticket-rating';
import {
  User,
  Calendar,
  MapPin,
  Wrench,
  Package,
  Hash,
  Building2,
  UserCog,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FileText,
  Mail,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/app/_components/ui/button';

// Função de busca e validação
async function getTicketData(ticketId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return redirect('/login');
  }

  const { id: userId, role, areaId } = session.user;

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      requester: { select: { name: true, email: true } },
      technician: { select: { name: true, email: true } },
      area: { select: { name: true } },
      comments: {
        include: {
          user: { select: { name: true, role: true, photoUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      attachments: {
        include: {
          uploader: { select: { name: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) {
    return redirect('/dashboard');
  }

  // RBAC
  const isSuperAdmin = role === Role.SUPER_ADMIN;
  const isRequester = ticket.requesterId === userId;
  const isTechnician = ticket.technicianId === userId;
  const isManager = role === Role.MANAGER && ticket.areaId === areaId;

  const canView = isSuperAdmin || isRequester || isTechnician || isManager;

  if (!canView) {
    return redirect('/dashboard');
  }

  return { ticket, session };
}

// Configuração de cores por status
const STATUS_CONFIG: Record<
  Status,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    gradient: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  OPEN: {
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    gradient: 'from-blue-500 to-cyan-500',
    icon: <AlertCircle className="h-4 w-4" />,
    label: 'Aberto',
  },
  ASSIGNED: {
    color: 'text-indigo-700 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    gradient: 'from-indigo-500 to-purple-500',
    icon: <UserCog className="h-4 w-4" />,
    label: 'Atribuído',
  },
  IN_PROGRESS: {
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    gradient: 'from-amber-500 to-orange-500',
    icon: <Clock className="h-4 w-4" />,
    label: 'Em Andamento',
  },
  ON_HOLD: {
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    gradient: 'from-orange-500 to-red-500',
    icon: <Clock className="h-4 w-4" />,
    label: 'Em Espera',
  },
  RESOLVED: {
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    gradient: 'from-emerald-500 to-teal-500',
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'Resolvido',
  },
  CLOSED: {
    color: 'text-slate-700 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-800',
    borderColor: 'border-slate-200 dark:border-slate-700',
    gradient: 'from-slate-500 to-slate-600',
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'Fechado',
  },
  CANCELLED: {
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    gradient: 'from-red-500 to-rose-500',
    icon: <AlertCircle className="h-4 w-4" />,
    label: 'Cancelado',
  },
};

// Mapeamento de prioridade
const PRIORITY_CONFIG: Record<
  string,
  {
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  LOW: {
    color: 'text-slate-700 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    label: 'Baixa',
  },
  MEDIUM: {
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950/30',
    label: 'Média',
  },
  HIGH: {
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-950/30',
    label: 'Alta',
  },
  URGENT: {
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950/30',
    label: 'Urgente',
  },
};

// O Server Component (A Página)
export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const data = await getTicketData(resolvedParams.id);

  if (!data || !data.ticket) {
    return null;
  }

  const { ticket, session } = data;

  const isRequester = session.user.id === ticket.requesterId;
  const isTicketClosed =
    ticket.status === Status.RESOLVED || ticket.status === Status.CLOSED;
  const showRatingBox = isRequester && isTicketClosed;

  const statusConfig = STATUS_CONFIG[ticket.status];
  const priorityConfig =
    PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        {/* Breadcrumb e Navegação */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 border-2 shadow-sm transition-all hover:shadow-md"
            >
              <Link href="/tickets">
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/tickets"
                className="font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Chamados
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {ticket.ticketId || `#${ticket.id.slice(-6)}`}
              </span>
            </div>
          </div>

          <TicketActions ticket={ticket} currentUser={session.user} />
        </div>

        {/* Hero Card - Informações Principais */}
        <Card className="group hover:shadow-3xl relative overflow-hidden border-2 shadow-2xl transition-all">
          {/* Gradient animado */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${statusConfig.gradient} opacity-5`}
          />
          <div
            className={`absolute top-0 right-0 left-0 h-2 bg-gradient-to-r ${statusConfig.gradient}`}
          />

          <CardHeader className="relative space-y-6 p-6 md:p-8">
            {/* Status e Prioridade */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                className={`${statusConfig.bgColor} ${statusConfig.color} border-2 ${statusConfig.borderColor} px-4 py-2 text-sm font-bold shadow-sm`}
              >
                <span className="flex items-center gap-2">
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </Badge>
              <Badge
                className={`${priorityConfig.bgColor} ${priorityConfig.color} border-2 px-4 py-2 text-sm font-bold shadow-sm`}
              >
                {priorityConfig.label}
              </Badge>
              <span className="ml-auto font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                {ticket.ticketId || `#${ticket.id.slice(-6)}`}
              </span>
            </div>

            {/* Título Principal */}
            <div className="space-y-4">
              <h1 className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-3xl leading-tight font-black text-transparent md:text-4xl lg:text-5xl dark:from-white dark:via-slate-100 dark:to-white">
                {ticket.title}
              </h1>

              {/* Metadados em Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetaItem
                  icon={<User className="h-5 w-5" />}
                  label="Solicitante"
                  value={ticket.requester.name}
                  gradient="from-blue-500 to-cyan-500"
                />
                <MetaItem
                  icon={<Building2 className="h-5 w-5" />}
                  label="Área"
                  value={ticket.area.name}
                  gradient="from-purple-500 to-indigo-500"
                />
                <MetaItem
                  icon={<Calendar className="h-5 w-5" />}
                  label="Aberto em"
                  value={format(
                    new Date(ticket.createdAt),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR },
                  )}
                  gradient="from-emerald-500 to-teal-500"
                />
                <MetaItem
                  icon={<UserCog className="h-5 w-5" />}
                  label="Técnico"
                  value={ticket.technician?.name || 'Não atribuído'}
                  gradient="from-amber-500 to-orange-500"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Coluna Principal - 8 colunas */}
          <div className="space-y-6 lg:col-span-8">
            {/* Descrição */}
            <Card className="group relative overflow-hidden border-2 shadow-xl transition-all hover:shadow-2xl">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Descrição do Problema
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-base leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {ticket.description}
                </p>
              </CardContent>
            </Card>

            {/* Avaliação */}
            {showRatingBox && (
              <div className="animate-in slide-in-from-bottom-4">
                <TicketRating
                  ticketId={ticket.id}
                  currentRating={ticket.satisfactionRating || null}
                />
              </div>
            )}

            {/* Comentários */}
            <div
              className="animate-in slide-in-from-bottom-4"
              style={{ animationDelay: '100ms' }}
            >
              <CommentSection
                ticketId={ticket.id}
                initialComments={ticket.comments}
                currentUserRole={session.user.role}
              />
            </div>
          </div>

          {/* Sidebar - 4 colunas */}
          <div className="space-y-6 lg:col-span-4">
            {/* Card de Detalhes Rápidos */}
            <Card className="group relative overflow-hidden border-2 shadow-xl transition-all hover:shadow-2xl">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 shadow-lg">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  Detalhes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <DetailRow
                  icon={<User className="h-4 w-4" />}
                  label="Solicitante"
                  value={ticket.requester.name}
                  iconColor="text-blue-600 dark:text-blue-400"
                  iconBg="bg-blue-100 dark:bg-blue-950/30"
                />
                <DetailRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={ticket.requester.email}
                  iconColor="text-slate-600 dark:text-slate-400"
                  iconBg="bg-slate-100 dark:bg-slate-800"
                />
                <DetailRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="Área"
                  value={ticket.area.name}
                  iconColor="text-purple-600 dark:text-purple-400"
                  iconBg="bg-purple-100 dark:bg-purple-950/30"
                />
                <DetailRow
                  icon={<UserCog className="h-4 w-4" />}
                  label="Técnico"
                  value={ticket.technician?.name || 'Não atribuído'}
                  iconColor="text-indigo-600 dark:text-indigo-400"
                  iconBg="bg-indigo-100 dark:bg-indigo-950/30"
                />
              </CardContent>
            </Card>

            {/* Anexos */}
            <div className="animate-in slide-in-from-right-4">
              <AttachmentList attachments={ticket.attachments} />
            </div>

            {/* Equipamento */}
            <Card className="group relative overflow-hidden border-2 shadow-xl transition-all hover:shadow-2xl">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 shadow-lg">
                    <Wrench className="h-5 w-5 text-white" />
                  </div>
                  Equipamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <DetailRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Localização"
                  value={ticket.location}
                  iconColor="text-red-600 dark:text-red-400"
                  iconBg="bg-red-100 dark:bg-red-950/30"
                />
                <DetailRow
                  icon={<Wrench className="h-4 w-4" />}
                  label="Equipamento"
                  value={ticket.equipment}
                  iconColor="text-amber-600 dark:text-amber-400"
                  iconBg="bg-amber-100 dark:bg-amber-950/30"
                />
                <DetailRow
                  icon={<Package className="h-4 w-4" />}
                  label="Modelo"
                  value={ticket.model}
                  iconColor="text-orange-600 dark:text-orange-400"
                  iconBg="bg-orange-100 dark:bg-orange-950/30"
                />
                <DetailRow
                  icon={<Hash className="h-4 w-4" />}
                  label="Patrimônio"
                  value={ticket.assetTag}
                  iconColor="text-slate-600 dark:text-slate-400"
                  iconBg="bg-slate-100 dark:bg-slate-800"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para metadados no Hero Card
function MetaItem({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity group-hover:opacity-5`}
      />
      <div className="relative space-y-2">
        <div
          className={`inline-flex rounded-lg bg-gradient-to-br ${gradient} p-2 shadow-md`}
        >
          <div className="text-white">{icon}</div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {label}
          </p>
          <p
            className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-slate-100"
            title={value}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente para linhas de detalhes
function DetailRow({
  icon,
  label,
  value,
  iconColor,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="group flex items-center justify-between gap-3 rounded-lg border-2 border-slate-200 bg-slate-50 p-3 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg ${iconBg} p-2 transition-transform group-hover:scale-110`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          {label}
        </span>
      </div>
      <span
        className="text-right text-sm font-bold text-slate-900 dark:text-slate-100"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
