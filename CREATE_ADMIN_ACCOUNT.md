# Create Admin Account for Professor

## Quick Setup - Admin Account for Professor

### Step 1: Open Your Website
1. Open `public/index.html` in your browser
2. Press **F12** to open Developer Console
3. Click the **"Console"** tab

### Step 2: Run This Command

Copy and paste this into the console and press Enter:

```javascript
window.FirebaseAuth.createAdminUser('admin@nailsbysau.com', 'Professor2024!')
  .then(result => {
    if (result.success) {
      console.log('✅ Admin account created successfully!');
      console.log('Email: admin@nailsbysau.com');
      console.log('Password: Professor2024!');
      alert('Admin account created!\n\nEmail: admin@nailsbysau.com\nPassword: Professor2024!');
    } else {
      console.error('Error:', result.error);
      if (result.error.includes('email-already-in-use')) {
        console.log('Account already exists - you can use these credentials to login');
        alert('Admin account already exists!\n\nEmail: admin@nailsbysau.com\nPassword: Professor2024!');
      }
    }
  })
  .catch(error => console.error('Error:', error));
```

### Step 3: Verify It Works

1. **Go to admin dashboard:** Open `public/admin-dashboard.html`
2. **Login with:**
   - Email: `admin@nailsbysau.com`
   - Password: `Professor2024!`
3. **You should see the admin dashboard!** ✅

---

## 🎯 **Admin Credentials for Professor:**

**Email:** admin@nailsbysau.com  
**Password:** Professor2024!

**Admin Dashboard URL:** [Your deployed URL]/public/admin-dashboard.html

---

## ⚠️ **If Account Already Exists:**

If you see "email-already-in-use" error, it means you already created an admin account earlier.

**Two options:**

### **Option A: Use Existing Account**
Try logging in with emails you might have used:
- admin@nailsbysau.com
- [your email]@gmail.com
- sau@nailsbysau.com

### **Option B: Reset Password**

1. **Go to Firebase Console:** https://console.firebase.google.com/
2. **Select your project:** nailsbysau
3. **Click "Authentication"** → **"Users"**
4. **Find the admin user**
5. **Click the 3 dots (⋮)** next to the user
6. **Click "Reset password"**
7. **Check your email for reset link**

Or delete the old user and create a new one:
1. **Find the user** in Firebase Authentication
2. **Click the 3 dots (⋮)**
3. **Click "Delete account"**
4. **Run the create admin script again**

---

## 📝 **To Send to Professor:**

Once you deploy your app, send:

```
Subject: Nails By Sau - Deployed Application

Dear Professor,

My Nails By Sau booking system is now deployed and ready for review:

🌐 Live Application: [Your deployed URL]

🔑 Admin Login Credentials:
- URL: [Your deployed URL]/public/admin-dashboard.html
- Email: admin@nailsbysau.com
- Password: Professor2024!

📋 User Stories: 30 stories implemented (87% coverage)
- 23 of 25 Must Have stories completed (92%)
- See attached USER_STORIES_COVERAGE.md

💻 GitHub Repository: https://github.com/saurabhi08/nails-by-sau

Please let me know if you need any assistance accessing the application.

Best regards,
[Your Name]
```

---

## ✅ **Next Steps:**

1. **Run the script** in browser console to create admin account
2. **Test login** to verify it works
3. **Deploy your site** (Netlify or Firebase Hosting)
4. **Send professor** the deployed URL + credentials

---

**Go ahead and run that script in your browser console to create the admin account!** 🚀

