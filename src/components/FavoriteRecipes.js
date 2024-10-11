import React from "react";

function FavoriteRecipes({ favorites = [], removeFromFavorites }) {
  return (
    <div className="favorite-recipes">
      <h2>Favorite Recipes</h2>
      {favorites.length === 0 ? (
        <p>No favorite recipes yet.</p>
      ) : (
        favorites.map((recipe, index) => (
          <div key={index} className="favorite-recipe">
            <h3>{recipe.name}</h3>
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.name}
                className="recipe-image"
              />
            )}
            <p>{recipe.instructions}</p>
            <button onClick={() => removeFromFavorites(recipe)}>
              Remove from Favorites
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default FavoriteRecipes;
