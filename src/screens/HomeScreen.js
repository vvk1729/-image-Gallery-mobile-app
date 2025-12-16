import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    RefreshControl,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchRecentPhotos } from '../services/flickrService';
import { cacheImages, getCachedImages, hasResponseChanged } from '../services/cacheService';
import ImageCard from '../components/ImageCard';

const HomeScreen = ({ navigation }) => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showRetrySnackbar, setShowRetrySnackbar] = useState(false);

    // Load photos on mount
    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = async (page = 1) => {
        try {
            if (page === 1) {
                setError(null);
            } else {
                setLoadingMore(true);
            }

            // First, try to load from cache (only for page 1)
            if (page === 1) {
                const cachedPhotos = await getCachedImages();
                if (cachedPhotos && cachedPhotos.length > 0) {
                    setPhotos(cachedPhotos);
                    setLoading(false);
                }
            }

            // Then try to fetch from API
            try {
                const result = await fetchRecentPhotos(page);

                // For page 1, check if response has changed
                if (page === 1) {
                    const changed = await hasResponseChanged(result.photos);

                    if (changed) {
                        // Update UI with fresh data
                        setPhotos(result.photos);
                        // Cache the new data
                        await cacheImages(result.photos);
                        console.log('Fresh data loaded and cached');
                    } else {
                        console.log('Using cached data (no changes detected)');
                    }
                } else {
                    // For pagination, append to existing photos
                    setPhotos(prev => [...prev, ...result.photos]);
                }

                setCurrentPage(result.page);
                setTotalPages(result.pages);
                setIsOffline(false);
                setShowRetrySnackbar(false);
            } catch (apiError) {
                console.log('API Error:', apiError.message);
                
                if (page === 1) {
                    // If API fails on page 1 and we have cache, use cache
                    const cachedPhotos = await getCachedImages();
                    if (cachedPhotos && cachedPhotos.length > 0) {
                        console.log('API failed, using cached data');
                        setIsOffline(true);
                    } else {
                        // No cache and API failed - show friendly error
                        setError('No internet connection. Please connect to the internet to load photos for the first time.');
                        setIsOffline(true);
                        setShowRetrySnackbar(true);
                    }
                } else {
                    // Pagination failed
                    setShowRetrySnackbar(true);
                }
            }
        } catch (err) {
            console.error('Error loading photos:', err);
            setError('Failed to load photos. Please check your connection and try again.');
            setShowRetrySnackbar(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const loadMorePhotos = () => {
        if (!loadingMore && !loading && currentPage < totalPages) {
            loadPhotos(currentPage + 1);
        }
    };

    const handleRetry = () => {
        setShowRetrySnackbar(false);
        if (photos.length === 0) {
            setLoading(true);
            loadPhotos(1);
        } else {
            loadPhotos(currentPage + 1);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setCurrentPage(1);
        loadPhotos(1);
    }, []);

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    const navigateToSearch = () => {
        setMenuVisible(false);
        navigation.navigate('Search');
    };

    const renderItem = ({ item }) => <ImageCard photo={item} />;

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.menuButton}
                onPress={toggleMenu}
            >
                <Ionicons name="menu" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Recent Photos</Text>
            <TouchableOpacity
                style={styles.searchButton}
                onPress={navigateToSearch}
            >
                <Ionicons name="search" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    );

    const renderOfflineBanner = () => {
        if (!isOffline) return null;

        return (
            <View style={styles.offlineBanner}>
                <Ionicons name="cloud-offline" size={16} color="#fff" />
                <Text style={styles.offlineText}>Offline - Showing cached photos</Text>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.footerText}>Loading more...</Text>
            </View>
        );
    };

    const renderRetrySnackbar = () => {
        if (!showRetrySnackbar) return null;

        return (
            <View style={styles.snackbar}>
                <View style={styles.snackbarContent}>
                    <Ionicons name="alert-circle" size={20} color="#fff" />
                    <Text style={styles.snackbarText}>Network Error</Text>
                </View>
                <TouchableOpacity onPress={handleRetry} style={styles.retrySnackbarButton}>
                    <Text style={styles.retrySnackbarText}>RETRY</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderMenu = () => (
        <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={toggleMenu}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={toggleMenu}
            >
                <View style={styles.menuContainer}>
                    <View style={styles.menuHeader}>
                        <Text style={styles.menuHeaderTitle}>Flickr Gallery</Text>
                        <Text style={styles.menuHeaderSubtitle}>Recent Photos</Text>
                    </View>

                    <View style={styles.menuContent}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={toggleMenu}
                        >
                            <Ionicons name="home" size={24} color="#667eea" />
                            <Text style={styles.menuItemText}>Home</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={navigateToSearch}
                        >
                            <Ionicons name="search" size={24} color="#667eea" />
                            <Text style={styles.menuItemText}>Search</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.menuFooter}>
                        <Text style={styles.menuFooterText}>Made with ❤️ for Internship</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    if (loading && photos.length === 0) {
        return (
            <View style={styles.centerContainer}>
                {renderHeader()}
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Loading photos...</Text>
            </View>
        );
    }

    if (error && photos.length === 0) {
        return (
            <View style={styles.centerContainer}>
                {renderHeader()}
                <Ionicons name="alert-circle" size={64} color="#ff6b6b" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => loadPhotos(1)}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderOfflineBanner()}
            {renderMenu()}
            <FlatList
                data={photos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.row}
                ListFooterComponent={renderFooter}
                onEndReached={loadMorePhotos}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#667eea']}
                        tintColor="#667eea"
                    />
                }
            />
            {renderRetrySnackbar()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    menuButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    searchButton: {
        padding: 8,
    },
    offlineBanner: {
        backgroundColor: '#ff9800',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    offlineText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    listContent: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    retryButton: {
        marginTop: 24,
        backgroundColor: '#667eea',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        width: 280,
        height: '100%',
        backgroundColor: '#fff',
    },
    menuHeader: {
        backgroundColor: '#667eea',
        padding: 20,
        paddingTop: 50,
        paddingBottom: 30,
    },
    menuHeaderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    menuHeaderSubtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    menuContent: {
        flex: 1,
        paddingTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        marginLeft: 16,
    },
    menuFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    menuFooterText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    snackbar: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: '#323232',
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    snackbarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    snackbarText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 12,
    },
    retrySnackbarButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    retrySnackbarText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
