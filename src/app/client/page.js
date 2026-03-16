import { redirect } from "next/navigation";

// /client has moved permanently to the root discovery page.
export default function ClientPage() {
  redirect("/");
}
