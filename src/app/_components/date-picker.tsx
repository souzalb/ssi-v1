'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importar o locale pt-BR
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/app/_components/ui/button'; // (Ajuste o caminho)
import { Calendar } from '@/app/_components/ui/calendar'; // (Ajuste o caminho)
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/_components/ui/popover'; // (Ajuste o caminho)
import { cn } from '../_lib/utils';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder: string;
}

export function DatePicker({ date, setDate, placeholder }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, 'PPP', { locale: ptBR }) // Formata como "5 de nov. de 2025"
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={ptBR} // Usa o calendário em Português
        />
      </PopoverContent>
    </Popover>
  );
}
