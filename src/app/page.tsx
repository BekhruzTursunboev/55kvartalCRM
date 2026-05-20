'use server'

// We will export a clean server page component. It is highly recommended to do most rendering in client, so we will import a client page component.
// Let's create the client component file 'src/app/crm-dashboard.tsx' first, and render it inside page.tsx.
// This is the cleanest Next.js App Router design because page.tsx is a server component by default and passes down initial database lists to the client component!
// This avoids flashes of unstyled content (FOUC), ensures super-fast page speed, and makes it incredibly robust.

import { getProperties, getClients } from './actions';
import CrmDashboard from './crm-dashboard';

export default async function Home() {
  // Fetch initial data on the server side
  const initialProperties = await getProperties();
  const initialClients = await getClients();

  return (
    <main className="flex-1 bg-[#F9F8F6] min-h-screen text-[#1C2421] flex flex-col font-sans">
      <CrmDashboard 
        initialProperties={initialProperties} 
        initialClients={initialClients} 
      />
    </main>
  );
}
