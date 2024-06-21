// Replace these with your Supabase URL and ANON key
const SUPABASE_URL = 'https://your-supabase-url';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize the map and set its view to a default location
var map = L.map('map').setView([51.505, -0.09], 13);

// Add a tile layer to the map (this is the background map you see)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to add a marker and popup to the map
function addMarker(lat, lon, name) {
    var marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(name).openPopup();
}

// Function to handle search
async function searchLocation(query) {
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .ilike('name', `%${query}%`);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data.length > 0) {
        var bounds = new L.LatLngBounds();
        data.forEach(item => {
            addMarker(item.lat, item.lon, item.name);
            bounds.extend([item.lat, item.lon]);
        });
        map.fitBounds(bounds);
    } else {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    var bounds = new L.LatLngBounds();
                    data.forEach(item => {
                        addMarker(item.lat, item.lon, item.display_name);
                        bounds.extend([item.lat, item.lon]);
                    });
                    map.fitBounds(bounds);
                } else {
                    alert("Location not found!");
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

// Function to handle autocomplete suggestions
function autocompleteSearch() {
    var location = document.getElementById('location-input').value;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
        .then(response => response.json())
        .then(data => {
            var dropdown = document.getElementById('dropdown');
            dropdown.innerHTML = '';

            if (data.length > 0) {
                dropdown.style.display = 'block';
                data.forEach(item => {
                    var option = document.createElement('div');
                    option.textContent = `${item.display_name}`;
                    option.addEventListener('click', () => {
                        document.getElementById('location-input').value = item.display_name;
                        dropdown.style.display = 'none';
                        searchLocation(item.display_name);
                    });
                    dropdown.appendChild(option);
                });
            } else {
                dropdown.style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
}

// Add event listener to the search button
document.getElementById('search-button').addEventListener('click', () => {
    var location = document.getElementById('location-input').value;
    searchLocation(location);
});

// Add event listener to the input field for autocomplete
document.getElementById('location-input').addEventListener('input', autocompleteSearch);

// Function to add a new location to Supabase
document.getElementById('add-location-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const name = formData.get('name');
    const lat = parseFloat(formData.get('lat'));
    const lon = parseFloat(formData.get('lon'));
    const description = formData.get('description');
    const dealType = formData.get('deal_type');
    let couponCode = null;
    let couponImage = null;
    let couponBarcode = null;

    if (dealType === 'coupon_code') {
        couponCode = formData.get('coupon_code');
    } else if (dealType === 'coupon_image') {
        const file = formData.get('coupon_image');
        couponImage = await uploadFile(file);
    } else if (dealType === 'coupon_barcode') {
        const file = formData.get('coupon_barcode');
        couponBarcode = await uploadFile(file);
    }

    const photos = [];
    const files = formData.getAll('photos');
    for (const file of files) {
        const photoUrl = await uploadFile(file);
        photos.push(photoUrl);
    }

    const { data, error } = await supabase
        .from('locations')
        .insert([
            {
                name,
                lat,
                lon,
                description,
                deal_type: dealType,
                coupon_code: couponCode,
                coupon_image: couponImage,
                coupon_barcode: couponBarcode,
                photos
            }
        ]);

    if (error) {
        console.error('Error:', error);
        return;
    }

    alert('Location added successfully!');
    event.target.reset();
});

// Function to upload files to Supabase Storage and return the URL
async function uploadFile(file) {
    const { data, error } = await supabase.storage.from('uploads').upload(file.name, file, {
        cacheControl: '3600',
        upsert: false
    });

    if (error) {
        console.error('Error uploading file:', error);
        return null;
    }

    return data?.Key;
}
