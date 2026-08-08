/**
 * The order lifecycle, in order.
 *
 * Mirrors the STATUSES list the web app's OrderJourneyTracker renders — the
 * keys must stay in sync or the tracker silently falls back to step one.
 */
const ORDER_STATUS = {
    RECEIVED: 'pending',    // تم الاستلام — where every new order starts
    PREPARING: 'preparing', // التحضير
    BAKING: 'baking',       // في الفرن
    SHIPPING: 'shipping',   // التوصيل
    DELIVERED: 'delivered', // وصلنا!
    CANCELLED: 'cancelled',
};

/** Forward progression an admin may move an order through. */
const ORDER_FLOW = [
    ORDER_STATUS.RECEIVED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.BAKING,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.DELIVERED,
];

const ALL_STATUSES = [...ORDER_FLOW, ORDER_STATUS.CANCELLED];

/**
 * An order is "in progress" from the moment the kitchen starts on it.
 * Only a not-yet-started order can be withdrawn.
 */
const isCancellable = (status) => status === ORDER_STATUS.RECEIVED;

const isValidStatus = (status) => ALL_STATUSES.includes(status);

module.exports = { ORDER_STATUS, ORDER_FLOW, ALL_STATUSES, isCancellable, isValidStatus };
