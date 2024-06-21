// Replace these with your Supabase URL and ANON key
const SUPABASE_URL = 'https://cjebwwrjllxuszyjmxwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqZWJ3d3JqbGx4dXN6eWpteHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg5MzY3NzUsImV4cCI6MjAzNDUxMjc3NX0.VeqDFVJaN-LtD8CpboGt2wDs_OQHFjWOqZHQ_2QsSUQ';
// Replace these with your Supabase project URL and ANON key
const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';

// Function to create and return a SupabaseClient instance
function createClient(url, key) {
    return new SupabaseClient(url, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        },
        autoRefreshToken: true,
        persistSession: true,
    });
}

// Simplified SupabaseClient definition for database interactions
class SupabaseClient {
    constructor(url, options) {
        this.url = url;
        this.headers = options.headers || {};
        this.autoRefreshToken = options.autoRefreshToken || false;
        this.persistSession = options.persistSession || false;
    }

    from(table) {
        return {
            select: async (columns) => {
                // Simplified example: Fetch data from 'table' with 'columns'
                const response = await fetch(`${this.url}/${table}`, {
                    method: 'GET',
                    headers: this.headers,
                });
                const data = await response.json();
                return { data };
            },

            insert: async (data) => {
                // Simplified example: Insert 'data' into 'table'
                const response = await fetch(`${this.url}/${table}`, {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                return result;
            },
            
            // Other methods like update, delete, etc. can be defined similarly
        };
    }
}

// Function to store location data in Supabase
async function storeLocation(data) {
    // Replace with your Supabase client instance
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    try {
        // Example: Insert data into 'locations' table
        const { data: locationData, error } = await supabase
            .from('locations')
            .insert([
                {
                    name: data.name,
                    lat: data.lat,
                    lon: data.lon,
                    description: data.description,
                    deal_type: data.dealType,
                    coupon_code: data.couponCode,
                    // Remove coupon_image and coupon_barcode fields
                }
            ]);

        if (error) {
            throw error;
        }

        return locationData;
    } catch (error) {
        throw error;
    }
}

// Event listener for form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('add-location-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const name = formData.get('name');
        const lat = parseFloat(formData.get('lat'));
        const lon = parseFloat(formData.get('lon'));
        const description = formData.get('description');
        const dealType = formData.get('deal_type');
        let couponCode = null;

        if (dealType === 'coupon_code') {
            couponCode = formData.get('coupon_code');
        }

        try {
            // Call function to store location data in Supabase
            const locationData = {
                name,
                lat,
                lon,
                description,
                dealType,
                couponCode,
            };

            const result = await storeLocation(locationData);
            console.log('Location stored successfully:', result);
            // Optionally, redirect or show a success message
        } catch (error) {
            console.error('Error storing location:', error.message);
            // Handle error, show error message, etc.
        }
    });
});
