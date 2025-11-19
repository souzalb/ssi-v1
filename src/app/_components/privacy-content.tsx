'use client';

import { ShieldCheck, XCircle, User, MessageSquare } from 'lucide-react';

// Este componente é o conteúdo do modal de Política de Privacidade
export function PrivacyContent() {
  return (
    <div className="space-y-8">
      {/* HEADER PRINCIPAL */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Política de Privacidade
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Última atualização:{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {new Date().toLocaleDateString('pt-BR')}
          </span>
        </p>
      </div>

      {/* CONTEÚDO PRINCIPAL (Layout de Coluna) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* COLUNA 1 & 2: DADOS RECOLHIDOS */}
        <div className="space-y-6 lg:col-span-2">
          <h2 className="border-l-4 border-emerald-500 pl-3 text-xl font-bold">
            1. Informações que Recolhemos
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Recolhemos apenas dados de identificação e funcionais estritamente
            necessários para o funcionamento do sistema de suporte.
          </p>

          <h3 className="mt-6 text-lg font-semibold">Dados Essenciais:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <User className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
              <div className="flex flex-col">
                <strong className="text-sm">Identificação (Login)</strong>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Nome, Email e Função (Role). Usados estritamente para
                  autenticação e gestão de permissões (RBAC).
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
              <div className="flex flex-col">
                <strong className="text-sm">Conteúdo do Chamado</strong>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Descrições, comentários e anexos. Ficheiros são armazenados em
                  nuvem segura (Vercel Blob).
                </span>
              </div>
            </li>
          </ul>

          <h2 className="mt-8 border-l-4 border-blue-500 pl-3 text-xl font-bold">
            2. Segurança e Partilha
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            A sua segurança é a nossa prioridade. Implementamos criptografia
            robusta.
          </p>

          <ul className="space-y-2">
            <li className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Senhas e Hashing:</strong> Senhas armazenadas via
                criptografia segura (hashing).
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Compartilhamento com Terceiros:</strong> Não
                compartilhamos dados com terceiros externos para fins de
                marketing.
              </span>
            </li>
          </ul>
        </div>

        {/* COLUNA 3: DIREITOS E INFORMAÇÕES */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Os Seus Direitos
          </h3>

          <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              Acesso e Correção
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Pode acessar, verificar e solicitar ao administrador a alteração
              de suas informações na página de &ldquo;Configurações&rdquo;.
            </p>
          </div>

          <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              Eliminação de Dados
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Pode solicitar a exclusão dos seus dados.
            </p>
          </div>

          <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              Cookies
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Usamos apenas cookies essenciais de sessão (login) e não
              rastreamos para publicidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
