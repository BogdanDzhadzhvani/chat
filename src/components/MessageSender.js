import React, { useRef, useState } from "react";
import { FaPaperPlane, FaPaperclip } from "react-icons/fa";
import { useMessageUpsertMutation } from "../store/Api/chatApi";

const originalFetch = fetch;
const customFetch = (url, params = {}) => {
  params.headers = params.headers || {};
  params.headers.Authorization = "Bearer " + localStorage.getItem("token");
  return originalFetch(url, params);
};

const MessageSender = ({ chatId }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const formRef = useRef(null);
  const [messageUpsert] = useMessageUpsertMutation();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("message", message);

    let mediaId = null;

    if (file) {
      formData.append("media", file);

      try {
        const response = await customFetch(
          "http://chat.ed.asmer.org.ua/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Ошибка загрузки файла: ${response.status} ${text}`);
        }

        const result = await response.json();
        console.log("UPLOAD RESULT", result);

        mediaId = result._id;
      } catch (error) {
        console.error("Ошибка отправки сообщения или загрузки файла", error);
      }
    }

    try {
      if (message || mediaId) {
        const messagePayload = {
          message: {
            chat: { _id: chatId },
            text: message,
            media: mediaId ? [{ _id: mediaId }] : [],
          },
        };

        await messageUpsert(messagePayload);
      }

      setFile(null);
      setMessage("");
    } catch (error) {
      console.error("Ошибка отправки сообщения", error);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="relative flex items-center p-2 border-t border-gray-200 bg-white"
    >
      <label className="flex items-center mr-2 cursor-pointer">
        <input
          type="file"
          name="media"
          onChange={handleFileChange}
          className="hidden"
        />
        <FaPaperclip size={20} className="text-gray-500" />
      </label>
      <input
        type="text"
        value={message}
        onChange={handleMessageChange}
        placeholder="Type your message here..."
        className="flex-grow border rounded-full p-2 mr-12 pl-8"
        style={{ minWidth: "200px" }}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full flex items-center justify-center w-10 h-10"
      >
        <FaPaperPlane size={20} />
      </button>
    </form>
  );
};

export default MessageSender;
