import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  IconButton,
  Button,
  Text,
} from "@chakra-ui/react";
import {
  Sun,
  Moon,
  User,
  LogOut,
  ShieldAlert,
  Scissors,
  Menu,
  X,
} from "lucide-react";
import { useColorMode } from "../components/ui/color-mode";

// --- NEW FIREBASE IMPORTS ---
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { toaster } from "../components/ui/toaster"; // Ensure this path matches your project!

const Navbar = ({ onNavigate }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const navLinks = ["Home", "About", "Catalog"];

  // Protect the Catalog Route
  const handleProtectedNavigation = (targetPath) => {
    setIsOpen(false); // Close mobile menu if open

    if (targetPath === "catalog") {
      if (currentUser) {
        onNavigate("catalog");
      } else {
        toaster.create({
          title: "Authentication Required",
          description: "Please sign in to access the catalog.",
          type: "info",
          duration: 3000,
        });
        onNavigate("signin");
      }
    } else {
      onNavigate(targetPath === "Home" ? "home" : targetPath.toLowerCase());
    }
  };

  // Handle Sign In / Sign Out dynamically
  const handleAuthAction = async () => {
    setIsOpen(false);
    if (currentUser) {
      await signOut(auth);
      toaster.create({
        title: "Signed Out",
        description: "You have been successfully signed out.",
        type: "success",
      });
      onNavigate("home");
    } else {
      onNavigate("signin");
    }
  };

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={50}
      w="full"
      borderBottom="1px solid"
      borderColor="gray.200"
      _dark={{ borderColor: "gray.800" }}
      bg="white"
      _dark={{ bg: "gray.900" }}
      transition="background-color 0.2s"
      boxShadow="sm"
    >
      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo Section */}
          <HStack gap={2} cursor="pointer" onClick={() => onNavigate("home")}>
            <Flex
              bg="yellow.400"
              p={2}
              rounded="md"
              color="gray.900"
              alignItems="center"
              justifyContent="center"
            >
              <Scissors size={20} strokeWidth={2.5} />
            </Flex>
            {/* Added responsive display to hide text on mobile */}
            <Text
              display={{ base: "none", md: "block" }}
              fontSize="xl"
              fontWeight="bold"
              letterSpacing="tight"
              color="gray.900"
              _dark={{ color: "white" }}
            >
              BeeJah
              <Text as="span" color="yellow.400">
                Stiches
              </Text>
            </Text>
          </HStack>

          {/* Center Navigation Links (Desktop) */}
          <HStack as="nav" gap={8} display={{ base: "none", md: "flex" }}>
            {navLinks.map((item) => (
              <Box
                as="button"
                key={item}
                onClick={() => handleProtectedNavigation(item.toLowerCase())}
                color="gray.700"
                _dark={{ color: "gray.200" }}
                px={3}
                py={2}
                rounded="md"
                fontWeight="medium"
                transition="colors 0.2s"
                _hover={{
                  color: "yellow.500",
                  textDecoration: "none",
                }}
              >
                {item}
              </Box>
            ))}
          </HStack>

          {/* Right Side Group */}
          <HStack gap={4}>
            {/* Desktop Action Buttons */}
            <HStack display={{ base: "none", md: "flex" }} gap={4}>
              <IconButton
                aria-label="Toggle dark mode"
                onClick={toggleColorMode}
                variant="ghost"
                color="gray.500"
                _dark={{ color: "gray.400" }}
                _hover={{ bg: "gray.100", color: "yellow.500" }}
              >
                {colorMode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>

              <Button
                onClick={() => onNavigate("admin-login")}
                variant="ghost"
                color="gray.500"
                _dark={{
                  color: "gray.400",
                  _hover: { bg: "gray.800", color: "yellow.500" },
                }}
                _hover={{ bg: "gray.100", color: "yellow.500" }}
                fontWeight="medium"
              >
                <ShieldAlert size={18} />
                Admin
              </Button>

              {/* DYNAMIC SIGN IN / SIGN OUT BUTTON */}
              <Button
                onClick={handleAuthAction}
                bg={currentUser ? "red.500" : "yellow.400"}
                color={currentUser ? "white" : "gray.900"}
                _hover={{ bg: currentUser ? "red.600" : "yellow.500" }}
                fontWeight="semibold"
                px={4}
              >
                {currentUser ? <LogOut size={18} /> : <User size={18} />}
                {currentUser ? "Sign Out" : "Sign In"}
              </Button>
            </HStack>

            {/* Mobile Menu Hamburger Toggle */}
            <IconButton
              display={{ base: "flex", md: "none" }}
              aria-label="Open menu"
              onClick={() => setIsOpen(!isOpen)}
              variant="ghost"
              color="gray.500"
              _dark={{ color: "gray.400" }}
              _hover={{ bg: "gray.100", color: "yellow.500" }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
          </HStack>
        </Flex>

        {/* Mobile Navigation Dropdown */}
        {isOpen && (
          <Box
            pb={4}
            display={{ base: "block", md: "none" }}
            animation="fadeIn 0.2s ease-in-out"
          >
            <VStack as="nav" gap={2} alignItems="flex-start" mt={2}>
              {navLinks.map((item) => (
                <Box
                  as="button"
                  key={item}
                  w="full"
                  textAlign="left"
                  onClick={() => handleProtectedNavigation(item.toLowerCase())}
                  px={3}
                  py={2}
                  rounded="md"
                  fontWeight="medium"
                  color="gray.700"
                  _dark={{ color: "gray.200", _hover: { bg: "gray.800" } }}
                  _hover={{
                    bg: "gray.100",
                    color: "yellow.500",
                    textDecoration: "none",
                  }}
                >
                  {item}
                </Box>
              ))}

              <Box
                w="full"
                h="1px"
                bg="gray.100"
                _dark={{ bg: "gray.800" }}
                my={2}
              />

              <Box
                as="button"
                onClick={toggleColorMode}
                w="full"
                display="flex"
                alignItems="center"
                gap={2}
                px={3}
                py={2}
                rounded="md"
                fontWeight="medium"
                color="gray.500"
                _dark={{ color: "gray.400", _hover: { bg: "gray.800" } }}
                _hover={{ bg: "gray.100", color: "yellow.500" }}
              >
                {colorMode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
              </Box>

              <Box
                as="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigate("admin-login");
                }}
                w="full"
                display="flex"
                alignItems="center"
                gap={2}
                px={3}
                py={2}
                rounded="md"
                fontWeight="medium"
                color="gray.500"
                _dark={{ color: "gray.400", _hover: { bg: "gray.800" } }}
                _hover={{
                  bg: "gray.100",
                  color: "yellow.500",
                  textDecoration: "none",
                }}
              >
                <ShieldAlert size={18} />
                Admin Dashboard
              </Box>

              <Button
                onClick={handleAuthAction}
                w="full"
                mt={2}
                bg={currentUser ? "red.500" : "yellow.400"}
                color={currentUser ? "white" : "gray.900"}
                _hover={{ bg: currentUser ? "red.600" : "yellow.500" }}
                fontWeight="semibold"
                justifyContent="center"
              >
                {currentUser ? <LogOut size={18} /> : <User size={18} />}
                {currentUser ? "Sign Out" : "Sign In"}
              </Button>
            </VStack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Navbar;
