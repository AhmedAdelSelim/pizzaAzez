'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useClientSnapshot } from '@/lib/localStore';
import { uploadProfileImage } from '@/lib/supabaseStorage';
import { MIN_BIRTHDAY, todayISO } from '@/lib/utils';

export default function EditProfilePage() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();
    const { alert, toast } = useUI();
    const fileInput = useRef(null);
    const today = useClientSnapshot(todayISO, '');

    // AppShell holds rendering until auth is restored, so `user` is ready here.
    const [name, setName] = useState(user?.name || '');
    const [address, setAddress] = useState(user?.address || '');
    const [birthday, setBirthday] = useState(user?.birthday || '');
    const [imageUrl, setImageUrl] = useState(user?.image || null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handlePickImage = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        const preview = URL.createObjectURL(file);
        setImageUrl(preview);
        setIsUploading(true);
        try {
            const publicUrl = await uploadProfileImage(user.id, file, user?.image);
            setImageUrl(publicUrl);
            await updateProfile({ image: publicUrl });
            toast('تم تحديث الصورة بنجاح', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            alert('خطأ', 'فشل رفع الصورة. حاول مرة أخرى.');
            setImageUrl(user?.image || null);
        } finally {
            URL.revokeObjectURL(preview);
            setIsUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('خطأ', 'يرجى إدخال الاسم');
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile({
                name: name.trim(),
                address: address.trim() || null,
                birthday: birthday.trim() || null,
            });
            toast('تم تحديث البيانات بنجاح', 'success');
            router.back();
        } catch {
            alert('خطأ', 'حدث خطأ أثناء التحديث');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader title="تعديل الملف الشخصي" />

            <form onSubmit={handleSave} className="flex flex-col gap-6 p-6">
                <div className="flex flex-col items-center">
                    <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="relative"
                        aria-label="تغيير الصورة"
                    >
                        <span className="grid size-28 place-items-center overflow-hidden rounded-full bg-surface-light">
                            {imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imageUrl} alt="" className="size-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-primary">
                                    {name.charAt(0).toUpperCase() || '؟'}
                                </span>
                            )}
                        </span>

                        {isUploading ? (
                            <span className="absolute inset-0 grid place-items-center rounded-full bg-black/60 text-white">
                                <Spinner size={28} />
                            </span>
                        ) : (
                            <span className="absolute bottom-0 end-0 grid size-9 place-items-center rounded-full border-2 border-background bg-primary">
                                <Icon name="camera" size={18} className="text-white" />
                            </span>
                        )}
                    </button>

                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePickImage}
                    />

                    <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="mt-3 text-sm font-semibold text-primary"
                    >
                        تغيير الصورة
                    </button>
                </div>

                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text">الاسم الكامل</span>
                    <input
                        className="az-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="أدخل اسمك"
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text">رقم الهاتف</span>
                    <input className="az-input" value={user?.phone || ''} disabled readOnly dir="ltr" />
                </label>

                {/* Checkout prefills its address box from here, and until now this
                    was the one field a customer could never change after signing up.
                    `id` is the anchor the "عناوين التوصيل" menu item scrolls to. */}
                <label className="block" id="address">
                    <span className="mb-2 block text-sm font-semibold text-text">
                        عنوان التوصيل
                    </span>
                    <textarea
                        className="az-input min-h-24 resize-y"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="مثال: الزرقا - شارع البحر - عمارة ٧ - الدور الثالث"
                    />
                    <span className="mt-1 block text-[11px] text-muted">
                        يظهر تلقائياً عند إتمام الطلب، ويمكنك تعديله وقتها.
                    </span>
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text">
                        تاريخ الميلاد (اختياري)
                    </span>
                    <input
                        type="date"
                        dir="ltr"
                        className="az-input"
                        value={birthday}
                        min={MIN_BIRTHDAY}
                        max={today || undefined}
                        onChange={(e) => setBirthday(e.target.value)}
                    />
                </label>

                <Button type="submit" title="حفظ التغييرات" loading={isSaving} size="large" />
            </form>
        </main>
    );
}
