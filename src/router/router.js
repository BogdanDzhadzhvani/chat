import { createBrowserRouter } from "react-router-dom";
import ChatPage from "../pages/chatPage";
import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/registerPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage/>,
  },
  {
    path: "/chat",
    element: <ChatPage/>,
  },
  {
    path: "/chat/:chatId",
    element: <ChatPage/>,
  },
  {
    path: "/registration",
    element: <RegisterPage/>,
  },
]);

export default router;