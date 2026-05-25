'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/verify-email/${token}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified! You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    verify();
  }, [token]);

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      {status === 'verifying' && <p>Verifying your email...</p>}
      {status === 'success' && (
        <div style={{ color: 'green' }}>
          <h2>✅ {message}</h2>
          <a href="/login">Go to Login</a>
        </div>
      )}
      {status === 'error' && (
        <div style={{ color: 'red' }}>
          <h2>❌ {message}</h2>
          <a href="/">Back to Home</a>
        </div>
      )}
    </div>
  );
}
