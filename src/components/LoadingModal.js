import React, { useState, useEffect } from "react";
import "./LoadingModal.css";

const LoadingModal = ({
  isLoading,
  onCancel,
  dallelogo,
  currentStory,
  setRandomStory,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prevProgress) =>
          prevProgress >= 100 ? 100 : prevProgress + 1
        );
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onCancel}>
          ×
        </button>
        <p className="loading-message">Please be patient</p>
        <div className="logo-container">
          <img
            src={dallelogo}
            alt="Loading"
            className="loading-logo"
            style={{ filter: `grayscale(${100 - progress}%)` }}
          />
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <p className="loading-message">
          I am carefully crafting recipes just for you.
          <br />
          These ingredients will make a wonderful meal!
        </p>
        <div className="food-story-container">
          <p className="food-story">{currentStory}</p>
          <button onClick={setRandomStory} className="next-story-button">
            Next Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
