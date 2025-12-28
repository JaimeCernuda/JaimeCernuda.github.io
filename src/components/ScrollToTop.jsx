import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const action = useNavigationType();

    useEffect(() => {
        console.log('ScrollToTop triggered:', { pathname, action });
        // Only scroll to top if the navigation action is PUSH (new navigation)
        // or REPLACE. If it's POP (back button), the browser handles scroll restoration.
        if (action !== 'POP') {
            // Use setTimeout to ensure this runs after any immediate layout shifts
            setTimeout(() => {
                console.log('Scrolling to top');
                window.scrollTo(0, 0);
            }, 0);
        }
    }, [pathname, action]);

    return null;
};

export default ScrollToTop;
