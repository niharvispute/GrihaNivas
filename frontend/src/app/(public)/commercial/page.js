import { redirect } from 'next/navigation';

export default function CommercialPage() {
  redirect('/buy?category=commercial');
}
