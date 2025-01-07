'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Papa from 'papaparse';

const GcpEditor = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [gcpPoints, setGcpPoints] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [textFile, setTextFile] = useState(null);
  const router = useRouter(); 

  const handleCSVUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleTextFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setTextFile(file);
    }
  };

  const handleCSVSubmit = () => {
    if (!csvFile) return alert("Please upload a CSV file first.");

    Papa.parse(csvFile, {
      complete: (result) => {
        const points = result.data
          .map((row) => ({
            id: Date.now() + Math.random(),
            lat: parseFloat(row[1]),
            lng: parseFloat(row[2]),
            name: row[0],
          }))
          .filter((p) => !isNaN(p.lat) && !isNaN(p.lng));

        setGcpPoints(points);
        localStorage.setItem('gcpPoints', JSON.stringify(points));
        router.push('/pages');
      },
      header: false,
    });
  };

  const handleTextFileSubmit = () => {
    if (!textFile) return alert("Please upload a GCP text file first.");

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n');
      const points = lines.map((line) => {
        const [name, lat, lng] = line.split(',');
        return {
          id: Date.now() + Math.random(),
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          name: name.trim(),
        };
      }).filter((p) => !isNaN(p.lat) && !isNaN(p.lng));

      setGcpPoints(points);
      localStorage.setItem('gcpPoints', JSON.stringify(points));
      router.push('/pages');
    };
    reader.readAsText(textFile);
  };

  return (
    <div className="container">
      <h1 className='text-4xl font-bold'>GCP Editor</h1>
      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <TabList>
          <Tab>Create GCP File From CSV</Tab>
          <Tab>Resume Work on GCP File</Tab>
        </TabList>
        <TabPanel>
          <input type="file" accept=".csv" onChange={handleCSVUpload} />
          <button onClick={handleCSVSubmit} className="button">
            Upload and Process CSV
          </button>
        </TabPanel>
        {gcpPoints.length > 0 && (
  <div>
    <h2>GCP Points</h2>
    <ul>
      {gcpPoints.map((point) => (
        <li key={point.id}>
          Name: {point.name}, Lat: {point.lat}, Lng: {point.lng}
        </li>
      ))}
    </ul>
  </div>
)}
        <TabPanel>
          <input type="file" accept=".txt" onChange={handleTextFileUpload} />
          <button onClick={handleTextFileSubmit} className="button">
            Upload and Resume Work
          </button>
        </TabPanel>

      </Tabs>
      <style jsx>{`
        .container {
          max-width: 80%;
          margin: 50px auto; /* Center align horizontally */
          padding: 20px;
          background-color: white;
          color: black;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          font-family: Arial, Helvetica, sans-serif; /* Clean and standard font */
          line-height: 1.6; /* Improve readability */
        }
        h1 {
          text-align: center;
          font-size: 2rem; /* Clear and prominent heading size */
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
          font-size: 1rem; /* Button text size */
          text-align: center;
        }
        .button:hover {
          background-color: gray;
        }
        input {
          display: block;
          margin: 10px 0;
          font-size: 1rem; /* Input text size */
          padding: 8px;
          width: 100%; /* Make input boxes consistent */
          box-sizing: border-box; /* Include padding in width calculation */
          border: 1px solid #ccc; /* Subtle border for inputs */
          border-radius: 4px; /* Rounded corners */
        }
        input:focus {
          border-color: black; /* Highlight input on focus */
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
