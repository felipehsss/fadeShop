export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  durationMin: number;    // duração em minutos (ex: 30, 45, 60)
  priceCents: number;     // preço em centavos (ex: 3500 = R$ 35,00)
  isActive: boolean;
  createdAt: Date;
}
