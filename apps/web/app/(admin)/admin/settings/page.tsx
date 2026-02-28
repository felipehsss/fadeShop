'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, MapPin, Phone, Globe, Save } from 'lucide-react';
import { useState } from 'react';

interface SettingsFormData {
  businessName: string;
  logoUrl: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  bookingLeadHours: string;
  maxBookingDays: string;
}

const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (UTC-3)' },
  { value: 'America/Manaus', label: 'Manaus (UTC-4)' },
  { value: 'America/Anchorage', label: 'Anchorage (UTC-9)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8)' },
  { value: 'Europe/London', label: 'Londres (UTC+0)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
];

const CURRENCIES = [
  { value: 'BRL', label: 'Real Brasileiro (R$)' },
  { value: 'USD', label: 'Dólar Americano ($)' },
  { value: 'EUR', label: 'Euro (€)' },
];

export default function SettingsPage() {
  const [formData, setFormData] = useState<SettingsFormData>({
    businessName: 'Fade Shop Premium',
    logoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fade',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    bookingLeadHours: '2',
    maxBookingDays: '30',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulando envio para backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Configurações atualizadas com sucesso!');
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações da Barbearia</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as informações e preferências da sua barbearia
        </p>
      </div>

      {/* Section 1: Business Information */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-400" />
            Informações do Estabelecimento
          </CardTitle>
          <CardDescription>Dados gerais da barbearia</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Business Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Nome da Barbearia</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
              placeholder="ex: Fade Shop Premium"
            />
            <p className="text-xs text-muted-foreground">
              Nome que aparecerá para os clientes na página pública
            </p>
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">URL do Logótipo</label>
            <input
              type="url"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
              placeholder="https://exemplo.com/logo.png"
            />
            <p className="text-xs text-muted-foreground">
              Link direto para o logótipo da sua barbearia
            </p>
          </div>

          {/* Logo Preview */}
          {formData.logoUrl && (
            <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-800 flex items-center gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Pré-visualização do Logótipo</p>
                <Avatar className="h-16 w-16 rounded-lg ring-2 ring-zinc-950">
                  <AvatarImage src={formData.logoUrl} alt="Logo preview" />
                  <AvatarFallback className="bg-zinc-800 text-amber-300 font-bold">
                    {formData.businessName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <p className="text-xs text-muted-foreground">
                O logótipo será exibido na página pública de agendamento
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Contact Information */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-amber-400" />
            Informações de Contacto
          </CardTitle>
          <CardDescription>Dados para contacto dos clientes</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Telefone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
              placeholder="(11) 98765-4321"
            />
            <p className="text-xs text-muted-foreground">
              Número de WhatsApp para contacto de clientes
            </p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Morada</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
              rows={3}
              placeholder="Rua das Flores, 123 - Centro, São Paulo - SP"
            />
            <p className="text-xs text-muted-foreground">
              Endereço que aparecerá na página pública
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Booking Preferences */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            Preferências de Agendamento
          </CardTitle>
          <CardDescription>Configurações de horários e disponibilidade</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Timezone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Fuso Horário</label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none bg-no-repeat bg-right pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a1a1a1' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                paddingRight: '2rem',
              }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Fuso horário para os agendamentos dos clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Lead Hours */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Antecedência Mínima (horas)</label>
              <input
                type="number"
                name="bookingLeadHours"
                value={formData.bookingLeadHours}
                onChange={handleInputChange}
                min="0"
                max="168"
                className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
                placeholder="2"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de horas de antecedência para agendar
              </p>
            </div>

            {/* Max Booking Days */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Máximo de Dias (no futuro)</label>
              <input
                type="number"
                name="maxBookingDays"
                value={formData.maxBookingDays}
                onChange={handleInputChange}
                min="1"
                max="365"
                className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
                placeholder="30"
              />
              <p className="text-xs text-muted-foreground">
                Até quantos dias no futuro os clientes podem agendar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Billing & Currency */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-400" />
            Localização & Moeda
          </CardTitle>
          <CardDescription>Configurações regionais</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Currency */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Moeda</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none bg-no-repeat bg-right pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a1a1a1' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                paddingRight: '2rem',
              }}
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.value} value={curr.value}>
                  {curr.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Moeda dos preços dos serviços
            </p>
          </div>

          {/* Current Settings Display */}
          <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-800">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Configuração Actual</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Fuso Horário</p>
                <p className="text-sm font-medium mt-1">
                  {TIMEZONES.find((tz) => tz.value === formData.timezone)?.label}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Moeda</p>
                <p className="text-sm font-medium mt-1">
                  {CURRENCIES.find((c) => c.value === formData.currency)?.value}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Antecedência</p>
                <p className="text-sm font-medium mt-1">{formData.bookingLeadHours}h</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dias Futuros</p>
                <p className="text-sm font-medium mt-1">{formData.maxBookingDays}d</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 flex-1"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar Alterações'}
        </Button>
        <Button
          variant="outline"
          className="border-zinc-700 hover:bg-zinc-800 flex-1"
        >
          Cancelar
        </Button>
      </div>

      {/* Help Section */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-sm">Precisa de Ajuda?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Dúvidas sobre as configurações? Consulte a nossa <a href="#" className="text-amber-400 hover:text-amber-300">documentação completa</a> ou contacte o suporte.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="border-zinc-700">
              Contactar Suporte
            </Button>
            <Button variant="outline" size="sm" className="border-zinc-700">
              Ver Documentação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
