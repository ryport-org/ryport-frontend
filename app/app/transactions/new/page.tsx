import { redirect } from "next/navigation";

export default function NewTransactionPage() {
  redirect("/app/transactions?new=1");
}
