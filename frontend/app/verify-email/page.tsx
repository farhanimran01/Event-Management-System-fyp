'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Missing verification token.');
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const response = await axios.get(`${apiUrl}/auth/verifyemail/${token}`);

                if (response.data.success) {
                    setStatus('success');
                    setMessage(response.data.message || 'Email verified successfully!');
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        router.push('/login');
                    }, 3000);
                }
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification failed. The link may be invalid or expired.');
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <h1 className="text-2xl font-bold text-white">Verifying Email</h1>
                        <p className="text-gray-400">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center space-y-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <h1 className="text-2xl font-bold text-white">Success!</h1>
                        <p className="text-gray-400">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting to login page...</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center space-y-4">
                        <XCircle className="w-16 h-16 text-red-500" />
                        <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
                        <p className="text-gray-400">{message}</p>
                        <button
                            onClick={() => router.push('/register')}
                            className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                        >
                            Back to Sign Up
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
