'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AreaName, Priority } from '@prisma/client';

import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Badge } from '@/app/_components/ui/badge';
import {
  Loader2,
  File as FileIcon,
  Trash2,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Building2,
  FileText,
  MapPin,
  Wrench,
  Paperclip,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { FormStepper } from '../form-stepper';
import { cn } from '@/app/_lib/utils';

type Area = {
  id: string;
  name: AreaName;
};
type AttachmentData = {
  url: string;
  filename: string;
  fileType?: string;
  size?: number;
};

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

const requiredFields: (keyof z.infer<typeof formSchema>)[] = [
  'areaId',
  'title',
  'description',
  'priority',
  'location',
  'equipment',
  'assetTag',
];

const stepFields: FieldPath<z.infer<typeof formSchema>>[][] = [
  ['areaId'],
  ['title', 'description', 'priority'],
  ['location'],
  ['equipment', 'model', 'assetTag'],
  [],
];

const TOTAL_STEPS = 5;

const PRIORITY_CONFIG = {
  [Priority.LOW]: {
    label: 'Baixa',
    color: 'text-slate-700 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-500',
  },
  [Priority.MEDIUM]: {
    label: 'Média',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-500',
  },
  [Priority.HIGH]: {
    label: 'Alta',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-500',
  },
  [Priority.URGENT]: {
    label: 'Urgente',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-500',
  },
};

const areaLabels: Record<AreaName, string> = {
  TI: 'TI',
  BUILDING: 'Predial',
  ELECTRICAL: 'Elétrica',
};

const STEP_ICONS = [Building2, FileText, MapPin, Wrench, Paperclip];
const STEP_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-purple-600',
];

