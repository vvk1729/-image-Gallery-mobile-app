import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

const ImageCard = ({ photo }) => {
    return (
        <View style={styles.card}>
            <Image
                source={{ uri: photo.url }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>
                    {photo.title}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: CARD_WIDTH,
        backgroundColor: '#f0f0f0',
    },
    titleContainer: {
        padding: 8,
        minHeight: 50,
    },
    title: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
});

export default ImageCard;
