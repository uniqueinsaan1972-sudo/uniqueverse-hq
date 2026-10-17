"use client";
import ResetForm from "@/components/auth/ResetForm";

export default function AdminReset() {
  return <ResetForm forgotHref="/admin/forgot" after="/admin" />;
}
