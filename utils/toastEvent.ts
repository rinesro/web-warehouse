
type ToastEventType = {
  message: string;
  type: "success" | "error";
};

export const triggerToast = (message: string, type: "success" | "error") => {
  const event = new CustomEvent<ToastEventType>("show-toast", {
    detail: { message, type },
  });
  window.dispatchEvent(event);
};