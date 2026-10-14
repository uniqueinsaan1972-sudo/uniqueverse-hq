"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
/** The site's origin (e.g. https://yourdomain.com). Empty on the server so hydration stays consistent. */
export const useOrigin = () => useSyncExternalStore(subscribe, () => window.location.origin, () => "");
