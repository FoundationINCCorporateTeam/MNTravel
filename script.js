// Initialize the map and set its view to a default location
var map = L.map('map').setView([51.505, -0.09], 13);

// Add a tile layer to the map (this is the background map you see)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to add a marker and popup to the map
function addMarker(lat, lon, name, description) {
    var marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`<b>${name}</b><br>${description}`).openPopup();
}

// Function to fetch POIs from Overpass API
function fetchPOIs() {
    var overpassUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];node[shop](around:5000,51.505,-0.09);out;';
    fetch(overpassUrl)
        .then(response => response.json())
        .then(data => {
            data.elements.forEach(poi => {
                if (poi.tags && poi.tags.name) {
                    addMarker(poi.lat, poi.lon, poi.tags.name, poi.tags.shop);
                }
            });
        })
        .catch(error => console.error('Error fetching POIs:', error));
}

// Fetch POIs when the map is initialized
fetchPOIs();

// Function to handle search
function searchLocation() {
    var location = document.getElementById('location-input').value;
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${location}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                var lat = data[0].lat;
                var lon = data[0].lon;
                map.setView([lat, lon], 13);
                addMarker(lat, lon, location, 'Searched location');
                fetchPOIs(); // Fetch POIs around the searched location
            } else {
                alert("Location not found!");
            }
        })
        .catch(error => console.error('Error:', error));
}

// Add event listener to the search button
document.getElementById('search-button').addEventListener('click', searchLocation);

// Function to check URL and zoom to the location if specified
function checkURL() {
    const url = new URL(window.location);
    const locationQuery = url.searchParams.get('search');
    if (locationQuery) {
        document.getElementById('location-input').value = locationQuery;
        searchLocation();
    }
}

// Check URL on load
checkURL();
