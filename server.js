// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. CONNECT TO MONGODB
mongoose.connect('mongodb://127.0.0.1:27017/tourenzo_db')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

// 2. DEFINE SCHEMAS (Based on your SQL Tables)
const UserSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String, 
    role: { type: String, default: 'customer' }
});
const User = mongoose.model('User', UserSchema);

const PackageSchema = new mongoose.Schema({
    title: String,
    description: String,
    location: String,
    price: Number,
    image_url: String,
    duration: String
});
const Package = mongoose.model('Package', PackageSchema);

const BookingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    travel_date: String,
    travelers: Number,
    total_cost: Number,
    payment_method: String,
    status: { type: String, default: 'confirmed' }
});
const Booking = mongoose.model('Booking', BookingSchema);

const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
});
const Contact = mongoose.model('Contact', ContactSchema);

// Login (Secure Version)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        return res.json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) { 
        res.json({ success: true, user: { id: user._id, username: user.username, email: user.email } });
    } else {
        res.json({ success: false, message: "Invalid credentials" });
    }
});
// Signup (Secure Version)
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword 
        }); 
        await newUser.save();
        res.json({ success: true, message: "Registered successfully!" });
    } catch (err) {
        res.json({ success: false, message: "Email already exists" });
    }
});

// Get Packages
app.get('/api/packages', async (req, res) => {
    const { loc } = req.query;
    const query = loc ? { location: loc } : {};
    const packages = await Package.find(query);
    res.json(packages);
});

// Get Locations (Unique)
app.get('/api/locations', async (req, res) => {
    // Aggregation to pick one image per location, just like your SQL GROUP BY
    const locations = await Package.aggregate([
        { $group: { _id: "$location", image: { $first: "$image_url" } } }
    ]);
    res.json(locations.map(l => ({ location: l._id, image: l.image })));
});

// Get Single Package
app.get('/api/package/:id', async (req, res) => {
    const pkg = await Package.findById(req.params.id);
    res.json(pkg);
});

// Book Trip
app.post('/api/book', async (req, res) => {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ success: true });
});

// User Dashboard
app.get('/api/my-bookings', async (req, res) => {
    const { user_id } = req.query;
    const bookings = await Booking.find({ user_id }).populate('package_id');
    res.json(bookings);
});

// Contact
app.post('/api/contact', async (req, res) => {
    const msg = new Contact(req.body);
    await msg.save();
    res.json({ success: true });
});

