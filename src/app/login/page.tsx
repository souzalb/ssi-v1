import { Cog } from 'lucide-react';
import { LoginForm } from './login-form';
import Image from 'next/image';
// (Verifique se este caminho está correto para a sua estrutura de pastas)

export default function LoginPage() {
  return (
    // 1. O contentor principal é 'relative' para conter a imagem
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      {/* --- 2. Elementos de Fundo --- */}

      {/* A Imagem */}
      <Image
        // (Pode trocar esta URL por uma imagem sua, se desejar)
        src="https://images.unsplash.com/photo-1548092372-0d1bd40894a3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070"
        alt="Imagem de fundo de tecnologia"
        className="absolute inset-0 z-[-2] h-full w-full object-cover"
      />
      {/* O Overlay escuro (para legibilidade) */}
      <div className="absolute inset-0 z-[-1] h-full w-full bg-black/70" />

      {/* --- 3. O seu Conteúdo (agora com z-10) --- */}
      <div className="z-10 flex w-full max-w-sm flex-col gap-6">
        <a
          href="#"
          className="flex items-center gap-2 self-center font-medium text-white" // Cor do texto mudada para branco
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Cog className="size-4" />
          </div>
          SSI 1.06
        </a>

        {/* O LoginForm (que é um <Card> branco) vai contrastar perfeitamente */}
        <LoginForm />
      </div>
    </div>
  );
}
