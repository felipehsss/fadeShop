import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Forneça o seu UID do Firebase Auth na URL. Exemplo: /api/seed?uid=SEU_UID' }, { status: 400 });
  }

  const db = getAdminDb();
  const tenantId = 'tenant_demo_01';

  try {
    // 1. Dar permissão de Super Admin para a sua conta
    await db.collection('profiles').doc(uid).set({
      role: 'super_admin',
      tenantId: null,
      isActive: true,
      createdAt: new Date(),
    });

    // 2. Criar a Barbearia (Tenant)
    await db.collection('tenants').doc(tenantId).set({
      slug: 'barbearia-do-joao',
      name: 'Barbearia do João',
      ownerEmail: 'admin@demo.com',
      status: 'active',
      planId: 'pro',
      trialEndsAt: null,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
      settings: {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        bookingLeadHours: 2,
        maxBookingDays: 30,
        address: 'Rua das Tesouras, 123 - Centro',
        phone: '11999999999'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Criar um Serviço (Corte)
    const serviceRef = db.collection('tenants').doc(tenantId).collection('services').doc('svc_corte');
    await serviceRef.set({
      name: 'Corte Degradê',
      description: 'Corte na máquina e tesoura com acabamento perfeito.',
      durationMin: 30,
      priceCents: 3500, // R$ 35,00
      isActive: true,
      createdAt: new Date(),
    });

    // 4. Criar um Barbeiro (João) e vincular ao serviço
    const barberRef = db.collection('tenants').doc(tenantId).collection('barbers').doc('barber_joao');
    await barberRef.set({
      profileId: null,
      name: 'João Silva',
      bio: 'Especialista em degradê e barba.',
      serviceIds: ['svc_corte'],
      isActive: true,
      createdAt: new Date(),
    });

    // 5. Definir Horários de Funcionamento (Segunda a Sexta, 09h às 18h)
    for (let day = 1; day <= 5; day++) {
      await db.collection('tenants').doc(tenantId).collection('workingHours').doc(`wh_${day}`).set({
        barberId: 'barber_joao',
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Banco populado com sucesso!',
      nextStep: 'Acesse http://localhost:3000/b/barbearia-do-joao para ver a página pública!'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}