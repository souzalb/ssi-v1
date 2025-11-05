'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Priority } from '@prisma/client';

// --- Componentes ---
import { Button } from '@/app/_components/ui/button'; // (Ajuste o caminho se necessário)
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/form';
import { Input } from '@/app/_components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select';
import { Textarea } from '@/app/_components/ui/textarea';
import { Progress } from '@/app/_components/ui/progress';
import { Loader2, File as FileIcon, Trash2, Lightbulb } from 'lucide-react';
import { FormStepper } from '../form-stepper';
import { cn } from '@/app/_lib/utils';

// --- Tipos e Schemas ---
type Area = {
  id: string;
  name: string;
};
type AttachmentData = {
  url: string;
  filename: string;
  fileType?: string;
  size?: number;
};

// 1. O Schema (plano, para o react-hook-form)
const formSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Máximo de 500 caracteres'),
  location: z.string().min(3, 'Localização é obrigatória'),
  equipment: z.string().min(3, 'Equipamento é obrigatório'),
  model: z.string().min(3, 'Modelo é obrigatório'),
  assetTag: z.string().min(3, 'Patrimônio (ou N/P) é obrigatório'),
  priority: z.nativeEnum(Priority),
  areaId: z.string({ error: 'Selecione uma área' }),
});

// Mapeamento dos campos obrigatórios para o progresso
const requiredFields: (keyof z.infer<typeof formSchema>)[] = [
  'areaId',
  'title',
  'description',
  'priority',
  'location',
  'equipment',
  'assetTag',
];

// Mapeamento dos campos por etapa (para validação)
const stepFields: FieldPath<z.infer<typeof formSchema>>[][] = [
  ['areaId'], // Etapa 1
  ['title', 'description', 'priority'], // Etapa 2
  ['location'], // Etapa 3
  ['equipment', 'model', 'assetTag'], // Etapa 4
  [], // Etapa 5 (Anexos, opcionais)
];

const TOTAL_STEPS = 5;

