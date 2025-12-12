const FLICKR_API_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=1&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s';

/**
 * Fetch recent photos from Flickr API
 */
export const fetchRecentPhotos = async () => {
    try {
        const response = await fetch(FLICKR_API_URL);

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

        return photos;
    } catch (error) {
        console.error('Error fetching Flickr photos:', error);
        throw error;
    }
};

/**
 * Build photo URL manually if url_s is not available
 */
export const buildPhotoUrl = (photo) => {
    return `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`;
};
