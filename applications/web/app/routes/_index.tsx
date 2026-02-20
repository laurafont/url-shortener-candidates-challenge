import { useEffect, useState } from "react";
import { useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/_index";
import { baseUrl } from "@url-shortener/engine";
import { getShortLinkRepository } from "~/dependencies";
import { createShortLink } from "~/services/create-short-link";
import { checkRateLimit } from "~/lib/rate-limit";
import { ShortenForm } from "~/components/shorten-form";
import { ShortenedUrlResult } from "~/components/shortened-url-result";
import { LinkList } from "~/components/link-list";
import { EmptyState } from "~/components/empty-state";

export async function loader() {
  const repository = getShortLinkRepository();
  const links = await repository.listWithStats();
  return {
    baseUrl: baseUrl ? baseUrl + "/s/" : "-",
    links,
  };
}

export async function action({ request }: Route.ActionArgs) {
  if (!checkRateLimit(request)) {
    return { error: "Too many requests. Please try again later." };
  }

  const formData = await request.formData();
  const url = (formData.get("url") as string) ?? "";

  const repository = getShortLinkRepository();
  const shortLinkBase = baseUrl ? baseUrl + "/s/" : "-";
  const result = await createShortLink(repository, url, shortLinkBase);

  if (result.ok) {
    return { shortenedUrl: result.shortenedUrl };
  }
  return { error: result.error };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl, links } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.shortenedUrl) setShowSuccessDialog(true);
  }, [actionData?.shortenedUrl]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-lg space-y-8">
        <ShortenForm
          baseUrl={baseUrl}
          actionError={actionData?.error}
          isSubmitting={isSubmitting}
          urlError={urlError}
          setUrlError={setUrlError}
        />

        {actionData?.shortenedUrl && (
          <ShortenedUrlResult
            shortenedUrl={actionData.shortenedUrl}
            open={showSuccessDialog}
            onOpenChange={setShowSuccessDialog}
          />
        )}

        {links.length > 0 ? (
          <LinkList links={links} baseUrl={baseUrl} />
        ) : (
          <EmptyState />
        )}
      </div>
    </main>
  );
}