// --- DATA SEEDER (RUN ONCE) ---
app.get('/seed', async (req, res) => {
    const count = await Package.countDocuments();
    if (count === 0) {
        const allPackages = [
            { title: 'Maldives Overwater Bliss', description: 'Stay in a 5-star overwater bungalow with private infinity pool and underwater dining experience.', location: 'Maldives', price: 450000.00, image_url: 'assets/images/location1.1.jpg', duration: '5 Days' },
            { title: 'Private Island Escape', description: 'Rent an entire small island for ultimate privacy, including a personal chef and yacht transfer.', location: 'Maldives', price: 850000.00, image_url: 'assets/images/location1.2.jpg', duration: '7 Days' },
            { title: 'Coral Reef Safari', description: 'Guided diving tour of the best coral reefs with luxury boat accommodation.', location: 'Maldives', price: 300000.00, image_url: 'assets/images/location1.3.jpg', duration: '4 Days' },
            { title: 'Zermatt Ski Luxury', description: 'Ski-in/Ski-out chalet with views of the Matterhorn, including spa and helicopter drop-off.', location: 'Switzerland', price: 500000.00, image_url: 'assets/images/location2.1.jpg', duration: '5 Days' },
            { title: 'Grand Train Tour', description: 'First-class travel on the Glacier Express through the Swiss Alps, staying in Zurich and Geneva.', location: 'Switzerland', price: 420000.00, image_url: 'assets/images/location2.2.jpg', duration: '8 Days' },
            { title: 'Lucerne Lake Retreat', description: 'Relax by Lake Lucerne in a historic grand hotel with private boat tours.', location: 'Switzerland', price: 350000.00, image_url: 'assets/images/location2.3.jpg', duration: '4 Days' },
            { title: 'Tokyo & Kyoto VIP', description: 'Experience the neon lights of Tokyo and the traditional temples of Kyoto with a private guide.', location: 'Japan', price: 550000.00, image_url: 'assets/images/location3.1.jpg', duration: '7 Days' },
            { title: 'Cherry Blossom Special', description: 'A seasonal tour of the best Sakura spots, including a stay in a luxury Ryokan with Onsen.', location: 'Japan', price: 600000.00, image_url: 'assets/images/location3.2.jpg', duration: '6 Days' },
            { title: 'Osaka Food Tour', description: 'A culinary journey through the street food capital of Japan with celebrity chef meetups.', location: 'Japan', price: 250000.00, image_url: 'assets/images/location3.3.jpg', duration: '4 Days' },
            { title: 'Dubai Royal Experience', description: 'Penthouse stay at Atlantis The Royal, helicopter city tour, and gold souk private shopping.', location: 'Dubai', price: 400000.00, image_url: 'assets/images/location4.1.jpg', duration: '5 Days' },
            { title: 'Desert Glamping', description: 'Luxury air-conditioned dome tents in the Arabian desert with falconry and dune bashing.', location: 'Dubai', price: 250000.00, image_url: 'assets/images/location4.2.jpg', duration: '3 Days' },
            { title: 'Marina Yacht Cruise', description: 'Private yacht party around the Palm Jumeirah with catering and live music.', location: 'Dubai', price: 300000.00, image_url: 'assets/images/location4.3.jpg', duration: '4 Days' },
            { title: 'Venice & Florence', description: 'Gondola rides in Venice and art tours in Florence, staying in historic palazzos.', location: 'Italy', price: 480000.00, image_url: 'assets/images/location5.1.jpg', duration: '6 Days' },
            { title: 'Amalfi Coast Yacht', description: 'Sail the Amalfi coast on a private yacht, visiting Positano, Capri, and Sorrento.', location: 'Italy', price: 750000.00, image_url: 'assets/images/location5.2.jpg', duration: '7 Days' },
            { title: 'Parisian Romance', description: 'Dinner at the Eiffel Tower, private Louvre tour, and stay at The Ritz Paris.', location: 'France', price: 520000.00, image_url: 'assets/images/location6.1.jpg', duration: '5 Days' },
            { title: 'French Riviera', description: 'Explore Nice, Cannes, and Monaco in a convertible luxury car.', location: 'France', price: 600000.00, image_url: 'assets/images/location6.2.jpg', duration: '6 Days' },
            { title: 'Manhattan VIP', description: 'Times Square hotel suite, Broadway VIP tickets, and helicopter tour over the Statue of Liberty.', location: 'New York', price: 450000.00, image_url: 'assets/images/location7.1.jpg', duration: '5 Days' },
            { title: 'The Hamptons Escape', description: 'Relax in a beachfront mansion in The Hamptons with private drivers.', location: 'New York', price: 500000.00, image_url: 'assets/images/location7.2.jpg', duration: '4 Days' },
            { title: 'Ubud Jungle Villa', description: 'Private pool villa in the jungle, floating breakfast, and private yoga sessions.', location: 'Bali', price: 200000.00, image_url: 'assets/images/location8.1.jpg', duration: '5 Days' },
            { title: 'Seminyak Beach Club', description: 'Access to VIP beach clubs, surfing lessons, and beachfront luxury suite.', location: 'Bali', price: 220000.00, image_url: 'assets/images/location8.2.jpg', duration: '6 Days' },
            { title: 'Santorini Sunset', description: 'Cave hotel in Oia with caldera views, wine tasting, and catamaran sunset cruise.', location: 'Greece', price: 450000.00, image_url: 'assets/images/location9.1.jpg', duration: '5 Days' },
            { title: 'Mykonos Party Week', description: 'VIP access to world-famous beach clubs and private villa stay.', location: 'Greece', price: 480000.00, image_url: 'assets/images/location9.2.jpg', duration: '7 Days' },
            { title: 'Pyramids & Nile', description: 'Private viewing of the Pyramids of Giza and a 5-star luxury cruise down the Nile river.', location: 'Egypt', price: 350000.00, image_url: 'assets/images/location10.1.jpg', duration: '6 Days' },
            { title: 'Luxury Cairo', description: 'Stay at the Four Seasons Cairo with guided museum tours and market visits.', location: 'Egypt', price: 280000.00, image_url: 'assets/images/location10.2.jpg', duration: '4 Days' },
            { title: 'Cappadocia Balloons', description: 'Sleep in a luxury cave hotel and take a sunrise hot air balloon flight.', location: 'Turkey', price: 320000.00, image_url: 'assets/images/location11.1.jpg', duration: '4 Days' },
            { title: 'Istanbul Historic', description: 'Private tours of Hagia Sophia and Blue Mosque, stay in a Bosphorus-view palace.', location: 'Turkey', price: 300000.00, image_url: 'assets/images/location11.2.jpg', duration: '5 Days' },
            { title: 'Phuket Luxury Resort', description: '5-star beachfront resort with island hopping tours to Phi Phi islands.', location: 'Thailand', price: 250000.00, image_url: 'assets/images/location12.1.jpg', duration: '6 Days' },
            { title: 'Bangkok City Lights', description: 'Rooftop dining experiences, temple tours, and luxury shopping in Siam.', location: 'Thailand', price: 200000.00, image_url: 'assets/images/location12.2.jpg', duration: '4 Days' }
        ];
        await Package.insertMany(allPackages);
        res.send("All Packages inserted successfully!");
    } else {
        res.send("Data already exists.");
    }
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));