import React from "react";
import { BrandPageLoader, BrandSavingOverlay } from "../brand-loader/BrandLoader";

/** Full-screen load while account data is first fetched */
export function AccountPageLoader() {
  return (
    <BrandPageLoader
      message="Loading your account…"
      ariaLabel="Loading your account"
    />
  );
}

/** Subtle indicator when saving profile */
export function AccountSavingOverlay() {
  return (
    <BrandSavingOverlay
      label="Saving your changes"
      ariaLabel="Saving changes"
      showChip
    />
  );
}
