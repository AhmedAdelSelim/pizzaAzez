import Icon from './Icon';

export default function ReviewItem({ review }) {
    const name = review.userName || review.user_name || 'مستخدم';

    return (
        <div className="mb-3 rounded-xl border border-border bg-surface p-3">
            <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-full bg-surface-light text-base font-bold text-primary">
                        {name.charAt(0)}
                    </span>
                    <div>
                        <p className="text-xs font-semibold text-text">{name}</p>
                        <p className="text-[10px] text-muted">{review.date || review.created_at}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-star/10 px-2 py-1">
                    <Icon name="star" size={14} className="text-star" />
                    <span className="text-xs font-bold text-star">{review.rating}</span>
                </div>
            </div>
            <p className="text-xs leading-5 text-text">{review.comment}</p>
        </div>
    );
}
