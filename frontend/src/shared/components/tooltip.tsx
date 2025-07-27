import React from "react";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { TooltipContentProps } from "@radix-ui/react-tooltip";
import { cn } from "../utils/cn";

interface TooltipProps extends Omit<TooltipContentProps, "content"> {
  text?: string;
  content?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerProps?: React.ComponentProps<typeof TooltipTrigger>;
}

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  content,
  className,
  children,
  open,
  onOpenChange,
  triggerProps = {},
  ...contentProps
}) => {
  const tooltipContent = content ?? text;
  return (
    <TooltipProvider>
      <ShadcnTooltip open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild {...triggerProps}>
          {children}
        </TooltipTrigger>
        {tooltipContent ? (
          <TooltipContent {...contentProps} className={cn(className)}>
            {tooltipContent}
          </TooltipContent>
        ) : null}
      </ShadcnTooltip>
    </TooltipProvider>
  );
};
