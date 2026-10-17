"use client";
import ResetForm from "@/components/auth/ResetForm";

export default function Reset() {
  return <ResetForm forgotHref="/forgot" after="/account" />;
}