export default function NewTicketPage() {
  const router = useRouter();
  // --- Estados Principais ---
  const [currentStep, setCurrentStep] = useState(1); // (1 a 5)
  const [areas, setAreas] = useState<Area[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Setup do Formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched', // Validar ao sair do campo
    defaultValues: {
      title: '',
      description: '',
      location: '',
      equipment: '',
      model: '',
      assetTag: '',
      priority: Priority.MEDIUM,
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

  // 4. Funções de Upload de Ficheiro
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Adiciona os novos arquivos aos já existentes
      setFilesToUpload((prevFiles) => [...prevFiles, ...newFiles]);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };
  const removeFile = (indexToRemove: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== indexToRemove));
  };
  // Função de upload que chama a nossa API (usada no onSubmit)
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

  // --- 5. LÓGICA DE NAVEGAÇÃO E PROGRESSO ---

  // Calcula o progresso (ex: "4/7 campos")
  const allWatchedValues = form.watch();
  const filledFields = requiredFields.filter(
    (field) => !!allWatchedValues[field],
  ).length;

  const progressPercent = (filledFields / requiredFields.length) * 100;

  // Observa a descrição para o contador de caracteres
  const descriptionValue = form.watch('description') || '';

  // Navegação: Próxima Etapa
  const handleNextStep = async () => {
    const fieldsToValidate = stepFields[currentStep - 1];
    // Valida apenas os campos da etapa atual
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
    }
  };

  // Navegação: Etapa Anterior
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 6. Handler de Submissão (O mesmo de antes, chamado apenas na última etapa)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    let uploadedAttachments: AttachmentData[] = [];
    try {
      // --- ETAPA 1: Upload dos Anexos ---
      if (filesToUpload.length > 0) {
        toast.info('Enviando anexos...', { id: 'upload-toast' });
        const uploadPromises = filesToUpload.map((file) => uploadFile(file));
        uploadedAttachments = await Promise.all(uploadPromises);
        toast.success('Anexos enviados!', { id: 'upload-toast' });
      }
      // --- ETAPA 2: Submissão do Chamado ---
      toast.info('Criando chamado...', { id: 'ticket-toast' });
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          attachments: uploadedAttachments,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Falha ao criar o chamado');
      // --- ETAPA 3: Sucesso ---
      toast.success('Chamado criado!', { id: 'ticket-toast' });
      router.push('/dashboard');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
      setIsLoading(false);
    }
  }

  // --- 7. O JSX (ATUALIZADO) ---
  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4 md:p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          {/* --- Rastreador de Progresso (Topo) --- */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                Novo Ticket de Suporte
              </CardTitle>
              <span className="text-muted-foreground text-sm font-medium">
                {filledFields}/{requiredFields.length} campos preenchidos
              </span>
            </div>
            <Progress value={progressPercent} className="w-full" />
            <div className="py-4">
              <FormStepper currentStep={currentStep} />
            </div>
            <div className="bg-muted/50 flex items-start gap-3 rounded-lg border p-3">
              <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-yellow-500" />
              <p className="text-muted-foreground text-sm">
                <strong>Dica:</strong> Preencha todos os campos obrigatórios (*)
                para criar o seu ticket. Quanto mais detalhes fornecer, mais
                rápido a nossa equipa poderá resolver o seu problema.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            {/* Usamos 'onSubmit' no <form>, mas o botão 'submit'
              só aparece na última etapa 
            */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* --- ETAPA 1: ÁREA --- */}
              <div className={cn(currentStep === 1 ? 'block' : 'hidden')}>
                <h3 className="mb-4 text-xl font-semibold">Área do Ticket</h3>
                <FormField
                  control={form.control}
                  name="areaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selecione a Área *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha o departamento responsável" />
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
                      <FormDescription>
                        Selecione a área que melhor se adequa ao seu problema.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- ETAPA 2: INFORMAÇÕES BÁSICAS --- */}
              <div
                className={cn(
                  currentStep === 2 ? 'block' : 'hidden',
                  'space-y-6',
                )}
              >
                <h3 className="mb-4 text-xl font-semibold">
                  Informações Básicas
                </h3>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Ticket *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Ar condicionado da sala 301 não gela"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Descreva brevemente o problema.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Detalhada *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o problema em detalhes..."
                          className="min-h-[120px]"
                          maxLength={500} // Limite de caracteres
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>
                          Inclua quando ocorreu e quais ações já foram tentadas.
                        </span>
                        <span>{descriptionValue.length} / 500</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade *</FormLabel>
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
                      <FormDescription>
                        Avalie a urgência baseada no impacto no trabalho.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- ETAPA 3: LOCALIZAÇÃO --- */}
              <div
                className={cn(
                  currentStep === 3 ? 'block' : 'hidden',
                  'space-y-6',
                )}
              >
                <h3 className="mb-4 text-xl font-semibold">Localização</h3>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização/Sala *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sala 301, Bloco B" {...field} />
                      </FormControl>
                      <FormDescription>
                        Onde o problema está a ocorrer?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- ETAPA 4: EQUIPAMENTO --- */}
              <div
                className={cn(
                  currentStep === 4 ? 'block' : 'hidden',
                  'space-y-6',
                )}
              >
                <h3 className="mb-4 text-xl font-semibold">
                  Detalhes do Equipamento
                </h3>
                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipamento *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Ar Condicionado, Impressora"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Qual é o equipamento com defeito?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Samsung Wind-Free, HP LaserJet Pro"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Modelo ou marca do equipamento.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assetTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº de Patrimônio (ou N/P) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 123456" {...field} />
                      </FormControl>
                      <FormDescription>
                        A etiqueta de identificação do ativo (se houver).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- ETAPA 5: ANEXOS --- */}
              <div
                className={cn(
                  currentStep === 5 ? 'block' : 'hidden',
                  'space-y-6',
                )}
              >
                <h3 className="mb-4 text-xl font-semibold">Anexos</h3>
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Anexar Ficheiros</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Screenshots, fotos do erro ou documentos (opcional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                  {filesToUpload.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Ficheiros selecionados:
                      </p>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {filesToUpload.map((file, index) => (
                          <div
                            key={index}
                            className="bg-muted/50 flex items-center justify-between rounded-md border p-2"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileIcon className="text-muted-foreground h-4 w-4 shrink-0" />
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
              </div>

              {/* --- 8. BOTÕES DE NAVEGAÇÃO --- */}
              <div className="flex justify-between pt-4">
                {/* Botão Voltar */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  // Esconde na primeira etapa
                  className={cn(currentStep === 1 && 'invisible')}
                  disabled={isLoading}
                >
                  Voltar
                </Button>

                {/* Botão Próximo Passo */}
                <Button
                  type="button"
                  variant="default"
                  onClick={handleNextStep}
                  // Esconde na ÚLTIMA etapa
                  className={cn(currentStep === TOTAL_STEPS && 'hidden')}
                  disabled={isLoading}
                >
                  Próximo Passo
                </Button>

                {/* Botão Submeter (Final) */}
                <Button
                  type="submit" // <-- O único botão type="submit"
                  variant="default"
                  // Mostra APENAS na última etapa
                  className={cn(currentStep !== TOTAL_STEPS && 'hidden')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Abrir Chamado'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
