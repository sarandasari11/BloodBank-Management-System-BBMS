# 🩸 Blood Bank Management System (BBMS)

A premium, modern Web Application for managing blood bank directories, transaction history, inventory levels, and hospital requests. Featuring glassmorphism aesthetics, dynamic Recharts data visualizations, a custom-animated hanging blood bag rack, intelligent live stock validation, and a smooth Dark/Light mode theme.

---

## 🚀 Key Features

*   **📊 Live Dashboard Overview**: Analytics widgets showing key stats (donors, donations, hospital networks, pending items), compatibility matrices, and a live Recharts bar chart showing stock levels with low-stock warnings.
*   **🩸 Live Hanging Rack Visualizer**: An interactive CSS-animated hanging bag visualization where liquid levels match stock volumes. Features warning-orange hover states, low-stock blinking shortage indicators, and custom labels.
*   **📜 Complete Registry Management**:
    *   **Donations**: Register donor donations, tracking quantities, dates, and automatically updating stock.
    *   **Donors**: Manage donor database files, contact information, and blood groups.
    *   **Hospitals**: Track partner hospitals, coordinates, and emergency contacts.
    *   **Requests**: Hospital request pipeline with status filters (All, Pending, Approved, Rejected) styled using a custom sliding pill component.
*   **⚠️ Intelligent Stock Level Alarms**: Auto-calculates stock feasibility for pending requests:
    *   `✓ Stock Sufficient`
    *   `⚠️ Low Stock Warning`
    *   `⚠️ Insufficient Stock`
*   **🌓 Sleek Dark & Light Mode**: Premium typography and glassmorphic colors adapted for both light environments and deep charcoal dark environments.
*   **⚙️ Database Seeding & Override**: Single-click database reset and manual overrides to adjust stock amounts instantly.

---

## 📁 Folder Structure

```text
blood-bank-app/
├── client/                      # React Frontend Application
│   ├── public/                  # Static assets & custom button icon images
│   │   └── images/
│   │       ├── reset_icon.png
│   │       ├── add_icon.png
│   │       ├── donor_icon.png
│   │       └── request_icon.png
│   ├── src/
│   │   ├── components/          # Reusable shared components
│   │   │   ├── Footer.js        # Global layout footer
│   │   │   ├── Navbar.js        # Header bar with theme toggle & active indicators
│   │   │   └── NotificationProvider.js # Toast notifications & confirm modals
│   │   ├── pages/               # Main application pages
│   │   │   ├── DashboardOverview.js   # Main analytics, charts, & seeder
│   │   │   ├── DonationManagement.js   # Record/list donation receipts
│   │   │   ├── DonorManagement.js      # List/manage registered donors
│   │   │   ├── HospitalManagement.js   # Partner hospital directory
│   │   │   ├── InventoryManagement.js  # Live hanging rack visualizer & manual override
│   │   │   └── RequestManagement.js    # Hospital request pipeline & status pill filter
│   │   ├── App.js               # Router entry and layout wrapping
│   │   ├── index.css            # Standard root directives
│   │   ├── index.js             # React DOM mounting
│   │   └── styles.css           # Custom theme design tokens, glassmorphism, & animations
│   ├── package.json             # Frontend dependency setup
│   └── README.md                # Client readme
│
├── server/                      # Express.js REST API Backend
│   ├── models/                  # Mongoose MongoDB schemas
│   │   ├── BloodRequest.js      # Hospital blood requests model
│   │   ├── Donation.js          # Donor donation receipts model
│   │   ├── Donor.js             # Registered donor profiles model
│   │   ├── Hospital.js          # Partner hospitals model
│   │   └── Inventory.js         # Blood group inventory stock tracker
│   ├── routes/
│   │   └── api.js               # Controller endpoints for CRUD & Seeding
│   ├── app.js                   # Express server entry point
│   └── package.json             # Backend dependency setup
│
└── README.md                    # Root project documentation (This file)
```

---

## 🛠️ Technology Stack

*   **Frontend**: React (Hooks, Router v6), Recharts (data visualizations), Axios (HTTP client), Vanilla CSS (Glassmorphism & animations).
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose ODM).

---

## ⚙️ REST API Endpoints (`/api`)

*   **Database Seeding**:
    *   `POST /seed` - Resets and seeds the MongoDB database with dummy records.
*   **Stats**:
    *   `GET /stats` - Retrieves system-wide aggregates for analytics cards.
*   **Inventory**:
    *   `GET /inventory` - Lists current stock quantities.
    *   `PUT /inventory/manual` - Overrides stock level for a specific blood group.
*   **Donors**:
    *   `GET /donors` - Lists all registered donors.
    *   `POST /donors` - Registers a new donor.
*   **Donations**:
    *   `GET /donations` - Lists all donation history.
    *   `POST /donations` - Records a new donation and increments blood inventory.
*   **Hospitals**:
    *   `GET /hospitals` - Lists all registered partner hospitals.
    *   `POST /hospitals` - Adds a new hospital to the directory.
*   **Requests**:
    *   `GET /requests` - Lists all hospital blood requests.
    *   `POST /requests` - Submits a new hospital blood request.
    *   `PUT /requests/:id` - Approves/rejects a pending request (adjusts inventory accordingly).
    *   `DELETE /requests/:id` - Deletes a request record.

---

## 🚀 Installation & Running Locally

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed and a running [MongoDB](https://www.mongodb.com/) database instance.

### 2. Setting Up the Server
Navigate to the server directory:
```bash
cd server
npm install
```

Configure your MongoDB URI inside `server/app.js` (defaults to `mongodb://localhost:27017/bloodbank`).

Run the backend server:
```bash
node app.js
```
The server will run on `http://localhost:5000`.

### 3. Setting Up the Client
Navigate to the client directory:
```bash
cd ../client
npm install
```

Run the React app in development mode:
```bash
npm start
```
The client app will launch at `http://localhost:3000`.

### 4. Database Setup
Once both apps are running, navigate to the Dashboard (main tab) and click **Reset & Seed Database** to generate realistic test data across all tabs!
