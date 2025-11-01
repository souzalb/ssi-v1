'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { User } from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Input } from '@/app/_components/ui/input';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/_components/ui/avatar';

interface AvatarFormProps {
  user: Pick<User, 'name' | 'photoUrl'>;
}

export function AvatarForm({ user }: AvatarFormProps) {
  const router = useRouter();
  const { update } = useSession(); // Hook para atualizar a sessão

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Gera as iniciais para o Fallback
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Handler para quando o usuário seleciona um arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Handler de Submissão (POST /api/users/avatar)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error('Selecione um arquivo primeiro.');
      return;
    }
    setIsLoading(true);

    try {
      // 1. Envia o arquivo para a API
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          // Passa o nome do arquivo para o Vercel Blob
          'X-Vercel-Blob-Filename': file.name,
        },
        body: file, // Envia o arquivo diretamente no 'body'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha no upload');

      // 2. Atualiza a Sessão (O "Trigger")
      await update({
        photoUrl: data.photoUrl, // Atualiza a sessão com a nova URL
      });

      router.refresh(); // Recarrega o Server Component (Header)
      toast.success('Avatar atualizado!');
      setFile(null); // Limpa o input
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto de Perfil</CardTitle>
        <CardDescription>
          Faça o upload da sua foto de perfil (avatar).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            {/* Mostra o preview do novo arquivo OU a foto atual */}
            <AvatarImage
              src={file ? URL.createObjectURL(file) : user.photoUrl || ''}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <Input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? 'Enviando...' : 'Salvar Avatar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
