import React from "react";
import MapWithQueue from "../components/MapWithQueue";
import "leaflet/dist/leaflet.css";

const SearchTennisCourt = () => {
  return (
    <div className="flex flex-col justify-center w-full">
      <div>
        <h2 className="text-xl font-bold mb-4">Vancouver Tennis Court Queue</h2>
      </div>

      <div>
        <MapWithQueue />
      </div>
    </div>
  );
};

export default SearchTennisCourt;
