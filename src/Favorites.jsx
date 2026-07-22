import { useState } from "react";
import {
  Box,
  Flex,
  Grid,
  VStack,
  HStack,
  Heading,
  Text,
  Image,
  IconButton,
  Button,
} from "@chakra-ui/react";
import {
  Heart,
  HeartCrack,
  ShoppingBag,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { toaster } from "./components/ui/toaster";
import Nav from "./Nav";

const Favorites = ({ onNavigate }) => {
  // Set to true to see the items, set to false to see the "Sign In" prompt!
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Mock Favorites Data
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      name: "Classic White Senator",
      price: "₦45,000",
      image:
        "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 4,
      name: "Luxury Ankara Two-Piece",
      price: "₦35,000",
      image:
        "https://images.unsplash.com/photo-1515347619362-e98860a4f526?q=80&w=800&auto=format&fit=crop",
    },
  ]);

  const handleRemoveFavorite = (id) => {
    setFavorites(favorites.filter((item) => item.id !== id));
    toaster.create({
      title: "Removed from Saved",
      description: "Item has been removed from your favorites.",
      type: "info",
      duration: 3000,
    });
  };

  const handleAddToCart = () => {
    toaster.create({
      title: "Added to Cart",
      description: "Item moved to your shopping bag!",
      type: "success",
      duration: 3000,
    });
  };

  // Nav handler
  const handleRestrictedAction = (actionName) => {
    if (!isLoggedIn) {
      toaster.create({
        title: "Sign In Required",
        description: `You need to sign in to view your ${actionName}.`,
        type: "warning",
      });
      return;
    }
    if (actionName === "cart") {
      toaster.create({ title: "Cart Opened", type: "info" });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.950" }}>
      <Nav
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        handleRestrictedAction={handleRestrictedAction}
      />

      <Box
        maxW="7xl"
        mx="auto"
        px={{ base: 4, sm: 6, lg: 8 }}
        py={8}
        pb={{ base: 24, md: 12 }}
      >
        <Flex justifyContent="space-between" alignItems="center" mb={8}>
          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            color="gray.900"
            _dark={{ color: "white" }}
          >
            Saved Items
          </Heading>
          {isLoggedIn && favorites.length > 0 && (
            <Text
              color="gray.500"
              _dark={{ color: "gray.400" }}
              fontWeight="medium"
            >
              {favorites.length} {favorites.length === 1 ? "Item" : "Items"}
            </Text>
          )}
        </Flex>

        {/* STATE 1: NOT LOGGED IN */}
        {!isLoggedIn ? (
          <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            py={20}
            textAlign="center"
          >
            <Box
              bg="gray.100"
              _dark={{ bg: "gray.800" }}
              p={6}
              rounded="full"
              mb={6}
            >
              <Heart size={48} color="gray" />
            </Box>
            <Heading
              fontSize="xl"
              mb={3}
              color="gray.900"
              _dark={{ color: "white" }}
            >
              Keep track of your favorites
            </Heading>
            <Text
              color="gray.500"
              _dark={{ color: "gray.400" }}
              maxW="md"
              mb={8}
            >
              Sign in to save items you love and manage your bespoke wardrobe.
            </Text>
            <Button
              onClick={() => onNavigate("signin")}
              bg="yellow.400"
              color="gray.900"
              _hover={{ bg: "yellow.500" }}
              size="lg"
              rounded="full"
              px={8}
            >
              Sign In to View
            </Button>
          </Flex>
        ) : /* STATE 2: LOGGED IN BUT NO FAVORITES */
        favorites.length === 0 ? (
          <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            py={20}
            textAlign="center"
          >
            <Box
              bg="gray.100"
              _dark={{ bg: "gray.800" }}
              p={6}
              rounded="full"
              mb={6}
            >
              <HeartCrack size={48} color="gray" />
            </Box>
            <Heading
              fontSize="xl"
              mb={3}
              color="gray.900"
              _dark={{ color: "white" }}
            >
              No saved items yet
            </Heading>
            <Text
              color="gray.500"
              _dark={{ color: "gray.400" }}
              maxW="md"
              mb={8}
            >
              Browse our 2026 collection and tap the heart icon to save your
              favorite styles.
            </Text>
            <Button
              onClick={() => onNavigate("catalog")}
              variant="outline"
              borderColor="gray.300"
              color="gray.900"
              _dark={{ borderColor: "gray.700", color: "white" }}
              _hover={{ bg: "gray.100", _dark: { bg: "gray.800" } }}
              size="lg"
              rounded="full"
              px={8}
            >
              Explore Catalog
              <ArrowRight size={18} style={{ marginLeft: "8px" }} />
            </Button>
          </Flex>
        ) : (
          /* STATE 3: LOGGED IN WITH FAVORITES */
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
          >
            {favorites.map((item) => (
              <Box
                key={item.id}
                bg="white"
                _dark={{ bg: "gray.900", borderColor: "gray.800" }}
                border="1px solid"
                borderColor="gray.200"
                rounded="2xl"
                overflow="hidden"
                boxShadow="sm"
                transition="transform 0.2s"
                _hover={{ transform: "translateY(-4px)", boxShadow: "md" }}
              >
                <Box position="relative" h="250px" overflow="hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                </Box>

                <VStack p={5} alignItems="flex-start" gap={3}>
                  <Heading
                    as="h3"
                    fontSize="lg"
                    fontWeight="bold"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    {item.name}
                  </Heading>
                  <Text fontSize="md" fontWeight="semibold" color="yellow.500">
                    {item.price}
                  </Text>

                  <HStack w="full" mt={2} gap={2}>
                    <Button
                      onClick={handleAddToCart}
                      flex="1"
                      bg="gray.900"
                      color="white"
                      _dark={{ bg: "white", color: "gray.900" }}
                      _hover={{ bg: "yellow.400", color: "gray.900" }}
                      fontWeight="bold"
                    >
                      <ShoppingBag size={18} style={{ marginRight: "8px" }} />
                      Move to Cart
                    </Button>

                    {/* Small Delete Button */}
                    <IconButton
                      onClick={() => handleRemoveFavorite(item.id)}
                      variant="outline"
                      color="red.500"
                      borderColor="gray.200"
                      _dark={{ borderColor: "gray.700" }}
                      _hover={{
                        bg: "red.50",
                        color: "red.600",
                        borderColor: "red.200",
                        _dark: {
                          bg: "red.900/30",
                          borderColor: "red.800",
                          color: "red.400",
                        },
                      }}
                      aria-label="Delete saved item"
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Favorites;
