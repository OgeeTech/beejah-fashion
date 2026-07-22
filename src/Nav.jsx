import { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  IconButton,
  Input,
} from "@chakra-ui/react";
import {
  Scissors,
  Search,
  ShoppingBag,
  Heart,
  User,
  Home,
  LayoutGrid,
  Sun,
  Moon,
  LogOut,
  LogIn,
  Settings,
} from "lucide-react";
import { toaster } from "./components/ui/toaster";
import { useColorMode } from "./components/ui/color-mode";

const Nav = ({ onNavigate, isLoggedIn, handleRestrictedAction }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLogout = () => {
    setIsMenuOpen(false);
    toaster.create({
      title: "Logged out",
      description: "You have been successfully logged out.",
      type: "info",
      duration: 3000,
    });
  };

  return (
    <>
      <Box
        display={{ base: "none", md: "block" }}
        position="sticky"
        top={0}
        zIndex={50}
        bg="white"
        _dark={{ bg: "gray.900", borderColor: "gray.800" }}
        borderBottom="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
      >
        <Box maxW="7xl" mx="auto" px={6}>
          <Flex h={16} alignItems="center" justifyContent="space-between">
            {/* Logo */}
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
                color="gray.900"
                _dark={{ color: "white" }}
              >
                BeeJah
                <Text as="span" color="yellow.400">
                  Stiches
                </Text>
              </Text>
            </HStack>

            {/* Search Bar */}
            <Box maxW="md" w="full" px={8}>
              <Flex
                alignItems="center"
                bg="gray.100"
                _dark={{ bg: "gray.800" }}
                px={4}
                py={2}
                rounded="full"
              >
                <Search size={18} color="gray" />
                <Input
                  variant="unstyled"
                  placeholder="Search catalog..."
                  ml={2}
                  _placeholder={{ color: "gray.500" }}
                />
              </Flex>
            </Box>

            {/* Desktop Icons Group */}
            <HStack gap={3}>
              {/* Dark Mode Toggle */}
              <IconButton
                variant="ghost"
                color="gray.600"
                _dark={{ color: "gray.300" }}
                onClick={toggleColorMode}
                rounded="full"
                _hover={{
                  bg: "gray.100",
                  _dark: { bg: "gray.800", color: "yellow.400" },
                }}
              >
                {colorMode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>

              <IconButton
                variant="ghost"
                color="gray.600"
                _dark={{ color: "gray.300" }}
                onClick={() => onNavigate("favorites")}
                rounded="full"
                _hover={{ bg: "gray.100", _dark: { bg: "gray.800" } }}
              >
                <Heart size={20} />
              </IconButton>

              <IconButton
                variant="ghost"
                color="gray.600"
                _dark={{ color: "gray.300" }}
                onClick={() => onNavigate("cart")}
                rounded="full"
                _hover={{ bg: "gray.100", _dark: { bg: "gray.800" } }}
              >
                <ShoppingBag size={20} />
              </IconButton>

              {/* PREMIUM AVATAR & MODAL */}
              <Box position="relative">
                <Flex
                  as="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  w={10}
                  h={10}
                  ml={2}
                  rounded="full"
                  bg={isLoggedIn ? "yellow.400" : "gray.100"}
                  _dark={{ bg: isLoggedIn ? "yellow.500" : "gray.800" }}
                  color={isLoggedIn ? "gray.900" : "gray.500"}
                  alignItems="center"
                  justifyContent="center"
                  border="2px solid"
                  borderColor="white"
                  _dark={{ borderColor: "gray.900" }}
                  boxShadow="sm"
                  transition="all 0.2s"
                  _hover={{ transform: "scale(1.05)", boxShadow: "md" }}
                >
                  <User size={20} strokeWidth={isLoggedIn ? 2.5 : 2} />
                </Flex>

                {isMenuOpen && (
                  <Box
                    position="absolute"
                    top="130%"
                    right={0}
                    bg="white"
                    _dark={{ bg: "gray.900", borderColor: "gray.700" }}
                    boxShadow="xl"
                    border="1px solid"
                    borderColor="gray.200"
                    rounded="xl"
                    w="240px"
                    zIndex={100}
                    overflow="hidden"
                  >
                    {/* Modal Header */}
                    <Box
                      p={4}
                      bg="gray.50"
                      _dark={{ bg: "gray.800" }}
                      borderBottom="1px solid"
                      borderColor="gray.200"
                      _dark={{ borderColor: "gray.700" }}
                    >
                      <Text
                        fontWeight="bold"
                        fontSize="sm"
                        color="gray.900"
                        _dark={{ color: "white" }}
                      >
                        {isLoggedIn ? "Wada Gift" : "Guest User"}
                      </Text>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        _dark={{ color: "gray.400" }}
                        mt={0.5}
                      >
                        {isLoggedIn
                          ? "Manage your custom orders"
                          : "Sign in to manage account"}
                      </Text>
                    </Box>

                    {/* Modal Body / Links */}
                    <VStack gap={0} alignItems="stretch" py={2}>
                      {isLoggedIn && (
                        <HStack
                          as="button"
                          px={4}
                          py={3}
                          color="gray.700"
                          _dark={{ color: "gray.200" }}
                          _hover={{
                            bg: "gray.50",
                            _dark: { bg: "gray.800" },
                            color: "yellow.500",
                          }}
                          transition="all 0.2s"
                        >
                          <Settings size={16} />
                          <Text fontSize="sm" fontWeight="medium" ml={2}>
                            Account Settings
                          </Text>
                        </HStack>
                      )}

                      {isLoggedIn ? (
                        <HStack
                          as="button"
                          onClick={handleLogout}
                          px={4}
                          py={3}
                          color="red.500"
                          _dark={{ color: "red.400" }}
                          _hover={{ bg: "red.50", _dark: { bg: "red.900/20" } }}
                          transition="all 0.2s"
                        >
                          <LogOut size={16} />
                          <Text fontSize="sm" fontWeight="medium" ml={2}>
                            Logout
                          </Text>
                        </HStack>
                      ) : (
                        <HStack
                          as="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigate("signin");
                          }}
                          px={4}
                          py={3}
                          color="gray.900"
                          _dark={{ color: "white" }}
                          _hover={{
                            bg: "yellow.50",
                            _dark: { bg: "gray.800" },
                            color: "yellow.600",
                          }}
                          transition="all 0.2s"
                        >
                          <LogIn size={16} />
                          <Text fontSize="sm" fontWeight="medium" ml={2}>
                            Sign In / Register
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                )}
              </Box>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* MOBILE BOTTOM NAV (Hidden on Desktop)      */}

      <Box
        display={{ base: "block", md: "none" }}
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={50}
        bg="white"
        _dark={{ bg: "gray.900", borderColor: "gray.800" }}
        borderTop="1px solid"
        borderColor="gray.200"
        pb="env(safe-area-inset-bottom)"
        boxShadow="0 -4px 12px rgba(0,0,0,0.05)"
      >
        <Flex justifyContent="space-around" alignItems="center" h={16}>
          <VStack
            gap={1}
            cursor="pointer"
            onClick={() => onNavigate("home")}
            color="gray.500"
            _dark={{ color: "gray.400" }}
          >
            <Home size={20} />
            <Text fontSize="xs" fontWeight="medium">
              Home
            </Text>
          </VStack>

          <VStack gap={1} cursor="pointer" color="yellow.500">
            <LayoutGrid size={20} />
            <Text fontSize="xs" fontWeight="bold">
              Catalog
            </Text>
          </VStack>

          <VStack
            gap={1}
            cursor="pointer"
            onClick={() => onNavigate("favorites")}
            color="gray.500"
            _dark={{ color: "gray.400" }}
          >
            <Heart size={20} />
            <Text fontSize="xs" fontWeight="medium">
              Saved
            </Text>
          </VStack>

          <VStack
            gap={1}
            cursor="pointer"
            onClick={() => handleRestrictedAction("cart")}
            color="gray.500"
            _dark={{ color: "gray.400" }}
          >
            <ShoppingBag size={20} />
            <Text
              fontSize="xs"
              fontWeight="medium"
              onClick={() => onNavigate("cart")}
            >
              Cart
            </Text>
          </VStack>

          <VStack
            gap={1}
            cursor="pointer"
            onClick={() => (isLoggedIn ? handleLogout() : onNavigate("signin"))}
            color="gray.500"
            _dark={{ color: "gray.400" }}
          >
            <User size={20} />
            <Text fontSize="xs" fontWeight="medium">
              {isLoggedIn ? "Logout" : "Sign In"}
            </Text>
          </VStack>
        </Flex>
      </Box>
    </>
  );
};

export default Nav;
