import axios from 'axios';

export const reverseGeocode = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: "Latitude and Longitude are required" });
        }

        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

        // OpenStreetMap requires a User-Agent header
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'GrubGo-App/1.0'
            }
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error("Reverse Geocoding Error:", error.message);
        res.status(500).json({ success: false, message: "Error fetching address", error: error.message });
    }
};
