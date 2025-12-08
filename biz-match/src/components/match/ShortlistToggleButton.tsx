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
};

export function ShortlistToggleButton({
  requestId,
  providerServiceId,
  initialShortlisted = false,
}: Props) {
  const [isShortlisted, setIsShortlisted] = useState(initialShortlisted);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        if (!isShortlisted) {
          await addToShortlistClient(requestId, providerServiceId);
          setIsShortlisted(true);
        } else {
          await removeFromShortlistClient(requestId, providerServiceId);
          setIsShortlisted(false);
        }
      } catch (err) {
        console.error(err);
        // you can show a toast here
      }
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending}
      className="border border-blue/60 bg-transparent text-blue hover:bg-blue/10"
      onClick={handleClick}
    >
      <Plus className="h-4 w-4 mr-1.5" />
      {isShortlisted ? "Shortlisted" : "Add to shortlist"}
    </Button>
  );
}
