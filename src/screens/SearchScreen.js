import React, { useState } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchPhotos } from '../services/flickrService';
import ImageCard from '../components/ImageCard';

const SearchScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasSearched, setHasSearched] = useState(false);
    const [showRetrySnackbar, setShowRetrySnackbar] = useState(false);

    const handleSearch = async (page = 1) => {
        if (!searchText.trim()) {
            return;
        }

        try {
            if (page === 1) {
                setLoading(true);
                setError(null);
            } else {
                setLoadingMore(true);
            }

            const result = await searchPhotos(searchText.trim(), page);
            
            if (page === 1) {
                setPhotos(result.photos);
            } else {
                setPhotos(prev => [...prev, ...result.photos]);
            }
            
            setCurrentPage(result.page);
            setTotalPages(result.pages);
            setHasSearched(true);
            setShowRetrySnackbar(false);
            Keyboard.dismiss();
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search photos. Please check your connection.');
            setShowRetrySnackbar(true);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMorePhotos = () => {
        if (!loadingMore && currentPage < totalPages) {
            handleSearch(currentPage + 1);
        }
    };

    const handleRetry = () => {
        setShowRetrySnackbar(false);
        handleSearch(1);
    };

    const renderItem = ({ item }) => <ImageCard photo={item} />;

    const renderFooter = () => {
        if (!loadingMore) return null;
        
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.footerText}>Loading more...</Text>
            </View>
        );
    };

    const renderEmptyState = () => {
        if (loading) return null;
        
        if (!hasSearched) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={80} color="#ccc" />
                    <Text style={styles.emptyTitle}>Search Flickr Photos</Text>
                    <Text style={styles.emptyText}>
                        Try searching for "cat", "dog", "nature", or anything else!
                    </Text>
                </View>
            );
        }
        
        if (photos.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="images-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyTitle}>No Results Found</Text>
                    <Text style={styles.emptyText}>
                        Try searching with different keywords
                    </Text>
                </View>
            );
        }
        
        return null;
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search photos..."
                        value={searchText}
                        onChangeText={setSearchText}
                        onSubmitEditing={() => handleSearch(1)}
                        returnKeyType="search"
                        autoCapitalize="none"
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => handleSearch(1)}
                    disabled={!searchText.trim()}
                >
                    <Ionicons 
                        name="search" 
                        size={24} 
                        color={searchText.trim() ? "#667eea" : "#ccc"} 
                    />
                </TouchableOpacity>
            </View>

            {loading && photos.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            ) : (
                <FlatList
                    data={photos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={photos.length > 0 ? styles.row : null}
                    ListEmptyComponent={renderEmptyState}
                    ListFooterComponent={renderFooter}
                    onEndReached={loadMorePhotos}
                    onEndReachedThreshold={0.5}
                />
            )}

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
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        outlineStyle: 'none',
    },
    searchButton: {
        padding: 8,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
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

export default SearchScreen;
