'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import react-leaflet components to prevent SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then(mod => mod.useMap), { ssr: false });

const MapPage = () => {
  const [L, setLeaflet] = useState(null); // Hold Leaflet library
  const [gcpPoints, setGcpPoints] = useState([]);
  const [editingPoint, setEditingPoint] = useState(null);
  const [mapCenter, setMapCenter] = useState([25, -80]); // Default center
  const [mapZoom, setMapZoom] = useState(5); // Default zoom

  // Get GCP points from localStorage when the page loads
  useEffect(() => {
    const storedPoints = JSON.parse(localStorage.getItem('gcpPoints')) || [];
    setGcpPoints(storedPoints);

    if (storedPoints.length > 0) {
      // Center map on the first point found
      setMapCenter([storedPoints[0].lat, storedPoints[0].lng]);
      setMapZoom(10);
    }

    import('leaflet').then((leaflet) => {
      setLeaflet(leaflet);
    });
  }, []);

  // Custom marker icon with the background removed
  const markerIcon = L
    ? L.icon({
        iconUrl: '/download__3_-removebg-preview.png', // Ensure the image path is correct and points to the public folder
        iconSize: [50, 50], // Adjust the size as needed
        iconAnchor: [25, 50], // Anchor at the bottom center of the marker
      })
    : null;

  const editGcpDetails = (index, key, value) => {
    const updatedPoints = [...gcpPoints];
    updatedPoints[index] = { ...updatedPoints[index], [key]: value };
    setGcpPoints(updatedPoints);
  };

  const updateMarkerPosition = (index, newLat, newLng) => {
    const updatedPoints = [...gcpPoints];
    updatedPoints[index] = { ...updatedPoints[index], lat: newLat, lng: newLng };
    setGcpPoints(updatedPoints);

    // Auto-center map when a marker is moved
    setMapCenter([newLat, newLng]);
    setMapZoom(12);
  };

  const exportGcpPoints = async () => {
    try {
      const response = await fetch('/pages/api/gcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gcpPoints }),
      });

      if (response.ok) {
        // Read response as a blob (file content)
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const match = contentDisposition?.match(/filename="(.+)"/);
        const fileName = match ? match[1] : 'gcp_points.txt';

        // Create a link element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error exporting GCP points.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('An error occurred while exporting.');
    }
  };

  // Component to update the map center and zoom
  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (map && typeof map.setView === 'function') {
        map.setView(mapCenter, mapZoom);
      }
    }, [map]); // Only depend on 'map' as it's the main reference needed
    return null;
  };
  

  return (
    <div className="container">
      <h1>Map with GCP Coordinates</h1>

      <div className="map-container" style={{ marginTop: '20px' }}>
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '400px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapUpdater />

          {gcpPoints.map((point, idx) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              draggable={true}
              icon={markerIcon} // Use the custom marker icon here
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  updateMarkerPosition(idx, lat, lng);
                },
                click: () => setEditingPoint(idx), // Open editor on marker click
              }}
            >
              {/* Display Name + Coordinates in Popup */}
              <Popup>
                <strong>{point.name}</strong>
                <br />
                Lat: {point.lat.toFixed(6)}
                <br />
                Lng: {point.lng.toFixed(6)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>


      {/* GCP Editing Panel */}
      {editingPoint !== null && (
        <div className="editor-panel">
          <h3>Edit GCP Point</h3>
          <label>Name:</label>
          <input
            type="text"
            value={gcpPoints[editingPoint].name}
            onChange={(e) => editGcpDetails(editingPoint, 'name', e.target.value)}
          />
          <label>Latitude:</label>
          <input
            type="number"
            value={gcpPoints[editingPoint].lat}
            onChange={(e) => editGcpDetails(editingPoint, 'lat', parseFloat(e.target.value))}
          />
          <label>Longitude:</label>
          <input
            type="number"
            value={gcpPoints[editingPoint].lng}
            onChange={(e) => editGcpDetails(editingPoint, 'lng', parseFloat(e.target.value))}
          />
          <button onClick={() => setEditingPoint(null)}>Close</button>
        </div>
      )}

      <div className="coordinates-section" style={{ marginTop: '20px' }}>
        <h2>Coordinates List</h2>
        <ul>
          {gcpPoints.map((point, idx) => (
            <li key={idx}>
              <strong>{`Point ${idx + 1}`} : </strong> 
              Lat: {point.lat.toFixed(6)}, Lng: {point.lng.toFixed(6)}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={exportGcpPoints} style={{ marginTop: '10px', padding: '10px', cursor: 'pointer' }}>
        Export to TXT
      </button>

      <style jsx>{`
  .container {
    max-width: 90%;
    margin: 30px auto;
    padding: 20px;
    background-color: white;
    color: black;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.6;
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 20px;
    font-weight: bold;
  }

  .map-container {
    margin-top: 20px;
    border-radius: 8px;
    overflow: hidden;
  }

  .coordinates-section {
    margin-top: 20px;
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .coordinates-section h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    font-weight: bold;
  }

  .coordinates-section ul {
    list-style-type: none;
    padding: 0;
  }

  .coordinates-section li {
    margin-bottom: 8px;
  }

  .editor-panel {
    margin-top: 10px;
    background-color: #f9f9f9;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .editor-panel h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    font-weight: bold;
  }

  .editor-panel label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
  }

  .editor-panel input {
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .editor-panel input[type="number"] {
    width: 48%;
    display: inline-block;
    margin-right: 4%;
  }

  .editor-panel button {
    padding: 10px;
    background-color: black;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  .editor-panel button:hover {
    background-color: gray;
  }

  button {
    padding: 10px 20px;
    background-color: black;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 20px;
  }

  button:hover {
    background-color: gray;
  }
`}</style>

    </div>

    
  );
};

export default MapPage;

