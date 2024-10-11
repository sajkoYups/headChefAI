import React from "react";
import "./RecipeList.css"; // We'll create this file for styling

function RecipeList({ recipes, addToFavorites }) {
  return (
    <div className="recipe-list">
      <h2>Recipes</h2>
      <div className="recipe-grid">
        {recipes.map((recipe, index) => (
          <div key={index} className="recipe-card">
            <h3>{recipe.name}</h3>
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.name}
                className="recipe-image"
              />
            )}
            <div className="recipe-instructions">
              <p>{recipe.instructions}</p>
            </div>
            <button onClick={() => addToFavorites(recipe)}>
              Add to Favorites
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecipeList;
