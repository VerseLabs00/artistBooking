import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./artist/component/ScrollToTop.tsx";

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

function App() {
        return (
            <>
                    <Toaster position="bottom-right" reverseOrder={false} />
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
}

export default App;
