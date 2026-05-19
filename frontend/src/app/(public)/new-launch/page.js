import { redirect } from 'next/navigation';

export default function NewLaunchPage() {
  redirect('/buy?category=new_launch');
}
