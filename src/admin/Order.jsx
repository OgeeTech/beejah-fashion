import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { Calendar, Palette, Ruler, Search, MapPin, Phone } from "lucide-react";
import { toaster } from "./../components/ui/toaster";

// --- FIREBASE IMPORTS ---
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- SEARCH AND FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPhase, setFilterPhase] = useState("All");

  const statusFlow = [
    "Processing",
    "Fabric Sourced",
    "Cutting",
    "Sewing",
    "Finishing",
    "Ready for Fitting",
    "Dispatched",
    "Completed",
  ];

  // --- FIREBASE LISTENER ---
  useEffect(() => {
    const ordersRef = collection(db, "orders");

    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetchedOrders);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

  // Helper to format the measurements object into a readable string safely
  const formatMeasurements = (measurements) => {
    if (!measurements) return "Standard Size";
    const parts = [];
    if (measurements.chestOrBust)
      parts.push(`Chest/Bust: ${measurements.chestOrBust}`);
    if (measurements.waist) parts.push(`Waist: ${measurements.waist}`);
    if (measurements.hips) parts.push(`Hips: ${measurements.hips}`);
    if (measurements.shoulder) parts.push(`Shoulder: ${measurements.shoulder}`);
    if (measurements.sleeve) parts.push(`Sleeve: ${measurements.sleeve}`);
    if (measurements.length) parts.push(`Length: ${measurements.length}`);
    return parts.length > 0 ? parts.join(", ") : "Standard Size";
  };

  // --- DATABASE UPDATE ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { orderStatus: newStatus });
      toaster.create({
        title: "Phase Updated",
        description: `Order moved to ${newStatus}.`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toaster.create({
        title: "Update Failed",
        description: "Could not update the production phase.",
        type: "error",
      });
    }
  };

  // --- NEW: FILTER AND SORT LOGIC ---
  const filteredAndSortedOrders = [...orders]
    .filter((order) => {
      // 1. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesEmail = (order.userEmail || "")
          .toLowerCase()
          .includes(query);
        const matchesRef = (order.paystackReference || "")
          .toLowerCase()
          .includes(query);
        const matchesItem = (order.items || []).some((item) =>
          (item.name || "").toLowerCase().includes(query),
        );

        if (!matchesEmail && !matchesRef && !matchesItem) return false;
      }

      // 2. Phase Filter Dropdown
      if (filterPhase !== "All") {
        const currentStatus = order.orderStatus || "Processing";
        if (currentStatus !== filterPhase) return false;
      }

      return true;
    })
    // 3. Always sort by Newest first automatically
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

  return (
    <Box>
      <Flex
        direction={{ base: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        mb={8}
        gap={4}
      >
        <Heading as="h2" size="lg" color="gray.900" _dark={{ color: "white" }}>
          Custom Production Pipeline
        </Heading>

        <HStack w={{ base: "full", md: "auto" }} gap={3}>
          {/* SEARCH BAR */}
          <Flex
            alignItems="center"
            bg="white"
            _dark={{ bg: "gray.900", borderColor: "gray.700" }}
            border="1px solid"
            borderColor="gray.200"
            px={3}
            py={1.5}
            rounded="md"
            w={{ base: "full", md: "250px" }}
          >
            <Search size={16} color="gray" />
            <Input
              variant="unstyled"
              placeholder="Search orders..."
              ml={2}
              fontSize="sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Flex>

          {/* BULLETPROOF PHASE FILTER DROPDOWN */}
          <Box
            as="select"
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value)}
            bg="white"
            color="gray.700"
            _dark={{ bg: "gray.900", color: "white", borderColor: "gray.700" }}
            border="1px solid"
            borderColor="gray.200"
            rounded="md"
            px={3}
            py={1.5}
            fontSize="sm"
            fontWeight="medium"
            outline="none"
            cursor="pointer"
          >
            <option value="All">All Phases</option>
            {statusFlow.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </Box>
        </HStack>
      </Flex>

      {isLoading ? (
        <Flex justifyContent="center" py={20}>
          <Spinner size="xl" color="yellow.500" />
        </Flex>
      ) : filteredAndSortedOrders.length === 0 ? (
        <Box textAlign="center" py={20} color="gray.500">
          <Text fontSize="lg" fontWeight="medium">
            No orders found.
          </Text>
          {(searchQuery || filterPhase !== "All") && (
            <Text fontSize="sm">
              Try adjusting your search or phase filters.
            </Text>
          )}
        </Box>
      ) : (
        <VStack gap={6} align="stretch">
          {filteredAndSortedOrders.map((order) => (
            <Flex
              key={order.id}
              direction={{ base: "column", lg: "row" }}
              bg="white"
              _dark={{ bg: "gray.900", borderColor: "gray.800" }}
              p={5}
              rounded="xl"
              border="1px solid"
              borderColor="gray.200"
              alignItems={{ base: "stretch", lg: "flex-start" }}
              justifyContent="space-between"
              gap={6}
              boxShadow="sm"
            >
              {/* LEFT SIDE: Customer & Items Info */}
              <VStack align="start" gap={3} flex="1">
                <HStack w="full" justifyContent="space-between" flexWrap="wrap">
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    {order.userEmail || "Unknown Customer"}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="yellow.500">
                    {formatNaira(order.totalAmountPaid)}
                  </Text>
                </HStack>

                <HStack
                  color="gray.500"
                  _dark={{ color: "gray.400" }}
                  fontSize="sm"
                  gap={4}
                  flexWrap="wrap"
                >
                  <HStack>
                    <Calendar size={14} />
                    <Text>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </HStack>
                  <HStack>
                    <MapPin size={14} />
                    <Text>
                      {order.deliveryDetails?.city || "N/A"} -{" "}
                      {order.deliveryDetails?.address || "N/A"}
                    </Text>
                  </HStack>
                  <HStack>
                    <Phone size={14} />
                    <Text>{order.deliveryDetails?.phone || "N/A"}</Text>
                  </HStack>
                </HStack>

                <Box
                  h="1px"
                  bg="gray.100"
                  _dark={{ bg: "gray.700" }}
                  w="full"
                  my={2}
                />

                {/* LOOP THROUGH ITEMS IN THE ORDER */}
                <VStack align="stretch" w="full" gap={4}>
                  {(order.items || []).map((item, index) => (
                    <Box
                      key={index}
                      p={3}
                      bg="gray.50"
                      _dark={{ bg: "gray.800" }}
                      rounded="md"
                    >
                      <HStack justifyContent="space-between" mb={1}>
                        <Text
                          fontWeight="bold"
                          color="gray.800"
                          _dark={{ color: "gray.200" }}
                        >
                          {item.quantity || 1}x {item.name || "Unknown Item"}
                        </Text>
                        <HStack color="gray.500" _dark={{ color: "gray.400" }}>
                          <Palette size={14} />
                          <Text fontSize="sm" fontWeight="medium">
                            {item.color || "Standard"}
                          </Text>
                        </HStack>
                      </HStack>
                      <HStack
                        color="gray.500"
                        _dark={{ color: "gray.400" }}
                        alignItems="flex-start"
                        mt={2}
                      >
                        <Ruler size={14} style={{ marginTop: "4px" }} />
                        <Text fontSize="sm" lineHeight="tall">
                          {formatMeasurements(item.measurements)}
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>

              {/* RIGHT SIDE: Status Update */}
              <VStack
                align={{ base: "stretch", lg: "flex-end" }}
                bg="gray.50"
                _dark={{ bg: "gray.800" }}
                p={4}
                rounded="lg"
                minW={{ lg: "220px" }}
                h="fit-content"
              >
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.500"
                  textTransform="uppercase"
                >
                  Current Phase
                </Text>

                {/* LIVE STATUS DROPDOWN */}
                <Box
                  as="select"
                  value={order.orderStatus || "Processing"}
                  onChange={(e) =>
                    handleUpdateOrderStatus(order.id, e.target.value)
                  }
                  w="full"
                  p={2}
                  bg="white"
                  color="gray.900"
                  _dark={{
                    bg: "gray.700",
                    color: "white",
                    borderColor: "gray.600",
                  }}
                  border="1px solid"
                  borderColor="gray.300"
                  rounded="md"
                  fontSize="sm"
                  fontWeight="bold"
                  cursor="pointer"
                  _hover={{ borderColor: "yellow.500" }}
                  outline="none"
                >
                  {statusFlow.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Box>

                <Text fontSize="xs" color="gray.400" mt={2} textAlign="right">
                  Ref: {order.paystackReference || "N/A"}
                </Text>
              </VStack>
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Orders;
