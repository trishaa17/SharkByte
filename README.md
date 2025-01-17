# Hack for Good (H4G) 2025 - Team SharkByte

## Project Title: Web-based Minimart and Voucher System for Muhammadiyah Welfare Home (MWH)

### Problem Statement
This project aims to design and develop a web-based Minimart and Voucher System for Muhammadiyah Welfare Home (MWH). The system allows residents to request products, earn vouchers, and manage their accounts while providing MWH staff with comprehensive management and reporting tools.

### About Muhammadiyah Welfare Home (MWH)
Muhammadiyah Welfare Home is dedicated to providing care and support for boys living on its campus. The home offers a nurturing environment to help residents thrive by meeting their physical, emotional, and educational needs.

### Vision for Hackathon Teams
The goal of this project is to:
- Empower residents to easily request products, earn vouchers, and manage their accounts.
- Equip MWH staff with robust tools for inventory management, voucher approval, user management, and reporting.
- Optimize system usability and minimize transaction time to ensure a seamless experience for all users.
  
The solution will roll out in three phases, starting with the prototype and potentially expanding with additional features like auctions.

### Features Implemented

#### Authentication System
- **Login and Signup Pages**: Separate login and signup functionality for two types of users: Residents and Staff.
- **Forgot Password Page**: Allows users to reset their password securely.

#### Resident Features
1. **Homepage**:
   - View a list of products available for purchase or click pre-order when out of stock.
   - Products are Halal and consist of snacks, daily necessities, and welfare products for the residents of the welfare home.
   - Given enough stock of the item, user can send a buy request to the admins by clicking the buy button after specifying the quantity. 
  
2. **Vouchers Page**:
   - Request for vouchers, which will be sent to the voucher management page on the admin side.
   - View history of voucher requests and available credits.
  
3. **Pre-order Page**:
   - Pre-order requests for out of stock items will appear here.
   - These requests can have 5 different statuses:
     - **Pending**: Out-of-stock items is being restocked (Yellow tag).
     - **Available**: Items are now in stock (Green tag).
     - **Unavailable**: Items that cannot be restocked (Red tag).
     - **Bought**: Pre-ordered items was restocked and user chose to buy the product (Blue tag).
     - **Cancelled**: Pre-ordered items was restocked and user chose not to buy the product (Purple tag).
   - When the product is now available in the pre-order page, user can choose to buy or cancel that item.

4. **Transaction History**:
   - Shows records of products requested by the user.
   - Each record keeps track of the date and time purchased, product name, quantity purchased, credits used and status.
   - These requests can have 2 different statuses:
     - **Completed**: Buy request has been approved by admin.
     - **Pending**: Buy request is still being processed by admin.
   - Filtering by date for better organization.

5. **Profile Page**:
   - Change password and log out.

#### Staff Features
1. **Inventory Management**:
   - Add new products or update quantity of items.
   - Automatically updates items for residents to view and purchase.

2. **Voucher Management**:
   - Approve or reject voucher requests from residents.

3. **Manage Users**:
   - Add or suspend resident accounts.
   - Reset resident account password.
   - Add credits to resident accounts.

4. **Product Request Management**:
   - View and manage product requests submitted by residents for purchases or pre-orders.

5. **Reports Page**:
   - 2 types of reports: General and Weekly report
   - General report contains overall metrics obtained from the user-side data, including the inventory summary, and the total credits utilised
   - The weekly report Compare items purchased or remaining stock over a week.

6. **Profile Page**:
   - Change password and log out.

### Technology Stack
- **Frontend**: Next.js
- **Backend**: Firebase (Firestore, Authentication)
- **Tools**: Firebase Analytics, Firestore Functions

### How It Works
1. Residents and staff access the system using their unique accounts.
2. **Residents** can:
   - Browse products, purchase or pre-order items, and track their transactions.
   - Request vouchers and manage their accounts.
3. **Staff** can:
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
