import React, { useState } from 'react';

const ImageGallery = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    {
      emoji: '⚖️',
      title: 'Legal Consultation',
      description: 'Professional legal services'
    },
    {
      emoji: '🏛️',
      title: 'Court Representation',
      description: 'Expert courtroom advocacy'
    },
    {
      emoji: '📋',
      title: 'Document Review',
      description: 'Thorough legal documentation'
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="image-gallery">
      <div className="gallery-container">
        <div className="gallery-main">
          <div className="gallery-image">
            <span className="gallery-emoji">{images[currentImageIndex].emoji}</span>
          </div>
          <div className="gallery-info">
            <h3 className="gallery-title">{images[currentImageIndex].title}</h3>
            <p className="gallery-description">{images[currentImageIndex].description}</p>
          </div>
        </div>
        
        <div className="gallery-controls">
          <button 
            onClick={prevImage}
            className="gallery-btn gallery-btn-prev"
            aria-label="Previous image"
          >
            ‹
          </button>
          <div className="gallery-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`gallery-indicator ${index === currentImageIndex ? 'active' : ''}`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
          <button 
            onClick={nextImage}
            className="gallery-btn gallery-btn-next"
            aria-label="Next image"
          >
            ›
          </button>
        </div>
      </div>

      <div className="gallery-thumbnails">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
          >
            <span className="thumbnail-emoji">{image.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
