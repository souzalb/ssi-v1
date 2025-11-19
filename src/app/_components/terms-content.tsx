'use client';

import { ScrollText, Check } from 'lucide-react';

// Este componente é o conteúdo do modal
export function TermsContent() {
  return (
    <div className="space-y-8">
      {/* HEADER PRINCIPAL */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <ScrollText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Termos de Serviço
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Última atualização:{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {new Date().toLocaleDateString('pt-BR')}
          </span>
        </p>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* COLUNA 1 & 2: CONTEÚDO MAIOR */}
        <div className="space-y-6 lg:col-span-2">
          <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-bold">
            1. Aceitação dos Termos
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Ao registar-se, acessar ou usar o SSI-106, você confirma que leu,
            entendeu e concorda em ficar vinculado a estes Termos e Condições. O
            Serviço é fornecido exclusivamente para uso interno e profissional
            da sua organização.
          </p>

          <h2 className="border-l-4 border-purple-500 pl-3 text-xl font-bold">
            2. Uso e Responsabilidade
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            O uso inadequado ou o compartilhamento de credenciais é estritamente
            proibido. O utilizador deve garantir a segurança da sua conta em
            todos os momentos.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Responsabilidade da Conta:</strong> Você é responsável
                por manter a segurança da sua senha e da sua conta.
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Uso Adequado:</strong> O Serviço não deve ser usado para
                qualquer finalidade ilegal, não autorizada ou que viole direitos
                de terceiros.
              </span>
            </li>
          </ul>

          <h2 className="border-l-4 border-orange-500 pl-3 text-xl font-bold">
            3. Conteúdo
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            O conteúdo (descrições, anexos, comentários) deve ser relevante para
            o suporte interno. Não é permitido o upload de conteúdo destrutivo.
          </p>
        </div>

        {/* COLUNA 3: ESPECIFICAÇÕES */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Especificações Rápidas
          </h3>

          <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              SLA (Níveis de Serviço)
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Não garantimos o Serviço ininterrupto.
            </p>
          </div>

          <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              Rescisão de Conta
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              A Administração reserva-se o direito de encerrar a conta por
              violação destes Termos.
            </p>
          </div>

          <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              Contato
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Para dúvidas, entre em contato com o seu administrador de sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
