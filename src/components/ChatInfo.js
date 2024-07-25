import React, { useEffect, useRef, useCallback, useState } from "react";
import { useLazyMessageFindQuery } from "../store/Api/chatApi";

const ChatInfo = ({ chat, messages, setMessages }) => {
  const [fetchMessages, { isLoading }] = useLazyMessageFindQuery();
  const containerRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const [initialRender, setInitialRender] = useState(true);

  const handleScroll = useCallback(async () => {
    const container = containerRef.current;
    if (!container || isLoading) return;

    if (container.scrollTop === 0) {
      const previousScrollHeight = container.scrollHeight;
      scrollPositionRef.current = container.scrollTop;

      const newMessages = await fetchMessages({
        chatId: chat._id,
        limit: 10,
        skip: messages.length,
        sort: -1,
      }).unwrap();

      const reversedMessages = [...newMessages.MessageFind].reverse();

      if (newMessages.MessageFind.length > 0) {
        setMessages((prevMessages) => [...reversedMessages, ...prevMessages]);

        requestAnimationFrame(() => {
          const container = containerRef.current;
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop =
              newScrollHeight -
              previousScrollHeight +
              scrollPositionRef.current;
          }
        });
      }
    }
  }, [chat._id, fetchMessages, isLoading, messages.length, setMessages]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        if (container) {
          container.removeEventListener("scroll", handleScroll);
        }
      };
    }
  }, [handleScroll]);

  useEffect(() => {
    if (initialRender) {
      const container = containerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
        setInitialRender(false);
      }
    }
  }, [initialRender, messages.length]);

  useEffect(() => {
    setInitialRender(true);
  }, [chat._id]);

  const sortedMessages = messages.slice().sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
  };

  const getFullMediaUrl = (url) => {
    const baseUrl = "http://chat.ed.asmer.org.ua/";
    return `${baseUrl}${url}`;
  };

  const currentUserId = localStorage.getItem("userId");

  return (
    <div
      className="chat-info-container h-full overflow-y-auto bg-gray-100"
      ref={containerRef}
    >
      <div className="chat-info p-4">
        {chat ? (
          <>
            <h2 className="text-2xl font-bold mb-4">{chat.title}</h2>
            <p className="mb-2">Chat ID: {chat._id}</p>
            <p className="mb-4">Owner: {chat.owner.login}</p>

            <div className="messages">
              <h3 className="text-xl font-semibold mb-2">Messages:</h3>
              <ul className="list-none p-0">
                {sortedMessages.map((message) => (
                  <li
                    key={message._id}
                    className={`mb-4 p-3 rounded-md ${
                      message.owner._id === currentUserId
                        ? "bg-blue-400 text-white self-end"
                        : "bg-white text-black self-start"
                    }`}
                    style={{
                      alignSelf:
                        message.owner._id === currentUserId
                          ? "flex-end"
                          : "flex-start",
                      marginLeft:
                        message.owner._id === currentUserId ? "auto" : "0",
                      marginRight:
                        message.owner._id === currentUserId ? "0" : "auto",
                      maxWidth: "75%",
                      wordBreak: "break-word",
                    }}
                  >
                    <strong>{message.owner.login}:</strong> {message.text}
                    {message.media && message.media.length > 0 && (
                      <div className="mb-2">
                        {message.media
                          .filter((mediaItem) => mediaItem && mediaItem.url)
                          .map((mediaItem) => (
                            <a
                              key={mediaItem._id}
                              href={getFullMediaUrl(mediaItem.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={getFullMediaUrl(mediaItem.url)}
                                alt={mediaItem.originalFileName}
                                className="w-full h-auto rounded-md border border-gray-300"
                                style={{
                                  objectFit: "contain",
                                  maxHeight: "300px",
                                }}
                              />
                            </a>
                          ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-600">
                      {formatDate(message.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p>Select a chat to see details</p>
        )}
      </div>
    </div>
  );
};

export default ChatInfo;
