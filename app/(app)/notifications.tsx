import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/context'; // Assuming you have a session context
import { DB_API_URL } from '@/config';

type Notification = {
    message: string;
    latitude?: number;
    longitude?: number;
    image_url?: string;
    created_at: string;
};

type NotificationsModalProps = {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
};

export default function NotificationsModal({ modalVisible, setModalVisible }: NotificationsModalProps) {
    const { user } = useSession(); // Get the logged-in user
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const response = await fetch(`${DB_API_URL}/get_notifications/${user.uid}`);
                const data: Notification[] = await response.json();
                console.log('Fetched Notifications:', data); // Log the notifications
                setNotifications(data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [user]);

    const fetchAddress = async (latitude: number, longitude: number) => {
        try {
            setLoadingAddress(true);
            const apiKey = process.env.EXPO_PUBLIC_GMAPS_API_KEY; // Replace with your Google Maps API key
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
            );
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                setAddress(data.results[0].formatted_address);
            } else {
                setAddress('Address not available');
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            setAddress('Error fetching address');
        } finally {
            setLoadingAddress(false);
        }
    };

    const handleNotificationPress = (notification: Notification) => {
        console.log('Selected Notification:', notification); // Log the selected notification
        setSelectedNotification(notification);
        if (notification.latitude && notification.longitude) {
            fetchAddress(notification.latitude, notification.longitude);
        }
    };

    const closeNotificationModal = () => {
        setSelectedNotification(null);
        setAddress(null);
    };

    return (
        <>
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
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
                            <TouchableOpacity
                                key={index}
                                style={styles.notification}
                                onPress={() => handleNotificationPress(notification)}
                            >
                                <Text>{notification.message}</Text>
                                <Text style={styles.timestamp}>
                                    {new Date(notification.created_at).toLocaleString()}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.noNotificationsText}>No new notifications</Text>
                    )}
                </View>
            </Modal>

            {/* Notification Details Modal */}
            {selectedNotification && (
                <Modal
                    visible={!!selectedNotification}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={closeNotificationModal}
                >
                    <View style={styles.detailModalContainer}>
                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeNotificationModal}
                        >
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>

                        {/* Notification Details */}
                        <Text style={styles.detailTitle}>Notification Details</Text>
                        <Text style={styles.detailMessage}>{selectedNotification.message}</Text>

                        {/* Address */}
                        {loadingAddress ? (
                            <ActivityIndicator size="large" color="#4C6EF5" />
                        ) : (
                            <Text style={styles.detailAddress}>
                                Address: {address || 'Fetching address...'}
                            </Text>
                        )}

                        {/* Image */}
                        {selectedNotification.image_url ? (
                            <View style={styles.imageContainer}>
                                {loadingImage && (
                                    <ActivityIndicator
                                        size="large"
                                        color="#4C6EF5"
                                        style={styles.imageLoader}
                                    />
                                )}
                                <Image
                                    source={{ uri: selectedNotification.image_url }}
                                    style={styles.detailImage}
                                    resizeMode="contain"
                                    onLoadStart={() => setLoadingImage(true)} // Show loader when loading starts
                                    onLoadEnd={() => setLoadingImage(false)} // Hide loader when loading ends
                                    onError={(error) => {
                                        console.error('Image Load Error:', error.nativeEvent);
                                        setLoadingImage(false); // Hide loader if there's an error
                                    }}
                                />
                            </View>
                        ) : (
                            <Text style={styles.noImageText}>No image available</Text>
                        )}
                        {selectedNotification.image_url && console.log('Image URL:', selectedNotification.image_url)}
                    </View>
                </Modal>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
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
    detailModalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 40,
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    detailMessage: {
        fontSize: 16,
        marginBottom: 10,
    },
    detailAddress: {
        fontSize: 16,
        marginBottom: 10,
        color: '#555',
    },
    detailImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 10,
    },
    noImageText: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 20,
    },
    imageContainer: {
        position: 'relative',
    },
    imageLoader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
    },
});