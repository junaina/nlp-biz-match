"use client";

import { useState, useTransition } from "react";
import {
  addToShortlistClient,
  removeFromShortlistClient,
} from "@/modules/request/client/shortlist.client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

type Props = {
  requestId: string;
  providerServiceId: string;
  initialShortlisted?: boolean;
  onChange?: (isShortlisted: boolean) => void;
};

export function ShortlistToggleButton({
  requestId,
  providerServiceId,
  initialShortlisted = false,
  onChange,
}: Props) {
  const [isShortlisted, setIsShortlisted] = useState(initialShortlisted);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        if (!isShortlisted) {
          await addToShortlistClient(requestId, providerServiceId);
          setIsShortlisted(true);
          onChange?.(true);
        } else {
          await removeFromShortlistClient(requestId, providerServiceId);
          setIsShortlisted(false);
          onChange?.(false);
        }
      } catch (err) {
        console.error(err);
        // TODO: hook up a toast here if you want
      }
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending}
      className={cn(
        "border bg-transparent hover:bg-blue/10",
        isShortlisted
          ? "border-blue-600 text-blue-600"
          : "border-blue/60 text-blue"
      )}
      onClick={handleClick}
    >
      <Plus className="h-4 w-4 mr-1.5" />
      {isShortlisted ? "Shortlisted" : "Add to shortlist"}
    </Button>
  );
}
