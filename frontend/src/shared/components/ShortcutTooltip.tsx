"use client";

import { Options, useHotkeys } from "react-hotkeys-hook";
import { HotkeysEvent } from "react-hotkeys-hook/packages/react-hotkeys-hook/dist/types";
import { getIsMacOs, KeyboardKeys } from "../utils/navigation";
import { EnterKeyIcon } from "./svgs";
import { Tooltip } from "./tooltip";
import { cn } from "../utils/cn";

const SPECIAL_CHAR_TO_WORD_MAP: Record<string, string> = {
  ".": "period",
  "/": "slash",
  "-": "hyphen",
};

export const SHORTCUT_KEY_ICON_MAP: Partial<
  Record<KeyboardKeys, React.ReactNode>
> = {
  [KeyboardKeys.Meta]: <span>⌘</span>,
  [KeyboardKeys.Control]: <span>⇧</span>,
  [KeyboardKeys.Backspace]: <span>⌫</span>,
  [KeyboardKeys.Alt]: <span> {getIsMacOs() ? "⌥" : "alt"}</span>,
  [KeyboardKeys.ArrowLeft]: <span>←</span>,
  [KeyboardKeys.ArrowRight]: <span>→</span>,
  [KeyboardKeys.ArrowUp]: <span>↑</span>,
  [KeyboardKeys.ArrowDown]: <span>↓</span>,
  [KeyboardKeys.Shift]: <span>⇧</span>,
  [KeyboardKeys.Enter]: <EnterKeyIcon />,
  [KeyboardKeys.Slash]: <span className="-translate-y-[1px]">/</span>,
};

interface Props extends React.PropsWithChildren {
  text?: string;
  keys: (string | KeyboardKeys)[];
  hotKeyCallback: (event: KeyboardEvent, hotKeyEvent: HotkeysEvent) => void;
  hotKeyOptions?: Options;
  hotKeyDependencies?: unknown[];
  enableInAllScopes?: boolean;
}

export const ShortcutTooltip = ({
  children,
  text,
  keys,
  hotKeyCallback,
  hotKeyOptions = {},
  hotKeyDependencies = [],
  enableInAllScopes = false,
}: Props) => {
  useHotkeys(
    keys?.map((k) => SPECIAL_CHAR_TO_WORD_MAP[k] ?? k)?.join("+"),
    hotKeyCallback,
    {
      enabled: enableInAllScopes ? true : hotKeyOptions?.enabled ?? true,
      ...hotKeyOptions,
    },
    hotKeyDependencies
  );

  return (
    <Tooltip
      content={
        <ShortcutTooltipContentRenderer
          text={text}
          keys={keys}
          className={"text-white"}
          keysClassName={"text-white/80 border-white/25 shadow-white/10"}
        />
      }
    >
      {children}
    </Tooltip>
  );
};

export function ShortcutTooltipContentRenderer({
  text,
  keys,
  className = "",
  keysClassName = "",
  small = false,
}: {
  small?: boolean;
  className?: string;
  text?: string;
  keys: (string | KeyboardKeys)[];
  keysClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs font-normal text-gray-300",
        small && "text-[11px]",
        className
      )}
    >
      {text ? <span className="mr-1.5">{text} </span> : null}

      {keys.map((key) => (
        <p
          key={key}
          className={cn(
            "flex h-[18px] min-w-[18px] items-center justify-center rounded-[3px] border bg-white/10 px-1 shadow-sm backdrop-blur-sm [&>span]:flex [&>span]:items-center [&>span]:justify-center [&>svg]:size-full",
            small && "h-[16px] min-w-[16px]",
            SHORTCUT_KEY_ICON_MAP[key as KeyboardKeys] ? `p-0.5` : "px-1",
            keysClassName
          )}
        >
          {SHORTCUT_KEY_ICON_MAP[key as KeyboardKeys] ?? key}
        </p>
      ))}
    </div>
  );
}
