'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Calendar,
  DollarSign,
  Users,
  Clock,
};

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  className?: string;
}

export function MetricsCard({
  title,
  value,
  subtitle,
  icon,
  className,
}: MetricsCardProps) {
  const Icon = icon ? ICONS[icon] : undefined;

  return (
    <Card className={cn('border-zinc-800 bg-zinc-900/50', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {Icon && (
          <span className="rounded-lg bg-zinc-800 p-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </span>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
