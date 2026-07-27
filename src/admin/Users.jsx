import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { Users as UsersIcon } from "lucide-react";

// --- FIREBASE IMPORTS ---
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reference the 'users' collection in Firestore
    const usersCollectionRef = collection(db, "users");

    const unsubscribe = onSnapshot(
      usersCollectionRef,
      (snapshot) => {
        const fetchedUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(fetchedUsers);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setIsLoading(false);
      },
    );

    // Cleanup the listener when the component unmount
    return () => unsubscribe();
  }, []);

  return (
    <Box>
      <Heading
        as="h2"
        size="lg"
        mb={8}
        color="gray.900"
        _dark={{ color: "white" }}
      >
        Registered Users
      </Heading>

      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" py={10}>
          <Spinner size="xl" color="yellow.500" />
          <Text ml={4} color="gray.500">
            Loading users...
          </Text>
        </Flex>
      ) : users.length === 0 ? (
        <Box textAlign="center" py={10} color="gray.500">
          No users found in the database.
        </Box>
      ) : (
        <VStack gap={4} align="stretch">
          {users.map((user) => (
            <Flex
              key={user.id}
              bg="white"
              _dark={{ bg: "gray.900", borderColor: "gray.700" }}
              p={5}
              rounded="xl"
              border="1px solid"
              borderColor="gray.200"
              alignItems="center"
              justifyContent="space-between"
              boxShadow="sm"
            >
              <HStack gap={4}>
                <Flex
                  w={10}
                  h={10}
                  rounded="full"
                  bg="gray.100"
                  _dark={{ bg: "gray.800" }}
                  alignItems="center"
                  justifyContent="center"
                >
                  <UsersIcon size={20} color="gray" />
                </Flex>
                <VStack align="start" gap={0}>
                  <Text
                    fontWeight="bold"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    {user.name || "Unknown User"}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {user.email}
                  </Text>
                  {/* Display the join date if it exists */}
                  {user.joined && (
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      Joined: {user.joined}
                    </Text>
                  )}
                </VStack>
              </HStack>

              <Box
                bg={user.role === "Admin" ? "purple.100" : "green.100"}
                color={user.role === "Admin" ? "purple.700" : "green.700"}
                _dark={{
                  bg: user.role === "Admin" ? "purple.900" : "green.900",
                  color: user.role === "Admin" ? "purple.200" : "green.200",
                }}
                px={3}
                py={1}
                rounded="full"
                fontSize="xs"
                fontWeight="bold"
              >
                {user.role || "Customer"}
              </Box>
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Users;
