'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import api from '@/lib/api';
import { uploadStoryImage } from '@/lib/supabaseStorage';
import { cx } from '@/lib/utils';

export default function AdminStoryFormPage() {
    const router = useRouter();
    const { token } = useAuth();
    const { alert, toast } = useUI();
    const fileInput = useRef(null);

    const [title, setTitle] = useState('');
    // The object URL is created when a file is picked and revoked on replace.
    const [{ file, preview }, setPicked] = useState({ file: null, preview: '' });
    const [active, setActive] = useState(true);
    const [loading, setLoading] = useState(false);

    const pickFile = (picked) =>
        setPicked((prev) => {
            if (prev.preview) URL.revokeObjectURL(prev.preview);
            return { file: picked, preview: URL.createObjectURL(picked) };
        });

    const handleSave = async () => {
        if (!title || !file) {
            alert('خطأ', 'يرجى إدخال عنوان وصورة للقصة');
            return;
        }

        try {
            setLoading(true);
            // Upload to Supabase Storage first so every client can load it
            const publicUrl = await uploadStoryImage('admin', file);
            await api.addStoryAdmin({ title, image: publicUrl, active }, token);
            toast('تم إضافة القصة بنجاح!', 'success');
            router.push('/admin/stories');
        } catch (error) {
            alert('خطأ', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader title="إضافة قصة جديدة" backHref="/admin/stories" />

            <div className="flex flex-1 flex-col gap-5 p-5">
                <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const picked = e.target.files?.[0];
                        e.target.value = '';
                        if (picked) pickFile(picked);
                    }}
                />

                <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="mx-auto grid aspect-[9/16] w-full max-w-56 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 transition hover:bg-primary/10"
                >
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="معاينة" className="size-full object-cover" />
                    ) : (
                        <span className="flex flex-col items-center gap-3">
                            <Icon name="camera" size={40} className="text-primary" />
                            <span className="text-sm text-muted">اختر صورة طولية للقصة</span>
                        </span>
                    )}
                </button>

                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text">عنوان القصة</span>
                    <input
                        className="az-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="أدخل عنواناً قصيراً للقصة"
                    />
                </label>

                <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                    <div>
                        <p className="text-sm font-semibold text-text">حالة القصة (نشطة)</p>
                        <p className="text-[11px] text-muted">القصة ستظهر للعملاء إذا كانت نشطة</p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={active}
                        onClick={() => setActive((v) => !v)}
                        className={cx(
                            'relative h-7 w-12 rounded-full transition',
                            active ? 'bg-primary' : 'bg-border'
                        )}
                    >
                        <span
                            className={cx(
                                'absolute top-1 size-5 rounded-full bg-white transition-all',
                                active ? 'start-6' : 'start-1'
                            )}
                        />
                    </button>
                </div>

                <div className="mt-auto">
                    <Button
                        title="حفظ القصة"
                        onClick={handleSave}
                        loading={loading}
                        size="large"
                        icon={<Icon name="checkmark-circle-outline" size={22} />}
                    />
                </div>
            </div>
        </main>
    );
}
