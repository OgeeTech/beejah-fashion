import { useState, useEffect } from "react";
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
  Input,
  Spinner,
} from "@chakra-ui/react";
import { Trash2, Heart } from "lucide-react";
import { toaster } from "../components/ui/toaster";
import Nav from "./Nav";

// --- FIREBASE IMPORTS ---
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  addDoc,
  getDoc,
} from "firebase/firestore";

const Favorites = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedItems, setSavedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const [measurements, setMeasurements] = useState({
    chestOrBust: "",
    waist: "",
    hips: "",
    shoulder: "",
    sleeve: "",
    length: "",
  });
  const [fabricColor, setFabricColor] = useState("");

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    let unsubFavs = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setCurrentUser(user);

      if (user) {
        const qFavs = query(
          collection(db, "favoriteItems"),
          where("userId", "==", user.uid),
        );
        unsubFavs = onSnapshot(qFavs, (snapshot) => {
          const fetchedFavs = snapshot.docs.map((doc) => ({
            id: doc.id, // This is the ID of the favorite document itself
            ...doc.data(),
          }));
          setSavedItems(fetchedFavs);
          setIsLoading(false);
        });
      } else {
        setSavedItems([]);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubFavs();
    };
  }, []);

  const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

  // --- DELETE FAVORITE ---
  const handleDelete = async (favoriteId) => {
    try {
      await deleteDoc(doc(db, "favoriteItems", favoriteId));
      toaster.create({
        title: "Removed",
        description: "Item removed from your favorites.",
        type: "info",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting favorite:", error);
      toaster.create({
        title: "Error",
        description: "Failed to remove item.",
        type: "error",
      });
    }
  };

  // --- SMART MOVE TO CART (Fetches product details to show modal) ---
  const handleMoveToCartClick = async (favoriteItem) => {
    setIsLoading(true); // Show spinner while fetching product data
    try {
      // Fetch the full product data so we have the category and colors for the modal!
      const productRef = doc(db, "products", favoriteItem.productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        setSelectedProduct({
          id: productSnap.id,
          favoriteId: favoriteItem.id, // Keep track of the favorite ID so we can delete it later
          ...productSnap.data(),
        });
        setFabricColor("");
        setIsModalOpen(true);
      } else {
        toaster.create({
          title: "Unavailable",
          description: "This product is no longer in the catalog.",
          type: "warning",
        });
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- SUBMIT CUSTOM ORDER TO CART ---
  const submitCustomOrder = async () => {
    if (!measurements.waist || !fabricColor) {
      toaster.create({
        title: "Missing Details",
        description:
          "Please provide your basic measurements and select a color.",
        type: "error",
      });
      return;
    }

    setIsSavingOrder(true);

    try {
      // 1. ADD TO CART
      await addDoc(collection(db, "cartItems"), {
        userId: currentUser.uid,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.image,
        category: selectedProduct.category,
        measurements: measurements,
        color: fabricColor,
        addedAt: new Date().toISOString(),
      });

      // 2. DELETE FROM FAVORITES
      await deleteDoc(doc(db, "favoriteItems", selectedProduct.favoriteId));

      toaster.create({
        title: "Moved to Cart",
        description: `Custom tailored ${selectedProduct.name} saved!`,
        type: "success",
      });

      setIsModalOpen(false);
      setMeasurements({
        chestOrBust: "",
        waist: "",
        hips: "",
        shoulder: "",
        sleeve: "",
        length: "",
      });
      setFabricColor("");

      // Route immediately to the cart to checkout
      onNavigate("cart");
    } catch (error) {
      console.error("Error saving order:", error);
      toaster.create({
        title: "Error",
        description: "Failed to add to cart.",
        type: "error",
      });
    } finally {
      setIsSavingOrder(false);
    }
  };

  const isMensOutfit =
    selectedProduct?.category === "Men's Native Wear" ||
    selectedProduct?.category === "Corporate Wear";

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.950" }}>
      {/* Nav is smart now and handles its own badges! */}
      <Nav onNavigate={onNavigate} />

      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
        <Heading
          as="h2"
          fontSize="2xl"
          mb={6}
          color="gray.900"
          _dark={{ color: "white" }}
        >
          Your Saved Items
        </Heading>

        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" py={20}>
            <Spinner size="xl" color="yellow.500" />
          </Flex>
        ) : !isLoggedIn ? (
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
              Your wishlist is locked
            </Heading>
            <Text
              color="gray.500"
              _dark={{ color: "gray.400" }}
              maxW="md"
              mb={8}
            >
              Sign in to save your favorite bespoke styles and access them
              across all your devices.
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
              Sign In to View Favorites
            </Button>
          </Flex>
        ) : savedItems.length === 0 ? (
          <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            py={20}
          >
            <Heart size={64} color="gray" />
            <Text mt={4} fontSize="lg" color="gray.500">
              You have no saved items yet.
            </Text>
            <Button
              mt={6}
              bg="yellow.400"
              color="gray.900"
              _hover={{ bg: "yellow.500" }}
              onClick={() => onNavigate("catalog")}
            >
              Explore Catalog
            </Button>
          </Flex>
        ) : (
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
          >
            {savedItems.map((item) => (
              <Box
                key={item.id}
                bg="white"
                _dark={{ bg: "gray.900", borderColor: "gray.800" }}
                border="1px solid"
                borderColor="gray.200"
                rounded="2xl"
                overflow="hidden"
                boxShadow="sm"
              >
                <Box position="relative" h="250px">
                  <Image
                    src={item.image}
                    alt={item.name}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                  <IconButton
                    onClick={() => handleDelete(item.id)}
                    position="absolute"
                    top={3}
                    right={3}
                    bg="white"
                    color="red.500"
                    _hover={{ bg: "red.50" }}
                    _dark={{ bg: "gray.800", _hover: { bg: "red.900/40" } }}
                    rounded="full"
                    size="sm"
                    boxShadow="md"
                  >
                    <Trash2 size={18} />
                  </IconButton>
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
                    {formatNaira(item.price)}
                  </Text>

                  <Button
                    onClick={() => handleMoveToCartClick(item)}
                    w="full"
                    bg="gray.900"
                    color="white"
                    _hover={{ bg: "gray.700" }}
                    _dark={{
                      bg: "white",
                      color: "gray.900",
                      _hover: { bg: "gray.200" },
                    }}
                    fontWeight="bold"
                  >
                    Move to Cart
                  </Button>
                </VStack>
              </Box>
            ))}
          </Grid>
        )}
      </Box>

      {/* DYNAMIC MEASUREMENTS MODAL (Same as Catalog) */}
      {isModalOpen && selectedProduct && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="blackAlpha.600"
          zIndex={100}
          alignItems="center"
          justifyContent="center"
          px={4}
        >
          <Box
            bg="white"
            _dark={{ bg: "gray.900" }}
            p={6}
            rounded="2xl"
            maxW="lg"
            w="full"
            boxShadow="2xl"
          >
            <Heading
              as="h3"
              size="lg"
              mb={2}
              color="gray.900"
              _dark={{ color: "white" }}
            >
              Tailoring Specifications
            </Heading>
            <Text
              color="gray.600"
              _dark={{ color: "gray.400" }}
              mb={6}
              fontSize="sm"
            >
              Provide your exact body measurements for the{" "}
              {selectedProduct.name}.
            </Text>

            <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={6}>
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  mb={1}
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                >
                  {isMensOutfit ? "Chest (in)" : "Bust (in)"}
                </Text>
                <Input
                  placeholder="e.g. 40"
                  value={measurements.chestOrBust}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      chestOrBust: e.target.value,
                    })
                  }
                />
              </Box>
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  mb={1}
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                >
                  Waist (in)
                </Text>
                <Input
                  placeholder="e.g. 34"
                  value={measurements.waist}
                  onChange={(e) =>
                    setMeasurements({ ...measurements, waist: e.target.value })
                  }
                />
              </Box>
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  mb={1}
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                >
                  Shoulder (in)
                </Text>
                <Input
                  placeholder="e.g. 18"
                  value={measurements.shoulder}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      shoulder: e.target.value,
                    })
                  }
                />
              </Box>
              {isMensOutfit ? (
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    mb={1}
                    color="gray.700"
                    _dark={{ color: "gray.300" }}
                  >
                    Sleeve Length (in)
                  </Text>
                  <Input
                    placeholder="e.g. 24"
                    value={measurements.sleeve}
                    onChange={(e) =>
                      setMeasurements({
                        ...measurements,
                        sleeve: e.target.value,
                      })
                    }
                  />
                </Box>
              ) : (
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    mb={1}
                    color="gray.700"
                    _dark={{ color: "gray.300" }}
                  >
                    Hips (in)
                  </Text>
                  <Input
                    placeholder="e.g. 42"
                    value={measurements.hips}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, hips: e.target.value })
                    }
                  />
                </Box>
              )}
              <Box gridColumn="span 2">
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  mb={1}
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                >
                  {isMensOutfit ? "Trouser Length (in)" : "Gown Length (in)"}
                </Text>
                <Input
                  placeholder="e.g. 42"
                  value={measurements.length}
                  onChange={(e) =>
                    setMeasurements({ ...measurements, length: e.target.value })
                  }
                />
              </Box>
            </Grid>

            <Box mb={8}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                mb={3}
                color="gray.700"
                _dark={{ color: "gray.300" }}
              >
                Select Fabric Color: {fabricColor || "None selected"}
              </Text>
              <HStack gap={3} flexWrap="wrap">
                {selectedProduct.colors && selectedProduct.colors.length > 0 ? (
                  selectedProduct.colors.map((color) => (
                    <Box
                      key={color}
                      px={4}
                      py={2}
                      rounded="lg"
                      border="2px solid"
                      borderColor={
                        fabricColor === color ? "yellow.500" : "gray.200"
                      }
                      bg={fabricColor === color ? "yellow.50" : "transparent"}
                      _dark={{
                        bg:
                          fabricColor === color ? "yellow.900" : "transparent",
                        borderColor:
                          fabricColor === color ? "yellow.500" : "gray.600",
                      }}
                      cursor="pointer"
                      onClick={() => setFabricColor(color)}
                      fontWeight="bold"
                      fontSize="sm"
                      color="gray.700"
                      _dark={{ color: "gray.200" }}
                      transition="all 0.2s"
                      _hover={{ borderColor: "yellow.400" }}
                    >
                      {color}
                    </Box>
                  ))
                ) : (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    No specific colors listed. Will default to image style.
                  </Text>
                )}
              </HStack>
            </Box>

            <HStack justifyContent="flex-end" gap={3}>
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={isSavingOrder}
              >
                Cancel
              </Button>
              <Button
                bg="yellow.400"
                color="gray.900"
                _hover={{ bg: "yellow.500" }}
                onClick={submitCustomOrder}
                fontWeight="bold"
                loading={isSavingOrder}
                loadingText="Moving..."
              >
                Confirm Custom Order
              </Button>
            </HStack>
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default Favorites;
