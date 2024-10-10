import React, { useState, useEffect } from "react";
import "./App.css";
import dallelogo from "./assets/images/DALL-E.png"; // Adjust the path if necessary
import IngredientInput from "./components/IngredientInput";
import RecipeList from "./components/RecipeList";
import FavoriteRecipes from "./components/FavoriteRecipes";
// import OpenAI from "openai";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Add this array of common ingredients
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

  // Initialize favorites from local storage
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize OpenAI client
  // const openai = new OpenAI({
  //   apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  //   dangerouslyAllowBrowser: true, // Note: This is not recommended for production
  // });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const generateImage = async (recipeName) => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: `Create a realistic image of a plate of ${recipeName}. It sholud look appetizing and realistic. It should be a high quality image. It should be a picture of a plate of food.`,
            n: 1,
            size: "1024x1024",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error("Error generating image:", error);
      if (error.response) {
        console.error(error.response.status, error.response.data);
      } else {
        console.error(error.message);
      }
      return null;
    }
  };

  /**
   * Fetches recipes based on provided ingredients and generates images for each recipe.
   *
   * @param {string} message - A comma-separated list of ingredients.
   * @returns {Promise<Array>} A promise that resolves to an array of recipe objects.
   *
   * This function performs the following steps:
   * 1. Sets loading state and clears any previous errors.
   * 2. Makes an API call to OpenAI's GPT-3.5-turbo model to generate recipes.
   * 3. Parses the response and extracts the recipe data.
   * 4. Generates an image for each recipe using the DALL-E API.
   * 5. Combines the recipe data with the generated images.
   * 6. Updates the component state with the new recipes.
   *
   * If any errors occur during this process, it sets an error state and logs the error.
   */
  const fetchRecipes = async (message) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert chef and know all possible recipes. You will only give recipes based on the ingredients provided. You will not give any other response no matter what. You will generate 3 recipes using the provided ingredients. You will give detailed instructions on how to make the recipes. Leave no step unexplained. Format the response as a valid JSON array with objects containing 'name' and 'instructions' properties. Do not include any markdown formatting or code block syntax in your response.",
              },
              { role: "user", content: message },
            ],
            max_tokens: 1500,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let recipesString = data.choices[0].message.content;

      console.log("Raw API response:", recipesString);

      // Remove any Markdown code block syntax
      recipesString = recipesString.replace(/```json\n?|\n?```/g, "").trim();

      console.log("Cleaned response:", recipesString);

      try {
        const recipesArray = JSON.parse(recipesString);
        console.log("Parsed recipes:", recipesArray);

        // Generate images for each recipe
        const imagesPromises = recipesArray.map((recipe) =>
          generateImage(recipe.name)
        );
        const images = await Promise.all(imagesPromises);

        const recipesWithImages = recipesArray.map((recipe, index) => ({
          ...recipe,
          image: images[index],
        }));

        setRecipes(recipesWithImages);
        return recipesWithImages;
      } catch (parseError) {
        console.error("Error parsing recipes:", parseError);
        setError(
          "Failed to parse recipes. The API response was not valid JSON."
        );
        throw parseError;
      }
    } catch (error) {
      console.error(
        "Error details:",
        error.response ? error.response.data : error
      );
      setError("Failed to fetch recipes. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngredientChange = (value) => {
    setIngredients(value);
    if (value.length > 0) {
      const lastIngredient = value.split(",").pop().trim().toLowerCase();
      const filteredSuggestions = commonIngredients.filter((ingredient) =>
        ingredient.toLowerCase().includes(lastIngredient)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setIngredients((prevIngredients) => {
      const ingredientList = prevIngredients.split(",").map((i) => i.trim());
      ingredientList.pop();
      return [...ingredientList, suggestion].join(", ");
    });
    setSuggestions([]);
  };

  const onclickbbutton = () => {
    fetchRecipes(ingredients)
      .then((reply) => console.log(reply))
      .catch((error) => console.error("Error:", error));
  };

  const addToFavorites = (recipe) => {
    // Check if the recipe is already in favorites
    if (!favorites.some((fav) => fav.name === recipe.name)) {
      const updatedFavorites = [...favorites, recipe];
      setFavorites(updatedFavorites);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    }
  };

  const removeFromFavorites = (recipe) => {
    setFavorites(favorites.filter((fav) => fav.name !== recipe.name));
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={dallelogo} alt="DALL-E Logo" className="app-logo" />
        <h1>Head Cook AI</h1>
      </header>
      <IngredientInput
        ingredients={ingredients}
        setIngredients={handleIngredientChange}
        onSubmit={onclickbbutton}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
      />
      {isLoading ? (
        <div className="loading-container">
          <p className="loading-message">Please be patient</p>
          <img src={dallelogo} alt="Loading" className="loading-logo" />
          <p className="loading-message">
            I am carefully crafting recipes just for you.
            <br />
            These ingredients will make a wonderful meal!
          </p>
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          {recipes.length > 0 && (
            <RecipeList recipes={recipes} addToFavorites={addToFavorites} />
          )}
          <FavoriteRecipes
            favorites={favorites}
            removeFromFavorites={removeFromFavorites}
          />
        </>
      )}
    </div>
  );
}

export default App;
