mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

// Initialize the map and set its view to a default location
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-0.09, 51.505],
    zoom: 13
});

// Sample data for places (using Mapbox POI)
var places = [
    { id: 'store1', name: "Store 1", coordinates: [-0.09, 51.505], description: "A great store." },
    { id: 'store2', name: "Store 2", coordinates: [-0.1, 51.51], description: "Another great store." },
    { id: 'store3', name: "Store 3", coordinates: [-0.08, 51.515], description: "Yet another great store." }
];

// Function to add a marker and popup to the map
function addMarker(place) {
    var marker = new mapboxgl.Marker()
        .setLngLat(place.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<b>${place.name}</b><br>${place.description}`))
        .addTo(map);

    marker.getElement().addEventListener('click', () => {
        map.flyTo({ center: place.coordinates, zoom: 15 });
        document.getElementById('location-input').value = place.name;
        updateURL(place.id);
    });
}

// Function to update the URL with the selected location
function updateURL(locationId) {
    const url = new URL(window.location);
    url.searchParams.set('location', locationId);
    window.history.pushState({}, '', url);
}

// Add markers to the map for each place
places.forEach(addMarker);

// Function to handle search
function searchLocation() {
    var location = document.getElementById('location-input').value;
    var place = places.find(p => p.name.toLowerCase() === location.toLowerCase());

    if (place) {
        map.flyTo({ center: place.coordinates, zoom: 15 });
        updateURL(place.id);
    } else {
        alert("Location not found!");
    }
}

// Add event listener to the search button
document.getElementById('search-button').addEventListener('click', searchLocation);

// Function to check URL and zoom to the location if specified
function checkURL() {
    const url = new URL(window.location);
    const locationId = url.searchParams.get('location');
    if (locationId) {
        const place = places.find(p => p.id === locationId);
        if (place) {
            map.flyTo({ center: place.coordinates, zoom: 15 });
            document.getElementById('location-input').value = place.name;
        }
    }
}

// Check URL on load
checkURL();
