import { toast } from "react-toastify";

export default function Alert() {

  // Success Alert
  const showSuccess = () => {
    toast.success("Verification code sent to your email!", {
      autoClose: 3000,
    });
  };

  // Error Alert
  const showError = () => {
    toast.error("Something went wrong!", {
      autoClose: 3000,
    });
  };

  // Warning Alert
  const showWarning = () => {
    toast.warn("Please check your input!", {
      autoClose: 3000,
    });
  };

  // Info Alert
  const showInfo = () => {
    toast.info("Processing your request...", {
      autoClose: 3000,
    });
  };

  // Fully Custom Styled Alert
  const showCustom = () => {
    toast("Custom styled alert!", {
      autoClose: 3000,
      style: {
        background: "#333",
        color: "#fff",
        padding: "12px 18px",
        fontSize: "16px",
        borderRadius: "10px",
      },
      icon: "✨",
    });
  };

  return (
    <>
      <button onClick={showSuccess}>Success Alert</button>
      <button onClick={showError}>Error Alert</button>
      <button onClick={showWarning}>Warning Alert</button>
      <button onClick={showInfo}>Info Alert</button>
      <button onClick={showCustom}>Custom Alert</button>
    </>
  );
}
