import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Grid,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Image,
  Spinner,
} from "@chakra-ui/react";
import { Plus, Trash2, Edit, X } from "lucide-react";
import { toaster } from "./../components/ui/toaster";

// --- FIREBASE IMPORTS ---
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- DEFINED CATEGORIES ---
const PRODUCT_CATEGORIES = [
  "Men's Native Wear",
  "Corporate Wear",
  "Women's Wear",
  "Aso-Ebi & Lace",
  "Accessories",
];

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [colorInput, setColorInput] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
    colors: [],
  });

  // --- REAL-TIME DATABASE LISTENER ---
  useEffect(() => {
    const productsRef = collection(db, "products");

    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const fetchedProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(fetchedProducts);
      setIsLoadingData(false);
    });

    return () => unsubscribe();
  }, []);

  const formatNaira = (amount) => `₦${Number(amount).toLocaleString()}`;

  // --- IMAGE SELECTION & PREVIEW ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm({ ...productForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- COLOR HANDLERS ---
  const handleAddColor = () => {
    if (
      colorInput.trim() !== "" &&
      !productForm.colors.includes(colorInput.trim())
    ) {
      setProductForm({
        ...productForm,
        colors: [...productForm.colors, colorInput.trim()],
      });
      setColorInput("");
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    setProductForm({
      ...productForm,
      colors: productForm.colors.filter((c) => c !== colorToRemove),
    });
  };

  // --- SAVE TO FIREBASE ---
  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      toaster.create({
        title: "Validation Error",
        description: "Product name, price, and category are required.",
        type: "error",
      });
      return;
    }

    setIsSaving(true);

    try {
      let liveImageUrl = productForm.image;

      if (imageFile) {
        const imageRef = ref(
          storage,
          `products/${Date.now()}_${imageFile.name}`,
        );
        const snapshot = await uploadBytes(imageRef, imageFile);
        liveImageUrl = await getDownloadURL(snapshot.ref);
      }

      const productData = {
        name: productForm.name,
        price: Number(productForm.price),
        category: productForm.category,
        description: productForm.description,
        colors: productForm.colors,
        image: liveImageUrl,
      };

      if (editingProduct) {
        const productRef = doc(db, "products", editingProduct.id);
        await updateDoc(productRef, productData);
        toaster.create({
          title: "Updated",
          description: "Product successfully updated.",
          type: "success",
        });
      } else {
        await addDoc(collection(db, "products"), productData);
        toaster.create({
          title: "Created",
          description: "New product added to catalog.",
          type: "success",
        });
      }

      setIsProductModalOpen(false);
      setImageFile(null);
      setProductForm({
        name: "",
        price: "",
        category: "",
        description: "",
        image: "",
        colors: [],
      });
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toaster.create({
        title: "Error",
        description: "Failed to save product.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --- EDIT & DELETE HANDLERS ---
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || "",
      image: product.image,
      colors: product.colors || [],
    });
    setImageFile(null);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      toaster.create({
        title: "Deleted",
        description: "Product removed from database.",
        type: "info",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toaster.create({
        title: "Error",
        description: "Failed to delete product.",
        type: "error",
      });
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <Heading as="h2" size="lg" color="gray.900" _dark={{ color: "white" }}>
          Products Management
        </Heading>
        <Button
          bg="gray.900"
          color="white"
          _hover={{ bg: "gray.700" }}
          onClick={() => {
            setEditingProduct(null);
            setImageFile(null);
            setProductForm({
              name: "",
              price: "",
              category: "",
              description: "",
              image: "",
              colors: [],
            });
            setColorInput("");
            setIsProductModalOpen(true);
          }}
        >
          <Plus size={18} style={{ marginRight: "8px" }} /> Add New Product
        </Button>
      </Flex>

      {/* LOADING STATE OR PRODUCT GRID */}
      {isLoadingData ? (
        <Flex justifyContent="center" py={12}>
          <Spinner size="xl" color="yellow.500" />
        </Flex>
      ) : products.length === 0 ? (
        <Box textAlign="center" py={12} color="gray.500">
          No products found. Click "Add New Product" to start building your
          catalog!
        </Box>
      ) : (
        <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={6}>
          {products.map((item) => (
            <Box
              key={item.id}
              bg="white"
              _dark={{ bg: "gray.900", borderColor: "gray.800" }}
              border="1px solid"
              borderColor="gray.200"
              rounded="xl"
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              <Box
                h="200px"
                bg="gray.100"
                _dark={{ bg: "gray.800" }}
                flexShrink={0}
              >
                <Image
                  src={item.image || "https://via.placeholder.com/400"}
                  alt={item.name}
                  w="full"
                  h="full"
                  objectFit="cover"
                />
              </Box>
              <VStack p={4} align="stretch" gap={2} flex="1">
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="yellow.500"
                  textTransform="uppercase"
                >
                  {item.category}
                </Text>

                <Heading
                  as="h3"
                  size="sm"
                  color="gray.900"
                  _dark={{ color: "white" }}
                >
                  {item.name}
                </Heading>

                {/* --- NEW: Display the brief description --- */}
                {item.description && (
                  <Text
                    fontSize="sm"
                    color="gray.500"
                    _dark={{ color: "gray.400" }}
                    noOfLines={2}
                  >
                    {item.description}
                  </Text>
                )}

                <Flex flexWrap="wrap" gap={1} mt={1}>
                  {item.colors &&
                    item.colors.map((color) => (
                      <Box
                        key={color}
                        bg="gray.100"
                        _dark={{ bg: "gray.800", color: "gray.300" }}
                        px={2}
                        py={0.5}
                        rounded="md"
                        fontSize="xs"
                        color="gray.600"
                      >
                        {color}
                      </Box>
                    ))}
                </Flex>

                <Flex flex="1" alignItems="flex-end" mt={2}>
                  <Text
                    fontWeight="bold"
                    color="gray.600"
                    _dark={{ color: "gray.300" }}
                    w="full"
                  >
                    {formatNaira(item.price)}
                  </Text>
                </Flex>

                <HStack
                  mt={2}
                  pt={2}
                  borderTop="1px solid"
                  borderColor="gray.100"
                  _dark={{ borderColor: "gray.800" }}
                >
                  <Button
                    flex="1"
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(item)}
                  >
                    <Edit size={14} style={{ marginRight: "6px" }} /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    color="red.500"
                    onClick={() => handleDeleteProduct(item.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </HStack>
              </VStack>
            </Box>
          ))}
        </Grid>
      )}

      {/* CREATE / EDIT PRODUCT MODAL OVERLAY */}
      {isProductModalOpen && (
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
            p={6}
            rounded="2xl"
            maxW="md"
            w="full"
            maxH="90vh"
            overflowY="auto"
            boxShadow="2xl"
          >
            <Heading
              as="h3"
              size="lg"
              mb={6}
              color="gray.900"
              _dark={{ color: "white" }}
            >
              {editingProduct ? "Edit Product Data" : "Create New Product"}
            </Heading>

            <VStack gap={4} align="stretch" mb={6}>
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  mb={1}
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                >
                  Product Image
                </Text>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  p={1}
                  border="1px solid"
                  borderColor="gray.200"
                  _dark={{ borderColor: "gray.700" }}
                />
                {productForm.image && (
                  <Box
                    mt={3}
                    h="120px"
                    w="120px"
                    rounded="lg"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Image
                      src={productForm.image}
                      alt="Preview"
                      w="full"
                      h="full"
                      objectFit="cover"
                    />
                  </Box>
                )}
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  mb={1}
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                >
                  Product Title
                </Text>
                <Input
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="e.g. Classic White Senator"
                />
              </Box>

              {/* --- NEW: DESCRIPTION INPUT BOX --- */}
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  mb={1}
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                >
                  Brief Description
                </Text>
                <Box
                  as="textarea"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g. Premium cotton fabric tailored with a modern fit..."
                  w="full"
                  p={2.5}
                  border="1px solid"
                  borderColor="gray.200"
                  rounded="md"
                  bg="white"
                  color="gray.900"
                  _dark={{
                    bg: "gray.900",
                    borderColor: "gray.700",
                    color: "white",
                  }}
                  outline="none"
                  rows={2}
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
                  Base Price (₦)
                </Text>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  placeholder="45000"
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
                  Category
                </Text>
                <Box
                  as="select"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  w="full"
                  p={2.5}
                  border="1px solid"
                  borderColor="gray.200"
                  rounded="md"
                  bg="white"
                  color="gray.900"
                  _dark={{
                    bg: "gray.900",
                    borderColor: "gray.700",
                    color: "white",
                  }}
                  outline="none"
                >
                  <option value="" disabled>
                    Select a category...
                  </option>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Box>
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  mb={1}
                  color="gray.700"
                  _dark={{ color: "gray.300" }}
                >
                  Available Colors
                </Text>
                <HStack>
                  <Input
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="e.g. Navy Blue"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddColor();
                    }}
                  />
                  <Button
                    onClick={handleAddColor}
                    bg="gray.100"
                    _dark={{ bg: "gray.800" }}
                  >
                    Add
                  </Button>
                </HStack>

                <Flex flexWrap="wrap" gap={2} mt={3}>
                  {productForm.colors.map((color) => (
                    <Flex
                      key={color}
                      bg="yellow.100"
                      color="yellow.800"
                      _dark={{ bg: "yellow.500", color: "gray.900" }}
                      px={3}
                      py={1}
                      rounded="full"
                      alignItems="center"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {color}
                      <Box
                        as="button"
                        onClick={() => handleRemoveColor(color)}
                        ml={2}
                      >
                        <X size={14} />
                      </Box>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            </VStack>

            <HStack justifyContent="flex-end" gap={3}>
              <Button
                variant="ghost"
                onClick={() => setIsProductModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                bg="yellow.500"
                color="gray.900"
                _hover={{ bg: "yellow.600" }}
                onClick={handleSaveProduct}
                fontWeight="bold"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : editingProduct
                    ? "Save Changes"
                    : "Create Product"}
              </Button>
            </HStack>
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default Inventory;
