import React from "react";
import { useSearchParams } from "react-router-dom";
import LegalPageNavbar, { getLegalPageVariant } from "./LegalPageNavbar";

const ReturnPolicy: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navbarVariant = getLegalPageVariant(searchParams.get("from"));

    return (
        <>
            <style>{`
        .return-page * { margin: 0; padding: 0; box-sizing: border-box; }
        .return-page { font-family: 'Fraunces', serif; background: #fff; color: #111; }

        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&display=swap');

        .return-page nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 60px; background: #fff; border-bottom: 1px solid #eee; }
        .return-page nav .logo { font-size: 22px; font-weight: 800; color: #111; }
        .return-page nav .logo span { color: #e63946; }
        .return-page nav a { color: #555; text-decoration: none; font-size: 14px; font-weight: 500; margin-left: 28px; }
        .return-page nav .btn { background: #e63946; color: #fff; padding: 10px 22px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-left: 28px; text-decoration: none; }

        .return-page .hero { background: #f9f9f9; padding: 80px 60px 60px; border-bottom: 1px solid #eee; }
        .return-page .hero .tag { display: inline-block; background: rgba(230,57,70,0.08); color: #e63946; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(230,57,70,0.2); margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .return-page .hero h1 { font-size: 52px; font-weight: 900; letter-spacing: -2px; line-height: 1.05; color: #111; }
        .return-page .hero h1 span { color: #e63946; }
        .return-page .hero p { color: #888; font-size: 15px; margin-top: 12px; }

        .return-page .layout { display: grid; grid-template-columns: 260px 1fr; }
        .return-page .sidebar { background: #f9f9f9; border-right: 1px solid #eee; padding: 40px 28px; position: sticky; top: 0; height: fit-content; }
        .return-page .content { padding: 50px 60px; }
        .return-page .sidebar .sib-title { font-size: 11px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .return-page .sidebar a { display: block; font-size: 14px; color: #888; text-decoration: none; padding: 8px 12px; border-radius: 8px; margin-bottom: 2px; transition: all 0.2s; }
        .return-page .sidebar a:hover { color: #111; background: #eee; }

        .return-page .meta-bar { background: #f9f9f9; border: 1px solid #eee; border-radius: 12px; padding: 14px 20px; margin-bottom: 50px; font-size: 13px; color: #999; display: flex; gap: 24px; flex-wrap: wrap; }
        .return-page .meta-bar strong { color: #555; }

        .return-page .sec { margin-bottom: 52px; padding-bottom: 52px; border-bottom: 1px solid #eee; }
        .return-page .sec:last-child { border-bottom: none; }
        .return-page .sec-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .return-page .sec-num { background: #e63946; color: #fff; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .return-page .sec h2 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #111; }
        .return-page .sec p { font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 12px; }
        .return-page .sec h3 { font-size: 14px; font-weight: 700; color: #333; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .return-page .sec ul { padding-left: 0; list-style: none; }
        .return-page .sec ul li { font-size: 15px; color: #555; line-height: 1.8; padding: 5px 0 5px 20px; position: relative; }
        .return-page .sec ul li::before { content: ''; position: absolute; left: 0; top: 14px; width: 6px; height: 6px; background: #e63946; border-radius: 50%; }

        .return-page .notice { background: #fff5f5; border: 1px solid rgba(230,57,70,0.2); border-left: 3px solid #e63946; border-radius: 0 10px 10px 0; padding: 16px 20px; margin: 16px 0; }
        .return-page .notice p { color: #c0392b; font-size: 14px; margin: 0; }
        .return-page .notice strong { color: #e63946; }

        .return-page .info-box { background: #f9f9f9; border: 1px solid #eee; border-radius: 12px; padding: 20px 22px; margin: 16px 0; }
        .return-page .info-box p { color: #555; font-size: 14px; margin: 0; line-height: 1.7; }

        .return-page table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .return-page table th, .return-page table td { text-align: left; font-size: 14px; padding: 12px 16px; border-bottom: 1px solid #eee; color: #555; }
        .return-page table th { color: #111; font-weight: 700; background: #f9f9f9; }

        .return-page footer { background: #fff; border-top: 1px solid #eee; padding: 30px 60px; display: flex; align-items: center; justify-content: space-between; }
        .return-page footer .logo { font-size: 18px; font-weight: 800; color: #111; }
        .return-page footer .logo span { color: #e63946; }
        .return-page footer p { font-size: 13px; color: #999; }

        @media (max-width: 900px) {
          .return-page nav { padding: 16px 24px; }
          .return-page .hero { padding: 50px 24px 40px; }
          .return-page .hero h1 { font-size: 36px; }
          .return-page .layout { grid-template-columns: 1fr; }
          .return-page .sidebar { display: none; }
          .return-page .content { padding: 32px 24px; }
          .return-page footer { flex-direction: column; gap: 12px; text-align: center; padding: 24px; }
          .return-page table { display: block; overflow-x: auto; }
        }
      `}</style>

            <LegalPageNavbar variant={navbarVariant} />

            <div className="return-page" style={{ paddingTop: "72px" }}>
                <div className="hero">
                    <div className="tag">Legal</div>
                    <h1>
                        Return &amp; <span>Refund Policy</span>
                    </h1>
                    <p>
                        Effective Date: [Insert Launch Date] &nbsp;·&nbsp; Last Updated:
                        [Insert Date]
                    </p>
                </div>

                <div className="layout">
                    <div className="sidebar">
                        <p className="sib-title">Contents</p>
                        <a href="#s1">1. Overview</a>
                        <a href="#s2">2. How Payments Work</a>
                        <a href="#s3">3. Cancellations by You</a>
                        <a href="#s4">4. Cancellations by the Artist</a>
                        <a href="#s5">5. Refund Eligibility</a>
                        <a href="#s6">6. Non-Refundable Fees</a>
                        <a href="#s7">7. Refund Process &amp; Timelines</a>
                        <a href="#s8">8. Disputes</a>
                        <a href="#s9">9. Changes</a>
                        <a href="#s10">10. Contact</a>
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
                                <h2>Overview</h2>
                            </div>
                            <p>
                                Performa is a booking platform, not a retailer of physical
                                goods. Because we facilitate live event bookings between
                                clients and artists, this policy explains how cancellations,
                                returns, and refunds are handled for payments made through
                                Performa, rather than describing the return of a physical
                                product.
                            </p>
                            <p>
                                By making a booking payment on Performa, you agree to the
                                terms of this Return &amp; Refund Policy in addition to our{" "}
                                <a href="/privacy" style={{ color: "#e63946" }}>
                                    Privacy Policy
                                </a>{" "}
                                and Terms &amp; Conditions.
                            </p>
                        </div>

                        <div className="sec" id="s2">
                            <div className="sec-header">
                                <div className="sec-num">2</div>
                                <h2>How Payments Work</h2>
                            </div>
                            <p>
                                To help you understand what a refund covers, here is how a
                                typical booking and payment flows on Performa:
                            </p>
                            <ul>
                                <li>
                                    A client submits a booking request to an artist with the
                                    event details.
                                </li>
                                <li>
                                    Once the artist accepts the request, the client is
                                    notified and asked to make payment to lock in the
                                    booking.
                                </li>
                                <li>
                                    The client pays an <strong>advance amount</strong> plus a{" "}
                                    <strong>platform fee</strong> securely through our
                                    payment gateway. This payment is received into
                                    Performa&apos;s company bank account, not directly by the
                                    artist.
                                </li>
                                <li>
                                    Performa verifies the booking details and then transfers
                                    the advance amount to the artist via bank transfer.
                                </li>
                                <li>
                                    Any remaining balance for the booking is settled directly
                                    between the client and the artist at or around the event,
                                    unless otherwise agreed on the platform.
                                </li>
                            </ul>
                        </div>

                        <div className="sec" id="s3">
                            <div className="sec-header">
                                <div className="sec-num">3</div>
                                <h2>Cancellations by You (the Client)</h2>
                            </div>
                            <p>
                                If you need to cancel a booking after payment has been made,
                                your refund eligibility depends on how far in advance you
                                cancel relative to the event date:
                            </p>
                            <table>
                                <thead>
                                <tr>
                                    <th>Cancellation Window</th>
                                    <th>Refund of Advance</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>More than 7 days before the event</td>
                                    <td>Full refund of the advance amount</td>
                                </tr>
                                <tr>
                                    <td>Between 7 and 3 days before the event</td>
                                    <td>Partial refund 75% of the advance amount</td>
                                </tr>
                                <tr>
                                    <td>Less than 3 days before the event</td>
                                    <td>Advance amount is non-refundable</td>
                                </tr>
                                </tbody>
                            </table>
                            <div className="notice">
                                <p>
                                    <strong>Platform fees are non-refundable</strong> in all
                                    client-initiated cancellations, as this fee covers the
                                    cost of processing and securing your booking.
                                </p>
                            </div>
                        </div>

                        <div className="sec" id="s4">
                            <div className="sec-header">
                                <div className="sec-num">4</div>
                                <h2>Cancellations by the Artist / Non-Fulfillment</h2>
                            </div>
                            <p>
                                If an artist cancels an accepted booking, or fails to show up
                                or perform as agreed, you are entitled to a{" "}
                                <strong>full refund</strong> of both the advance amount and
                                the platform fee, provided the cancellation or no-show is
                                confirmed by Performa.
                            </p>
                            <ul>
                                <li>
                                    Report a non-fulfilled or artist-cancelled booking to us
                                    within 3 days of the event.
                                </li>
                                <li>
                                    Performa will review the booking record and communication
                                    history to confirm what happened.
                                </li>
                                <li>
                                    Once confirmed, the refund will be processed back to your
                                    original payment method.
                                </li>
                            </ul>
                        </div>

                        <div className="sec" id="s5">
                            <div className="sec-header">
                                <div className="sec-num">5</div>
                                <h2>Refund Eligibility</h2>
                            </div>
                            <p>You may be eligible for a refund where:</p>
                            <ul>
                                <li>
                                    You cancel within an eligible cancellation window as set
                                    out in <strong>Cancellations by You (the Client)</strong>.
                                </li>
                                <li>
                                    The artist cancels, is unavailable, or does not fulfill
                                    the booking as agreed.
                                </li>
                                <li>
                                    A duplicate or erroneous payment was made due to a
                                    technical error on the platform or payment gateway.
                                </li>
                                <li>
                                    The service materially differs from what was agreed in
                                    the accepted booking, as determined by Performa after
                                    review.
                                </li>
                            </ul>
                            <p>Refunds are generally not available where:</p>
                            <ul>
                                <li>
                                    The event proceeds as booked and performed by the artist.
                                </li>
                                <li>
                                    Cancellation is requested after the applicable
                                    non-refundable window in <strong>Cancellations by You (the Client)</strong>.
                                </li>
                                <li>
                                    Dissatisfaction is based on subjective factors unrelated
                                    to the artist failing to perform the agreed service.
                                </li>
                            </ul>
                        </div>

                        <div className="sec" id="s6">
                            <div className="sec-header">
                                <div className="sec-num">6</div>
                                <h2>Non-Refundable Fees</h2>
                            </div>
                            <p>
                                The <strong>platform fee</strong> charged at the time of
                                booking is used to operate and maintain Performa, and is
                                non-refundable except where the booking was not fulfilled due
                                to artist cancellation, no-show, or a confirmed platform
                                error, as described in <strong>Cancellations by the Artist / Non-Fulfillment and Refund Eligibility</strong>.
                            </p>
                            <p>
                                Any payment gateway charges applied by our payment provider
                                are outside Performa&apos;s control and may not be recoverable
                                even where a refund of the advance is approved.
                            </p>
                        </div>

                        <div className="sec" id="s7">
                            <div className="sec-header">
                                <div className="sec-num">7</div>
                                <h2>Refund Process &amp; Timelines</h2>
                            </div>
                            <ul>
                                <li>
                                    Submit a refund request through your Performa account or
                                    by contacting us at the email below.
                                </li>
                                <li>
                                    We review each request against the booking record,
                                    typically within 5 business days.
                                </li>
                                <li>
                                    Approved refunds are issued to your original payment
                                    method through our payment gateway, and may take an
                                    additional 5 - 7 business days to reflect, depending on
                                    your bank or card issuer.
                                </li>
                                <li>
                                    Since advances are paid out to artists after
                                    verification, refunds approved after payout may take
                                    longer to process while funds are recovered.
                                </li>
                            </ul>
                        </div>

                        <div className="sec" id="s8">
                            <div className="sec-header">
                                <div className="sec-num">8</div>
                                <h2>Disputes</h2>
                            </div>
                            <p>
                                If you and an artist disagree about whether a booking was
                                fulfilled, either party may raise the issue with Performa.
                                We will review the booking details, messages, and any
                                evidence provided by both sides, and make a decision on
                                refund eligibility in good faith. Our decision on platform
                                bookings is final for the purposes of processing a refund
                                through Performa.
                            </p>
                        </div>

                        <div className="sec" id="s9">
                            <div className="sec-header">
                                <div className="sec-num">9</div>
                                <h2>Changes to This Policy</h2>
                            </div>
                            <p>
                                We may update this Return &amp; Refund Policy from time to
                                time. When we do, we will update the date at the top of this
                                page. Continued use of the platform after changes take
                                effect means you accept the updated policy.
                            </p>
                        </div>

                        <div className="sec" id="s10">
                            <div className="sec-header">
                                <div className="sec-num">10</div>
                                <h2>Contact Us</h2>
                            </div>
                            <p>
                                If you have questions about this Return &amp; Refund Policy
                                or want to request a refund:
                            </p>
                            <div className="info-box" style={{ marginTop: "16px" }}>
                                <p>
                                    📧 <strong>Email:</strong> infoperforma.lk@gmail.com &nbsp;·&nbsp;
                                    📞 <strong>Phone:</strong> +94 70 403 5236 &nbsp;·&nbsp; 📍
                                    Kandy, Sri Lanka
                                </p>
                            </div>
                            <p style={{ marginTop: "14px", color: "#999", fontSize: "14px" }}>
                                This Return &amp; Refund Policy is governed by the laws of
                                Sri Lanka.
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

export default ReturnPolicy;