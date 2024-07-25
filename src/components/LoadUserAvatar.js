import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import {
  useUpsertUserAvatarMutation,
  useLazyUserFindQuery,
} from "../store/Api/chatApi";

const originalFetch = fetch;
const customFetch = (url, params = {}) => {
  params.headers = params.headers || {};
  params.headers.Authorization = "Bearer " + localStorage.getItem("token");
  return originalFetch(url, params);
};

const AvatarUploader = () => {
  const [file, setFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userUpdate] = useUpsertUserAvatarMutation();
  const [fetchUser] = useLazyUserFindQuery();

  useEffect(() => {
    const loadUserAvatar = async () => {
      try {
        const userResponse = await fetchUser(localStorage.login);
        const avatar = userResponse.data.UserFind[0]?.avatar?.url;
        if (avatar) {
          setAvatarUrl(`http://chat.ed.asmer.org.ua/${avatar}`);
        }
      } catch (error) {
        console.error("Ошибка загрузки аватара пользователя", error);
      }
    };
    loadUserAvatar();
  }, [fetchUser]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);

    try {
      const response = await customFetch("http://chat.ed.asmer.org.ua/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Ошибка загрузки файла: ${response.status} ${text}`);
      }

      const result = await response.json();
      const mediaId = result._id;

      try {
        if (mediaId) {
          const avatarPayload = {
            _id: mediaId,
            userAvatar: { _id: localStorage.userId },
          };

          await userUpdate(avatarPayload);

          const userResponse = await fetchUser(localStorage.login);
          const avatar = userResponse.data.UserFind[0]?.avatar?.url;
          if (avatar) {
            setAvatarUrl(`http://chat.ed.asmer.org.ua/${avatar}`);
          }
        }

        setFile(null);
      } catch (error) {
        console.error("Ошибка загрузки аватара", error);
      }
    } catch (error) {
      console.error("Ошибка отправки сообщения или загрузки файла", error);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="flex items-center p-2"
      >
        <label className="flex items-center mr-2 cursor-pointer relative">
          <input
            type="file"
            name="avatar"
            onChange={handleFileChange}
            className="hidden"
          />
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <FaUserCircle size={40} className="text-gray-500" />
          )}
        </label>
        <button
          type="submit"
          className="ml-2 bg-gray-800 text-white rounded-full p-2"
        >
          Upload Avatar
        </button>
      </form>
    </div>
  );
};

export default AvatarUploader;
