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
    push('burgers', 'Aaloo Tikki Burger', 50, 'Crispy potato tikki with fresh chutneys in a soft bun.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', 1);
    push('burgers', 'Cheese Tikki Burger', 70, 'Potato tikki topped with melted cheese and salad.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80', 2);
    push('burgers', 'Double Cheese Burger', 80, 'Two layers of cheese, crisp lettuce, and signature sauce.', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80', 3);
    push('burgers', 'Cheese Burger', 70, 'Classic burger with juicy patty and melted cheese.', 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=1200&q=80', 4);
    push('burgers', 'Paneer Burger', 100, 'Grilled paneer slab with tangy sauces and fresh veggies.', 'https://images.unsplash.com/photo-1617191511151-8f7a2a2d9b5d?auto=format&fit=crop&w=1200&q=80', 5);
    push('burgers', 'Over Loaded Burger', 100, 'A hearty burger piled high with cheese, patty and toppings.', 'https://images.unsplash.com/photo-1606755962770-5e1b4d9c4f8f?auto=format&fit=crop&w=1200&q=80', 6);

    // PIZZA
    push('pizza', 'Farm House Pizza', 280, 'Loaded with bell peppers, onions, mushrooms and tomatoes.', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1200&q=80', 1);
    push('pizza', 'Cheese Corn Pizza', 200, 'Creamy cheese and sweet corn on a crispy crust.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80', 2);
    push('pizza', 'Onion Pizza', 180, 'Simple and delicious onion-topped pizza.', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1200&q=80', 3);
    push('pizza', 'Capsicum Pizza', 180, 'Fresh capsicum with melted cheese.', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80', 4);
    push('pizza', 'Tomato Pizza', 180, 'Ripe tomato slices with oregano and olive oil.', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80', 5);
    push('pizza', 'Mushroom Pizza', 250, 'Sautéed mushrooms with garlic and cheese.', 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=1200&q=80', 6);
    push('pizza', 'Paneer Pizza', 250, 'Cubes of paneer with capsicum and spicy sauce.', 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=1200&q=80', 7);
    push('pizza', 'Veg Exotica Pizza', 280, 'Mixed exotic veggies, olives and special cheese.', 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=1200&q=80', 8);

    // SANDWICH
    push('sandwich', 'Paneer Sandwich', 140, 'Grilled paneer with mint chutney and veggies.', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80', 1);
    push('sandwich', 'Cheese Sandwich', 100, 'Classic grilled cheese sandwich.', 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=1200&q=80', 2);
    push('sandwich', 'Masala Tikki Sandwich', 100, 'Spiced potato tikki with chutney in soft bread.', 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?auto=format&fit=crop&w=1200&q=80', 3);
    push('sandwich', 'Cheese Corn Sandwich', 100, 'Melty cheese with sweet corn filling.', 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&w=1200&q=80', 4);

    // WRAPS
    push('wraps', 'Aaloo Tikki Wrap', 100, 'Aloo tikki wrapped with fresh veggies and sauces.', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80', 1);
    push('wraps', 'Paneer Wrap', 140, 'Grilled paneer with mint and salad in a soft wrap.', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80', 2);
    push('wraps', 'Tandoori Paneer Wrap', 150, 'Smoky tandoori paneer with fresh greens.', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80', 3);
    push('wraps', 'Mexican Wrap', 110, 'Spicy Mexican filling with beans and corn.', 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=1200&q=80', 4);
    push('wraps', 'Chaap Wrap', 150, 'Succulent chaap in a wrap with onions and sauces.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', 5);

    // SPECIAL CHAAP
    push('special-chaap', 'Creamy Chaap', 160, 'Rich creamy chaap cooked in special gravy.', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80', 1);
    push('special-chaap', 'Malai Chaap', 160, 'Soft malai chaap with aromatic spices.', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=80', 2);

    // PAV BHAJI & SIDES
    push('pav-bhaji-sides', 'Pav Bhaji', 90, 'Spiced mashed vegetables served with buttered pav.', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=80', 1);
    push('pav-bhaji-sides', 'Chana Bhatura', 80, 'Fluffy bhatura served with spicy chana.', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=80', 2);
    push('pav-bhaji-sides', 'Plain Salted Fries', 90, 'Crispy salted fries.', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=1200&q=80', 3);
    push('pav-bhaji-sides', 'Masala Fries', 100, 'Spiced masala fries.', 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1200&q=80', 4);
    push('pav-bhaji-sides', 'Peri Peri Fries', 120, 'Hot peri-peri seasoned fries.', 'https://images.unsplash.com/photo-1630384060421-cb3f20e0649d?auto=format&fit=crop&w=1200&q=80', 5);
    push('pav-bhaji-sides', 'Raita', 30, 'Cooling yogurt raita.', 'https://images.unsplash.com/photo-1594007656053-9bb45b5a1a0b?auto=format&fit=crop&w=1200&q=80', 6);

    // MAGGI & PASTA
    push('maggi-pasta', 'Plain Maggi', 50, 'Classic masala instant noodles.', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=1200&q=80', 1);
    push('maggi-pasta', 'Cheese Oregano Maggi', 70, 'Maggi topped with cheese and oregano.', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80', 2);
    push('maggi-pasta', 'Tandoori Maggi', 70, 'Smoky tandoori flavored Maggi.', 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80', 3);
    push('maggi-pasta', 'Chilli Garlic Maggi', 70, 'Spicy chilli garlic Maggi.', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', 4);
    push('maggi-pasta', 'Pasta White Sauce', 150, 'Creamy white sauce pasta with herbs.', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=1200&q=80', 5);

    // RICE
    push('rice', 'Fried Rice', 100, 'Veg fried rice with light soy flavor.', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80', 1);
    push('rice', 'Chilli Garlic Rice Bowl', 140, 'Spicy chilli garlic rice with veggies.', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', 2);
    push('rice', 'Paneer Rice Bowl', 160, 'Paneer cubes over flavored rice.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=80', 3);

    // NOODLES & CHINESE
    push('noodles-chinese', 'Veg Noodles (Half)', 50, 'Half portion of stir-fried veg noodles.', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1200&q=80', 1);
    push('noodles-chinese', 'Veg Noodles (Full)', 90, 'Full portion of stir-fried veg noodles.', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80', 2);
    push('noodles-chinese', 'Paneer Noodles (Half)', 70, 'Half portion with paneer.', 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80', 3);
    push('noodles-chinese', 'Paneer Noodles (Full)', 120, 'Full portion with paneer.', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', 4);
    push('noodles-chinese', 'Mushroom Noodles (Half)', 70, 'Half portion with mushrooms.', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80', 5);
    push('noodles-chinese', 'Mushroom Noodles (Full)', 120, 'Full portion with mushrooms.', 'https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?auto=format&fit=crop&w=1200&q=80', 6);
    push('noodles-chinese', 'Chilli Garlic Noodle (Veg)', 60, 'Spicy chilli garlic noodles.', 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80', 7);
    push('noodles-chinese', 'Chilli Garlic Noodle (Paneer)', 100, 'Spicy chilli garlic noodles with paneer.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=80', 8);
    push('noodles-chinese', 'Chilly Potato', 160, 'Crispy chilly potato tossed with sauces.', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80', 9);
    push('noodles-chinese', 'Manchurian Dry', 180, 'Dry veg manchurian with savory glaze.', 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=1200&q=80', 10);
    push('noodles-chinese', 'Manchurian Gravy', 200, 'Classic manchurian in rich gravy.', 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1200&q=80', 11);
    push('noodles-chinese', 'Saute Vegetable', 150, 'Seasonal sautéed vegetables.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80', 12);
    push('noodles-chinese', 'Cheese Chilly Dry', 200, 'Cheesy chilly cauliflower dry.', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1200&q=80', 13);
    push('noodles-chinese', 'Cheese Chilly Gravy', 220, 'Cheesy chilly in savory gravy.', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80', 14);

    // SHAKES & BEVERAGES
    push('shakes-beverages', 'Choco Shake', 80, 'Rich chocolate milkshake.', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80', 1);
    push('shakes-beverages', 'Vanilla Shake', 80, 'Classic vanilla shake.', 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=1200&q=80', 2);
    push('shakes-beverages', 'Butter Scotch Shake', 90, 'Butterscotch flavored shake.', 'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=1200&q=80', 3);
    push('shakes-beverages', 'Lotus Biscoff Shake', 120, 'Biscoff cookie shake.', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=1200&q=80', 4);
    push('shakes-beverages', 'Choco Brownie Shake', 150, 'Chocolate brownie blended shake.', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80', 5);
    push('shakes-beverages', 'Banana Shake', 70, 'Fresh banana shake.', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=80', 6);
    push('shakes-beverages', 'Oreo Shake', 100, 'Oreo cookie milkshake.', 'https://images.unsplash.com/photo-1542444459-db1b6c8c1f5f?auto=format&fit=crop&w=1200&q=80', 7);
    push('shakes-beverages', 'Kit-Kat Shake', 100, 'Kit-Kat blended shake.', 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=1200&q=80', 8);
    push('shakes-beverages', 'Cold Coffee', 80, 'Chilled cold coffee with ice cream.', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80', 9);
    push('shakes-beverages', 'Ice Cream', 90, 'Scoop of creamy ice cream.', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=1200&q=80', 10);
    push('shakes-beverages', 'Protein Shake', 150, 'High-protein shake.', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80', 11);
    push('shakes-beverages', 'Fresh Lime (Sweet/Salty)', 60, 'Fresh lime juice, sweet or salty.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80', 12);
    push('shakes-beverages', 'Mango Shake', 120, 'Sweet mango milkshake.', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1200&q=80', 13);

    // KOLLAD SPECIAL
    push('kollad-special', 'Kullad Chai', 20, 'Traditional clay-cup chai.', 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=1200&q=80', 1);
    push('kollad-special', 'Kullad Coffee', 40, 'Hot coffee served in kullad.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80', 2);

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
