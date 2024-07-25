import React, { useState, useEffect, useRef } from "react";
import {
  useLazyUserFindOneQuery,
  useChatUpsertMutation,
  useChatDeleteMutation,
} from "../store/Api/chatApi";

const UserSearch = ({ onSelectChat }) => {
  const [login, setLogin] = useState("");
  const [findUser, { isLoading, error, data }] = useLazyUserFindOneQuery();
  const [
    chatUpsert,
    { data: chatData, isLoading: chatLoading, error: chatError },
  ] = useChatUpsertMutation();
  const [chatDelete, { isLoading: chatDeleteLoading, error: chatDeleteError }] =
    useChatDeleteMutation();
  const token = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const openChat = () => {
    if (data && data.UserFindOne) {
      const chatInput = {
        title: "Chat with " + data.UserFindOne.login,
        members: [{ _id: data.UserFindOne._id }],
        messages: [],
      };
      chatUpsert({ chatInput });
      setLogin("");
      setIsOpen(false);
    }
  };

  const deleteChat = (chatId) => {
    if (chatId) {
      const chatInput = {
        _id: chatId,
      };
      chatDelete({ chat: chatInput });
    }
  };

  useEffect(() => {
    if (chatData && chatData.ChatUpsert) {
      onSelectChat(chatData.ChatUpsert);
    }
  }, [chatData, onSelectChat]);

  const handleInputChange = (e) => {
    setLogin(e.target.value);
    if (e.target.value.trim() !== "" && token) {
      findUser(e.target.value);
      setIsOpen(true);
    } else {
      setLogin("");
      setIsOpen(false);
    }
  };

  const clearInput = () => {
    setLogin("");
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={login}
          onChange={handleInputChange}
          placeholder="Enter user login..."
          className="bg-gray-100 rounded-full p-2 mb-4 w-full focus:outline-none"
        />
        {login && (
          <button
            onClick={clearInput}
            className="absolute top-0 right-0 mt-2 mr-2 bg-transparent outline-none cursor-pointer"
          >
            X
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute bg-white shadow-md rounded w-full mt-1">
          {isLoading && <p className="p-2">Loading...</p>}
          {error && <p className="p-2 text-red-500">Error: {error.message}</p>}
          {data && data.UserFindOne && (
            <div>
              <p className="p-2">Login: {data.UserFindOne.login}</p>
              <p className="p-2">Nick: {data.UserFindOne.nick}</p>
              <button
                onClick={openChat}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full mt-2"
              >
                Open Chat
              </button>
              {chatData && chatData.ChatUpsert && (
                <button
                  onClick={() => deleteChat(chatData.ChatUpsert._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full mt-2"
                >
                  Delete Chat
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {chatLoading && <p>Loading...</p>}
      {chatError && <p className="text-red-500">Error: {chatError.message}</p>}
      {chatDeleteLoading && <p>Deleting chat...</p>}
      {chatDeleteError && (
        <p className="text-red-500">Error: {chatDeleteError.message}</p>
      )}
    </div>
  );
};

export default UserSearch;
