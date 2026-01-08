import { useState, useCallback } from "react";
import { isLoggedIn } from "../utils/auth";

/**
 * Small helper hook to guard actions behind auth.
 * Usage:
 *   const { requireAuth, modalOpen, closeModal } = useRequireAuth();
 *   requireAuth(() => doSomething());
 */
export default function useRequireAuth() {
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const requireAuth = useCallback(
    (cb) => {
      if (isLoggedIn()) {
        if (typeof cb === "function") cb();
      } else {
        setModalOpen(true);
      }
    },
    []
  );

  return { requireAuth, modalOpen, closeModal };
}
