import React from "react";

const PrivacyPolicy: React.FC = () => {
    return (
        <>
            <style>{`
        .privacy-page * { margin: 0; padding: 0; box-sizing: border-box; }
        .privacy-page { font-family: 'Fraunces', serif; background: #fff; color: #111; }

        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&display=swap');

        .privacy-page nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 60px; background: #fff; border-bottom: 1px solid #eee; }
        .privacy-page nav .logo { font-size: 22px; font-weight: 800; color: #111; }
        .privacy-page nav .logo span { color: #e63946; }
        .privacy-page nav a { color: #555; text-decoration: none; font-size: 14px; font-weight: 500; margin-left: 28px; }
        .privacy-page nav .btn { background: #e63946; color: #fff; padding: 10px 22px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-left: 28px; text-decoration: none; }

        .privacy-page .hero { background: #f9f9f9; padding: 80px 60px 60px; border-bottom: 1px solid #eee; }
        .privacy-page .hero .tag { display: inline-block; background: rgba(230,57,70,0.08); color: #e63946; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(230,57,70,0.2); margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .privacy-page .hero h1 { font-size: 52px; font-weight: 900; letter-spacing: -2px; line-height: 1.05; color: #111; }
        .privacy-page .hero h1 span { color: #e63946; }
        .privacy-page .hero p { color: #888; font-size: 15px; margin-top: 12px; }

        .privacy-page .layout { display: grid; grid-template-columns: 260px 1fr; }
        .privacy-page .sidebar { background: #f9f9f9; border-right: 1px solid #eee; padding: 40px 28px; position: sticky; top: 0; height: fit-content; }
        .privacy-page .content { padding: 50px 60px; }
        .privacy-page .sidebar .sib-title { font-size: 11px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .privacy-page .sidebar a { display: block; font-size: 14px; color: #888; text-decoration: none; padding: 8px 12px; border-radius: 8px; margin-bottom: 2px; transition: all 0.2s; }
        .privacy-page .sidebar a:hover { color: #111; background: #eee; }

        .privacy-page .meta-bar { background: #f9f9f9; border: 1px solid #eee; border-radius: 12px; padding: 14px 20px; margin-bottom: 50px; font-size: 13px; color: #999; display: flex; gap: 24px; flex-wrap: wrap; }
        .privacy-page .meta-bar strong { color: #555; }

        .privacy-page .sec { margin-bottom: 52px; padding-bottom: 52px; border-bottom: 1px solid #eee; }
        .privacy-page .sec:last-child { border-bottom: none; }
        .privacy-page .sec-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .privacy-page .sec-num { background: #e63946; color: #fff; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .privacy-page .sec h2 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #111; }
        .privacy-page .sec p { font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 12px; }
        .privacy-page .sec h3 { font-size: 14px; font-weight: 700; color: #333; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .privacy-page .sec ul { padding-left: 0; list-style: none; }
        .privacy-page .sec ul li { font-size: 15px; color: #555; line-height: 1.8; padding: 5px 0 5px 20px; position: relative; }
        .privacy-page .sec ul li::before { content: ''; position: absolute; left: 0; top: 14px; width: 6px; height: 6px; background: #e63946; border-radius: 50%; }

        .privacy-page .notice { background: #fff5f5; border: 1px solid rgba(230,57,70,0.2); border-left: 3px solid #e63946; border-radius: 0 10px 10px 0; padding: 16px 20px; margin: 16px 0; }
        .privacy-page .notice p { color: #c0392b; font-size: 14px; margin: 0; }
        .privacy-page .notice strong { color: #e63946; }

        .privacy-page .info-box { background: #f9f9f9; border: 1px solid #eee; border-radius: 12px; padding: 20px 22px; margin: 16px 0; }
        .privacy-page .info-box p { color: #555; font-size: 14px; margin: 0; line-height: 1.7; }

        .privacy-page footer { background: #fff; border-top: 1px solid #eee; padding: 30px 60px; display: flex; align-items: center; justify-content: space-between; }
        .privacy-page footer .logo { font-size: 18px; font-weight: 800; color: #111; }
        .privacy-page footer .logo span { color: #e63946; }
        .privacy-page footer p { font-size: 13px; color: #999; }

        @media (max-width: 900px) {
          .privacy-page nav { padding: 16px 24px; }
          .privacy-page .hero { padding: 50px 24px 40px; }
          .privacy-page .hero h1 { font-size: 36px; }
          .privacy-page .layout { grid-template-columns: 1fr; }
          .privacy-page .sidebar { display: none; }
          .privacy-page .content { padding: 32px 24px; }
          .privacy-page footer { flex-direction: column; gap: 12px; text-align: center; padding: 24px; }
        }
      `}</style>

            <div className="privacy-page">
                {/*<nav>*/}
                {/*    <div className="logo">*/}
                {/*        Performa<span>.</span>*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        <a href="#">Categories</a>*/}
                {/*        <a href="#">Explore</a>*/}
                {/*        <a href="#">How it works</a>*/}
                {/*        <a href="#">Join as Artist</a>*/}
                {/*        <a href="#" className="btn">*/}
                {/*            Explore Talent*/}
                {/*        </a>*/}
                {/*    </div>*/}
                {/*</nav>*/}

                <div className="hero">
                    <div className="tag">Legal</div>
                    <h1>
                        Privacy <span>Policy</span>
                    </h1>
                    <p>
                        Effective Date: [Insert Launch Date] &nbsp;·&nbsp; Last Updated:
                        [Insert Date]
                    </p>
                </div>

                <div className="layout">
                    <div className="sidebar">
                        <p className="sib-title">Contents</p>
                        <a href="#s1">1. Who We Are</a>
                        <a href="#s2">2. Info We Collect</a>
                        <a href="#s3">3. How We Use It</a>
                        <a href="#s4">4. How We Share It</a>
                        <a href="#s5">5. Payments</a>
                        <a href="#s6">6. Cookies</a>
                        <a href="#s7">7. Data Security</a>
                        <a href="#s8">8. Your Rights</a>
                        <a href="#s9">9. Children</a>
                        <a href="#s10">10. Changes</a>
                        <a href="#s11">11. Contact</a>
                    </div>

                    <div className="content">
                        <div className="meta-bar">
              <span>
                Platform: <strong>Performa · performa.lk</strong>
              </span>
                            <span>
                Location: <strong>Sri Lanka</strong>
              </span>
                            <span>
                Governed by: <strong>Sri Lankan Law</strong>
              </span>
                        </div>

                        <div className="sec" id="s1">
                            <div className="sec-header">
                                <div className="sec-num">1</div>
                                <h2>Who We Are</h2>
                            </div>
                            <p>
                                Performa is an online artist booking platform based in Sri
                                Lanka. We connect clients with performers and creative
                                professionals for events and occasions. By using Performa,
                                you agree to the terms of this Privacy Policy.
                            </p>
                        </div>

                        <div className="sec" id="s2">
                            <div className="sec-header">
                                <div className="sec-num">2</div>
                                <h2>Information We Collect</h2>
                            </div>
                            <h3>For Clients (People who book artists)</h3>
                            <ul>
                                <li>Full name and email address</li>
                                <li>Phone number</li>
                                <li>Event details — date, location, and type of event</li>
                                <li>
                                    Payment information (processed securely through our
                                    payment provider)
                                </li>
                            </ul>
                            <h3>For Artists (Performers who register)</h3>
                            <ul>
                                <li>Full name or stage name, email address, phone number</li>
                                <li>Profile photo and portfolio media (photos, videos)</li>
                                <li>
                                    Artist category, description, service rates, and
                                    availability
                                </li>
                                <li>Bank account or payment details for receiving payouts</li>
                                <li>National ID or verification documents if required</li>
                            </ul>
                            <h3>Automatically Collected</h3>
                            <ul>
                                <li>IP address and device information</li>
                                <li>Browser type and operating system</li>
                                <li>Pages visited and time spent on the platform</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </div>

                        <div className="sec" id="s3">
                            <div className="sec-header">
                                <div className="sec-num">3</div>
                                <h2>How We Use Your Information</h2>
                            </div>
                            <ul>
                                <li>Create and manage your account</li>
                                <li>Process bookings and payments between clients and artists</li>
                                <li>Send booking confirmations, reminders, and notifications</li>
                                <li>Display artist profiles to potential clients</li>
                                <li>Verify artist identities and ensure platform safety</li>
                                <li>Improve our platform and user experience</li>
                                <li>Resolve disputes between clients and artists</li>
                                <li>Comply with legal obligations under Sri Lankan law</li>
                                <li>Send platform updates or news — you can opt out at any time</li>
                            </ul>
                        </div>

                        <div className="sec" id="s4">
                            <div className="sec-header">
                                <div className="sec-num">4</div>
                                <h2>How We Share Your Information</h2>
                            </div>
                            <div className="notice">
                                <p>
                                    <strong>
                                        We do not sell your personal information to third
                                        parties.
                                    </strong>
                                </p>
                            </div>
                            <ul>
                                <li>
                                    <strong>Between Clients and Artists:</strong> When a
                                    booking is made, relevant contact and event details are
                                    shared to complete the booking.
                                </li>
                                <li>
                                    <strong>Payment Processors:</strong> We share payment
                                    information with secure third-party providers to process
                                    transactions.
                                </li>
                                <li>
                                    <strong>Service Providers:</strong> Trusted vendors who
                                    help us operate — hosting, email, analytics — bound by
                                    confidentiality obligations.
                                </li>
                                <li>
                                    <strong>Legal Requirements:</strong> If required by Sri
                                    Lankan law, court order, or government authority.
                                </li>
                                <li>
                                    <strong>Safety:</strong> To prevent fraud, abuse, or harm
                                    to users or the public.
                                </li>
                            </ul>
                        </div>

                        <div className="sec" id="s5">
                            <div className="sec-header">
                                <div className="sec-num">5</div>
                                <h2>Payments & Financial Information</h2>
                            </div>
                            <p>
                                All payments on Performa are processed through secure,
                                third-party payment gateways. We do not store your full
                                credit or debit card details on our servers. Please refer to
                                your payment provider&apos;s privacy policy for how they
                                handle your financial data.
                            </p>
                        </div>

                        <div className="sec" id="s6">
                            <div className="sec-header">
                                <div className="sec-num">6</div>
                                <h2>Cookies</h2>
                            </div>
                            <p>
                                We use cookies to keep you logged in, remember your
                                preferences, and analyze platform traffic. You can control
                                cookies through your browser settings. Disabling cookies may
                                affect some features of the platform.
                            </p>
                        </div>

                        <div className="sec" id="s7">
                            <div className="sec-header">
                                <div className="sec-num">7</div>
                                <h2>Data Security</h2>
                            </div>
                            <p>
                                Your data is stored on secure servers. We take reasonable
                                technical and organizational measures to protect your
                                personal information from unauthorized access, loss, or
                                misuse. Please use a strong password and keep your login
                                credentials confidential.
                            </p>
                        </div>

                        <div className="sec" id="s8">
                            <div className="sec-header">
                                <div className="sec-num">8</div>
                                <h2>Your Rights</h2>
                            </div>
                            <ul>
                                <li>Access the personal information we hold about you</li>
                                <li>Correct inaccurate or outdated information</li>
                                <li>Request deletion of your personal data</li>
                                <li>
                                    Withdraw consent for marketing communications at any time
                                </li>
                            </ul>
                            <p>
                                To exercise any of these rights, contact us at the email
                                address below.
                            </p>
                        </div>

                        <div className="sec" id="s9">
                            <div className="sec-header">
                                <div className="sec-num">9</div>
                                <h2>Children&apos;s Privacy</h2>
                            </div>
                            <p>
                                Performa is not intended for use by persons under the age of
                                18. We do not knowingly collect personal information from
                                children. If we discover that a child under 18 has provided
                                us with personal information, we will delete it promptly.
                            </p>
                        </div>

                        <div className="sec" id="s10">
                            <div className="sec-header">
                                <div className="sec-num">10</div>
                                <h2>Changes to This Policy</h2>
                            </div>
                            <p>
                                We may update this Privacy Policy from time to time. When we
                                do, we will update the date at the top of this page.
                                Continued use of the platform after changes take effect
                                means you accept the updated policy.
                            </p>
                        </div>

                        <div className="sec" id="s11">
                            <div className="sec-header">
                                <div className="sec-num">11</div>
                                <h2>Contact Us</h2>
                            </div>
                            <p>
                                If you have questions about this Privacy Policy or want to
                                make a data request:
                            </p>
                            <div className="info-box" style={{ marginTop: "16px" }}>
                                <p>
                                    📧 <strong>Email:</strong> infoperforma.lk@gmail.com &nbsp;·&nbsp;
                                    📞 <strong>Phone:</strong> +94 70 403 5236 &nbsp;·&nbsp; 📍
                                    Kandy, Sri Lanka
                                </p>
                            </div>
                            <p style={{ marginTop: "14px", color: "#999", fontSize: "14px" }}>
                                This Privacy Policy is governed by the laws of Sri Lanka.
                            </p>
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
        </>
    );
};

export default PrivacyPolicy;