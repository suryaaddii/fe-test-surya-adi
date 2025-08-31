"use client";
import { useState } from "react";
export default function PreviewDialog({
  render,
  onConfirm,
  label = "Preview",
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="mb-4">{render()}</div>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setOpen(false)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
