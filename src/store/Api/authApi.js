import { createApi } from "@reduxjs/toolkit/query/react";
import { jwtDecode } from "jwt-decode";


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

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: gqlBaseQuery({ baseUrl: "http://chat.ed.asmer.org.ua/graphql" }),
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: ({ login, password }) => ({
        body: `
          query login($login: String!, $password: String!) {
            login(login: $login, password: $password)
          }
        `,
        variables: { login, password },
      }),
      transformResponse: (response) => {
        console.log("Response from server:", response);
        const token = response.login;
        if (!token) {
          throw new Error("Invalid response structure");
        }
        const payload = jwtDecode(token);
        return { token, payload };
      },
    }),
    registerUser: builder.mutation({
      query: ({ login, password }) => ({
        body: `
          mutation register($login: String!, $password: String!) {
            UserUpsert(user: { login: $login, password: $password }) {
              _id
              login
              createdAt
            }
          }
        `,
        variables: { login, password },
      }),
    }),
  }),
});

export const { useLoginUserMutation, useRegisterUserMutation } = authApi;

