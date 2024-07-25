import React, { useState, useEffect } from "react";
import UserSearch from "../components/SearchUser";
import ChatInfo from "../components/ChatInfo";
import MessageSender from "../components/MessageSender";
import {
  useLazyUserFindQuery,
  useLazyChatFindQuery,
  useLazyMessageFindQuery,
} from "../store/Api/chatApi";
import io from "socket.io-client";
import ChatContent from "../components/ChatContent";
import { useNavigate } from "react-router";
import AvatarUploader from "../components/LoadUserAvatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userFindOne] = useLazyUserFindQuery();
  const [chatFind] = useLazyChatFindQuery();
  const [messageFind] = useLazyMessageFindQuery();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io("ws://chat.ed.asmer.org.ua");
    if (localStorage.token) {
      socket.emit("jwt", localStorage.token);
    }

    socket.on("jwt_ok", (data) => console.log("jwt_ok", data));
    socket.on("jwt_fail", (error) => console.log("jwt_fail", error));

    socket.on("connect", () => {
      console.log("connected to server");
    });

    socket.on("msg", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      setChatData((prevChatData) => {
        if (!prevChatData) return prevChatData;
        return {
          ...prevChatData,
          chats: prevChatData.chats.map((chat) =>
            chat._id === data.chat._id ? { ...chat, lastMessage: data } : chat
          ),
        };
      });
    });

    socket.on("chat", (data) => {
      setChatData((prevChatData) => {
        if (!prevChatData) return prevChatData;
        return {
          ...prevChatData,
          chats: prevChatData.chats.map((chat) =>
            chat._id === data._id ? { ...chat, ...data } : chat
          ),
        };
      });
    });

    socket.on("chat_left", (data) => {
      setChatData((prevChatData) => {
        if (!prevChatData) return prevChatData;
        return {
          ...prevChatData,
          chats: prevChatData.chats.filter((chat) => chat._id !== data.chatId),
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadChatData = async () => {
      try {
        const login = localStorage.getItem("login");
        const res = await userFindOne(login);

        if (res.data && res.data.UserFind) {
          setChatData(res.data.UserFind[0]);
        } else {
          console.error("No data received");
        }
      } catch (err) {
        console.error("Failed to load chat data", err);
      }
    };

    loadChatData();
  }, [userFindOne]);

  const handleChatSelection = async (chat) => {
    try {
      const chatLoad = await chatFind(chat._id);
      const messageLoad = await messageFind({
        chatId: chat._id,
        limit: 10,
        skip: 0,
        sort: -1,
      });

      if (chatLoad.error) {
        throw new Error(chatLoad.error);
      }

      if (!chatLoad.data || !chatLoad.data.ChatFind) {
        throw new Error("No chat data found");
      }

      const setMessage = [...messageLoad.data.MessageFind].reverse();

      const setChat = chatLoad.data.ChatFind[0];
      setSelectedChat(setChat);
      setMessages(setMessage);
      navigate(`/chat/${chat._id}`);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const handleOutsideClick = (event) => {
    if (
      isMenuOpen &&
      !event.target.closest("#menu") &&
      !event.target.closest("#menu-button")
    ) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex min-h-screen bg-white relative">
      <button
        id="menu-button"
        className={`absolute top-4 left-4 p-2 rounded z-50 ${
          isMenuOpen ? "bg-gray-800 text-white" : "bg-white"
        }`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? "×" : "☰"}
      </button>
      <aside
        id="menu"
        className={`fixed inset-y-0 left-0 bg-white bg-opacity-75 z-40 w-64 transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-gray-700 p-4 h-full flex flex-col">
          <div className="flex-grow">
            <AvatarUploader />
            <div className="mt-4 text-white">
              <div className="text-xl font-bold">
                Hello {localStorage.login}
              </div>
            </div>
          </div>
          <button
            className="p-2 bg-red-500 text-white rounded mt-4"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("login");
              localStorage.removeItem("userId");
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <aside className="w-16 bg-gray-700 p-4 overflow-y-auto flex-shrink-0"></aside>
      <aside className="w-1/4 bg-white p-4 flex-shrink-0 overflow-y-auto h-screen">
        <UserSearch onSelectChat={handleChatSelection} />
        {chatData && (
          <div className="bg-white p-2 rounded mb-4">
            <h2 className="text-xl font-bold mb-2">Active Chats</h2>
            {chatData.chats
              .filter((chat) => chat.lastMessage !== null)
              .map((chat) => {
                const currentUserId = localStorage.getItem("userId");
                const memberWithAvatar = chat.members
                  .filter((member) => member._id !== currentUserId)
                  .find((member) => member.avatar && member.avatar.url);
                const avatarUrl = memberWithAvatar
                  ? memberWithAvatar.avatar.url
                  : null;
                const avatar = avatarUrl
                  ? `http://chat.ed.asmer.org.ua/${avatarUrl}`
                  : null;
                return (
                  <div
                    key={chat._id}
                    className={`mb-2 p-2 rounded cursor-pointer flex items-center hover:bg-gray-100 transition-shadow shadow-sm hover:shadow-md ${
                      selectedChat && selectedChat._id === chat._id
                        ? "bg-blue-100"
                        : "bg-white"
                    }`}
                    onClick={() => handleChatSelection(chat)}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 flex-shrink-0 flex items-center justify-center">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-gray-500 w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold">{chat.title}</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage.text}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </aside>
      <main className="flex-grow flex flex-col bg-gray-50">
        <div className="flex flex-col h-screen overflow-hidden">
          {selectedChat ? (
            <>
              <div className="flex-grow overflow-y-auto">
                <ChatInfo
                  chat={selectedChat}
                  messages={messages}
                  setMessages={setMessages}
                />
              </div>
              <div className="w-full">
                <MessageSender chatId={selectedChat._id} />
              </div>
            </>
          ) : (
            <p>Select a chat to start messaging.</p>
          )}
        </div>
      </main>
      {selectedChat && (
        <aside className="w-1/4 bg-gray-200 p-4 overflow-y-auto flex-shrink-0">
          <ChatContent chatId={selectedChat._id} />
        </aside>
      )}
    </div>
  );
};

export default ChatPage;