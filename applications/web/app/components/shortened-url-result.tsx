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
            onClick={() => navigator.clipboard.writeText(shortenedUrl)}
          >
            Copy
          </Button>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
          <Button asChild>
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
