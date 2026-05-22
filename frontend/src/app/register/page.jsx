'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
  });

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  /////////////////////////////////////////////////////
  // HANDLE INPUT CHANGE
  /////////////////////////////////////////////////////

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /////////////////////////////////////////////////////
  // HANDLE SUBMIT
  /////////////////////////////////////////////////////

  const handleSubmit = async (e) => {
    e.preventDefault();

    /////////////////////////////////////////////////////
    // PASSWORD VALIDATION
    /////////////////////////////////////////////////////

    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    /////////////////////////////////////////////////////
    // PASSWORD LENGTH
    /////////////////////////////////////////////////////

    if (form.password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }

    try {
      setLoading(true);

      /////////////////////////////////////////////////////
      // SEND TO BACKEND
      /////////////////////////////////////////////////////

      await api.post('/auth/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        username: form.username,
        password: form.password,
        confirmPassword: form.confirmPassword,

        address: form.address,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
      });

      toast.success('Registration successful! Please verify your email.');

      router.push('/login');
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-6">Create an Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />

          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
        </div>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="address"
          placeholder="Street Address"
          value={form.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="p-2 border rounded"
          />

          <input
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>

        <input
          name="postalCode"
          placeholder="Postal Code (Optional)"
          value={form.postalCode}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600">
          Sign In
        </Link>
      </p>
    </div>
  );
}
