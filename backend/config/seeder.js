const User = require('../models/User');
const Product = require('../models/Product');

const seedData = async () => {
  try {
    // Check if seller already exists
    let seller = await User.findOne({ email: 'seller@shopez.com' });

    if (!seller) {
      seller = await User.create({
        name: 'ShopEZ Official Store',
        email: 'seller@shopez.com',
        password: 'password123', // Will be encrypted by pre-save hook
        role: 'SELLER',
        balance: 10000.0
      });
      console.log('Seeded default seller user: seller@shopez.com / password123');
    }

    // Check if products exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const defaultProducts = [
        {
          name: 'Noise-Cancelling Wireless Headphones',
          description: 'Experience pure sound with industry-leading active noise-cancelling technology, 30-hour battery life, and custom-tuned 40mm drivers for rich bass and crystal-clear highs.',
          price: 199.99,
          discount: 15,
          category: 'Electronics',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
          stock: 12,
          ratings: { average: 4.8, count: 5 },
          seller: seller._id,
          reviews: [
            { username: 'Alice', rating: 5, comment: 'Absolutely amazing sound isolation and comfortable fit!' },
            { username: 'Bob', rating: 4, comment: 'Great sound quality, though the app setup was a bit slow.' },
            { username: 'Charlie', rating: 5, comment: 'Best headphones I have ever owned. Battery lasts forever!' }
          ]
        },
        {
          name: 'Minimalist Leather Backpack',
          description: 'Handcrafted from premium full-grain water-resistant leather, this sleek backpack features a padded 15-inch laptop compartment, hidden security pockets, and ergonomic shoulder straps.',
          price: 110.00,
          discount: 0,
          category: 'Fashion',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
          stock: 18,
          ratings: { average: 4.5, count: 3 },
          seller: seller._id,
          reviews: [
            { username: 'Diana', rating: 5, comment: 'Stunning leather quality. Fits all my work essentials.' },
            { username: 'Ethan', rating: 4, comment: 'Very stylish, but a bit heavier than standard fabric bags.' }
          ]
        },
        {
          name: 'Vibrant Active Smartwatch',
          description: 'Track your daily activity, monitor heart rate 24/7, analyze sleep stages, and receive calls/notifications with a vibrant AMOLED always-on display and up to 7 days of battery life.',
          price: 149.99,
          discount: 10,
          category: 'Electronics',
          image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
          stock: 15,
          ratings: { average: 4.3, count: 4 },
          seller: seller._id,
          reviews: [
            { username: 'Fiona', rating: 5, comment: 'Love the heart rate tracker accuracy and screen brightness.' },
            { username: 'George', rating: 4, comment: 'Battery life is closer to 5 days with active GPS, but still amazing.' }
          ]
        },
        {
          name: 'Ceramic Coffee Dripper Set',
          description: 'Elevate your morning ritual. Includes a premium double-walled insulated ceramic pour-over dripper, a 600ml heat-resistant glass carafe, and a solid wood serving tray.',
          price: 45.00,
          discount: 5,
          category: 'Home',
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
          stock: 25,
          ratings: { average: 4.9, count: 3 },
          seller: seller._id,
          reviews: [
            { username: 'Helen', rating: 5, comment: 'Makes the cleanest cup of coffee! The wood tray is beautiful.' },
            { username: 'Ian', rating: 5, comment: 'Excellent heat retention, beautiful aesthetic in the kitchen.' }
          ]
        },
        {
          name: 'Ergonomic Mesh Office Chair',
          description: 'Engineered for comfort during long working hours. Features a high-back breathable mesh design, dynamic lumbar support, 3D adjustable armrests, and a tilt-lock mechanism.',
          price: 280.00,
          discount: 20,
          category: 'Home',
          image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80',
          stock: 8,
          ratings: { average: 4.6, count: 5 },
          seller: seller._id,
          reviews: [
            { username: 'Julia', rating: 5, comment: 'Saved my back! Highly adjustable and very sturdy.' },
            { username: 'Kevin', rating: 4, comment: 'Great quality mesh, assembly took about 30 minutes.' }
          ]
        },
        {
          name: 'Retro Canvas Comfort Sneakers',
          description: 'A timeless silhouette updated with modern memory foam insoles, breathable double-stitched cotton canvas, and durable vulcanized rubber waffle outsoles.',
          price: 59.99,
          discount: 0,
          category: 'Fashion',
          image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80',
          stock: 30,
          ratings: { average: 4.1, count: 3 },
          seller: seller._id,
          reviews: [
            { username: 'Laura', rating: 4, comment: 'Super comfy for walking all day, fits true to size.' },
            { username: 'Mike', rating: 4, comment: 'Classic look, goes with everything. A bit narrow at first.' }
          ]
        }
      ];

      await Product.insertMany(defaultProducts);
      console.log('Seeded default e-commerce products catalog');
    }
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

module.exports = seedData;
