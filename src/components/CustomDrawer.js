import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import {
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';

const CustomDrawer = (props) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Flickr Gallery</Text>
                <Text style={styles.headerSubtitle}>Recent Photos</Text>
            </LinearGradient>

            <DrawerContentScrollView {...props} style={styles.drawerContent}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Made with ❤️ for Internship</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 50,
        paddingBottom: 30,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    drawerContent: {
        flex: 1,
        paddingTop: 10,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    footerText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});

export default CustomDrawer;
