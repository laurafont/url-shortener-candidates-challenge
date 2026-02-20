import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { validateUrl } from "~/lib/url-validation";

interface ShortenFormProps {
  baseUrl: string;
  actionError?: string | null;
  isSubmitting: boolean;
  urlError: string | null;
  setUrlError: (error: string | null) => void;
}

export function ShortenForm({
  baseUrl,
  actionError,
  isSubmitting,
  urlError,
  setUrlError,
}: ShortenFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const urlInput = form.elements.namedItem("url");
    const url = urlInput && "value" in urlInput ? String(urlInput.value) : "";
    const result = validateUrl(url);
    if (!result.ok) {
      e.preventDefault();
      setUrlError(result.error);
      return;
    }
    setUrlError(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">URL Shortener</CardTitle>
        <CardDescription>
          Paste a long URL and get a short link. Shortened URLs start with{" "}
          {baseUrl}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
              disabled={isSubmitting}
              aria-invalid={!!urlError}
              aria-busy={isSubmitting}
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
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Shortening…" : "Shorten URL"}
          </Button>
        </Form>
        {actionError && (
          <p
            className="text-sm font-medium text-red-600 dark:text-red-400"
            role="alert"
          >
            {actionError}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
