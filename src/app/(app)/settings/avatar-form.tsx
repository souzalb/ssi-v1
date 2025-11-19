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
import {
  Camera,
  Upload,
  Loader2,
  Check,
  X,
  User as UserIcon,
  ImagePlus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/app/_lib/utils';

interface AvatarFormProps {
  user: Pick<User, 'name' | 'photoUrl'>;
}

export function AvatarForm({ user }: AvatarFormProps) {
  const router = useRouter();
  const { update } = useSession();

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Gera as iniciais para o Fallback
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Handler para seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validação de tipo
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida.');
        return;
      }

      // Validação de tamanho (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB.');
        return;
      }

      setFile(selectedFile);
      toast.success('Imagem selecionada!');
    }
  };

  // Handlers para Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];

      if (!droppedFile.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida.');
        return;
      }

      if (droppedFile.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB.');
        return;
      }

      setFile(droppedFile);
      toast.success('Imagem selecionada!');
    }
  };

  // Limpar seleção
  const handleClear = () => {
    setFile(null);
    toast.info('Seleção removida.');
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error('Selecione um arquivo primeiro.');
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          'X-Vercel-Blob-Filename': file.name,
        },
        body: file,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha no upload');

      await update({
        photoUrl: data.photoUrl,
      });

      router.refresh();
      toast.success('Avatar atualizado com sucesso!');
      setFile(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro ao atualizar avatar', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // URL do preview
  const previewUrl = file ? URL.createObjectURL(file) : user.photoUrl || '';

  return (
    <Card className="group relative overflow-hidden border-2 p-0 shadow-xl transition-all hover:shadow-2xl dark:bg-slate-900">
      {/* Gradient decorativo */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />

      <CardHeader className="border-b bg-linear-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-950/20 dark:to-purple-950/20 [.border-b]:pb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-linear-to-br from-blue-500 to-purple-600 p-2.5 shadow-lg">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold md:text-2xl">
              Foto de Perfil
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Personalize seu avatar para ser reconhecido facilmente
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* Avatar Grande com Overlay */}
            <div className="relative flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-2xl ring-4 ring-slate-100 md:h-32 md:w-32 dark:border-slate-800 dark:ring-slate-800">
                  <AvatarImage
                    src={previewUrl ?? undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Badge de status */}
                {file && (
                  <div className="absolute -right-2 -bottom-2 rounded-full bg-linear-to-r from-emerald-500 to-teal-600 p-2 shadow-lg">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Nome do usuário */}
              <p className="mt-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user.name}
              </p>
            </div>

            {/* Área de Upload */}
            <div className="flex-1">
              <div
                className={cn(
                  'relative overflow-hidden rounded-xl border-2 border-dashed transition-all',
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20'
                    : 'border-slate-300 bg-slate-50 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900/50',
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <label
                  htmlFor="avatar-upload"
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 p-8 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  <div className="rounded-full bg-linear-to-br from-blue-100 to-purple-100 p-4 dark:from-blue-900/30 dark:to-purple-900/30">
                    {file ? (
                      <ImagePlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Upload className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {file ? (
                        <span className="text-blue-600 dark:text-blue-400">
                          {file.name}
                        </span>
                      ) : (
                        <>
                          <span className="text-blue-600 dark:text-blue-400">
                            Clique para selecionar
                          </span>{' '}
                          ou arraste aqui
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      PNG, JPG ou WEBP até 5MB
                    </p>
                  </div>

                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Info sobre a imagem selecionada */}
              {file && (
                <div className="mt-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Imagem pronta para upload
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClear}
                      disabled={isLoading}
                      className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/30"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dicas e Recomendações */}
          <div className="hidden rounded-xl border-2 border-purple-200 bg-purple-50 p-4 md:block dark:border-purple-800 dark:bg-purple-950/20">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Dicas para uma boa foto de perfil
                </p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 md:text-sm dark:text-slate-400">
                  <li>• Use uma foto recente e nítida</li>
                  <li>• Prefira imagens com fundo neutro</li>
                  <li>• Centralize seu rosto na foto</li>
                  <li>• Evite fotos muito escuras ou claras</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button
              type="submit"
              disabled={isLoading || !file}
              className="w-full flex-1 gap-2 bg-linear-to-r from-blue-500 to-purple-600 font-bold shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Salvar Avatar</span>
                </>
              )}
            </Button>

            {file && !isLoading && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="gap-2 border-2"
                size="lg"
              >
                <Trash2 className="h-5 w-5" />
                <span>Cancelar</span>
              </Button>
            )}
          </div>

          {/* Avatar atual */}
          {user.photoUrl && !file && (
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Avatar Atual
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Faça upload de uma nova imagem para substituir
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
