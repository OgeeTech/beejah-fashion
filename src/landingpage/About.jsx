import {
  Box,
  Heading,
  Text,
  Flex,
  Grid,
  VStack,
  Image,
} from "@chakra-ui/react";
import { Scissors, Ruler, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: <Scissors size={28} />,
      title: "Master Craftsmanship",
      description:
        "Our tailors have decades of experience perfecting the art of native wear, ensuring every stitch is flawless and durable.",
    },
    {
      icon: <Ruler size={28} />,
      title: "Precision Fit",
      description:
        "Submit your measurements online with our easy guide. We guarantee a bespoke fit that feels like it was sculpted just for you.",
    },
    {
      icon: <Award size={28} />,
      title: "Premium Fabrics",
      description:
        "From rich Senator materials to vibrant Ankara and luxurious lace for your Aso-Ebi, we source only the highest quality textiles.",
    },
  ];

  return (
    <Box
      bg="white"
      _dark={{ bg: "gray.900" }}
      py={{ base: 12, md: 20 }}
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
        {/* --- SECTION 1: Our Story (Image Left, Text Right) --- */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap={{ base: 10, lg: 16 }}
          alignItems="center"
          mb={{ base: 20, md: 32 }}
        >
          {/* Left Side: Image */}
          <Box
            className="animate-fade-up"
            style={{ animationDelay: "0.1s" }}
            w="full"
            h={{ base: "350px", lg: "500px" }}
            position="relative"
            rounded="2xl"
            overflow="hidden"
            boxShadow="xl"
            order={{ base: 2, lg: 1 }}
          >
            <Image
              src="https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?q=80&w=1000&auto=format&fit=crop"
              alt="Tailor working on fabric"
              objectFit="cover"
              w="full"
              h="full"
              position="absolute"
              top={0}
              left={0}
              transition="transform 0.5s ease"
              _hover={{ transform: "scale(1.03)" }}
            />
          </Box>

          {/* Right Side: Text */}
          <Flex
            className="animate-fade-up"
            style={{ animationDelay: "0.2s" }}
            direction="column"
            alignItems={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
            order={{ base: 1, lg: 2 }}
          >
            <Box
              display="inline-flex"
              alignItems="center"
              px={3}
              py={1.5}
              mb={4}
              rounded="full"
              bg="yellow.100"
              color="yellow.800"
              _dark={{ bg: "yellow.900", color: "yellow.200" }}
              fontWeight="bold"
              fontSize="sm"
            >
              Our Story
            </Box>

            <Heading
              as="h2"
              fontSize={{ base: "3xl", sm: "4xl", lg: "5xl" }}
              fontWeight="extrabold"
              lineHeight="1.2"
              letterSpacing="tight"
              color="gray.900"
              _dark={{ color: "white" }}
              mb={6}
            >
              Redefining the <br />
              <Text as="span" color="yellow.400">
                Owambe Experience.
              </Text>
            </Heading>

            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="gray.600"
              _dark={{ color: "gray.300" }}
              mb={4}
              lineHeight="relaxed"
            >
              NaijaBespoke was born out of a simple frustration: getting
              perfectly tailored native wear shouldn't require endless trips to
              the tailor or settling for mediocre fits.
            </Text>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="gray.600"
              _dark={{ color: "gray.300" }}
              lineHeight="relaxed"
            >
              We bridge the gap between Nigeria's rich sartorial heritage and
              modern convenience. Whether it's your wedding Aso-Ebi, a sharp
              Senator suit for the boardroom, or an elegant Agbada, we bring the
              finest tailors directly to your fingertips.
            </Text>
          </Flex>
        </Box>

        <Box
          textAlign="center"
          mb={12}
          className="animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Heading
            as="h3"
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            color="gray.900"
            _dark={{ color: "white" }}
            mb={4}
          >
            The NaijaBespoke Standard
          </Heading>
          <Text
            color="gray.600"
            _dark={{ color: "gray.400" }}
            maxW="2xl"
            mx="auto"
          >
            We don't just sew clothes; we craft confidence. Here is what makes
            our service different.
          </Text>
        </Box>

        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={8}
          className="animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          {values.map((item, index) => (
            <VStack
              key={index}
              bg="gray.50"
              _dark={{ bg: "gray.800" }}
              p={8}
              rounded="2xl"
              alignItems={{ base: "center", md: "flex-start" }}
              textAlign={{ base: "center", md: "left" }}
              transition="all 0.3s ease"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
            >
              <Flex
                w={14}
                h={14}
                rounded="xl"
                bg="yellow.400"
                color="gray.900"
                alignItems="center"
                justifyContent="center"
                mb={4}
              >
                {item.icon}
              </Flex>
              <Heading
                as="h4"
                fontSize="xl"
                fontWeight="bold"
                color="gray.900"
                _dark={{ color: "white" }}
                mb={2}
              >
                {item.title}
              </Heading>
              <Text
                color="gray.600"
                _dark={{ color: "gray.400" }}
                lineHeight="relaxed"
              >
                {item.description}
              </Text>
            </VStack>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default About;
