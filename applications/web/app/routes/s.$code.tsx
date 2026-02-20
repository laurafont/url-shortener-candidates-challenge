import { redirect } from "react-router";
import { isbot } from "isbot";
import type { Route } from "./+types/s.$code";
import { getShortLinkRepository } from "~/dependencies";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { code } = params;

  const repository = getShortLinkRepository();
  const shortLink = await repository.getByCode(code);

  if (!shortLink) {
    throw new Response("Not Found", { status: 404 });
  }

  const userAgent = request.headers.get("User-Agent") ?? "";
  if (!isbot(userAgent)) {
    await repository.recordClick(code);
  }

  return redirect(shortLink.originalUrl);
}
