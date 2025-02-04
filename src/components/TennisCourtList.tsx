import React from "react";
import TennisCourtCard from "./TennisCourtCard";

const TennisCourtList = ({
  courts,
  onJoinQueue,
}: {
  courts: any[];
  onJoinQueue: (id: number) => void;
}) => {
  return (
    <div className="space-y-4">
      {courts.map((court) => (
        <TennisCourtCard
          key={court.id}
          court={court}
          onJoinQueue={onJoinQueue}
        />
      ))}
    </div>
  );
};

export default TennisCourtList;
