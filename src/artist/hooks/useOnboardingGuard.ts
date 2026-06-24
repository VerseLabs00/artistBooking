import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

/**
 * Redirects artists who haven't completed onboarding back to the step they left off at.
 * Call this at the top of any protected page (artistHome, account, editProfile, etc.).
 */
export function useOnboardingGuard() {
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        api.get('/onboarding/status')
            .then(({ data }) => {
                if (cancelled) return;
                if (!data.basic_info_done) {
                    navigate('/information', { replace: true });
                } else if (!data.verification_done) {
                    navigate('/verification', { replace: true });
                } else if (!data.talent_done) {
                    navigate('/talent', { replace: true });
                }
                // all done — stay on the current page
            })
            .catch(() => {
                // If the endpoint isn't available (e.g. 404), don't block the page.
            });

        return () => { cancelled = true; };
    }, [navigate]);
}
