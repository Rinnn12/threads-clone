import { Button } from "@chakra-ui/button";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import { FiLogOut } from "react-icons/fi";



const LogoutButton = () => {
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast(); 
  const handleLogout = async () => {
    try {
      // Remove user data from local storage
     

      // Call the logout API
      const res = await fetch("/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
          
        
      }
      localStorage.removeItem("user-threads");

      // Clear user state
      setUser(null);
    } catch (error) {
        showToast("Error", error, "error");
    }
  };

  return (
    <Button
      position="fixed"
      top="30px"
      right="30px"
      size="sm"
      onClick={handleLogout}
    >
      <FiLogOut  size={20}/>
    </Button>
  );
};

export default LogoutButton;
