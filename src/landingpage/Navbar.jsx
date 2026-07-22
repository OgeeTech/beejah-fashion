import { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  IconButton,
  Button,
  Text,
} from "@chakra-ui/react";
import { Sun, Moon, User, ShieldAlert, Scissors, Menu, X } from "lucide-react";
import { useColorMode } from "../components/ui/color-mode";

// Receive onNavigate as a prop
const Navbar = ({ onNavigate }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = ["Home", "About", "Catalog"];

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
          {/* Logo Section - Click to go back home */}
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
            <Text
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
                as="button" // Changed from "a" to "button"
                key={item}
                onClick={() => {
                  if (item === "Catalog") {
                    onNavigate("catalog");
                  } else {
                    onNavigate("home");
                  }
                }}
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
            {/* Desktop Action Buttons (Hidden on Mobile) */}
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

              {/* DESKTOP SIGN IN BUTTON */}
              <Button
                onClick={() => onNavigate("signin")}
                bg="yellow.400"
                color="gray.900"
                _hover={{ bg: "yellow.500" }}
                fontWeight="semibold"
                px={4}
              >
                <User size={18} />
                Sign In
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
                  as="button" // Changed from "a" to "button"
                  key={item}
                  w="full"
                  textAlign="left"
                  onClick={() => {
                    setIsOpen(false); // Closes the mobile menu
                    if (item === "Catalog") {
                      onNavigate("catalog");
                    } else {
                      onNavigate("home");
                    }
                  }}
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
                as="a"
                href="#"
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

              {/* MOBILE SIGN IN BUTTON */}
              <Button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate("signin");
                }}
                w="full"
                mt={2}
                bg="yellow.400"
                color="gray.900"
                _hover={{ bg: "yellow.500" }}
                fontWeight="semibold"
                justifyContent="center"
              >
                <User size={18} />
                Sign In
              </Button>
            </VStack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Navbar;
