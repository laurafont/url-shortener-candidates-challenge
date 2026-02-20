import { useState } from "react";
import { Form, useActionData } from "react-router";
import type { Route } from "./+types/_index";
import { baseUrl } from "@url-shortener/engine";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { getShortLinkRepository } from "~/dependencies";
import { validateUrl } from "~/lib/url-validation";
import { checkRateLimit } from "~/lib/rate-limit";
import { createShortLink } from "~/services/create-short-link";

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
  const { baseUrl } = loaderData;
  const actionData = useActionData<typeof action>();
  const [urlError, setUrlError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const urlInput = form.elements.namedItem("url");
    const url =
      urlInput && "value" in urlInput ? String(urlInput.value) : "";
    const result = validateUrl(url);
    if (!result.ok) {
      e.preventDefault();
      setUrlError(result.error);
      return;
    }
    setUrlError(null);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-lg space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">URL Shortener</CardTitle>
            <CardDescription>
              Paste a long URL and get a short link. Shortened URLs start with{" "}
              {baseUrl}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              method="post"
              className="flex flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-2">
                <label htmlFor="url" className="text-sm font-medium">
                  URL
                </label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  placeholder="https://example.com/your-long-url"
                  required
                  aria-invalid={!!urlError}
                  aria-describedby={urlError ? "url-error" : undefined}
                  onChange={() => setUrlError(null)}
                  className={
                    urlError
                      ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700"
                      : undefined
                  }
                />
                {urlError && (
                  <p
                    id="url-error"
                    className="text-sm font-medium text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {urlError}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" size="lg">
                Shorten URL
              </Button>
            </Form>
          </CardContent>
        </Card>

        {actionData?.shortenedUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your shortened URL</CardTitle>
              <CardDescription>Copy or open the link below</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={actionData.shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-900 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50 dark:hover:bg-gray-800"
              >
                {actionData.shortenedUrl}
              </a>
            </CardContent>
          </Card>
        )}

        {actionData?.error && (
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="pt-6">
              <p
                className="text-sm font-medium text-red-600 dark:text-red-400"
                role="alert"
              >
                {actionData.error}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
