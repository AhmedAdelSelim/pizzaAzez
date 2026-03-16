const { orderService } = require('./src/services');
const connectDB = require('./src/config/db');

async function checkOrders() {
    try {
        connectDB();
        const orders = await orderService.getOrders();
        console.log('Total Orders:', orders.length);
        orders.forEach(o => {
            console.log(`Order ID: ${o.id}, Total: ${o.total}, Delivery: ${o.delivery_fee}, Discount: ${o.discount}, Status: ${o.status}`);
            console.log('Items Summary:', o.items.map(i => `${i.quantity}x ${i.name} (${i.price})`).join(', '));
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkOrders();
