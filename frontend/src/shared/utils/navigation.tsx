import React from "react";
import { CommandKeyIcon } from "../components/svgs";

export enum KeyboardKeys {
  // Navigation
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
  Home = "Home",
  End = "End",
  PageUp = "PageUp",
  PageDown = "PageDown",

  // Control
  Enter = "Enter",
  Escape = "Escape",
  Tab = "Tab",
  Backspace = "Backspace",
  Delete = "Delete",
  Space = " ",
  Shift = "Shift",
  Control = "Control",
  Alt = "Alt",
  Meta = "Meta",

  // Special
  Slash = "/",
  Backslash = "\\",
  Backtick = "`",
  Hyphen = "-",
  Equal = "=",
  BracketLeft = "[",
  BracketRight = "]",
  Semicolon = ";",
  Quote = '"',
}

export function getIsMacOs() {
  return /Macintosh/i.test(navigator.userAgent);
}

export function getCommandIcon(
  textOnly: boolean = false
): string | React.ReactNode {
  return getIsMacOs() ? textOnly ? "Cmd" : <CommandKeyIcon /> : "Ctrl";
}

export function getCommandKeyboardKey(): KeyboardKeys {
  return getIsMacOs() ? KeyboardKeys.Meta : KeyboardKeys.Control;
}
