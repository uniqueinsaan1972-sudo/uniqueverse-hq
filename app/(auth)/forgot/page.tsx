"use client";
import ForgotForm from "@/components/auth/ForgotForm";

export default function Forgot() {
  return <ForgotForm next="/reset" backHref="/login" />;
}
