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
function searchLocation(query) {
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                var bounds = new L.LatLngBounds();
                data.forEach(item => {
                    var lat = item.lat;
                    var lon = item.lon;
                    var displayName = item.display_name;
                    addMarker(lat, lon, displayName);
                    bounds.extend([lat, lon]);
                });
                map.fitBounds(bounds);
            } else {
                alert("Location not found!");
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to handle autocomplete suggestions
function autocompleteSearch() {
    var location = document.getElementById('location-input').value;
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${location}`;

    fetch(url)
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
                        window.location.href = `${window.location.origin}/?search=map_query_search=mn-travel-database028574395#location=${item.lat},${item.lon}`;
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
    window.location.href = `${window.location.origin}/?search=map_query_search=mn-travel-database028574395#location=${location}`;
});

// Add event listener to the input field for autocomplete
document.getElementById('location-input').addEventListener('input', autocompleteSearch);

// Close the dropdown if the user clicks outside of it
document.addEventListener('click', function(event) {
    var dropdown = document.getElementById('dropdown');
    if (!dropdown.contains(event.target) && event.target !== document.getElementById('location-input')) {
        dropdown.style.display = 'none';
    }
});
