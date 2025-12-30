# ✈️ Tourenzo - Premium Travel & Tourism Platform

**Tourenzo** is a full-stack web application designed for a luxury travel agency. It allows users to explore exotic destinations, view detailed travel packages, and book trips seamlessly.

Initially conceptualized in PHP/MySQL, this project has been fully migrated to a modern **Node.js & MongoDB** architecture to ensure scalability and performance.

## 🌟 Key Features

* **🔐 Secure Authentication:** User Signup and Login system using **Bcrypt.js** for password hashing and security.
* **🌍 Dynamic Packages:** Fetches travel packages and unique locations directly from the MongoDB database.
* **📅 Smart Booking System:** Users can book trips with date validation (restricts past dates) and automatic cost calculation based on the number of travelers.
* **ax User Dashboard:** A personalized dashboard where users can view their booking history and status (Confirmed/Pending).
* **📱 Responsive Design:** Fully responsive UI built with HTML5, CSS3, and JavaScript, featuring video backgrounds and smooth animations.
* **⚙️ Database Seeder:** Includes a one-click seeding route to populate the database with 28+ exclusive travel packages.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (using Mongoose ODM)
* **Security:** Bcrypt.js for encryption, CORS

## 🚀 How to Run Locally

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/tourenzo-mongo.git](https://github.com/your-username/tourenzo-mongo.git)
    cd tourenzo-mongo
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start MongoDB**
    Make sure your MongoDB Community Server is running in the background.

4.  **Run the Server**
    ```bash
    node server.js
    ```

5.  **Seed the Data (First Time Only)**
    Visit `http://localhost:3000/seed` in your browser to populate the database with initial packages.

6.  **Access the App**
    Open `http://localhost:3000/index.html` to start exploring.

---

**Developed by [Javeria Hassan]**
