import Icon from './Icon';

export default function EmptyState({
    icon = 'cart-outline',
    title = 'لا يوجد شيء هنا',
    message = 'ستظهر العناصر هنا.',
    action,
}) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center px-10 py-16 text-center">
            <div className="relative mb-6 grid size-30 place-items-center">
                <span className="absolute size-[110px] rounded-full border-2 border-primary animate-empty-pulse" />
                <span className="grid size-[90px] place-items-center rounded-full border-[1.5px] border-primary/30 bg-surface">
                    <Icon name={icon} size={46} className="text-primary" />
                </span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-text">{title}</h2>
            <p className="max-w-sm text-sm leading-6 text-muted">{message}</p>
            {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
        </div>
    );
}
