import React, { useState, useRef, useEffect } from "react";
import "./IngredientInput.css";

const commonIngredients = [
  "chicken",
  "beef",
  "pork",
  "fish",
  "tomato",
  "onion",
  "garlic",
  "potato",
  "carrot",
  "broccoli",
  "spinach",
  "rice",
  "pasta",
  "cheese",
  "egg",
  "milk",
  "butter",
  "olive oil",
  "salt",
  "pepper",
  "flour",
  "sugar",
  "apple",
  "banana",
  "orange",
  "lemon",
  "lime",
  "avocado",
  "cucumber",
  "lettuce",
  "bell pepper",
  "mushroom",
  "zucchini",
  "eggplant",
  "corn",
  "peas",
  "beans",
  "lentils",
  "chickpeas",
  "quinoa",
  "oats",
  "bread",
  "yogurt",
  "cream",
  "sour cream",
  "mayonnaise",
  "mustard",
  "ketchup",
  "soy sauce",
  "vinegar",
  "honey",
  "maple syrup",
  "chocolate",
  "vanilla",
  "cinnamon",
  "cumin",
  "paprika",
  "oregano",
  "basil",
  "thyme",
  "rosemary",
  "ginger",
  "turmeric",
  "coconut milk",
  "almond milk",
  "tofu",
  "shrimp",
  "salmon",
  "tuna",
  "bacon",
  "ham",
  "sausage",
];

function IngredientInput({ ingredients, setIngredients, onSubmit }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setIngredients(value);
    updateSuggestions(value);
  };

  const updateSuggestions = (value) => {
    if (value.length > 0) {
      const lastWord = value.split(",").pop().trim().toLowerCase();
      const filteredSuggestions = commonIngredients.filter((ingredient) =>
        ingredient.toLowerCase().startsWith(lastWord)
      );
      setSuggestions(filteredSuggestions);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const ingredientList = ingredients.split(",").map((i) => i.trim());
    ingredientList.pop();
    ingredientList.push(suggestion);
    const newIngredients = ingredientList.join(", ");
    setIngredients(newIngredients);
    setSuggestions([]);
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === "Enter" && suggestions.length === 0) {
      onSubmit();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="ingredient-input">
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={ingredients}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter ingredients (separated by commas)"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions" ref={suggestionsRef}>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={index === selectedIndex ? "selected" : ""}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button onClick={onSubmit}>Search Recipes</button>
    </div>
  );
}

export default IngredientInput;
