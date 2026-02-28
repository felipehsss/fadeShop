import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

async function verifyBearerToken(request: Request) {
  const header = request.headers.get('authorization') ?? '';
  const [kind, token] = header.split(' ');
  if (kind !== 'Bearer' || !token) {
    throw new Error('Não autenticado.');
  }
  const decoded = await getAdminAuth().verifyIdToken(token);
  return decoded;
}

function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function POST(request: Request) {
  try {
    const decoded = await verifyBearerToken(request);
    const body = (await request.json().catch(() => null)) as
      | {
          tenantId?: string;
          name?: string;
          slug?: string;
          logoUrl?: string | null;
          phone?: string | null;
          address?: string | null;
          timezone?: string;
          businessHours?: Array<{
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            isActive: boolean;
          }>;
        }
      | null;

    const tenantId = body?.tenantId?.trim() ?? '';
    const name = body?.name?.trim() ?? '';
    const slug = body?.slug?.trim() ?? '';
    const timezone = body?.timezone?.trim() ?? '';
    const businessHours = body?.businessHours ?? [];

    if (!tenantId || !name || !slug || !timezone) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: 'Slug inválido.' }, { status: 400 });
    }

    const db = getAdminDb();
    const tenantRef = db.collection('tenants').doc(tenantId);
    const tenantSnap = await tenantRef.get();
    if (!tenantSnap.exists) {
      return NextResponse.json({ error: 'Tenant não encontrado.' }, { status: 404 });
    }

    const tenant = tenantSnap.data() as { ownerUid?: string };
    if (!tenant.ownerUid || tenant.ownerUid !== decoded.uid) {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
    }

    const slugQuery = await db.collection('tenants').where('slug', '==', slug).get();
    const hasConflict = slugQuery.docs.some((doc) => doc.id !== tenantId);
    if (hasConflict) {
      return NextResponse.json({ error: 'Slug já está em uso.' }, { status: 409 });
    }

    const now = new Date();
    const settings: Record<string, unknown> = {
      timezone,
      businessHours: businessHours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        startTime: h.startTime,
        endTime: h.endTime,
        isActive: h.isActive,
      })),
    };
    const address = (body?.address ?? '').trim();
    const phone = (body?.phone ?? '').trim();
    const logoUrl = (body?.logoUrl ?? '').trim();
    if (address) settings.address = address;
    if (phone) settings.phone = phone;
    if (logoUrl) settings.logoUrl = logoUrl;

    await tenantRef.set(
      {
        name,
        slug,
        isOnboardingComplete: true,
        settings,
        updatedAt: now,
      },
      { merge: true },
    );

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
