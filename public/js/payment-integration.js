// Stripe Payment Integration for Nails By Sau
// Handles online payments for appointments

let stripe;
let elements;
let paymentElement;

// Initialize Stripe
async function initStripe() {
    // Use the Stripe instance from the HTML page
    if (window.stripe) {
        stripe = window.stripe;
        console.log('Stripe initialized successfully');
        return true;
    } else {
        console.warn('Stripe not available - make sure Stripe is loaded');
        return false;
    }
}

// Create payment form
async function createPaymentForm(amount, currency = 'cad') {
    try {
        if (!stripe) {
            const initialized = await initStripe();
            if (!initialized) {
                throw new Error('Stripe not configured');
            }
        }
        
        // Create payment intent on your server
        const paymentIntent = await createPaymentIntent(amount, currency);
        
        // Create elements
        elements = stripe.elements({
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
        paymentElement = elements.create('payment', {
            layout: 'tabs'
        });
        
        return paymentElement;
    } catch (error) {
        console.error('Error creating payment form:', error);
        throw error;
    }
}

// Create payment intent (this would normally call your backend)
async function createPaymentIntent(amount, currency) {
    // In a real application, this would make a request to your backend
    // For now, we'll simulate it
    return {
        client_secret: 'pi_mock_client_secret_' + Date.now(),
        id: 'pi_mock_' + Date.now()
    };
}

// Show payment modal
function showPaymentModal(appointmentData) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'payment-modal';
    
    const totalAmount = calculateTotal(appointmentData);
    
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
                    <button class="btn" id="pay-button" onclick="processPayment()">
                        <i class="fas fa-credit-card"></i>
                        Pay $${totalAmount}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize payment form
    initializePaymentForm(totalAmount);
}

// Initialize payment form
async function initializePaymentForm(amount) {
    try {
        const paymentElement = await createPaymentForm(amount);
        const paymentElementContainer = document.getElementById('payment-element');
        
        if (paymentElement && paymentElementContainer) {
            paymentElement.mount('#payment-element');
        }
    } catch (error) {
        console.error('Error initializing payment form:', error);
        showPaymentError('Unable to initialize payment. Please try again.');
    }
}

// Process payment
async function processPayment() {
    const payButton = document.getElementById('pay-button');
    const paymentMessage = document.getElementById('payment-message');
    
    if (!stripe || !elements) {
        showPaymentError('Payment system not initialized');
        return;
    }
    
    // Show loading state
    payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    payButton.disabled = true;
    
    try {
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/public/book-appointment.html?payment=success',
            },
        });
        
        if (error) {
            showPaymentError(error.message);
            payButton.innerHTML = '<i class="fas fa-credit-card"></i> Try Again';
            payButton.disabled = false;
        } else {
            // Payment succeeded
            showPaymentSuccess();
        }
    } catch (error) {
        console.error('Payment error:', error);
        showPaymentError('Payment failed. Please try again.');
        payButton.innerHTML = '<i class="fas fa-credit-card"></i> Try Again';
        payButton.disabled = false;
    }
}

// Calculate total amount
function calculateTotal(appointmentData) {
    let total = appointmentData.price || 0;
    
    // No travel fee - clients come to your home studio
    
    // Add tax (13% HST for Ontario)
    const tax = total * 0.13;
    total += tax;
    
    return total.toFixed(2);
}

// Show payment error
function showPaymentError(message) {
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
function showPaymentSuccess() {
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

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.remove();
    }
}

// Show appointment confirmation
function showAppointmentConfirmation() {
    if (window.showAlert) {
        window.showAlert('🎉 Your appointment has been booked and payment processed successfully! You will receive a confirmation email shortly.', 'success');
    }
}

// Alternative payment methods
function showPaymentOptions(appointmentData) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>💳 Choose Payment Method</h3>
                <button class="modal-close" onclick="closePaymentOptions()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="payment-options">
                    <div class="payment-option" onclick="selectPaymentMethod('online')">
                        <i class="fas fa-credit-card"></i>
                        <h4>Pay Online Now</h4>
                        <p>Secure payment with credit/debit card</p>
                    </div>
                    <div class="payment-option" onclick="selectPaymentMethod('cash')">
                        <i class="fas fa-money-bill-wave"></i>
                        <h4>Pay at Salon</h4>
                        <p>Cash or card payment when you arrive</p>
                    </div>
                    <div class="payment-option" onclick="selectPaymentMethod('etransfer')">
                        <i class="fas fa-mobile-alt"></i>
                        <h4>E-Transfer</h4>
                        <p>Send e-transfer to nailsbysau@email.com</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Select payment method
function selectPaymentMethod(method) {
    const appointmentData = window.currentAppointmentData || {};
    
    switch (method) {
        case 'online':
            closePaymentOptions();
            showPaymentModal(appointmentData);
            break;
        case 'cash':
        case 'etransfer':
            // Save appointment with payment method
            appointmentData.paymentMethod = method;
            appointmentData.paymentStatus = 'pending';
            saveAppointmentWithPayment(appointmentData);
            break;
    }
}

// Save appointment with payment info
async function saveAppointmentWithPayment(appointmentData) {
    try {
        const result = await window.FirebaseAppointments.saveAppointment(appointmentData);
        
        if (result.success) {
            closePaymentOptions();
            showAppointmentConfirmation();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error saving appointment:', error);
        if (window.showAlert) {
            window.showAlert('Error saving appointment. Please try again.', 'error');
        }
    }
}

// Close payment options modal
function closePaymentOptions() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Export functions for global use
window.PaymentIntegration = {
    initStripe,
    showPaymentModal,
    showPaymentOptions,
    selectPaymentMethod,
    calculateTotal
};

// Auto-initialize Stripe when script loads
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if Stripe is loaded
    if (typeof Stripe !== 'undefined') {
        initStripe();
    }
});
