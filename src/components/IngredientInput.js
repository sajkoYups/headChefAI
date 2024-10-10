import React, { useRef, useEffect } from "react";

function IngredientInput({
  ingredients,
  setIngredients,
  onSubmit,
  suggestions,
  onSuggestionClick,
}) {
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIngredients(ingredients);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ingredients, setIngredients]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="ingredient-input-container">
      <div className="input-wrapper">
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter ingredients (comma-separated)"
          />
          {suggestions.length > 0 && (
            <ul ref={suggestionsRef} className="suggestions">
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => onSuggestionClick(suggestion)}>
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={onSubmit}>Fetch Recipes</button>
      </div>
    </div>
  );
}

export default IngredientInput;
