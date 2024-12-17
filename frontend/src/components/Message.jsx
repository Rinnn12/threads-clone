import { format } from "date-fns"; // Install this library for date formatting
import { Avatar, Box, Flex, Image, Skeleton, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Button, useColorModeValue } from "@chakra-ui/react";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";

const Message = ({ ownMessage, message }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // To control modal visibility
  const [currentImage, setCurrentImage] = useState(""); // For the current image to be displayed in the modal

  // Colors based on light/dark mode
  const messageBg = useColorModeValue("gray.300", "gray.700"); // Light/dark background for messages
  const textColor = useColorModeValue("black", "white"); // Text color for light/dark mode
  const ownMessageBg = useColorModeValue("yellow.400", "yellow.600"); // For own messages

  // Format the timestamp
  const messageDate = format(new Date(message.createdAt), "hh:mm a, MMM dd"); // Example: 12:45 PM, Jan 10

  // Open the modal and set the current image
  const openImageModal = (imgUrl) => {
    setCurrentImage(imgUrl);
    setIsOpen(true);
  };

  // Close the modal
  const closeImageModal = () => {
    setIsOpen(false);
    setCurrentImage(""); // Clear the current image
  };

  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={"flex-end"}>
          {message.text && (
            <Flex direction="column" alignItems="flex-end">
              <Flex bg={ownMessageBg} maxW={"350px"} p={1} borderRadius={"md"}>
                <Text color={"white"}>{message.text}</Text>
                <Box
                  alignSelf={"flex-end"}
                  ml={1}
                  color={message.seen ? "blue.400" : ""}
                  fontWeight={"bold"}
                >
                  <BsCheck2All size={16} />
                </Box>
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {messageDate}
              </Text>
            </Flex>
          )}

          {/* Image Message */}
          {message.img && !imgLoaded && (
            <Flex mt={5} w={"200px"} onClick={() => openImageModal(message.img)}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="Message image"
                borderRadius={4}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}

          {/* Image with Loaded State */}
          {message.img && imgLoaded && (
            <Flex direction="column" alignItems="flex-end">
              <Flex mt={5} w={"300px"} onClick={() => openImageModal(message.img)}>
                <Image src={message.img} alt="Message image" borderRadius={4} />
                <Box
                  alignSelf={"flex-end"}
                  ml={1}
                  color={message.seen ? "blue.400" : ""}
                  fontWeight={"bold"}
                >
                  <BsCheck2All size={16} />
                </Box>
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {messageDate}
              </Text>
            </Flex>
          )}

          <Avatar src={user.profilePic} w="7" h={7} />
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar src={selectedConversation.userProfilePic} w="7" h={7} />

          {message.text && (
            <Flex direction="column">
              <Text maxW={"350px"} bg={messageBg} p={1} borderRadius={"md"} color={textColor}>
                {message.text}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {messageDate}
              </Text>
            </Flex>
          )}

          {/* Image Message */}
          {message.img && !imgLoaded && (
            <Flex mt={5} w={"200px"} onClick={() => openImageModal(message.img)}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="Message image"
                borderRadius={4}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}

          {/* Image with Loaded State */}
          {message.img && imgLoaded && (
            <Flex direction="column">
              <Flex mt={5} w={"300px"} onClick={() => openImageModal(message.img)}>
                <Image src={message.img} alt="Message image" borderRadius={4} />
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {messageDate}
              </Text>
            </Flex>
          )}
        </Flex>
      )}

      {/* Modal for Image Preview */}
      <Modal isOpen={isOpen} onClose={closeImageModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Image Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Image displayed in modal */}
            <Image src={currentImage} alt="Full view" borderRadius={4} />
            {/* Download button */}
            <Button
              as="a"
              href={currentImage}
              download
              mt={4}
              colorScheme="teal"
              width="full"
            >
              Download Image
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Message;
