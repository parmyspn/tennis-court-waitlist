import dynamic from "next/dynamic";

const MapWithQueue = dynamic(() => import("./MapWithQueue"), {
  ssr: false,
});

export default MapWithQueue;
