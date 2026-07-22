import { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
} from "@chakra-ui/react";
import { Scissors, ArrowLeft } from "lucide-react";
import { toaster } from "./components/ui/toaster";

const SignUp = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toaster.create({
        title: "Passwords do not match",
        description: "Please ensure both passwords are the same.",
        type: "error",
        duration: 4000,
      });
      return;
    }

    if (password.length < 8) {
      toaster.create({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        type: "warning",
        duration: 4000,
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      toaster.create({
        title: "Account Created!",
        description: `Welcome to BeeJah Stiches, ${name}!`,
        type: "success",
        duration: 3000,
      });

      onNavigate("signin");
    }, 1500);
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      _dark={{ bg: "gray.950" }}
      py={12}
      px={4}
      position="relative" // Required for absolute positioning
    >
      {/* --- BACK TO HOME BUTTON --- */}
      <Box
        position="absolute"
        top={{ base: 4, md: 8 }}
        left={{ base: 4, md: 8 }}
      >
        <Button
          onClick={() => onNavigate("home")}
          variant="ghost"
          color="gray.500"
          _dark={{ color: "gray.400" }}
          _hover={{
            bg: "gray.200",
            color: "gray.900",
            _dark: { bg: "gray.800", color: "white" },
          }}
          fontWeight="medium"
          px={3}
        >
          <ArrowLeft size={18} />
          Back to Home
        </Button>
      </Box>

      <Box
        w="full"
        maxW="md"
        bg="white"
        _dark={{ bg: "gray.900", borderColor: "gray.800" }}
        p={8}
        rounded="2xl"
        boxShadow="xl"
        border="1px solid"
        borderColor="gray.100"
      >
        <VStack gap={6} w="full">
          {/* Header & Logo */}
          <VStack gap={3} textAlign="center">
            <Flex
              cursor="pointer"
              onClick={() => onNavigate("home")}
              bg="yellow.400"
              p={3}
              rounded="xl"
              color="gray.900"
              alignItems="center"
              justifyContent="center"
              mb={2}
              transition="transform 0.2s"
              _hover={{ transform: "scale(1.05)" }}
            >
              <Scissors size={24} strokeWidth={2.5} />
            </Flex>
            <Heading
              as="h1"
              fontSize="2xl"
              fontWeight="bold"
              color="gray.900"
              _dark={{ color: "white" }}
            >
              Create an account
            </Heading>
            <Text color="gray.500" _dark={{ color: "gray.400" }} fontSize="sm">
              Join BeeJah Stiches to manage your bespoke measurements and
              orders.
            </Text>
          </VStack>

          {/* Sign Up Form */}
          <Box as="form" w="full" onSubmit={handleSubmit}>
            <VStack gap={4} w="full" alignItems="flex-start">
              <Box w="full">
                <Text
                  as="label"
                  fontSize="sm"
                  fontWeight="medium"
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                  display="block"
                  mb={2}
                >
                  Full Name
                </Text>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  size="lg"
                  rounded="lg"
                />
              </Box>

              <Box w="full">
                <Text
                  as="label"
                  fontSize="sm"
                  fontWeight="medium"
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                  display="block"
                  mb={2}
                >
                  Email address
                </Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  size="lg"
                  rounded="lg"
                />
              </Box>

              <Box w="full">
                <Text
                  as="label"
                  fontSize="sm"
                  fontWeight="medium"
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                  display="block"
                  mb={2}
                >
                  Password
                </Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  size="lg"
                  rounded="lg"
                />
              </Box>

              <Box w="full">
                <Text
                  as="label"
                  fontSize="sm"
                  fontWeight="medium"
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                  display="block"
                  mb={2}
                >
                  Confirm Password
                </Text>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  size="lg"
                  rounded="lg"
                />
              </Box>

              <Button
                type="submit"
                w="full"
                h={12}
                mt={2}
                bg="yellow.400"
                color="gray.900"
                _hover={{ bg: "yellow.500" }}
                fontWeight="bold"
                fontSize="md"
                rounded="lg"
                loading={isLoading}
                loadingText="Creating account..."
              >
                Sign Up
              </Button>
            </VStack>
          </Box>

          <HStack gap={1} fontSize="sm" justifyContent="center">
            <Text color="gray.500" _dark={{ color: "gray.400" }}>
              Already have an account?
            </Text>
            <Box
              as="button"
              onClick={() => onNavigate("signin")}
              fontWeight="bold"
              color="yellow.500"
              _hover={{ textDecoration: "underline" }}
            >
              Sign In
            </Box>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default SignUp;
