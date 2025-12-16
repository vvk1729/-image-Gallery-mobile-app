const API_KEY = '6f102c62f41998d151e5a1b48713cf13';
const BASE_URL = 'https://api.flickr.com/services/rest/';

/**
 * Fetch recent photos from Flickr API with pagination
 * @param {number} page - Page number to fetch
 * @param {number} perPage - Number of photos per page
 */
export const fetchRecentPhotos = async (page = 1, perPage = 20) => {
    try {
        const url = `${BASE_URL}?method=flickr.photos.getRecent&per_page=${perPage}&page=${page}&api_key=${API_KEY}&format=json&nojsoncallback=1&extras=url_s`;
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.stat !== 'ok') {
            throw new Error('Flickr API returned an error');
        }

        // Extract and format photo data
        const photos = data.photos.photo.map(photo => ({
            id: photo.id,
            title: photo.title || 'Untitled',
            url: photo.url_s, // Small image URL
            owner: photo.owner,
            server: photo.server,
            secret: photo.secret,
        }));

        return {
            photos,
            page: data.photos.page,
            pages: data.photos.pages,
            total: data.photos.total,
        };
    } catch (error) {
        console.error('Error fetching Flickr photos:', error);
        throw error;
    }
};

/**
 * Search photos from Flickr API
 * @param {string} searchText - Text to search for
 * @param {number} page - Page number to fetch
 * @param {number} perPage - Number of photos per page
 */
export const searchPhotos = async (searchText, page = 1, perPage = 20) => {
    try {
        const url = `${BASE_URL}?method=flickr.photos.search&api_key=${API_KEY}&format=json&nojsoncallback=1&extras=url_s&text=${encodeURIComponent(searchText)}&per_page=${perPage}&page=${page}`;
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.stat !== 'ok') {
            throw new Error('Flickr API returned an error');
        }

        // Extract and format photo data
        const photos = data.photos.photo.map(photo => ({
            id: photo.id,
            title: photo.title || 'Untitled',
            url: photo.url_s, // Small image URL
            owner: photo.owner,
            server: photo.server,
            secret: photo.secret,
        }));

        return {
            photos,
            page: data.photos.page,
            pages: data.photos.pages,
            total: data.photos.total,
        };
    } catch (error) {
        console.error('Error searching Flickr photos:', error);
        throw error;
    }
};

/**
 * Build photo URL manually if url_s is not available
 */
export const buildPhotoUrl = (photo) => {
    return `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`;
};
