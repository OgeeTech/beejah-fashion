"use client";

import { Button } from "@chakra-ui/react";
import { useColorMode } from "./src/components/ui/color-mode";

const Btn = () => {
  const { toggleColorMode } = useColorMode();
  return (
    <Button variant="outline" onClick={toggleColorMode}>
      Toggle Mode
    </Button>
  );
};

export default Btn;
