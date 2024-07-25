import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './Api/authApi'; 
import { chatApi } from "./Api/chatApi";


const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, chatApi.middleware),
});

export default store;




