import ArrowBack from "@mui/icons-material/ArrowBack";
import BookmarkBorder from "@mui/icons-material/BookmarkBorder";
import DirectionsBus from "@mui/icons-material/DirectionsBus";
import DirectionsWalk from "@mui/icons-material/DirectionsWalk";
import GpsFixed from "@mui/icons-material/GpsFixed";
import LocationOn from "@mui/icons-material/LocationOn";
import NearMe from "@mui/icons-material/NearMe";
import Schedule from "@mui/icons-material/Schedule";
import SwapVert from "@mui/icons-material/SwapVert";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import MuiButton from "@mui/material/Button";
import MuiChip from "@mui/material/Chip";
import MuiIconButton from "@mui/material/IconButton";
import MuiTypography from "@mui/material/Typography";
import type { MouseEventHandler, ReactNode } from "react";

type IconName =
  | "arrow-left"
  | "bookmark"
  | "swap"
  | "swap-horizontal"
  | "clock"
  | "bus"
  | "walk"
  | "pin"
  | "navigation"
  | "crosshair";

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const iconMap = {
    "arrow-left": ArrowBack,
    bookmark: BookmarkBorder,
    swap: SwapVert,
    "swap-horizontal": SwapHoriz,
    clock: Schedule,
    bus: DirectionsBus,
    walk: DirectionsWalk,
    pin: LocationOn,
    navigation: NearMe,
    crosshair: GpsFixed,
  } as const;
  const IconComponent = iconMap[name];
  return <IconComponent aria-label={name} sx={{ fontSize: size }} />;
}

export function Button({
  children,
  className = "",
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <MuiButton
      className={`shared-button ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </MuiButton>
  );
}
export function IconButton({
  label,
  children,
  className = "",
  disabled,
  onClick,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <MuiIconButton
      className={`icon-button ${className}`}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </MuiIconButton>
  );
}
export function Text({
  as: Tag = "p",
  children,
  className = "",
  ...props
}: {
  as?: "p" | "span" | "h1" | "h2" | "h3";
  children: ReactNode;
  className?: string;
} & Record<string, unknown>) {
  return (
    <MuiTypography
      component={Tag}
      className={`shared-text ${className}`}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}
export function TransitPill({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "green";
}) {
  return (
    <MuiChip
      className={`transit-pill transit-pill--${tone}`}
      label={children}
    />
  );
}
