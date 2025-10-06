// Firebase Messages for Nails By Sau
// Handles contact form messages and admin message management

class FirebaseMessages {
    constructor() {
        this.messagesCollection = 'messages';
    }

    // Save a new message from contact form
    async saveMessage(messageData) {
        try {
            const message = {
                name: messageData.name,
                email: messageData.email,
                phone: messageData.phone,
                subject: messageData.subject,
                message: messageData.message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'unread',
                readAt: null,
                replied: false,
                repliedAt: null
            };

            const docRef = await firebase.firestore()
                .collection(this.messagesCollection)
                .add(message);

            console.log('Message saved with ID:', docRef.id);
            return { success: true, messageId: docRef.id };
        } catch (error) {
            console.error('Error saving message:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all messages for admin dashboard
    async getAllMessages() {
        try {
            const messages = await firebase.firestore()
                .collection(this.messagesCollection)
                .orderBy('timestamp', 'desc')
                .get();

            const messagesList = [];
            messages.forEach(doc => {
                messagesList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return { success: true, messages: messagesList };
        } catch (error) {
            console.error('Error fetching messages:', error);
            return { success: false, error: error.message };
        }
    }

    // Get unread messages count
    async getUnreadCount() {
        try {
            const unreadMessages = await firebase.firestore()
                .collection(this.messagesCollection)
                .where('status', '==', 'unread')
                .get();

            return { success: true, count: unreadMessages.size };
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return { success: false, error: error.message };
        }
    }

    // Mark message as read
    async markAsRead(messageId) {
        try {
            await firebase.firestore()
                .collection(this.messagesCollection)
                .doc(messageId)
                .update({
                    status: 'read',
                    readAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            return { success: true };
        } catch (error) {
            console.error('Error marking message as read:', error);
            return { success: false, error: error.message };
        }
    }

    // Mark message as replied
    async markAsReplied(messageId) {
        try {
            await firebase.firestore()
                .collection(this.messagesCollection)
                .doc(messageId)
                .update({
                    replied: true,
                    repliedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            return { success: true };
        } catch (error) {
            console.error('Error marking message as replied:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete message
    async deleteMessage(messageId) {
        try {
            await firebase.firestore()
                .collection(this.messagesCollection)
                .doc(messageId)
                .delete();

            return { success: true };
        } catch (error) {
            console.error('Error deleting message:', error);
            return { success: false, error: error.message };
        }
    }

    // Get message by ID
    async getMessage(messageId) {
        try {
            const messageDoc = await firebase.firestore()
                .collection(this.messagesCollection)
                .doc(messageId)
                .get();

            if (messageDoc.exists) {
                return { 
                    success: true, 
                    message: { id: messageDoc.id, ...messageDoc.data() } 
                };
            } else {
                return { success: false, error: 'Message not found' };
            }
        } catch (error) {
            console.error('Error fetching message:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize messages handler
window.FirebaseMessages = new FirebaseMessages();
