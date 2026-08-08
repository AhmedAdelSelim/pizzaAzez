const { userRepository } = require('../repositories');

/**
 * Orders store only `user_id`, but the admin list and the printed kitchen
 * ticket both need a name to call the customer by. These resolve it and expose
 * it as `customer_name`.
 *
 * A guest order, or one whose account has since been deleted, gets null — call
 * sites fall back to the phone number rather than showing an empty line.
 */

/** One order → the same order with `customer_name` attached. */
async function attachCustomerName(order) {
    if (!order?.user_id) return order ? { ...order, customer_name: null } : order;
    const user = await userRepository.findOne({ id: order.user_id });
    return { ...order, customer_name: user?.name || null };
}

/** Many orders, resolved in a single extra query rather than one per order. */
async function attachCustomerNames(orders) {
    if (!Array.isArray(orders) || orders.length === 0) return orders;

    const users = await userRepository.findIn(
        'id',
        orders.map(order => order.user_id).filter(Boolean)
    );
    const nameById = new Map(users.map(user => [user.id, user.name]));

    return orders.map(order => ({
        ...order,
        customer_name: (order.user_id && nameById.get(order.user_id)) || null,
    }));
}

module.exports = { attachCustomerName, attachCustomerNames };
