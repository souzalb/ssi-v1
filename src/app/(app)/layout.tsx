import { Header } from '../_components/header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 1. O Header é renderizado aqui */}
      <Header />

      {/* 2. O conteúdo da página (ex: Dashboard) é renderizado abaixo */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
