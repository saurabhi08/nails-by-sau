// Customer Management System for Nails By Sau
// Handles customer profiles, database operations, and profile management

class CustomerManager {
    constructor() {
        this.customers = [];
        this.currentCustomer = null;
        this.init();
    }

    // Initialize customer manager
    init() {
        this.loadCustomers();
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for profile updates
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#profile-form')) {
                this.handleProfileUpdate(e);
            }
        });

        // Listen for customer actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="edit-customer"]')) {
                this.handleEditCustomer(e.target.dataset.customerId);
            }
            if (e.target.matches('[data-action="delete-customer"]')) {
                this.handleDeleteCustomer(e.target.dataset.customerId);
            }
        });
    }

    // Load customers from Firebase and localStorage
    async loadCustomers() {
        try {
            // Try Firebase first
            const firebaseCustomers = await this.getFirebaseCustomers();
            this.customers = firebaseCustomers || [];
        } catch (error) {
            console.error('Error loading customers from Firebase:', error);
            // Fallback to localStorage
            this.customers = this.getLocalCustomers();
        }
    }

    // Get customers from Firebase
    async getFirebaseCustomers() {
        try {
            const snapshot = await firebaseDB.collection('customers')
                .orderBy('createdAt', 'desc')
                .get();
            
            const customers = [];
            snapshot.forEach(doc => {
                customers.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return customers;
        } catch (error) {
            console.error('Error getting customers from Firebase:', error);
            return [];
        }
    }

    // Get customers from localStorage
    getLocalCustomers() {
        const stored = localStorage.getItem('nailsbysau_customers');
        return stored ? JSON.parse(stored) : [];
    }

    // Save customer to Firebase
    async saveCustomer(customerData) {
        try {
            const customerId = customerData.id || 'cust_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const customerRecord = {
                ...customerData,
                id: customerId,
                createdAt: customerData.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await firebaseDB.collection('customers').doc(customerId).set(customerRecord);
            
            // Also save to localStorage as backup
            this.saveCustomerToLocal(customerRecord);
            
            console.log('Customer saved with ID:', customerId);
            return { success: true, id: customerId };
        } catch (error) {
            console.error('Error saving customer:', error);
            return { success: false, error: error.message };
        }
    }

    // Save customer to localStorage
    saveCustomerToLocal(customerData) {
        const customers = this.getLocalCustomers();
        const existingIndex = customers.findIndex(c => c.id === customerData.id);
        
        if (existingIndex >= 0) {
            customers[existingIndex] = customerData;
        } else {
            customers.push(customerData);
        }
        
        localStorage.setItem('nailsbysau_customers', JSON.stringify(customers));
    }

    // Update customer profile
    async updateCustomerProfile(customerId, profileData) {
        try {
            const customer = this.customers.find(c => c.id === customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }

            const updatedCustomer = {
                ...customer,
                ...profileData,
                updatedAt: new Date().toISOString()
            };

            const result = await this.saveCustomer(updatedCustomer);
            if (result.success) {
                // Update local array
                const index = this.customers.findIndex(c => c.id === customerId);
                if (index >= 0) {
                    this.customers[index] = updatedCustomer;
                }
                
                if (window.MessagingSystem) {
                    window.MessagingSystem.showSuccess('Profile updated successfully!');
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error updating customer profile:', error);
            if (window.MessagingSystem) {
                window.MessagingSystem.showError('Failed to update profile. Please try again.');
            }
            return { success: false, error: error.message };
        }
    }

    // Get customer by ID
    getCustomerById(customerId) {
        return this.customers.find(c => c.id === customerId);
    }

    // Get customer by email
    getCustomerByEmail(email) {
        return this.customers.find(c => c.email === email);
    }

    // Create customer profile from registration
    async createCustomerProfile(userData, additionalInfo = {}) {
        try {
            const customerData = {
                id: userData.uid || 'cust_' + Date.now(),
                email: userData.email,
                firstName: additionalInfo.firstName || '',
                lastName: additionalInfo.lastName || '',
                phone: additionalInfo.phone || '',
                address: additionalInfo.address || '',
                dateOfBirth: additionalInfo.dateOfBirth || '',
                preferences: {
                    preferredServices: [],
                    allergies: additionalInfo.allergies || '',
                    notes: additionalInfo.notes || ''
                },
                appointmentHistory: [],
                totalAppointments: 0,
                totalSpent: 0,
                loyaltyPoints: 0,
                status: 'active',
                createdAt: new Date().toISOString()
            };

            const result = await this.saveCustomer(customerData);
            if (result.success) {
                this.customers.push(customerData);
            }
            
            return result;
        } catch (error) {
            console.error('Error creating customer profile:', error);
            return { success: false, error: error.message };
        }
    }

    // Handle profile form submission
    async handleProfileUpdate(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const profileData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            dateOfBirth: formData.get('dateOfBirth'),
            preferences: {
                allergies: formData.get('allergies'),
                notes: formData.get('notes')
            }
        };

        const currentUser = window.CustomerAuth ? window.CustomerAuth.currentCustomer : null;
        if (!currentUser) {
            if (window.MessagingSystem) {
                window.MessagingSystem.showError('Please log in to update your profile.');
            }
            return;
        }

        await this.updateCustomerProfile(currentUser.uid, profileData);
    }

    // Handle edit customer (admin function)
    handleEditCustomer(customerId) {
        const customer = this.getCustomerById(customerId);
        if (!customer) {
            if (window.MessagingSystem) {
                window.MessagingSystem.showError('Customer not found.');
            }
            return;
        }

        this.showEditCustomerModal(customer);
    }

    // Show edit customer modal
    showEditCustomerModal(customer) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'edit-customer-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Customer Profile</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-customer-form">
                        <div class="form-group">
                            <label for="edit-firstName">First Name</label>
                            <input type="text" id="edit-firstName" name="firstName" value="${customer.firstName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-lastName">Last Name</label>
                            <input type="text" id="edit-lastName" name="lastName" value="${customer.lastName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-email">Email</label>
                            <input type="email" id="edit-email" name="email" value="${customer.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-phone">Phone</label>
                            <input type="tel" id="edit-phone" name="phone" value="${customer.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label for="edit-address">Address</label>
                            <textarea id="edit-address" name="address" rows="3">${customer.address || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="edit-allergies">Allergies</label>
                            <textarea id="edit-allergies" name="allergies" rows="2">${customer.preferences?.allergies || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="edit-status">Status</label>
                            <select id="edit-status" name="status">
                                <option value="active" ${customer.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="inactive" ${customer.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="suspended" ${customer.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        modal.querySelector('#edit-customer-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const updatedData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                status: formData.get('status'),
                preferences: {
                    ...customer.preferences,
                    allergies: formData.get('allergies')
                }
            };

            const result = await this.updateCustomerProfile(customer.id, updatedData);
            if (result.success) {
                modal.remove();
                this.loadCustomers(); // Refresh data
            }
        });
    }

    // Handle delete customer
    handleDeleteCustomer(customerId) {
        const customer = this.getCustomerById(customerId);
        if (!customer) {
            if (window.MessagingSystem) {
                window.MessagingSystem.showError('Customer not found.');
            }
            return;
        }

        if (window.MessagingSystem) {
            window.MessagingSystem.showConfirmation(
                'Delete Customer',
                `Are you sure you want to delete ${customer.firstName} ${customer.lastName}? This action cannot be undone.`,
                () => this.deleteCustomer(customerId),
                () => {}
            );
        }
    }

    // Delete customer
    async deleteCustomer(customerId) {
        try {
            // Delete from Firebase
            await firebaseDB.collection('customers').doc(customerId).delete();
            
            // Remove from local array
            this.customers = this.customers.filter(c => c.id !== customerId);
            
            // Update localStorage
            localStorage.setItem('nailsbysau_customers', JSON.stringify(this.customers));
            
            if (window.MessagingSystem) {
                window.MessagingSystem.showSuccess('Customer deleted successfully.');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            if (window.MessagingSystem) {
                window.MessagingSystem.showError('Failed to delete customer.');
            }
        }
    }

    // Get customer statistics
    getCustomerStats() {
        const stats = {
            total: this.customers.length,
            active: this.customers.filter(c => c.status === 'active').length,
            inactive: this.customers.filter(c => c.status === 'inactive').length,
            suspended: this.customers.filter(c => c.status === 'suspended').length,
            newThisMonth: this.customers.filter(c => {
                const createdAt = new Date(c.createdAt);
                const now = new Date();
                return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
            }).length
        };

        return stats;
    }

    // Export customers to CSV
    exportCustomers() {
        const csvContent = this.generateCustomerCSV(this.customers);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Generate CSV content for customers
    generateCustomerCSV(customers) {
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Address', 'Status', 'Total Appointments', 'Total Spent', 'Created Date'];
        const rows = customers.map(customer => [
            customer.id,
            `${customer.firstName} ${customer.lastName}`,
            customer.email,
            customer.phone || '',
            customer.address || '',
            customer.status || 'active',
            customer.totalAppointments || 0,
            customer.totalSpent || 0,
            customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : ''
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Search customers
    searchCustomers(query) {
        if (!query) return this.customers;
        
        const lowercaseQuery = query.toLowerCase();
        return this.customers.filter(customer => 
            customer.firstName?.toLowerCase().includes(lowercaseQuery) ||
            customer.lastName?.toLowerCase().includes(lowercaseQuery) ||
            customer.email?.toLowerCase().includes(lowercaseQuery) ||
            customer.phone?.includes(query)
        );
    }

    // Get customer appointment history
    async getCustomerAppointmentHistory(customerId) {
        try {
            const appointments = await window.FirebaseAppointments.getAllAppointments();
            return appointments.filter(apt => apt.customerId === customerId || apt.email === this.getCustomerById(customerId)?.email);
        } catch (error) {
            console.error('Error getting customer appointment history:', error);
            return [];
        }
    }
}

// Initialize customer manager
window.CustomerManager = new CustomerManager();

// Global functions for customer management
window.editCustomer = (id) => window.CustomerManager.handleEditCustomer(id);
window.deleteCustomer = (id) => window.CustomerManager.handleDeleteCustomer(id);
window.searchCustomers = (query) => window.CustomerManager.searchCustomers(query);
