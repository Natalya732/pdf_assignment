"use client";

import { X } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { Button } from "./button";
import { cn } from "@/shared/utils/cn";

interface ToastProps {
  id: string | number;
  title: string;
  variant?: "success" | "destructive" | "info" | "default";
  description?: string;
  button?: {
    label: string;
    onClick: () => void;
  };
}

export function toast(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      variant={toast.variant}
      title={toast.title}
      description={toast.description}
      button={
        toast?.button
          ? {
              label: toast.button?.label,
              onClick: toast.button?.onClick,
            }
          : undefined
      }
    />
  ));
}

const toastVariants = {
  default: "bg-white text-primary",
  success: "bg-green-700 text-primary-foreground ring-white/30",
  destructive: "bg-red-700 text-primary-foreground ring-white/30",
  info: "",
};
toastVariants.info = toastVariants.default;

function Toast(props: ToastProps) {
  const { title, description, button, id, variant = "info" } = props;

  return (
    <div
      className={cn(
        "flex w-full min-w-[270px] items-start rounded-md p-4 shadow-md ring-1 ring-black/5 md:max-w-[400px]",
        toastVariants[variant]
      )}
    >
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p className="text-sm font-medium">{title}</p>
          {description && (
            <p
              className={cn(
                "mt-1 text-xs text-muted-foreground",
                variant === "success" || variant === "destructive"
                  ? "text-white"
                  : ""
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {button ? (
        <div className="flex items-center justify-end">
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => {
              button?.onClick();
              sonnerToast.dismiss(id);
            }}
          >
            {button?.label}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <X
            className="h-4 w-4 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              sonnerToast.dismiss(id);
            }}
          />
        </div>
      )}
    </div>
  );
}
