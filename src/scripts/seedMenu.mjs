import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Simple .env loader (only KEY=VALUE lines)
function loadDotEnv(dotenvPath) {
  if (!fs.existsSync(dotenvPath)) return;
  const raw = fs.readFileSync(dotenvPath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    process.env[key] = val;
  });
}

const root = path.resolve(process.cwd());
loadDotEnv(path.join(root, '.env'));
loadDotEnv(path.join(root, '.env.local'));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local or .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function upsertCategories(categories) {
  const { data, error } = await supabase.from('categories').upsert(categories, { onConflict: 'slug' }).select();
  if (error) throw error;
  return data;
}

async function insertMenuItems(items) {
  // Insert items; use upsert on name to avoid duplicates
  const { data, error } = await supabase.from('menu_items').upsert(items, { onConflict: 'name' }).select();
  if (error) throw error;
  return data;
}

function img(url) {
  return url;
}

async function run() {
  try {
    console.log('Seeding categories...');
    const categories = [
      { name: 'Burgers', slug: 'burgers', display_order: 1, icon: null },
      { name: 'Pizza', slug: 'pizza', display_order: 2, icon: null },
      { name: 'Sandwich', slug: 'sandwich', display_order: 3, icon: null },
      { name: 'Wraps', slug: 'wraps', display_order: 4, icon: null },
      { name: 'Special Chaap', slug: 'special-chaap', display_order: 5, icon: null },
      { name: 'Pav Bhaji & Sides', slug: 'pav-bhaji-sides', display_order: 6, icon: null },
      { name: 'Maggi & Pasta', slug: 'maggi-pasta', display_order: 7, icon: null },
      { name: 'Rice', slug: 'rice', display_order: 8, icon: null },
      { name: 'Noodles & Chinese', slug: 'noodles-chinese', display_order: 9, icon: null },
      { name: 'Shakes & Beverages', slug: 'shakes-beverages', display_order: 10, icon: null },
      { name: 'Kollad Special', slug: 'kollad-special', display_order: 11, icon: null },
    ];

    const cats = await upsertCategories(categories);
    const catBySlug = {};
    (cats || []).forEach((c) => (catBySlug[c.slug] = c.id));

    console.log('Preparing menu items...');
    const items = [];

    // Helper to push item
    const push = (slug, name, price, desc, imageUrl, displayOrder = 0) => {
      items.push({
        category_id: catBySlug[slug] ?? null,
        name,
        description: desc,
        price,
        image_url: img(imageUrl),
        is_popular: false,
        is_available: true,
        display_order: displayOrder,
      });
    };

    // BURGERS
    push('burgers', 'Aaloo Tikki Burger', 50, 'Crispy potato tikki with fresh chutneys in a soft bun.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80', 1);
    push('burgers', 'Cheese Tikki Burger', 70, 'Potato tikki topped with melted cheese and salad.', 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=1200&q=80', 2);
    push('burgers', 'Double Cheese Burger', 80, 'Two layers of cheese, crisp lettuce, and signature sauce.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80', 3);
    push('burgers', 'Cheese Burger', 70, 'Classic burger with juicy patty and melted cheese.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80', 4);
    push('burgers', 'Paneer Burger', 100, 'Grilled paneer slab with tangy sauces and fresh veggies.', 'https://images.unsplash.com/photo-1617191511151-8f7a2a2d9b5d?auto=format&fit=crop&w=1200&q=80', 5);
    push('burgers', 'Over Loaded Burger', 100, 'A hearty burger piled high with cheese, patty and toppings.', 'https://images.unsplash.com/photo-1606755962770-5e1b4d9c4f8f?auto=format&fit=crop&w=1200&q=80', 6);

    // PIZZA
    push('pizza', 'Farm House Pizza', 280, 'Loaded with bell peppers, onions, mushrooms and tomatoes.', 'https://images.unsplash.com/photo-1601924638867-3ec5b3f1b0b5?auto=format&fit=crop&w=1200&q=80', 1);
    push('pizza', 'Cheese Corn Pizza', 200, 'Creamy cheese and sweet corn on a crispy crust.', 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=1200&q=80', 2);
    push('pizza', 'Onion Pizza', 180, 'Simple and delicious onion-topped pizza.', 'https://images.unsplash.com/photo-1601924582975-2f3c99f8f1e4?auto=format&fit=crop&w=1200&q=80', 3);
    push('pizza', 'Capsicum Pizza', 180, 'Fresh capsicum with melted cheese.', 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=1200&q=80', 4);
    push('pizza', 'Tomato Pizza', 180, 'Ripe tomato slices with oregano and olive oil.', 'https://images.unsplash.com/photo-1601924582975-2f3c99f8f1e4?auto=format&fit=crop&w=1200&q=80', 5);
    push('pizza', 'Mushroom Pizza', 250, 'Sautéed mushrooms with garlic and cheese.', 'https://images.unsplash.com/photo-1605475125853-1e6b6f3b5f3b?auto=format&fit=crop&w=1200&q=80', 6);
    push('pizza', 'Paneer Pizza', 250, 'Cubes of paneer with capsicum and spicy sauce.', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80', 7);
    push('pizza', 'Veg Exotica Pizza', 280, 'Mixed exotic veggies, olives and special cheese.', 'https://images.unsplash.com/photo-1548365328-8b0a0a4b3b0a?auto=format&fit=crop&w=1200&q=80', 8);

    // SANDWICH
    push('sandwich', 'Paneer Sandwich', 140, 'Grilled paneer with mint chutney and veggies.', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80', 1);
    push('sandwich', 'Cheese Sandwich', 100, 'Classic grilled cheese sandwich.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80', 2);
    push('sandwich', 'Masala Tikki Sandwich', 100, 'Spiced potato tikki with chutney in soft bread.', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80', 3);
    push('sandwich', 'Cheese Corn Sandwich', 100, 'Melty cheese with sweet corn filling.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80', 4);

    // WRAPS
    push('wraps', 'Aaloo Tikki Wrap', 100, 'Aloo tikki wrapped with fresh veggies and sauces.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 1);
    push('wraps', 'Paneer Wrap', 140, 'Grilled paneer with mint and salad in a soft wrap.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 2);
    push('wraps', 'Tandoori Paneer Wrap', 150, 'Smoky tandoori paneer with fresh greens.', 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80', 3);
    push('wraps', 'Mexican Wrap', 110, 'Spicy Mexican filling with beans and corn.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', 4);
    push('wraps', 'Chaap Wrap', 150, 'Succulent chaap in a wrap with onions and sauces.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', 5);

    // SPECIAL CHAAP
    push('special-chaap', 'Creamy Chaap', 160, 'Rich creamy chaap cooked in special gravy.', 'https://images.unsplash.com/photo-1604908177522-3c3c2f5b4b85?auto=format&fit=crop&w=1200&q=80', 1);
    push('special-chaap', 'Malai Chaap', 160, 'Soft malai chaap with aromatic spices.', 'https://images.unsplash.com/photo-1604908177522-3c3c2f5b4b85?auto=format&fit=crop&w=1200&q=80', 2);

    // PAV BHAJI & SIDES
    push('pav-bhaji-sides', 'Pav Bhaji', 90, 'Spiced mashed vegetables served with buttered pav.', 'https://images.unsplash.com/photo-1604908177407-8f3b6d7c1f3e?auto=format&fit=crop&w=1200&q=80', 1);
    push('pav-bhaji-sides', 'Chana Bhatura', 80, 'Fluffy bhatura served with spicy chana.', 'https://images.unsplash.com/photo-1604908177407-8f3b6d7c1f3e?auto=format&fit=crop&w=1200&q=80', 2);
    push('pav-bhaji-sides', 'Plain Salted Fries', 90, 'Crispy salted fries.', 'https://images.unsplash.com/photo-1541542684-9c7f3e6d3b2b?auto=format&fit=crop&w=1200&q=80', 3);
    push('pav-bhaji-sides', 'Masala Fries', 100, 'Spiced masala fries.', 'https://images.unsplash.com/photo-1541542684-9c7f3e6d3b2b?auto=format&fit=crop&w=1200&q=80', 4);
    push('pav-bhaji-sides', 'Peri Peri Fries', 120, 'Hot peri-peri seasoned fries.', 'https://images.unsplash.com/photo-1541542684-9c7f3e6d3b2b?auto=format&fit=crop&w=1200&q=80', 5);
    push('pav-bhaji-sides', 'Raita', 30, 'Cooling yogurt raita.', 'https://images.unsplash.com/photo-1594007656053-9bb45b5a1a0b?auto=format&fit=crop&w=1200&q=80', 6);

    // MAGGI & PASTA
    push('maggi-pasta', 'Plain Maggi', 50, 'Classic masala instant noodles.', 'https://images.unsplash.com/photo-1604908177407-8f3b6d7c1f3e?auto=format&fit=crop&w=1200&q=80', 1);
    push('maggi-pasta', 'Cheese Oregano Maggi', 70, 'Maggi topped with cheese and oregano.', 'https://images.unsplash.com/photo-1604908177407-8f3b6d7c1f3e?auto=format&fit=crop&w=1200&q=80', 2);
    push('maggi-pasta', 'Tandoori Maggi', 70, 'Smoky tandoori flavored Maggi.', 'https://images.unsplash.com/photo-1604908177407-8f3b6d7c1f3e?auto=format&fit=crop&w=1200&q=80', 3);
    push('maggi-pasta', 'Chilli Garlic Maggi', 70, 'Spicy chilli garlic Maggi.', 'https://images.unsplash.com/photo-1604908177407-8f3b6d7c1f3e?auto=format&fit=crop&w=1200&q=80', 4);
    push('maggi-pasta', 'Pasta White Sauce', 150, 'Creamy white sauce pasta with herbs.', 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80', 5);

    // RICE
    push('rice', 'Fried Rice', 100, 'Veg fried rice with light soy flavor.', 'https://images.unsplash.com/photo-1604908177522-3c3c2f5b4b85?auto=format&fit=crop&w=1200&q=80', 1);
    push('rice', 'Chilli Garlic Rice Bowl', 140, 'Spicy chilli garlic rice with veggies.', 'https://images.unsplash.com/photo-1604908177522-3c3c2f5b4b85?auto=format&fit=crop&w=1200&q=80', 2);
    push('rice', 'Paneer Rice Bowl', 160, 'Paneer cubes over flavored rice.', 'https://images.unsplash.com/photo-1604908177522-3c3c2f5b4b85?auto=format&fit=crop&w=1200&q=80', 3);

    // NOODLES & CHINESE
    push('noodles-chinese', 'Veg Noodles (Half)', 50, 'Half portion of stir-fried veg noodles.', 'https://images.unsplash.com/photo-1547592166-8b6b1a3d2c2c?auto=format&fit=crop&w=1200&q=80', 1);
    push('noodles-chinese', 'Veg Noodles (Full)', 90, 'Full portion of stir-fried veg noodles.', 'https://images.unsplash.com/photo-1547592166-8b6b1a3d2c2c?auto=format&fit=crop&w=1200&q=80', 2);
    push('noodles-chinese', 'Paneer Noodles (Half)', 70, 'Half portion with paneer.', 'https://images.unsplash.com/photo-1547592166-8b6b1a3d2c2c?auto=format&fit=crop&w=1200&q=80', 3);
    push('noodles-chinese', 'Paneer Noodles (Full)', 120, 'Full portion with paneer.', 'https://images.unsplash.com/photo-1547592166-8b6b1a3d2c2c?auto=format&fit=crop&w=1200&q=80', 4);
    push('noodles-chinese', 'Mushroom Noodles (Half)', 70, 'Half portion with mushrooms.', 'https://images.unsplash.com/photo-1547592166-8b6b1a3d2c2c?auto=format&fit=crop&w=1200&q=80', 5);
    push('noodles-chinese', 'Mushroom Noodles (Full)', 120, 'Full portion with mushrooms.', 'https://images.unsplash.com/photo-1547592166-8b6b1a3d2c2c?auto=format&fit=crop&w=1200&q=80', 6);
    push('noodles-chinese', 'Chilli Garlic Noodle (Veg)', 60, 'Spicy chilli garlic noodles.', 'https://images.unsplash.com/photo-1547592166-8b6b1a3d2c2c?auto=format&fit=crop&w=1200&q=80', 7);
    push('noodles-chinese', 'Chilli Garlic Noodle (Paneer)', 100, 'Spicy chilli garlic noodles with paneer.', 'https://images.unsplash.com/photo-1547592166-8b6b1a3d2c2c?auto=format&fit=crop&w=1200&q=80', 8);
    push('noodles-chinese', 'Chilly Potato', 160, 'Crispy chilly potato tossed with sauces.', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80', 9);
    push('noodles-chinese', 'Manchurian Dry', 180, 'Dry veg manchurian with savory glaze.', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80', 10);
    push('noodles-chinese', 'Manchurian Gravy', 200, 'Classic manchurian in rich gravy.', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80', 11);
    push('noodles-chinese', 'Saute Vegetable', 150, 'Seasonal sautéed vegetables.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80', 12);
    push('noodles-chinese', 'Cheese Chilly Dry', 200, 'Cheesy chilly cauliflower dry.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80', 13);
    push('noodles-chinese', 'Cheese Chilly Gravy', 220, 'Cheesy chilly in savory gravy.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80', 14);

    // SHAKES & BEVERAGES
    push('shakes-beverages', 'Choco Shake', 80, 'Rich chocolate milkshake.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80', 1);
    push('shakes-beverages', 'Vanilla Shake', 80, 'Classic vanilla shake.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80', 2);
    push('shakes-beverages', 'Butter Scotch Shake', 90, 'Butterscotch flavored shake.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80', 3);
    push('shakes-beverages', 'Lotus Biscoff Shake', 120, 'Biscoff cookie shake.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80', 4);
    push('shakes-beverages', 'Choco Brownie Shake', 150, 'Chocolate brownie blended shake.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80', 5);
    push('shakes-beverages', 'Banana Shake', 70, 'Fresh banana shake.', 'https://images.unsplash.com/photo-1585238342028-6f9dff8bd2d0?auto=format&fit=crop&w=1200&q=80', 6);
    push('shakes-beverages', 'Oreo Shake', 100, 'Oreo cookie milkshake.', 'https://images.unsplash.com/photo-1542444459-db1b6c8c1f5f?auto=format&fit=crop&w=1200&q=80', 7);
    push('shakes-beverages', 'Kit-Kat Shake', 100, 'Kit-Kat blended shake.', 'https://images.unsplash.com/photo-1542444459-db1b6c8c1f5f?auto=format&fit=crop&w=1200&q=80', 8);
    push('shakes-beverages', 'Cold Coffee', 80, 'Chilled cold coffee with ice cream.', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80', 9);
    push('shakes-beverages', 'Ice Cream', 90, 'Scoop of creamy ice cream.', 'https://images.unsplash.com/photo-1547592166-8b6b1a3d2c2c?auto=format&fit=crop&w=1200&q=80', 10);
    push('shakes-beverages', 'Protein Shake', 150, 'High-protein shake.', 'https://images.unsplash.com/photo-1547592166-8b6b1a3d2c2c?auto=format&fit=crop&w=1200&q=80', 11);
    push('shakes-beverages', 'Fresh Lime (Sweet/Salty)', 60, 'Fresh lime juice, sweet or salty.', 'https://images.unsplash.com/photo-1504203700681-8f0bbad5a0de?auto=format&fit=crop&w=1200&q=80', 12);
    push('shakes-beverages', 'Mango Shake', 120, 'Sweet mango milkshake.', 'https://images.unsplash.com/photo-1504203700681-8f0bbad5a0de?auto=format&fit=crop&w=1200&q=80', 13);

    // KOLLAD SPECIAL
    push('kollad-special', 'Kullad Chai', 20, 'Traditional clay-cup chai.', 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1200&q=80', 1);
    push('kollad-special', 'Kullad Coffee', 40, 'Hot coffee served in kullad.', 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1200&q=80', 2);

    console.log(`Inserting ${items.length} menu items...`);
    const inserted = await insertMenuItems(items);
    console.log('Inserted items count:', (inserted || []).length);
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
    process.exit(1);
  }
}

run();
