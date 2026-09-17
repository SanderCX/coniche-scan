import { verstuurMail } from "@/lib/gmail";

export async function POST(request: Request) {
  const body = (await request.json()) as { naar?: string; onderwerp?: string; tekst?: string };
  if (!body.naar || !body.onderwerp || !body.tekst) {
    return Response.json({ verstuurd: false, reden: "ongeldig-verzoek" }, { status: 400 });
  }

  const resultaat = await verstuurMail({
    naar: body.naar,
    onderwerp: body.onderwerp,
    tekst: body.tekst,
  });

  return Response.json(resultaat);
}
