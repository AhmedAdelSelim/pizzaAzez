const BaseRepository = require('./BaseRepository');

const userRepository = new BaseRepository('users');
const categoryRepository = new BaseRepository('categories');
const menuItemRepository = new BaseRepository('menu_items');
const orderRepository = new BaseRepository('orders');
const deliveryZoneRepository = new BaseRepository('delivery_zones');
const storyRepository = new BaseRepository('stories');
const couponRepository = new BaseRepository('coupons');

module.exports = {
    userRepository,
    categoryRepository,
    menuItemRepository,
    orderRepository,
    deliveryZoneRepository,
    storyRepository,
    couponRepository,
    suggestionRepository: require('./suggestionRepository'),
};
