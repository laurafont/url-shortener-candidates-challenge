import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface EmptyStateProps {
  onCreateClick?: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">No shortened links yet</CardTitle>
        <CardDescription>
          Create your first short link using the form above.
        </CardDescription>
      </CardHeader>
      {onCreateClick && (
        <CardContent>
          <button
            type="button"
            onClick={onCreateClick}
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Create your first link
          </button>
        </CardContent>
      )}
    </Card>
  );
}
