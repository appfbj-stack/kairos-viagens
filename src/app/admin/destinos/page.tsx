import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DestinosAdmin } from './DestinosAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminDestinosPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin');
  const destinations = await prisma.destination.findMany({ orderBy: { name: 'asc' } });
  return (
    <DestinosAdmin
      destinations={destinations.map((d) => ({
        id: d.id, slug: d.slug, name: d.name, country: d.country, state: d.state,
        city: d.city, iataCode: d.iataCode, popular: d.popular, active: d.active, heroImage: d.heroImage,
        description: d.description,
      }))}
    />
  );
}
