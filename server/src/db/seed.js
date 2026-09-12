import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import FoodItem from '../models/FoodItem.js';
import Table from '../models/Table.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Keep customer accounts.
    // Recreate only admin, categories, food items and tables.
    await User.deleteMany({ role: 'admin' });
    await Category.deleteMany();
    await FoodItem.deleteMany();
    await Table.deleteMany();

    const seedPassword =
      process.env.SEED_ADMIN_PASSWORD ||
      Math.random().toString(36).slice(-12);

    await User.create({
      name: 'Restaurant Admin',
      email: 'admin@example.com',
      password: seedPassword,
      role: 'admin',
    });

    console.log('Seed admin password:', seedPassword);

    // ---------------------------------------------------------
    // CATEGORIES
    // ---------------------------------------------------------

    const categories = await Category.insertMany([
      {
        name: 'Starters',
        description: 'Crispy, grilled and flavourful bites to begin your meal',
      },
      {
        name: 'Main Course',
        description: 'Rich curries, breads and satisfying restaurant favourites',
      },
      {
        name: 'Rice & Biryani',
        description: 'Aromatic rice dishes and flavour-packed biryanis',
      },
      {
        name: 'Fast Food',
        description: 'Comfort food, wraps, sandwiches and loaded favourites',
      },
      {
        name: 'Desserts',
        description: 'Sweet treats to finish your meal on a delicious note',
      },
      {
        name: 'Beverages',
        description: 'Refreshing drinks, coolers and classic Indian favourites',
      },
    ]);

    const categoryMap = categories.reduce((acc, category) => {
      acc[category.name] = category._id;
      return acc;
    }, {});

    // ---------------------------------------------------------
    // FOOD ITEMS
    // ---------------------------------------------------------

    const foodItems = [
      // =======================================================
      // STARTERS
      // =======================================================

      {
        name: 'Paneer Tikka',
        description:
          'Char-grilled cottage cheese marinated in creamy yogurt and aromatic spices.',
        ingredients: 'Paneer, yogurt, bell pepper, onion, spices',
        price: 260,
        image: '/images/menu/paneer-tikka.jpg',
        category: categoryMap['Starters'],
        preparationTime: 15,
        spiceLevel: 'Medium',
        rating: 4.7,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 30,
        isSpecial: true,
        isRecommended: true,
        popularity: 95,
      },

      {
        name: 'Chicken Tikka',
        description:
          'Tender chicken pieces marinated with yogurt and tandoori spices, then grilled to perfection.',
        ingredients: 'Chicken, yogurt, ginger, garlic, tandoori spices',
        price: 320,
        image: '/images/menu/chicken-tikka.jpg',
        category: categoryMap['Starters'],
        preparationTime: 20,
        spiceLevel: 'Medium',
        rating: 4.8,
        isVeg: false,
        isAvailable: true,
        stockQuantity: 25,
        isSpecial: true,
        isRecommended: true,
        popularity: 98,
      },

      {
        name: 'Hara Bhara Kebab',
        description:
          'Crispy green vegetable kebabs packed with spinach, peas and mild spices.',
        ingredients: 'Spinach, green peas, potato, coriander, spices',
        price: 220,
        image: '/images/menu/hara-bhara-kebab.jpg',
        category: categoryMap['Starters'],
        preparationTime: 15,
        spiceLevel: 'Mild',
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 24,
        isSpecial: false,
        isRecommended: true,
        popularity: 72,
      },

      {
        name: 'Veg Manchurian',
        description:
          'Crispy vegetable balls tossed in a glossy Indo-Chinese Manchurian sauce.',
        ingredients: 'Cabbage, carrot, capsicum, spring onion, sauces',
        price: 210,
        image: '/images/menu/veg-manchurian.jpg',
        category: categoryMap['Starters'],
        preparationTime: 15,
        spiceLevel: 'Medium',
        rating: 4.4,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 28,
        isSpecial: false,
        isRecommended: false,
        popularity: 68,
      },

      {
        name: 'Chicken 65',
        description:
          'Crispy fried chicken tossed with curry leaves, green chilli and South Indian spices.',
        ingredients: 'Chicken, corn flour, curry leaves, chilli, spices',
        price: 290,
        image: '/images/menu/chicken-65.jpg',
        category: categoryMap['Starters'],
        preparationTime: 18,
        spiceLevel: 'Spicy',
        rating: 4.7,
        isVeg: false,
        isAvailable: true,
        stockQuantity: 25,
        isSpecial: true,
        isRecommended: true,
        popularity: 91,
      },

      {
        name: 'Crispy Corn',
        description:
          'Golden crispy corn tossed with herbs, chilli and a touch of lime.',
        ingredients: 'Sweet corn, corn flour, chilli, herbs, lime',
        price: 190,
        image: '/images/menu/crispy-corn.jpg',
        category: categoryMap['Starters'],
        preparationTime: 12,
        spiceLevel: 'Medium',
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 30,
        isSpecial: false,
        isRecommended: false,
        popularity: 64,
      },

      {
        name: 'Tandoori Chicken',
        description:
          'Classic bone-in chicken marinated overnight and roasted in the tandoor.',
        ingredients: 'Chicken, yogurt, lemon, ginger, garlic, spices',
        price: 340,
        image: '/images/menu/tandoori-chicken.jpg',
        category: categoryMap['Starters'],
        preparationTime: 25,
        spiceLevel: 'Spicy',
        rating: 4.8,
        isVeg: false,
        isAvailable: true,
        stockQuantity: 18,
        isSpecial: true,
        isRecommended: true,
        popularity: 96,
      },

      {
        name: 'Cheese Garlic Bread',
        description:
          'Toasted garlic bread loaded with melted cheese and Italian herbs.',
        ingredients: 'Bread, cheese, butter, garlic, oregano',
        price: 180,
        image: '/images/menu/cheese-garlic-bread.jpg',
        category: categoryMap['Starters'],
        preparationTime: 10,
        spiceLevel: 'Mild',
        rating: 4.6,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 35,
        isSpecial: false,
        isRecommended: true,
        popularity: 78,
      },

      // =======================================================
      // MAIN COURSE
      // =======================================================

      {
        name: 'Butter Chicken',
        description:
          'Tender chicken simmered in a rich, creamy tomato and butter gravy.',
        ingredients: 'Chicken, tomato, butter, cream, cashew, spices',
        price: 360,
        image: '/images/menu/butter-chicken.jpg',
        category: categoryMap['Main Course'],
        preparationTime: 25,
        spiceLevel: 'Medium',
        rating: 4.9,
        isVeg: false,
        isAvailable: true,
        stockQuantity: 25,
        isSpecial: true,
        isRecommended: true,
        popularity: 100,
      },

      {
        name: 'Paneer Butter Masala',
        description:
          'Soft paneer cubes cooked in a creamy tomato, butter and cashew gravy.',
        ingredients: 'Paneer, tomato, butter, cream, cashew, spices',
        price: 290,
        image: '/images/menu/paneer-butter-masala.jpg',
        category: categoryMap['Main Course'],
        preparationTime: 20,
        spiceLevel: 'Medium',
        rating: 4.8,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 30,
        isSpecial: true,
        isRecommended: true,
        popularity: 97,
      },

      {
        name: 'Kadai Paneer',
        description:
          'Paneer cooked with capsicum, onion and freshly ground kadai spices.',
        ingredients: 'Paneer, capsicum, onion, tomato, kadai masala',
        price: 280,
        image: '/images/menu/kadai-paneer.jpg',
        category: categoryMap['Main Course'],
        preparationTime: 20,
        spiceLevel: 'Spicy',
        rating: 4.7,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 28,
        isSpecial: false,
        isRecommended: true,
        popularity: 88,
      },

      {
        name: 'Dal Makhani',
        description:
          'Slow-cooked black lentils finished with butter and cream.',
        ingredients: 'Black lentils, kidney beans, butter, cream, spices',
        price: 240,
        image: '/images/menu/dal-makhani.jpg',
        category: categoryMap['Main Course'],
        preparationTime: 25,
        spiceLevel: 'Mild',
        rating: 4.7,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 35,
        isSpecial: false,
        isRecommended: true,
        popularity: 84,
      },

      {
        name: 'Chole Masala',
        description:
          'Punjabi-style chickpeas cooked with onion, tomato and aromatic spices.',
        ingredients: 'Chickpeas, onion, tomato, ginger, garlic, spices',
        price: 210,
        image: '/images/menu/chole-masala.jpg',
        category: categoryMap['Main Course'],
        preparationTime: 20,
        spiceLevel: 'Medium',
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 32,
        isSpecial: false,
        isRecommended: false,
        popularity: 69,
      },

      {
        name: 'Chicken Tikka Masala',
        description:
          'Grilled chicken tikka simmered in a spiced tomato and cream gravy.',
        ingredients: 'Chicken tikka, tomato, cream, onion, spices',
        price: 350,
        image: '/images/menu/chicken-tikka-masala.jpg',
        category: categoryMap['Main Course'],
        preparationTime: 25,
        spiceLevel: 'Spicy',
        rating: 4.8,
        isVeg: false,
        isAvailable: true,
        stockQuantity: 22,
        isSpecial: true,
        isRecommended: true,
        popularity: 94,
      },

      {
        name: 'Chicken Kadai',
        description:
          'Juicy chicken cooked with capsicum, onion and bold kadai masala.',
        ingredients: 'Chicken, capsicum, onion, tomato, kadai masala',
        price: 340,
        image: '/images/menu/chicken-kadai.jpg',
        category: categoryMap['Main Course'],
        preparationTime: 25,
        spiceLevel: 'Spicy',
        rating: 4.7,
        isVeg: false,
        isAvailable: true,
        stockQuantity: 22,
        isSpecial: false,
        isRecommended: true,
        popularity: 87,
      },

      {
        name: 'Palak Paneer',
        description:
          'Soft paneer cubes served in a smooth, mildly spiced spinach gravy.',
        ingredients: 'Paneer, spinach, cream, garlic, spices',
        price: 270,
        image: '/images/menu/palak-paneer.jpg',
        category: categoryMap['Main Course'],
        preparationTime: 20,
        spiceLevel: 'Mild',
        rating: 4.6,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 27,
        isSpecial: false,
        isRecommended: true,
        popularity: 79,
      },

      {
        name: 'Veg Kolhapuri',
        description:
          'Mixed vegetables cooked in a bold and aromatic Kolhapuri masala.',
        ingredients: 'Mixed vegetables, onion, tomato, coconut, spices',
        price: 250,
        image: '/images/menu/veg-kolhapuri.jpg',
        category: categoryMap['Main Course'],
        preparationTime: 20,
        spiceLevel: 'Spicy',
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 26,
        isSpecial: false,
        isRecommended: false,
        popularity: 67,
      },

      {
        name: 'Mix Veg Handi',
        description:
          'Seasonal vegetables cooked in a creamy onion-tomato handi gravy.',
        ingredients: 'Mixed vegetables, onion, tomato, cream, spices',
        price: 250,
        image: '/images/menu/mix-veg-handi.jpg',
        category: categoryMap['Main Course'],
        preparationTime: 20,
        spiceLevel: 'Medium',
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 25,
        isSpecial: false,
        isRecommended: false,
        popularity: 63,
      },

      // =======================================================
      // RICE & BIRYANI
      // =======================================================

      {
        name: 'Chicken Biryani',
        description:
          'Aromatic basmati rice layered with tender chicken, saffron and whole spices.',
        ingredients: 'Chicken, basmati rice, saffron, mint, fried onion, spices',
        price: 340,
        image: '/images/menu/chicken-biryani.jpg',
        category: categoryMap['Rice & Biryani'],
        preparationTime: 30,
        spiceLevel: 'Spicy',
        rating: 4.9,
        isVeg: false,
        isAvailable: true,
        stockQuantity: 30,
        isSpecial: true,
        isRecommended: true,
        popularity: 100,
      },

      {
        name: 'Veg Biryani',
        description:
          'Fragrant basmati rice cooked with fresh vegetables, herbs and whole spices.',
        ingredients: 'Basmati rice, vegetables, mint, saffron, spices',
        price: 260,
        image: '/images/menu/veg-biryani.jpg',
        category: categoryMap['Rice & Biryani'],
        preparationTime: 25,
        spiceLevel: 'Medium',
        rating: 4.6,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 28,
        isSpecial: false,
        isRecommended: true,
        popularity: 82,
      },

      {
        name: 'Mutton Biryani',
        description:
          'Slow-cooked mutton and fragrant basmati rice layered with aromatic spices.',
        ingredients: 'Mutton, basmati rice, mint, saffron, fried onion, spices',
        price: 420,
        image: '/images/menu/mutton-biryani.jpg',
        category: categoryMap['Rice & Biryani'],
        preparationTime: 40,
        spiceLevel: 'Spicy',
        rating: 4.9,
        isVeg: false,
        isAvailable: true,
        stockQuantity: 18,
        isSpecial: true,
        isRecommended: true,
        popularity: 92,
      },

      {
        name: 'Paneer Biryani',
        description:
          'Aromatic basmati rice layered with marinated paneer and fragrant spices.',
        ingredients: 'Paneer, basmati rice, yogurt, mint, saffron, spices',
        price: 290,
        image: '/images/menu/paneer-biryani.jpg',
        category: categoryMap['Rice & Biryani'],
        preparationTime: 28,
        spiceLevel: 'Medium',
        rating: 4.6,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 25,
        isSpecial: false,
        isRecommended: true,
        popularity: 76,
      },

      {
        name: 'Jeera Rice',
        description:
          'Fluffy basmati rice tempered with cumin and fragrant whole spices.',
        ingredients: 'Basmati rice, cumin, butter, whole spices',
        price: 160,
        image: '/images/menu/jeera-rice.jpg',
        category: categoryMap['Rice & Biryani'],
        preparationTime: 15,
        spiceLevel: 'Mild',
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 40,
        isSpecial: false,
        isRecommended: false,
        popularity: 61,
      },

      {
        name: 'Veg Fried Rice',
        description:
          'Wok-tossed rice with crunchy vegetables, spring onion and light soy sauce.',
        ingredients: 'Rice, carrot, capsicum, cabbage, spring onion, soy sauce',
        price: 210,
        image: '/images/menu/veg-fried-rice.jpg',
        category: categoryMap['Rice & Biryani'],
        preparationTime: 15,
        spiceLevel: 'Medium',
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 35,
        isSpecial: false,
        isRecommended: false,
        popularity: 73,
      },

      // =======================================================
      // FAST FOOD
      // =======================================================

      {
        name: 'Classic Veg Burger',
        description:
          'Crispy vegetable patty with cheese, lettuce and signature burger sauce.',
        ingredients: 'Veg patty, bun, cheese, lettuce, tomato, sauce',
        price: 220,
        image: '/images/menu/veg-burger.webp',
        category: categoryMap['Fast Food'],
        preparationTime: 12,
        spiceLevel: 'Mild',
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 30,
        isSpecial: false,
        isRecommended: true,
        popularity: 80,
      },

      {
        name: 'Chicken Burger',
        description:
          'Juicy crispy chicken patty with cheese, lettuce and creamy house sauce.',
        ingredients: 'Chicken patty, bun, cheese, lettuce, tomato, sauce',
        price: 270,
        image: '/images/menu/chicken-burger.jpg',
        category: categoryMap['Fast Food'],
        preparationTime: 15,
        spiceLevel: 'Medium',
        rating: 4.7,
        isVeg: false,
        isAvailable: true,
        stockQuantity: 28,
        isSpecial: true,
        isRecommended: true,
        popularity: 89,
      },

      {
        name: 'Paneer Wrap',
        description:
          'Spiced paneer, crunchy vegetables and creamy sauce wrapped in a soft flatbread.',
        ingredients: 'Paneer, onion, capsicum, lettuce, flatbread, sauce',
        price: 230,
        image: '/images/menu/paneer-wrap.jpg',
        category: categoryMap['Fast Food'],
        preparationTime: 12,
        spiceLevel: 'Medium',
        rating: 4.6,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 30,
        isSpecial: false,
        isRecommended: true,
        popularity: 77,
      },

      {
        name: 'Chicken Shawarma',
        description:
          'Juicy spiced chicken wrapped with fresh vegetables and creamy garlic sauce.',
        ingredients: 'Chicken, pita, lettuce, onion, garlic sauce, spices',
        price: 260,
        image: '/images/menu/chicken-shawarma.jpg',
        category: categoryMap['Fast Food'],
        preparationTime: 15,
        spiceLevel: 'Medium',
        rating: 4.7,
        isVeg: false,
        isAvailable: true,
        stockQuantity: 25,
        isSpecial: false,
        isRecommended: true,
        popularity: 86,
      },

      {
        name: 'Margherita Pizza',
        description:
          'Classic pizza topped with tomato sauce, mozzarella and fresh basil.',
        ingredients: 'Pizza dough, tomato sauce, mozzarella, basil',
        price: 280,
        image: '/images/menu/margherita-pizza.jpg',
        category: categoryMap['Fast Food'],
        preparationTime: 18,
        spiceLevel: 'Mild',
        rating: 4.6,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 24,
        isSpecial: false,
        isRecommended: true,
        popularity: 83,
      },

      {
        name: 'Peri Peri Chicken Pizza',
        description:
          'Loaded pizza with spicy peri-peri chicken, mozzarella and peppers.',
        ingredients: 'Pizza dough, chicken, mozzarella, peppers, peri-peri sauce',
        price: 340,
        image: '/images/menu/peri-peri-chicken-pizza.jpg',
        category: categoryMap['Fast Food'],
        preparationTime: 20,
        spiceLevel: 'Spicy',
        rating: 4.7,
        isVeg: false,
        isAvailable: true,
        stockQuantity: 20,
        isSpecial: true,
        isRecommended: true,
        popularity: 88,
      },

      // =======================================================
      // DESSERTS
      // =======================================================

      {
        name: 'Chocolate Brownie',
        description:
          'Warm, fudgy chocolate brownie served with a scoop of vanilla ice cream.',
        ingredients: 'Chocolate, flour, butter, sugar, eggs, vanilla ice cream',
        price: 160,
        image: '/images/menu/chocolate-brownie.jpg',
        category: categoryMap['Desserts'],
        preparationTime: 10,
        spiceLevel: 'Mild',
        rating: 4.9,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 30,
        isSpecial: true,
        isRecommended: true,
        popularity: 93,
      },

      {
        name: 'Gulab Jamun',
        description:
          'Soft milk-solid dumplings soaked in warm cardamom-flavoured sugar syrup.',
        ingredients: 'Milk solids, flour, sugar syrup, cardamom',
        price: 120,
        image: '/images/menu/gulab-jamun.jpg',
        category: categoryMap['Desserts'],
        preparationTime: 8,
        spiceLevel: 'Mild',
        rating: 4.7,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 40,
        isSpecial: false,
        isRecommended: true,
        popularity: 85,
      },

      {
        name: 'Rasmalai',
        description:
          'Soft cottage cheese dumplings soaked in chilled saffron-cardamom milk.',
        ingredients: 'Chenna, milk, saffron, cardamom, sugar',
        price: 150,
        image: '/images/menu/rasmalai.jpg',
        category: categoryMap['Desserts'],
        preparationTime: 8,
        spiceLevel: 'Mild',
        rating: 4.6,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 25,
        isSpecial: false,
        isRecommended: false,
        popularity: 68,
      },

      {
        name: 'Mango Cheesecake',
        description:
          'Creamy cheesecake topped with bright and fruity mango glaze.',
        ingredients: 'Cream cheese, biscuit base, mango, sugar, cream',
        price: 220,
        image: '/images/menu/mango-cheesecake.jpg',
        category: categoryMap['Desserts'],
        preparationTime: 10,
        spiceLevel: 'Mild',
        rating: 4.8,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 18,
        isSpecial: true,
        isRecommended: true,
        popularity: 81,
      },

      {
        name: 'Kulfi',
        description:
          'Traditional creamy Indian frozen dessert flavoured with cardamom and nuts.',
        ingredients: 'Milk, cream, sugar, cardamom, pistachio',
        price: 130,
        image: '/images/menu/kulfi.jpg',
        category: categoryMap['Desserts'],
        preparationTime: 5,
        spiceLevel: 'Mild',
        rating: 4.6,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 25,
        isSpecial: false,
        isRecommended: false,
        popularity: 71,
      },

      // =======================================================
      // BEVERAGES
      // =======================================================

      {
        name: 'Mango Lassi',
        description:
          'Thick and creamy yogurt drink blended with ripe mangoes.',
        ingredients: 'Mango, yogurt, sugar, cardamom',
        price: 120,
        image: '/images/menu/mango-lassi.jpg',
        category: categoryMap['Beverages'],
        preparationTime: 5,
        spiceLevel: 'Mild',
        rating: 4.7,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 40,
        isSpecial: false,
        isRecommended: true,
        popularity: 88,
      },

      {
        name: 'Masala Chaas',
        description:
          'Refreshing spiced buttermilk with coriander, cumin and mint.',
        ingredients: 'Buttermilk, cumin, coriander, mint, salt',
        price: 80,
        image: '/images/menu/masala-chaas.jpg',
        category: categoryMap['Beverages'],
        preparationTime: 4,
        spiceLevel: 'Mild',
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 45,
        isSpecial: false,
        isRecommended: false,
        popularity: 65,
      },

      {
        name: 'Fresh Lime Soda',
        description:
          'Refreshing sparkling lime drink available sweet, salty or mixed.',
        ingredients: 'Lime, soda, sugar, salt, mint',
        price: 90,
        image: '/images/menu/fresh-lime-soda.jpg',
        category: categoryMap['Beverages'],
        preparationTime: 4,
        spiceLevel: 'Mild',
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 50,
        isSpecial: false,
        isRecommended: true,
        popularity: 76,
      },

      {
        name: 'Cold Coffee',
        description:
          'Smooth chilled coffee blended with milk, sugar and a touch of chocolate.',
        ingredients: 'Coffee, milk, sugar, chocolate syrup, ice',
        price: 150,
        image: '/images/menu/cold-coffee.jpg',
        category: categoryMap['Beverages'],
        preparationTime: 6,
        spiceLevel: 'Mild',
        rating: 4.7,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 35,
        isSpecial: false,
        isRecommended: true,
        popularity: 84,
      },

      {
        name: 'Virgin Mojito',
        description:
          'Cool and refreshing mint-lime mocktail with soda and crushed ice.',
        ingredients: 'Lime, mint, sugar syrup, soda, ice',
        price: 170,
        image: '/images/menu/virgin-mojito.jpg',
        category: categoryMap['Beverages'],
        preparationTime: 5,
        spiceLevel: 'Mild',
        rating: 4.8,
        isVeg: true,
        isAvailable: true,
        stockQuantity: 35,
        isSpecial: true,
        isRecommended: true,
        popularity: 90,
      },
    ];

    await FoodItem.insertMany(foodItems);

    // ---------------------------------------------------------
    // TABLES
    // ---------------------------------------------------------

    const tables = Array.from({ length: 12 }, (_, index) => {
      const number = index + 1;

      return {
        number: String(number),
        qrId: `qr-table-${number}`,
      };
    });

    await Table.insertMany(tables);

    console.log(`Seeded ${categories.length} categories.`);
    console.log(`Seeded ${foodItems.length} food items.`);
    console.log(`Seeded ${tables.length} tables.`);
    console.log('Seed complete!');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
