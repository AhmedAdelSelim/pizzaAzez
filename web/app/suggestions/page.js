'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import api from '@/lib/api';

export default function SuggestionsPage() {
    const router = useRouter();
    const { token } = useAuth();
    const { alert } = useUI();
    const [suggestion, setSuggestion] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isSubmitted) return;
        const timer = setTimeout(() => router.back(), 2500);
        return () => clearTimeout(timer);
    }, [isSubmitted, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!suggestion.trim()) return;

        setLoading(true);
        try {
            await api.submitSuggestion(suggestion, token);
            setIsSubmitted(true);
        } catch (error) {
            alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <main className="grid flex-1 place-items-center px-10 text-center">
                <div className="animate-rise">
                    <Icon name="checkmark-circle" size={100} className="mx-auto mb-5 text-primary" />
                    <h1 className="mb-3 text-2xl font-bold text-text">شكراً لك!</h1>
                    <p className="text-sm leading-6 text-muted">
                        تم استلام اقتراحك بنجاح. نحن نهتم دائماً برأيك لتطوير خدماتنا.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader title="اقتراحاتكم" />

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
                    <Icon name="bulb-outline" size={24} className="mt-0.5 text-primary" />
                    <p className="text-sm leading-6 text-text">
                        رأيك يهمنا! شاركنا أفكارك لتطوير تطبيق بيتزا عزيز أو اترك لنا ملاحظاتك حول
                        تجربتك.
                    </p>
                </div>

                <div>
                    <label htmlFor="suggestion" className="mb-2 block text-sm font-semibold text-text">
                        اكتب اقتراحك هنا
                    </label>
                    <textarea
                        id="suggestion"
                        className="az-input min-h-52 resize-y"
                        placeholder="مثلاً: إضافة قسم جديد، تحسين سرعة التوصيل..."
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                    />
                </div>

                <Button
                    type="submit"
                    title="إرسال الاقتراح"
                    loading={loading}
                    disabled={!suggestion.trim()}
                    size="large"
                />
            </form>
        </main>
    );
}
