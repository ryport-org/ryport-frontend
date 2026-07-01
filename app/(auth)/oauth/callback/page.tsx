import { redirect } from "next/navigation";

export default function OAuthCallbackRedirect() {
  redirect("/auth/callback");
}
