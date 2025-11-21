import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useAppSelector } from '../../../state/hooks';

import './Popup.css';

interface PopupProps {
    className?: string;
    onClose?: () => void;
    hideOnClick?: boolean;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

const Popup: React.FC<PopupProps> = (props) => {
    const {
        className,
        onClose,
        hideOnClick = true,
        children,
        style = {}
    } = props;

    const { windowWidth, windowHeight } = useAppSelector(state => ({
        windowWidth: state.ui.windowWidth,
        windowHeight: state.ui.windowHeight
    }));

    // State to track if the layout element has been created
    const [layout, setLayout] = React.useState<HTMLDivElement | null>(null);
    const bodyRef = React.useRef<HTMLDivElement>(null);

    // Create a container for the popup
    React.useEffect(() => {
        const newLayout = document.createElement('div');
        newLayout.style.position = 'absolute';
        newLayout.style.top = '0';
        newLayout.style.left = '0';
        newLayout.style.width = '100%';
        newLayout.style.height = '100%';
        newLayout.style.pointerEvents = 'none';

        document.body.appendChild(newLayout);
        setLayout(newLayout);

        return () => {
            document.body.removeChild(newLayout);
        };
    }, []);

    // Set up document click listener to close popup
    React.useEffect(() => {
        if (!layout) return;

        const handleOutsideClick = (e: MouseEvent) => {
            // Don't close if clicking inside the popup
            if (layout &&
				e.target instanceof Node &&
                layout.contains(e.target as Node) &&
				(e.type === 'mousedown' || !hideOnClick)) {
                return;
            }

            if (onClose) {
				window.setTimeout(onClose, 1);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('mouseup', handleOutsideClick);

        if (onClose) {
            window.addEventListener('resize', onClose);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('mouseup', handleOutsideClick);

            if (onClose) {
                window.removeEventListener('resize', onClose);
            }
        };
    }, [hideOnClick, onClose, layout]);

    const moveBodyToFitIntoWindow = React.useCallback((): void => {
        const body = bodyRef.current;

        if (body === null) {
            return;
        }

        const bodyRect = body.getBoundingClientRect();
        const windowRect = window.document.body.getBoundingClientRect();

        let transformX: string | null = null;
        let transformY: string | null = null;

        if (bodyRect.left < windowRect.left) {
            transformX = `${windowRect.left - bodyRect.left + 1}px`;
        } else if (bodyRect.right > windowRect.right) {
            transformX = `${windowRect.right - bodyRect.right - 1}px`;
        }

        if (bodyRect.top < windowRect.top) {
            transformY = `${windowRect.top - bodyRect.top + 1}px`;
        } else if (bodyRect.bottom > windowRect.bottom) {
            transformY = `${windowRect.bottom - bodyRect.bottom - 1}px`;
        }

        if (transformX || transformY) {
            body.style.transform = `translate(${transformX ?? '0'}, ${transformY ?? '0'})`;
        }
    }, []);

    React.useLayoutEffect(() => {
        // Need to wait for next frame to ensure content is fully rendered
        const timeoutId = window.setTimeout(moveBodyToFitIntoWindow, 0);
        return () => window.clearTimeout(timeoutId);
    }, [windowHeight, windowWidth, children, moveBodyToFitIntoWindow]);

    // Don't render anything until the layout element is created
    if (!layout) {
        return null;
    }

    const popupStyle: React.CSSProperties = {
        ...style,
        pointerEvents: 'initial',
        overflowY: 'auto'
    };

    return ReactDOM.createPortal(
        <section
            ref={bodyRef}
            className={`popup ${className || ''}`}
            style={popupStyle}
        >
            {children}
        </section>,
        layout
    );
};

export default Popup;