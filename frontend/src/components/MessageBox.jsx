import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  Text,
  useColorModeValue,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { FaCommentDots, FaTimes, FaArrowLeft } from "react-icons/fa";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import Conversation from "./Conversation";
import MessageContainer from "./MessageContainer";
import { useSocket } from "../context/SocketContext";

const MessageBox = () => {
  const [isOpen, setIsOpen] = useState(false); // Toggle message box visibility
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const setSelectedConversation = useSetRecoilState(selectedConversationAtom);
  const selectedConversation = useRecoilState(selectedConversationAtom)[0];
  const [unreadMessages, setUnreadMessages] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const { socket } = useSocket();

  // Theme-aware colors
  const boxBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.500", "blue.700");
  const textColor = useColorModeValue("white", "gray.200");

  // Fetch conversations when MessageBox is opened
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();
        if (!data.error) {
          setConversations(data);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoadingConversations(false);
      }
    };

    if (isOpen && conversations.length === 0) {
      fetchConversations();
    }
  }, [isOpen, setConversations, conversations]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      setConversations((prevConversations) => {
        let updatedConversations = [...prevConversations];
        const existingIndex = updatedConversations.findIndex(
          (conv) => conv.participants[0]?._id === message.sender
        );

        if (existingIndex !== -1) {
          // Update conversation and move to top
          const updatedConversation = {
            ...updatedConversations[existingIndex],
            lastMessage: { text: message.text, sender: message.sender },
          };
          updatedConversations.splice(existingIndex, 1);
          updatedConversations.unshift(updatedConversation);
        } else {
          // Add new conversation if not found
          updatedConversations.unshift({
            _id: Date.now(),
            participants: [{ _id: message.sender, username: "Fetching..." }],
            lastMessage: { text: message.text, sender: message.sender },
          });
        }
        return updatedConversations;
      });

      // Update unread messages
      setUnreadMessages((prev) => ({
        ...prev,
        [message.sender]: (prev[message.sender] || 0) + 1,
      }));
      setTotalUnreadCount((prevTotal) => prevTotal + 1);
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, setConversations]);

  // Open and reset notifications for the selected user
  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setUnreadMessages((prev) => {
      const updated = { ...prev };
      delete updated[conversation.participants[0]._id];
      return updated;
    });
    setTotalUnreadCount((prevTotal) =>
      prevTotal - (unreadMessages[conversation.participants[0]._id] || 0)
    );
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <Box position="fixed" bottom="20px" right="20px" zIndex="1000">
        <IconButton
          icon={<FaCommentDots />}
          colorScheme="blue" // Keep icon color original
          borderRadius="full"
          size="lg"
          aria-label="Toggle Chat"
          onClick={() => setIsOpen((prev) => !prev)}
        />
        {/* Red Badge for unread messages */}
        {totalUnreadCount > 0 && (
          <Badge
            bg="red.600"
            color="white"
            borderRadius="full"
            position="absolute"
            top="-5px"
            right="-5px"
            fontSize="0.8em"
          >
            {totalUnreadCount}
          </Badge>
        )}
      </Box>

      {/* Floating Chat Box */}
      {isOpen && (
        <Box
          position="fixed"
          bottom="80px"
          right="20px"
          w={{ base: "90%", sm: "350px" }}
          h="500px"
          bg={boxBg}
          boxShadow="lg"
          borderRadius="md"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          zIndex="1000"
        >
          {/* Header */}
          <Flex
            bg={headerBg}
            color={textColor}
            p={2}
            justify="space-between"
            align="center"
          >
            {selectedConversation?._id ? (
              <IconButton
                icon={<FaArrowLeft />}
                size="sm"
                variant="ghost"
                color={textColor}
                aria-label="Back to Conversations"
                onClick={() => setSelectedConversation(null)}
              />
            ) : (
              <Text fontWeight="bold">Chat</Text>
            )}
            <IconButton
              icon={<FaTimes />}
              size="sm"
              variant="ghost"
              color={textColor}
              aria-label="Close Chat"
              onClick={() => setIsOpen(false)}
            />
          </Flex>

          {/* Content */}
          <Box flex="1" overflowY="auto">
            {loadingConversations ? (
              <Flex justify="center" align="center" h="full">
                <Spinner size="lg" />
              </Flex>
            ) : !selectedConversation?._id ? (
              <ConversationsList
                conversations={conversations}
                unreadMessages={unreadMessages}
                handleConversationClick={handleConversationClick}
              />
            ) : (
              <MessageContainer />
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

// Conversations List Component
const ConversationsList = ({
  conversations,
  unreadMessages,
  handleConversationClick,
}) => {
  return conversations.map((conversation) => {
    const user = conversation?.participants?.[0];
    if (!user) return null;

    return (
      <Conversation
        key={conversation._id}
        conversation={conversation}
        isOnline={true}
        unreadCount={unreadMessages[user._id] || 0}
        onClick={() => handleConversationClick(conversation)}
      />
    );
  });
};

export default MessageBox;
