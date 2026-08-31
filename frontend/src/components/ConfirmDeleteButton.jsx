import { useState } from "react";

export default function ConfirmDeleteButton({ onConfirm, label = "Delete" }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="text-xs">
        Sure?{" "}
        <button onClick={onConfirm} className="mr-2 font-semibold text-red-600 hover:underline">
          Yes
        </button>
        <button onClick={() => setConfirming(false)} className="text-gray-500 hover:underline">
          No
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-xs text-red-600 hover:underline">
      {label}
    </button>
  );
}