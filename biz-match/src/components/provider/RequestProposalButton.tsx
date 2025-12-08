// src/components/provider/RequestProposalButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  businessId: string | undefined;
  serviceId?: string;
  className?: string;
};

export function RequestProposalButton({
  businessId,
  serviceId,
  className,
}: Props) {
  const router = useRouter();

  function handleClick() {
    if (!businessId) {
      console.error(
        "RequestProposalButton: businessId is undefined. Check the parent component."
      );
      alert("Something went wrong: missing provider id.");
      return;
    }

    const params = new URLSearchParams();
    params.set("businessId", businessId);
    if (serviceId) params.set("serviceId", serviceId);

    router.push(`/app/proposals/new?${params.toString()}`);
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      className={cn("flex items-center gap-1.5", className)}
    >
      <Send className="h-4 w-4" />
      Request proposal
    </Button>
  );
}
