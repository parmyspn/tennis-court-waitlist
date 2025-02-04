import React from "react";

const TennisCourtCard = ({
  court,
  onJoinQueue,
}: {
  court: any;
  onJoinQueue: (id: number) => void;
}) => {
  return (
    <div className="border rounded-md p-4 shadow-md flex flex-col space-y-3">
      <h3 className="text-xl font-bold">{court.name}</h3>
      <h4 className="text-gray-600">{court.address}</h4>
      <p className="text-sm text-gray-500">
        Number of Courts: {court.courts.length}
      </p>
      <p className="text-sm text-gray-500">Wait Time: {15} mins</p>
      <button
        onClick={() => onJoinQueue(court.id)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Join Queue
      </button>
    </div>
  );
};

export default TennisCourtCard;
