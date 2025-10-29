// Real-time Statistics and Metrics System for Nails By Sau
// Provides live dashboard statistics and analytics

class DashboardStats {
    constructor() {
        this.stats = {
            appointments: {
                total: 0,
                today: 0,
                thisWeek: 0,
                thisMonth: 0,
                pending: 0,
                confirmed: 0,
                completed: 0,
                cancelled: 0
            },
            customers: {
                total: 0,
                active: 0,
                newThisMonth: 0,
                returning: 0
            },
            revenue: {
                total: 0,
                thisMonth: 0,
                thisWeek: 0,
                today: 0,
                averagePerAppointment: 0
            },
            services: {
                mostPopular: null,
                totalServices: 0,
                serviceStats: []
            }
        };
        
        this.refreshInterval = null;
        this.init();
    }

    // Initialize dashboard stats
    init() {
        this.loadStats();
        this.startAutoRefresh();
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for data changes
        document.addEventListener('appointmentUpdated', () => {
            this.refreshStats();
        });
        
        document.addEventListener('customerUpdated', () => {
            this.refreshStats();
        });
        
        document.addEventListener('paymentProcessed', () => {
            this.refreshStats();
        });
    }

    // Start auto-refresh every 30 seconds
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.refreshStats();
        }, 30000); // 30 seconds
    }

    // Stop auto-refresh
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Load all statistics
    async loadStats() {
        try {
            await Promise.all([
                this.loadAppointmentStats(),
                this.loadCustomerStats(),
                this.loadRevenueStats(),
                this.loadServiceStats()
            ]);
            
            this.updateDashboardUI();
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    // Refresh stats (public method)
    async refreshStats() {
        await this.loadStats();
    }

    // Load appointment statistics
    async loadAppointmentStats() {
        try {
            const appointments = await window.FirebaseAppointments.getAllAppointments();
            
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const thisWeek = this.getWeekStart(now);
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            this.stats.appointments = {
                total: appointments.length,
                today: appointments.filter(apt => apt.appointmentDate === today).length,
                thisWeek: appointments.filter(apt => new Date(apt.appointmentDate) >= thisWeek).length,
                thisMonth: appointments.filter(apt => new Date(apt.appointmentDate) >= thisMonth).length,
                pending: appointments.filter(apt => apt.status === 'pending').length,
                confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
                completed: appointments.filter(apt => apt.status === 'completed').length,
                cancelled: appointments.filter(apt => apt.status === 'cancelled').length
            };
        } catch (error) {
            console.error('Error loading appointment stats:', error);
        }
    }

    // Load customer statistics
    async loadCustomerStats() {
        try {
            const customers = await window.CustomerManager.getAllPayments ? 
                await window.CustomerManager.getAllPayments() : 
                window.CustomerManager.customers || [];
            
            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            this.stats.customers = {
                total: customers.length,
                active: customers.filter(c => c.status === 'active').length,
                newThisMonth: customers.filter(c => {
                    const createdAt = new Date(c.createdAt);
                    return createdAt >= thisMonth;
                }).length,
                returning: customers.filter(c => (c.totalAppointments || 0) > 1).length
            };
        } catch (error) {
            console.error('Error loading customer stats:', error);
        }
    }

    // Load revenue statistics
    async loadRevenueStats() {
        try {
            const payments = await window.PaymentHistoryManager.getAllPayments();
            
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const thisWeek = this.getWeekStart(now);
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const todayRevenue = payments.filter(p => p.createdAt && p.createdAt.split('T')[0] === today)
                .reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const weekRevenue = payments.filter(p => p.createdAt && new Date(p.createdAt) >= thisWeek)
                .reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const monthRevenue = payments.filter(p => p.createdAt && new Date(p.createdAt) >= thisMonth)
                .reduce((sum, payment) => sum + (payment.amount || 0), 0);
            
            this.stats.revenue = {
                total: totalRevenue,
                thisMonth: monthRevenue,
                thisWeek: weekRevenue,
                today: todayRevenue,
                averagePerAppointment: this.stats.appointments.total > 0 ? 
                    totalRevenue / this.stats.appointments.total : 0
            };
        } catch (error) {
            console.error('Error loading revenue stats:', error);
        }
    }

    // Load service statistics
    async loadServiceStats() {
        try {
            const appointments = await window.FirebaseAppointments.getAllAppointments();
            const services = await window.FirebaseServices.getAllServices();
            
            // Count service popularity
            const serviceCounts = {};
            appointments.forEach(apt => {
                if (apt.service) {
                    serviceCounts[apt.service] = (serviceCounts[apt.service] || 0) + 1;
                }
            });
            
            const mostPopularService = Object.keys(serviceCounts).reduce((a, b) => 
                serviceCounts[a] > serviceCounts[b] ? a : b, null);
            
            this.stats.services = {
                mostPopular: mostPopularService,
                totalServices: services.length,
                serviceStats: Object.entries(serviceCounts).map(([service, count]) => ({
                    service,
                    count,
                    percentage: appointments.length > 0 ? (count / appointments.length) * 100 : 0
                }))
            };
        } catch (error) {
            console.error('Error loading service stats:', error);
        }
    }

    // Get week start date
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    }

    // Update dashboard UI
    updateDashboardUI() {
        // Update appointment stats
        this.updateStatElement('total-appointments', this.stats.appointments.total);
        this.updateStatElement('today-appointments', this.stats.appointments.today);
        this.updateStatElement('week-appointments', this.stats.appointments.thisWeek);
        this.updateStatElement('month-appointments', this.stats.appointments.thisMonth);
        this.updateStatElement('pending-appointments', this.stats.appointments.pending);
        this.updateStatElement('confirmed-appointments', this.stats.appointments.confirmed);
        this.updateStatElement('completed-appointments', this.stats.appointments.completed);
        this.updateStatElement('cancelled-appointments', this.stats.appointments.cancelled);

        // Update customer stats
        this.updateStatElement('total-customers', this.stats.customers.total);
        this.updateStatElement('active-customers', this.stats.customers.active);
        this.updateStatElement('new-customers-month', this.stats.customers.newThisMonth);
        this.updateStatElement('returning-customers', this.stats.customers.returning);

        // Update revenue stats
        this.updateStatElement('total-revenue', this.formatCurrency(this.stats.revenue.total));
        this.updateStatElement('month-revenue', this.formatCurrency(this.stats.revenue.thisMonth));
        this.updateStatElement('week-revenue', this.formatCurrency(this.stats.revenue.thisWeek));
        this.updateStatElement('today-revenue', this.formatCurrency(this.stats.revenue.today));
        this.updateStatElement('avg-revenue-per-appointment', this.formatCurrency(this.stats.revenue.averagePerAppointment));

        // Update service stats
        this.updateStatElement('most-popular-service', this.stats.services.mostPopular || 'N/A');
        this.updateStatElement('total-services', this.stats.services.totalServices);

        // Update charts if they exist
        this.updateCharts();
    }

    // Update individual stat element
    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Add animation effect
            element.style.transform = 'scale(1.05)';
            element.textContent = value;
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    }

    // Update charts
    updateCharts() {
        this.updateAppointmentStatusChart();
        this.updateRevenueChart();
        this.updateServicePopularityChart();
    }

    // Update appointment status chart
    updateAppointmentStatusChart() {
        const chartElement = document.getElementById('appointment-status-chart');
        if (!chartElement) return;

        const data = [
            { label: 'Pending', value: this.stats.appointments.pending, color: '#ffc107' },
            { label: 'Confirmed', value: this.stats.appointments.confirmed, color: '#17a2b8' },
            { label: 'Completed', value: this.stats.appointments.completed, color: '#28a745' },
            { label: 'Cancelled', value: this.stats.appointments.cancelled, color: '#dc3545' }
        ];

        this.createDonutChart(chartElement, data);
    }

    // Update revenue chart
    updateRevenueChart() {
        const chartElement = document.getElementById('revenue-chart');
        if (!chartElement) return;

        const data = [
            { label: 'Today', value: this.stats.revenue.today, color: '#ff69b4' },
            { label: 'This Week', value: this.stats.revenue.thisWeek, color: '#ff1493' },
            { label: 'This Month', value: this.stats.revenue.thisMonth, color: '#e91e63' },
            { label: 'Total', value: this.stats.revenue.total, color: '#ad1457' }
        ];

        this.createBarChart(chartElement, data);
    }

    // Update service popularity chart
    updateServicePopularityChart() {
        const chartElement = document.getElementById('service-popularity-chart');
        if (!chartElement) return;

        const data = this.stats.services.serviceStats.slice(0, 5); // Top 5 services
        this.createHorizontalBarChart(chartElement, data);
    }

    // Create donut chart
    createDonutChart(container, data) {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;

        let html = '<div class="chart-container">';
        let cumulativePercentage = 0;

        data.forEach(item => {
            const percentage = (item.value / total) * 100;
            html += `
                <div class="chart-segment" style="
                    background: conic-gradient(${item.color} ${cumulativePercentage}% ${cumulativePercentage + percentage}%);
                    transform: rotate(${cumulativePercentage * 3.6}deg);
                ">
                    <div class="chart-label">
                        <span class="chart-color" style="background: ${item.color}"></span>
                        <span>${item.label}: ${item.value}</span>
                    </div>
                </div>
            `;
            cumulativePercentage += percentage;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    // Create bar chart
    createBarChart(container, data) {
        const maxValue = Math.max(...data.map(item => item.value));
        
        let html = '<div class="bar-chart">';
        data.forEach(item => {
            const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            html += `
                <div class="bar-item">
                    <div class="bar" style="height: ${height}%; background: ${item.color}"></div>
                    <div class="bar-label">${item.label}</div>
                    <div class="bar-value">${this.formatCurrency(item.value)}</div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    // Create horizontal bar chart
    createHorizontalBarChart(container, data) {
        const maxValue = Math.max(...data.map(item => item.count));
        
        let html = '<div class="horizontal-bar-chart">';
        data.forEach(item => {
            const width = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
            html += `
                <div class="horizontal-bar-item">
                    <div class="bar-label">${item.service}</div>
                    <div class="bar-container">
                        <div class="bar" style="width: ${width}%; background: #ff69b4"></div>
                        <span class="bar-value">${item.count}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    // Get statistics summary
    getStatsSummary() {
        return {
            ...this.stats,
            lastUpdated: new Date().toISOString(),
            refreshInterval: this.refreshInterval ? 30000 : 0
        };
    }

    // Export statistics
    exportStats() {
        const csvContent = this.generateStatsCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard_stats_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Generate CSV content for statistics
    generateStatsCSV() {
        const headers = ['Metric', 'Value', 'Category'];
        const rows = [
            ['Total Appointments', this.stats.appointments.total, 'Appointments'],
            ['Today Appointments', this.stats.appointments.today, 'Appointments'],
            ['This Week Appointments', this.stats.appointments.thisWeek, 'Appointments'],
            ['This Month Appointments', this.stats.appointments.thisMonth, 'Appointments'],
            ['Pending Appointments', this.stats.appointments.pending, 'Appointments'],
            ['Confirmed Appointments', this.stats.appointments.confirmed, 'Appointments'],
            ['Completed Appointments', this.stats.appointments.completed, 'Appointments'],
            ['Cancelled Appointments', this.stats.appointments.cancelled, 'Appointments'],
            ['Total Customers', this.stats.customers.total, 'Customers'],
            ['Active Customers', this.stats.customers.active, 'Customers'],
            ['New Customers This Month', this.stats.customers.newThisMonth, 'Customers'],
            ['Returning Customers', this.stats.customers.returning, 'Customers'],
            ['Total Revenue', this.stats.revenue.total, 'Revenue'],
            ['This Month Revenue', this.stats.revenue.thisMonth, 'Revenue'],
            ['This Week Revenue', this.stats.revenue.thisWeek, 'Revenue'],
            ['Today Revenue', this.stats.revenue.today, 'Revenue'],
            ['Average Revenue Per Appointment', this.stats.revenue.averagePerAppointment, 'Revenue'],
            ['Most Popular Service', this.stats.services.mostPopular, 'Services'],
            ['Total Services', this.stats.services.totalServices, 'Services']
        ];

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
    }
}

// Initialize dashboard stats
window.DashboardStats = new DashboardStats();

// Global functions
window.refreshDashboardStats = () => window.DashboardStats.refreshStats();
window.exportDashboardStats = () => window.DashboardStats.exportStats();
