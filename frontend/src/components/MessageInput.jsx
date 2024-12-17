import {
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Box,
  IconButton,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import { BsFillImageFill, BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react"; // Install this library
import useShowToast from "../hooks/useShowToast";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import usePreviewImg from "../hooks/usePreviewImg";

const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const showToast = useShowToast();
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationsAtom);

  const imageRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();

  // Define colors for light and dark modes
  const inputBg = useColorModeValue("gray.100", "gray.800"); // Light mode: gray.100, Dark mode: gray.800
  const inputText = useColorModeValue("gray.800", "gray.100"); // Light mode: gray.800, Dark mode: gray.100
  const placeholderText = useColorModeValue("gray.500", "gray.400"); // Light mode: gray.500, Dark mode: gray.400
  const iconColor = useColorModeValue("gray.600", "gray.200"); // Light mode: gray.600, Dark mode: gray.200

  // Handle message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText && !imgUrl) return;
    if (isSending) return;

    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          recipientId: selectedConversation.userId,
          img: imgUrl,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      setMessages((messages) => [...messages, data]);

      setConversations((prevConvs) =>
        prevConvs.map((conversation) =>
          conversation._id === selectedConversation._id
            ? {
                ...conversation,
                lastMessage: { text: messageText, sender: data.sender },
              }
            : conversation
        )
      );
      setMessageText("");
      setImgUrl("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  // Add emoji to the input field
  const handleEmojiClick = (emojiObject) => {
    setMessageText((prev) => prev + emojiObject.emoji);
  };

  // Handle click outside emoji picker
  const handleOutsideClick = () => {
    if (isEmojiPickerVisible) {
      setIsEmojiPickerVisible(false);
    }
  };

  return (
    <Flex gap={2} alignItems={"center"} position="relative" onClick={handleOutsideClick}>
      {/* Message Input */}
      <form
        onSubmit={(e) => {
          e.stopPropagation(); // Prevent closing emoji picker
          handleSendMessage(e);
        }}
        style={{ flex: 95 }}
      >
        <InputGroup>
          <Input
            w="full"
            placeholder="Type a message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            borderRadius="full"
            bg={inputBg}
            color={inputText}
            pr="4rem" // Add padding to the right to make space for icons
            _placeholder={{ color: placeholderText }}
          />
          <InputRightElement width="4rem"> {/* Define width to ensure proper spacing */}
            {/* Emoji Icon */}
            <IconButton
              aria-label="Emoji Picker"
              icon={<BsEmojiSmile />}
              variant="ghost"
              size="sm"
              color={iconColor}
              onClick={(e) => {
                e.stopPropagation();
                setIsEmojiPickerVisible((prev) => !prev);
              }}
            />
            {/* Send Icon */}
            <IconButton
              aria-label="Send Message"
              icon={<IoSendSharp />}
              variant="ghost"
              size="sm"
              color={iconColor}
              onClick={handleSendMessage}
            />
          </InputRightElement>
        </InputGroup>
      </form>

      {/* Image Upload */}
      <Flex flex={5} cursor={"pointer"}>
        <BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
        <Input type={"file"} hidden ref={imageRef} onChange={handleImageChange} />
      </Flex>

      {/* Emoji Picker */}
      {isEmojiPickerVisible && (
        <Box position="absolute" bottom="50px" zIndex="10">
          <EmojiPicker
            onEmojiClick={(emojiObject) => {
              handleEmojiClick(emojiObject);
            }}
          />
        </Box>
      )}

      {/* Image Preview Modal */}
      <Modal
        isOpen={imgUrl}
        onClose={() => {
          onClose();
          setImgUrl("");
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mt={5} w={"full"}>
              <Image src={imgUrl} />
            </Flex>
            <Flex justifyContent={"flex-end"} my={2}>
              {!isSending ? (
                <IconButton
                  aria-label="Send"
                  icon={<IoSendSharp />}
                  variant="ghost"
                  size="lg"
                  onClick={handleSendMessage}
                />
              ) : (
                <Spinner size={"md"} />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default MessageInput;
