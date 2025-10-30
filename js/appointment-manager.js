// Appointment Management System for Nails By Sau
// Handles booking, rescheduling, cancellation, and history

class AppointmentManager {
    constructor() {
        this.currentAppointments = [];
        this.init();
    }

    // Map selected service to standardized name, price, and duration
    getServiceDetails(serviceSlug) {
        const catalog = {
            'classic-manicure': { name: 'Classic Manicure', price: 35, duration: 60 },
            'gel-manicure': { name: 'Gel Manicure', price: 45, duration: 75 },
            'french-manicure': { name: 'French Manicure', price: 40, duration: 70 },
            'nail-art': { name: 'Nail Art Design', price: 50, duration: 90 },
            'nail-extensions': { name: 'Nail Extensions', price: 80, duration: 120 },
            '3d-nail-art': { name: '3D Nail Art', price: 75, duration: 120 }
        };
        // Default if unknown
        return catalog[serviceSlug] || { name: serviceSlug, price: 0, duration: 60 };
    }

    // Initialize the appointment manager
    init() {
        this.loadAppointments();
        this.setupEventListeners();
    }

    // Setup event listeners for appointment actions
    setupEventListeners() {
        // Booking form submission
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => this.handleBookingSubmission(e));
        }

        // Reschedule buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="reschedule"]')) {
                this.handleReschedule(e.target.dataset.appointmentId);
            }
        });

        // Cancel buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="cancel"]')) {
                this.handleCancellation(e.target.dataset.appointmentId);
            }
        });
    }

    // Handle booking form submission
    async handleBookingSubmission(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const selectedService = formData.get('service');
        const details = this.getServiceDetails(selectedService);

        const appointmentData = {
            service: details.name,
            appointmentDate: formData.get('appointment-date'),
            appointmentTime: formData.get('appointment-time'),
            firstName: formData.get('first-name'),
            lastName: formData.get('last-name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            notes: formData.get('notes'),
            clientAddress: formData.get('client-address'),
            price: details.price,
            duration: details.duration,
            status: 'pending',
            createdAt: new Date().toISOString(),
            id: this.generateAppointmentId()
        };

        // If customer is logged in, ensure the booking is tied to their account
        try {
            let user = null;
            if (window.CustomerAuth && window.CustomerAuth.currentCustomer) {
                user = window.CustomerAuth.currentCustomer;
            } else if (window.firebase && firebase.auth && firebase.auth().currentUser) {
                user = firebase.auth().currentUser;
            }
            if (user) {
                appointmentData.customerUid = user.uid;
                appointmentData.email = user.email; // ensure linkage to logged-in account
            }
        } catch (e) { console.warn('Could not attach logged-in customer to appointment:', e); }

        try {
            // Save to Firebase
            const result = await window.FirebaseAppointments.saveAppointment(appointmentData);
            
            if (result.success) {
                // Also save to localStorage as backup
                this.saveAppointmentToLocal(appointmentData);
                
                // Show success message
                this.showSuccessMessage('Appointment booked successfully!');

                // Send notifications (email + SMS queue)
                if (window.Notifications && window.Notifications.notifyBooking) {
                    window.Notifications.notifyBooking(appointmentData).catch(err => {
                        console.warn('Notification failed:', err);
                    });
                }
                
                // Prepare data for payment and show payment options
                try {
                    window.currentAppointmentData = appointmentData;
                    if (window.PaymentIntegration && window.PaymentIntegration.showPaymentOptions) {
                        window.PaymentIntegration.showPaymentOptions(appointmentData);
                    }
                } catch (e) {
                    console.warn('Could not open payment options:', e);
                }
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            this.showErrorMessage('Failed to book appointment. Please try again.');
        }
    }

    // Save appointment to localStorage as backup
    saveAppointmentToLocal(appointmentData) {
        const appointments = this.getLocalAppointments();
        appointments.push(appointmentData);
        localStorage.setItem('nailsbysau_appointments', JSON.stringify(appointments));
    }

    // Get appointments from localStorage
    getLocalAppointments() {
        const stored = localStorage.getItem('nailsbysau_appointments');
        return stored ? JSON.parse(stored) : [];
    }

    // Load appointments from Firebase and localStorage
    async loadAppointments() {
        try {
            // Try Firebase first
            const firebaseAppointments = await window.FirebaseAppointments.getAllAppointments();
            this.currentAppointments = firebaseAppointments || [];
        } catch (error) {
            console.error('Error loading from Firebase:', error);
            // Fallback to localStorage
            this.currentAppointments = this.getLocalAppointments();
        }
    }

    // Get appointments for a specific customer
    async getCustomerAppointments(customerEmail) {
        await this.loadAppointments();
        return this.currentAppointments.filter(apt => apt.email === customerEmail);
    }

    // Get appointments for admin dashboard
    async getAllAppointmentsForAdmin() {
        await this.loadAppointments();
        return this.currentAppointments;
    }

    // Handle rescheduling
    async handleReschedule(appointmentId) {
        const appointment = this.currentAppointments.find(apt => apt.id === appointmentId);
        if (!appointment) {
            this.showErrorMessage('Appointment not found.');
            return;
        }

        // Show reschedule modal
        this.showRescheduleModal(appointment);
    }

    // Show reschedule modal
    showRescheduleModal(appointment) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Reschedule Appointment</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="reschedule-form">
                        <div class="form-group">
                            <label>Current Date & Time</label>
                            <p>${appointment.appointmentDate} at ${appointment.appointmentTime}</p>
                        </div>
                        <div class="form-group">
                            <label for="new-date">New Date</label>
                            <input type="date" id="new-date" name="new-date" required>
                        </div>
                        <div class="form-group">
                            <label for="new-time">New Time</label>
                            <select id="new-time" name="new-time" required>
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="13:00">1:00 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                                <option value="17:00">5:00 PM</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="reschedule-reason">Reason for Rescheduling</label>
                            <textarea id="reschedule-reason" name="reschedule-reason" rows="3"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn">Reschedule</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        modal.querySelector('#reschedule-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const updatedAppointment = {
                ...appointment,
                appointmentDate: formData.get('new-date'),
                appointmentTime: formData.get('new-time'),
                rescheduleReason: formData.get('reschedule-reason'),
                rescheduledAt: new Date().toISOString(),
                status: 'rescheduled'
            };

            try {
                const result = await window.FirebaseAppointments.updateAppointment(appointmentId, updatedAppointment);
                if (result.success) {
                    this.showSuccessMessage('Appointment rescheduled successfully!');
                    modal.remove();
                    this.loadAppointments(); // Refresh data
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                this.showErrorMessage('Failed to reschedule appointment.');
            }
        });
    }

    // Handle cancellation
    async handleCancellation(appointmentId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            const result = await window.FirebaseAppointments.updateAppointmentStatus(appointmentId, 'cancelled');
            if (result.success) {
                this.showSuccessMessage('Appointment cancelled successfully.');
                this.loadAppointments(); // Refresh data
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showErrorMessage('Failed to cancel appointment.');
        }
    }

    // Generate unique appointment ID
    generateAppointmentId() {
        return 'apt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Show success message
    showSuccessMessage(message) {
        if (window.NailBookingSystem && window.NailBookingSystem.showAlert) {
            window.NailBookingSystem.showAlert(message, 'success');
        } else {
            alert(message);
        }
    }

    // Show error message
    showErrorMessage(message) {
        if (window.NailBookingSystem && window.NailBookingSystem.showAlert) {
            window.NailBookingSystem.showAlert(message, 'error');
        } else {
            alert(message);
        }
    }

    // Get appointment statistics
    getAppointmentStats() {
        const stats = {
            total: this.currentAppointments.length,
            pending: this.currentAppointments.filter(apt => apt.status === 'pending').length,
            confirmed: this.currentAppointments.filter(apt => apt.status === 'confirmed').length,
            completed: this.currentAppointments.filter(apt => apt.status === 'completed').length,
            cancelled: this.currentAppointments.filter(apt => apt.status === 'cancelled').length
        };

        return stats;
    }

    // Export appointments to CSV
    exportAppointments() {
        const csvContent = this.generateCSV(this.currentAppointments);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Generate CSV content
    generateCSV(appointments) {
        const headers = ['ID', 'Service', 'Date', 'Time', 'Client', 'Email', 'Phone', 'Status', 'Created'];
        const rows = appointments.map(apt => [
            apt.id,
            apt.service,
            apt.appointmentDate,
            apt.appointmentTime,
            `${apt.firstName} ${apt.lastName}`,
            apt.email,
            apt.phone,
            apt.status,
            apt.createdAt
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Initialize appointment manager
window.AppointmentManager = new AppointmentManager();

// Make functions available globally
window.rescheduleAppointment = (id) => window.AppointmentManager.handleReschedule(id);
window.cancelAppointment = (id) => window.AppointmentManager.handleCancellation(id);
