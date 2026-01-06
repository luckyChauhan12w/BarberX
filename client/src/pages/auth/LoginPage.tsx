import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginUser, clearError } from '../../features/auth/authSlice';
import { AuthLayout } from '../../components/auth/AuthLayout';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) navigate('/');
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => { dispatch(clearError()); };
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(loginUser({ email, password }));
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Enter your email to sign in to your account"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-900">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="m@example.com"
                        className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-900">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400"
                        required
                    />
                </div>

                {error && <p className="text-xs font-medium text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-[#D4A745] py-2.5 text-sm font-bold text-white transition hover:bg-[#c1963b] disabled:opacity-70"
                >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>

                {/* Optional Social/Role Buttons */}
                <div className="relative flex items-center py-2">
                    <div className="grow border-t border-gray-100"></div>
                    <span className="mx-4 text-[10px] font-bold uppercase text-gray-400">Or continue as</span>
                    <div className="grow border-t border-gray-100"></div>
                </div>

                <div className="flex gap-4">
                    <button type="button" className="flex-1 rounded-lg border border-gray-100 py-2 text-xs font-semibold hover:bg-gray-50">Barber</button>
                    <button type="button" className="flex-1 rounded-lg border border-gray-100 py-2 text-xs font-semibold hover:bg-gray-50">Admin</button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-[#D4A745] hover:underline">Sign up</Link>
                </p>
            </div>
        </AuthLayout>
    );
};