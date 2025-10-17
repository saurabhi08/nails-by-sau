// Firebase Appointments Management
// Handles all appointment-related database operations

// Save appointment to Firebase
async function saveAppointmentToFirebase(appointmentData) {
    try {
        const docRef = await firebaseDB.collection('appointments').add({
            ...appointmentData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });
        
        console.log('Appointment saved with ID:', docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error saving appointment:', error);
        return { success: false, error: error.message };
    }
}

// Get all appointments
async function getAllAppointments() {
    try {
        const snapshot = await firebaseDB.collection('appointments')
            .orderBy('createdAt', 'desc')
            .get();
        
        const appointments = [];
        snapshot.forEach(doc => {
            appointments.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return appointments;
    } catch (error) {
        console.error('Error getting appointments:', error);
        return [];
    }
}

// Get appointments by date
async function getAppointmentsByDate(date) {
    try {
        const snapshot = await firebaseDB.collection('appointments')
            .where('appointmentDate', '==', date)
            .get();
        
        const appointments = [];
        snapshot.forEach(doc => {
            appointments.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return appointments;
    } catch (error) {
        console.error('Error getting appointments by date:', error);
        return [];
    }
}

// Get appointments by status
async function getAppointmentsByStatus(status) {
    try {
        const snapshot = await firebaseDB.collection('appointments')
            .where('status', '==', status)
            .orderBy('createdAt', 'desc')
            .get();
        
        const appointments = [];
        snapshot.forEach(doc => {
            appointments.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return appointments;
    } catch (error) {
        console.error('Error getting appointments by status:', error);
        return [];
    }
}

// Update appointment status
async function updateAppointmentStatus(appointmentId, newStatus) {
    try {
        await firebaseDB.collection('appointments').doc(appointmentId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return { success: false, error: error.message };
    }
}

// Update appointment
async function updateAppointment(appointmentId, appointmentData) {
    try {
        await firebaseDB.collection('appointments').doc(appointmentId).update({
            ...appointmentData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error updating appointment:', error);
        return { success: false, error: error.message };
    }
}

// Delete appointment
async function deleteAppointment(appointmentId) {
    try {
        await firebaseDB.collection('appointments').doc(appointmentId).delete();
        return { success: true };
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return { success: false, error: error.message };
    }
}

// Get today's appointments
async function getTodayAppointments() {
    try {
        const today = new Date().toISOString().split('T')[0];
        return await getAppointmentsByDate(today);
    } catch (error) {
        console.error('Error getting today appointments:', error);
        return [];
    }
}

// Get appointments for date range
async function getAppointmentsInRange(startDate, endDate) {
    try {
        const snapshot = await firebaseDB.collection('appointments')
            .where('appointmentDate', '>=', startDate)
            .where('appointmentDate', '<=', endDate)
            .orderBy('appointmentDate', 'asc')
            .get();
        
        const appointments = [];
        snapshot.forEach(doc => {
            appointments.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return appointments;
    } catch (error) {
        console.error('Error getting appointments in range:', error);
        return [];
    }
}

// Check if time slot is available
async function isTimeSlotAvailable(date, time) {
    try {
        const snapshot = await firebaseDB.collection('appointments')
            .where('appointmentDate', '==', date)
            .where('appointmentTime', '==', time)
            .where('status', 'in', ['pending', 'confirmed'])
            .get();
        
        return snapshot.empty;
    } catch (error) {
        console.error('Error checking time slot availability:', error);
        return false;
    }
}

// Export functions
window.FirebaseAppointments = {
    saveAppointment: saveAppointmentToFirebase,
    getAllAppointments,
    getAppointmentsByDate,
    getAppointmentsByStatus,
    updateAppointmentStatus,
    updateAppointment,
    deleteAppointment,
    getTodayAppointments,
    getAppointmentsInRange,
    isTimeSlotAvailable
};

