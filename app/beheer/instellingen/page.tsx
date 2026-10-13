import { redirect } from "next/navigation";

/** Dit was de pagina Instellingen met de drempels en termijnen. Die staat nu als tab onder Instellingen (`/beheer/drempels`). */
export default function InstellingenRedirect() {
  redirect("/beheer/drempels");
}
