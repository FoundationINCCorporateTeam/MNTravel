// Initialize the map and set its view to a default location
var map = L.map('map').setView([51.505, -0.09], 13);

// Add a tile layer to the map (this is the background map you see)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to add a marker and popup to the map
function addMarker(lat, lon, message) {
    var marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(message).openPopup();
}

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
                addMarker(lat, lon, location);
            } else {
                alert("Location not found!");
            }
        })
        .catch(error => console.error('Error:', error));
}

// Add event listener to the search button
document.getElementById('search-button').addEventListener('click', searchLocation);
