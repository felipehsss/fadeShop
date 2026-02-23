import {
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  addMinutes,
  isBefore,
  isAfter,
  areIntervalsOverlapping,
  format,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { WorkingHours, ScheduleBlock, TimeSlot } from '@/types/availability';
import type { Appointment } from '@/types/appointment';

// ─────────────────────────────────────────────
// Tipos de entrada da calculadora
// ─────────────────────────────────────────────
export interface GetAvailableSlotsParams {
  /** Data alvo (somente o dia é considerado) */
  targetDate: Date;

  /** Horários de trabalho do barbeiro para o dia da semana da targetDate */
  workingHours: WorkingHours | null;

  /** Agendamentos existentes do barbeiro na targetDate (status: 'scheduled' | 'confirmed') */
  existingAppointments: Appointment[];

  /** Bloqueios aprovados que podem sobrepor a targetDate */
  scheduleBlocks: ScheduleBlock[];

  /** Duração do serviço em minutos */
  serviceDurationMin: number;

  /**
   * Granularidade do slot em minutos.
   * Ex: 30 → slots às 09:00, 09:30, 10:00...
   * Deve ser divisível pela duração do serviço ou igual a ela.
   * @default 30
   */
  slotIntervalMin?: number;

  /**
   * Timezone da barbearia ex: 'America/Sao_Paulo'
   * @default 'America/Sao_Paulo'
   */
  timezone?: string;

  /**
   * Horas mínimas de antecedência para aceitar um agendamento.
   * Slots antes de (agora + leadHours) são bloqueados.
   * @default 2
   */
  leadHours?: number;
}

// ─────────────────────────────────────────────
// Função auxiliar: converte "HH:MM" + Date → Date completo
// ─────────────────────────────────────────────
function timeStringToDate(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return setMilliseconds(
    setSeconds(setMinutes(setHours(new Date(baseDate), hours), minutes), 0),
    0,
  );
}

// ─────────────────────────────────────────────
// Calculadora principal
// ─────────────────────────────────────────────
/**
 * Retorna todos os slots de horário disponíveis para um barbeiro
 * em um dia específico, considerando:
 *  - Horário de trabalho do barbeiro naquele dia da semana
 *  - Agendamentos já marcados (evita double-booking)
 *  - Bloqueios pontuais aprovados (folgas, pausas)
 *  - Tempo mínimo de antecedência (leadHours)
 *  - Duração do serviço (slot inválido se não couber antes do fim do expediente)
 */
export function getAvailableSlots({
  targetDate,
  workingHours,
  existingAppointments,
  scheduleBlocks,
  serviceDurationMin,
  slotIntervalMin = 30,
  timezone = 'America/Sao_Paulo',
  leadHours = 2,
}: GetAvailableSlotsParams): TimeSlot[] {
  // ── 1. Barbeiro não trabalha neste dia ───────
  if (!workingHours || !workingHours.isActive) {
    return [];
  }

  // ── 2. Limites do expediente ─────────────────
  const workStart = timeStringToDate(workingHours.startTime, targetDate);
  const workEnd = timeStringToDate(workingHours.endTime, targetDate);

  if (isBefore(workEnd, workStart) || workEnd.getTime() === workStart.getTime()) {
    return []; // Horário inválido
  }

  // ── 3. Tempo mínimo de antecedência ──────────
  // Converte "agora" para o timezone da barbearia para comparação justa
  const nowInTz = toZonedTime(new Date(), timezone);
  const minBookingTime = addMinutes(nowInTz, leadHours * 60);

  // ── 4. Gera todos os slots candidatos ─────────
  const candidateSlots: TimeSlot[] = [];
  let cursor = new Date(workStart);

  while (isBefore(cursor, workEnd)) {
    const slotStart = new Date(cursor);
    const slotEnd = addMinutes(slotStart, serviceDurationMin);

    // O serviço completo deve caber dentro do expediente
    if (isAfter(slotEnd, workEnd)) {
      break;
    }

    candidateSlots.push({
      time: format(slotStart, 'HH:mm'),
      startsAt: slotStart,
      endsAt: slotEnd,
      isAvailable: true, // Será atualizado nas etapas seguintes
    });

    cursor = addMinutes(cursor, slotIntervalMin);
  }

  // ── 5. Filtra agendamentos existentes ─────────
  // Apenas agendamentos ativos bloqueiam o slot
  const activeAppointments = existingAppointments.filter(
    (appt) => appt.status === 'scheduled' || appt.status === 'confirmed',
  );

  // ── 6. Filtra bloqueios aprovados ─────────────
  const approvedBlocks = scheduleBlocks.filter(
    (block) => block.status === 'approved',
  );

  // ── 7. Verifica disponibilidade de cada slot ──
  return candidateSlots.map((slot) => {
    const slotInterval = { start: slot.startsAt, end: slot.endsAt };

    // 7a. Antes do tempo mínimo de antecedência
    if (isBefore(slot.startsAt, minBookingTime)) {
      return { ...slot, isAvailable: false };
    }

    // 7b. Conflito com agendamento existente
    const hasAppointmentConflict = activeAppointments.some((appt) =>
      areIntervalsOverlapping(
        slotInterval,
        { start: appt.startsAt, end: appt.endsAt },
        { inclusive: false }, // Bordas exatas não contam como conflito
      ),
    );

    if (hasAppointmentConflict) {
      return { ...slot, isAvailable: false };
    }

    // 7c. Conflito com bloqueio de agenda aprovado
    const hasBlockConflict = approvedBlocks.some((block) =>
      areIntervalsOverlapping(
        slotInterval,
        { start: block.startsAt, end: block.endsAt },
        { inclusive: false },
      ),
    );

    if (hasBlockConflict) {
      return { ...slot, isAvailable: false };
    }

    return { ...slot, isAvailable: true };
  });
}

// ─────────────────────────────────────────────
// Utilitário: retorna apenas os slots disponíveis
// ─────────────────────────────────────────────
export function getOnlyAvailableSlots(params: GetAvailableSlotsParams): TimeSlot[] {
  return getAvailableSlots(params).filter((slot) => slot.isAvailable);
}

// ─────────────────────────────────────────────
// Utilitário: agrupa slots por período do dia
// ─────────────────────────────────────────────
export interface GroupedSlots {
  morning: TimeSlot[];   // 00:00 – 11:59
  afternoon: TimeSlot[]; // 12:00 – 17:59
  evening: TimeSlot[];   // 18:00 – 23:59
}

export function groupSlotsByPeriod(slots: TimeSlot[]): GroupedSlots {
  return slots.reduce<GroupedSlots>(
    (acc, slot) => {
      const hour = slot.startsAt.getHours();
      if (hour < 12) acc.morning.push(slot);
      else if (hour < 18) acc.afternoon.push(slot);
      else acc.evening.push(slot);
      return acc;
    },
    { morning: [], afternoon: [], evening: [] },
  );
}
