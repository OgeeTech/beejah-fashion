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
import { Scissors, ArrowLeft, Eye, EyeOff } from "lucide-react";

import { toaster } from "./components/ui/toaster";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const SignIn = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- GOOGLE SIGN IN LOGIC ---
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Ensure user document exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || "Google User",
          email: user.email,
          role: "Customer",
          joined: new Date().toISOString().split("T")[0],
        });
      }

      toaster.create({
        title: "Sign In Successful!",
        description: `Welcome back, ${user.displayName || user.email}.`,
        type: "success",
        duration: 3000,
      });

      onNavigate("catalog");
    } catch (error) {
      console.error("Google Auth Error:", error);
      toaster.create({
        title: "Google Sign-In Failed",
        description: error.message,
        type: "error",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // --- EMAIL/PASSWORD SIGN IN LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toaster.create({
        title: "Validation Error",
        description: "Please enter both email and password.",
        type: "error",
        duration: 4000,
      });
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      toaster.create({
        title: "Sign In Successful!",
        description: `Welcome back to BeeJah Stiches.`,
        type: "success",
        duration: 3000,
      });

      setEmail("");
      setPassword("");
      onNavigate("catalog");
    } catch (error) {
      let errorMessage = "An error occurred during sign in.";

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMessage = "The email or password you entered is incorrect.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Access to this account has been temporarily disabled due to many failed login attempts. You can try again later.";
      }

      toaster.create({
        title: "Sign In Failed",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
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
      position="relative"
    >
      {/* BACK TO HOME BUTTON */}
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
              Sign in to your account
            </Heading>
            <Text color="gray.500" _dark={{ color: "gray.400" }} fontSize="sm">
              Enter your details to access your bespoke dashboard
            </Text>
          </VStack>

          {/* GOOGLE SIGN IN BUTTON */}
          <Button
            w="full"
            h={12}
            variant="outline"
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
            loadingText="Connecting..."
            color="gray.700"
            _dark={{
              color: "gray.200",
              borderColor: "gray.700",
              _hover: { bg: "gray.800" },
            }}
          >
            <svg
              style={{ marginRight: "10px" }}
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          {/* DIVIDER LINES */}
          <HStack w="full" gap={2}>
            <Box flex="1" h="1px" bg="gray.200" _dark={{ bg: "gray.700" }} />
            <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
              OR CONTINUE WITH
            </Text>
            <Box flex="1" h="1px" bg="gray.200" _dark={{ bg: "gray.700" }} />
          </HStack>

          {/* Sign In Form */}
          <Box as="form" w="full" onSubmit={handleSubmit}>
            <VStack gap={5} w="full" alignItems="flex-start">
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
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                  <Text
                    as="label"
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                    _dark={{ color: "gray.300" }}
                  >
                    Password
                  </Text>
                  <Box
                    as="a"
                    href="#"
                    fontSize="sm"
                    fontWeight="medium"
                    color="yellow.500"
                    _hover={{
                      color: "yellow.600",
                      textDecoration: "underline",
                    }}
                  >
                    Forgot password?
                  </Box>
                </Flex>

                {/* PASSWORD INPUT WITH EYE TOGGLE */}
                <Box position="relative" w="full">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    size="lg"
                    rounded="lg"
                    pr="3rem"
                  />
                  <Flex
                    as="button"
                    type="button"
                    position="absolute"
                    right="3"
                    top="0"
                    h="full"
                    alignItems="center"
                    justifyContent="center"
                    color="gray.400"
                    _hover={{ color: "gray.600" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Flex>
                </Box>
              </Box>

              <Button
                type="submit"
                w="full"
                h={12}
                bg="yellow.400"
                color="gray.900"
                _hover={{ bg: "yellow.500" }}
                fontWeight="bold"
                fontSize="md"
                rounded="lg"
                isLoading={isLoading}
                loadingText="Verifying..."
              >
                Sign In
              </Button>
            </VStack>
          </Box>

          <HStack gap={1} fontSize="sm" justifyContent="center">
            <Text color="gray.500" _dark={{ color: "gray.400" }}>
              Don't have an account?
            </Text>
            <Box
              as="button"
              onClick={() => onNavigate("signup")}
              fontWeight="bold"
              color="yellow.500"
              _hover={{ textDecoration: "underline" }}
            >
              Sign up
            </Box>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default SignIn;
