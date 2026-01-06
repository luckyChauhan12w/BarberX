import type { ReactNode } from 'react';
import { Scissors } from 'lucide-react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
    return (
        <div className="flex min-h-screen w-full bg-white font-sans text-slate-900">
            <div className="flex w-full flex-col items-center justify-center px-8 md:w-1/2 lg:px-16">
                <div className="w-full max-w-100">
                    {/* Logo Section - Common in both */}
                    <div className="mb-10 flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                            <Scissors size={22} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-gray-900">
                            Barber<span className="text-orange-500">X</span>
                        </span>
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <header className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
                        </header>


                        {children}
                    </div>
                </div>
            </div>


            <div className="relative hidden w-1/2 md:block">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://i.pinimg.com/1200x/6f/60/b2/6f60b284abf3009cbc515391124b44dc.jpg')" }}
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute bottom-16 left-16 right-16 z-10 text-white">
                    <blockquote className="space-y-4">
                        <p className="text-xl font-medium leading-relaxed italic opacity-90">
                            “The best haircut I've ever had. The booking system is seamless and I never have to wait.”
                        </p>
                        <footer className="text-base font-semibold">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
};