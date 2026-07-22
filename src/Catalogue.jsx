import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Grid,
  VStack,
  Heading,
  Text,
  Image,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { Heart } from "lucide-react";
import { toaster } from "./components/ui/toaster";
import Nav from "./Nav";
import coporate from "./assets/coporate.jpeg";
import mnative from "./assets/mnative.png";
const Catalog = ({ onNavigate }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mock Catalog Data grouped by categories
  const products = [
    {
      id: 1,
      name: "Classic White Senator",
      price: "₦45,000",
      category: "Men's Native Wear",
      image:
        "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Royal Blue Agbada",
      price: "₦120,000",
      category: "Men's Native Wear",
      image:
        "https://images.unsplash.com/photo-1611042553365-9b101441c135?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 6,
      name: "Modern Black Danshiki",
      price: "₦30,000",
      category: "Men's Native Wear",
      image:
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Abuja Executive Suit",
      price: "₦85,000",
      category: "Corporate Wear",
      image:
        "https://images.unsplash.com/photo-1594938298598-70f70f385c5b?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 4,
      name: "Luxury Ankara Two-Piece",
      price: "₦35,000",
      category: "Women's Wear",
      image:
        "https://images.unsplash.com/photo-1515347619362-e98860a4f526?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 5,
      name: "Aso-Ebi Lace Gown",
      price: "₦95,000",
      category: "Women's Wear",
      image:
        "https://images.unsplash.com/photo-1566958769312-82cef41d19ef?q=80&w=800&auto=format&fit=crop",
    },
  ];

  // Extract unique categories from the products array
  const categories = [...new Set(products.map((item) => item.category))];

  // Dynamic Banner Data
  const banners = [
    {
      id: 1,
      title: "Men's Native Wear",
      description:
        "Step out in cultural elegance. Discover our premium native collection.",
      bgColor: "yellow.100",
      darkBgColor: "yellow.900",
      buttonText: "Shop Men's Native",
      categoryTarget: "Men's Native Wear",
      image: mnative,
    },
    {
      id: 2,
      title: "Corporate Wear",
      description:
        "Command the room with our perfectly tailored executive suits.",
      bgColor: "blue.100",
      darkBgColor: "blue.900",
      buttonText: "Shop Corporate",
      categoryTarget: "Corporate Wear",
      image: "",
    },
    {
      id: 3,
      title: "Women's Wear",
      description:
        "Radiate beauty with our bespoke Ankara and luxury lace designs.",
      bgColor: "pink.100",
      darkBgColor: "pink.900",
      buttonText: "Shop Women's",
      categoryTarget: "Women's Wear",
      image: "",
    },
  ];

  // Auto-swipe logic for the banner (changes every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Smooth scroll to category section
  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(categoryId);
    if (element) {
      // Offset for the fixed navbar
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleRestrictedAction = (actionName) => {
    if (!isLoggedIn) {
      toaster.create({
        title: "Sign In Required",
        description: `You need to sign in to add items to your ${actionName}.`,
        type: "warning",
        duration: 4000,
      });
      return;
    }
    toaster.create({
      title: "Success",
      description: `Item added to your ${actionName}!`,
      type: "success",
      duration: 3000,
    });
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
        <Box
          w="full"
          h={{ base: "320px", md: "350px" }}
          rounded="2xl"
          overflow="hidden"
          position="relative"
          mb={12}
          boxShadow="md"
        >
          {banners.map((banner, index) => (
            <Flex
              key={banner.id}
              position="absolute"
              top={0}
              left={0}
              w="full"
              h="full"
              bg={banner.bgColor}
              _dark={{ bg: banner.darkBgColor }}
              opacity={currentSlide === index ? 1 : 0}
              transition="opacity 0.6s ease-in-out"
              zIndex={currentSlide === index ? 1 : 0}
              direction={{ base: "column-reverse", md: "row" }}
              alignItems="center"
              justifyContent="space-between"
              pointerEvents={currentSlide === index ? "auto" : "none"}
            >
              {/* Text Content */}
              <VStack
                alignItems={{ base: "center", md: "flex-start" }}
                textAlign={{ base: "center", md: "left" }}
                p={{ base: 6, md: 12 }}
                w={{ base: "full", md: "50%" }}
                gap={4}
              >
                <Heading
                  as="h2"
                  color="gray.900"
                  _dark={{ color: "white" }}
                  fontSize={{ base: "2xl", md: "4xl" }}
                  fontWeight="extrabold"
                >
                  {banner.title}
                </Heading>
                <Text
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                  fontSize={{ base: "sm", md: "md" }}
                  maxW="sm"
                >
                  {banner.description}
                </Text>
                <Button
                  onClick={() => scrollToCategory(banner.categoryTarget)}
                  bg="gray.900"
                  color="white"
                  _dark={{ bg: "white", color: "gray.900" }}
                  _hover={{ bg: "gray.700", _dark: { bg: "gray.200" } }}
                  size="lg"
                  rounded="full"
                  mt={2}
                >
                  {banner.buttonText}
                </Button>
              </VStack>

              {/* Banner Image */}
              <Box
                w={{ base: "full", md: "50%" }}
                h={{ base: "150px", md: "full" }}
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  w="full"
                  h="full"
                  objectFit="cover"
                  objectPosition="top"
                />
              </Box>
            </Flex>
          ))}

          {/* Dots Indicator */}
          <Flex
            position="absolute"
            bottom={4}
            left={0}
            right={0}
            justifyContent="center"
            gap={2}
            zIndex={10}
          >
            {banners.map((_, index) => (
              <Box
                key={index}
                as="button"
                onClick={() => setCurrentSlide(index)}
                w={currentSlide === index ? 6 : 2}
                h={2}
                bg={currentSlide === index ? "gray.900" : "gray.400"}
                _dark={{ bg: currentSlide === index ? "white" : "gray.500" }}
                rounded="full"
                transition="all 0.3s ease"
              />
            ))}
          </Flex>
        </Box>

        {/* GROUPED PRODUCT CATEGORIES                 */}

        {categories.map((category) => (
          <Box key={category} id={category} mb={16}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              mb={6}
              borderBottom="2px solid"
              borderColor="gray.200"
              _dark={{ borderColor: "gray.800" }}
              pb={2}
            >
              <Heading
                as="h2"
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                color="gray.900"
                _dark={{ color: "white" }}
              >
                {category}
              </Heading>
              <Button
                variant="ghost"
                color="yellow.500"
                _hover={{ bg: "yellow.50", _dark: { bg: "gray.800" } }}
                size="sm"
              >
                View All
              </Button>
            </Flex>

            {/* Product Grid */}
            <Grid
              templateColumns={{
                base: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={6}
            >
              {products
                .filter((item) => item.category === category)
                .map((item) => (
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
                      <IconButton
                        onClick={() => handleRestrictedAction("favorites")}
                        position="absolute"
                        top={3}
                        right={3}
                        bg="white"
                        color="gray.400"
                        _hover={{ color: "red.500" }}
                        _dark={{ bg: "gray.800" }}
                        rounded="full"
                        size="sm"
                        boxShadow="md"
                      >
                        <Heart size={18} />
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
                      <Text
                        fontSize="md"
                        fontWeight="semibold"
                        color="yellow.500"
                      >
                        {item.price}
                      </Text>
                      <Button
                        onClick={() => handleRestrictedAction("cart")}
                        w="full"
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        _dark={{ borderColor: "gray.700", color: "white" }}
                        _hover={{
                          bg: "yellow.400",
                          borderColor: "yellow.400",
                          color: "gray.900",
                        }}
                        fontWeight="bold"
                      >
                        Add to Cart
                      </Button>
                    </VStack>
                  </Box>
                ))}
            </Grid>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Catalog;
