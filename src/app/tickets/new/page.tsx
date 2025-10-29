// Use o caminho correto para seu componente
import NewTicketForm from '@/app/_components/NewTicketForm';

export default function NewTicketPage() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full rounded-lg bg-white p-8 shadow-md lg:max-w-4xl">
        <h1 className="mb-6 border-b pb-4 text-3xl font-bold text-gray-800">
          Abrir Novo Chamado
        </h1>
        <p className="mb-6 text-gray-600">
          Por favor, preencha todos os campos abaixo com o máximo de detalhes
          possível.
        </p>

        {/* O formulário é renderizado aqui */}
        <NewTicketForm />
      </div>
    </div>
  );
}
