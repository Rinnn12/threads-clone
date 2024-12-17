import React, { useState, useEffect } from "react";
import { Flex, IconButton, Link, useColorMode } from "@chakra-ui/react";
import { AiFillHome } from "react-icons/ai";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { IoNotifications } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import authScreenAtom from "../atoms/authAtom";

const BottomNav = () => {
  const { colorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const setAuthScreen = useSetRecoilState(authScreenAtom);

  const [isVisible, setIsVisible] = useState(true);
  let lastScrollY = 0;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // Scrolling Down
        setIsVisible(false);
      } else {
        // Scrolling Up
        setIsVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Flex
      as="nav"
      position="fixed"
      bottom={isVisible ? 0 : "-80px"} // Show or hide the nav bar
      zIndex="1400"
      bg={colorMode === "light" ? "white" : "black"}
      w="full"
      justify="space-around"
      py={2}
      borderTop="1px solid"
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      display={{ base: "flex", md: "none" }}
      transition="bottom 0.3s ease-in-out" // Smooth animation
    >
      {user && (
        <IconButton
          as={RouterLink}
          to="/"
          aria-label="Home"
          icon={<AiFillHome />}
          variant="ghost"
        />
      )}
      <IconButton
        as={RouterLink}
        to="/notifications"
        aria-label="Notifications"
        icon={<IoNotifications />}
        variant="ghost"
      />
      {user && (
        <IconButton
          as={RouterLink}
          to={`/${user.username}`}
          aria-label="Profile"
          icon={<RxAvatar />}
          variant="ghost"
        />
      )}
      {user && (
        <IconButton
          as={RouterLink}
          to="/chat"
          aria-label="Chat"
          icon={<BsFillChatQuoteFill />}
          variant="ghost"
        />
      )}
      {!user && (
        <Link
          as={RouterLink}
          to="/auth"
          aria-label="Login"
          onClick={() => setAuthScreen("login")}
          fontSize="md"
          fontWeight="bold"
        >
          Login
        </Link>
      )}
    </Flex>
  );
};

export default BottomNav;
  