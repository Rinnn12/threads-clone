"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Link,
  Image,
  Text,
  IconButton,
  Flex,
  useColorMode,
  Spinner,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
} from "@chakra-ui/react";
import { AiFillHome } from "react-icons/ai";
import { IoNotifications, IoSettingsOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { Link as RouterLink } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import userAtom from "../atoms/userAtom";
import useLogout from "../hooks/useLogout";

const Sidebar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const isDesktop = useBreakpointValue({ base: false, md: true }); // Show only on desktop
  const [showNotifications, setShowNotifications] = useState(false); // Toggle notifications view
  const [newNotificationCount, setNewNotificationCount] = useState(0); // Track new notifications

  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: (data) => {
      // Count the new notifications (assuming "new" means not seen)
      const newCount = data.filter((notification) => !notification.seen).length;
      setNewNotificationCount(newCount); // Update the new notification count
    },
  });

  // Mark notifications as seen
  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      toast.success("Notifications deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setNewNotificationCount(0); // Reset new notifications count
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (notifications) {
      // Count new notifications on component mount
      const newCount = notifications.filter((notification) => !notification.seen).length;
      setNewNotificationCount(newCount);
    }
  }, [notifications]);

  // Mark notifications as seen when user views them
  const markAsSeen = () => {
    setNewNotificationCount(0); // Reset the new notifications count
    // Update notification status to "seen" on the server
    fetch("/api/notifications/seen", { method: "PATCH" }).catch((error) => {
      toast.error("Error marking notifications as seen.");
    });
  };

  if (!isDesktop) return null; // Don't render on mobile/tablet

  return (
    <Box
      position="fixed"
      zIndex="1400"
      left={0}
      top={0}
      width="300px"
      height="100vh"
      borderRight="1px solid"
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      backgroundColor={colorMode === "light" ? "white" : "black"}
      paddingY="4"
      paddingX="4"
    >
      <VStack spacing="4" align="flex-start" width="full" height="100%">
        {/* Logo */}
        <Image
          cursor="pointer"
          alt="logo"
          w="110px"
          src={colorMode === "dark" ? "/logo.png" : "/logo.png"}
          borderRadius={9}
          marginBottom="4"
        />

        {/* Main navigation or Notifications */}
        {!showNotifications ? (
          <VStack as="ul" spacing="4" alignItems="flex-start" width="full">
            <Box as="li" width="full">
              <Link
                as={RouterLink}
                to="/"
                display="flex"
                alignItems="center"
                padding="2"
                borderRadius="lg"
                _hover={{
                  backgroundColor:
                    colorMode === "light" ? "gray.100" : "gray.800",
                }}
                width="full"
              >
                <AiFillHome size={24} />
                <Text fontSize="md" ml="3">
                  Home
                </Text>
              </Link>
            </Box>
            {user && (
              <>
                <Box as="li" width="full">
                  <Link
                    display="flex"
                    alignItems="center"
                    padding="2"
                    borderRadius="lg"
                    _hover={{
                      backgroundColor:
                        colorMode === "light" ? "gray.100" : "gray.800",
                    }}
                    width="full"
                    onClick={() => setShowNotifications(true)} // Show notifications
                  >
                    <Flex align="center" position="relative">
                      <IoNotifications size={24} />
                      {newNotificationCount > 0 && (
                        <Badge
                          colorScheme="red"
                          position="absolute"
                          top="-4px"
                          right="-6px"
                          fontSize="0.8em"
                          borderRadius="full"
                          padding="0 4px"
                          minWidth="16px"
                          height="16px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {newNotificationCount}
                        </Badge>
                      )}
                    </Flex>
                    <Text fontSize="md" ml="3">
                      Notifications
                    </Text>
                  </Link>
                </Box>
                <Box as="li" width="full">
                  <Link
                    as={RouterLink}
                    to={`/${user.username}`}
                    display="flex"
                    alignItems="center"
                    padding="2"
                    borderRadius="lg"
                    _hover={{
                      backgroundColor:
                        colorMode === "light" ? "gray.100" : "gray.800",
                    }}
                    width="full"
                  >
                    <RxAvatar size={24} />
                    <Text fontSize="md" ml="3">
                      Profile
                    </Text>
                  </Link>
                </Box>
                <Box as="li" width="full">
                  <Link
                    as={RouterLink}
                    to="/chat"
                    display="flex"
                    alignItems="center"
                    padding="2"
                    borderRadius="lg"
                    _hover={{
                      backgroundColor:
                        colorMode === "light" ? "gray.100" : "gray.800",
                    }}
                    width="full"
                  >
                    <BsFillChatQuoteFill size={20} />
                    <Text fontSize="md" ml="3">
                      Chat
                    </Text>
                  </Link>
                </Box>
                <Box as="li" width="full">
                  <Link
                    onClick={logout}
                    display="flex"
                    alignItems="center"
                    padding="2"
                    borderRadius="lg"
                    _hover={{
                      backgroundColor:
                        colorMode === "light" ? "gray.100" : "gray.800",
                    }}
                    width="full"
                    cursor="pointer"
                  >
                    <FiLogOut size={24} />
                    <Text fontSize="md" ml="3">
                      Logout
                    </Text>
                  </Link>
                </Box>
              </>
            )}
          </VStack>
        ) : (
          <Box width="full" flex="1" overflowY="auto">
            <Flex justify="space-between" align="center" mb="4">
              <Text fontSize="lg" fontWeight="bold">
                Notifications
              </Text>
              <Menu>
                <MenuButton>
                  <IoSettingsOutline size={20} />
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={deleteNotifications}>
                    Delete all notifications
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>

            {isLoading ? (
              <Flex justify="center" align="center" height="100%">
                <Spinner size="lg" />
              </Flex>
            ) : notifications?.length === 0 ? (
              <Text textAlign="center" fontWeight="bold">
                No notifications 🤔
              </Text>
            ) : (
              notifications.map((notification) => (
                <Flex
                  key={notification._id}
                  align="center"
                  p="4"
                  borderBottom="1px solid"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                >
                  <Image
                    src={notification.from.profilePic || "/avatar-placeholder.png"}
                    alt={`${notification.from.username}'s profile picture`}
                    boxSize="30px"
                    borderRadius="full"
                  />
                  {notification.type === "follow" ? (
                    <FaUser className="w-7 h-7 text-primary" />
                  ) : (
                    <FaHeart className="w-7 h-7 text-red-500" />
                  )}
                  <Link
                    to={notification.type === "follow"
                      ? `/profile/${notification.from.username}`
                      : `/post/${notification.postId}`}
                  >
                    <Text ml="3" fontSize="sm">
                      <strong>@{notification.from.username}</strong>{" "}
                      {notification.type === "follow"
                        ? "followed you"
                        : "liked your post"}
                    </Text>
                  </Link>
                </Flex>
              ))
            )}

            <Link
              color="blue.500"
              mt="6"
              onClick={() => {
                markAsSeen();
                setShowNotifications(false); // Back to main menu
              }}
            >
              Back
            </Link>
          </Box>
        )}

        {/* Theme toggle button */}
        <IconButton
          aria-label="Toggle theme"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
          colorScheme="gray"
          alignSelf="flex-start"
        />

        {/* Profile Section */}
        {user && (
          <Flex
            width="full"
            alignItems="center"
            marginTop="auto"
            padding="2"
            borderRadius="lg"
          >
            <Image
              src={user?.profilePic || "/avatar-placeholder.png"}
              alt={`${user?.fullName}'s profile`}
              boxSize="32px"
              borderRadius="full"
              mr="3"
            />
            <Text
              fontSize="sm"
              fontWeight="bold"
              color={colorMode === "light" ? "black" : "white"}
              textAlign="center"
              flex="1"
            >
              @{user?.username}
            </Text>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export default Sidebar;
