'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }
  if (!user) return null;

  // Redirect to role-specific dashboard
  if (user.role === 'admin') {
    router.replace('/dashboard/admin');
    return null;
  }
  if (user.role === 'landlord') {
    router.replace('/dashboard/landlord');
    return null;
  }
  router.replace('/dashboard/user');
  return null;
}
