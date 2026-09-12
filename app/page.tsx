import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically redirect the base URL to the farmer portal
  redirect('/farmer');
}
