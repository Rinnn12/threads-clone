import {
  Flex,
  Spinner,
  Text,
  Box,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaCommentDots } from "react-icons/fa";
import Post from "../components/Post";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";
import MessageBox from "../components/MessageBox";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false); // Toggle chat box
  const showToast = useShowToast();

  const boxBgColor = useColorModeValue("white", "gray.700");

  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        const res = await fetch("/api/posts/feed");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    getFeedPosts();
  }, [showToast, setPosts]);

  return (
    <Flex gap={10} alignItems="flex-start" position="relative">
      {/* Feed Section */}
      <Box flex={70}>
        {!loading && posts.length === 0 && (
          <Flex justify="center" align="center" h="50vh">
            <Box
              p={6}
              border="2px solid"
              borderColor="gray.300"
              borderRadius="lg"
              boxShadow="md"
              bg={boxBgColor}
            >
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                😢 Your feed is empty! <br /> Follow some users to see their
                latest posts.
              </Text>
            </Box>
          </Flex>
        )}

        {loading && (
          <Flex justify="center">
            <Spinner size="xl" />
          </Flex>
        )}

        {posts.map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        ))}
      </Box>

      {/* Suggested Users Section */}
      <Box
        flex={30}
        display={{
          base: "none",
          md: "block",
        }}
      >
        <SuggestedUsers />
      </Box>

      {/* Floating Chat Icon */}
      <IconButton
        icon={<FaCommentDots />}
        aria-label="Chat"
        position="fixed"
        bottom="20px"
        right="20px"
        size="lg"
        colorScheme="blue"
        onClick={() => setIsChatOpen((prev) => !prev)} // Toggle chat box
        zIndex={1000}
      />

      {/* Floating Chat Box */}
      <MessageBox isOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
    </Flex>
  );
};

export default HomePage;
