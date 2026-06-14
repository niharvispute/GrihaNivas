'use client';

import { use } from 'react';
import { ProjectFormProvider } from '@/context/ProjectFormContext';
import ProjectFormWizard from '@/components/admin/projects/ProjectFormWizard';

export default function EditProjectPage({ params }) {
  const { id } = use(params);
  return (
    <ProjectFormProvider initialProjectId={id} initialStep={1}>
      <ProjectFormWizard />
    </ProjectFormProvider>
  );
}
