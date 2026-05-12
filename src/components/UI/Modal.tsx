import React from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import './modal.scss';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    children?: React.ReactNode;
    hideFooter?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    children,
    hideFooter = false
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                    </button>
                </div>
                <div className="modal-body">
                    {message && <p>{message}</p>}
                    {children}
                </div>
                {!hideFooter && onConfirm && (
                    <div className="modal-footer">
                        <Button variant="outlined" onClick={onClose}>
                            {cancelText}
                        </Button>
                        <Button onClick={onConfirm}>
                            {confirmText}
                        </Button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
