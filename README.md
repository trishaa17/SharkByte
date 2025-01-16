# Hack for Good (H4G) 2025 - Team SharkByte

## Project Title: Web-based Minimart and Voucher System for Muhammadiyah Welfare Home

### Problem Statement
Design and develop a web-based Minimart and Voucher System for Muhammadiyah Welfare Home (MWH), enabling users to request products and earn vouchers while providing administrators with robust management and reporting tools.

### About Muhammadiyah Welfare Home (MWH)
The Muhammadiyah Welfare Home is dedicated to providing care and support for boys residing on its campus, fostering a nurturing environment to help them thrive.

### Vision for Hackathon Teams
The project aims to:
- Empower residents to request products, earn vouchers, and manage their accounts.
- Provide MWH staff with robust tools for user management, voucher approvals, inventory tracking, and reporting.

Participants are tasked with designing a practical and secure system that optimizes usability and minimizes transaction time. The solution will roll out in three phases, starting with a prototype and potentially including additional features like auctions.

### Features Implemented

#### Authentication System
- **Login and Signup Pages**: Separate login and signup functionality for two types of users: Residents and Staff.
- **Forget Password Page**: Allows users to reset their password securely.

#### Resident Features
1. **Homepage**:
   - View a list of products available for purchase or pre-order when out of stock.

2. **Transaction History**:
   - Track purchased and pre-ordered items.
   - Items labeled with tags for status:
     - **Pending**: Out-of-stock items being restocked (Yellow tag).
     - **Available**: Items in stock (Green tag).
     - **Unavailable**: Items that cannot be restocked (Red tag).
   - Actions:
     - Buy available products.
     - Remove items from pre-orders.
   - Filtering by tags or date for better organization.
   - View detailed history of purchased items, including quantity and credits used.

3. **Voucher Request Page**:
   - Request additional vouchers from staff.
   - View history of voucher requests and available credits.

4. **Profile Page**:
   - Change password and sign out.

#### Staff Features
1. **Inventory Management**:
   - Add new products or update availability.
   - Automatically updates items for residents to view and purchase.

2. **Voucher Management**:
   - Approve or reject voucher requests from residents.

3. **Account Management**:
   - Add or suspend resident accounts.

4. **Product Request Management**:
   - View and manage product requests submitted by residents for purchases or pre-orders.

5. **Reports Page**:
   - Generate weekly summaries of requests and inventory.
   - Compare items purchased or remaining stock over a week.

6. **Profile Page**:
   - Change password and sign out.

### Technology Stack
- **Frontend**: Next.js
- **Backend**: Firebase (Firestore, Authentication)
- **Tools**: Firebase Analytics, Firestore Functions

### How It Works
1. Residents and staff access the system using their unique accounts.
2. Residents can:
   - Browse products, purchase or pre-order items, and track their transactions.
   - Request vouchers and manage their account.
3. Staff can:
   - Manage inventory and voucher requests.
   - Approve or reject product requests.
   - Access comprehensive reports for effective decision-making.

### Future Enhancements
- **Auction Feature**: Introduce a system where residents can bid on exclusive items.
- **Gamification**: Reward residents for consistent participation.
- **Mobile App**: Expand accessibility to mobile platforms.

### Contribution
This project was created by **Team SharkByte** as part of the **Hack for Good (H4G) 2025** hackathon. Together, we aim to empower MWH and its residents through innovative and impactful technology.

---

For questions or contributions, feel free to contact us!

