const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ecommerce.db');

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Order Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // 50 Curated Products
  const products = [
    // --- Audio & Wearables (1 - 5) ---
    ["Wireless Noise-Canceling Headphones", "Premium over-ear Bluetooth headphones with active noise cancellation and 35-hour battery life.", 89.99, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"],
    ["Smart Fitness Watch", "Vibrant AMOLED screen tracking 24/7 heart rate, sleep metrics, workout modes, and notifications.", 129.99, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"],
    ["True Wireless Earbuds", "Compact IPX5 sweat-resistant earbuds featuring touch control and a pocket-sized wireless charging case.", 49.99, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80"],
    ["Rugged Bluetooth Speaker", "360-degree bass-boosted sound with IPX7 waterproof casing built for outdoor hikes and poolside days.", 59.99, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80"],
    ["Classic Chronograph Watch", "Precision Japanese quartz movement housed in a stainless steel dial with genuine leather strap.", 149.00, "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80"],

    // --- Computer & Workstation Gear (6 - 10) ---
    ["Ergonomic Wireless Mouse", "Contoured vertical ergonomic mouse designed to alleviate wrist fatigue during prolonged office hours.", 34.50, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80"],
    ["Mechanical RGB Keyboard", "Hot-swappable tactile mechanical switches paired with customizable per-key dynamic backlighting.", 99.00, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80"],
    ["Minimalist LED Desk Lamp", "Touch-sensitive adjustable swing-arm lamp with 5 color temperatures and integrated USB fast charger.", 42.00, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"],
    ["Ultra-Wide Desk Pad", "Spacious water-resistant microfiber mat providing smooth mouse gliding and desk protection.", 19.99, "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&q=80"],
    ["Aluminum Laptop Riser Stand", "Foldable heat-dissipating aluminum alloy stand with adjustable viewing angle for ergonomic typing.", 27.99, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80"],

    // --- Cameras & Tech Accessories (11 - 15) ---
    ["4K Ultra-HD Action Camera", "Dual screen waterproof sports cam with electronic image stabilization and wide-angle 170-degree lens.", 119.50, "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80"],
    ["15W Wireless Fast Charger", "Ultra-thin Qi-certified charging pad with smart LED indicator and over-temperature safety shield.", 24.99, "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=500&q=80"],
    ["20,000mAh Power Bank", "High capacity dual USB-C Power Delivery external battery for laptops, tablets, and mobile devices.", 39.99, "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80"],
    ["Studio USB Microphone", "Cardioid condenser microphone with integrated pop filter, shock mount, and zero-latency earphone jack.", 74.99, "https://images.unsplash.com/photo-1583775253835-2617f1a3a29d?w=500&q=80"],
    ["Adjustable Camera Tripod", "Lightweight aluminum 55-inch travel tripod with 3-way pan head and smartphone clamp adapter.", 32.50, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80"],

    // --- Bags & Travel (16 - 20) ---
    ["Minimalist City Backpack", "Water-repellent durable nylon daypack with designated 15.6-inch laptop pocket and hidden zipper.", 54.99, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80"],
    ["Canvas Weekend Duffle Bag", "Sturdy overnight travel duffle crafted from heavy-duty canvas with genuine leather trim accents.", 68.00, "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500&q=80"],
    ["Slim RFID Leather Wallet", "Bifold front pocket leather wallet equipped with RFID signal blocking security shields.", 29.99, "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80"],
    ["Hard Shell Carry-On Suitcase", "Lightweight polycarbonate spinner luggage featuring 360-degree silent wheels and TSA lock.", 135.00, "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=500&q=80"],
    ["Crossbody Sling Bag", "Compact tactical water-resistant shoulder bag with multiple compartments for keys, cards, and passport.", 26.50, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80"],

    // --- Footwear & Apparel (21 - 25) ---
    ["Casual Canvas Sneakers", "Breathable organic cotton sneakers with padded shock-absorbing insoles and vulcanized rubber sole.", 59.90, "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80"],
    ["Classic Polarized Sunglasses", "Retro square frame with scratch-resistant UV400 lenses and reinforced metal hinges.", 45.00, "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80"],
    ["Vintage Denim Jacket", "Classic unisex 100% cotton trucker jacket with metal button closures and deep side welt pockets.", 79.00, "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80"],
    ["Heavyweight Cotton Hoodie", "Plush fleece-lined pullover hoodie with adjustable drawstring hood and kangaroo hand pocket.", 48.00, "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80"],
    ["Leather Chelsea Boots", "Premium burnished leather boots featuring elastic side gussets and slip-resistant crepe rubber soles.", 139.99, "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&q=80"],

    // --- Coffee & Kitchenware (26 - 30) ---
    ["Ceramic Pour-Over Coffee Set", "Artisanal matte ceramic coffee dripper paired with a thermal shock-resistant 600ml glass carafe.", 38.50, "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80"],
    ["Insulated Stainless Water Bottle", "Double-wall vacuum flask keeping beverages ice cold for 24 hours or piping hot for 12 hours.", 22.00, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80"],
    ["Gooseneck Electric Kettle", "Precision temperature-controlled pour kettle with 1-hour heat hold function for brewing tea and coffee.", 69.90, "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&q=80"],
    ["Cast Iron Skillet Pan", "Pre-seasoned heavy-duty 10-inch skillet delivering superior heat retention for searing and baking.", 34.00, "https://images.unsplash.com/photo-1584990347449-39965d0a6311?w=500&q=80"],
    ["Double-Walled Glass Cups", "Set of two heat-insulated borosilicate glass mugs for cappuccino, latte, and iced brews.", 24.00, "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&q=80"],

    // --- Home, Decor & Wellness (31 - 35) ---
    ["Aromatherapy Soy Candle", "Hand-poured all-natural soy wax infused with French lavender and botanical cedarwood oils.", 18.00, "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80"],
    ["Ceramic Indoor Planter Pot", "Modern geometric drainage planter pot with detachable saucer suitable for succulents and ferns.", 19.99, "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80"],
    ["Ultrasonic Essential Oil Diffuser", "Whisper-quiet cool mist humidifier with 7 ambient soothing LED colors and auto shut-off.", 28.50, "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80"],
    ["Natural Linen Throw Pillow", "Soft breathable stonewashed Belgian linen cushion cover including hypoallergenic insert.", 25.00, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&q=80"],
    ["Woven Cotton Throw Blanket", "Cozy boho waffle knit blanket made with 100% natural breathable combed cotton.", 36.00, "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500&q=80"],

    // --- Stationery & Reading (36 - 40) ---
    ["Hardcover Dotted Journal", "Thick 120gsm bleed-proof ivory paper, ribbon bookmark, back pocket, and elastic closure strap.", 16.50, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80"],
    ["Matte Black Fountain Pen", "Fine-nib precision stainless steel writing pen with smooth ink reservoir converter.", 27.00, "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80"],
    ["Wooden Bookrest Stand", "Adjustable angle bamboo book holder suitable for study textbooks, cookbooks, and tablets.", 21.00, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80"],
    ["Leather Cable Organizer Pouch", "Compact roll-up genuine leather pouch for storing earbuds, charging cables, and flash drives.", 23.50, "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80"],
    ["Minimalist Wall Clock", "Silent non-ticking quartz wall clock featuring a natural wood frame and crisp white modern face.", 31.00, "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500&q=80"],

    // --- Fitness & Outdoor (41 - 45) ---
    ["Non-Slip Yoga Mat", "Eco-friendly high-density 6mm cushioned TPE exercise mat with alignment guide lines and carry strap.", 35.00, "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80"],
    ["Adjustable Dumbbell Set", "Space-saving steel barbell and dumbbell combo with non-slip grips for home strength workouts.", 85.00, "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80"],
    ["Speed Jump Rope", "Tangle-free steel wire jump rope with 360-degree ball bearings and lightweight ergonomic handles.", 14.99, "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80"],
    ["Deep Tissue Foam Roller", "High-density EVA foam muscle roller designed for post-workout recovery and trigger-point therapy.", 22.50, "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&q=80"],
    ["Resistance Exercise Bands", "Set of 5 color-coded natural latex loop bands ranging from light to extra-heavy resistance.", 15.00, "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=500&q=80"],

    // --- Gadgets & Everyday Carry (46 - 50) ---
    ["Multitool Pocket Knife", "14-in-1 stainless steel pocket tool featuring pliers, knife, screwdriver, bottle opener, and wire cutters.", 29.99, "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=500&q=80"],
    ["LED Camping Lantern", "Rechargeable 1000-lumen emergency camping lantern with built-in power bank phone charging port.", 26.00, "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=500&q=80"],
    ["UV Phone Sanitizer Box", "Clinically tested dual UV-C sterilization box cleaning phones, keys, and cards in 5 minutes.", 33.00, "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=500&q=80"],
    ["Titanium Key Carabiner", "Ultralight corrosion-resistant everyday-carry key clip with integrated bottle opener hook.", 17.50, "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80"],
    ["Wireless Presentation Clicker", "Ergonomic 2.4GHz red light presenter pointer with 100-foot wireless range for slide decks.", 19.99, "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&q=80"]
  ];

  // Seed all 50 products if fewer than 50
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (row && row.count < 50) {
      db.run("DELETE FROM products", () => {
        const stmt = db.prepare("INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)");
        products.forEach(p => stmt.run(p[0], p[1], p[2], p[3]));
        stmt.finalize();
        console.log("Successfully seeded 50 products into database.");
      });
    }
  });
});

module.exports = db;