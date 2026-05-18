import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { AuthProvider as ArtistAuthProvider } from "./artist/context/AuthContext";
import { AuthProvider as CustomerAuthProvider } from "./customer/context/AuthContext";
import { store } from "./admin/app/store";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <ArtistAuthProvider>
                    <CustomerAuthProvider>
                        <App />
                        <Toaster position="top-right" />
                    </CustomerAuthProvider>
                </ArtistAuthProvider>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);
