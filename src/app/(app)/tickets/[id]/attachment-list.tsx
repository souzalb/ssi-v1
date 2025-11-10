'use client';

import Link from 'next/link';
import { Attachment, User } from '@prisma/client';

import {
  Download,
  Paperclip,
  FileText,
  Image as FileImage,
  Video as FileVideo,
  Archive as FileArchive,
  File,
  Upload,
  Sparkles,
  Eye,
  Folder,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';

type AttachmentWithUploader = Attachment & {
  uploader: Pick<User, 'name'>;
};

interface AttachmentListProps {
  attachments: AttachmentWithUploader[];
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
    return {
      icon: FileImage,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950/30',
      gradient: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-200 dark:border-blue-800',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/20',
      label: 'Imagem',
    };
  }

  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
    return {
      icon: FileVideo,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-950/30',
      gradient: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-200 dark:border-purple-800',
      hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-950/20',
      label: 'Vídeo',
    };
  }

  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
    return {
      icon: FileText,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-950/30',
      gradient: 'from-red-500 to-rose-600',
      borderColor: 'border-red-200 dark:border-red-800',
      hoverBg: 'hover:bg-red-50 dark:hover:bg-red-950/20',
      label: 'Documento',
    };
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return {
      icon: FileArchive,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-950/30',
      gradient: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-200 dark:border-amber-800',
      hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-950/20',
      label: 'Arquivo',
    };
  }

  return {
    icon: File,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    gradient: 'from-slate-500 to-slate-600',
    borderColor: 'border-slate-200 dark:border-slate-800',
    hoverBg: 'hover:bg-slate-50 dark:hover:bg-slate-900',
    label: 'Arquivo',
  };
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  const totalSize = attachments.reduce((acc, att) => acc + (att.size || 0), 0);

  if (!attachments || attachments.length === 0) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-xl">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-2 shadow-lg">
                  <Paperclip className="h-4 w-4 text-white" />
                </div>
                Anexos
              </CardTitle>
              <CardDescription className="text-xs">
                Arquivos e documentos relacionados ao chamado
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white py-12 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
            <div className="mb-3 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-4 dark:from-slate-800 dark:to-slate-700">
              <Folder className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Nenhum anexo enviado
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Os arquivos anexados aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-2 shadow-lg">
                <Paperclip className="h-4 w-4 text-white" />
              </div>
              Anexos
            </CardTitle>
            <CardDescription className="text-xs">
              {attachments.length} arquivo{attachments.length !== 1 ? 's' : ''}{' '}
              • {formatBytes(totalSize)}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="gap-1.5 border-0 bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-white shadow-lg shadow-indigo-500/30">
              <Upload className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">
                {attachments.length}
              </span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          {attachments.map((att, index) => {
            const fileInfo = getFileIcon(att.filename);
            const Icon = fileInfo.icon;

            return (
              <div
                key={att.id}
                className={`group animate-in slide-in-from-left-4 relative overflow-hidden rounded-xl border-2 ${fileInfo.borderColor} bg-white p-4 transition-all hover:shadow-lg dark:bg-slate-900`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Indicador de hover animado */}
                <div
                  className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${fileInfo.gradient} transition-all duration-300 group-hover:w-full`}
                />

                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Ícone do arquivo */}
                  <div
                    className={`rounded-xl ${fileInfo.bgColor} p-3 shadow-md transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`h-6 w-6 ${fileInfo.color}`} />
                  </div>

                  {/* Info do arquivo */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p
                            className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100"
                            title={att.filename}
                          >
                            {att.filename}
                          </p>
                          <Badge
                            variant="secondary"
                            className={`${fileInfo.bgColor} ${fileInfo.color} h-5 shrink-0 border-0 px-2 text-[10px] font-semibold`}
                          >
                            {fileInfo.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          {att.size && (
                            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                              <Sparkles className="h-3 w-3" />
                              {formatBytes(att.size)}
                            </span>
                          )}
                          {att.uploader?.name && (
                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-500">
                              <span className="hidden sm:inline">
                                Enviado por
                              </span>
                              <span className="font-medium">
                                {att.uploader.name}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className={`h-9 w-9 p-0 transition-colors ${fileInfo.hoverBg}`}
                          title="Visualizar"
                        >
                          <Link
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className={`h-4 w-4 ${fileInfo.color}`} />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                          title="Baixar"
                        >
                          <Link href={att.url} download>
                            <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Card de resumo */}
        <div className="mt-4 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:border-indigo-800 dark:from-indigo-950/30 dark:to-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Resumo dos Anexos
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {attachments.length} arquivo
                {attachments.length !== 1 ? 's' : ''} totalizando{' '}
                {formatBytes(totalSize)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
