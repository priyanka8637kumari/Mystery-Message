import { redirect } from 'next/navigation';

export default function Home() {
  redirect('src/app/(app)/page.tsx'); // Redirect to the app route
}
