import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearError, registerUser } from '../../features/auth/authSlice';
import { AuthLayout } from '../../components/auth/AuthLayout';

// Define the available roles for better type safety
type UserRole = 'CUSTOMER' | 'BARBER' | 'ADMIN';

export const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Initialize role state to allow dynamic updates
    const [role, setRole] = useState<UserRole>('CUSTOMER');

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
        await dispatch(registerUser({
            fullName: { firstName, lastName },
            email,
            password,
            role
        }));
    };

    // Helper function to handle role selection
    const handleRoleChange = (selectedRole: UserRole) => {
        setRole(selectedRole);
    };

    return (
        <AuthLayout
            title="Create an account"
            subtitle={`Join as a ${role.toLowerCase()} to get started`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-900">First name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400"
                            placeholder="John"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-900">Last name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400"
                            placeholder="Doe"
                            required
                        />
                    </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-900">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400"
                        placeholder="m@example.com"
                        required
                    />
                </div>

                {/* Password Field */}
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
                    className="mt-2 w-full rounded-lg bg-[#D4A745] py-2.5 text-sm font-bold text-white transition hover:bg-[#c1963b] disabled:opacity-70"
                >
                    {isLoading ? `Registering ${role.toLowerCase()}...` : 'Create account'}
                </button>

                <div className="relative flex items-center py-2">
                    <div className="grow border-t border-gray-100"></div>
                    <span className="mx-4 text-[10px] font-bold uppercase text-gray-400">Or register as</span>
                    <div className="grow border-t border-gray-100"></div>
                </div>

                {/* Role Selection Buttons */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => handleRoleChange('BARBER')}
                        className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${role === 'BARBER'
                                ? 'border-orange-400 bg-orange-50 text-orange-600'
                                : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                            }`}
                    >
                        Barber
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleChange('ADMIN')}
                        className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${role === 'ADMIN'
                                ? 'border-orange-400 bg-orange-50 text-orange-600'
                                : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                            }`}
                    >
                        Admin
                    </button>
                </div>

                {/* Optional: Reset to Customer */}
                {role !== 'CUSTOMER' && (
                    <button
                        type="button"
                        onClick={() => setRole('CUSTOMER')}
                        className="w-full text-center text-[10px] font-bold uppercase text-orange-500 hover:underline"
                    >
                        Switch back to Customer
                    </button>
                )}
            </form>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-[#D4A745] hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};