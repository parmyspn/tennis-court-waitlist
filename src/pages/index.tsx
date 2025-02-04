import React from "react";
import MapWithQueue from "../components/MapWithQueue/MapWithQueue";
import "leaflet/dist/leaflet.css";

const SearchTennisCourt = () => {
  return (
    <div className="flex flex-col justify-center w-full">
      <div>
        <h2 className="text-3xl font-bold text-gray-500 tracking-wide ml-4">
          Vancouver Tennis Courts
        </h2>
      </div>

      <div>
        <MapWithQueue />
      </div>
    </div>
  );
};

export default SearchTennisCourt;
