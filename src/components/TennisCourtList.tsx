import TennisCourtCard from "./TennisCourtCard";

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

interface TennisCourtListProps {
  courtLocations: CourtLocation[];
}

const TennisCourtList: React.FC<TennisCourtListProps> = ({
  courtLocations,
}) => {
  return (
    <div className="space-y-4">
      {courtLocations.map((location) => (
        <TennisCourtCard key={location.locationId} location={location} />
      ))}
    </div>
  );
};

export default TennisCourtList;
