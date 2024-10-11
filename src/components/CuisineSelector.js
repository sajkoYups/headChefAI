import React, { useState, useEffect } from "react";
import "./CuisineSelector.css";

const cuisines = [
  "Italian",
  "French",
  "Chinese",
  "Japanese",
  "Mexican",
  "Indian",
  "Thai",
  "Spanish",
  "Greek",
  "Lebanese",
  "Turkish",
  "Moroccan",
  "Korean",
  "Vietnamese",
  "Peruvian",
  "Ethiopian",
  "Brazilian",
  "Caribbean",
  "German",
  "Argentinian",
  "Russian",
  "Iranian (Persian)",
];

function CuisineSelector({ onCuisineChange }) {
  const [selectedCuisines, setSelectedCuisines] = useState([]);

  const handleCuisineChange = (cuisine) => {
    setSelectedCuisines((prevSelected) => {
      if (prevSelected.includes(cuisine)) {
        return prevSelected.filter((c) => c !== cuisine);
      } else {
        return [...prevSelected, cuisine];
      }
    });
  };

  // Use useEffect to call onCuisineChange when selectedCuisines changes
  useEffect(() => {
    onCuisineChange(selectedCuisines);
  }, [selectedCuisines, onCuisineChange]);

  return (
    <div className="cuisine-selector">
      <h3>Select Cuisines</h3>
      <div className="cuisine-options">
        {cuisines.map((cuisine) => (
          <label key={cuisine} className="cuisine-option">
            <input
              type="checkbox"
              name="cuisine"
              value={cuisine}
              checked={selectedCuisines.includes(cuisine)}
              onChange={() => handleCuisineChange(cuisine)}
            />
            <span className="cuisine-name">{cuisine}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default CuisineSelector;
