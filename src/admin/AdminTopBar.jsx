import { Flex, HStack, IconButton, Text, Box } from "@chakra-ui/react";
import { Sun, Moon, User, Menu, X } from "lucide-react";
import { useColorMode } from "./../components/ui/color-mode";

const AdminTopBar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      as="header"
      w="full"
      h={16}
      px={{ base: 4, md: 8 }}
      alignItems="center"
      justifyContent="space-between"
      bg="white"
      _dark={{ bg: "gray.900", borderColor: "gray.800" }}
      borderBottom="1px solid"
      borderColor="gray.200"
      position="sticky"
      top={0}
      zIndex={40}
    >
      {/* Mobile Menu Toggle (Hidden on Desktop) */}
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        variant="ghost"
        color="gray.500"
        _dark={{ color: "gray.400" }}
        _hover={{ bg: "gray.100", _dark: { bg: "gray.800" } }}
        rounded="md"
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </IconButton>

      {/* Right Side Tools */}
      <HStack gap={4} ml="auto">
        <IconButton
          onClick={toggleColorMode}
          variant="ghost"
          color="gray.500"
          _dark={{ color: "gray.400" }}
          _hover={{ bg: "gray.100", _dark: { bg: "gray.800" } }}
          rounded="full"
          aria-label="Toggle color mode"
        >
          {colorMode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>

        <HStack
          gap={3}
          pl={4}
          borderLeft="1px solid"
          borderColor="gray.200"
          _dark={{ borderColor: "gray.700" }}
        >
          <Flex
            w={9}
            h={9}
            rounded="full"
            bg="yellow.400"
            alignItems="center"
            justifyContent="center"
            color="gray.900"
            boxShadow="sm"
          >
            <User size={18} strokeWidth={2.5} />
          </Flex>
          <Box display={{ base: "none", sm: "block" }}>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="gray.900"
              _dark={{ color: "white" }}
              lineHeight="shorter"
            >
              Wada Gift
            </Text>
            <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }}>
              System Admin
            </Text>
          </Box>
        </HStack>
      </HStack>
    </Flex>
  );
};

export default AdminTopBar;
