import { redirect } from "next/navigation";

/** "Applicatie" is vervallen als hoofdlink: Instellingen opent vanuit het Accountmenu, met Gebruikers als landingstab. */
export default function ApplicatieRedirect() {
  redirect("/beheer/gebruikers");
}
