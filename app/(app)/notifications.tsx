import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/context'; // Assuming you have a session context
import { DB_API_URL } from '@/config';

// Define the type for a notification
type Notification = {
    message: string;
    latitude?: number;
    longitude?: number;
    created_at: string;
};

// Props for NotificationsModal
type NotificationsModalProps = {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
};

export default function NotificationsModal({ modalVisible, setModalVisible }: NotificationsModalProps) {
    const { user } = useSession(); // Get the logged-in user
    const [notifications, setNotifications] = useState<Notification[]>([]); // Use the Notification type

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const response = await fetch(`${DB_API_URL}/get_notifications/${user.uid}`);
                const data: Notification[] = await response.json(); // Explicitly type the response
                console.log('Fetched notifications:', data); // Log the fetched notifications
                setNotifications(data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [user]);

    return (
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)} // Close the modal on request
        >
            <View style={styles.modalContainer}>
                {/* Close Button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                >
                    <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>

                {/* Title */}
                <Text style={styles.title}>Notifications</Text>

                {/* Notifications List */}
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                        <View key={index} style={styles.notification}>
                            <Text>{notification.message}</Text>
                            <Text style={styles.timestamp}>
                                {new Date(notification.created_at).toLocaleString()}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noNotificationsText}>No new notifications</Text>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff', // Solid darker background
        padding: 20,
        paddingTop: 40,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 20,
    },
    notification: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    timestamp: {
        fontSize: 12,
        color: '#777',
        marginTop: 5,
    },
    noNotificationsText: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 20,
    },
});