// Customer Authentication for Nails By Sau
// Handles customer login/logout and session management

class CustomerAuth {
    constructor() {
        this.currentCustomer = null;
        this.init();
    }

    // Initialize customer authentication
    init() {
        // Check if customer is already logged in
        this.checkAuthState();
        
        // Listen for auth state changes
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // Check if this is an admin user
                if (this.isAdminUser(user)) {
                    // Admin user - don't treat as customer
                    this.currentCustomer = null;
                    this.updateUIForGuest();
                    return;
                }
                
                // Customer is logged in
                this.currentCustomer = user;
                this.updateUIForCustomer();
            } else {
                // No customer logged in
                this.currentCustomer = null;
                this.updateUIForGuest();
            }
        });
    }

    // Check if customer is logged in
    checkAuthState() {
        const user = firebase.auth().currentUser;
        if (user) {
            // Check if this is an admin user
            if (this.isAdminUser(user)) {
                // Admin user - don't treat as customer
                this.currentCustomer = null;
                this.updateUIForGuest();
                return;
            }
            
            this.currentCustomer = user;
            this.updateUIForCustomer();
        }
    }

    // Customer login with email and password
    async signInCustomer(email, password) {
        try {
            // Check if admin is already logged in
            if (localStorage.getItem('adminAuth') === 'true') {
                return { success: false, error: 'Admin is already logged in. Please logout from admin panel first.' };
            }
            
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            
            // Check if this is an admin user trying to login as customer
            if (this.isAdminUser(userCredential.user)) {
                await firebase.auth().signOut();
                return { success: false, error: 'Admin users cannot login as customers. Please use the admin login.' };
            }
            
            this.currentCustomer = userCredential.user;
            this.updateUIForCustomer();
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Customer login error:', error);
            return { success: false, error: error.message };
        }
    }

    // Customer registration
    async registerCustomer(email, password, firstName, lastName, phone) {
        try {
            // Check if admin is already logged in
            if (localStorage.getItem('adminAuth') === 'true') {
                return { success: false, error: 'Admin is already logged in. Please logout from admin panel first.' };
            }
            
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update user profile
            await user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });

            // Save additional customer info to Firestore
            await firebase.firestore().collection('customers').doc(user.uid).set({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'customer'
            });

            this.currentCustomer = user;
            this.updateUIForCustomer();
            return { success: true, user: user };
        } catch (error) {
            console.error('Customer registration error:', error);
            return { success: false, error: error.message };
        }
    }

    // Customer logout
    async signOutCustomer() {
        try {
            await firebase.auth().signOut();
            this.currentCustomer = null;
            this.updateUIForGuest();
            return { success: true };
        } catch (error) {
            console.error('Customer logout error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get customer's appointments
    async getCustomerAppointments() {
        if (!this.currentCustomer) {
            return { success: false, error: 'No customer logged in' };
        }

        try {
            const db = firebase.firestore();
            const user = this.currentCustomer;

            // Prefer fetching by UID if available, fallback to email
            let query = db.collection('appointments').where('customerUid', '==', user.uid);
            let snapshot = await query.orderBy('appointmentDate', 'desc').get();

            if (snapshot.empty) {
                snapshot = await db.collection('appointments')
                    .where('email', '==', user.email)
                    .orderBy('appointmentDate', 'desc')
                    .get();
            }

            const appointmentsList = [];
            snapshot.forEach(doc => {
                appointmentsList.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, appointments: appointmentsList };
        } catch (error) {
            console.error('Error fetching customer appointments:', error);
            return { success: false, error: error.message };
        }
    }

    // Update customer profile
    async updateCustomerProfile(updates) {
        if (!this.currentCustomer) {
            return { success: false, error: 'No customer logged in' };
        }

        try {
            await firebase.firestore()
                .collection('customers')
                .doc(this.currentCustomer.uid)
                .update(updates);

            return { success: true };
        } catch (error) {
            console.error('Error updating customer profile:', error);
            return { success: false, error: error.message };
        }
    }

    // Update UI for logged-in customer
    updateUIForCustomer() {
        // Hide admin links
        const adminLinks = document.querySelectorAll('.admin-only');
        adminLinks.forEach(link => link.style.display = 'none');

        // Hide guest-only links (e.g., Customer Login) when logged in
        const guestOnlyLinks = document.querySelectorAll('.guest-only');
        guestOnlyLinks.forEach(link => link.style.display = 'none');

        // Show customer links
        const customerLinks = document.querySelectorAll('.customer-only');
        customerLinks.forEach(link => link.style.display = 'block');

        // Update navigation
        this.updateNavigationForCustomer();
        
        // Only redirect if we're on login page and user is logged in
        if (window.location.pathname.includes('customer-login.html')) {
            setTimeout(() => {
                window.location.href = 'customer-dashboard.html';
            }, 1000);
        }
    }

    // Update UI for guest (not logged in)
    updateUIForGuest() {
        // Show admin links (if admin is logged in)
        const adminLinks = document.querySelectorAll('.admin-only');
        adminLinks.forEach(link => link.style.display = 'block');

        // Hide customer links
        const customerLinks = document.querySelectorAll('.customer-only');
        customerLinks.forEach(link => link.style.display = 'none');

        // Show guest-only links when not logged in
        const guestOnlyLinks = document.querySelectorAll('.guest-only');
        guestOnlyLinks.forEach(link => link.style.display = 'block');

        // Update navigation
        this.updateNavigationForGuest();
        
        // Only redirect if we're on customer dashboard and user is not logged in
        if (window.location.pathname.includes('customer-dashboard.html')) {
            setTimeout(() => {
                window.location.href = 'customer-login.html';
            }, 1000);
        }
    }

    // Update navigation for customer
    updateNavigationForCustomer() {
        const nav = document.querySelector('nav');
        if (nav) {
            // Add customer-specific navigation items
            const customerNav = `
                <li class="nav-item customer-only">
                    <a href="customer-dashboard.html" class="nav-link">
                        <i class="fas fa-user"></i> My Appointments
                    </a>
                </li>
                <li class="nav-item customer-only">
                    <a href="#" onclick="window.CustomerAuth.signOutCustomer()" class="nav-link">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </li>
            `;
            
            // Remove existing customer nav items first
            const existingCustomerNav = nav.querySelectorAll('.customer-only');
            existingCustomerNav.forEach(item => item.remove());
            
            // Add new customer nav items
            nav.insertAdjacentHTML('beforeend', customerNav);
        }
    }

    // Update navigation for guest
    updateNavigationForGuest() {
        const nav = document.querySelector('nav');
        if (nav) {
            // Remove customer nav items
            const customerNavItems = nav.querySelectorAll('.customer-only');
            customerNavItems.forEach(item => item.remove());
        }
    }

    // Check if current user is admin
    isAdmin() {
        return this.currentCustomer && this.isAdminUser(this.currentCustomer);
    }
    
    // Check if a user is an admin user
    isAdminUser(user) {
        if (!user || !user.email) return false;
        
        // Strict admin email allowlist
        const adminEmails = [
            'survesaurabhi7@gmail.com'
        ];
        
        return adminEmails.includes(user.email.toLowerCase());
    }

    // Check if current user is customer
    isCustomer() {
        return this.currentCustomer && !this.isAdmin();
    }

    // Get current customer info
    getCurrentCustomer() {
        return this.currentCustomer;
    }
}

// Initialize customer authentication
window.CustomerAuth = new CustomerAuth();
