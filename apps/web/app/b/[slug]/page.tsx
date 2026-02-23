import { Metadata } from 'next';
import { BookingPageClient } from './booking-page-client';
import { getMockTenant, getMockServices, getMockBarbers } from './mock-booking-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = getMockTenant(slug);
  return {
    title: `${tenant.name} — Agendar Horário Online`,
    description: `Agende seu horário na ${tenant.name} de forma rápida e fácil.`,
  };
}

export default async function BarbeariaPubPage({ params }: PageProps) {
  const { slug } = await params;
  const tenant = getMockTenant(slug);
  const services = getMockServices();
  const barbers = getMockBarbers();

  const tenantSerialized = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    settings: {
      logoUrl: tenant.settings.logoUrl,
      address: tenant.settings.address,
      phone: tenant.settings.phone,
      timezone: tenant.settings.timezone,
    },
  };

  return (
    <BookingPageClient
      tenant={tenantSerialized}
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        durationMin: s.durationMin,
        priceCents: s.priceCents,
      }))}
      barbers={barbers.map((b) => ({
        id: b.id,
        name: b.name,
        bio: b.bio,
        avatarUrl: b.avatarUrl,
        serviceIds: b.serviceIds,
      }))}
    />
  );
}
