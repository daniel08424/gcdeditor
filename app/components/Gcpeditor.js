'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const GcpEditor = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [gcpPoints, setGcpPoints] = useState([]);
  const [crs, setCrs] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [gcpFile, setGcpFile] = useState(null);
  const router = useRouter();

  const handleCSVUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleCSVSubmit = () => {
    if (!csvFile) return alert("Please upload a CSV file first.");
  
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split("\n").filter((line) => line.trim() !== "");
  
      const points = lines.map((line) => {
        const parts = line.split(",");
        if (parts.length >= 7) {
          const [x, y, z, pixelX, pixelY, imageName, name] = parts;
          return {
            id: Date.now() + Math.random(),
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z),
            pixelX: parseFloat(pixelX),
            pixelY: parseFloat(pixelY),
            imageName: imageName.trim(),
            name: name.trim(),
          };
        }
        return null;
      }).filter((point) => point);
  
      console.log("GCP Coordinates:", points); 
  
      setGcpPoints(points);
      localStorage.setItem("gcpPoints", JSON.stringify(points));
      const groupedImages = points.reduce((acc, point) => {
        if (!acc[point.name]) {
          acc[point.name] = [];
        }
        acc[point.name].push(point);
        return acc;
      }, {});
  
      console.log("Grouped Images:", groupedImages);
      localStorage.setItem("groupedImages", JSON.stringify(groupedImages));
      router.push("/pages");
    };
  
    reader.readAsText(csvFile);
  };


  const handleGcpFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setGcpFile(file);
    }
  };

  const handleGcpFileSubmit = () => {
    if (!gcpFile) return alert("Please upload a GCP file first.");

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n').filter(line => line.trim() !== '');

      const crsLine = lines[0];
      if (crsLine.startsWith('+proj')) {
        setCrs(crsLine.trim());
        lines.shift(); 
      }

      const points = lines.map((line) => {
        const parts = line.split(/\s+/);
        if (parts.length >= 6) {
          const [x, y, z, pixelX, pixelY, imageName, name] = parts;
          return {
            id: Date.now() + Math.random(),
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z),
            pixelX: parseFloat(pixelX),
            pixelY: parseFloat(pixelY),
            imageName: imageName.trim(),
            name: name.trim(),
          };
        }
        return null;
      }).filter(point => point);

      setGcpPoints(points);
      localStorage.setItem('gcpPoints', JSON.stringify(points));

      const groupedImages = points.reduce((acc, point) => {
        if (!acc[point.name]) {
          acc[point.name] = [];
        }
        acc[point.name].push(point);
        return acc;
      }, {});

      localStorage.setItem('groupedImages', JSON.stringify(groupedImages));
      router.push('/pages');
    };
    reader.readAsText(gcpFile);
  };

  return (
    <div className="container">
      <h1 className='text-4xl font-bold'>GCP Editor</h1>
      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <TabList>
          <Tab>Create GCP File From CSV</Tab>
          <Tab>Upload and Process GCP File</Tab>
        </TabList>

        
        <TabPanel>
          <input type="file" accept=".csv" onChange={handleCSVUpload} />
          <button onClick={handleCSVSubmit} className="button">
            Upload and Process CSV
          </button>
        </TabPanel>

        
        <TabPanel>
          <input type="file" accept=".txt" onChange={handleGcpFileUpload} />
          <button onClick={handleGcpFileSubmit} className="button">
            Upload and Process GCP File
          </button>
        </TabPanel>
      </Tabs>

      {crs && (
        <div>
          <h2>Coordinate Reference System (CRS)</h2>
          <p>{crs}</p>
        </div>
      )}
      {gcpPoints.length > 0 && (
        <div>
          <h2>GCP Points</h2>
          <ul>
            {gcpPoints.map((point) => (
              <li key={point.id}>
                {point.name
                  ? `Name: ${point.name}`
                  : `X: ${point.x}, Y: ${point.y}, Z: ${point.z}, Pixel (X, Y): (${point.pixelX}, ${point.pixelY}), Image: ${point.imageName}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 80%;
          margin: 50px auto;
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
        .button {
          margin-top: 10px;
          padding: 10px 20px;
          background-color: black;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          text-align: center;
        }
        .button:hover {
          background-color: gray;
        }
        input {
          display: block;
          margin: 10px 0;
          font-size: 1rem;
          padding: 8px;
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        input:focus {
          border-color: black;
          outline: none;
        }
        .tabs {
          margin-top: 20px;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default GcpEditor;
