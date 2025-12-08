"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  businessId: string;
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
    const params = new URLSearchParams({ businessId });
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
