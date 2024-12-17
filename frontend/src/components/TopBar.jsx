import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  IconButton,
  Input,
  VStack,
  Link,
  Image,
  Text,
  useColorMode,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Spinner,
} from "@chakra-ui/react";
import { HamburgerIcon, SunIcon, MoonIcon, SearchIcon } from "@chakra-ui/icons";
import { AiFillHome } from "react-icons/ai";
import { IoNotifications } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { FiLogOut } from "react-icons/fi";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useLogout from "../hooks/useLogout";

const TopBar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State for Hamburger menu
  const [isVisible, setIsVisible] = useState(true); // State for visibility on scroll
  const [searchQuery, setSearchQuery] = useState(""); // Search input state
  const [searchResults, setSearchResults] = useState([]); // Results from search API
  const [loading, setLoading] = useState(false); // Loading state for search
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const navigate = useNavigate(); // Navigate programmatically

  let lastScrollY = 0;

  // Detect scroll direction to show/hide top bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search function with debounce
  const handleSearch = debounce(async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?query=${query}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, 300); // 300ms debounce to minimize API calls

  // Update search query and trigger search function
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  // Navigate to a user's homepage/profile
  const goToUserProfile = (username) => {
    navigate(`/${username}`);
    setSearchQuery(""); // Clear search bar after navigating
    setSearchResults([]); // Clear results after navigating
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <Flex
        as="header"
        position="sticky"
        top={isVisible ? 0 : "-80px"} // Hide on scroll down, show on scroll up
        zIndex="1400"
        bg={colorMode === "light" ? "white" : "black"}
        borderBottom="1px solid"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        w="full"
        justify="space-between"
        align="center"
        px={4}
        py={2}
        transition="top 0.3s ease-in-out" // Smooth animation for appearance/disappearance
      >
        <IconButton
          aria-label="Menu"
          icon={<HamburgerIcon />}
          variant="ghost"
          size="lg"
          onClick={() => setIsDrawerOpen(true)} // Open the menu on click
        />
        <Flex alignItems="center">
          <Text fontSize="xl" fontWeight="bold">
           Austonsss
          </Text>
        </Flex>
        <Flex align="center" gap={2} width="50%">
          {/* Search Bar with Icon */}
          <Box position="relative" zIndex="1500" display="flex" alignItems="center" flex="1">
            <SearchIcon position="absolute" left="10px" zIndex="1" color="gray.500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              size="sm"
              borderRadius="md"
              pl="35px" // Leave space for the search icon
              _placeholder={{ color: "gray.500" }}
              width="100%" // Wider input field
            />
            {/* Loading Spinner */}
            {loading && (
              <Spinner
                size="sm"
                position="absolute"
                right="10px"
                top="50%"
                transform="translateY(-50%)"
              />
            )}
          </Box>
          <IconButton
            aria-label="Toggle theme"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="lg"
          />
        </Flex>
      </Flex>

      {/* Drawer for the Hamburger Menu */}
      <Drawer
        isOpen={isDrawerOpen}
        placement="left"
        onClose={() => setIsDrawerOpen(false)}
      >
        <DrawerOverlay>
          <DrawerContent bg={colorMode === "light" ? "white" : "black"}>
            <DrawerCloseButton
              color={colorMode === "light" ? "black" : "white"}
            />
            <VStack align="flex-start" spacing="4" mt="10" px="4" height="100%">
              {/* Navigation Links with Dots */}
              <Box as="ul" width="full" flex="1">
                <VStack as="li" spacing="4" alignItems="flex-start">
                  <Link
                    as={RouterLink}
                    to="/"
                    onClick={() => setIsDrawerOpen(false)}
                    display="flex"
                    alignItems="center"
                    width="full"
                  >
                    <Box
                      as="span"
                      w="4px"
                      h="4px"
                      bg="white"
                      borderRadius="50%"
                      mr="2"
                    />
                    <AiFillHome size={20} />
                    <Text ml={3}>Home</Text>
                  </Link>
                  {user && (
                    <>
                      <Link
                        as={RouterLink}
                        to="/notifications"
                        onClick={() => setIsDrawerOpen(false)}
                        display="flex"
                        alignItems="center"
                        width="full"
                      >
                        <Box
                          as="span"
                          w="4px"
                          h="4px"
                          bg="white"
                          borderRadius="50%"
                          mr="2"
                        />
                        <IoNotifications size={20} />
                        <Text ml={3}>Notifications</Text>
                      </Link>
                      <Link
                        as={RouterLink}
                        to={`/${user.username}`}
                        onClick={() => setIsDrawerOpen(false)}
                        display="flex"
                        alignItems="center"
                        width="full"
                      >
                        <Box
                          as="span"
                          w="4px"
                          h="4px"
                          bg="white"
                          borderRadius="50%"
                          mr="2"
                        />
                        <RxAvatar size={20} />
                        <Text ml={3}>Profile</Text>
                      </Link>
                      <Link
                        as={RouterLink}
                        to="/chat"
                        onClick={() => setIsDrawerOpen(false)}
                        display="flex"
                        alignItems="center"
                        width="full"
                      >
                        <Box
                          as="span"
                          w="4px"
                          h="4px"
                          bg="white"
                          borderRadius="50%"
                          mr="2"
                        />
                        <BsFillChatQuoteFill size={20} />
                        <Text ml={3}>Chat</Text>
                      </Link>
                      <Link
                        onClick={() => {
                          logout();
                          setIsDrawerOpen(false);
                        }}
                        display="flex"
                        alignItems="center"
                        width="full"
                      >
                        <Box
                          as="span"
                          w="4px"
                          h="4px"
                          bg="white"
                          borderRadius="50%"
                          mr="2"
                        />
                        <FiLogOut size={20} />
                        <Text ml={3}>Logout</Text>
                      </Link>
                    </>
                  )}
                </VStack>
              </Box>
            </VStack>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>

      {/* Display search results */}
      {searchQuery && (
        <Box
          position="absolute"
          top="60px" // Just below the top nav bar
          left="15%"
          right="15%"
          zIndex="1500"
          bg={colorMode === "light" ? "gray.100" : "gray.800"}
          p={4}
          borderRadius="md"
          boxShadow="lg"
        >
          {searchResults.length > 0 ? (
            <VStack spacing={4} align="start">
              {searchResults.map((result) => (
                <Flex
                  key={result._id}
                  align="center"
                  justify="space-between"
                  w="full"
                  cursor="pointer"
                  onClick={() => goToUserProfile(result.username)} // Navigate to user's profile
                >
                  <Flex align="center" gap={3}>
                    <Image
                      src={result.profilePic || "/avatar-placeholder.png"}
                      alt={result.name}
                      boxSize="32px"
                      borderRadius="full"
                    />
                    <Text fontWeight="bold">{result.name}</Text>
                    <Text>@{result.username}</Text>
                  </Flex>
                </Flex>
              ))}
            </VStack>
          ) : (
            <Text textAlign="center" color="gray.500">
              No such users found.
            </Text>
          )}
        </Box>
      )}
    </>
  );
};

export default TopBar;
