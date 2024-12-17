import { Flex, Link as ChakraLink, Box, Text } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/avatar";
import { BsThreeDots } from "react-icons/bs";
import { Image } from "@chakra-ui/image";
import Actions from "./Actions";
import { useState } from "react";
import { Link } from "react-router-dom";

const UserPost = ({postImg, postTitle, likes, replies}) => {
  const [liked, setLiked] = useState(false);

  return (
    <Link to={"/shoonlaenaychi/post/1"} style={{ textDecoration: 'none' }}>
      <Flex gap={3} mb={4} py={5}>
        <Flex flexDirection={"column"} alignItems={"center"}>
          <Avatar size="md" name="Shoon Lae Nay Chi" src="/hi.jpg" />
          <Box w="1px" h={"full"} bg="gray.light" my={2}></Box>
          
          <Box position={"relative"} w={"full"}>
            <Avatar
              size="xs"
              name="John Doe"
              src="https://bit.ly/dan-abramov"
              position={"absolute"}
              top={"0px"}
              left="15px"
              padding={"2px"}
            />
            <Avatar
              size="xs"
              name="John Doe"
              src="https://bit.ly/sage-adebayo"
              position={"absolute"}
              bottom={"0px"}
              right="-5px"
              padding={"2px"}
            />
            <Avatar
              size="xs"
              name="John Doe"
              src="https://bit.ly/prosper-baba"
              position={"absolute"}
              bottom={"0px"}
              left="4px"
              padding={"2px"}
            />
          </Box>
        </Flex>

        <Flex flex={1} flexDirection={"column"} gap={2}>
          <Flex justifyContent={"space-between"} w={"full"}>
            <Flex w={"full"} alignItems={"center"}>
              <Text fontSize={"sm"} fontWeight={"bold"}>
                shoonlaenaychi
              </Text>
              <Image src="/verified.png" w={4} h={4} ml={1} />
            </Flex>

            <Flex gap={4} alignItems={"center"}>
              <Text fontSize={"sm"} color={"gray.light"}>
                1d
              </Text>
              <BsThreeDots style={{ cursor: "pointer" }} />
            </Flex>
          </Flex>

          <Text fontSize={"sm"}>{postTitle}</Text>


         {postImg && (
						<Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
							<Image src={postImg} w={"full"} />
						</Box>
					)}

          <Flex gap={3} my={1}>
            {/* Ensure click on the like button does not trigger navigation */}
            <Actions liked={liked} setLiked={setLiked} />
          </Flex>
          <Flex gap={2} alignItems={"center"}>
            <Text color={"gray.light"} fontSize={"small"}>{replies} replies </Text>
            <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
            <Text color={"gray.light"} fontSize={"small"}>{likes} likes</Text>
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
};

export default UserPost;
