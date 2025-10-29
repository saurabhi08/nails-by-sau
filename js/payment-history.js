// Payment History Management for Nails By Sau
// Handles payment tracking and history

class PaymentHistoryManager {
    constructor() {
        this.payments = [];
        this.init();
    }

    // Initialize payment history manager
    init() {
        this.loadPayments();
    }

    // Load payments from Firebase and localStorage
    async loadPayments() {
        try {
            // Try Firebase first
            const firebasePayments = await this.getFirebasePayments();
            this.payments = firebasePayments || [];
        } catch (error) {
            console.error('Error loading payments from Firebase:', error);
            // Fallback to localStorage
            this.payments = this.getLocalPayments();
        }
    }

    // Get payments from Firebase
    async getFirebasePayments() {
        try {
            const snapshot = await firebaseDB.collection('payments')
                .orderBy('createdAt', 'desc')
                .get();
            
            const payments = [];
            snapshot.forEach(doc => {
                payments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return payments;
        } catch (error) {
            console.error('Error getting payments from Firebase:', error);
            return [];
        }
    }

    // Get payments from localStorage
    getLocalPayments() {
        const stored = localStorage.getItem('nailsbysau_payments');
        return stored ? JSON.parse(stored) : [];
    }

    // Save payment to Firebase
    async savePayment(paymentData) {
        try {
            const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const paymentRecord = {
                ...paymentData,
                id: paymentId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await firebaseDB.collection('payments').doc(paymentId).set(paymentRecord);
            
            // Also save to localStorage as backup
            this.savePaymentToLocal(paymentRecord);
            
            console.log('Payment saved with ID:', paymentId);
            return { success: true, id: paymentId };
        } catch (error) {
            console.error('Error saving payment:', error);
            return { success: false, error: error.message };
        }
    }

    // Save payment to localStorage
    savePaymentToLocal(paymentData) {
        const payments = this.getLocalPayments();
        payments.push(paymentData);
        localStorage.setItem('nailsbysau_payments', JSON.stringify(payments));
    }

    // Get payments for a specific customer
    async getCustomerPayments(customerEmail) {
        await this.loadPayments();
        return this.payments.filter(payment => payment.customerEmail === customerEmail);
    }

    // Get all payments for admin
    async getAllPayments() {
        await this.loadPayments();
        return this.payments;
    }

    // Get payment statistics
    getPaymentStats() {
        const stats = {
            total: this.payments.length,
            totalAmount: this.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
            successful: this.payments.filter(payment => payment.status === 'completed').length,
            pending: this.payments.filter(payment => payment.status === 'pending').length,
            failed: this.payments.filter(payment => payment.status === 'failed').length,
            refunded: this.payments.filter(payment => payment.status === 'refunded').length
        };

        return stats;
    }

    // Export payments to CSV
    exportPayments() {
        const csvContent = this.generatePaymentCSV(this.payments);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Generate CSV content for payments
    generatePaymentCSV(payments) {
        const headers = ['ID', 'Appointment ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'];
        const rows = payments.map(payment => [
            payment.id,
            payment.appointmentId || '',
            payment.customerName || '',
            payment.amount || 0,
            payment.method || '',
            payment.status || '',
            payment.createdAt ? new Date(payment.createdAt.seconds * 1000).toLocaleDateString() : ''
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Initialize payment history manager
window.PaymentHistoryManager = new PaymentHistoryManager();

// Enhanced Stripe Integration
class EnhancedStripeIntegration {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.paymentElement = null;
        this.isInitialized = false;
    }

    // Initialize Stripe with proper configuration
    async init() {
        try {
            if (typeof Stripe === 'undefined') {
                throw new Error('Stripe not loaded');
            }

            // Initialize Stripe with publishable key
            this.stripe = Stripe('pk_test_51234567890abcdef'); // Replace with your actual publishable key
            
            this.isInitialized = true;
            console.log('Stripe initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing Stripe:', error);
            return false;
        }
    }

    // Create payment intent (mock implementation - replace with real backend)
    async createPaymentIntent(amount, currency = 'cad', appointmentId) {
        try {
            // In a real application, this would make a request to your backend
            // For demo purposes, we'll create a mock payment intent
            const paymentIntent = {
                id: 'pi_mock_' + Date.now(),
                client_secret: 'pi_mock_client_secret_' + Date.now(),
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency,
                status: 'requires_payment_method'
            };

            return paymentIntent;
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }

    // Create payment form
    async createPaymentForm(amount, currency = 'cad', appointmentId) {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            if (!this.stripe) {
                throw new Error('Stripe not initialized');
            }

            // Create payment intent
            const paymentIntent = await this.createPaymentIntent(amount, currency, appointmentId);

            // Create elements
            this.elements = this.stripe.elements({
                clientSecret: paymentIntent.client_secret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#ff69b4',
                        colorBackground: '#ffffff',
                        colorText: '#2c3e50',
                        colorDanger: '#df1b41',
                        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px'
                    }
                }
            });

            // Create payment element
            this.paymentElement = this.elements.create('payment', {
                layout: 'tabs'
            });

            return this.paymentElement;
        } catch (error) {
            console.error('Error creating payment form:', error);
            throw error;
        }
    }

    // Process payment
    async processPayment(appointmentData) {
        try {
            if (!this.stripe || !this.elements) {
                throw new Error('Payment system not initialized');
            }

            const { error } = await this.stripe.confirmPayment({
                elements: this.elements,
                confirmParams: {
                    return_url: window.location.origin + '/book-appointment.html?payment=success',
                },
            });

            if (error) {
                throw new Error(error.message);
            }

            // Payment succeeded - save payment record
            const paymentData = {
                appointmentId: appointmentData.id,
                customerEmail: appointmentData.email,
                customerName: `${appointmentData.firstName} ${appointmentData.lastName}`,
                amount: parseFloat(appointmentData.price),
                method: 'stripe',
                status: 'completed',
                stripePaymentIntentId: 'pi_mock_' + Date.now(),
                createdAt: new Date().toISOString()
            };

            await window.PaymentHistoryManager.savePayment(paymentData);

            return { success: true };
        } catch (error) {
            console.error('Payment processing error:', error);
            return { success: false, error: error.message };
        }
    }

    // Show payment modal with enhanced UI
    showPaymentModal(appointmentData) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'payment-modal';
        
        const totalAmount = this.calculateTotal(appointmentData);
        
        modal.innerHTML = `
            <div class="modal-content payment-modal">
                <div class="modal-header">
                    <h3>💳 Complete Your Payment</h3>
                    <button class="modal-close" onclick="closePaymentModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="payment-summary">
                        <h4>Payment Summary</h4>
                        <div class="summary-item">
                            <span>${appointmentData.service}</span>
                            <span>$${appointmentData.price}</span>
                        </div>
                        <div class="summary-item">
                            <span>Tax (13% HST)</span>
                            <span>$${(appointmentData.price * 0.13).toFixed(2)}</span>
                        </div>
                        <div class="summary-item total">
                            <span><strong>Total</strong></span>
                            <span><strong>$${totalAmount}</strong></span>
                        </div>
                    </div>
                    
                    <div class="payment-form">
                        <div id="payment-element">
                            <!-- Stripe Elements will be inserted here -->
                        </div>
                        <div id="payment-message" class="hidden"></div>
                    </div>
                    
                    <div class="payment-actions">
                        <button class="btn btn-secondary" onclick="closePaymentModal()">Cancel</button>
                        <button class="btn" id="pay-button" onclick="processStripePayment()">
                            <i class="fas fa-credit-card"></i>
                            Pay $${totalAmount}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Initialize payment form
        this.initializePaymentForm(totalAmount, appointmentData);
    }

    // Initialize payment form
    async initializePaymentForm(amount, appointmentData) {
        try {
            const paymentElement = await this.createPaymentForm(amount, 'cad', appointmentData.id);
            const paymentElementContainer = document.getElementById('payment-element');
            
            if (paymentElement && paymentElementContainer) {
                paymentElement.mount('#payment-element');
            }
        } catch (error) {
            console.error('Error initializing payment form:', error);
            this.showPaymentError('Unable to initialize payment. Please try again.');
        }
    }

    // Calculate total amount with tax
    calculateTotal(appointmentData) {
        let total = parseFloat(appointmentData.price) || 0;
        
        // Add tax (13% HST for Ontario)
        const tax = total * 0.13;
        total += tax;
        
        return total.toFixed(2);
    }

    // Show payment error
    showPaymentError(message) {
        const paymentMessage = document.getElementById('payment-message');
        if (paymentMessage) {
            paymentMessage.innerHTML = `
                <div class="payment-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${message}
                </div>
            `;
            paymentMessage.classList.remove('hidden');
        }
    }

    // Show payment success
    showPaymentSuccess() {
        const paymentMessage = document.getElementById('payment-message');
        if (paymentMessage) {
            paymentMessage.innerHTML = `
                <div class="payment-success">
                    <i class="fas fa-check-circle"></i>
                    Payment successful! Your appointment is confirmed.
                </div>
            `;
            paymentMessage.classList.remove('hidden');
        }
        
        // Close modal after delay
        setTimeout(() => {
            closePaymentModal();
            // Redirect to success page or show confirmation
            showAppointmentConfirmation();
        }, 2000);
    }
}

// Initialize enhanced Stripe integration
window.EnhancedStripeIntegration = new EnhancedStripeIntegration();

// Global functions for payment processing
window.processStripePayment = async function() {
    const payButton = document.getElementById('pay-button');
    const appointmentData = window.currentAppointmentData;
    
    if (!appointmentData) {
        alert('No appointment data found');
        return;
    }
    
    // Show loading state
    payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    payButton.disabled = true;
    
    try {
        const result = await window.EnhancedStripeIntegration.processPayment(appointmentData);
        
        if (result.success) {
            window.EnhancedStripeIntegration.showPaymentSuccess();
        } else {
            window.EnhancedStripeIntegration.showPaymentError(result.error);
            payButton.innerHTML = '<i class="fas fa-credit-card"></i> Try Again';
            payButton.disabled = false;
        }
    } catch (error) {
        window.EnhancedStripeIntegration.showPaymentError('Payment failed. Please try again.');
        payButton.innerHTML = '<i class="fas fa-credit-card"></i> Try Again';
        payButton.disabled = false;
    }
};

window.closePaymentModal = function() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.remove();
    }
};

window.showAppointmentConfirmation = function() {
    const appointmentData = window.currentAppointmentData;
    if (window.showConfirmationModal && appointmentData) {
        window.showConfirmationModal(appointmentData);
    } else if (window.showAlert) {
        window.showAlert('🎉 Your appointment has been booked and payment processed successfully! You will receive a confirmation email shortly.', 'success');
    }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Stripe !== 'undefined') {
        window.EnhancedStripeIntegration.init();
    }
});
