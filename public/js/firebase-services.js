// Firebase Services Management
// Handles all service-related database operations

// Get all services
async function getAllServices() {
    try {
        const snapshot = await firebaseDB.collection('services')
            .orderBy('name', 'asc')
            .get();
        
        const services = [];
        snapshot.forEach(doc => {
            services.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return services;
    } catch (error) {
        console.error('Error getting services:', error);
        return [];
    }
}

// Get service by ID
async function getServiceById(serviceId) {
    try {
        const doc = await firebaseDB.collection('services').doc(serviceId).get();
        
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting service:', error);
        return null;
    }
}

// Add new service
async function addService(serviceData) {
    try {
        const docRef = await firebaseDB.collection('services').add({
            ...serviceData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            active: true
        });
        
        console.log('Service added with ID:', docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding service:', error);
        return { success: false, error: error.message };
    }
}

// Update service
async function updateService(serviceId, serviceData) {
    try {
        await firebaseDB.collection('services').doc(serviceId).update({
            ...serviceData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error updating service:', error);
        return { success: false, error: error.message };
    }
}

// Delete service
async function deleteService(serviceId) {
    try {
        await firebaseDB.collection('services').doc(serviceId).delete();
        return { success: true };
    } catch (error) {
        console.error('Error deleting service:', error);
        return { success: false, error: error.message };
    }
}

// Toggle service active status
async function toggleServiceStatus(serviceId, active) {
    try {
        await firebaseDB.collection('services').doc(serviceId).update({
            active: active,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error toggling service status:', error);
        return { success: false, error: error.message };
    }
}

// Initialize default services (run once)
async function initializeDefaultServices() {
    const defaultServices = [
        {
            name: 'Classic Manicure',
            description: 'Professional nail shaping, cuticle care, and polish application',
            price: 35,
            duration: 60,
            category: 'manicure',
            active: true
        },
        {
            name: 'Gel Manicure',
            description: 'Long-lasting gel polish that stays chip-free for up to 3 weeks',
            price: 45,
            duration: 75,
            category: 'manicure',
            active: true
        },
        {
            name: 'French Manicure',
            description: 'Classic French manicure with natural base and white tips',
            price: 40,
            duration: 70,
            category: 'manicure',
            active: true
        },
        {
            name: 'Nail Art Design',
            description: 'Custom nail art designs with hand-painted details and decorative elements',
            price: 50,
            duration: 90,
            category: 'nail-art',
            active: true
        },
        {
            name: 'Nail Extensions',
            description: 'Professional nail extensions using high-quality materials for length and strength',
            price: 80,
            duration: 120,
            category: 'extensions',
            active: true
        },
        {
            name: '3D Nail Art',
            description: 'Stunning 3D nail art with dimensional designs and embellishments',
            price: 75,
            duration: 120,
            category: 'nail-art',
            active: true
        }
    ];

    try {
        // Check if services already exist
        const snapshot = await firebaseDB.collection('services').limit(1).get();
        
        if (snapshot.empty) {
            console.log('Initializing default services...');
            
            for (const service of defaultServices) {
                await addService(service);
            }
            
            console.log('Default services initialized successfully');
            return { success: true, message: 'Services initialized' };
        } else {
            console.log('Services already exist');
            return { success: true, message: 'Services already exist' };
        }
    } catch (error) {
        console.error('Error initializing services:', error);
        return { success: false, error: error.message };
    }
}

// Export functions
window.FirebaseServices = {
    getAllServices,
    getServiceById,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus,
    initializeDefaultServices
};

