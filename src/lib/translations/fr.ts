import { FR_SHELL } from "./fr-shell";
import { FR_COMMUNITY } from "./fr-community";
import { FR_HOME } from "./fr-home";
import { FR_DIRECTORY } from "./fr-directory";
import { FR_ALERT } from "./fr-alert";
import { FR_RIGHTS } from "./fr-rights";
import { FR_MORE } from "./fr-more";
import { FR_CHAT } from "./fr-chat";
import { FR_FRIENDS } from "./fr-friends";
import { FR_VOICE } from "./fr-voice";

export const FR: Record<string, string> = {
  ...FR_SHELL,
  ...FR_COMMUNITY,
  ...FR_HOME,
  ...FR_DIRECTORY,
  ...FR_ALERT,
  ...FR_RIGHTS,
  ...FR_MORE,
  ...FR_CHAT,
  ...FR_FRIENDS,
  ...FR_VOICE,
};
