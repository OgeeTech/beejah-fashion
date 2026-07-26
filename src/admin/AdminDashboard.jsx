import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import AdminNav from "./Nav";
import AdminTopBar from "./AdminTopBar";
import Inventory from "./Inventory";
import Orders from "./Order";
import Users from "./Users";

const AdminDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Flex minH="100vh" bg="gray.50" _dark={{ bg: "gray.950" }}>
      {/* Sidebar Navigation */}
      <AdminNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={onNavigate}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area Wrapper */}
      <Flex flex="1" direction="column" h="100vh" overflow="hidden">
        {/* Top Bar (Avatar & Theme Toggle) */}
        <AdminTopBar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Dynamic Page Content */}
        <Box flex="1" p={{ base: 4, md: 10 }} overflowY="auto">
          {activeTab === "inventory" && <Inventory />}
          {activeTab === "orders" && <Orders />}
          {activeTab === "users" && <Users />}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AdminDashboard;
