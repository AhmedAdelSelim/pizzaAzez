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
 * Customers cannot cancel. Not at any status, not within any window.
 *
 * Kept as a function rather than deleting the endpoint, deliberately: the React
 * Native app already installed on phones will keep calling it, and a clear
 * refusal in Arabic is friendlier than the 404 it would get from a removed
 * route. Both clients have had the button taken away.
 *
 * This does not touch the admin path — adminService.updateOrderStatus can still
 * move an order to `cancelled`, which is how a rejection is recorded.
 */
const isCancellable = () => false;

const isValidStatus = (status) => ALL_STATUSES.includes(status);

module.exports = { ORDER_STATUS, ORDER_FLOW, ALL_STATUSES, isCancellable, isValidStatus };
