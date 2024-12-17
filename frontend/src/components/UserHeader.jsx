import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, useToast, Image } from "@chakra-ui/react";
import { BsInstagram, BsDownload } from "react-icons/bs"; // Added download icon
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const UserHeader = ({ user }) => {
	const toast = useToast();
	const currentUser = useRecoilValue(userAtom); // logged in user
	const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const copyURL = () => {
		const currentURL = window.location.href;
		navigator.clipboard.writeText(currentURL).then(() => {
			toast({
				title: "Success.",
				status: "success",
				description: "Profile link copied.",
				duration: 3000,
				isClosable: true,
			});
		});
	};

	const downloadPFP = () => {
		fetch(user.profilePic)
			.then((response) => response.blob())
			.then((blob) => {
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `${user.name}_profile_picture.jpg`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
			})
			.catch(() => {
				toast({
					title: "Error.",
					status: "error",
					description: "Failed to download the profile picture.",
					duration: 3000,
					isClosable: true,
				});
			});
	};

	return (
		<VStack gap={4} alignItems={"start"}>
			<Flex justifyContent={"space-between"} w={"full"}>
				<Box>
					<Text fontSize={"2xl"} fontWeight={"bold"}>
						{user.name}
					</Text>
					<Flex gap={2} alignItems={"center"}>
						<Text fontSize={"sm"}>{user.username}</Text>
						<Text fontSize={"xs"} bg={"gray.dark"} color={"gray.light"} p={1} borderRadius={"full"}>
							threads.net
						</Text>
					</Flex>
				</Box>
				<Box onClick={onOpen} cursor="pointer">
					{user.profilePic ? (
						<Avatar
							name={user.name}
							src={user.profilePic}
							size={{
								base: "md",
								md: "xl",
							}}
						/>
					) : (
						<Avatar
							name={user.name}
							src="https://bit.ly/broken-link"
							size={{
								base: "md",
								md: "xl",
							}}
						/>
					)}
				</Box>
			</Flex>

			<Text>{user.bio}</Text>

			{currentUser?._id === user._id && (
				<Link as={RouterLink} to="/update">
					<Button size={"sm"}>Update Profile</Button>
				</Link>
			)}
			{currentUser?._id !== user._id && (
				<Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
					{following ? "Unfollow" : "Follow"}
				</Button>
			)}

			<Flex w={"full"} justifyContent={"space-between"}>
				<Flex gap={2} alignItems={"center"}>
					<Text color={"gray.light"}>{user.followers.length} followers</Text>
					<Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
					<Link color={"gray.light"}>instagram.com</Link>
				</Flex>
				<Flex>
					<Box className="icon-container">
						<BsInstagram size={24} cursor={"pointer"} />
					</Box>
					<Box className="icon-container">
						<Menu>
							<MenuButton>
								<CgMoreO size={24} cursor={"pointer"} />
							</MenuButton>
							<Portal>
								<MenuList bg={"gray.dark"}>
									<MenuItem bg={"gray.dark"} onClick={copyURL}>
										Copy link
									</MenuItem>
								</MenuList>
							</Portal>
						</Menu>
					</Box>
				</Flex>
			</Flex>

			<Flex w={"full"}>
				<Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb="3" cursor={"pointer"}>
					<Text fontWeight={"bold"}>Posts</Text>
				</Flex>
				<Flex
					flex={1}
					borderBottom={"1px solid gray"}
					justifyContent={"center"}
					color={"gray.light"}
					pb="3"
					cursor={"pointer"}
				>
					<Text fontWeight={"bold"}>Replies</Text>
				</Flex>
			</Flex>

			{/* Modal for Viewing Profile Picture */}
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent bg="gray.dark" color="white">
					<ModalHeader>{user.name}'s Profile Picture</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Image src={user.profilePic || "https://bit.ly/broken-link"} alt={`${user.name}'s profile picture`} />
					</ModalBody>
					<ModalFooter>
						<Button colorScheme="blue" onClick={downloadPFP} leftIcon={<BsDownload />}>
							Download
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</VStack>
	);
};

export default UserHeader;
