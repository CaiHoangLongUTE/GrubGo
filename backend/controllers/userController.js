import User from './../models/userModel.js';
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ message: "UserID not found" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json(`Fetching user failed. Error: ${error.message}`);
    }
}

export const updateUserLocation = async (req, res) => {
    try {
        const { lat, lon } = req.body;

        // Validate userId from auth middleware
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized - User ID not found" });
        }

        // Validate request body
        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        const user = await User.findByIdAndUpdate(req.userId, {
            location: {
                type: "Point",
                coordinates: [lon, lat]
            }
        }, { new: true })

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Location updated successfully" });
    } catch (error) {
        console.error("Update location error:", error);
        return res.status(500).json({ message: `Updating location failed. Error: ${error.message}` });
    }
}