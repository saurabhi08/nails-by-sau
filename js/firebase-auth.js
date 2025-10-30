// Firebase Authentication Management
// Handles admin authentication and user management

// Sign in admin user
async function signInAdmin(email, password) {
    try {
        // Check if customer is already logged in
        const currentUser = firebaseAuth.currentUser;
        if (currentUser && !isAdminUser(currentUser)) {
            return { success: false, error: 'Customer is already logged in. Please logout from customer account first.' };
        }
        
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        console.log('Admin signed in:', userCredential.user.email);
        
        // Verify this is actually an admin user
        if (!isAdminUser(userCredential.user)) {
            await firebaseAuth.signOut();
            return { success: false, error: 'This account is not authorized for admin access.' };
        }
        
        // Store admin status in localStorage
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminEmail', userCredential.user.email);
        
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error signing in:', error);
        return { success: false, error: error.message };
    }
}

// Sign out admin user
async function signOutAdmin() {
    try {
        await firebaseAuth.signOut();
        
        // Clear local storage
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminEmail');
        
        console.log('Admin signed out');
        
        // Show logout confirmation
        if (window.MessagingSystem) {
            window.MessagingSystem.showLogoutConfirmation();
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error signing out:', error);
        return { success: false, error: error.message };
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return firebaseAuth.currentUser !== null;
}

// Get current user
function getCurrentUser() {
    return firebaseAuth.currentUser;
}

// Listen to authentication state changes
function onAuthStateChanged(callback) {
    return firebaseAuth.onAuthStateChanged(callback);
}

// Create admin user (for initial setup only)
async function createAdminUser(email, password) {
    try {
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        
        // Add admin role to Firestore
        await firebaseDB.collection('admins').doc(userCredential.user.uid).set({
            email: email,
            role: 'admin',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Admin user created:', userCredential.user.email);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error creating admin user:', error);
        return { success: false, error: error.message };
    }
}

// Check if user is admin
async function isUserAdmin(userId) {
    try {
        const doc = await firebaseDB.collection('admins').doc(userId).get();
        return doc.exists && doc.data().role === 'admin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Check if a user is an admin user (by strict allowlist)
function isAdminUser(user) {
    if (!user || !user.email) return false;
    const adminEmails = [
        'survesaurabhi7@gmail.com'
    ];
    return adminEmails.includes(user.email.toLowerCase());
}

// Reset password
async function resetPassword(email) {
    try {
        await firebaseAuth.sendPasswordResetEmail(email);
        console.log('Password reset email sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
}

// Update user profile
async function updateUserProfile(displayName, photoURL) {
    try {
        const user = firebaseAuth.currentUser;
        
        if (user) {
            await user.updateProfile({
                displayName: displayName,
                photoURL: photoURL
            });
            
            console.log('User profile updated');
            return { success: true };
        } else {
            return { success: false, error: 'No user signed in' };
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }
}

// Export functions
window.FirebaseAuth = {
    signInAdmin,
    signOutAdmin,
    isAuthenticated,
    getCurrentUser,
    onAuthStateChanged,
    createAdminUser,
    isUserAdmin,
    isAdminUser,
    resetPassword,
    updateUserProfile
};

