import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./artist/component/ScrollToTop.tsx";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateCommissionRate,
  updateFeaturedPrice,
  setMaintenanceMode,
} from "./admin/features/settings/settingsSlice";
import { settingsApi } from "./admin/api/settingsApi";

import Login from "./artist/pages/auth/login.tsx";
import Account from "./artist/pages/artist/account.tsx";
import Information from "./artist/pages/auth/informations.tsx";
import Verification from "./artist/pages/auth/verification.tsx";
import Talent from "./artist/pages/auth/talent.tsx";
import Signup from "./artist/pages/auth/signup.tsx";
import EditProfile from "./artist/pages/artist/editProfile.tsx";
import Bookings from "./artist/pages/artist/bookingRequests.tsx";
import Landing from "./artist/pages/landing.tsx";
import ArtistHome from "./artist/pages/artist/artistHome.tsx";

import LoginCustomer from "./customer/pages/LoginPage.tsx";
import SignupCustomer from "./customer/pages/SignUpPage.tsx";
import HomePageCustomer from "./customer/pages/HomePage.tsx";
import ArtistProfileLanding from "./customer/pages/ArtistProfileLanding.tsx";
import ArtistProfileCustomer from "./customer/pages/ArtistProfile.tsx";
import CategoryCustomer from "./artist/pages/artist/categoryCustomer.tsx";
import CustomerAccount from "./customer/pages/CustomerAccount.tsx";

import AdminRoutes from "./admin/routes/AppRouter.jsx";
import Category from "./artist/pages/artist/categoryLanding.tsx";

import DevGate from "./artist/component/DevGate.tsx";

function App() {
    const dispatch = useDispatch();
    const maintenanceMode = useSelector((s: any) => s.settings.maintenanceMode);
    const [settingsReady, setSettingsReady] = useState(false);

    useEffect(() => {
        settingsApi.getSettings()
            .then(data => {
                dispatch(updateCommissionRate(data.commission_rate))
                dispatch(updateFeaturedPrice(data.featured_listing_price))
                dispatch(setMaintenanceMode(data.maintenance_mode))
                setSettingsReady(true);
            })
            .catch(() => {
                setSettingsReady(true);
            });
    }, [dispatch]);

    if (!settingsReady) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Fraunces', Georgia, serif",
                background: "#F4F1F5"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: 40, height: 40, border: "4px solid #E8194B",
                        borderTopColor: "transparent", borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 16px"
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: "#666", fontSize: 14 }}>Loading...</p>
                </div>
            </div>
        );
    }

    const content = (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Landing />} />

                <Route path="/login" element={<Login />} />
                <Route path="/information" element={<Information />} />
                <Route path="/account" element={<Account />} />
                <Route path="/verification" element={<Verification />} />
                <Route path="/talent" element={<Talent />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/editProfile" element={<EditProfile />} />
                <Route path="/bookingRequests" element={<Bookings />} />
                <Route path="/category" element={<Category />} />
                <Route path="/artistHome" element={<ArtistHome />} />

                {/* Customer Routes */}
                <Route path="/loginCustomer" element={<LoginCustomer />} />
                <Route path="/signupCustomer" element={<SignupCustomer />} />
                <Route path="/home" element={<HomePageCustomer />} />
                <Route path="/artistProfile/:id" element={<ArtistProfileCustomer />} />
                <Route path="/artist/:id" element={<ArtistProfileLanding />} />
                <Route path="/categoryCustomer" element={<CategoryCustomer />} />
                <Route path="/customerAccount" element={<CustomerAccount />} />

                {/* Admin Routes */}
                <Route path="/admin/*" element={<AdminRoutes />} />
            </Routes>
        </>
    );

    if (maintenanceMode) {
        return <DevGate>{content}</DevGate>;
    }

    return content;
}

export default App;
