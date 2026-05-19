'use client';

import { useParams } from 'next/navigation';
import BuilderWizardForm from '@/components/admin/builders/BuilderWizardForm';

export default function EditBuilderPage() {
  const params = useParams();
  const builderId = params?.id ? String(params.id) : '';

  return <BuilderWizardForm mode="edit" builderId={builderId} />;
}
