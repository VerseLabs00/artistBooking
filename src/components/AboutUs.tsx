import React from "react";
import { useSearchParams } from "react-router-dom";
import LegalPageNavbar, { getLegalPageVariant } from "./LegalPageNavbar";

const AboutUs: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navbarVariant = getLegalPageVariant(searchParams.get("from"));

    return (
        <>
            <style>{`
        .about-page * { margin: 0; padding: 0; box-sizing: border-box; }
        .about-page { font-family: 'Fraunces', serif; background: #fff; color: #111; }

        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&display=swap');

        .about-page nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 60px; background: #fff; border-bottom: 1px solid #eee; }
        .about-page nav .logo { font-size: 22px; font-weight: 800; color: #111; }
        .about-page nav .logo span { color: #e63946; }
        .about-page nav a { color: #555; text-decoration: none; font-size: 14px; font-weight: 500; margin-left: 28px; }
        .about-page nav a:hover { color: #111; }
        .about-page nav .btn { background: #e63946; color: #fff; padding: 10px 22px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-left: 28px; text-decoration: none; }

        .about-page .hero { background: #f9f9f9; padding: 90px 60px 80px; border-bottom: 1px solid #eee; }
        .about-page .hero .tag { display: inline-block; background: rgba(230,57,70,0.08); color: #e63946; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(230,57,70,0.2); margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
        .about-page .hero h1 { font-size: 64px; font-weight: 900; line-height: 1.05; letter-spacing: -2px; max-width: 700px; color: #111; }
        .about-page .hero h1 span { color: #e63946; }
        .about-page .hero p { font-size: 18px; color: #666; margin-top: 20px; max-width: 560px; line-height: 1.7; }

        .about-page .section { padding: 80px 60px; border-bottom: 1px solid #eee; }
        .about-page .section h2 { font-size: 36px; font-weight: 800; letter-spacing: -1px; margin-bottom: 20px; color: #111; }
        .about-page .section h2 span { color: #e63946; }
        .about-page .section p { font-size: 16px; color: #555; line-height: 1.8; max-width: 700px; margin-bottom: 14px; }

        .about-page .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .about-page .two-col .text p { max-width: 100%; }
        .about-page .mission-card { background: #f9f9f9; border: 1px solid #eee; border-radius: 20px; padding: 36px; }
        .about-page .mission-card .label { font-size: 12px; font-weight: 700; color: #e63946; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
        .about-page .mission-card p { color: #333; font-size: 17px; line-height: 1.75; max-width: 100%; }

        .about-page .categories { padding: 80px 60px; background: #f9f9f9; border-bottom: 1px solid #eee; }
        .about-page .categories h2 { font-size: 36px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; color: #111; }
        .about-page .categories h2 span { color: #e63946; }
        .about-page .categories .sub { font-size: 16px; color: #777; margin-bottom: 40px; }
        .about-page .cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .about-page .cat-card { background: #fff; border: 1px solid #eee; border-radius: 14px; padding: 24px 20px; transition: border-color 0.2s, box-shadow 0.2s; }
        .about-page .cat-card:hover { border-color: #e63946; box-shadow: 0 4px 20px rgba(230,57,70,0.08); }
        .about-page .cat-card .icon { font-size: 30px; margin-bottom: 12px; }
        .about-page .cat-card h3 { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 6px; }
        .about-page .cat-card p { font-size: 13px; color: #888; line-height: 1.5; margin: 0; }

        .about-page .why { padding: 80px 60px; border-bottom: 1px solid #eee; }
        .about-page .why h2 { font-size: 36px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; color: #111; }
        .about-page .why h2 span { color: #e63946; }
        .about-page .why .sub { font-size: 16px; color: #777; margin-bottom: 40px; }
        .about-page .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .about-page .why-card { background: #fff; border: 1px solid #eee; border-radius: 16px; padding: 28px 24px; }
        .about-page .why-card .dot { width: 36px; height: 36px; background: rgba(230,57,70,0.08); border: 1px solid rgba(230,57,70,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: #e63946; font-weight: 700; font-size: 16px; }
        .about-page .why-card h3 { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 8px; }
        .about-page .why-card p { font-size: 13px; color: #777; line-height: 1.6; margin: 0; }

        .about-page .story { padding: 80px 60px; background: #f9f9f9; border-bottom: 1px solid #eee; }
        .about-page .story h2 { font-size: 36px; font-weight: 800; letter-spacing: -1px; margin-bottom: 20px; color: #111; }
        .about-page .story h2 span { color: #e63946; }
        .about-page .story p { font-size: 16px; color: #555; line-height: 1.8; max-width: 700px; margin-bottom: 14px; }
        .about-page .story .quote { border-left: 3px solid #e63946; padding: 16px 24px; margin: 30px 0; background: #fff; border-radius: 0 12px 12px 0; border: 1px solid #eee; border-left: 3px solid #e63946; }
        .about-page .story .quote p { color: #333; font-size: 18px; font-style: italic; margin: 0; max-width: 100%; }

        .about-page .contact-section { padding: 80px 60px; border-bottom: 1px solid #eee; }
        .about-page .contact-inner { background: #111; border-radius: 20px; padding: 50px; display: flex; align-items: center; justify-content: space-between; gap: 40px; }
        .about-page .contact-inner h2 { font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 10px; color: #fff; }
        .about-page .contact-inner .sub { color: #888; font-size: 15px; margin-bottom: 28px; }
        .about-page .contact-details { display: flex; flex-direction: column; gap: 12px; }
        .about-page .contact-item { display: flex; align-items: center; gap: 12px; }
        .about-page .contact-item .ic { width: 36px; height: 36px; background: rgba(230,57,70,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .about-page .contact-item span { font-size: 14px; color: #aaa; }
        .about-page .cta-btn { background: #e63946; color: #fff; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; display: inline-block; white-space: nowrap; }

        .about-page footer { background: #fff; border-top: 1px solid #eee; padding: 30px 60px; display: flex; align-items: center; justify-content: space-between; }
        .about-page footer .logo { font-size: 18px; font-weight: 800; color: #111; }
        .about-page footer .logo span { color: #e63946; }
        .about-page footer p { font-size: 13px; color: #999; }

        @media (max-width: 900px) {
          .about-page nav { padding: 16px 24px; }
          .about-page .hero { padding: 60px 24px; }
          .about-page .hero h1 { font-size: 40px; }
          .about-page .section, .about-page .categories, .about-page .why, .about-page .story, .about-page .contact-section { padding: 60px 24px; }
          .about-page .two-col { grid-template-columns: 1fr; gap: 30px; }
          .about-page .cat-grid { grid-template-columns: repeat(2, 1fr); }
          .about-page .why-grid { grid-template-columns: 1fr; }
          .about-page .contact-inner { flex-direction: column; }
          .about-page footer { flex-direction: column; gap: 12px; text-align: center; padding: 24px; }
        }
      `}</style>

            <LegalPageNavbar variant={navbarVariant} />

            <div className="about-page" style={{ paddingTop: "72px" }}>
                <div className="hero">
                    <div className="tag">About Us</div>
                    <h1>
                        Sri Lanka&apos;s First
                        <br />
                        <span>Artist Booking</span>
                        <br />
                        Platform
                    </h1>
                    <p>
                        We connect event organizers and individuals with Sri Lanka&apos;s
                        best singers, DJs, dancers, videographers, photographers, and more
                        — all in one place.
                    </p>
                </div>

                <div className="section">
                    <div className="two-col">
                        <div className="text">
                            <h2>
                                Who <span>We Are</span>
                            </h2>
                            <p>
                                Performa is Sri Lanka&apos;s first dedicated online platform
                                for booking talented performers and creative professionals.
                            </p>
                            <p>
                                We connect event organizers, individuals, and businesses with
                                the island&apos;s best artists — all in one simple, trusted
                                platform. We are proudly built in Sri Lanka to support our
                                local creative community.
                            </p>
                        </div>
                        <div className="mission-card">
                            <div className="label">Our Mission</div>
                            <p>
                                To make booking talented artists easy, transparent, and
                                accessible for <strong>everyone in Sri Lanka</strong> — from
                                the biggest corporate events to the most personal occasions.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="categories">
                    <h2>
                        Artist <span>Categories</span>
                    </h2>
                    <p className="sub">
                        Browse and book from a wide range of talented professionals
                        across Sri Lanka.
                    </p>
                    <div className="cat-grid">
                        <div className="cat-card">
                            <div className="icon">🎤</div>
                            <h3>Singers & Vocalists</h3>
                            <p>Powerful vocalists covering a wide range of genres and styles.</p>
                        </div>
                        <div className="cat-card">
                            <div className="icon">🎧</div>
                            <h3>DJs</h3>
                            <p>Expert curators of energy and rhythm for every dance floor.</p>
                        </div>
                        <div className="cat-card">
                            <div className="icon">💃</div>
                            <h3>Dancers & Dance Groups</h3>
                            <p>Professional choreographies and high-energy dance routines.</p>
                        </div>
                        <div className="cat-card">
                            <div className="icon">🎥</div>
                            <h3>Videographers</h3>
                            <p>Cinematic storytellers who capture every unforgettable moment.</p>
                        </div>
                        <div className="cat-card">
                            <div className="icon">📸</div>
                            <h3>Photographers</h3>
                            <p>Creative eyes that freeze your best memories in time.</p>
                        </div>
                        <div className="cat-card">
                            <div className="icon">🎸</div>
                            <h3>Live Bands</h3>
                            <p>Full musical ensembles providing an immersive live experience.</p>
                        </div>
                        <div className="cat-card">
                            <div className="icon">🎹</div>
                            <h3>Producers & MCs</h3>
                            <p>Creative minds behind the beats and sound engineering.</p>
                        </div>
                        <div className="cat-card">
                            <div className="icon">✨</div>
                            <h3>And More...</h3>
                            <p>Event entertainers, rappers, sound systems & many more.</p>
                        </div>
                    </div>
                </div>

                <div className="why">
                    <h2>
                        Why <span>Performa?</span>
                    </h2>
                    <p className="sub">
                        Everything you need to book the right artist for your event.
                    </p>
                    <div className="why-grid">
                        <div className="why-card">
                            <div className="dot">✓</div>
                            <h3>Verified Artists</h3>
                            <p>All profiles are reviewed before going live. You book with confidence.</p>
                        </div>
                        <div className="why-card">
                            <div className="dot">✓</div>
                            <h3>Transparent Pricing</h3>
                            <p>See rates clearly on every artist profile. No hidden surprises.</p>
                        </div>
                        <div className="why-card">
                            <div className="dot">✓</div>
                            <h3>Safe Booking</h3>
                            <p>Secure payments and booking confirmations protect both sides.</p>
                        </div>
                        <div className="why-card">
                            <div className="dot">✓</div>
                            <h3>Sri Lanka Focused</h3>
                            <p>Built specifically for the Sri Lankan market and creative industry.</p>
                        </div>
                        <div className="why-card">
                            <div className="dot">✓</div>
                            <h3>Easy to Use</h3>
                            <p>Simple booking process from search all the way to confirmation.</p>
                        </div>
                        <div className="why-card">
                            <div className="dot">✓</div>
                            <h3>For Artists Too</h3>
                            <p>Performers can register, showcase their work, and grow their career.</p>
                        </div>
                    </div>
                </div>

                <div className="story">
                    <h2>
                        Our <span>Story</span>
                    </h2>
                    <p>
                        Performa was created by a team passionate about Sri Lanka&apos;s
                        entertainment and events industry. We saw how difficult it was
                        for event organizers to find reliable artists — and how hard it
                        was for talented performers to reach the right clients.
                    </p>
                    <div className="quote">
                        <p>
                            &quot;We believe every event deserves the right performer, and
                            every performer deserves the right opportunity.&quot;
                        </p>
                    </div>
                    <p>
                        We built Performa to bridge that gap — creating a trusted space
                        where talent meets opportunity, all right here in Sri Lanka.
                    </p>
                </div>

                <div className="contact-section">
                    <div className="contact-inner">
                        <div>
                            <h2>Get in Touch</h2>
                            <p className="sub">Have a question or need help? We&apos;re here for you.</p>
                            <div className="contact-details">
                                <div className="contact-item">
                                    <div className="ic">📧</div>
                                    <span>infoperforma.lk@gmail.com</span>
                                </div>
                                <div className="contact-item">
                                    <div className="ic">📞</div>
                                    <span>+94 70 403 5236</span>
                                </div>
                                <div className="contact-item">
                                    <div className="ic">📍</div>
                                    <span>Kandy, Sri Lanka</span>
                                </div>
                            </div>
                        </div>
                </div>

                <footer>
                    <div className="logo">
                        Performa<span>.</span>
                    </div>
                    <p>© 2026 Performa. All rights reserved. · Sri Lanka</p>
                </footer>
            </div>
        </div>
        </>
    );
};

export default AboutUs;