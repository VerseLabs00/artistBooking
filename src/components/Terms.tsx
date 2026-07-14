import React from "react";
import { useSearchParams } from "react-router-dom";
import LegalPageNavbar, { getLegalPageVariant } from "./LegalPageNavbar";

const TermsAndConditions: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navbarVariant = getLegalPageVariant(searchParams.get("from"));

    return (
        <>
            <style>{`
        .terms-page * { margin: 0; padding: 0; box-sizing: border-box; }
        .terms-page { font-family: 'Fraunces', serif; background: #fff; color: #111; }

        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&display=swap');

        .terms-page nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 60px; background: #fff; border-bottom: 1px solid #eee; }
        .terms-page nav .logo { font-size: 22px; font-weight: 800; color: #111; }
        .terms-page nav .logo span { color: #e63946; }
        .terms-page nav a { color: #555; text-decoration: none; font-size: 14px; font-weight: 500; margin-left: 28px; }
        .terms-page nav .btn { background: #e63946; color: #fff; padding: 10px 22px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-left: 28px; text-decoration: none; }

        .terms-page .hero { background: #f9f9f9; padding: 80px 60px 60px; border-bottom: 1px solid #eee; }
        .terms-page .hero .tag { display: inline-block; background: rgba(230,57,70,0.08); color: #e63946; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(230,57,70,0.2); margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .terms-page .hero h1 { font-size: 52px; font-weight: 900; letter-spacing: -2px; line-height: 1.05; color: #111; }
        .terms-page .hero h1 span { color: #e63946; }
        .terms-page .hero p { color: #888; font-size: 15px; margin-top: 12px; }

        .terms-page .layout { display: grid; grid-template-columns: 260px 1fr; }
        .terms-page .sidebar { background: #f9f9f9; border-right: 1px solid #eee; padding: 40px 28px; position: sticky; top: 0; height: fit-content; }
        .terms-page .content { padding: 50px 60px; }
        .terms-page .sidebar .sib-title { font-size: 11px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .terms-page .sidebar a { display: block; font-size: 14px; color: #888; text-decoration: none; padding: 8px 12px; border-radius: 8px; margin-bottom: 2px; transition: all 0.2s; }
        .terms-page .sidebar a:hover { color: #111; background: #eee; }

        .terms-page .meta-bar { background: #f9f9f9; border: 1px solid #eee; border-radius: 12px; padding: 14px 20px; margin-bottom: 50px; font-size: 13px; color: #999; display: flex; gap: 24px; flex-wrap: wrap; }
        .terms-page .meta-bar strong { color: #555; }

        .terms-page .sec { margin-bottom: 52px; padding-bottom: 52px; border-bottom: 1px solid #eee; }
        .terms-page .sec:last-child { border-bottom: none; }
        .terms-page .sec-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .terms-page .sec-num { background: #e63946; color: #fff; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .terms-page .sec h2 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #111; }
        .terms-page .sec p { font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 12px; }
        .terms-page .sec h3 { font-size: 14px; font-weight: 700; color: #333; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .terms-page .sec ul { padding-left: 0; list-style: none; }
        .terms-page .sec ul li { font-size: 15px; color: #555; line-height: 1.8; padding: 5px 0 5px 20px; position: relative; }
        .terms-page .sec ul li::before { content: ''; position: absolute; left: 0; top: 14px; width: 6px; height: 6px; background: #e63946; border-radius: 50%; }

        .terms-page .two-box { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
        .terms-page .box { background: #f9f9f9; border: 1px solid #eee; border-radius: 12px; padding: 20px 22px; }
        .terms-page .box .label { font-size: 11px; font-weight: 700; color: #e63946; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .terms-page .box p { font-size: 14px; color: #555; margin: 0; line-height: 1.7; }

        .terms-page .flow { background: #f9f9f9; border: 1px solid #eee; border-radius: 14px; padding: 28px; margin: 20px 0; }
        .terms-page .flow-row { display: flex; align-items: center; gap: 0; flex-wrap: wrap; margin-bottom: 16px; }
        .terms-page .flow-step { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 10px 16px; font-size: 13px; font-weight: 600; color: #333; }
        .terms-page .flow-arrow { color: #e63946; font-size: 18px; font-weight: 700; padding: 0 12px; }
        .terms-page .flow p { font-size: 14px; color: #777; margin: 0; }

        .terms-page .warning { background: #fff5f5; border: 1px solid rgba(230,57,70,0.2); border-left: 3px solid #e63946; border-radius: 0 10px 10px 0; padding: 18px 20px; margin: 16px 0; }
        .terms-page .warning p { color: #c0392b; font-size: 14px; margin: 0; line-height: 1.7; }

        .terms-page .notice { background: #f9f9f9; border: 1px solid #eee; border-radius: 12px; padding: 18px 22px; margin: 16px 0; }
        .terms-page .notice p { color: #555; font-size: 14px; margin: 0; }

        .terms-page footer { background: #fff; border-top: 1px solid #eee; padding: 30px 60px; display: flex; align-items: center; justify-content: space-between; }
        .terms-page footer .logo { font-size: 18px; font-weight: 800; color: #111; }
        .terms-page footer .logo span { color: #e63946; }
        .terms-page footer p { font-size: 13px; color: #999; }

        @media (max-width: 900px) {
          .terms-page nav { padding: 16px 24px; }
          .terms-page .hero { padding: 50px 24px 40px; }
          .terms-page .hero h1 { font-size: 36px; }
          .terms-page .layout { grid-template-columns: 1fr; }
          .terms-page .sidebar { display: none; }
          .terms-page .content { padding: 32px 24px; }
          .terms-page .two-box { grid-template-columns: 1fr; }
          .terms-page .flow-row { flex-direction: column; align-items: flex-start; gap: 8px; }
          .terms-page footer { flex-direction: column; gap: 12px; text-align: center; padding: 24px; }
        }
      `}</style>

            <LegalPageNavbar variant={navbarVariant} />

            <div className="terms-page" style={{ paddingTop: "72px" }}>
                <div className="hero">
                    <div className="tag">Legal</div>
                    <h1>
                        Terms & <span>Conditions</span>
                    </h1>
                    <p>
                        Effective Date: [Insert Launch Date] &nbsp;·&nbsp; Last Updated:
                        [Insert Date] &nbsp;·&nbsp; By using Performa, you agree to
                        these Terms.
                    </p>
                </div>

                <div className="layout">
                    <div className="sidebar">
                        <p className="sib-title">Contents</p>
                        <a href="#s1">1. About Performa</a>
                        <a href="#s2">2. Eligibility</a>
                        <a href="#s3">3. Accounts</a>
                        <a href="#s4">4. For Clients</a>
                        <a href="#s5">5. For Artists</a>
                        <a href="#s6">6. How We Make Money</a>
                        <a href="#s7">7. Event Confirmation</a>
                        <a href="#s8">8. Circumvention</a>
                        <a href="#s9">9. Prohibited Conduct</a>
                        <a href="#s10">10. Disputes</a>
                        <a href="#s11">11. Liability</a>
                        <a href="#s12">12. Governing Law</a>
                        <a href="#s13">13. Contact</a>
                    </div>

                    <div className="content">
                        <div className="meta-bar">
              <span>
                Platform: <strong>Performa · performa.lk</strong>
              </span>
                            <span>
                Country: <strong>Sri Lanka</strong>
              </span>
                            <span>
                Currency: <strong>LKR</strong>
              </span>
                        </div>

                        <div className="sec" id="s1">
                            <div className="sec-header">
                                <div className="sec-num">1</div>
                                <h2>About Performa</h2>
                            </div>
                            <p>
                                Performa is an online marketplace that connects clients with
                                artists and performers — including singers, DJs, dancers,
                                videographers, photographers, and others — in Sri Lanka.
                                Performa facilitates bookings between clients and artists
                                but is not itself a provider of performance or creative
                                services.
                            </p>
                        </div>

                        <div className="sec" id="s2">
                            <div className="sec-header">
                                <div className="sec-num">2</div>
                                <h2>Eligibility</h2>
                            </div>
                            <ul>
                                <li>Be at least 18 years of age</li>
                                <li>
                                    Be legally able to enter into a binding contract under Sri
                                    Lankan law
                                </li>
                                <li>
                                    Provide accurate and truthful information when creating
                                    your account
                                </li>
                            </ul>
                        </div>

                        <div className="sec" id="s3">
                            <div className="sec-header">
                                <div className="sec-num">3</div>
                                <h2>Account Registration</h2>
                            </div>
                            <ul>
                                <li>You must create an account to make or receive bookings</li>
                                <li>
                                    You are responsible for keeping your login credentials
                                    secure
                                </li>
                                <li>
                                    You are responsible for all activity that occurs under
                                    your account
                                </li>
                                <li>Notify us immediately if you suspect unauthorized access</li>
                                <li>Performa may suspend accounts that violate these Terms</li>
                            </ul>
                        </div>

                        <div className="sec" id="s4">
                            <div className="sec-header">
                                <div className="sec-num">4</div>
                                <h2>For Clients — People Who Book Artists</h2>
                            </div>
                            <h3>Booking Process</h3>
                            <p>
                                Clients can browse artist profiles, check availability, and
                                send booking requests. A booking is confirmed only after the
                                artist accepts and payment is processed.
                            </p>
                            <h3>Payment</h3>
                            <p>
                                Clients must pay the agreed booking fee through the
                                platform. A platform service fee is shown clearly before you
                                confirm payment. All prices are in Sri Lankan Rupees (LKR).
                            </p>
                            <h3>Cancellations & Refunds</h3>
                            <ul>
                                <li>
                                    If a client cancels, a cancellation fee may apply
                                    depending on how far in advance it is made
                                </li>
                                <li>
                                    If an artist cancels a confirmed booking, the client
                                    receives a full refund
                                </li>
                                <li>
                                    Refunds are processed within [insert number] business days
                                </li>
                            </ul>
                        </div>

                        <div className="sec" id="s5">
                            <div className="sec-header">
                                <div className="sec-num">5</div>
                                <h2>For Artists — Performers Who Register</h2>
                            </div>
                            <h3>Artist Profiles</h3>
                            <p>
                                Artists must create an accurate and honest profile. All
                                portfolio content must be genuine and owned or licensed to
                                the artist. Performa may review or remove profiles that
                                violate these Terms.
                            </p>
                            <h3>Accepting Bookings</h3>
                            <p>
                                By accepting a booking, the artist agrees to deliver the
                                agreed services on the confirmed date, time, and location.
                                Repeated cancellations may result in account suspension.
                            </p>
                            <h3>Artist Payouts</h3>
                            <p>
                                After a booking is completed, Performa releases the
                                artist&apos;s payment minus the platform commission within
                                [insert number] business days after the event date.
                            </p>
                            <h3>Artist Responsibilities</h3>
                            <ul>
                                <li>
                                    Artists are responsible for their own tax obligations from
                                    income earned through Performa
                                </li>
                                <li>
                                    Artists must comply with all applicable Sri Lankan laws
                                    including any permits required for performances
                                </li>
                            </ul>
                        </div>

                        <div className="sec" id="s6">
                            <div className="sec-header">
                                <div className="sec-num">6</div>
                                <h2>How Performa Makes Money</h2>
                            </div>
                            <p>
                                All fees are transparently disclosed before any payment is
                                confirmed. No hidden charges.
                            </p>
                            <div className="two-box">
                                <div className="box">
                                    <div className="label">Client Service Fee</div>
                                    <p>
                                        A small percentage added on top of the artist&apos;s
                                        rate at checkout — shown clearly before you pay.
                                    </p>
                                </div>
                                <div className="box">
                                    <div className="label">Artist Commission</div>
                                    <p>
                                        A percentage deducted from the artist&apos;s payout
                                        after a booking is successfully completed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="sec" id="s7">
                            <div className="sec-header">
                                <div className="sec-num">7</div>
                                <h2>Event Confirmation & Payment Release</h2>
                            </div>
                            <div className="flow">
                                <div className="flow-row">
                                    <div className="flow-step">Event Date Passes</div>
                                    <div className="flow-arrow">→</div>
                                    <div className="flow-step">Client Confirms</div>
                                    <div className="flow-arrow">→</div>
                                    <div className="flow-step">Payment Released to Artist</div>
                                </div>
                                <p>
                                    If the client does not respond within{" "}
                                    <strong>72 hours</strong> after the event date, payment is
                                    automatically released to the artist. If the client raises
                                    a complaint within 48 hours of the event, Performa will
                                    investigate and make a final decision.
                                </p>
                            </div>
                        </div>

                        <div className="sec" id="s8">
                            <div className="sec-header">
                                <div className="sec-num">8</div>
                                <h2>Circumvention Policy</h2>
                            </div>
                            <div className="warning">
                                <p>
                                    ⚠️ Both clients and artists agree not to arrange bookings
                                    or payments outside of the Performa platform for anyone
                                    first discovered through Performa. This includes direct
                                    bank transfers, cash payments, or using other platforms.
                                    Violating this may result in permanent account
                                    termination.
                                </p>
                            </div>
                        </div>

                        <div className="sec" id="s9">
                            <div className="sec-header">
                                <div className="sec-num">9</div>
                                <h2>Prohibited Conduct</h2>
                            </div>
                            <ul>
                                <li>Post false, misleading, or fraudulent information</li>
                                <li>Harass, threaten, or abuse other users on the platform</li>
                                <li>
                                    Upload content that is illegal, obscene, or infringes
                                    intellectual property rights
                                </li>
                                <li>
                                    Attempt to hack, disrupt, or damage the platform or its
                                    users
                                </li>
                                <li>Use the platform for any illegal purpose under Sri Lankan law</li>
                            </ul>
                        </div>

                        <div className="sec" id="s10">
                            <div className="sec-header">
                                <div className="sec-num">10</div>
                                <h2>Disputes Between Clients and Artists</h2>
                            </div>
                            <p>
                                We encourage both parties to first resolve disputes
                                directly. If unresolved, contact Performa support and we
                                will assist in mediating a fair resolution. Performa&apos;s
                                decision regarding platform-held funds is final.
                            </p>
                        </div>

                        <div className="sec" id="s11">
                            <div className="sec-header">
                                <div className="sec-num">11</div>
                                <h2>Limitation of Liability</h2>
                            </div>
                            <p>
                                To the fullest extent permitted by Sri Lankan law, Performa
                                is not liable for any indirect or consequential losses from
                                your use of the platform. It is your responsibility to
                                review artist profiles, portfolios, and reviews before
                                booking.
                            </p>
                        </div>

                        <div className="sec" id="s12">
                            <div className="sec-header">
                                <div className="sec-num">12</div>
                                <h2>Governing Law</h2>
                            </div>
                            <p>
                                These Terms are governed by the laws of Sri Lanka. Any
                                disputes will be subject to the exclusive jurisdiction of
                                the courts of Sri Lanka.
                            </p>
                        </div>

                        <div className="sec" id="s13">
                            <div className="sec-header">
                                <div className="sec-num">13</div>
                                <h2>Contact Us</h2>
                            </div>
                            <p>Questions about these Terms? Please reach out:</p>
                            <div className="notice" style={{ marginTop: "16px" }}>
                                <p>
                                    📧 <strong>Email:</strong> infoperforma.lk@gmail.com &nbsp;·&nbsp;
                                    📞 <strong>Phone:</strong> +94 70 403 5236 &nbsp;·&nbsp; 📍
                                    Kandy, Sri Lanka
                                </p>
                            </div>
                            <p style={{ marginTop: "14px", color: "#999", fontSize: "14px" }}>
                                Thank you for being part of the Performa community.
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

export default TermsAndConditions;