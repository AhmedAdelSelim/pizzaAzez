const PIZZA_IMAGE = "https://res.cloudinary.com/dtjkwjveo/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1772849126/Azez/WhatsApp_Image_2026-02-24_at_4.33.01_PM_7_amolhh.jpg";
const FEETEER_IMAGE = "https://res.cloudinary.com/dtjkwjveo/image/upload/v1772849122/Azez/WhatsApp_Image_2026-02-24_at_4.24.39_PM_1_uhwrp5.jpg";

async function migrate() {
    try {
        const connectDB = require('./src/config/db');
        const getDb = connectDB.getDb;
        connectDB();
        const db = getDb();

        console.log('Updating Pizzas (Category 6)...');
        const { error: pizzaError } = await db
            .from('menu_items')
            .update({ image: PIZZA_IMAGE })
            .eq('category_id', '6');
        
        if (pizzaError) throw pizzaError;
        console.log('Pizzas updated.');

        console.log('Updating Feteer (Categories 7 & 8)...');
        const { error: feteerError } = await db
            .from('menu_items')
            .update({ image: FEETEER_IMAGE })
            .in('category_id', ['7', '8']);
        
        if (feteerError) throw feteerError;
        console.log('Feteer updated.');

        console.log('Updating Category images...');
        await db.from('categories').update({ image: PIZZA_IMAGE }).eq('id', '6');
        await db.from('categories').update({ image: FEETEER_IMAGE }).in('id', ['7', '8']);
        console.log('Categories updated.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
