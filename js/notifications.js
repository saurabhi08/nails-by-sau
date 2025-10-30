// Notifications for Nails By Sau
// Sends booking confirmations to customer and owner via email (EmailJS if configured)
// and stores an SMS queue record in Firestore for later processing.

(function() {

    async function notifyBooking(appointmentData) {
        try {
            await Promise.all([
                sendEmailNotification(appointmentData),
                queueSmsNotification(appointmentData)
            ]);
            return { success: true };
        } catch (err) {
            console.error('Notification error:', err);
            return { success: false, error: err.message };
        }
    }

    async function sendEmailNotification(appointmentData) {
        const customerEmail = appointmentData.email;
        const recipients = [customerEmail].filter(Boolean);

        // If EmailJS is available, send emails directly from the client
        if (window.emailjs && typeof window.emailjs.send === 'function') {
            const serviceId = window.EMAILJS_SERVICE_ID;
            const templateId = window.EMAILJS_TEMPLATE_ID;
            const publicKey = window.EMAILJS_PUBLIC_KEY;

            if (!serviceId || !templateId || !publicKey) {
                console.warn('EmailJS not configured. Skipping direct email send.');
                return saveEmailQueue(appointmentData, recipients);
            }

            try {
                window.emailjs.init(publicKey);
                const sendPromises = recipients.map((toEmail) => {
                    const templateParams = buildTemplateParams(appointmentData, toEmail);
                    return window.emailjs.send(serviceId, templateId, templateParams);
                });
                await Promise.all(sendPromises);
                return { success: true };
            } catch (e) {
                console.error('EmailJS send failed, queueing:', e);
                return saveEmailQueue(appointmentData, recipients);
            }
        }

        // Fallback: store a queue doc in Firestore for processing later
        return saveEmailQueue(appointmentData, recipients);
    }

    function buildTemplateParams(appointmentData, toEmail) {
        return {
            to_email: toEmail,
            customer_name: appointmentData.name || appointmentData.firstName || 'Customer',
            customer_email: appointmentData.email,
            customer_phone: appointmentData.phone || '',
            service: appointmentData.service || appointmentData.serviceName || '',
            appointment_date: appointmentData.appointmentDate || appointmentData.date || '',
            appointment_time: appointmentData.appointmentTime || appointmentData.time || '',
            notes: appointmentData.notes || ''
        };
    }

    async function saveEmailQueue(appointmentData, recipients) {
        try {
            const db = window.firebaseDB || firebase.firestore();
            const payload = {
                type: 'booking_confirmation',
                recipients: recipients,
                data: {
                    email: appointmentData.email,
                    phone: appointmentData.phone || '',
                    service: appointmentData.service || appointmentData.serviceName || '',
                    date: appointmentData.appointmentDate || appointmentData.date || '',
                    time: appointmentData.appointmentTime || appointmentData.time || '',
                    name: appointmentData.name || appointmentData.firstName || ''
                },
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('emailQueue').add(payload);
            return { success: true };
        } catch (e) {
            console.error('Failed to queue email notification:', e);
            return { success: false, error: e.message };
        }
    }

    async function queueSmsNotification(appointmentData) {
        try {
            const db = window.firebaseDB || firebase.firestore();
            const recipients = [appointmentData.phone || null].filter(Boolean);
            const payload = {
                type: 'booking_confirmation',
                recipients: recipients,
                message: buildSmsMessage(appointmentData),
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('smsQueue').add(payload);
            return { success: true };
        } catch (e) {
            console.error('Failed to queue SMS notification:', e);
            return { success: false, error: e.message };
        }
    }

    function buildSmsMessage(appointmentData) {
        const service = appointmentData.service || appointmentData.serviceName || 'Service';
        const date = appointmentData.appointmentDate || appointmentData.date || '';
        const time = appointmentData.appointmentTime || appointmentData.time || '';
        return `Nails By Sau: Booking confirmed for ${service} on ${date} at ${time}. Reply if you need to reschedule.`;
    }

    window.Notifications = {
        notifyBooking
    };
})();


