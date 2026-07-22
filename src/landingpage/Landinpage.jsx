import { Box } from "@chakra-ui/react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import About from "./About";
import Footer from "./Footer";

// Receive the onNavigate function as a prop
const Landinpage = ({ onNavigate }) => {
  return (
    <Box display="flex" flexDirection="column" minH="100vh">
      {/* Pass it into the Navbar */}
      <Navbar onNavigate={onNavigate} />

      <Box flex="1">
        <HeroSection />
        <About />
      </Box>

      <Footer />
    </Box>
  );
};

export default Landinpage;
