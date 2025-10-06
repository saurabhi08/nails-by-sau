// Firebase Statistics and Analytics
// Handles dashboard statistics and reporting

// Get total appointments count
async function getTotalAppointmentsCount() {
    try {
        const snapshot = await firebaseDB.collection('appointments').get();
        return snapshot.size;
    } catch (error) {
        console.error('Error getting total appointments count:', error);
        return 0;
    }
}

// Get today's appointments count
async function getTodayAppointmentsCount() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const snapshot = await firebaseDB.collection('appointments')
            .where('appointmentDate', '==', today)
            .get();
        return snapshot.size;
    } catch (error) {
        console.error('Error getting today appointments count:', error);
        return 0;
    }
}

// Get monthly revenue
async function getMonthlyRevenue() {
    try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const snapshot = await firebaseDB.collection('appointments')
            .where('appointmentDate', '>=', firstDay)
            .where('appointmentDate', '<=', lastDay)
            .where('status', '==', 'completed')
            .get();
        
        let revenue = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            revenue += data.price || 0;
        });
        
        return revenue;
    } catch (error) {
        console.error('Error getting monthly revenue:', error);
        return 0;
    }
}

// Get active services count
async function getActiveServicesCount() {
    try {
        const snapshot = await firebaseDB.collection('services')
            .where('active', '==', true)
            .get();
        return snapshot.size;
    } catch (error) {
        console.error('Error getting active services count:', error);
        return 0;
    }
}

// Get appointments by status count
async function getAppointmentsByStatusCount(status) {
    try {
        const snapshot = await firebaseDB.collection('appointments')
            .where('status', '==', status)
            .get();
        return snapshot.size;
    } catch (error) {
        console.error('Error getting appointments by status count:', error);
        return 0;
    }
}

// Get revenue for date range
async function getRevenueForRange(startDate, endDate) {
    try {
        const snapshot = await firebaseDB.collection('appointments')
            .where('appointmentDate', '>=', startDate)
            .where('appointmentDate', '<=', endDate)
            .where('status', '==', 'completed')
            .get();
        
        let revenue = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            revenue += data.price || 0;
        });
        
        return revenue;
    } catch (error) {
        console.error('Error getting revenue for range:', error);
        return 0;
    }
}

// Get popular services
async function getPopularServices(limit = 5) {
    try {
        const snapshot = await firebaseDB.collection('appointments')
            .where('status', 'in', ['completed', 'confirmed'])
            .get();
        
        const serviceCount = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            const service = data.service;
            serviceCount[service] = (serviceCount[service] || 0) + 1;
        });
        
        // Sort by count
        const sortedServices = Object.entries(serviceCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
        
        return sortedServices;
    } catch (error) {
        console.error('Error getting popular services:', error);
        return [];
    }
}

// Get weekly statistics
async function getWeeklyStats() {
    try {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        const todayStr = now.toISOString().split('T')[0];
        
        const snapshot = await firebaseDB.collection('appointments')
            .where('appointmentDate', '>=', weekAgoStr)
            .where('appointmentDate', '<=', todayStr)
            .get();
        
        const dailyStats = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.appointmentDate;
            
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    count: 0,
                    revenue: 0
                };
            }
            
            dailyStats[date].count++;
            if (data.status === 'completed') {
                dailyStats[date].revenue += data.price || 0;
            }
        });
        
        return dailyStats;
    } catch (error) {
        console.error('Error getting weekly stats:', error);
        return {};
    }
}

// Get dashboard stats
async function getDashboardStats() {
    try {
        const [
            totalAppointments,
            todayAppointments,
            monthlyRevenue,
            activeServices
        ] = await Promise.all([
            getTotalAppointmentsCount(),
            getTodayAppointmentsCount(),
            getMonthlyRevenue(),
            getActiveServicesCount()
        ]);
        
        return {
            totalAppointments,
            todayAppointments,
            monthlyRevenue,
            activeServices
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return {
            totalAppointments: 0,
            todayAppointments: 0,
            monthlyRevenue: 0,
            activeServices: 0
        };
    }
}

// Export functions
window.FirebaseStats = {
    getTotalAppointmentsCount,
    getTodayAppointmentsCount,
    getMonthlyRevenue,
    getActiveServicesCount,
    getAppointmentsByStatusCount,
    getRevenueForRange,
    getPopularServices,
    getWeeklyStats,
    getDashboardStats
};

