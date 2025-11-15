'use client';

import { useEffect, useState } from 'react';
import InitialLoader from './_components/loader';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      // redirecionar ou mostrar conteúdo
    }, 4000);
  }, []);
  return loading ? (
    <div className="absolute z-10">
      <InitialLoader />
    </div>
  ) : (
    router.push('/dashboard')
  );
}
