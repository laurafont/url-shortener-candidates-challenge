import type { ShortLinkWithStats } from "@url-shortener/engine";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface LinkListProps {
  links: ShortLinkWithStats[];
  baseUrl: string;
}

export function LinkList({ links, baseUrl }: LinkListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your shortened links</CardTitle>
        <CardDescription>
          {links.length} link{links.length === 1 ? "" : "s"} created
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {links.map((link) => {
            const shortUrl = baseUrl !== "-" ? `${baseUrl}${link.code}` : link.code;
            return (
              <li
                key={link.id}
                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {shortUrl}
                  </a>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {link.clickCount} click{link.clickCount === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {link.originalUrl}
                </p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
