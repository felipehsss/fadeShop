// Horário de trabalho semanal (regra recorrente)
export interface WorkingHours {
  id: string;
  barberId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dom ... 6=Sab
  startTime: string; // "HH:MM" ex: "09:00"
  endTime: string;   // "HH:MM" ex: "18:00"
  isActive: boolean;
}

// Bloqueios pontuais (folga, pausa, manutenção)
export interface ScheduleBlock {
  id: string;
  barberId: string;
  startsAt: Date;
  endsAt: Date;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Slot retornado pela calculadora
export interface TimeSlot {
  time: string;         // "HH:MM" ex: "09:00"
  startsAt: Date;       // Objeto Date completo com data+hora
  endsAt: Date;         // startsAt + durationMin
  isAvailable: boolean;
}
