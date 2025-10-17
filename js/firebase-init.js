// Firebase Initialization Helper
// This file helps with initial setup and provides utility functions

// Check if Firebase is properly configured
function checkFirebaseConfig() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded. Please check your script tags.');
        return false;
    }
    
    if (typeof firebaseDB === 'undefined' || typeof firebaseAuth === 'undefined') {
        console.error('Firebase not initialized. Please check firebase-config.js');
        return false;
    }
    
    console.log('✓ Firebase is properly configured');
    return true;
}

// Initialize default admin (for first-time setup)
async function setupFirstTimeAdmin() {
    const email = prompt('Enter admin email:');
    const password = prompt('Enter admin password (min 8 characters):');
    
    if (!email || !password) {
        alert('Setup cancelled');
        return;
    }
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }
    
    try {
        const result = await window.FirebaseAuth.createAdminUser(email, password);
        
        if (result.success) {
            alert(`Admin user created successfully!\n\nEmail: ${email}\n\nYou can now log in to the admin dashboard.`);
            console.log('Admin created:', result);
        } else {
            alert('Error creating admin: ' + result.error);
        }
    } catch (error) {
        console.error('Setup error:', error);
        alert('Error: ' + error.message);
    }
}

// Initialize default services (for first-time setup)
async function setupDefaultServices() {
    if (confirm('This will add default services to your database. Continue?')) {
        try {
            const result = await window.FirebaseServices.initializeDefaultServices();
            
            if (result.success) {
                alert('Default services initialized successfully!\n\nServices added:\n- Classic Manicure\n- Gel Manicure\n- French Manicure\n- Nail Art Design\n- Nail Extensions\n- 3D Nail Art');
                console.log('Services initialized:', result);
            } else {
                alert('Error initializing services: ' + result.error);
            }
        } catch (error) {
            console.error('Setup error:', error);
            alert('Error: ' + error.message);
        }
    }
}

// Quick setup wizard for first-time users
async function runSetupWizard() {
    console.log('=== Nails By Sau - Firebase Setup Wizard ===\n');
    
    // Check if Firebase is configured
    if (!checkFirebaseConfig()) {
        console.error('Please configure Firebase first. See FIREBASE_SETUP_INSTRUCTIONS.md');
        return;
    }
    
    console.log('Step 1: Checking Firebase connection...');
    
    try {
        // Test Firestore connection
        await firebaseDB.collection('_test').limit(1).get();
        console.log('✓ Firestore connection successful');
    } catch (error) {
        console.error('✗ Firestore connection failed:', error.message);
        console.error('Please check your Firebase configuration and security rules');
        return;
    }
    
    console.log('\nStep 2: Checking services...');
    
    try {
        const services = await window.FirebaseServices.getAllServices();
        if (services.length === 0) {
            console.log('No services found. Run setupDefaultServices() to add default services.');
        } else {
            console.log(`✓ Found ${services.length} services`);
        }
    } catch (error) {
        console.error('Error checking services:', error);
    }
    
    console.log('\nStep 3: Checking admin users...');
    
    try {
        const currentUser = firebaseAuth.currentUser;
        if (currentUser) {
            console.log(`✓ Currently signed in as: ${currentUser.email}`);
        } else {
            console.log('No admin user signed in.');
            console.log('Run setupFirstTimeAdmin() to create an admin user.');
        }
    } catch (error) {
        console.error('Error checking admin:', error);
    }
    
    console.log('\n=== Setup Wizard Complete ===');
    console.log('\nAvailable setup functions:');
    console.log('- setupFirstTimeAdmin() - Create your first admin user');
    console.log('- setupDefaultServices() - Add default nail services');
    console.log('- checkFirebaseConfig() - Verify Firebase configuration');
    console.log('\nFor detailed instructions, see FIREBASE_SETUP_INSTRUCTIONS.md');
}

// Export functions for global use
window.FirebaseSetup = {
    checkFirebaseConfig,
    setupFirstTimeAdmin,
    setupDefaultServices,
    runSetupWizard
};

// Log helpful message when script loads
console.log('Firebase Setup Helper loaded. Run FirebaseSetup.runSetupWizard() to begin setup.');

