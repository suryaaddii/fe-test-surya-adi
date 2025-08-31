import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login"); // langsung arahkan ke /login
}
