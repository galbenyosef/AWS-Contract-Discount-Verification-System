import React, { useEffect, useState } from "react";

type ToastType = "error" | "success" | "warning" | "info";

type ToastProps = {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
};

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible, duration, onClose]);

  const getToastClass = () => {
    const baseClass = "toast align-items-center border-0";
    switch (type) {
      case "error":
        return `${baseClass} text-bg-danger`;
      case "success":
        return `${baseClass} text-bg-success`;
      case "warning":
        return `${baseClass} text-bg-warning`;
      case "info":
        return `${baseClass} text-bg-info`;
      default:
        return `${baseClass} text-bg-primary`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "error":
        return <i className="bi bi-exclamation-triangle-fill"></i>;
      case "success":
        return <i className="bi bi-check-circle-fill"></i>;
      case "warning":
        return <i className="bi bi-exclamation-triangle-fill"></i>;
      case "info":
        return <i className="bi bi-info-circle-fill"></i>;
      default:
        return <i className="bi bi-info-circle-fill"></i>;
    }
  };

  if (!isVisible && !show) return null;

  return (
    <div className="toast-container">
      <div
        className={`${getToastClass()} ${show ? "show" : ""}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{
          transition: "all 0.3s ease-in-out",
          transform: show ? "translateX(0)" : "translateX(100%)",
          opacity: show ? 1 : 0,
        }}
      >
        <div className="d-flex">
          <div className="toast-body d-flex align-items-center">
            <span className="me-2">{getIcon()}</span>
            <span style={{ whiteSpace: "pre-line" }}>{message}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
