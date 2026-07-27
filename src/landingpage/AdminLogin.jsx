import { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Input,
  Button,
} from "@chakra-ui/react";
import { ShieldAlert, ArrowLeft, Eye, EyeOff } from "lucide-react";

import { toaster } from "../components/ui/toaster";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AdminLogin = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toaster.create({
        title: "Validation Error",
        description: "Please enter your admin credentials.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        if (userData.role === "Admin") {
          toaster.create({
            title: "Authorized",
            description: `Welcome to the Admin Dashboard, ${userData.name}.`,
            type: "success",
            duration: 3000,
          });

          setEmail("");
          setPassword("");

          onNavigate("admin");
        } else {
          await signOut(auth);
          toaster.create({
            title: "Access Denied",
            description: "You do not have administrator privileges.",
            type: "error",
            duration: 5000,
          });
        }
      } else {
        await signOut(auth);
        toaster.create({
          title: "Profile Not Found",
          description: "No user data found in the database.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Admin Login Error:", error);
      toaster.create({
        title: "Login Failed",
        description: "Invalid credentials or access denied.",
        type: "error",
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
      bg="gray.900"
      _dark={{ bg: "gray.950" }}
      py={12}
      px={4}
      position="relative"
    >
      <Box
        position="absolute"
        top={{ base: 4, md: 8 }}
        left={{ base: 4, md: 8 }}
      >
        <Button
          onClick={() => onNavigate("home")}
          variant="ghost"
          color="gray.400"
          _hover={{ bg: "gray.800", color: "white" }}
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
        bg="gray.800"
        p={8}
        rounded="2xl"
        boxShadow="2xl"
        border="1px solid"
        borderColor="gray.700"
      >
        <VStack gap={6} w="full">
          <VStack gap={3} textAlign="center">
            <Flex
              bg="red.500"
              p={3}
              rounded="xl"
              color="white"
              alignItems="center"
              justifyContent="center"
              mb={2}
            >
              <ShieldAlert size={28} strokeWidth={2.5} />
            </Flex>
            <Heading as="h1" fontSize="2xl" fontWeight="bold" color="white">
              Admin Portal
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Restricted access. Please enter your credentials.
            </Text>
          </VStack>

          <Box as="form" w="full" onSubmit={handleAdminSubmit}>
            <VStack gap={5} w="full" alignItems="flex-start">
              <Box w="full">
                <Text
                  as="label"
                  fontSize="sm"
                  fontWeight="medium"
                  color="gray.300"
                  display="block"
                  mb={2}
                >
                  Admin Email
                </Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  size="lg"
                  rounded="lg"
                  bg="gray.900"
                  color="white"
                  border="1px solid"
                  borderColor="gray.600"
                  _focus={{ borderColor: "red.500" }}
                />
              </Box>

              <Box w="full">
                <Text
                  as="label"
                  fontSize="sm"
                  fontWeight="medium"
                  color="gray.300"
                  display="block"
                  mb={2}
                >
                  Password
                </Text>
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
                    bg="gray.900"
                    color="white"
                    border="1px solid"
                    borderColor="gray.600"
                    _focus={{ borderColor: "red.500" }}
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
                    _hover={{ color: "white" }}
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
                mt={4}
                bg="red.500"
                color="white"
                _hover={{ bg: "red.600" }}
                fontWeight="bold"
                fontSize="md"
                rounded="lg"
                loading={isLoading}
                loadingText="Verifying Access..."
              >
                Secure Login
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default AdminLogin;
