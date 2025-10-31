'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../_components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@radix-ui/react-select';
import { Button } from '../_components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../_components/ui/form';
import { Input } from '../_components/ui/input';

// --- Tipo para as Áreas (vindo da nossa nova API) ---
type Area = {
  id: string;
  name: string;
};

// 1. Schema de Validação (consistente com a API /api/users)
// Adicionamos a confirmação de senha
const formSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string(),
    areaId: z.string().optional(), // Opcional, como no schema
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'], // Onde exibir o erro
  });

// 2. Componente da Página
export default function RegisterPage() {
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]); // Estado para guardar as áreas
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Buscar Áreas quando o componente montar
  useEffect(() => {
    async function fetchAreas() {
      try {
        const response = await fetch('/api/areas');
        if (!response.ok) throw new Error('Falha ao buscar áreas');
        const data = await response.json();
        setAreas(data);
      } catch (err) {
        console.error(err);
        // Opcional: setar um erro se as áreas não puderem ser carregadas
      }
    }
    fetchAreas();
  }, []); // O array vazio garante que rode apenas uma vez

  // 4. Setup do Formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      areaId: undefined,
    },
  });

  // 5. Handler de Submissão
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      // Usamos a API /api/users que criamos
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values), // Zod já garante o formato
      });

      const data = await response.json();

      if (!response.ok) {
        // 6. Tratar erros da API (ex: 409 Email em uso)
        setError(data.error || 'Falha ao registrar');
      } else {
        // 7. Sucesso!
        // Opcional: exibir mensagem de sucesso
        router.push('/login?registered=true'); // Redireciona para o login
      }
    } catch (err) {
      console.error('Erro no registro:', err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  // 8. O JSX
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-center">
            Preencha seus dados para criar um acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu.email@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de Área (Select) */}
              <FormField
                control={form.control}
                name="areaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área (Opcional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione sua área" />
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Exibição do Erro */}
              {error && (
                <p className="text-destructive text-sm font-medium">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Registrar'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
