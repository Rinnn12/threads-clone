import {
	Avatar,
	AvatarBadge,
	Box,
	Flex,
	Image,
	Stack,
	Text,
	WrapItem,
	useColorMode,
	useColorModeValue,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/messagesAtom";

const Conversation = ({ conversation, isOnline }) => {
	const user = conversation.participants[0];
	const currentUser = useRecoilValue(userAtom);
	const lastMessage = conversation.lastMessage;
	const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
	const { colorMode } = useColorMode();

	// Dynamically set background color for light and dark modes
	const bgColor = selectedConversation?._id === conversation._id
		? useColorModeValue("gray.200", "gray.700") // light: gray.200, dark: gray.700
		: useColorModeValue("white", "gray.800"); // light: white, dark: gray.800

	// Dynamically set hover background color
	const hoverBgColor = useColorModeValue("gray.200", "gray.700");

	// Dynamically set text color for last message
	const lastMessageTextColor = useColorModeValue("gray.600", "gray.300");

	return (
		<Flex
			gap={4}
			alignItems={"center"}
			p={"2"}
			borderRadius={"md"}
			_hover={{
				cursor: "pointer",
				bg: hoverBgColor,
				color: useColorModeValue("black", "white"), // Ensure text changes to readable color on hover
			}}
			onClick={() =>
				setSelectedConversation({
					_id: conversation._id,
					userId: user._id,
					userProfilePic: user.profilePic,
					username: user.username,
					mock: conversation.mock,
				})
			}
			bg={bgColor} // Apply dynamic background color
		>
			<WrapItem>
				<Avatar
					size={{
						base: "xs",
						sm: "sm",
						md: "md",
					}}
					src={user.profilePic}
				>
					{isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
				</Avatar>
			</WrapItem>

			<Stack direction={"column"} fontSize={"sm"} spacing={1}>
				<Text fontWeight="700" display={"flex"} alignItems={"center"} color={useColorModeValue("gray.800", "gray.200")}>
					{user.username} <Image src='/verified.png' w={4} h={4} ml={1} />
				</Text>
				<Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1} color={lastMessageTextColor}>
					{currentUser._id === lastMessage.sender && (
						<Box color={lastMessage.seen ? "blue.400" : ""}>
							<BsCheck2All size={16} />
						</Box>
					)}
					{lastMessage.text.length > 18
						? lastMessage.text.substring(0, 18) + "..."
						: lastMessage.text || <BsFillImageFill size={16} />}
				</Text>
			</Stack>
		</Flex>
	);
};

export default Conversation;
