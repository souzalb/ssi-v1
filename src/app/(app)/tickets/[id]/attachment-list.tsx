'use client';

import Link from 'next/link';
import { Attachment, User } from '@prisma/client';

import { FileIcon, EyeIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';

// Tipo do anexo que o Server Component vai passar
type AttachmentWithUploader = Attachment & {
  uploader: Pick<User, 'name'>;
};

interface AttachmentListProps {
  attachments: AttachmentWithUploader[];
}

// Função auxiliar para formatar o tamanho do arquivo
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  if (!attachments || attachments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anexos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Nenhum anexo enviado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anexos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="flex items-center justify-between rounded-md border p-2"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <FileIcon className="text-muted-foreground h-5 w-5 shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span
                  className="truncate text-sm font-medium"
                  title={att.filename}
                >
                  {att.filename}
                </span>
                <span className="text-muted-foreground text-xs">
                  {att.size ? formatBytes(att.size) : ''}
                </span>
              </div>
            </div>

            {/* O link aponta para a URL pública do Vercel Blob e 'download=true'
                força o download em vez de abrir no browser */}
            <Link
              href={att.url}
              target="_blank"
              download
              className="text-muted-foreground hover:text-primary p-2"
              title="Visualizar"
            >
              <EyeIcon className="h-5 w-5" />
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
