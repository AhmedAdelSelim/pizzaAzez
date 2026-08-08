'use client';

import { useParams } from 'next/navigation';
import MenuItemForm from '@/components/admin/MenuItemForm';

export default function AdminMenuEditPage() {
    const { id } = useParams();
    return <MenuItemForm itemId={id} />;
}
