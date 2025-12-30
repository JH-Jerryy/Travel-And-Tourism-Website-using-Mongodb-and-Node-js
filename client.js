const API_URL = "http://localhost:3000/api";

// GLOBAL: Handle Navbar Login State on every page
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const navLinks = document.querySelector(".nav-links");

    if (navLinks && user) {
        // Remove 'Login' link
        const loginLink = Array.from(navLinks.children).find(a => a.innerText === 'Login');
        if(loginLink) loginLink.remove();

        // Add Dashboard and Logout
        navLinks.innerHTML += `
            <a href="dashboard.html">Dashboard</a>
            <a href="#" onclick="logout(event)" class="btn-gold" style="color:black;">Logout</a>
        `;
    }

    // Route Logic
    const path = window.location.pathname;
    if (path.includes("packages.html")) loadPackages();
    if (path.includes("locations.html")) loadLocations();
    if (path.includes("dashboard.html")) loadDashboard();
    if (path.includes("book.html")) loadBookingPage();
});

// AUTH
async function handleLogin(e) {
    e.preventDefault();
    const data = { 
        email: e.target.email.value, 
        password: e.target.password.value 
    };
    const res = await fetch(`${API_URL}/login`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data)});
    const result = await res.json();
    if(result.success) {
        localStorage.setItem("user", JSON.stringify(result.user));
        window.location.href = "home.html";
    } else {
        alert(result.message);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const data = {
        username: e.target.username.value,
        email: e.target.email.value,
        password: e.target.password.value
    };
    const res = await fetch(`${API_URL}/signup`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data)});
    const result = await res.json();
    if(result.success) {
        alert("Account Created! Please Login.");
        closeModal();
        openModal('login');
    } else {
        alert(result.message);
    }
}

function logout(e) {
    if(e) e.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

// PACKAGES
async function loadPackages() {
    const urlParams = new URLSearchParams(window.location.search);
    const loc = urlParams.get('loc');
    const url = loc ? `${API_URL}/packages?loc=${loc}` : `${API_URL}/packages`;
    
    const res = await fetch(url);
    const packages = await res.json();
    
    if(loc) document.querySelector('.section-title').innerText = loc + " Packages";

    const container = document.querySelector('.grid-container');
    container.innerHTML = packages.map(pkg => `
        <div class="package-card">
            <img src="${pkg.image_url}" alt="${pkg.title}">
            <div class="package-info">
                <h3>${pkg.title}</h3>
                <p style="color:#aaa; font-size:0.9rem; margin:10px 0;">${pkg.duration}</p>
                <p style="margin-bottom:15px;">${pkg.description}</p>
                <div class="price-tag">Rs ${pkg.price.toLocaleString()}</div>
                <a href="book.html?id=${pkg._id}" class="btn-gold" style="width:100%; text-align:center;">Book Now</a>
            </div>
        </div>
    `).join('');
}

// LOCATIONS
async function loadLocations() {
    const res = await fetch(`${API_URL}/locations`);
    const locations = await res.json();
    
    const container = document.querySelector('.grid-container');
    container.innerHTML = locations.map(loc => `
        <a href="packages.html?loc=${loc.location}">
            <div class="location-card">
                <img src="${loc.image}" alt="${loc.location}">
                <div class="card-overlay">
                    <h2 style="color:white; text-transform:uppercase;">${loc.location}</h2>
                    <span style="color:var(--gold);">Explore Packages &rarr;</span>
                </div>
            </div>
        </a>
    `).join('');
}

// BOOKING PAGE
async function loadBookingPage() {
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user) window.location.href = "index.html";

    const id = new URLSearchParams(window.location.search).get('id');
    const res = await fetch(`${API_URL}/package/${id}`);
    const pkg = await res.json();

    document.getElementById('pkg-title').innerText = pkg.title;
    document.getElementById('totalPrice').innerText = pkg.price.toLocaleString();
    const price = pkg.price;

    const dateInput = document.getElementsByName('date')[0];
    if (dateInput) {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(today.getDate()).padStart(2, '0');
        
        // Set the 'min' attribute so users cannot click previous days
        dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    const travelersInput = document.getElementById('travelers');
    travelersInput.addEventListener('input', (e) => {
        document.getElementById('totalPrice').innerText = (e.target.value * price).toLocaleString();
    });

    document.getElementById('bookingForm').onsubmit = async (e) => {
        e.preventDefault();
        
        // Extra Security: Double check the date here before sending
        const selectedDate = e.target.date.value;
        const todayStr = new Date().toISOString().split('T')[0];
        if(selectedDate < todayStr) {
            alert("Error: You cannot travel in the past!");
            return;
        }

        const bookingData = {
            user_id: user.id,
            package_id: pkg._id,
            travel_date: selectedDate,
            travelers: e.target.travelers.value,
            total_cost: e.target.travelers.value * price,
            payment_method: e.target.payment.value
        };
        
        await fetch(`${API_URL}/book`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(bookingData)});
        window.location.href = "dashboard.html";
    };
}
// DASHBOARD
async function loadDashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user) window.location.href = "index.html";
    
    document.querySelector('h2').innerText = `Welcome, ${user.username}`;
    const res = await fetch(`${API_URL}/my-bookings?user_id=${user.id}`);
    const bookings = await res.json();
    
    const tbody = document.querySelector('tbody');
    if(bookings.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5'>No bookings found.</td></tr>";
    } else {
        tbody.innerHTML = bookings.map(b => `
            <tr>
                <td>${b.package_id.title}</td>
                <td>${b.package_id.location}</td>
                <td>${b.travel_date}</td>
                <td style="color:var(--gold);">Rs ${b.total_cost.toLocaleString()}</td>
                <td><span style="color:#4caf50; font-weight:bold;">${b.status}</span></td>
            </tr>
        `).join('');
    }
}

// CONTACT
async function handleContact(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await fetch(`${API_URL}/contact`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data)});
    document.getElementById('msg-box').innerHTML = "<p style='color:#4caf50;'>Message Sent!</p>";
}