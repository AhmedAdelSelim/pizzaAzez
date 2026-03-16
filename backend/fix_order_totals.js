const { orderService } = require('./src/services');
const { orderRepository } = require('./src/repositories');
const connectDB = require('./src/config/db');

async function fixOrderTotals() {
    try {
        connectDB();
        const orders = await orderService.getOrders();
        console.log(`Found ${orders.length} orders to check.`);

        let updatedCount = 0;
        for (const order of orders) {
            if (order.total === null || order.total === 0) {
                console.log(`Fixing order ${order.id}...`);
                
                // Recalculate total
                // items total + delivery_fee - discount
                const itemsTotal = (order.items || []).reduce((sum, item) => {
                    const price = parseFloat(item.price) || 0;
                    const qty = parseInt(item.quantity) || 1;
                    return sum + (price * qty);
                }, 0);

                const deliveryFee = parseFloat(order.delivery_fee) || 0;
                const discount = parseFloat(order.discount) || 0;
                const calculatedTotal = itemsTotal + deliveryFee - discount;

                console.log(`- Items Total: ${itemsTotal}`);
                console.log(`- Delivery Fee: ${deliveryFee}`);
                console.log(`- Discount: ${discount}`);
                console.log(`- Calculated Total: ${calculatedTotal}`);

                await orderRepository.update({ id: order.id }, { total: calculatedTotal });
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} orders.`);
        process.exit(0);
    } catch (error) {
        console.error('Error fixing order totals:', error);
        process.exit(1);
    }
}

fixOrderTotals();
