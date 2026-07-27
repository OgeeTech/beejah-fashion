import { Box, VStack, HStack, Flex, Text, Button } from "@chakra-ui/react";
import {
  Package,
  Users,
  ShoppingBag,
  Scissors,
  ArrowLeft,
  X,
} from "lucide-react";

const AdminNav = ({
  activeTab,
  setActiveTab,
  onNavigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Dark Overlay Background */}
      {isMobileMenuOpen && (
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="blackAlpha.600"
          zIndex={40}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Actual Sidebar */}
      <Box
        w={{ base: "280px", md: "280px" }}
        bg="white"
        borderRight="1px solid"
        borderColor="gray.200"
        _dark={{ bg: "gray.900", borderColor: "gray.800" }}
        display={{ base: isMobileMenuOpen ? "block" : "none", md: "block" }}
        position={{ base: "fixed", md: "static" }}
        top={0}
        left={0}
        h="100vh"
        zIndex={50}
        boxShadow={{ base: "2xl", md: "none" }}
        transition="all 0.3s"
      >
        <VStack align="stretch" h="full" p={6}>
          <Flex justifyContent="space-between" alignItems="center" mb={10}>
            <HStack gap={2} cursor="pointer" onClick={() => onNavigate("home")}>
              <Flex
                bg="yellow.400"
                p={2}
                rounded="md"
                color="gray.900"
                alignItems="center"
                justifyContent="center"
              >
                <Scissors size={20} strokeWidth={2.5} />
              </Flex>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="gray.900"
                _dark={{ color: "white" }}
              >
                BeeJah
                <Text as="span" color="yellow.400">
                  {" "}
                  Admin
                </Text>
              </Text>
            </HStack>

            {/* Mobile Close Button inside the nav */}
            <Box
              display={{ base: "block", md: "none" }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} color="gray" />
            </Box>
          </Flex>

          <VStack gap={2} align="stretch" flex="1">
            <Button
              variant="ghost"
              justifyContent="flex-start"
              color={activeTab === "inventory" ? "yellow.500" : "gray.500"}
              bg={activeTab === "inventory" ? "yellow.50" : "transparent"}
              _dark={{
                bg: activeTab === "inventory" ? "gray.800" : "transparent",
              }}
              onClick={() => handleTabSwitch("inventory")}
              px={4}
            >
              <Package size={18} style={{ marginRight: "12px" }} /> Products
              Catalog
            </Button>

            <Button
              variant="ghost"
              justifyContent="flex-start"
              color={activeTab === "orders" ? "yellow.500" : "gray.500"}
              bg={activeTab === "orders" ? "yellow.50" : "transparent"}
              _dark={{
                bg: activeTab === "orders" ? "gray.800" : "transparent",
              }}
              onClick={() => handleTabSwitch("orders")}
              px={4}
            >
              <ShoppingBag size={18} style={{ marginRight: "12px" }} /> Custom
              Orders
            </Button>

            <Button
              variant="ghost"
              justifyContent="flex-start"
              color={activeTab === "users" ? "yellow.500" : "gray.500"}
              bg={activeTab === "users" ? "yellow.50" : "transparent"}
              _dark={{ bg: activeTab === "users" ? "gray.800" : "transparent" }}
              onClick={() => handleTabSwitch("users")}
              px={4}
            >
              <Users size={18} style={{ marginRight: "12px" }} /> User Directory
            </Button>
          </VStack>

          <Button
            variant="outline"
            onClick={() => onNavigate("catalog")}
            w="full"
            color="gray.700"
            _dark={{
              color: "gray.200",
              borderColor: "gray.700",
              _hover: { bg: "gray.800" },
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: "8px" }} /> Back to Shop
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default AdminNav;
