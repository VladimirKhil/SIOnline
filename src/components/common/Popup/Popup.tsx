import * as React from 'react';
import * as ReactDOM from 'react-dom';

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

    // State to track if the layout element has been created
    const [layout, setLayout] = React.useState<HTMLDivElement | null>(null);

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
            className={`popup ${className || ''}`}
            style={popupStyle}
        >
            {children}
        </section>,
        layout
    );
};

export default Popup;