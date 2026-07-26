import { useState } from "react";
import { Provider } from "./components/ui/provider";
import { Toaster } from "./components/ui/toaster";

import Landinpage from "./landingpage/Landinpage";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Catalog from "./catalogue/Catalogue";
import Favorites from "./catalogue/Favorites";
import Cart from "./catalogue/Cart";
import AdminLogin from "./landingpage/AdminLogin";

// 1. Import your new Admin Dashboard wrapper here
import AdminDashboard from "./admin/AdminDashboard";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [cartCount, setCartCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const handleAddToCart = () => setCartCount(cartCount + 1);
  const handleAddToFavorites = () => setFavoriteCount(favoriteCount + 1);

  // New function to decrease the favorite badge
  const handleRemoveFromFavorites = () => {
    setFavoriteCount(favoriteCount > 0 ? favoriteCount - 1 : 0);
  };

  return (
    <Provider>
      {currentPage === "home" && (
        <Landinpage
          onNavigate={setCurrentPage}
          cartCount={cartCount}
          favoriteCount={favoriteCount}
        />
      )}

      {currentPage === "signin" && <SignIn onNavigate={setCurrentPage} />}

      {currentPage === "signup" && <SignUp onNavigate={setCurrentPage} />}

      {currentPage === "catalog" && (
        <Catalog
          onNavigate={setCurrentPage}
          cartCount={cartCount}
          favoriteCount={favoriteCount}
          onAddToCart={handleAddToCart}
          onAddToFavorites={handleAddToFavorites}
        />
      )}

      {currentPage === "favorites" && (
        <Favorites
          onNavigate={setCurrentPage}
          cartCount={cartCount}
          favoriteCount={favoriteCount}
          onAddToCart={handleAddToCart}
          onRemoveFromFavorites={handleRemoveFromFavorites}
        />
      )}

      {currentPage === "cart" && (
        <Cart
          onNavigate={setCurrentPage}
          cartCount={cartCount}
          favoriteCount={favoriteCount}
        />
      )}

      {/* --- ADDED ADMIN LOGIN ROUTE --- */}
      {currentPage === "admin-login" && (
        <AdminLogin onNavigate={setCurrentPage} />
      )}

      {/* 2. Add the Admin route to your application state */}
      {currentPage === "admin" && (
        <AdminDashboard onNavigate={setCurrentPage} />
      )}

      <Toaster />
    </Provider>
  );
};

export default App;
