import { createApi } from "@reduxjs/toolkit/query/react";

const gqlBaseQuery =
  ({ baseUrl }) =>
  async ({ body, variables }) => {
    const token = localStorage.getItem("token");
    const result = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        query: body,
        variables: variables,
      }),
    });
    const json = await result.json();
    if (json.errors) {
      throw new Error(json.errors.map((error) => error.message).join(", "));
    }
    return { data: json.data };
  };

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: gqlBaseQuery({ baseUrl: "http://chat.ed.asmer.org.ua/graphql" }),
  endpoints: (builder) => ({
    userFindOne: builder.query({
      query: (login) => ({
        body: `
          query userFindOne {
            UserFindOne(query: "[{\\"login\\": \\"${login}\\"}]") {
              _id
              login
              nick
              acl
            }
          }
        `,
      }),
    }),
    chatUpsert: builder.mutation({
      query: ({ chatInput }) => ({
        body: `mutation ChatUpsert($chat: ChatInput!) {
            ChatUpsert(chat: $chat) {
              _id
              createdAt
              lastModified
              lastMessage {
                _id
                text
                createdAt
              }
              owner {
                _id
                login
              }
              title
              members {
                _id
                login
              }
              messages {
                _id
                text
                createdAt
              }
              avatar {
                url
              }
            }
          }`,
        variables: { chat: chatInput },
      }),
    }),
    chatDelete: builder.mutation({
      query: ({ chat }) => ({
        body: `mutation ChatDelete($chat: ChatInput!) {
            ChatDelete(chat: $chat) {
            _id
            members {
              _id
              createdAt
              login
              nick
            }
          }
        }`,
        variables: { chat },
      }),
    }),
    messageUpsert: builder.mutation({
      query: ({ message }) => ({
        body: `mutation message($message: MessageInput!) {
                  MessageUpsert(message: $message) {
              _id owner {
                _id
                createdAt
                login
                nick
              } media {
                _id
                createdAt
                owner {
                  _id
                  createdAt
                  login
                  nick
                }
                url
              } chat {
                _id
                createdAt
                lastModified
                title
              } replyTo {
                _id
                createdAt
                text
              }
            }
          }`,
        variables: { message },
      }),
    }),
    chatFindOne: builder.query({
      query: (id) => ({
        body: `
          query chatFindOne {
            ChatFindOne(query: "[{\\"_id\\": \\"${id}\\"}]") {
              _id
              avatar {
                owner{
                  avatar {
                    _id
                    createdAt
                    text
                    url
                    originalFileName
                    type
                  }
                }
                _id
                createdAt
                text
                url
                originalFileName
                type
              }
              owner {
                _id
                createdAt
                login
                nick
              }
              members {
                _id
                createdAt
                login
                nick
              }
              lastMessage {
                _id
                createdAt
                text
              }
              title
            }
          }
        `,
        variables: { id },
      }),
    }),
    userFind: builder.query({
      query: (login) => ({
        body: `
          query userFind {
            UserFind(query: "[{\\"login\\": \\"${login}\\"}]"){
              _id
              login
              avatar {
                _id
                createdAt
                text
                url
                originalFileName
                type
              }
              nick
              chats {
                members {
                  _id
                  createdAt
                  login
                  nick
                  avatar {
                    _id
                    createdAt
                    text
                    url
                    originalFileName
                    type
                  }
                }
                _id
                createdAt
                lastModified
                title
                lastMessage {
                  _id
                  createdAt
                  text
                }
              }
            }
      }
        `,
        variables: { login },
      }),
    }),
    chatFind: builder.query({
      query: (id) => ({
        body: `
          query chatFind {
            ChatFind(query: "[{\\"_id\\": \\"${id}\\"}]") {
              _id
              owner {
                login
                nick
              }
              members {
                _id
                login
                nick
                avatar {
                  _id
                  url
                  originalFileName
                }
              }
              lastModified
              title
              messages {
                _id
                media {
                  _id
                  createdAt
                  text
                  url
                  originalFileName
                  type
                }
                owner {
                  _id
                  createdAt
                  login
                  nick
                }
                _id
                createdAt
                text
              }
            }
          }
        `,
        variables: { id },
      }),
    }),
    messageFind: builder.query({
      query: ({ chatId, limit , skip, sort }) => ({
        body: `
          query FindMessages {
            MessageFind(query: "[{ \\"chat._id\\": \\"${chatId}\\" },{\\"sort\\": [{\\"_id\\": ${sort}}],\\"limit\\": [${limit}],\\"skip\\": [${skip}]}]") {
              _id
              createdAt
            owner {
                _id
                createdAt
                login
                nick
              }
              text
              media {
              _id
                url
                originalFileName
              }
            }
          }
        `,
        variables: {chatId,limit,skip,sort},
      }),
    }),

    mediaUpsert: builder.mutation({
      query: ( {media} ) => ({
        body: `
          mutation MediaUpsert {
            MediaUpsert(media: {_id: "${media}"} ) {
              _id
              createdAt
              owner {
                _id
                login
                nick
              }
              text
              url
              originalFileName
              type
            }
          }
        `,
        variables: { media },
      }),
    }),
    upsertUserAvatar: builder.mutation({
      query: ( media ) => ({
        body: `
          mutation MediaUpsert($media: MediaInput!) {
            MediaUpsert(media: $media) {
              _id
              createdAt
              owner {
                _id
                login
                nick
              }
              text
              url
              originalFileName
              type
            }
          }
        `,
        variables: { media },
      }),
    }),
  }),
});

export const {
  useLazyUserFindOneQuery,
  useChatUpsertMutation,
  useChatDeleteMutation,
  useMessageUpsertMutation,
  useLazyChatFindOneQuery,
  useLazyUserFindQuery,
  useLazyChatFindQuery,
  useLazyMessageFindQuery,
  useMediaUpsertMutation,
  useUpsertUserAvatarMutation,
} = chatApi;

export default chatApi;
