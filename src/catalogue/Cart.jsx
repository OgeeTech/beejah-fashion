import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Image,
  IconButton,
  Button,
  Grid,
  Input,
  Spinner,
} from "@chakra-ui/react";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag as CartIcon,
  CreditCard,
  MapPin,
} from "lucide-react";
import { toaster } from "../components/ui/toaster";
import Nav from "./Nav";

// --- FIREBASE IMPORTS ---
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  addDoc,
} from "firebase/firestore";

const Cart = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Checkout Form State
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "",
    city: "",
    phone: "",
  });

  // --- STABLE REFERENCE FOR PAYMENT DATA ---
  const paymentSnapshotRef = useRef(null);

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    let unsubCart = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setCurrentUser(user);

      if (user) {
        const qCart = query(
          collection(db, "cartItems"),
          where("userId", "==", user.uid),
        );
        unsubCart = onSnapshot(qCart, (snapshot) => {
          const fetchedCart = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCartItems(fetchedCart);
          setIsLoading(false);
        });
      } else {
        setCartItems([]);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubCart();
    };
  }, []);

  // --- DATABASE ACTIONS ---
  const handleQuantityChange = async (id, change, currentQty) => {
    const newQty = (currentQty || 1) + change;
    if (newQty > 0) {
      try {
        await updateDoc(doc(db, "cartItems", id), { quantity: newQty });
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await deleteDoc(doc(db, "cartItems", id));
      toaster.create({ title: "Item removed", type: "info" });
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    setCheckoutStep(1);
  };

  // --- CALCULATIONS ---
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0,
  );
  const shipping = cartItems.length > 0 ? 5000 : 0;
  const total = subtotal + shipping;
  const formatNaira = (amount) => `₦${amount.toLocaleString()}`;

  // --- PAYMENT SUCCESS CALLBACK ---
  const onSuccess = useCallback(
    async (transaction) => {
      const snapshot = paymentSnapshotRef.current;
      if (!snapshot) return;

      console.log("✅ Paystack success callback fired!", transaction);
      setIsProcessing(true);

      try {
        // Sanitize data to remove undefined values that Firestore rejects
        const orderData = JSON.parse(
          JSON.stringify({
            userId: currentUser?.uid,
            userEmail: currentUser?.email,
            items: snapshot.cartItems,
            deliveryDetails: snapshot.deliveryDetails,
            subtotal: snapshot.subtotal,
            shippingFee: snapshot.shipping,
            totalAmountPaid: snapshot.total,
            paystackReference: transaction.reference,
            paymentStatus: "Paid",
            orderStatus: "Processing",
            createdAt: new Date().toISOString(),
          }),
        );

        await addDoc(collection(db, "orders"), orderData);

        // Clear cart in Firestore
        const batch = writeBatch(db);
        snapshot.cartItems.forEach((item) => {
          batch.delete(doc(db, "cartItems", item.id));
        });
        await batch.commit();

        // Clear local state and close modal
        setCartItems([]);
        setIsCheckoutOpen(false);
        setCheckoutStep(1);

        toaster.create({
          title: "Payment Successful!",
          description:
            "Your custom order has been received. Our team will contact you shortly.",
          type: "success",
          duration: 6000,
        });
      } catch (error) {
        console.error("Order processing error:", error);
        toaster.create({
          title: "Error",
          description:
            "Payment succeeded but we had trouble saving your order. Contact support.",
          type: "error",
        });
      } finally {
        setIsProcessing(false);
        setIsCheckoutOpen(false);
      }
    },
    [currentUser],
  );

  // --- OPEN PAYSTACK INLINE POPUP ---
  const handlePaystackClick = () => {
    // Freeze the exact cart and total at the moment the user clicks Pay
    paymentSnapshotRef.current = {
      cartItems: [...cartItems],
      total,
      subtotal,
      shipping,
      deliveryDetails: { ...deliveryDetails },
    };

    // Ensure Paystack script is loaded
    if (!window.PaystackPop) {
      console.error("Paystack script not loaded");
      toaster.create({
        title: "Error",
        description: "Payment gateway not available. Please try again.",
        type: "error",
      });
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_dummy123",
      email: currentUser?.email || "customer@example.com",
      amount: total * 100, // amount in kobo
      ref: "txn_" + Math.floor(Math.random() * 1000000000),
      onClose: () => {
        console.log("⚠️ Paystack popup closed by user");
        setIsProcessing(false);
        toaster.create({
          title: "Payment Cancelled",
          description: "You closed the secure payment gateway.",
          type: "info",
        });
      },
      callback: (transaction) => {
        // Paystack calls this on success, then we forward to our onSuccess
        onSuccess(transaction);
      },
    });

    handler.openIframe();
  };

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.950" }}>
      <Nav onNavigate={onNavigate} />

      <Box
        maxW="7xl"
        mx="auto"
        px={{ base: 4, sm: 6, lg: 8 }}
        py={8}
        pb={{ base: 24, md: 12 }}
      >
        <Heading
          as="h1"
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          color="gray.900"
          _dark={{ color: "white" }}
          mb={8}
        >
          Shopping Bag
        </Heading>

        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" py={20}>
            <Spinner size="xl" color="yellow.500" />
          </Flex>
        ) : !isLoggedIn ? (
          <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            py={20}
            textAlign="center"
          >
            <Box
              bg="gray.100"
              _dark={{ bg: "gray.800" }}
              p={6}
              rounded="full"
              mb={6}
            >
              <ShoppingBag size={48} color="gray" />
            </Box>
            <Heading
              fontSize="xl"
              mb={3}
              color="gray.900"
              _dark={{ color: "white" }}
            >
              Your bag is waiting for you
            </Heading>
            <Text
              color="gray.500"
              _dark={{ color: "gray.400" }}
              maxW="md"
              mb={8}
            >
              Sign in to sync your custom tailoring orders across devices and
              checkout seamlessly.
            </Text>
            <Button
              onClick={() => onNavigate("signin")}
              bg="yellow.400"
              color="gray.900"
              _hover={{ bg: "yellow.500" }}
              size="lg"
              rounded="full"
              px={8}
            >
              Sign In to View Bag
            </Button>
          </Flex>
        ) : cartItems.length === 0 && !isCheckoutOpen ? (
          <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            py={20}
            textAlign="center"
          >
            <Box
              bg="gray.100"
              _dark={{ bg: "gray.800" }}
              p={6}
              rounded="full"
              mb={6}
            >
              <CartIcon size={48} color="gray" />
            </Box>
            <Heading
              fontSize="xl"
              mb={3}
              color="gray.900"
              _dark={{ color: "white" }}
            >
              Your bag is empty
            </Heading>
            <Text
              color="gray.500"
              _dark={{ color: "gray.400" }}
              maxW="md"
              mb={8}
            >
              Explore our exquisite collection of custom outfits and add your
              first style to the bag.
            </Text>
            <Button
              onClick={() => onNavigate("catalog")}
              variant="outline"
              borderColor="gray.300"
              color="gray.900"
              _dark={{ borderColor: "gray.700", color: "white" }}
              _hover={{ bg: "gray.100", _dark: { bg: "gray.800" } }}
              size="lg"
              rounded="full"
              px={8}
            >
              Explore Catalog
              <ArrowRight size={18} style={{ marginLeft: "8px" }} />
            </Button>
          </Flex>
        ) : (
          <Grid
            templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
            gap={8}
            alignItems="flex-start"
          >
            <VStack gap={4} alignItems="stretch">
              {cartItems.map((item) => (
                <Flex
                  key={item.id}
                  bg="white"
                  _dark={{ bg: "gray.900", borderColor: "gray.800" }}
                  border="1px solid"
                  borderColor="gray.200"
                  rounded="2xl"
                  p={4}
                  gap={4}
                  alignItems="center"
                  boxShadow="sm"
                  flexWrap={{ base: "wrap", md: "nowrap" }}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    w="90px"
                    h="90px"
                    objectFit="cover"
                    rounded="xl"
                  />

                  <VStack flex="1" alignItems="flex-start" gap={1} minW="150px">
                    <Heading
                      as="h3"
                      fontSize="md"
                      fontWeight="bold"
                      color="gray.900"
                      _dark={{ color: "white" }}
                    >
                      {item.name}
                    </Heading>
                    <Text
                      fontSize="sm"
                      color="gray.500"
                      _dark={{ color: "gray.400" }}
                    >
                      Fabric: {item.color || "Standard"}
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color="yellow.500"
                    >
                      {formatNaira(item.price)}
                    </Text>
                  </VStack>

                  <HStack
                    border="1px solid"
                    borderColor="gray.200"
                    _dark={{ borderColor: "gray.700" }}
                    rounded="lg"
                    p={1}
                    ml="auto"
                  >
                    <IconButton
                      onClick={() =>
                        handleQuantityChange(item.id, -1, item.quantity)
                      }
                      variant="ghost"
                      size="xs"
                    >
                      <Minus size={14} />
                    </IconButton>
                    <Text
                      px={2}
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.900"
                      _dark={{ color: "white" }}
                    >
                      {item.quantity || 1}
                    </Text>
                    <IconButton
                      onClick={() =>
                        handleQuantityChange(item.id, 1, item.quantity)
                      }
                      variant="ghost"
                      size="xs"
                    >
                      <Plus size={14} />
                    </IconButton>
                  </HStack>

                  <IconButton
                    onClick={() => handleRemoveItem(item.id)}
                    variant="ghost"
                    color="gray.400"
                    _hover={{
                      color: "red.500",
                      bg: "red.50",
                      _dark: { bg: "red.900/20" },
                    }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Flex>
              ))}
            </VStack>

            <Box
              bg="white"
              _dark={{ bg: "gray.900", borderColor: "gray.800" }}
              border="1px solid"
              borderColor="gray.200"
              rounded="2xl"
              p={6}
              boxShadow="sm"
              position={{ lg: "sticky" }}
              top={{ lg: "100px" }}
            >
              <Heading
                fontSize="lg"
                fontWeight="bold"
                color="gray.900"
                _dark={{ color: "white" }}
                mb={6}
              >
                Order Summary
              </Heading>
              <VStack gap={4} alignItems="stretch" mb={6}>
                <Flex justifyContent="space-between">
                  <Text color="gray.500" _dark={{ color: "gray.400" }}>
                    Subtotal
                  </Text>
                  <Text
                    fontWeight="semibold"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    {formatNaira(subtotal)}
                  </Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text color="gray.500" _dark={{ color: "gray.400" }}>
                    Estimated Shipping
                  </Text>
                  <Text
                    fontWeight="semibold"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    {formatNaira(shipping)}
                  </Text>
                </Flex>
                <Box h="1px" bg="gray.100" _dark={{ bg: "gray.800" }} my={2} />
                <Flex justifyContent="space-between">
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    Total
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="yellow.500">
                    {formatNaira(total)}
                  </Text>
                </Flex>
              </VStack>
              <Button
                onClick={handleCheckout}
                w="full"
                h={12}
                bg="yellow.400"
                color="gray.900"
                _hover={{ bg: "yellow.500" }}
                fontWeight="bold"
                fontSize="md"
                rounded="xl"
                isDisabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Grid>
        )}
      </Box>

      {/* CHECKOUT PAYMENT MODAL */}
      {isCheckoutOpen && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="blackAlpha.600"
          zIndex={100}
          alignItems="center"
          justifyContent="center"
          px={4}
        >
          <Box
            bg="white"
            _dark={{ bg: "gray.900" }}
            p={8}
            rounded="3xl"
            maxW="md"
            w="full"
            boxShadow="2xl"
            maxH="90vh"
            overflowY="auto"
          >
            {checkoutStep === 1 && (
              <VStack alignItems="stretch" gap={5}>
                <Flex alignItems="center" gap={3} mb={2}>
                  <Box bg="yellow.100" p={2} rounded="full" color="yellow.600">
                    <MapPin size={24} />
                  </Box>
                  <Heading
                    as="h3"
                    size="md"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    Delivery Details
                  </Heading>
                </Flex>
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    mb={1}
                    color="gray.700"
                    _dark={{ color: "gray.300" }}
                  >
                    Street Address
                  </Text>
                  <Input
                    placeholder="Enter your full address"
                    value={deliveryDetails.address}
                    onChange={(e) =>
                      setDeliveryDetails({
                        ...deliveryDetails,
                        address: e.target.value,
                      })
                    }
                  />
                </Box>
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    mb={1}
                    color="gray.700"
                    _dark={{ color: "gray.300" }}
                  >
                    City / State
                  </Text>
                  <Input
                    placeholder="e.g. Abuja, FCT"
                    value={deliveryDetails.city}
                    onChange={(e) =>
                      setDeliveryDetails({
                        ...deliveryDetails,
                        city: e.target.value,
                      })
                    }
                  />
                </Box>
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    mb={1}
                    color="gray.700"
                    _dark={{ color: "gray.300" }}
                  >
                    Phone Number
                  </Text>
                  <Input
                    placeholder="Enter active phone number"
                    type="tel"
                    value={deliveryDetails.phone}
                    onChange={(e) =>
                      setDeliveryDetails({
                        ...deliveryDetails,
                        phone: e.target.value,
                      })
                    }
                  />
                </Box>
                <HStack justifyContent="space-between" mt={4}>
                  <Button
                    variant="ghost"
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    bg="gray.900"
                    color="white"
                    _hover={{ bg: "gray.700" }}
                    onClick={() => {
                      if (!deliveryDetails.address || !deliveryDetails.phone) {
                        toaster.create({
                          title: "Incomplete",
                          description: "Address and Phone are required",
                          type: "error",
                        });
                        return;
                      }
                      setCheckoutStep(2);
                    }}
                  >
                    Continue to Payment
                  </Button>
                </HStack>
              </VStack>
            )}

            {checkoutStep === 2 && (
              <VStack alignItems="stretch" gap={5}>
                <Flex alignItems="center" gap={3} mb={2}>
                  <Box bg="blue.100" p={2} rounded="full" color="blue.600">
                    <CreditCard size={24} />
                  </Box>
                  <Heading
                    as="h3"
                    size="md"
                    color="gray.900"
                    _dark={{ color: "white" }}
                  >
                    Secure Payment
                  </Heading>
                </Flex>

                <Box
                  bg="gray.50"
                  _dark={{ bg: "gray.800" }}
                  p={4}
                  rounded="xl"
                  mb={4}
                >
                  <Flex justifyContent="space-between" mb={1}>
                    <Text color="gray.500" fontSize="sm">
                      Total Amount to Pay:
                    </Text>
                    <Text fontWeight="bold" color="yellow.500" fontSize="lg">
                      {formatNaira(total)}
                    </Text>
                  </Flex>
                  <Text color="gray.500" fontSize="xs" mt={2}>
                    You will be redirected to the secure Paystack gateway to
                    complete this transaction.
                  </Text>
                </Box>

                <HStack justifyContent="space-between" mt={4} w="full">
                  <Button
                    variant="ghost"
                    onClick={() => setCheckoutStep(1)}
                    isDisabled={isProcessing}
                  >
                    Back
                  </Button>

                  {isProcessing ? (
                    <Button
                      bg="yellow.400"
                      color="gray.900"
                      w="full"
                      maxW="200px"
                      isLoading
                      loadingText="Finalizing Order..."
                    />
                  ) : (
                    <Button
                      onClick={handlePaystackClick}
                      bg="yellow.400"
                      color="gray.900"
                      _hover={{ bg: "yellow.500" }}
                      w="full"
                      maxW="200px"
                      rounded="lg"
                      fontWeight="bold"
                    >
                      Pay {formatNaira(total)}
                    </Button>
                  )}
                </HStack>
              </VStack>
            )}
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default Cart;
