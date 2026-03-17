const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  try {
    console.log('Deleting existing order items...');
    await prisma.orderItem.deleteMany();
    
    console.log('Deleting existing orders...');
    await prisma.order.deleteMany();
    
    console.log('Deleting existing menu items...');
    await prisma.menuItem.deleteMany();
    

    console.log('Creating menu items with professional images...');
    const menuItems = [
      {
        name: 'Classic Margherita Pizza',
        description: 'Fresh mozzarella, hand-picked basil, and authentic Italian tomato sauce on a wood-fired crispy crust',
        price: 280.00,
        category: 'Pizza',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
        stock: 20,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Pepperoni Feast Pizza',
        description: 'Double pepperoni, extra cheese blend, and signature spicy sauce',
        price: 340.00,
        category: 'Pizza',
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
        stock: 18,
        isAvailable: true,
        popular: true
      },
      {
        name: 'BBQ Chicken Pizza',
        description: 'Grilled chicken, red onions, cilantro, and tangy BBQ sauce',
        price: 360.00,
        category: 'Pizza',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
        stock: 15,
        isAvailable: true,
        popular: false
      },
      {
        name: 'Veggie Supreme Pizza',
        description: 'Bell peppers, mushrooms, olives, onions, and fresh tomatoes',
        price: 320.00,
        category: 'Pizza',
        imageUrl: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=800&q=80',
        stock: 20,
        isAvailable: true,
        popular: false
      },

      {
        name: 'Paneer Tikka Roll',
        description: 'Tandoori paneer with mint chutney, onions, and crispy lettuce in soft paratha',
        price: 150.00,
        category: 'Rolls',
        imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
        stock: 15,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Chicken Tikka Roll',
        description: 'Smoky grilled chicken with special garlic mayo and fresh vegetables',
        price: 180.00,
        category: 'Rolls',
        imageUrl: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=800&q=80',
        stock: 12,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Falafel Wrap',
        description: 'Crispy falafel with hummus, tahini sauce, and Mediterranean veggies',
        price: 140.00,
        category: 'Rolls',
        imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
        stock: 18,
        isAvailable: true,
        popular: false
      },

      {
        name: 'Premium Masala Chai',
        description: 'Aromatic spiced tea with cardamom, ginger, and perfect milk blend',
        price: 50.00,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80',
        stock: 50,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Cold Coffee Delight',
        description: 'Iced coffee with vanilla ice cream, chocolate drizzle, and whipped cream',
        price: 120.00,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80',
        stock: 20,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Fresh Mango Smoothie',
        description: 'Alphonso mango blended with yogurt, honey, and a hint of cardamom',
        price: 140.00,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&q=80',
        stock: 15,
        isAvailable: true,
        popular: false
      },
      {
        name: 'Classic Lemonade',
        description: 'Fresh squeezed lemons with mint and perfect sweetness',
        price: 80.00,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f0d?w=800&q=80',
        stock: 25,
        isAvailable: true,
        popular: false
      },

      {
        name: 'Belgian Chocolate Brownie',
        description: 'Rich, fudgy brownie with dark chocolate chunks and crispy edges',
        price: 130.00,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
        stock: 12,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Classic Gulab Jamun',
        description: 'Soft, warm milk dumplings soaked in rose-cardamom sugar syrup (2 pcs)',
        price: 80.00,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=800&q=80',
        stock: 20,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Triple Scoop Sundae',
        description: 'Vanilla, chocolate, and strawberry ice cream with hot fudge and nuts',
        price: 180.00,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
        stock: 10,
        isAvailable: true,
        popular: false
      },
      {
        name: 'New York Cheesecake',
        description: 'Creamy cheesecake with graham cracker crust and berry compote',
        price: 200.00,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&q=80',
        stock: 8,
        isAvailable: true,
        popular: false
      },

      {
        name: 'Grilled Veggie Sandwich',
        description: 'Fresh vegetables, cheese, pesto sauce in toasted multigrain bread',
        price: 110.00,
        category: 'Sandwiches',
        imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
        stock: 25,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Classic Club Sandwich',
        description: 'Triple-decker with chicken, bacon, egg, lettuce, and mayo',
        price: 220.00,
        category: 'Sandwiches',
        imageUrl: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=800&q=80',
        stock: 15,
        isAvailable: true,
        popular: false
      },
      {
        name: 'Panini Caprese',
        description: 'Fresh mozzarella, tomatoes, basil, balsamic glaze on pressed Italian bread',
        price: 180.00,
        category: 'Sandwiches',
        imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&q=80',
        stock: 20,
        isAvailable: true,
        popular: false
      },

      {
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty, cheese, lettuce, tomato, pickles, special sauce',
        price: 240.00,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
        stock: 18,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Crispy Chicken Burger',
        description: 'Buttermilk fried chicken, coleslaw, chipotle mayo, brioche bun',
        price: 220.00,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80',
        stock: 20,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Loaded Cheese Fries',
        description: 'Crispy fries topped with melted cheese, bacon bits, and jalapeños',
        price: 140.00,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1630431341973-02e1b1ea2efd?w=800&q=80',
        stock: 30,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Masala French Fries',
        description: 'Golden fries tossed in spicy masala seasoning',
        price: 100.00,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
        stock: 35,
        isAvailable: true,
        popular: false
      },
      {
        name: 'Crispy Samosa Platter',
        description: 'Traditional spiced potato samosas with mint and tamarind chutney (4 pcs)',
        price: 80.00,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
        stock: 40,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Chicken Wings Platter',
        description: 'Spicy buffalo wings with blue cheese dip and celery sticks (8 pcs)',
        price: 280.00,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80',
        stock: 15,
        isAvailable: true,
        popular: false
      },

      {
        name: 'Creamy Alfredo Pasta',
        description: 'Fettuccine in rich parmesan cream sauce with grilled chicken',
        price: 260.00,
        category: 'Pasta',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
        stock: 12,
        isAvailable: true,
        popular: true
      },
      {
        name: 'Penne Arrabiata',
        description: 'Spicy tomato sauce with garlic, chili flakes, and fresh basil',
        price: 220.00,
        category: 'Pasta',
        imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80',
        stock: 15,
        isAvailable: true,
        popular: false
      },
    ];

    const result = await prisma.menuItem.createMany({
      data: menuItems
    });
    
    const allItems = await prisma.menuItem.findMany({
      orderBy: { category: 'asc' }
    });
    
    console.log(`\n📊 Total items in database: ${allItems.length}`);
    console.log('\n📋 Menu Items by Category:');
    
    const categories = [...new Set(allItems.map(item => item.category))];
    categories.forEach(category => {
      console.log(`\n  ${category}:`);
      allItems
        .filter(item => item.category === category)
        .forEach(item => {
          console.log(`    • ${item.name} - ₹${item.price} ${item.popular ? '⭐' : ''}`);
        });
    });
    
    console.log('\n🎉 Seed completed successfully!');
    console.log('📸 All items now have professional food photography from Unsplash');
  } catch (error) {
    console.error('\n❌ Error during seed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('\n🔌 Disconnecting from database...');
    await prisma.$disconnect();
  });