'use client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Embora simples, pode ser útil no futuro

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
