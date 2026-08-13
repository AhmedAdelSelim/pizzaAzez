'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthBackdrop from '@/components/AuthBackdrop';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const { login, error, isLoading } = useAuth();
    // Set when AuthContext bounced the user here after a rejected token.
    const expired = useSearchParams().get('expired') === '1';
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLocalError('');
        if (!phone.trim()) return setLocalError('يرجى إدخال رقم الهاتف');
        if (!password.trim()) return setLocalError('يرجى إدخال كلمة المرور');
        try {
            await login(phone.trim(), password);
        } catch (err) {
            setLocalError(err.message);
        }
    };

    return (
        <main className="relative flex flex-1 flex-col justify-center px-6 py-10">
            <AuthBackdrop />

            <div className="rise-in mb-10 flex flex-col items-center">
                <Logo size={140} tagline="بيتزا لذيذة وأكل شرقي" />
            </div>

            <form
                onSubmit={handleLogin}
                className="rise-in rounded-3xl border border-border/60 bg-surface/85 p-6 shadow-lg-soft backdrop-blur-xl"
                style={{ '--d': '80ms' }}
            >
                <h1 className="rise-in text-2xl font-bold text-text" style={{ '--d': '200ms' }}>
                    أهلاً بعودتك
                </h1>
                <p className="rise-in mb-6 text-sm text-muted" style={{ '--d': '260ms' }}>
                    سجّل دخولك لمتابعة الطلب
                </p>

                {expired && !localError && !error && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning/10 p-3">
                        <Icon name="time-outline" size={18} className="text-warning" />
                        <span className="flex-1 text-xs font-medium text-warning">
                            انتهت جلستك، يرجى تسجيل الدخول مرة أخرى
                        </span>
                    </div>
                )}

                {(localError || error) && (
                    <div
                        // Keyed on the message so a second, identical failure
                        // remounts and shakes again instead of sitting still.
                        key={localError || error}
                        className="animate-shake mb-4 flex items-center gap-2 rounded-lg bg-error/10 p-3"
                    >
                        <Icon name="alert-circle" size={18} className="text-error" />
                        <span className="flex-1 text-xs font-medium text-error">
                            {localError || error}
                        </span>
                    </div>
                )}

                <div className="mb-6 flex flex-col gap-3.5">
                    <label
                        className="rise-in flex items-center gap-3 rounded-xl border border-border bg-background-light px-4 py-3.5 transition duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(232,93,44,0.14)] focus-within:-translate-y-0.5"
                        style={{ '--d': '320ms' }}
                    >
                        <Icon name="call-outline" size={20} className="text-muted" />
                        <input
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            className="min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-muted"
                            placeholder="رقم الهاتف"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </label>

                    <label
                        className="rise-in flex items-center gap-3 rounded-xl border border-border bg-background-light px-4 py-3.5 transition duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(232,93,44,0.14)] focus-within:-translate-y-0.5"
                        style={{ '--d': '380ms' }}
                    >
                        <Icon name="lock-closed-outline" size={20} className="text-muted" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            className="min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-muted"
                            placeholder="كلمة المرور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        >
                            <Icon
                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={20}
                                className="text-muted"
                            />
                        </button>
                    </label>
                </div>

                {/* The sweep lives on a wrapper so Button stays untouched and every
                    other use of it is unaffected. */}
                <div className="rise-in relative mb-5 overflow-hidden rounded-xl" style={{ '--d': '440ms' }}>
                    <Button type="submit" title="تسجيل الدخول" loading={isLoading} size="large" />
                    {!isLoading && (
                        <span
                            aria-hidden="true"
                            className="animate-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                        />
                    )}
                </div>

                <p className="rise-in text-center text-sm text-muted" style={{ '--d': '500ms' }}>
                    ليس لديك حساب؟{' '}
                    <Link href="/register" className="font-bold text-primary">
                        إنشاء حساب
                    </Link>
                </p>
            </form>
        </main>
    );
}
