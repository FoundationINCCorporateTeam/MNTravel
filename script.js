// Replace these with your Supabase URL and ANON key
const SUPABASE_URL = 'https://cjebwwrjllxuszyjmxwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqZWJ3d3JqbGx4dXN6eWpteHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg5MzY3NzUsImV4cCI6MjAzNDUxMjc3NX0.VeqDFVJaN-LtD8CpboGt2wDs_OQHFjWOqZHQ_2QsSUQ';
function createClient(url, key) {
    return new SupabaseClient(url, key);
}
// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Function to display location details
async function displayLocation(locationId) {
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', locationId)
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data) {
        // Display location details on the location.html page or wherever needed
        console.log('Location details:', data);
        // Example: Update DOM with location details
        document.getElementById('location-info').innerHTML = `
            <h2>${data.name}</h2>
            <p>${data.description}</p>
            <p>Deal Type: ${data.deal_type}</p>
            ${data.coupon_code ? `<p>Coupon Code: ${data.coupon_code}</p>` : ''}
            ${data.coupon_image ? `<img src="${data.coupon_image}" alt="Coupon Image">` : ''}
            ${data.coupon_barcode ? `<img src="${data.coupon_barcode}" alt="Coupon Barcode">` : ''}
            <h3>Photos</h3>
            ${data.photos ? data.photos.map(photo => `<img src="${photo}" alt="Location Photo">`).join('') : ''}
        `;
    } else {
        console.log('Location not found');
    }
}

// Call displayLocation with a specific location ID when needed, e.g., from a link click
// displayLocation('your-location-id');