export default function NewTicketPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [areas, setAreas] = useState<Area[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
      location: '',
      equipment: '',
      model: '',
      assetTag: '',
      priority: Priority.LOW,
    },
  });

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

  // Observer para detectar quando o header sai da tela
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        // Mostra a barra quando rolar mais de 200px
        setShowFloatingBar(window.scrollY > 200);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Checa na montagem

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFilesToUpload((prevFiles) => [...prevFiles, ...newFiles]);
      e.target.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

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

  const allWatchedValues = form.watch();
  const filledFields = requiredFields.filter(
    (field) => !!allWatchedValues[field],
  ).length;

  const progressPercent = (filledFields / requiredFields.length) * 100;
  const descriptionValue = form.watch('description') || '';

  const handleNextStep = async () => {
    const fieldsToValidate = stepFields[currentStep - 1];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    let uploadedAttachments: AttachmentData[] = [];
    try {
      if (filesToUpload.length > 0) {
        toast.info('Enviando anexos...', { id: 'upload-toast' });
        const uploadPromises = filesToUpload.map((file) => uploadFile(file));
        uploadedAttachments = await Promise.all(uploadPromises);
        toast.success('Anexos enviados!', { id: 'upload-toast' });
      }

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

      toast.success('Chamado criado com sucesso!', { id: 'ticket-toast' });
      router.push('/dashboard');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
      setIsLoading(false);
    }
  }

  const StepIcon = STEP_ICONS[currentStep - 1];
  const stepGradient = STEP_GRADIENTS[currentStep - 1];

  return (
    <div className="min-h-screen p-4 py-8 md:p-8 dark:bg-slate-950">
      {/* Barra de Progresso Flutuante (Liquid Glass) */}
      <div
        className={cn(
          'fixed top-18 left-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 transition-all duration-500 md:w-fit',
          showFloatingBar
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-20 opacity-0',
        )}
      >
        <div className="rounded-3xl border border-white/30 bg-white/80 p-3 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 md:p-4 dark:border-white/10 dark:bg-slate-900/80">
          {/* Layout Desktop */}
          <div className="hidden items-center gap-6 md:flex">
            {/* Steps com ícones */}
            <div className="flex items-center gap-2">
              {STEP_ICONS.map((Icon, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;
                const gradient = STEP_GRADIENTS[index];

                return (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={cn(
                        'relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300',
                        isActive &&
                          `bg-linear-to-br ${gradient} scale-110 shadow-lg shadow-black/10 backdrop-blur-xl`,
                        isCompleted &&
                          'bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 backdrop-blur-xl',
                        !isActive &&
                          !isCompleted &&
                          'bg-linear-to-br from-slate-100/80 to-slate-200/80 backdrop-blur-xl dark:from-slate-800/80 dark:to-slate-700/80',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 transition-colors',
                          isActive || isCompleted
                            ? 'text-white drop-shadow-sm'
                            : 'text-slate-400 dark:text-slate-500',
                        )}
                      />
                      {isActive && (
                        <div
                          className={cn(
                            'absolute -inset-1 rounded-2xl bg-linear-to-br opacity-20 blur-md',
                            gradient,
                          )}
                        />
                      )}
                    </div>
                    {stepNumber < TOTAL_STEPS && (
                      <div
                        className={cn(
                          'mx-1.5 h-1 w-8 rounded-full backdrop-blur-sm transition-all duration-300',
                          stepNumber < currentStep
                            ? 'bg-linear-to-r from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/30'
                            : 'bg-linear-to-r from-slate-300/80 to-slate-400/80 dark:from-slate-700/80 dark:to-slate-600/80',
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Barra de progresso e percentual */}
            <div className="flex items-center gap-4">
              <div className="relative w-32 overflow-hidden rounded-full bg-slate-200/60 backdrop-blur-xl dark:bg-slate-700/60">
                <div
                  className="h-2.5 rounded-full bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-sm shadow-emerald-500/30 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <Badge className="gap-1.5 rounded-xl border-0 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 px-3 py-1.5 text-white shadow-lg shadow-emerald-500/30 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 drop-shadow-sm" />
                <span className="text-sm font-bold drop-shadow-sm">
                  {Math.round(progressPercent)}%
                </span>
              </Badge>
            </div>
          </div>

          {/* Layout Mobile - Compacto */}
          <div className="flex items-center justify-between gap-3 md:hidden">
            {/* Ícone da Etapa Atual + Número */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br shadow-lg backdrop-blur-xl',
                  STEP_GRADIENTS[currentStep - 1],
                )}
              >
                {(() => {
                  const CurrentIcon = STEP_ICONS[currentStep - 1];
                  return (
                    <CurrentIcon className="h-5 w-5 text-white drop-shadow-sm" />
                  );
                })()}
                <div
                  className={cn(
                    'absolute -inset-1 rounded-xl bg-linear-to-br opacity-20 blur-md',
                    STEP_GRADIENTS[currentStep - 1],
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Etapa {currentStep} de {TOTAL_STEPS}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {
                    ['Área', 'Detalhes', 'Local', 'Equipamento', 'Anexos'][
                      currentStep - 1
                    ]
                  }
                </span>
              </div>
            </div>

            {/* Progresso Compacto */}
            <div className="flex items-center gap-2">
              <div className="relative h-2 w-20 overflow-hidden rounded-full bg-slate-200/60 backdrop-blur-xl dark:bg-slate-700/60">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-sm shadow-emerald-500/30 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <Badge className="gap-1 rounded-lg border-0 bg-linear-to-r from-emerald-500 to-teal-600 px-2 py-1 text-white shadow-lg shadow-emerald-500/30 backdrop-blur-xl">
                <span className="text-xs font-bold drop-shadow-sm">
                  {Math.round(progressPercent)}%
                </span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header com Progresso */}
        <Card
          ref={headerRef}
          className="relative overflow-hidden border-0 shadow-2xl dark:bg-slate-900"
        >
          <div
            className={`absolute top-0 right-0 left-0 h-2 bg-linear-to-r ${stepGradient}`}
          />

          <CardHeader className="space-y-6 p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold md:text-3xl">
                  <div
                    className={`rounded-2xl bg-linear-to-br ${stepGradient} p-3 shadow-lg shadow-black/10 backdrop-blur-xl`}
                  >
                    <StepIcon className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                  Novo Ticket de Suporte
                </CardTitle>
                <CardDescription>
                  Preencha os detalhes para abrir um novo chamado
                </CardDescription>
              </div>

              <Badge className="w-fit gap-2 rounded-xl border-0 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-white shadow-lg shadow-emerald-500/30 backdrop-blur-xl">
                <Sparkles className="h-4 w-4 drop-shadow-sm" />
                <span className="font-bold drop-shadow-sm">
                  {filledFields}/{requiredFields.length} completo
                </span>
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Progresso Geral
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="relative overflow-hidden rounded-full bg-slate-200/60 backdrop-blur-xl dark:bg-slate-700/60">
                <div
                  className="h-3 rounded-full bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-sm shadow-emerald-500/30 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <FormStepper currentStep={currentStep} />

            <div className="flex items-start gap-3 rounded-2xl border-2 border-blue-200/60 bg-linear-to-br from-blue-50/80 to-indigo-50/80 p-4 backdrop-blur-xl dark:border-blue-800/60 dark:from-blue-950/40 dark:to-indigo-950/40">
              <div className="rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 p-2.5 shadow-lg shadow-blue-500/20 backdrop-blur-xl">
                <Lightbulb className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Dica importante
                </p>
                <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
                  Preencha todos os campos obrigatórios (*) para criar o seu
                  ticket. Quanto mais detalhes fornecer, mais rápido a equipe
                  poderá resolver o problema.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Formulário Principal */}
        <Card className="relative overflow-hidden border-0 shadow-xl dark:bg-slate-900">
          <div
            className={`absolute top-0 right-0 left-0 h-1 bg-linear-to-r ${stepGradient}`}
          />

          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
                autoComplete="off"
              >
                {/* ETAPA 1: ÁREA */}
                <div
                  className={cn(
                    'animate-in slide-in-from-right-4 space-y-6',
                    currentStep === 1 ? 'block' : 'hidden',
                  )}
                >
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                      <div className="rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 p-2 shadow-lg shadow-blue-500/20 backdrop-blur-xl">
                        <Building2 className="h-5 w-5 text-white drop-shadow-sm" />
                      </div>
                      Selecione a Área
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Escolha o departamento responsável pelo atendimento
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="areaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Área Responsável *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 cursor-pointer truncate border-2 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                              <SelectValue placeholder="Escolha o departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {areas.map((area) => (
                              <SelectItem
                                key={area.id}
                                value={area.id}
                                className="cursor-pointer text-base"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                                  {areaLabels[area.name] || area.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Selecione a área que melhor se adequa ao seu problema
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ETAPA 2: INFORMAÇÕES BÁSICAS */}
                <div
                  className={cn(
                    'animate-in slide-in-from-right-4 space-y-6',
                    currentStep === 2 ? 'block' : 'hidden',
                  )}
                >
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                      <div className="rounded-xl bg-linear-to-br from-purple-500 to-pink-600 p-2 shadow-lg shadow-purple-500/20 backdrop-blur-xl">
                        <FileText className="h-5 w-5 text-white drop-shadow-sm" />
                      </div>
                      Informações Básicas
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Descreva o problema de forma clara e objetiva
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Título do Ticket *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Ar condicionado da sala 301 não gela"
                            className="h-12 border-2 text-base transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Descreva brevemente o problema
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
                        <FormLabel className="text-base font-semibold">
                          Descrição Detalhada *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o problema em detalhes..."
                            className="min-h-[150px] resize-none border-2 text-base transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            maxLength={500}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="flex items-center justify-end">
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-mono text-xs',
                              descriptionValue.length > 450 &&
                                'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
                            )}
                          >
                            {descriptionValue.length} / 500
                          </Badge>
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
                        <FormLabel className="text-base font-semibold">
                          Prioridade *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 cursor-pointer border-2 text-base transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                              <SelectValue placeholder="Selecione a prioridade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PRIORITY_CONFIG).map(
                              ([key, config]) => (
                                <SelectItem
                                  key={key}
                                  value={key}
                                  className="cursor-pointer text-base"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        'h-2 w-2 rounded-full',
                                        config.bgColor,
                                      )}
                                    />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Avalie a urgência baseada no impacto no trabalho
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ETAPA 3: LOCALIZAÇÃO */}
                <div
                  className={cn(
                    'animate-in slide-in-from-right-4 space-y-6',
                    currentStep === 3 ? 'block' : 'hidden',
                  )}
                >
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                      <div className="rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 p-2 shadow-lg shadow-emerald-500/20 backdrop-blur-xl">
                        <MapPin className="h-5 w-5 text-white drop-shadow-sm" />
                      </div>
                      Localização
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Informe onde o problema está ocorrendo
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Localização/Sala *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Sala 301, Bloco B"
                            className="h-12 border-2 text-base transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Especifique o local exato do problema
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ETAPA 4: EQUIPAMENTO */}
                <div
                  className={cn(
                    'animate-in slide-in-from-right-4 space-y-6',
                    currentStep === 4 ? 'block' : 'hidden',
                  )}
                >
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                      <div className="rounded-xl bg-linear-to-br from-amber-500 to-orange-600 p-2 shadow-lg shadow-amber-500/20 backdrop-blur-xl">
                        <Wrench className="h-5 w-5 text-white drop-shadow-sm" />
                      </div>
                      Detalhes do Equipamento
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Informações sobre o equipamento com problema
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="equipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Equipamento *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Ar Condicionado, Impressora"
                            className="h-12 border-2 text-base transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Tipo do equipamento com defeito
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
                        <FormLabel className="text-base font-semibold">
                          Modelo *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Samsung Wind-Free, HP LaserJet Pro"
                            className="h-12 border-2 text-base transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Modelo ou marca do equipamento
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
                        <FormLabel className="text-base font-semibold">
                          Nº de Patrimônio (ou N/P) *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: 123456 ou N/P"
                            className="h-12 border-2 text-base transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Etiqueta de identificação do ativo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ETAPA 5: ANEXOS */}
                <div
                  className={cn(
                    'animate-in slide-in-from-right-4 space-y-6',
                    currentStep === 5 ? 'block' : 'hidden',
                  )}
                >
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                      <div className="rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 p-2 shadow-lg shadow-indigo-500/20 backdrop-blur-xl">
                        <Paperclip className="h-5 w-5 text-white drop-shadow-sm" />
                      </div>
                      Anexos
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Adicione imagens ou documentos (opcional)
                    </p>
                  </div>

                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Anexar Arquivos
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        disabled={isLoading}
                        className="h-12 cursor-pointer border-2 text-base transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950/30 dark:file:text-indigo-400"
                      />
                    </FormControl>
                    <FormDescription>
                      Screenshots, fotos ou documentos relevantes
                    </FormDescription>
                  </FormItem>

                  {filesToUpload.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Arquivos Selecionados
                        </p>
                        <Badge
                          variant="outline"
                          className="gap-1 bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
                        >
                          <Sparkles className="h-3 w-3" />
                          {filesToUpload.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {filesToUpload.map((file, index) => (
                          <div
                            key={index}
                            className="group flex items-center justify-between gap-2 rounded-lg border-2 border-slate-200 bg-slate-50 p-3 transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-700"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-950/30">
                                <FileIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <span
                                className="truncate text-sm font-medium"
                                title={file.name}
                              >
                                {file.name}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 hover:bg-red-100 dark:hover:bg-red-950/30"
                              onClick={() => removeFile(index)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filesToUpload.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900/50">
                      <Paperclip className="mb-3 h-12 w-12 text-slate-400 dark:text-slate-600" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Nenhum arquivo selecionado
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                        Anexos são opcionais
                      </p>
                    </div>
                  )}
                </div>

                {/* BOTÕES DE NAVEGAÇÃO */}
                <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className={cn(
                      'h-12 gap-2 border-2 text-base font-semibold',
                      currentStep === 1 && 'invisible',
                    )}
                    disabled={isLoading}
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Voltar
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    onClick={handleNextStep}
                    className={cn(
                      'h-12 gap-2 text-base font-semibold shadow-lg',
                      `bg-linear-to-r ${stepGradient} hover:opacity-90`,
                      currentStep === TOTAL_STEPS && 'hidden',
                    )}
                    disabled={isLoading}
                  >
                    Próximo Passo
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  <Button
                    type="submit"
                    variant="default"
                    className={cn(
                      'h-12 gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-base font-semibold shadow-lg shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700',
                      currentStep !== TOTAL_STEPS && 'hidden',
                    )}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Criando Chamado...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Abrir Chamado
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Card de Resumo - Apenas na última etapa */}
        {currentStep === TOTAL_STEPS && (
          <Card className="animate-in slide-in-from-bottom-4 border-0 shadow-xl dark:bg-slate-900">
            <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-emerald-500 to-teal-500" />

            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Resumo do Chamado
              </CardTitle>
              <CardDescription>
                Revise as informações antes de enviar
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="mb-2 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                    Título
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {allWatchedValues.title || '-'}
                  </p>
                </div>
                <SummaryItem
                  label="Área"
                  value={(() => {
                    const selected = areas.find(
                      (a) => a.id === allWatchedValues.areaId,
                    );
                    return selected
                      ? (areaLabels[selected.name] ?? selected.name)
                      : '-';
                  })()}
                  icon={<Building2 className="h-4 w-4" />}
                />
                <SummaryItem
                  label="Prioridade"
                  value={
                    PRIORITY_CONFIG[allWatchedValues.priority]?.label || '-'
                  }
                  icon={<AlertCircle className="h-4 w-4" />}
                />
                <SummaryItem
                  label="Localização"
                  value={allWatchedValues.location || '-'}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <SummaryItem
                  label="Equipamento"
                  value={allWatchedValues.equipment || '-'}
                  icon={<Wrench className="h-4 w-4" />}
                />

                {filesToUpload.length > 0 && (
                  <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
                    <div className="flex items-center gap-2 p-1">
                      <Paperclip className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                        {filesToUpload.length} arquivo
                        {filesToUpload.length !== 1 ? 's' : ''} anexado
                        {filesToUpload.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Componente auxiliar para o resumo
function SummaryItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border-2 border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
        <div className="text-slate-600 dark:text-slate-400">{icon}</div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </p>
        <p
          className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100"
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
