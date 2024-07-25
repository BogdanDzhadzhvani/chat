import React, { useEffect } from "react";
import { useLazyChatFindOneQuery } from "../store/Api/chatApi";

const ChatContent = ({ chatId }) => {
  const [chatFindOne, { data, error, isLoading }] = useLazyChatFindOneQuery();

  useEffect(() => {
    const loadChatData = async () => {
      try {
        await chatFindOne(chatId);
      } catch (err) {
        console.error("Failed to load chat data", err);
      }
    };

    if (chatId) {
      loadChatData();
    }
  }, [chatId, chatFindOne]);

  if (isLoading) return <p>Loading chat...</p>;
  if (error) return <p>Error loading chat: {error.message}</p>;

  const chat = data?.ChatFindOne;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {chat ? (
        <div>
          <h2 className="text-xl font-bold mb-4">Chat Details</h2>
          <p className="text-gray-700">Title: {chat.title}</p>
          <div className="flex items-center my-4">
            {chat.avatar ? (
              <img
                src={chat.avatar.owner.avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full mr-4"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 mr-4" />
            )}
            <div>
              <p className="text-gray-800 font-semibold">
                Owner: {chat.owner?.login || "Unknown"}
              </p>
              <p className="text-gray-600">
                Owner's Nickname: {chat.owner?.nick || "N/A"}
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold mt-4 mb-2">Members:</h3>
          <ul className="text-gray-700">
            {chat.members?.map((member) => (
              <li key={member._id} className="mb-2">
                Login: {member.login}, Nickname: {member.nick || "N/A"}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500">Select a chat to view its content.</p>
      )}
    </div>
  );
};
export default ChatContent;
