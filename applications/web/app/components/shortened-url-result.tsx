import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface ShortenedUrlResultProps {
  shortenedUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortenedUrlResult({
  shortenedUrl,
  open,
  onOpenChange,
}: ShortenedUrlResultProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your shortened URL</DialogTitle>
          <DialogDescription>Copy or open the link below</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            readOnly
            value={shortenedUrl}
            className="font-mono text-sm"
          />
          <Button
            type="button"
            className="hover:bg-gray-700 dark:hover:bg-gray-100"
            onClick={() => navigator.clipboard.writeText(shortenedUrl)}
          >
            Copy
          </Button>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="hover:bg-gray-900 hover:text-white dark:hover:bg-gray-800 dark:hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
          <Button
            asChild
            className="hover:bg-gray-700 dark:hover:bg-gray-100"
          >
            <a
              href={shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open link
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
