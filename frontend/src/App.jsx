import { Box, Flex, Container } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import Sidebar from "./components/Sidebar"; // Import Sidebar
import TopBar from "./components/TopBar"; // Sticky top bar
import BottomNav from "./components/BottomNav"; // Bottom navigation bar
import ChatPage from "./pages/ChatPage";
import NotificationPage from "./pages/NotificationPage";

function App() {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();

  return (
    <Box position={"relative"} w="full">
      <Flex direction="column" position="relative" w="full" minH="100vh">
        {/* Top Bar */}
        <TopBar />

        {/* Main Content */}
        <Flex flex="1" direction="row" w="full">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Feed Area */}
          <Box as="main" flex="1" ml={{ base: 0, md: "200px" }} pt="4">
            <Container
              maxW={pathname === "/" ? { base: "620px", md: "900px" } : "620px"}
            >
              <Routes>
                <Route
                  path="/"
                  element={user ? <HomePage /> : <Navigate to="/auth" />}
                />
                <Route
                  path="/auth"
                  element={!user ? <AuthPage /> : <Navigate to="/" />}
                />
                <Route
                  path="/update"
                  element={
                    user ? <UpdateProfilePage /> : <Navigate to="/auth" />
                  }
                />
                <Route
                  path="/:username"
                  element={
                    user ? (
                      <>
                        <UserPage />
                        <CreatePost />
                      </>
                    ) : (
                      <UserPage />
                    )
                  }
                />
                <Route path="/:username/post/:pid" element={<PostPage />} />
                <Route
                  path="/chat"
                  element={user ? <ChatPage /> : <Navigate to={"/auth"} />}
                />
                <Route
                  path="/notifications"
                  element={user ? <NotificationPage/> : <Navigate to={"/auth"} />}
                />


              </Routes>
            </Container>
          </Box>
        </Flex>

        {/* Bottom Navigation Bar */}
        <BottomNav />
      </Flex>
    </Box>
  );
}

export default App;
