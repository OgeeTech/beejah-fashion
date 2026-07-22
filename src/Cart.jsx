import { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Image,
  IconButton,
  Button,
  Grid, // <--- ADDED THIS HERE!
} from "@chakra-ui/react";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag as CartIcon,
} from "lucide-react";
import { toaster } from "./components/ui/toaster";
import Nav from "./Nav";

const Cart = ({ onNavigate }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Mock Cart Data with quantity state
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Classic White Senator",
      price: 45000,
      image:
        "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop",
      quantity: 1,
    },
    {
      id: 2,
      name: "Royal Blue Agbada",
      price: 120000,
      image:
        "https://images.unsplash.com/photo-1611042553365-9b101441c135?q=80&w=800&auto=format&fit=crop",
      quantity: 1,
    },
  ]);

  const handleQuantityChange = (id, change) => {
    setCartItems(
      cartItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
    toaster.create({
      title: "Item removed",
      description: "Item has been removed from your shopping bag.",
      type: "info",
      duration: 3000,
    });
  };

  const handleCheckout = () => {
    toaster.create({
      title: "Order Placed Successfully!",
      description: "Redirecting to your secure payment gateway...",
      type: "success",
      duration: 4000,
    });
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
    if (actionName === "favorites") {
      onNavigate("favorites");
    }
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = cartItems.length > 0 ? 5000 : 0;
  const total = subtotal + shipping;

  const formatNaira = (amount) => `₦${amount.toLocaleString()}`;

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
        <Heading
          as="h1"
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          color="gray.900"
          _dark={{ color: "white" }}
          mb={8}
        >
          Shopping Bag
        </Heading>

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
              <ShoppingBag size={48} color="gray" />
            </Box>
            <Heading
              fontSize="xl"
              mb={3}
              color="gray.900"
              _dark={{ color: "white" }}
            >
              Your bag is waiting for you
            </Heading>
            <Text
              color="gray.500"
              _dark={{ color: "gray.400" }}
              maxW="md"
              mb={8}
            >
              Sign in to sync your bag across devices and checkout seamlessly.
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
              Sign In to View Bag
            </Button>
          </Flex>
        ) : /* STATE 2: EMPTY CART */
        cartItems.length === 0 ? (
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
              <CartIcon size={48} color="gray" />
            </Box>
            <Heading
              fontSize="xl"
              mb={3}
              color="gray.900"
              _dark={{ color: "white" }}
            >
              Your bag is empty
            </Heading>
            <Text
              color="gray.500"
              _dark={{ color: "gray.400" }}
              maxW="md"
              mb={8}
            >
              Explore our exquisite collection of custom outfits and add your
              first style to the bag.
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
          /* STATE 3: ITEMS IN CART */
          <Grid
            templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
            gap={8}
            alignItems="flex-start"
          >
            {/* Left Column: Items List */}
            <VStack gap={4} alignItems="stretch">
              {cartItems.map((item) => (
                <Flex
                  key={item.id}
                  bg="white"
                  _dark={{ bg: "gray.900", borderColor: "gray.800" }}
                  border="1px solid"
                  borderColor="gray.200"
                  rounded="2xl"
                  p={4}
                  gap={4}
                  alignItems="center"
                  boxShadow="sm"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    w="90px"
                    h="90px"
                    objectFit="cover"
                    rounded="xl"
                  />

                  <VStack flex="1" alignItems="flex-start" gap={1}>
                    <Heading
                      as="h3"
                      fontSize="md"
                      fontWeight="bold"
                      color="gray.900"
                      _dark={{ color: "white" }}
                    >
                      {item.name}
                    </Heading>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color="yellow.500"
                    >
                      {formatNaira(item.price)}
                    </Text>
                  </VStack>

                  {/* Quantity Controls */}
                  <HStack
                    border="1px solid"
                    borderColor="gray.200"
                    _dark={{ borderColor: "gray.700" }}
                    rounded="lg"
                    p={1}
                  >
                    <IconButton
                      onClick={() => handleQuantityChange(item.id, -1)}
                      variant="ghost"
                      size="xs"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </IconButton>
                    <Text
                      px={2}
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.900"
                      _dark={{ color: "white" }}
                    >
                      {item.quantity}
                    </Text>
                    <IconButton
                      onClick={() => handleQuantityChange(item.id, 1)}
                      variant="ghost"
                      size="xs"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </IconButton>
                  </HStack>

                  {/* Remove Button */}
                  <IconButton
                    onClick={() => handleRemoveItem(item.id)}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: "red.500" }}
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Flex>
              ))}
            </VStack>

            {/* Right Column: Order Summary Card */}
            <Box
              bg="white"
              _dark={{ bg: "gray.900", borderColor: "gray.800" }}
              border="1px solid"
              borderColor="gray.200"
              rounded="2xl"
              p={6}
              boxShadow="sm"
            >
              <Heading
                fontSize="lg"
                fontWeight="bold"
                color="gray.900"
                _dark={{ color: "white" }}
                mb={6}
              >
                Order Summary
              </Heading>

              <VStack gap={4} alignItems="stretch" mb={6}>
                <Flex justifyContent="space-between">
                  <Text color="gray.500" _dark={{ color: "gray.400" }}>
                    Subtotal
                  </Text>
                  <Text
                    fontWeight="semibold"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    {formatNaira(subtotal)}
                  </Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text color="gray.500" _dark={{ color: "gray.400" }}>
                    Estimated Shipping
                  </Text>
                  <Text
                    fontWeight="semibold"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    {formatNaira(shipping)}
                  </Text>
                </Flex>
                <Box h="1px" bg="gray.100" _dark={{ bg: "gray.800" }} my={2} />
                <Flex justifyContent="space-between">
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    Total
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="yellow.500">
                    {formatNaira(total)}
                  </Text>
                </Flex>
              </VStack>

              <Button
                onClick={handleCheckout}
                w="full"
                h={12}
                bg="yellow.400"
                color="gray.900"
                _hover={{ bg: "yellow.500" }}
                fontWeight="bold"
                fontSize="md"
                rounded="xl"
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Cart;
