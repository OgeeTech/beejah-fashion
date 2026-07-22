import { useState } from "react";
import { Provider } from "./components/ui/provider";
import { Toaster } from "./components/ui/toaster";

import Landinpage from "./landingpage/Landinpage";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Catalog from "./Catalogue";
import Favorites from "./Favorites";
import Cart from "./Cart";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <Provider>
      {currentPage === "home" && <Landinpage onNavigate={setCurrentPage} />}
      {currentPage === "signin" && <SignIn onNavigate={setCurrentPage} />}
      {currentPage === "signup" && <SignUp onNavigate={setCurrentPage} />}
      {currentPage === "catalog" && <Catalog onNavigate={setCurrentPage} />}
      {currentPage === "favorites" && <Favorites onNavigate={setCurrentPage} />}
      {currentPage === "cart" && <Cart onNavigate={setCurrentPage} />}

      <Toaster />
    </Provider>
  );
};

export default App;
