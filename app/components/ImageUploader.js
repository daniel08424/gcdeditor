'use client';
import { useState, useEffect } from 'react';

const ImageUploader = () => {
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [gcpName, setGcpName] = useState('Unknown');
  const imagesPerPage = 10;

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const gcpNameParam = queryParams.get('gcpName');
    setGcpName(gcpNameParam || 'Unknown');
  }, []);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const gcpData = JSON.parse(localStorage.getItem('groupedImages')) || {};

    const imageUrls = files.map((file) => {
      const imageName = file.name;
      let headerColor = 'blue';

      if (gcpName && gcpData[gcpName]?.some((gcp) => gcp.imageName === imageName)) {
        headerColor = 'green';
      }

      return {
        url: URL.createObjectURL(file),
        name: imageName,
        headerColor,
        selected: headerColor === 'green',
      };
    });

    setImages((prevImages) => {
      const allImages = [...prevImages, ...imageUrls];
      return allImages.sort((a, b) => (a.headerColor === 'green' ? -1 : 1));
    });
  };

  const handleImageClick = (index) => {
    setImages((prevImages) =>
      prevImages.map((image, i) =>
        i === index
          ? {
              ...image,
              headerColor: image.headerColor === 'green' ? 'blue' : 'green',
              selected: !image.selected,
            }
          : image
      )
    );
  };

  const handleSaveChanges = () => {
    const existingData = JSON.parse(localStorage.getItem('groupedImages')) || {};
    const existingGcpData = existingData[gcpName] || [];

    const defaultCoordinates = existingGcpData[0] || {};
  
    const updatedGcpData = images
      .filter((image) => image.selected)
      .map((image) => {
        return {
          id: Date.now() + Math.random(),
          x: defaultCoordinates.x || null,
          y: defaultCoordinates.y || null,
          z: defaultCoordinates.z || 0,
          pixelX: defaultCoordinates.pixelX || null,
          pixelY: defaultCoordinates.pixelY || null,
          imageName: image.name,
          name: gcpName,
        };
      });

    existingData[gcpName] = updatedGcpData;
  
    localStorage.setItem('groupedImages', JSON.stringify(existingData));
    alert('Changes saved successfully!');

    window.history.back();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };
  
  
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);

  const totalPages = Math.ceil(images.length / imagesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container">
      <h1 className="text-4xl font-bold">Image Uploader for GCP: {gcpName}</h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="upload-input"
      />

        {images.length > 0 && (
                <button className="save-button" onClick={handleSaveChanges}>
                Save Changes
                </button>
            )}

      {images.length > 0 && (
        <div>
          <div className="image-gallery">
            <h2>Page {currentPage}</h2>
            <div className="image-grid">
              {currentImages.map((image, index) => (
                <div
                  key={index}
                  className="image-item"
                  onClick={() => handleImageClick(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="image-header"
                    style={{ backgroundColor: image.headerColor }}
                  >
                    <span>{image.name}</span>
                  </div>
                  <img src={image.url} alt={image.name} />
                </div>
              ))}
            </div>

            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`page-button ${
                    currentPage === i + 1 ? 'active' : ''
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .container {
          padding: 20px;
          font-family: Arial, sans-serif;
          max-width: 2700px;
          margin: 0 auto;
        }

        h1 {
          text-align: center;
          margin-bottom: 20px;
          color: black;
        }

        .upload-input {
          width: 80%;
          display: block;
          margin: 0 auto 20px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        .image-gallery {
          margin-top: 20px;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .image-item {
          position: relative;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.1);
        }

        .image-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          padding: 10px;
          font-size: 1.2rem;
        }

        .image-item img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 0 0 8px 8px;
        }

        .pagination {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        .page-button {
          margin: 0 5px;
          padding: 12px 18px;
          border: 1px solid #007bff;
          background-color: white;
          color: #007bff;
          border-radius: 5px;
          cursor: pointer;
        }

        .page-button.active {
          background-color: #007bff;
          color: white;
        }

        .page-button:hover {
          background-color: #0056b3;
          color: white;
        }

        .save-button {
          display: block;
          margin: 20px auto;
          padding: 12px 18px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
        }

        .save-button:hover {
          background-color: #218838;
        }
      `}</style>
    </div>
  );
};

export default ImageUploader;
