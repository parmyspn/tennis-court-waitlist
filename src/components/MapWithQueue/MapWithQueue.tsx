import React, { useState, useEffect } from "react";
import TennisCourtList from "../TennisCourtList";
import "leaflet/dist/leaflet.css";

interface QueueItem {
  joinTime: string;
  phoneNumber: string;
  playerId: string;
}

interface Court {
  courtId: string;
  queue: QueueItem[];
  startTime: string;
}

interface CourtLocation {
  locationId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  courts: Court[];
}

// Haversine Formula for Distance Calculation
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
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

const MapWithQueue: React.FC = () => {
  const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);
  const [reactLeaflet, setReactLeaflet] = useState<
    typeof import("react-leaflet") | null
  >(null);
  const [courtLocations, setCourtLocations] = useState<CourtLocation[]>([]);
  const [filteredCourtLocations, setFilteredCourtLocations] = useState<
    CourtLocation[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [location, setLocation] = useState<string>("");
  const [radius, setRadius] = useState<number>(5);

  useEffect(() => {
    // Only run in the browser
    if (typeof window !== "undefined") {
      // Dynamically import everything related to Leaflet/React-Leaflet
      Promise.all([import("leaflet"), import("react-leaflet")])
        .then(([L, RL]) => {
          setLeaflet(L);
          setReactLeaflet(RL);
        })
        .catch((error) => {
          console.error("Error loading leaflet/react-leaflet", error);
        });
    }
    async function fetchCourtLocations() {
      try {
        const response = await fetch(
          "https://a4wihgjg24.execute-api.us-west-1.amazonaws.com/courts"
        );
        const rawData = await response.json();

        // Transform DynamoDB format
        const cleanedData: CourtLocation[] = rawData.map(
          (location: {
            locationId: { S: string };
            name: { S: string };
            address?: { S: string };
            latitude: { N: string };
            longitude: { N: string };
            courts?: { L: { M: { courtId: { S: string } } }[] };
          }) => ({
            locationId: location.locationId.S,
            name: location.name.S,
            address: location.address?.S || "No address available",
            latitude: parseFloat(location.latitude.N),
            longitude: parseFloat(location.longitude.N),
            courts:
              location.courts?.L.map((court) => ({
                courtId: court.M.courtId.S,
              })) || [],
          })
        );

        setCourtLocations(cleanedData);
        setFilteredCourtLocations(cleanedData);
      } catch (error) {
        console.error("Failed to fetch court locations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourtLocations();
  }, []);

  if (!leaflet || !reactLeaflet) {
    return <div>Loading map...</div>;
  }

  // Now you can safely destructure from reactLeaflet
  const { MapContainer, TileLayer, Marker, Popup } = reactLeaflet;

  const L = leaflet;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/marker-icon-2x.png",
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
  });

  // Fetch lat/lon for a given address using Google Maps API
  const fetchCoordinates = async (address: string) => {
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
        filterByDistance(lat, lng);
      } else {
        alert("Location not found. Try another name.");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  // Filter courts by distance from user
  const filterByDistance = (lat: number, lon: number) => {
    const filtered = courtLocations.filter((court) => {
      const distance = getDistance(lat, lon, court.latitude, court.longitude);
      return distance <= radius;
    });
    setFilteredCourtLocations(filtered);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
      {/* Left Side - Search Box & Court List */}
      <div className="overflow-y-auto p-2 bg-white">
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
        {loading ? (
          <p className="text-center text-gray-500">Loading courts...</p>
        ) : (
          <TennisCourtList courtLocations={filteredCourtLocations} />
        )}
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
          {filteredCourtLocations.map((court) => (
            <Marker
              key={court.locationId}
              position={[court.latitude, court.longitude]}
            >
              <Popup>
                <strong>{court.name}</strong>
                <p>{court.address}</p>
                <p>{court.courts.length} courts available</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapWithQueue;
