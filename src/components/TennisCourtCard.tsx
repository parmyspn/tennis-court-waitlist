import React from "react";

interface Court {
  courtId: string;
  queue: { joinTime: string; phoneNumber: string; playerId: string }[];
  startTime: string;
}

interface CourtLocation {
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
  courts: Court[];
  address: string;
}

interface TennisCourtCardProps {
  location: CourtLocation;
}

const TennisCourtCard: React.FC<TennisCourtCardProps> = ({ location }) => {
  function onJoinQueue(id: string): void {
    alert(`Joining queue for court ${id}`);
  }

  return (
    <div className="border rounded-md p-4 shadow-md flex flex-col items-center space-y-4">
      <h2 className="text-xl font-bold">{location.name}</h2>
      <p className="text-gray-600">{location.address}</p>
      <p className="text-sm text-gray-500">
        Number of Courts: {location.courts.length}
      </p>
      <button
        onClick={() => onJoinQueue(location.locationId)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Join Queue
      </button>

      {/* Show list of courts 
      <ul className="list-disc list-inside text-gray-500">
        {location.courts.map((court) => (
          <li key={court.courtId}>Court {court.courtId}</li>
        ))}
      </ul>
      */}
    </div>
  );
};

export default TennisCourtCard;
