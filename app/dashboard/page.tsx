import WorkflowBuilder from '@/components/WorkflowBuilder';
import { auth } from '@clerk/nextjs/server';

import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  return <WorkflowBuilder />;
}