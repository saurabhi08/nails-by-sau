// Messaging System for Nails By Sau
// Handles all notifications, alerts, and user feedback

class MessagingSystem {
    constructor() {
        this.notifications = [];
        this.init();
    }

    // Initialize messaging system
    init() {
        this.createNotificationContainer();
        this.setupEventListeners();
    }

    // Create notification container
    createNotificationContainer() {
        if (document.getElementById('notification-container')) {
            return; // Already exists
        }

        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for form submissions
        document.addEventListener('submit', (e) => {
            this.handleFormSubmission(e);
        });

        // Listen for button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action]')) {
                this.handleActionClick(e);
            }
        });
    }

    // Handle form submissions
    handleFormSubmission(event) {
        const form = event.target;
        const formId = form.id || 'unknown-form';
        
        // Show loading message
        this.showLoading(`Processing ${this.getFormName(formId)}...`);
    }

    // Handle action clicks
    handleActionClick(event) {
        const action = event.target.dataset.action;
        const actionName = this.getActionName(action);
        
        this.showLoading(`Processing ${actionName}...`);
    }

    // Get form name for display
    getFormName(formId) {
        const formNames = {
            'booking-form': 'appointment booking',
            'contact-form': 'contact message',
            'login-form': 'login',
            'register-form': 'registration',
            'admin-login-form': 'admin login',
            'service-form': 'service',
            'message-form': 'message'
        };
        
        return formNames[formId] || 'form';
    }

    // Get action name for display
    getActionName(action) {
        const actionNames = {
            'book': 'appointment booking',
            'cancel': 'appointment cancellation',
            'reschedule': 'appointment rescheduling',
            'save': 'saving',
            'delete': 'deletion',
            'update': 'update',
            'send': 'message sending',
            'login': 'login',
            'logout': 'logout',
            'register': 'registration'
        };
        
        return actionNames[action] || 'action';
    }

    // Show success message
    showSuccess(message, duration = 5000) {
        this.showNotification(message, 'success', duration);
    }

    // Show error message
    showError(message, duration = 8000) {
        this.showNotification(message, 'error', duration);
    }

    // Show warning message
    showWarning(message, duration = 6000) {
        this.showNotification(message, 'warning', duration);
    }

    // Show info message
    showInfo(message, duration = 4000) {
        this.showNotification(message, 'info', duration);
    }

    // Show loading message
    showLoading(message, duration = 0) {
        this.showNotification(message, 'loading', duration);
    }

    // Main notification method
    showNotification(message, type = 'info', duration = 4000) {
        const container = document.getElementById('notification-container');
        if (!container) {
            this.createNotificationContainer();
            return this.showNotification(message, type, duration);
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        const closeButton = duration > 0 ? '<button class="notification-close" onclick="this.parentElement.remove()">&times;</button>' : '';
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icon}</div>
                <div class="notification-message">${message}</div>
                ${closeButton}
            </div>
        `;

        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove if duration is set
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        return notification;
    }

    // Remove notification
    removeNotification(notification) {
        if (notification && notification.parentElement) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }

    // Get icon for notification type
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '⏳'
        };
        
        return icons[type] || 'ℹ️';
    }

    // Show form validation errors
    showValidationErrors(errors) {
        if (!Array.isArray(errors)) {
            errors = [errors];
        }

        errors.forEach(error => {
            this.showError(error);
        });
    }

    // Show appointment confirmation
    showAppointmentConfirmation(appointmentData) {
        const message = `
            🎉 Appointment Booked Successfully!<br>
            <strong>Service:</strong> ${appointmentData.service}<br>
            <strong>Date:</strong> ${appointmentData.appointmentDate}<br>
            <strong>Time:</strong> ${appointmentData.appointmentTime}<br>
            <small>You will receive a confirmation email shortly.</small>
        `;
        
        this.showSuccess(message, 8000);
    }

    // Show payment confirmation
    showPaymentConfirmation(paymentData) {
        const message = `
            💳 Payment Processed Successfully!<br>
            <strong>Amount:</strong> $${paymentData.amount}<br>
            <strong>Method:</strong> ${paymentData.method}<br>
            <small>Your appointment is now confirmed.</small>
        `;
        
        this.showSuccess(message, 8000);
    }

    // Show login success
    showLoginSuccess(userType = 'customer') {
        const message = `${userType === 'admin' ? 'Admin' : 'Customer'} login successful! Welcome back.`;
        this.showSuccess(message, 4000);
    }

    // Show logout confirmation
    showLogoutConfirmation() {
        const message = 'You have been logged out successfully.';
        this.showInfo(message, 3000);
    }

    // Show service saved
    showServiceSaved(serviceName) {
        const message = `Service "${serviceName}" has been saved successfully.`;
        this.showSuccess(message, 4000);
    }

    // Show message sent
    showMessageSent() {
        const message = 'Your message has been sent successfully. We will get back to you soon!';
        this.showSuccess(message, 5000);
    }

    // Show appointment cancelled
    showAppointmentCancelled() {
        const message = 'Appointment has been cancelled successfully.';
        this.showInfo(message, 4000);
    }

    // Show appointment rescheduled
    showAppointmentRescheduled() {
        const message = 'Appointment has been rescheduled successfully.';
        this.showSuccess(message, 4000);
    }

    // Show network error
    showNetworkError() {
        const message = 'Network error. Please check your connection and try again.';
        this.showError(message, 6000);
    }

    // Show authentication error
    showAuthError(message = 'Authentication failed. Please try again.') {
        this.showError(message, 6000);
    }

    // Show permission error
    showPermissionError() {
        const message = 'You do not have permission to perform this action.';
        this.showError(message, 5000);
    }

    // Clear all notifications
    clearAll() {
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    // Show modal with message
    showModal(title, message, type = 'info') {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'message-modal';
        
        const icon = this.getIcon(type);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${icon} ${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="this.closest('.modal').remove()">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Show confirmation dialog
    showConfirmation(title, message, onConfirm, onCancel = null) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'confirmation-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚠️ ${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-danger" id="confirm-button">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle confirm button
        modal.querySelector('#confirm-button').addEventListener('click', () => {
            modal.remove();
            if (onConfirm) {
                onConfirm();
            }
        });
        
        // Handle cancel
        modal.querySelector('.btn-secondary').addEventListener('click', () => {
            modal.remove();
            if (onCancel) {
                onCancel();
            }
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (onCancel) {
                    onCancel();
                }
            }
        });
    }
}

// Initialize messaging system
window.MessagingSystem = new MessagingSystem();

// Global functions for backward compatibility
window.showAlert = function(message, type = 'info') {
    window.MessagingSystem.showNotification(message, type);
};

window.showSuccess = function(message) {
    window.MessagingSystem.showSuccess(message);
};

window.showError = function(message) {
    window.MessagingSystem.showError(message);
};

window.showWarning = function(message) {
    window.MessagingSystem.showWarning(message);
};

window.showInfo = function(message) {
    window.MessagingSystem.showInfo(message);
};

window.showLoading = function(message) {
    window.MessagingSystem.showLoading(message);
};

window.showConfirmation = function(title, message, onConfirm, onCancel) {
    window.MessagingSystem.showConfirmation(title, message, onConfirm, onCancel);
};

// Add CSS for notifications
const notificationCSS = `
<style>
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
}

.notification {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-bottom: 10px;
    padding: 16px;
    border-left: 4px solid #ddd;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    position: relative;
}

.notification.show {
    opacity: 1;
    transform: translateX(0);
}

.notification.hide {
    opacity: 0;
    transform: translateX(100%);
}

.notification-success {
    border-left-color: #28a745;
    background: #f8fff9;
}

.notification-error {
    border-left-color: #dc3545;
    background: #fff8f8;
}

.notification-warning {
    border-left-color: #ffc107;
    background: #fffdf5;
}

.notification-info {
    border-left-color: #17a2b8;
    background: #f8fdff;
}

.notification-loading {
    border-left-color: #6c757d;
    background: #f8f9fa;
}

.notification-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.notification-icon {
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
}

.notification-message {
    flex: 1;
    font-size: 14px;
    line-height: 1.4;
    color: #333;
}

.notification-close {
    background: none;
    border: none;
    font-size: 18px;
    color: #999;
    cursor: pointer;
    padding: 0;
    margin-left: 8px;
    flex-shrink: 0;
}

.notification-close:hover {
    color: #666;
}

@media (max-width: 768px) {
    .notification-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }
    
    .notification {
        margin-bottom: 8px;
        padding: 12px;
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', notificationCSS);
