import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { Scissors } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearError, registerUser } from '../../features/auth/authSlice';

export const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'CUSTOMER' | 'BARBER' | 'ADMIN'>('CUSTOMER');

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(registerUser({
            fullName: { firstName, lastName },
            email,
            password,
            role
        }));
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-sans text-slate-900">

            <div className="flex w-full flex-col justify-between p-8 md:w-1/2 lg:p-16">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <Scissors size={24} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900">BarberX</span>
                </div>

                <div className="mx-auto w-full max-w-105">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h1>
                        <p className="mt-2 text-slate-500">Join our community and book your next style.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
                                placeholder="m@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">I am a...</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as any)}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                            >
                                <option value="CUSTOMER">Customer</option>
                                <option value="BARBER">Barber</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-amber-600 underline-offset-4 hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>

                {/* Footer text */}
                <p className="text-xs text-slate-400">
                    By clicking continue, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>

            {/* Right Section: Image & Testimonial */}
            <div className="relative hidden w-1/2 flex-col justify-end bg-slate-900 p-12 text-white md:flex">
                {/* Background Image Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')" }}
                />

                <div className="relative z-10 max-w-lg">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium leading-relaxed italic">
                            “The best haircut I've ever had. The booking system is seamless and I never have to wait.”
                        </p>
                        <footer className="text-sm font-semibold">— Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
};