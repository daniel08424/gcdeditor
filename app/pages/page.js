'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const MapPage = () => {
  const [L, setLeaflet] = useState(null);
  const [gcpPoints, setGcpPoints] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const router = useRouter();

  const loadPoints = () => {
    const storedPoints = JSON.parse(localStorage.getItem('gcpPoints')) || [];
    const parsedPoints = storedPoints.map((point) => ({
      id: Date.now() + Math.random(),
      lat: parseFloat(point.x) || 0,
      lng: parseFloat(point.y) || 0,
      z: parseFloat(point.z),
      pixelX: parseFloat(point.pixelX),
      pixelY: parseFloat(point.pixelY),
      imageName: point.imageName,
      name: point.name,
      imagesCount: point.imagesCount || Math.floor(Math.random() * 4 + 1), 
    }));

    setGcpPoints(parsedPoints);

    if (parsedPoints.length > 0) {
      const bounds = parsedPoints.map((point) => [point.lat, point.lng]);
      setMapBounds(bounds);
    }

    import('leaflet').then((leaflet) => {
      setLeaflet(leaflet);
    });
  };

  useEffect(() => {
    loadPoints();

    const handlePopState = () => {
      window.location.reload();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const markerIcon = L
    ? L.icon({
        iconUrl: '/download__3_-removebg-preview.png',
        iconSize: [50, 50],
        iconAnchor: [25, 50],
      })
    : null;

    const handleMarkerDragEnd = (e, id) => {
      const updatedPoints = gcpPoints.map((point) => {
        if (point.id === id) {
          
          return {
            ...point,
            lat: e.target.getLatLng().lat,
            lng: e.target.getLatLng().lng,
          };
        }
        return point;
      });
    
      setGcpPoints(updatedPoints);
    
      
      const groupedImages = JSON.parse(localStorage.getItem('groupedImages')) || {};
      
      updatedPoints.forEach((point) => {
        if (groupedImages[point.name]) {
          groupedImages[point.name] = groupedImages[point.name].map((image) => {
            if (image.imageName === point.imageName) {
              return {
                ...image,
                x: point.lat,
                y: point.lng,
              };
            }
            return image;
          });
        }
      });
    
      localStorage.setItem('groupedImages', JSON.stringify(groupedImages));
    };
    
  const handleDownload = () => {
    const groupedImages = JSON.parse(localStorage.getItem('groupedImages')) || {};

    const textContent = Object.values(groupedImages)
      .flat()
      .map((point) =>
        `${point.x}\t${point.y}\t${point.z}\t${point.pixelX}\t${point.pixelY}\t${point.imageName}\t${point.name}`
      )
      .join('\n');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gcp_points.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueGCPs = Array.from(
    new Map(
      gcpPoints.map((point) => [point.name, point])
    ).values()
  );

  const handleRedirect = (gcpName) => {
    router.push(`/pages/api/image?gcpName=${encodeURIComponent(gcpName)}`);
  };

  return (
    <div className="page-container">
      <div className="left-pane">
        <h2>Ground Control Points</h2>
        <ul className="coordinate-list">
          {uniqueGCPs.map((point) => (
            <li key={point.id} className="coordinate-item">
              <span className="gcp-name">
                {point.name} (Image : {JSON.parse(localStorage.getItem('groupedImages'))?.[point.name]?.length || 0})
              </span>
              <button
                className="tag-button"
                onClick={() => handleRedirect(point.name)}
              >
                📷 Tag
              </button>
            </li>
          ))}
        </ul>
  
        <button className="download-button" onClick={handleDownload}>
          Download GCP Points
        </button>
      </div>
  
      <div className="right-pane">
        <MapContainer
          bounds={mapBounds}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {gcpPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={markerIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => handleMarkerDragEnd(e, point.id),
              }}
            >
              <Popup>
                <strong>{point.name}</strong>
                <br />
                Lat: {point.lat}, Lng: {point.lng}, Z: {point.z}
                <br />
                Pixel (X, Y): ({point.pixelX}, {point.pixelY})
                <br />
                Image: {point.imageName}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
  
      <style jsx>{`
        .page-container {
          display: flex;
          height: 100vh;
          font-family: Arial, sans-serif;
        }
  
        .left-pane {
          width: 30%;
          background: #f8f9fa;
          padding: 20px;
          overflow-y: auto;
          border-right: 1px solid #ddd;
          color: black;
          position: relative;
        }
  
        .left-pane h2 {
          font-size: 1.5rem;
          margin-bottom: 20px;
        }
  
        .coordinate-list {
          list-style: none;
          padding: 0;
          margin-bottom: 60px; /* Leave space for the button */
        }
  
        .coordinate-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          margin-bottom: 10px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
  
        .gcp-name {
          font-weight: bold;
          margin-right: auto;
        }
  
        .images-count {
          margin: 0 10px;
          padding: 5px 10px;
          font-size: 0.9rem;
          color: white;
          border-radius: 3px;
        }
  
        .images-count.green {
          background-color: #28a745;
        }
  
        .images-count.yellow {
          background-color: #ffc107;
        }
  
        .tag-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
        }
  
        .tag-button:hover {
          background: #0056b3;
        }
  
        .right-pane {
          width: 70%;
          position: relative;
        }
  
        .right-pane > :global(.leaflet-container) {
          height: 100%;
          width: 100%;
        }
  
        .download-button {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #28a745;
          color: white;
          padding: 10px 20px;
          font-size: 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
  
        .download-button:hover {
          background: #218838;
        }
      `}</style>
    </div>
  );
  
};

export default MapPage;
