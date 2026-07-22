import { Box, Flex, HStack, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      pt={{ base: 12, md: 16 }}
      pb={8}
      _dark={{
        bg: "gray.900",
        borderColor: "gray.800",
      }}
    >
      <Box maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
        <Box>
          <Flex
            flexDirection={{ base: "column", md: "row" }}
            justifyContent="space-between"
            alignItems="center"
            gap={4}
          >
            <Text color="gray.500" fontSize="sm">
              © 2026 NaijaBespoke. All rights reserved.
            </Text>

            <HStack gap={6}>
              <Box
                as="a"
                href="#"
                color="gray.500"
                _hover={{ color: "yellow.500" }}
              >
                Privacy Policy
              </Box>
              <Box
                as="a"
                href="#"
                color="gray.500"
                _hover={{ color: "yellow.500" }}
              >
                Terms of Service
              </Box>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
