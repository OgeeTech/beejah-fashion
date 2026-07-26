import { useState, useEffect } from "react";
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
import { toaster } from "../components/ui/toaster";
import { useColorMode } from "../components/ui/color-mode";

// --- FIREBASE IMPORTS ---
import { db, auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const NotificationBadge = ({ count }) => {
  if (count === undefined || count === null || count === 0) return null;
  return (
    <Flex
      position="absolute"
      top="-4px"
      right="-4px"
      bg="red.500"
      color="white"
      fontSize="10px"
      fontWeight="bold"
      w="18px"
      h="18px"
      rounded="full"
      alignItems="center"
      justifyContent="center"
      border="2px solid"
      borderColor="white"
      _dark={{ borderColor: "gray.900" }}
      zIndex={10}
    >
      {count > 99 ? "99+" : count}
    </Flex>
  );
};

const Nav = ({ onNavigate, searchQuery, onSearchChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();

  // --- LIVE FIREBASE STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // --- DATABASE LISTENERS ---
  useEffect(() => {
    let unsubCart = () => {};
    let unsubFav = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);

      if (user) {
        // Listen to this specific user's cart
        const qCart = query(
          collection(db, "cartItems"),
          where("userId", "==", user.uid),
        );
        unsubCart = onSnapshot(qCart, (snap) => setCartCount(snap.size));

        // Listen to this specific user's favorites
        const qFav = query(
          collection(db, "favoriteItems"),
          where("userId", "==", user.uid),
        );
        unsubFav = onSnapshot(qFav, (snap) => setFavoriteCount(snap.size));
      } else {
        setCartCount(0);
        setFavoriteCount(0);
        unsubCart();
        unsubFav();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubCart();
      unsubFav();
    };
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      await signOut(auth);
      toaster.create({
        title: "Logged out",
        description: "You have been successfully logged out.",
        type: "info",
      });
      onNavigate("home");
    } catch (error) {
      console.error("Logout Error:", error);
      toaster.create({
        title: "Error",
        description: "Failed to log out.",
        type: "error",
      });
    }
  };

  const handleRestrictedAction = (actionName) => {
    if (!isLoggedIn) {
      toaster.create({
        title: "Sign In Required",
        description: `You need to sign in to view your ${actionName}.`,
        type: "warning",
      });
      return;
    }
    onNavigate(actionName);
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
            <HStack
              gap={2}
              cursor="pointer"
              onClick={() => onNavigate("catalog")}
            >
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
                  value={searchQuery || ""}
                  onChange={(e) =>
                    onSearchChange && onSearchChange(e.target.value)
                  }
                  _placeholder={{ color: "gray.500" }}
                />
              </Flex>
            </Box>

            <HStack gap={3}>
              <Text
                fontWeight="bold"
                fontSize="sm"
                color="gray.700"
                _dark={{ color: "gray.200" }}
                cursor="pointer"
                onClick={() => onNavigate("catalog")}
                _hover={{ color: "yellow.500", _dark: { color: "yellow.400" } }}
                mr={2}
              >
                Catalog
              </Text>

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

              <Box position="relative">
                <IconButton
                  variant="ghost"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                  onClick={() => handleRestrictedAction("favorites")}
                  rounded="full"
                  _hover={{ bg: "gray.100", _dark: { bg: "gray.800" } }}
                >
                  <Heart size={20} />
                </IconButton>
                <NotificationBadge count={favoriteCount} />
              </Box>

              <Box position="relative">
                <IconButton
                  variant="ghost"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                  onClick={() => handleRestrictedAction("cart")}
                  rounded="full"
                  _hover={{ bg: "gray.100", _dark: { bg: "gray.800" } }}
                >
                  <ShoppingBag size={20} />
                </IconButton>
                <NotificationBadge count={cartCount} />
              </Box>

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
                        {isLoggedIn ? "My Account" : "Guest User"}
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

      {/* MOBILE BOTTOM NAV */}
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
          <VStack
            gap={1}
            cursor="pointer"
            onClick={() => onNavigate("catalog")}
            color="yellow.500"
          >
            <LayoutGrid size={20} />
            <Text fontSize="xs" fontWeight="bold">
              Catalog
            </Text>
          </VStack>
          <VStack
            gap={1}
            cursor="pointer"
            onClick={() => handleRestrictedAction("favorites")}
            color="gray.500"
            _dark={{ color: "gray.400" }}
          >
            <Box position="relative">
              <Heart size={20} />
              <NotificationBadge count={favoriteCount} />
            </Box>
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
            <Box position="relative">
              <ShoppingBag size={20} />
              <NotificationBadge count={cartCount} />
            </Box>
            <Text fontSize="xs" fontWeight="medium">
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
            {isLoggedIn ? <LogOut size={20} /> : <User size={20} />}
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
