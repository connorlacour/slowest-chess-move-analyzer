import { state, resetState } from "./state";
import { fetchArchives, fetchMonth } from "./api/chesscom";
import { parsePgn, extractMoves } from "./lib/pgn";
import { formatDate, sleep } from "./lib/time";
import { getEl } from "./lib/dom";
import {
  getDateBounds,
  archiveInRange,
  gameInDateRange,
  gameMatchesFilter,
  getCheckedTCs,
  getLimit,
  validateDateRange,
  TC_PRESETS,
} from "./ui/filters";
import { setProgress, updateStats } from "./ui/progress";
import { showError, clearError } from "./ui/error";
import { renderResults, renderSkeleton } from "./ui/results";
import type { MoveEntry, TimeClass } from "./types";

function getResult(
  game: {
    white: { username: string; result: string };
    black: { username: string; result: string };
  },
  username: string,
): "win" | "loss" | "draw" {
  const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
  const myResult = isWhite ? game.white.result : game.black.result;
  if (myResult === "win") return "win";
  if (
    ["checkmated", "timeout", "resigned", "abandoned", "lose"].includes(
      myResult,
    )
  )
    return "loss";
  return "draw";
}

function tryInsertMove(entry: MoveEntry): void {
  state.topN.push(entry);
  state.topN.sort((a, b) => b.thinkSeconds - a.thinkSeconds);
  const limit = getLimit();
  if (state.topN.length > limit) state.topN.length = limit;
}

function buildFilterLabel(): string {
  const cls = getEl<HTMLSelectElement>("timeClassSelect").value as TimeClass;
  const checkedTCs = getCheckedTCs();
  let label = cls === "all" ? "All classes" : cls;
  if (checkedTCs.length > 0) {
    const presets = TC_PRESETS[cls] ?? TC_PRESETS.all;
    const labels = checkedTCs.map(
      (v) => presets.find((p) => p.val === v)?.label ?? v,
    );
    label += " · " + labels.join(", ");
  }
  return label;
}

export async function startAnalysis(): Promise<void> {
  const username = getEl<HTMLInputElement>("username").value.trim();
  if (!username) {
    showError("Please enter a username.");
    return;
  }
  if (!validateDateRange()) {
    showError("Start date must be before end date.");
    return;
  }

  clearError();
  resetState();

  getEl("resultsBlock").classList.remove("show");
  getEl("progressBlock").classList.add("show");
  getEl<HTMLButtonElement>("runBtn").disabled = true;
  getEl<HTMLButtonElement>("stopBtn").style.display = "inline-block";
  getEl("statMonths").textContent = "0";
  updateStats();
  setProgress(0, "Fetching archive list…");

  try {
    const allArchives = await fetchArchives(username);
    if (allArchives.length === 0)
      throw new Error("No game archives found for this user.");

    const { fromYM, toYM } = getDateBounds();
    const archives = allArchives.filter((url) =>
      archiveInRange(url, fromYM, toYM),
    );

    getEl("statMonths").textContent = String(archives.length);
    setProgress(
      0,
      `Found ${archives.length} archive months in range. Starting…`,
    );

    for (let i = 0; i < archives.length; i++) {
      if (state.aborted) break;

      const archUrl = archives[i];
      const monthLabel = archUrl.split("/").slice(-2).join("/");
      setProgress((i / archives.length) * 100, `Processing ${monthLabel}…`);

      let monthData;
      try {
        monthData = await fetchMonth(archUrl);
      } catch {
        await sleep(300);
        continue;
      }

      const games = monthData.games ?? [];

      for (const game of games) {
        if (state.aborted) break;
        state.totalGamesScanned++;

        if (!gameMatchesFilter(game)) continue;
        if (!gameInDateRange(game, fromYM, toYM)) continue;
        state.totalMatched++;

        const pgn = game.pgn ?? "";
        if (!pgn.includes("%clk")) continue;

        const clocks = parsePgn(pgn);
        if (clocks.length < 2) continue;

        const moves = extractMoves(pgn);
        const isWhite =
          game.white.username.toLowerCase() === username.toLowerCase();
        const opponent = isWhite ? game.black.username : game.white.username;
        const userRating = isWhite ? game.white.rating : game.black.rating;
        const opponentRating = isWhite ? game.black.rating : game.white.rating;
        const result = getResult(game, username);
        const tcStr = game.time_control ?? "";
        const [baseSeconds] = tcStr.split("+").map(Number);
        const increment = parseInt(tcStr.split("+")[1] ?? "0", 10);
        const userStartIdx = isWhite ? 0 : 1;

        for (let ci = userStartIdx; ci < clocks.length; ci += 2) {
          const prevClock = ci === userStartIdx ? baseSeconds : clocks[ci - 2];
          const thinkSeconds = prevClock - clocks[ci] + increment;
          if (thinkSeconds <= 0) continue;

          state.totalMoves++;
          tryInsertMove({
            thinkSeconds,
            moveNumber: Math.floor(ci / 2) + 1,
            san: moves[ci] ?? "",
            color: isWhite ? "white" : "black",
            opponent,
            userRating,
            opponentRating,
            result,
            date: formatDate(game.end_time),
            timeControl: tcStr,
            gameUrl: game.url,
          });
        }
      }

      updateStats();
      renderSkeleton();
      await sleep(80);
    }

    setProgress(100, state.aborted ? "Stopped." : "Analysis complete.");
    renderResults(buildFilterLabel(), username);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
    getEl("progressBlock").classList.remove("show");
  } finally {
    getEl<HTMLButtonElement>("runBtn").disabled = false;
    getEl<HTMLButtonElement>("stopBtn").style.display = "none";
  }
}

export function stopAnalysis(): void {
  state.aborted = true;
}
