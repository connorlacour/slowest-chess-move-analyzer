import type {
  ChessComGame,
  DateBounds,
  TimeClass,
  TimeControlPreset,
} from "../types";
import { getEl } from "../lib/dom";

const bulletPresets: TimeControlPreset[] = [
    { label: "1+0", val: "60" },
    { label: "1+1", val: "60+1" },
    { label: "2+1", val: "120+1" },
  ]

const blitzPresets: TimeControlPreset[] = [
    { label: "3+0", val: "180" },
    { label: "3+2", val: "180+2" },
    { label: "5+0", val: "300" },
    { label: "5+3", val: "300+3" },
  ]

const rapidPresets: TimeControlPreset[] = [
  { label: "10+0", val: "600" },
  { label: "10+5", val: "600+5" },
  { label: "15+10", val: "900+10" },
  { label: "25+10", val: "1500+10" },
  { label: "30+0", val: "1800" },
];

export const TC_PRESETS: Record<TimeClass, TimeControlPreset[]> = {
  all: [...bulletPresets, ...blitzPresets, ...rapidPresets],
  bullet: bulletPresets,
  blitz: blitzPresets,
  rapid: rapidPresets,
};

export function renderCheckboxes(): void {
  const cls = getEl<HTMLSelectElement>("timeClassSelect").value as TimeClass;
  const grid = getEl("checkboxGrid");
  const presets = TC_PRESETS[cls] ?? [];
  grid.innerHTML = "";
  presets.forEach((p) => {
    const item = document.createElement("label");
    item.className = "cb-item";
    item.innerHTML = `
      <input type="checkbox" value="${p.val}">
      <span class="cb-label">${p.label}</span>
    `;
    const cb = item.querySelector("input")!;
    cb.addEventListener("change", () =>
      item.classList.toggle("checked", cb.checked),
    );
    grid.appendChild(item);
  });
}

export function getCheckedTCs(): string[] {
  return Array.from(
    document.querySelectorAll<HTMLInputElement>(
      '#checkboxGrid input[type="checkbox"]:checked',
    ),
  ).map((cb) => cb.value);
}

function toYM(month: string, year: string): string | null {
  if (!year) return null;
  return `${year}/${(month || "1").padStart(2, "0")}`;
}

export function getDateBounds(): DateBounds {
  return {
    fromYM: toYM(
      getEl<HTMLInputElement>("dateFromMonth").value,
      getEl<HTMLInputElement>("dateFromYear").value,
    ),
    toYM: toYM(
      getEl<HTMLInputElement>("dateToMonth").value,
      getEl<HTMLInputElement>("dateToYear").value,
    ),
  };
}

export function archiveInRange(
  archUrl: string,
  fromYM: string | null,
  toYM: string | null,
): boolean {
  const parts = archUrl.split("/");
  const ym = parts.slice(-2).join("/");
  if (fromYM && ym < fromYM) return false;
  if (toYM && ym > toYM) return false;
  return true;
}

export function gameInDateRange(
  game: ChessComGame,
  fromYM: string | null,
  toYM: string | null,
): boolean {
  if (!fromYM && !toYM) return true;
  const ts = game.end_time || game.last_activity || 0;
  if (!ts) return true;
  const d = new Date(ts * 1000);
  const ym = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  if (fromYM && ym < fromYM) return false;
  if (toYM && ym > toYM) return false;
  return true;
}

function deriveTimeClass(timeControl: string): string {
  const base = parseInt(timeControl.split("+")[0]);
  if (base < 180) return "bullet";
  if (base < 600) return "blitz";
  return "rapid";
}

export function gameMatchesFilter(game: ChessComGame): boolean {
  const cls = getEl<HTMLSelectElement>("timeClassSelect").value;
  const checkedTCs = getCheckedTCs();
  if (cls !== "all" && deriveTimeClass(game.time_control) !== cls) return false;
  if (checkedTCs.length > 0 && !checkedTCs.includes(game.time_control))
    return false;
  return true;
}

export function getLimit(): number {
  const v = parseInt(getEl<HTMLInputElement>("resultCount").value, 10);
  if (isNaN(v) || v < 1) return 1;
  return Math.min(v, 50);
}

export function validateDateRange(): boolean {
  const fromYM = toYM(
    getEl<HTMLInputElement>("dateFromMonth").value,
    getEl<HTMLInputElement>("dateFromYear").value,
  );
  const toYMVal = toYM(
    getEl<HTMLInputElement>("dateToMonth").value,
    getEl<HTMLInputElement>("dateToYear").value,
  );
  const invalid = !!(fromYM && toYMVal && fromYM > toYMVal);
  const fromInputs = [
    getEl<HTMLInputElement>("dateFromMonth"),
    getEl<HTMLInputElement>("dateFromYear"),
  ];
  const toInputs = [
    getEl<HTMLInputElement>("dateToMonth"),
    getEl<HTMLInputElement>("dateToYear"),
  ];
  fromInputs.forEach((i) => i.classList.toggle("invalid", invalid));
  toInputs.forEach((i) => i.classList.toggle("invalid", invalid));
  return !invalid;
}

export function initDateInputs(): void {
  const currentYear = String(new Date().getFullYear());
  getEl<HTMLInputElement>("dateFromYear").max = currentYear;
  getEl<HTMLInputElement>("dateToYear").max = currentYear;
}
