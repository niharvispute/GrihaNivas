'use client';

import { ProjectFormProvider } from '@/context/ProjectFormContext';
import ProjectFormWizard from '@/components/admin/projects/ProjectFormWizard';

export default function NewProjectPage() {
  return (
    <ProjectFormProvider initialProjectId={null} initialStep={1}>
      <ProjectFormWizard />
    </ProjectFormProvider>
  );
}
