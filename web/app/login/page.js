'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
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
        <main className="flex flex-1 flex-col justify-center px-6 py-10">
            <div className="mb-10 flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo.png" alt="بيتزا عزيز" className="mb-2 size-35 object-contain" />
                <p className="text-sm text-text-secondary">بيتزا لذيذة وأكل شرقي</p>
            </div>

            <form onSubmit={handleLogin} className="rounded-3xl bg-surface p-6 shadow-lg-soft">
                <h1 className="text-2xl font-bold text-text">أهلاً بعودتك</h1>
                <p className="mb-6 text-sm text-muted">سجّل دخولك لمتابعة الطلب</p>

                {expired && !localError && !error && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning/10 p-3">
                        <Icon name="time-outline" size={18} className="text-warning" />
                        <span className="flex-1 text-xs font-medium text-warning">
                            انتهت جلستك، يرجى تسجيل الدخول مرة أخرى
                        </span>
                    </div>
                )}

                {(localError || error) && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 p-3">
                        <Icon name="alert-circle" size={18} className="text-error" />
                        <span className="flex-1 text-xs font-medium text-error">
                            {localError || error}
                        </span>
                    </div>
                )}

                <div className="mb-6 flex flex-col gap-3.5">
                    <label className="flex items-center gap-3 rounded-xl border border-border bg-background-light px-4 py-3.5 focus-within:border-primary">
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

                    <label className="flex items-center gap-3 rounded-xl border border-border bg-background-light px-4 py-3.5 focus-within:border-primary">
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

                <Button type="submit" title="تسجيل الدخول" loading={isLoading} size="large" className="mb-5" />

                <p className="text-center text-sm text-muted">
                    ليس لديك حساب؟{' '}
                    <Link href="/register" className="font-bold text-primary">
                        إنشاء حساب
                    </Link>
                </p>
            </form>
        </main>
    );
}
