import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import TennisCourtList from "../TennisCourtList";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

// Haversine Formula for Distance Calculation
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const MapWithQueue = () => {
  const [courts, setCourts] = useState([]);
  const [filteredCourts, setFilteredCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(5);
  const [userCoords, setUserCoords] = useState({ lat: null, lon: null });

  useEffect(() => {
    async function fetchCourts() {
      try {
        const response = await fetch(
          "https://a4wihgjg24.execute-api.us-west-1.amazonaws.com/courts"
        );
        const rawData = await response.json();

        const cleanedData = rawData.map((court) => ({
          locationId: court.locationId.S,
          name: court.name.S,
          latitude: parseFloat(court.latitude.N),
          longitude: parseFloat(court.longitude.N),
          address: court.address?.S || "No address available",
          courts: court.courts?.L || [],
        }));

        setCourts(cleanedData);
        setFilteredCourts(cleanedData);
      } catch (error) {
        console.error("Failed to fetch courts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourts();
  }, []);

  const fetchCoordinates = async (address) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setUserCoords({ lat, lon: lng });
        filterByDistance(lat, lng);
      } else {
        alert("Location not found. Try another name.");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  const filterByDistance = (lat, lon) => {
    const filtered = courts.filter((court) => {
      const distance = getDistance(lat, lon, court.latitude, court.longitude);
      return distance <= radius;
    });
    setFilteredCourts(filtered);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
      {/* Left Side - Search Box & Court List */}
      <div className="overflow-y-auto p-4 bg-white">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by neighborhood..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => fetchCoordinates(location)}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md w-full"
        >
          Search
        </button>

        {/* Radius Dropdown */}
        <label className="block mt-4">Search Radius (km):</label>
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full p-2 border rounded-md shadow-md"
        >
          <option value="2">2 km</option>
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="20">20 km</option>
        </select>

        {/* Courts List */}
        <TennisCourtList courts={filteredCourts} />
      </div>

      {/* Right Side - Map */}
      <div className="relative">
        <MapContainer
          center={[49.2827, -123.1207]}
          zoom={13}
          scrollWheelZoom={true}
          className="absolute inset-0 h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredCourts.map((court) => (
            <Marker
              key={court.locationId}
              position={[court.latitude, court.longitude]}
            >
              <Popup>
                <strong>{court.name}</strong>
                <p>{court.address}</p>
                <p>Wait Time: {30} mins</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapWithQueue;
