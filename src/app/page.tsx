import { redirect } from 'next/navigation';

// La raíz redirige al dashboard (el middleware valida si hay sesión)
export default function Home() {
  redirect('/dashboard');
}
