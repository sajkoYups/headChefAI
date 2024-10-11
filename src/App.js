import React, { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import "./App.css";
import dallelogo from "./assets/images/DALL-E.png";
import IngredientInput from "./components/IngredientInput";
import RecipeList from "./components/RecipeList";
import FavoriteRecipes from "./components/FavoriteRecipes";
import foodStories from "./foodStories";
import CuisineSelector from "./components/CuisineSelector";
import LoadingModal from "./components/LoadingModal"; // Add this import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStory, setCurrentStory] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState([]); // Add this line
  const [favorites, setFavorites] = useState([]); // Add this line
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) {
      setRandomStory();
    }
  }, [isLoading]);

  const setRandomStory = () => {
    const randomIndex = Math.floor(Math.random() * foodStories.length);
    setCurrentStory(foodStories[randomIndex]);
  };

  const signIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.error("Error signing in with Google", error);
    });
  };

  const signOutUser = () => {
    signOut(auth)
      .then(() => {
        // Clear recipes and favorites when user signs out
        setRecipes([]);
        setFavorites([]);
        setError(null);
      })
      .catch((error) => {
        console.error("Error signing out", error);
      });
  };

  const generateImage = useCallback(
    async (recipeName) => {
      try {
        const response = await fetch("http://localhost:3001/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: user ? `Bearer ${await user.getIdToken()}` : "",
          },
          body: JSON.stringify({ recipeName }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.imageUrl;
      } catch (error) {
        console.error("Error generating image:", error);
        return null;
      }
    },
    [user]
  );

  const fetchRecipes = useCallback(
    async (message, selectedCuisines) => {
      setIsLoading(true);
      setError(null);

      // Create a new AbortController instance
      abortControllerRef.current = new AbortController();

      try {
        console.log(
          "Sending request with ingredients:",
          message,
          "and cuisines:",
          selectedCuisines
        );
        const response = await fetch("http://localhost:3001/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: user ? `Bearer ${await user.getIdToken()}` : "",
          },
          body: JSON.stringify({
            ingredients: message,
            cuisines: selectedCuisines,
          }),
          signal: abortControllerRef.current.signal, // Add this line
        });

        if (!response.ok) {
          let errorMessage = "Failed to fetch recipes. Please try again.";
          if (response.status === 401) {
            errorMessage =
              "You've reached the search limit. Please sign in to continue.";
          } else if (response.status === 404) {
            errorMessage = "No recipes found. Try different ingredients.";
          }
          // You can add more specific error messages for other status codes if needed

          const errorData = await response.json();
          console.error("Error response:", errorData);
          setError(errorMessage);
          setRecipes([]);
          return;
        }

        const data = await response.json();
        console.log("Received data:", data);
        const recipesWithImages = await Promise.all(
          data.recipes.map(async (recipe) => ({
            ...recipe,
            image: await generateImage(recipe.name),
          }))
        );

        setRecipes(recipesWithImages);
        return recipesWithImages;
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Error details:", error);
          setError("An unexpected error occurred. Please try again later.");
        }
        setRecipes([]);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [user, generateImage]
  );

  const handleSearch = async () => {
    if (!ingredients.trim()) {
      setError("Please enter some ingredients before searching.");
      return;
    }
    await fetchRecipes(ingredients, selectedCuisines);
  };

  const addToFavorites = (recipe) => {
    setFavorites((prevFavorites) => [...prevFavorites, recipe]);
  };

  const removeFromFavorites = (recipeToRemove) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((recipe) => recipe.name !== recipeToRemove.name)
    );
  };

  const cancelSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={dallelogo} alt="DALL-E Logo" className="app-logo" /> */}
        <h1>Head Chef Antonio AI</h1>
        <div className="auth-button">
          {user ? (
            <button onClick={signOutUser}>Sign Out</button>
          ) : (
            <button onClick={signIn}>Sign In with Google</button>
          )}
        </div>
      </header>
      <main>
        <div className="welcome-container">
          <div className="welcome-logo-container">
            <img src={dallelogo} alt="DALL-E Logo" className="welcome-logo" />
          </div>
          <div className="welcome-message">
            <h2>Welcome to Head Chef Antonio AI!</h2>
            <p>
              Unlock the magic of your kitchen with our AI-powered recipe
              generator! Simply enter the ingredients you have on hand, and
              watch as Head Chef Antonio crafts personalized, mouthwatering
              recipes just for you. Whether you're a seasoned cook or a curious
              beginner, let's turn your ingredients into culinary masterpieces.
              Ready to embark on a delicious adventure?
            </p>
          </div>
        </div>
        <CuisineSelector onCuisineChange={setSelectedCuisines} />
        <IngredientInput
          ingredients={ingredients}
          setIngredients={setIngredients}
          onSubmit={handleSearch}
        />
        {error && <p className="error">{error}</p>}
        {user && recipes.length > 0 ? (
          <RecipeList recipes={recipes} addToFavorites={addToFavorites} />
        ) : (
          !error && (
            <p>
              {user
                ? "Looks like your recipe book is empty! Why not explore some delicious dishes by searching for ingredients you love?"
                : "Welcome to Head Chef Antonio AI! You can try one free search without signing in. For unlimited recipe discoveries, create a free account and unlock a world of culinary possibilities. Let's start cooking up some magic together!"}
            </p>
          )
        )}
        {user && favorites.length > 0 && (
          <FavoriteRecipes
            favorites={favorites}
            removeFromFavorites={removeFromFavorites}
          />
        )}
      </main>
      <footer className="App-footer">
        <div className="footer-content">
          <p>&copy; 2023 Head Chef Antonio AI. All rights reserved.</p>
          <div className="social-links">
            <a
              href="https://twitter.com/HeadChefAntonio"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              href="https://www.instagram.com/headchefantonio"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/HeadChefAntonioAI"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          </div>
        </div>
      </footer>
      <LoadingModal
        isLoading={isLoading}
        onCancel={cancelSearch}
        dallelogo={dallelogo}
        currentStory={currentStory}
        setRandomStory={setRandomStory}
      />
    </div>
  );
}

export default App;
