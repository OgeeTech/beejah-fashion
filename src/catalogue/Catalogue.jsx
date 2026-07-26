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
import {
  Heart,
  X,
  ShoppingBag,
  ChevronRight,
  Truck,
  Headset,
  RefreshCw,
  Lock,
  ChevronUp,
} from "lucide-react";
import { toaster } from "../components/ui/toaster";
import Nav from "./Nav";

// --- BANNER IMPORTS ---
import bg1 from "../assets/bg1.png";
import bg2 from "../assets/bg2.png";
import bg3 from "../assets/bg3.png";
import bg4 from "../assets/bg4.png";
import bg5 from "../assets/bg5.png";

// --- FIREBASE IMPORTS ---
import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Catalog = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- LIVE DATA STATES ---
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- SEARCH AND SORT STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");

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

  // --- UI ENHANCEMENT STATES ---
  const [activeCategory, setActiveCategory] = useState("all");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // --- RANDOM HERO COLORS STATE ---
  const [heroColors, setHeroColors] = useState([
    { light: "yellow.100", dark: "yellow.900" },
    { light: "gray.100", dark: "gray.900" },
  ]);

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    let unsubFavs = () => {};

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        const qFav = query(
          collection(db, "favoriteItems"),
          where("userId", "==", user.uid),
        );
        unsubFavs = onSnapshot(qFav, (snapshot) => {
          const favData = snapshot.docs.map((doc) => ({
            id: doc.id,
            productId: doc.data().productId,
          }));
          setFavorites(favData);
        });
      } else {
        setFavorites([]);
        unsubFavs();
      }
    });

    const productsRef = collection(db, "products");
    const dbUnsubscribe = onSnapshot(productsRef, (snapshot) => {
      const fetchedProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(fetchedProducts);
      setIsLoading(false);
    });

    return () => {
      authUnsubscribe();
      dbUnsubscribe();
      unsubFavs();
    };
  }, []);

  // --- GENERATE RANDOM COLORS ON LOAD ---
  useEffect(() => {
    const colorPairs = [
      { light: "yellow.100", dark: "yellow.900" },
      { light: "blue.100", dark: "blue.900" },
      { light: "orange.100", dark: "orange.900" },
      { light: "green.100", dark: "green.900" },
      { light: "purple.100", dark: "purple.900" },
      { light: "pink.100", dark: "pink.900" },
      { light: "cyan.100", dark: "cyan.900" },
    ];
    // Shuffle and pick 2 distinct random colors for the hero banners
    const shuffled = [...colorPairs].sort(() => 0.5 - Math.random());
    setHeroColors([shuffled[0], shuffled[1]]);
  }, []);

  // --- SCROLL TRACKING FOR STICKY TABS & BACK-TO-TOP ---
  const categories = [...new Set(products.map((item) => item.category))];

  useEffect(() => {
    const handleScroll = () => {
      // Back-to-top visibility
      setShowScrollTop(window.scrollY > 600);

      // Highlight active category tab based on scroll position
      categories.forEach((cat) => {
        const el = document.getElementById(cat);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom > 150) {
            setActiveCategory(cat);
          }
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const formatNaira = (amount) => `₦${Number(amount).toLocaleString()}`;

  // --- DATABASE WRITES ---
  const toggleFavorite = async (product) => {
    if (!currentUser) {
      toaster.create({
        title: "Sign In Required",
        description: "Log in to save favorites.",
        type: "warning",
      });
      return;
    }

    const existingFav = favorites.find((f) => f.productId === product.id);

    try {
      if (existingFav) {
        await deleteDoc(doc(db, "favoriteItems", existingFav.id));
        toaster.create({
          title: "Removed from Saved",
          type: "info",
          duration: 2000,
        });
      } else {
        await addDoc(collection(db, "favoriteItems"), {
          userId: currentUser.uid,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          addedAt: new Date().toISOString(),
        });
        toaster.create({
          title: "Saved to Favorites",
          type: "success",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toaster.create({
        title: "Error",
        description: "Could not update favorites.",
        type: "error",
      });
    }
  };

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

      toaster.create({
        title: "Added to Cart",
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

  // --- FILTER AND SORT ---
  const filteredAndSortedProducts = products
    .filter((item) => {
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });

  // --- EXPANDED BANNER DATA (5 Slides) ---
  const banners = [
    {
      id: 1,
      title: "WEAR YOUR CONFIDENCE",
      description:
        "Modern and stylish bespoke outfits tailored to perfection. Perfect for every occasion.",
      categoryTarget: "Men's Native Wear",
      image: bg1,
    },
    {
      id: 2,
      title: "EXECUTIVE ELEGANCE",
      description:
        "Command the room with our perfectly tailored executive suits and corporate wear.",
      categoryTarget: "Corporate Wear",
      image: bg2,
    },
    {
      id: 3,
      title: "BESPOKE BEAUTY",
      description:
        "Radiate grace with custom women's wear designed exclusively for your silhouette.",
      categoryTarget: "Women's Wear",
      image: bg3,
    },
    {
      id: 4,
      title: "CULTURAL HERITAGE",
      description:
        "Embrace tradition with our premium quality native fabrics and detailed embroidery.",
      categoryTarget: "Men's Native Wear",
      image: bg4,
    },
    {
      id: 5,
      title: "TAILORED PERFECTION",
      description:
        "Experience the ultimate comfort and style with our precision cutting and sewing.",
      categoryTarget: "Corporate Wear",
      image: bg5,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(categoryId);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveCategory(categoryId);
    }
  };

  const handleAddToCartClick = (product) => {
    if (!currentUser) {
      toaster.create({
        title: "Sign In Required",
        description: "Log in to place custom tailoring orders.",
        type: "warning",
      });
      return;
    }
    setSelectedProduct(product);
    setFabricColor("");
    setIsModalOpen(true);
  };

  const isMensOutfit =
    selectedProduct?.category === "Men's Native Wear" ||
    selectedProduct?.category === "Corporate Wear";

  return (
    <Box minH="100vh" bg="#FAF9F6" _dark={{ bg: "gray.950" }}>
      <Nav
        onNavigate={onNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Box
        maxW="7xl"
        mx="auto"
        px={{ base: 4, sm: 6, lg: 8 }}
        py={8}
        pb={{ base: 24, md: 12 }}
      >
        {/* HERO BANNERS (Split Screen Layout - FULL BACKGROUND COLOR) */}
        <Box
          w="full"
          h={{ base: "650px", md: "450px", lg: "500px" }}
          rounded="none"
          overflow="hidden"
          position="relative"
          mb={16}
        >
          {banners.map((banner, index) => (
            <Flex
              key={banner.id}
              position="absolute"
              top={0}
              left={0}
              w="full"
              h="full"
              direction={{ base: "column-reverse", md: "row" }}
              opacity={currentSlide === index ? 1 : 0}
              transition="all 0.8s ease-in-out"
              zIndex={currentSlide === index ? 1 : 0}
              // FULL WIDTH BACKGROUND MOVED HERE
              bg={heroColors[index % heroColors.length]?.light}
              _dark={{ bg: heroColors[index % heroColors.length]?.dark }}
            >
              {/* TEXT SIDE (Left) - Transparent to let full background show */}
              <Flex
                flex={{ base: "none", md: 1 }}
                w={{ base: "full", md: "50%" }}
                h={{ base: "50%", md: "full" }}
                alignItems="center"
                justifyContent={{ base: "center", md: "flex-start" }}
                px={{ base: 6, md: 12, lg: 16 }}
                py={8}
                bg="transparent"
              >
                <VStack
                  align={{ base: "center", md: "flex-start" }}
                  textAlign={{ base: "center", md: "left" }}
                  gap={5}
                  maxW="lg"
                >
                  <Heading
                    as="h2"
                    color="gray.900"
                    _dark={{ color: "white" }}
                    fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                    fontWeight="extrabold"
                    letterSpacing="tight"
                    lineHeight="1.1"
                  >
                    {banner.title}
                  </Heading>
                  <Text
                    color="gray.800"
                    _dark={{ color: "gray.100" }}
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="medium"
                  >
                    {banner.description}
                  </Text>

                  {/* Clean, contrasting buttons */}
                  <HStack
                    gap={4}
                    mt={2}
                    flexWrap="wrap"
                    justifyContent={{ base: "center", md: "flex-start" }}
                  >
                    <Button
                      onClick={() => scrollToCategory(banner.categoryTarget)}
                      bg="gray.900"
                      color="white"
                      _dark={{ bg: "white", color: "gray.900" }}
                      _hover={{ bg: "gray.700", _dark: { bg: "gray.200" } }}
                      size="lg"
                      rounded="full"
                      px={8}
                      fontWeight="bold"
                    >
                      Shop Now
                    </Button>
                    <Button
                      onClick={() => scrollToCategory(banner.categoryTarget)}
                      variant="outline"
                      borderColor="gray.900"
                      color="gray.900"
                      _dark={{ borderColor: "white", color: "white" }}
                      _hover={{
                        bg: "blackAlpha.100",
                        _dark: { bg: "whiteAlpha.200" },
                      }}
                      size="lg"
                      rounded="full"
                      px={8}
                      fontWeight="bold"
                    >
                      Explore Collection
                    </Button>
                  </HStack>
                </VStack>
              </Flex>

              {/* IMAGE SIDE (Right) - Transparent PNG on top of the background */}
              <Box
                flex={{ base: "none", md: 1 }}
                w={{ base: "full", md: "50%" }}
                h={{ base: "50%", md: "full" }}
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  w="full"
                  h="full"
                  objectFit="contain" // Changed to contain for PNG cutouts
                  objectPosition="bottom" // Anchors the models to the bottom
                />
              </Box>
            </Flex>
          ))}
        </Box>

        {/* STICKY CATEGORY TABS */}
        <Box
          position="sticky"
          top="70px"
          zIndex={10}
          bg="#FAF9F6"
          _dark={{ bg: "gray.950" }}
          pt={4}
          pb={2}
          mb={8}
        >
          <HStack gap={2} overflowX="auto" flexWrap="nowrap" spacing={2}>
            <Button
              size="sm"
              rounded="full"
              variant={activeCategory === "all" ? "solid" : "ghost"}
              colorScheme="yellow"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setActiveCategory("all");
              }}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                rounded="full"
                variant={activeCategory === cat ? "solid" : "ghost"}
                colorScheme="yellow"
                onClick={() => scrollToCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </HStack>
        </Box>

        {/* SORT & RESULTS HEADER */}
        <Flex
          justifyContent="space-between"
          alignItems="center"
          mb={8}
          flexWrap="wrap"
          gap={4}
        >
          <Heading
            as="h2"
            fontSize="2xl"
            color="gray.900"
            _dark={{ color: "white" }}
          >
            Latest Products
          </Heading>

          <HStack>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color="gray.600"
              _dark={{ color: "gray.300" }}
            >
              Sort by:
            </Text>
            <Box
              as="select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              w="180px"
              p={2}
              rounded="md"
              border="1px solid"
              borderColor="gray.200"
              bg="transparent"
              color="gray.900"
              _dark={{
                borderColor: "gray.700",
                color: "white",
              }}
              outline="none"
              fontSize="sm"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </Box>
          </HStack>
        </Flex>

        {/* SPINNER & CONTENT */}
        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" py={20}>
            <Spinner size="xl" color="yellow.500" />
            <Text ml={4} fontWeight="bold" color="gray.600">
              Loading Collection...
            </Text>
          </Flex>
        ) : filteredAndSortedProducts.length === 0 ? (
          <Flex
            direction="column"
            alignItems="center"
            py={20}
            textAlign="center"
          >
            <Box
              bg="gray.200"
              _dark={{ bg: "gray.800" }}
              p={6}
              rounded="full"
              mb={6}
            >
              <X size={48} color="gray" />
            </Box>
            <Heading
              size="md"
              mb={2}
              color="gray.600"
              _dark={{ color: "gray.300" }}
            >
              No matches found
            </Heading>
            <Text color="gray.500">Try adjusting your search or filters.</Text>
            <Button
              mt={4}
              variant="outline"
              onClick={() => setSearchQuery("")}
              _dark={{ color: "white" }}
            >
              Clear Search
            </Button>
          </Flex>
        ) : (
          categories.map((category) => (
            <Box key={category} id={category} mb={16}>
              {searchQuery && (
                <Heading
                  as="h3"
                  fontSize="xl"
                  mb={6}
                  color="gray.800"
                  _dark={{ color: "gray.200" }}
                >
                  {category}
                </Heading>
              )}

              <Grid
                templateColumns={{
                  base: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={{ base: 6, md: 8 }}
              >
                {filteredAndSortedProducts
                  .filter((item) => item.category === category)
                  .map((item) => {
                    const isFavorited = favorites.some(
                      (f) => f.productId === item.id,
                    );

                    return (
                      <Box
                        key={item.id}
                        role="group"
                        cursor="pointer"
                        onClick={() => handleAddToCartClick(item)}
                      >
                        {/* Image Container */}
                        <Box
                          position="relative"
                          h={{ base: "320px", md: "380px" }}
                          bg="#EAEAEA"
                          _dark={{ bg: "gray.800" }}
                          rounded="2xl"
                          p={2}
                          overflow="hidden"
                          transition="all 0.3s ease"
                          _groupHover={{ boxShadow: "md" }}
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            w="full"
                            h="full"
                            objectFit="cover"
                            rounded="xl"
                            transition="transform 0.5s ease"
                            _groupHover={{ transform: "scale(1.03)" }}
                          />

                          {/* Quick View Overlay on Hover */}
                          <Flex
                            position="absolute"
                            inset={0}
                            bg="blackAlpha.40"
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            transition="opacity 0.3s ease"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Button
                              size="sm"
                              colorScheme="yellow"
                              rounded="full"
                              leftIcon={<ShoppingBag size={16} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCartClick(item);
                              }}
                            >
                              Customize & Add
                            </Button>
                          </Flex>

                          {/* Favorite Heart */}
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item);
                            }}
                            position="absolute"
                            top={4}
                            right={4}
                            bg="white"
                            color={isFavorited ? "red.500" : "gray.400"}
                            _hover={{
                              color: "red.500",
                              transform: "scale(1.1)",
                            }}
                            _dark={{
                              bg: "gray.900",
                              color: isFavorited ? "red.400" : "gray.500",
                            }}
                            rounded="full"
                            size="sm"
                            boxShadow="sm"
                            aria-label="Favorite"
                            transition="all 0.2s"
                          >
                            <Heart
                              size={16}
                              fill={isFavorited ? "currentColor" : "none"}
                            />
                          </IconButton>
                        </Box>

                        {/* Product Details */}
                        <VStack align="start" mt={4} gap={1} px={1}>
                          <Heading
                            as="h3"
                            fontSize="md"
                            fontWeight="bold"
                            color="gray.800"
                            _dark={{ color: "white" }}
                            noOfLines={1}
                          >
                            {item.name}
                          </Heading>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.500"
                            _dark={{ color: "gray.400" }}
                          >
                            {formatNaira(item.price)}
                          </Text>

                          <HStack
                            as="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCartClick(item);
                            }}
                            mt={1}
                            color="gray.500"
                            _hover={{ color: "yellow.600" }}
                            _dark={{
                              color: "gray.400",
                              _hover: { color: "yellow.400" },
                            }}
                            transition="color 0.2s"
                          >
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              textDecoration="underline"
                              textUnderlineOffset="4px"
                            >
                              Add to Cart
                            </Text>
                            <ChevronRight size={14} />
                          </HStack>
                        </VStack>
                      </Box>
                    );
                  })}
              </Grid>
            </Box>
          ))
        )}

        {/* TRUST BADGES */}
        {!isLoading && filteredAndSortedProducts.length > 0 && (
          <Box
            mt={20}
            pt={16}
            pb={8}
            borderTop="1px solid"
            borderColor="gray.200"
            _dark={{ borderColor: "gray.800" }}
          >
            <Grid
              templateColumns={{
                base: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              }}
              gap={8}
            >
              <VStack textAlign="center" gap={3}>
                <Box color="yellow.600" _dark={{ color: "yellow.400" }}>
                  <Truck size={32} strokeWidth={1.5} />
                </Box>
                <Heading size="sm" color="gray.800" _dark={{ color: "white" }}>
                  Fast Delivery
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Step into the realm of style with our unbeatable bespoke
                  outfits.
                </Text>
              </VStack>
              <VStack textAlign="center" gap={3}>
                <Box color="yellow.600" _dark={{ color: "yellow.400" }}>
                  <Headset size={32} strokeWidth={1.5} />
                </Box>
                <Heading size="sm" color="gray.800" _dark={{ color: "white" }}>
                  24/7 Support
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Our tailoring team is always available to answer your sizing
                  questions.
                </Text>
              </VStack>
              <VStack textAlign="center" gap={3}>
                <Box color="yellow.600" _dark={{ color: "yellow.400" }}>
                  <RefreshCw size={32} strokeWidth={1.5} />
                </Box>
                <Heading size="sm" color="gray.800" _dark={{ color: "white" }}>
                  Perfect Fit Promise
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  We guarantee alterations if your custom measurements aren't
                  perfect.
                </Text>
              </VStack>
              <VStack textAlign="center" gap={3}>
                <Box color="yellow.600" _dark={{ color: "yellow.400" }}>
                  <Lock size={32} strokeWidth={1.5} />
                </Box>
                <Heading size="sm" color="gray.800" _dark={{ color: "white" }}>
                  Secure Checkout
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  100% secure payments powered by Paystack infrastructure.
                </Text>
              </VStack>
            </Grid>
          </Box>
        )}

        {/* BACK TO TOP BUTTON */}
        {showScrollTop && (
          <IconButton
            position="fixed"
            bottom={8}
            right={8}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            bg="yellow.400"
            color="gray.900"
            _hover={{ bg: "yellow.500" }}
            rounded="full"
            size="lg"
            boxShadow="lg"
            aria-label="Back to top"
          >
            <ChevronUp size={24} />
          </IconButton>
        )}
      </Box>

      {/* MEASUREMENTS MODAL */}
      {isModalOpen && selectedProduct && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="blackAlpha.600"
          backdropFilter="blur(4px)"
          zIndex={100}
          alignItems="center"
          justifyContent="center"
          px={4}
        >
          <Box
            bg="white"
            _dark={{ bg: "gray.900" }}
            p={8}
            rounded="3xl"
            maxW="md"
            w="full"
            boxShadow="2xl"
            maxH="90vh"
            overflowY="auto"
          >
            <Flex align="center" mb={6} justifyContent="space-between">
              <Flex align="center">
                <Box
                  bg="yellow.100"
                  p={3}
                  rounded="full"
                  color="yellow.600"
                  mr={4}
                >
                  <ShoppingBag size={24} />
                </Box>
                <Box>
                  <Heading
                    as="h3"
                    size="md"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    Tailor {selectedProduct.name}
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    Enter your measurements for a perfect fit
                  </Text>
                </Box>
              </Flex>
              <IconButton variant="ghost" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </IconButton>
            </Flex>

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
                  size="lg"
                  rounded="xl"
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
                  size="lg"
                  rounded="xl"
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
                  size="lg"
                  rounded="xl"
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
                    size="lg"
                    rounded="xl"
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
                    size="lg"
                    rounded="xl"
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
                  size="lg"
                  rounded="xl"
                />
              </Box>
            </Grid>

            <Box mb={6}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                mb={3}
                color="gray.700"
                _dark={{ color: "gray.300" }}
              >
                Choose Fabric Color
              </Text>
              <HStack gap={3} flexWrap="wrap">
                {selectedProduct.colors && selectedProduct.colors.length > 0 ? (
                  selectedProduct.colors.map((color) => (
                    <Box
                      key={color}
                      px={4}
                      py={2}
                      rounded="xl"
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
                      color={fabricColor === color ? "yellow.600" : "gray.700"}
                      _dark={{
                        color:
                          fabricColor === color ? "yellow.200" : "gray.200",
                      }}
                      transition="all 0.2s"
                      _hover={{ borderColor: "yellow.400" }}
                    >
                      {color}
                    </Box>
                  ))
                ) : (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    Default to image style
                  </Text>
                )}
              </HStack>
            </Box>

            <Button
              w="full"
              bg="yellow.400"
              color="gray.900"
              _hover={{ bg: "yellow.500" }}
              onClick={submitCustomOrder}
              fontWeight="bold"
              size="lg"
              rounded="xl"
              isLoading={isSavingOrder}
              loadingText="Adding to Cart..."
            >
              Confirm Custom Order
            </Button>
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default Catalog;
