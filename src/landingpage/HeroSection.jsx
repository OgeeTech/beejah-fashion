import { Box, Heading, Text, Button, Flex, Image } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";
import heroImg from "../assets/hero.png";

const HeroSection = () => {
  return (
    <Box
      bg="gray.50"
      _dark={{ bg: "gray.900" }}
      py={{ base: 10, lg: 16 }}
      transition="background-color 0.2s"
      overflow="hidden"
    >
      <style>
        {`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-up {
            animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0; 
          }
        `}
      </style>

      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
        <Box
          display="grid"
          gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap={{ base: 8, lg: 12 }}
          alignItems="stretch"
        >
          {/* Left Side: Text Content */}
          <Flex
            direction="column"
            justifyContent="center"
            alignItems={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
            py={{ lg: 4 }} // Much smaller inner padding
          >
            <Heading
              className="animate-fade-up"
              style={{ animationDelay: "0.2s" }}
              as="h1"
              fontSize={{ base: "4xl", sm: "5xl", lg: "6xl" }}
              fontWeight="extrabold"
              lineHeight="1.1"
              letterSpacing="tight"
              color="gray.900"
              _dark={{ color: "white" }}
              mb={4} // Reduced margin
            >
              Tailored Excellence. <br />
              <Text as="span" color="yellow.400">
                Designed for You.
              </Text>
            </Heading>

            <Text
              className="animate-fade-up"
              style={{ animationDelay: "0.3s" }}
              fontSize={{ base: "md", md: "lg" }}
              color="gray.600"
              _dark={{ color: "gray.300" }}
              maxW="xl"
              mb={8} // Reduced margin
              lineHeight="relaxed"
            >
              Experience the finest Nigerian fashion. Browse our catalog of
              Aso-Ebi and bespoke native wear, submit your custom measurements
              online, and let our master tailors do the rest.
            </Text>

            {/* Call to Action Buttons */}
            <Flex
              className="animate-fade-up"
              style={{ animationDelay: "0.4s" }}
              direction={{ base: "column", sm: "row" }}
              gap={3} // Tighter button spacing
              w={{ base: "full", sm: "auto" }}
            >
              <Button
                w={{ base: "full", sm: "auto" }}
                h={12}
                px={6}
                rounded="full"
                fontSize="md"
                fontWeight="bold"
                bg="yellow.400"
                color="gray.900"
                _hover={{ bg: "yellow.500", transform: "translateY(-2px)" }}
                transition="all 0.2s"
                boxShadow="0 10px 25px -5px rgba(250,204,21,0.4)"
              >
                Shop Catalog
                <Box as="span" ml={2} display="flex" alignItems="center">
                  <ArrowRight size={18} />
                </Box>
              </Button>

              <Button
                w={{ base: "full", sm: "auto" }}
                h={12}
                px={6}
                rounded="full"
                fontSize="md"
                fontWeight="bold"
                variant="outline"
                borderWidth="2px"
                borderColor="gray.300"
                color="gray.900"
                _dark={{
                  borderColor: "gray.700",
                  color: "white",
                  _hover: { bg: "gray.800", borderColor: "gray.600" },
                }}
                _hover={{ bg: "gray.100" }}
                transition="all 0.2s"
              >
                Learn More
              </Button>
            </Flex>
          </Flex>

          {/* Right Side: Image */}
          <Box
            className="animate-fade-up"
            style={{ animationDelay: "0.5s" }}
            w="full"
            h="full"
            minH={{ base: "350px", lg: "100%" }}
            position="relative"
            overflow="hidden"
          >
            <Image
              src={heroImg}
              alt="Bespoke tailoring and fashion"
              objectFit="cover"
              w="500px"
              h="500px"
              position="absolute"
              top={0}
              left={0}
              transition="transform 0.5s ease"
              _hover={{ transform: "scale(1.03)" }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroSection;
