"use client";
import ForgotForm from "@/components/auth/ForgotForm";

export default function AdminForgot() {
  return <ForgotForm next="/admin/reset" backHref="/admin/login" />;
}
