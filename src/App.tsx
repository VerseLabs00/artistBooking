import { Routes, Route } from "react-router-dom";
import Login from "./artist/pages/auth/login.tsx";
import Account from "./artist/pages/artist/account.tsx";
import Information from "./artist/pages/auth/informations.tsx";
import Verification from "./artist/pages/auth/verification.tsx";
import Talent from "./artist/pages/auth/talent.tsx";
import Signup from "./artist/pages/auth/signup.tsx";
import EditProfile from "./artist/pages/artist/editProfile.tsx";
import Bookings from "./artist/pages/artist/bookingRequests.tsx";
import Landing from "./artist/pages/landing.tsx";

import LoginCustomer from "./customer/pages/LoginPage.tsx";
import SignupCustomer from "./customer/pages/SignUpPage.tsx";
import HomePageCustomer from "./customer/pages/HomePage.tsx";
import ArtistProfilePage from "./customer/pages/ArtistProfilePage.tsx";

import AdminRoutes from "./admin/routes/AppRouter.jsx";

function App() {
    return (
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
            
            {/* Customer Routes */}
            <Route path="/loginCustomer" element={<LoginCustomer />} />
            <Route path="/signupCustomer" element={<SignupCustomer />} />
            <Route path="/home" element={<HomePageCustomer />} />
            <Route path="/artist/:id" element={<ArtistProfilePage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
    );
}

export default App;
