'use client';

import { useCallback, useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';
import { cx, storyCount } from '@/lib/utils';

export default function AdminUsersPage() {
    const { token } = useAuth();
    const { alert, choose, confirm, toast } = useUI();
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = useCallback(() => api.getAdminUsers(token), [token]);
    const {
        data: users,
        loading,
        reload: loadUsers,
    } = useApiResource(fetchUsers, {
        enabled: Boolean(token),
        initialData: [],
        onError: (error) => alert('خطأ', error.message),
    });

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        const q = searchQuery.toLowerCase();
        return users.filter(
            (user) => user.name?.toLowerCase().includes(q) || user.phone?.includes(searchQuery)
        );
    }, [users, searchQuery]);

    const toggleUserStatus = async (user) => {
        const isActive = user.is_active !== false;
        const actionText = isActive ? 'تعطيل' : 'تفعيل';

        const ok = await confirm(
            `تأكيد ال${actionText}`,
            `هل أنت متأكد من ${actionText} هذا الحساب؟`,
            { confirmText: 'تأكيد', destructive: isActive }
        );
        if (!ok) return;

        try {
            await api.updateUserStatus(user.id, !isActive, token);
            toast(`تم ${actionText} الحساب بنجاح`, 'success');
            loadUsers();
        } catch (error) {
            alert('خطأ', error.message);
        }
    };

    const toggleVipStatus = async (user) => {
        const isVip = user.vip_status === 'vip';
        const ok = await confirm(
            isVip ? 'إلغاء VIP' : 'تفعيل VIP',
            isVip
                ? 'هل تريد إلغاء عضوية VIP لهذا المستخدم؟'
                : 'هل تريد تفعيل عضوية VIP لهذا المستخدم؟',
            { confirmText: 'تأكيد', destructive: isVip }
        );
        if (!ok) return;

        try {
            await api.handleVipRequest(user.id, isVip ? 'none' : 'vip', token);
            loadUsers();
        } catch (error) {
            alert('خطأ', error.message);
        }
    };

    // For a VIP who has used up the month and phoned in for more.
    const grantStoryCredits = async (user) => {
        const quota = user.story_quota;
        const amount = await choose(
            'قصص إضافية',
            `${user.name || user.phone} — استخدم ${quota?.used ?? 0} من ${quota?.limit ?? 10} قصص هذا الشهر.`,
            [
                { label: `+${storyCount(5)}`, value: 5 },
                { label: `+${storyCount(10)}`, value: 10 },
                { label: `+${storyCount(20)}`, value: 20 },
            ]
        );
        if (!amount) return;

        try {
            await api.grantStoryCredits(user.id, amount, token);
            toast(`تم منح ${storyCount(amount)} إضافية`, 'success');
            loadUsers();
        } catch (error) {
            alert('خطأ', error.message);
        }
    };

    return (
        <main className="flex flex-1 flex-col">
            <PageHeader title="إدارة العملاء" backHref="/admin" />

            <div className="p-5 pb-3">
                <SearchBar
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
            </div>

            {loading ? (
                <div className="grid flex-1 place-items-center text-primary">
                    <Spinner size={36} />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted">
                    <Icon name="people-outline" size={64} />
                    <p className="text-sm">لم يتم العثور على مستخدمين</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-5 pt-2">
                    {filteredUsers.map((user) => {
                        const isActive = user.is_active !== false;
                        const isVip = user.vip_status === 'vip';
                        const isPending = user.vip_status === 'pending';

                        return (
                            <article
                                key={user.id}
                                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-bold text-text">
                                            {user.name || 'بدون اسم'}
                                        </p>
                                        {isVip && (
                                            <span
                                                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                                                style={{ background: 'linear-gradient(to left, #FFD700, #FFA000)' }}
                                            >
                                                <Icon name="star" size={10} />
                                                VIP
                                            </span>
                                        )}
                                        {isPending && (
                                            <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning">
                                                معلق
                                            </span>
                                        )}
                                        {!isActive && (
                                            <span className="rounded-full bg-error/20 px-2 py-0.5 text-[10px] font-bold text-error">
                                                معطل
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted" dir="ltr">
                                        {user.phone}
                                    </p>
                                    <p className="text-[11px] text-muted">
                                        {user.role === 'admin' ? 'مدير' : 'عميل'}
                                    </p>
                                    {isVip && user.story_quota && (
                                        <p className="mt-0.5 text-[11px] text-star">
                                            القصص: {user.story_quota.used}/{user.story_quota.limit}
                                            {user.story_quota.bonus > 0 &&
                                                ` (+${user.story_quota.bonus} إضافية)`}
                                            {user.vip_expires_at &&
                                                ` • ينتهي ${new Date(
                                                    user.vip_expires_at
                                                ).toLocaleDateString('ar-EG')}`}
                                        </p>
                                    )}
                                </div>

                                {user.role !== 'admin' && (
                                    <div className="flex shrink-0 flex-wrap gap-2">
                                        {isVip && (
                                            <button
                                                type="button"
                                                onClick={() => grantStoryCredits(user)}
                                                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-[11px] font-semibold text-white transition hover:brightness-110"
                                            >
                                                <Icon name="add-circle-outline" size={13} />
                                                قصص إضافية
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => toggleVipStatus(user)}
                                            className={cx(
                                                'flex items-center gap-1 rounded-lg px-3 py-2 text-[11px] font-semibold text-white transition hover:brightness-110',
                                                isVip ? 'bg-muted' : 'bg-star/80'
                                            )}
                                        >
                                            <Icon name={isVip ? 'star' : 'star-outline'} size={13} />
                                            {isVip ? 'إلغاء VIP' : 'VIP'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleUserStatus(user)}
                                            className={cx(
                                                'flex items-center gap-1 rounded-lg px-3 py-2 text-[11px] font-semibold text-white transition hover:brightness-110',
                                                isActive ? 'bg-error' : 'bg-accent'
                                            )}
                                        >
                                            <Icon
                                                name={isActive ? 'ban-outline' : 'checkmark-circle-outline'}
                                                size={13}
                                            />
                                            {isActive ? 'تعطيل' : 'تفعيل'}
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
