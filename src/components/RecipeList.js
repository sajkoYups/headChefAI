import React from "react";

function RecipeList({ recipes, addToFavorites }) {
  return (
    <div className="recipe-list">
      <h2>Recipes</h2>
      {recipes.map((recipe, index) => (
        <div key={index} className="recipe">
          <h3>{recipe.name}</h3>
          {recipe.image && (
            <img
              src={recipe.image}
              alt={recipe.name}
              className="recipe-image"
            />
          )}
          <p>{recipe.instructions}</p>
          <button onClick={() => addToFavorites(recipe)}>
            Add to Favorites
          </button>
        </div>
      ))}
    </div>
  );
}

export default RecipeList;
