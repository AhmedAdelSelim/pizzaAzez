'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { useClientSnapshot } from '@/lib/localStore';
import { MIN_BIRTHDAY, todayISO } from '@/lib/utils';

export default function RegisterPage() {
    const { register, error, isLoading } = useAuth();
    // Resolved on the client so the server-rendered `max` can't disagree with
    // the browser's date and trip a hydration warning.
    const today = useClientSnapshot(todayISO, '');
    const [form, setForm] = useState({
        name: '',
        username: '',
        phone: '',
        email: '',
        address: '',
        birthday: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const fields = [
        { key: 'name', icon: 'person-outline', placeholder: 'الاسم الكامل', type: 'text', autoComplete: 'name' },
        // Latin-only handle, so it reads left-to-right inside the RTL form.
        {
            key: 'username',
            icon: 'text-outline',
            placeholder: 'اسم المستخدم',
            type: 'text',
            autoComplete: 'username',
            dir: 'ltr',
        },
        { key: 'phone', icon: 'call-outline', placeholder: 'رقم الهاتف (الأساسي)', type: 'tel', autoComplete: 'tel' },
        { key: 'email', icon: 'mail-outline', placeholder: 'البريد الإلكتروني (اختياري)', type: 'email', autoComplete: 'email' },
        { key: 'address', icon: 'location-outline', placeholder: 'عنوان التوصيل', type: 'text', autoComplete: 'street-address' },
        // A date input ignores `placeholder`, so it carries a visible label instead.
        { key: 'birthday', icon: 'gift-outline', label: 'تاريخ الميلاد (اختياري)', type: 'date' },
    ];

    const handleRegister = async (e) => {
        e.preventDefault();
        setLocalError('');
        if (!form.name.trim()) return setLocalError('يرجى إدخال الاسم');
        if (!form.username.trim()) return setLocalError('يرجى إدخال اسم المستخدم');
        // Mirrors the server rule so the user is told before a round trip.
        if (!/^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/.test(form.username.trim())) {
            return setLocalError(
                'اسم المستخدم يجب أن يبدأ بحرف إنجليزي، ٣-٢٠ خانة، حروف وأرقام و _ . فقط'
            );
        }
        if (!form.phone.trim()) return setLocalError('يرجى إدخال رقم الهاتف');
        if (!form.password.trim()) return setLocalError('يرجى إدخال كلمة المرور');
        if (form.password.length < 6) return setLocalError('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');

        try {
            await register({
                name: form.name.trim(),
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
                phone: form.phone.trim(),
                address: form.address.trim(),
                birthday: form.birthday.trim() || null,
            });
        } catch (err) {
            setLocalError(err.message);
        }
    };

    return (
        <main className="flex flex-1 flex-col px-6 py-8">
            <div className="mb-8 mt-5 flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo.png" alt="بيتزا عزيز" className="mb-2 size-28 object-contain" />
                <h1 className="text-2xl font-extrabold text-text">انضم لبيتزا عزيز</h1>
                <p className="text-xs text-text-secondary">أنشئ حسابك وابدأ بالطلب</p>
            </div>

            <form onSubmit={handleRegister} className="rounded-3xl bg-surface p-6 shadow-lg-soft">
                {(localError || error) && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 p-3">
                        <Icon name="alert-circle" size={18} className="text-error" />
                        <span className="flex-1 text-xs font-medium text-error">
                            {localError || error}
                        </span>
                    </div>
                )}

                <div className="mb-6 flex flex-col gap-3">
                    {fields.map((field) => (
                        <label
                            key={field.key}
                            className="flex items-center gap-3 rounded-xl border border-border bg-background-light px-4 py-3.5 focus-within:border-primary"
                        >
                            <Icon name={field.icon} size={20} className="text-muted" />
                            {field.label && (
                                <span className="shrink-0 text-sm text-muted">{field.label}</span>
                            )}
                            <input
                                type={field.type}
                                autoComplete={field.autoComplete}
                                dir={field.dir || (field.type === 'date' ? 'ltr' : undefined)}
                                max={field.type === 'date' ? today || undefined : undefined}
                                min={field.type === 'date' ? MIN_BIRTHDAY : undefined}
                                className="min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-muted"
                                placeholder={field.placeholder}
                                value={form[field.key]}
                                onChange={set(field.key)}
                            />
                        </label>
                    ))}

                    <label className="flex items-center gap-3 rounded-xl border border-border bg-background-light px-4 py-3.5 focus-within:border-primary">
                        <Icon name="lock-closed-outline" size={20} className="text-muted" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-muted"
                            placeholder="كلمة المرور (٦ أحرف على الأقل)"
                            value={form.password}
                            onChange={set('password')}
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

                <Button type="submit" title="إنشاء حساب" loading={isLoading} size="large" className="mb-5" />

                <p className="text-center text-sm text-muted">
                    لديك حساب بالفعل؟{' '}
                    <Link href="/login" className="font-bold text-primary">
                        تسجيل الدخول
                    </Link>
                </p>
            </form>
        </main>
    );
}
