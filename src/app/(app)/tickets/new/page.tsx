'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Priority } from '@prisma/client';

// --- Ícones ---
import { Loader2, File as FileIcon, Trash2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/form';
import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/app/_components/ui/card';
import { Input } from '@/app/_components/ui/input';
import { Textarea } from '@/app/_components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select';

// --- Tipos ---
type Area = {
  id: string;
  name: string;
};

// Tipo da resposta da nossa API de upload
type AttachmentData = {
  url: string;
  filename: string;
  fileType?: string;
  size?: number;
};

// 1. Schema de Validação (Zod)
// (Não incluímos 'attachments' aqui, pois são tratados fora do react-hook-form)
const formSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  location: z.string().min(3, 'Localização é obrigatória'),
  equipment: z.string().min(3, 'Equipamento é obrigatório'),
  model: z.string().min(3, 'Modelo é obrigatório'),
  assetTag: z.string().min(3, 'Patrimônio (ou N/P) é obrigatório'),
  priority: z.nativeEnum(Priority),
  areaId: z.string({ error: 'Selecione uma área' }),
});

export default function NewTicketPage() {
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);

  // --- Estados para Upload ---
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Setup do Formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      equipment: '',
      model: '',
      assetTag: '',
      priority: Priority.MEDIUM, // Padrão
    },
  });

  // 3. Buscar Áreas (para o Select)
  useEffect(() => {
    async function fetchAreas() {
      try {
        const response = await fetch('/api/areas');
        if (!response.ok) throw new Error('Falha ao buscar áreas');
        const data = await response.json();
        setAreas(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error('Erro ao carregar dados', { description: error.message });
      }
    }
    fetchAreas();
  }, []);

  // 4. Função para lidar com a seleção de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Adiciona os novos arquivos aos já existentes
      setFilesToUpload((prevFiles) => [...prevFiles, ...newFiles]);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  // 5. Função para remover um arquivo da lista
  const removeFile = (indexToRemove: number) => {
    setFilesToUpload((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  // 6. Função de Upload (chamada pelo onSubmit)
  // Faz o upload de um único arquivo para a nossa API
  const uploadFile = async (file: File): Promise<AttachmentData> => {
    const response = await fetch('/api/attachments/upload', {
      method: 'POST',
      headers: {
        'X-Vercel-Blob-Filename': file.name,
      },
      body: file,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Falha no upload do ${file.name}`);
    }
    return response.json();
  };

  // 7. Handler de Submissão (Orquestrador)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    let uploadedAttachments: AttachmentData[] = [];

    try {
      // --- ETAPA 1: Fazer o upload dos arquivos ---
      if (filesToUpload.length > 0) {
        toast.info('Enviando anexos...', { id: 'upload-toast' });

        // Cria um array de 'promessas' de upload
        const uploadPromises = filesToUpload.map((file) => uploadFile(file));

        // Espera todas as promessas terminarem
        uploadedAttachments = await Promise.all(uploadPromises);

        toast.success('Anexos enviados!', { id: 'upload-toast' });
      }

      // --- ETAPA 2: Submeter o formulário do chamado ---
      toast.info('Criando chamado...', { id: 'ticket-toast' });
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values, // Dados do formulário (título, desc, etc.)
          attachments: uploadedAttachments, // Array com os dados dos anexos
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao criar o chamado');
      }

      // --- ETAPA 3: Sucesso ---
      toast.success('Chamado criado!', {
        id: 'ticket-toast',
        description: `O chamado "${data.title}" foi aberto.`,
      });
      router.push('/dashboard');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro', {
        description: error.message,
      });
    } finally {
      // Só definimos como 'false' em caso de erro.
      // Em caso de sucesso, o redirecionamento já cuida disso.
      if (!router.push) {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Abrir Novo Chamado
          </CardTitle>
          <CardDescription>
            Descreva o problema em detalhes para que a equipe possa atendê-lo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* --- Linha 1: Título --- */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Ar condicionado da sala 301 não gela"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Linha 2: Área e Prioridade (Grid) --- */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="areaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área Responsável</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a área para o chamado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Priority.LOW}>Baixa</SelectItem>
                          <SelectItem value={Priority.MEDIUM}>Média</SelectItem>
                          <SelectItem value={Priority.HIGH}>Alta</SelectItem>
                          <SelectItem value={Priority.URGENT}>
                            Urgente
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Linha 3: Detalhes do Equipamento (Grid) --- */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sala 301, Bloco B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ar Condicionado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Samsung Wind-Free" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assetTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº de Patrimônio (ou N/P)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Linha 4: Descrição --- */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Detalhada do Problema</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o que está acontecendo..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- 8. Seção de Anexos --- */}
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Anexos</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple // Permite selecionar vários arquivos
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                {/* Lista de arquivos selecionados */}
                {filesToUpload.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Arquivos a serem enviados:
                    </p>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {filesToUpload.map((file, index) => (
                        <div
                          key={index}
                          className="bg-muted/50 flex items-center justify-between rounded-md border p-2"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileIcon className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                            <span
                              className="truncate text-sm"
                              title={file.name}
                            >
                              {file.name}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFile(index)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* --- 9. Botões --- */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/dashboard')}
                  disabled={isLoading} // Desativa se estiver enviando
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? 'Enviando...' : 'Abrir Chamado'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
