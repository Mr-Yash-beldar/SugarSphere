import mongoose from 'mongoose';
import { config } from '../config';
import { User, Sweet } from '../models';

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Sweet.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user (password will be hashed by the pre-save hook)
    const admin = await User.create({
      name: 'Yash Admin',
      email: 'yash@sugarsphere.com',
      passwordHash: 'yash123',
      role: 'admin',
      isVerified: true,
    });
    console.log('Created admin user:', admin.email);

    // Create 20 sweets
    const sweets = [
      {
        name: 'Dark Chocolate Bar',
        category: 'chocolates',
        description: 'Rich and smooth dark chocolate with 70% cocoa content. Perfect for chocolate lovers who prefer less sweetness.',
        price: 299,
        quantity: 50,
        imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500',
        isActive: true,
      },
      {
        name: 'Milk Chocolate Truffles',
        category: 'chocolates',
        description: 'Creamy milk chocolate truffles with a silky smooth center. Handcrafted with premium Belgian chocolate.',
        price: 399,
        quantity: 40,
        imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500',
        isActive: true,
      },
      {
        name: 'Rainbow Lollipops',
        category: 'candies',
        description: 'Colorful spiral lollipops in assorted fruit flavors. Fun treats for kids and adults alike.',
        price: 49,
        quantity: 100,
        imageUrl: 'https://images.unsplash.com/photo-1581798459219-c0f6b90d8e8e?w=500',
        isActive: true,
      },
      {
        name: 'Gummy Bears',
        category: 'candies',
        description: 'Soft and chewy gummy bears in five delicious flavors: strawberry, lemon, orange, grape, and lime.',
        price: 149,
        quantity: 75,
        imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500',
        isActive: true,
      },
      {
        name: 'Chocolate Chip Cookies',
        category: 'cookies',
        description: 'Classic chocolate chip cookies baked fresh daily with premium chocolate chunks.',
        price: 199,
        quantity: 60,
        imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500',
        isActive: true,
      },
      {
        name: 'Oatmeal Raisin Cookies',
        category: 'cookies',
        description: 'Wholesome oatmeal cookies loaded with plump raisins and a hint of cinnamon.',
        price: 179,
        quantity: 55,
        imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500',
        isActive: true,
      },
      {
        name: 'Chocolate Fudge Cake',
        category: 'cakes',
        description: 'Decadent three-layer chocolate cake with rich fudge frosting. Perfect for celebrations.',
        price: 899,
        quantity: 15,
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
        isActive: true,
      },
      {
        name: 'Vanilla Sponge Cake',
        category: 'cakes',
        description: 'Light and fluffy vanilla sponge cake with fresh cream frosting and berry toppings.',
        price: 799,
        quantity: 20,
        imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e5b80d90?w=500',
        isActive: true,
      },
      {
        name: 'Strawberry Cream Pastry',
        category: 'pastries',
        description: 'Delicate puff pastry filled with fresh strawberries and whipped cream.',
        price: 149,
        quantity: 45,
        imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500',
        isActive: true,
      },
      {
        name: 'Chocolate Éclair',
        category: 'pastries',
        description: 'French-style éclair with chocolate glaze and creamy custard filling.',
        price: 129,
        quantity: 50,
        imageUrl: 'https://images.unsplash.com/photo-1612201142855-80feaa4b1b24?w=500',
        isActive: true,
      },
      {
        name: 'Gulab Jamun',
        category: 'indian',
        description: 'Traditional Indian sweet made from milk solids, deep-fried and soaked in sugar syrup.',
        price: 89,
        quantity: 80,
        imageUrl: 'https://images.unsplash.com/photo-1589217157232-464b505b197f?w=500',
        isActive: true,
      },
      {
        name: 'Rasgulla',
        category: 'indian',
        description: 'Soft and spongy cottage cheese balls soaked in light sugar syrup. A Bengali delicacy.',
        price: 99,
        quantity: 70,
        imageUrl: 'https://images.unsplash.com/photo-1606393994085-09d4c7b1e5e2?w=500',
        isActive: true,
      },
      {
        name: 'Jalebi',
        category: 'indian',
        description: 'Crispy spiral-shaped sweet soaked in sugar syrup. Best served warm.',
        price: 79,
        quantity: 90,
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500',
        isActive: true,
      },
      {
        name: 'Kaju Katli',
        category: 'indian',
        description: 'Premium cashew fudge with a thin edible silver coating. A festival favorite.',
        price: 599,
        quantity: 35,
        imageUrl: 'https://images.unsplash.com/photo-1626020805527-c52cb1fd2d5e?w=500',
        isActive: true,
      },
      {
        name: 'White Chocolate Bark',
        category: 'chocolates',
        description: 'Creamy white chocolate bark topped with dried cranberries and pistachios.',
        price: 349,
        quantity: 45,
        imageUrl: 'https://images.unsplash.com/photo-1606312619070-d48b4cff2e0f?w=500',
        isActive: true,
      },
      {
        name: 'Caramel Popcorn',
        category: 'candies',
        description: 'Crunchy popcorn coated with buttery caramel. Sweet and addictive snack.',
        price: 129,
        quantity: 65,
        imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500',
        isActive: true,
      },
      {
        name: 'Macarons Assorted',
        category: 'cookies',
        description: 'French macarons in assorted flavors: vanilla, chocolate, raspberry, pistachio, and lemon.',
        price: 499,
        quantity: 30,
        imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500',
        isActive: true,
      },
      {
        name: 'Red Velvet Cupcakes',
        category: 'cakes',
        description: 'Moist red velvet cupcakes topped with cream cheese frosting.',
        price: 249,
        quantity: 40,
        imageUrl: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500',
        isActive: true,
      },
      {
        name: 'Butterscotch Toffee',
        category: 'candies',
        description: 'Rich butterscotch toffee with a perfect balance of sweet and buttery flavors.',
        price: 99,
        quantity: 85,
        imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500',
        isActive: true,
      },
      {
        name: 'Barfi Mixed Box',
        category: 'indian',
        description: 'Assorted Indian barfi in various flavors: coconut, pistachio, almond, and rose.',
        price: 449,
        quantity: 40,
        imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500',
        isActive: true,
      },
    ];

    await Sweet.insertMany(sweets);
    console.log(`Created ${sweets.length} sweets`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: yash@sugarsphere.com');
    console.log('Password: yash123');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedData();
