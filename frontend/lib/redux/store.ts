import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import logger from "redux-logger";

// Import reducers
import tokensReducer from "./slices/tokensSlice";
import transactionsReducer from "./slices/transactionsSlice";

// Create a custom storage that works in both client and server environments
const createNoopStorage = () => {
  return {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  };
};

// Use proper storage based on environment
const reduxStorage =
  typeof window !== "undefined" ? storage : createNoopStorage();

// Configure persist
const persistConfig = {
  key: "root",
  storage: reduxStorage,
  whitelist: ["tokens", "transactions"], // only these reducers will be persisted
};

const rootReducer = combineReducers({
  tokens: tokensReducer,
  transactions: transactionsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with conditional middleware for server vs client
const createStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        },
      }).concat(typeof window !== "undefined" ? [logger] : []),
    devTools: process.env.NODE_ENV !== "production",
  });

  return store;
};

export const store = createStore();
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
