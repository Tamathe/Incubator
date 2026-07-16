#!/usr/bin/env node
/**
 * Build-time changelog generator.
 *
 * Runs `git log` against content/site.ts, parses each commit, groups
 * them by ISO week (Mon–Sun), and writes app/changelog/data.json which
 * the /changelog page consumes at build time.
 *
 * If git history is unavailable (shallow clone, missing repo, etc.), keep
 * the committed payload so remote builds do not erase the changelog.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_PATH = join(ROOT, "app", "changelog", "data.json");
const TARGET = "content/site.ts";

function parseCommits(raw) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [hash, dateIso, author, ...rest] = line.split("|");
      return {
        hash,
        date: dateIso,
        author,
        message: rest.join("|"),
      };
    });
}

/**
 * Returns the Monday of the ISO week containing `d`, as a Date at 00:00 local.
 * JS getDay(): 0=Sun, 1=Mon, ... 6=Sat. We shift Sunday to be the END of the week.
 */
function startOfIsoWeek(d) {
  const day = d.getDay();
  const offset = day === 0 ? 6 : day - 1; // days since Monday
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  monday.setDate(monday.getDate() - offset);
  return monday;
}

function endOfIsoWeek(monday) {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return sunday;
}

function fmtMonthDay(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function weekLabel(monday) {
  const sunday = endOfIsoWeek(monday);
  const year = sunday.getFullYear();
  return `Week of ${fmtMonthDay(monday)} — ${fmtMonthDay(sunday)}, ${year}`;
}

function groupByWeek(commits) {
  const buckets = new Map();
  for (const c of commits) {
    const d = new Date(c.date);
    if (Number.isNaN(d.getTime())) continue;
    const monday = startOfIsoWeek(d);
    const key = monday.toISOString().slice(0, 10);
    if (!buckets.has(key)) {
      buckets.set(key, { key, label: weekLabel(monday), commits: [] });
    }
    buckets.get(key).commits.push(c);
  }
  return Array.from(buckets.values()).sort((a, b) =>
    a.key < b.key ? 1 : -1
  );
}

function readGitLog() {
  try {
    const stdout = execFileSync(
      "git",
      ["log", "--pretty=format:%H|%aI|%an|%s", "--", TARGET],
      { cwd: ROOT, encoding: "utf8" }
    );
    return stdout;
  } catch (err) {
    process.stderr.write(
      `[build-changelog] git log failed (${err.message}).\n`
    );
    return null;
  }
}

function main() {
  const raw = readGitLog();
  if (raw === null && existsSync(OUT_PATH)) {
    process.stdout.write(
      `[build-changelog] preserving existing changelog at ${OUT_PATH}\n`
    );
    return;
  }

  const commits = parseCommits(raw ?? "");
  const weeks = groupByWeek(commits);
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(
    OUT_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), weeks }, null, 2)
  );
  process.stdout.write(
    `[build-changelog] wrote ${commits.length} commits across ${weeks.length} week(s) to ${OUT_PATH}\n`
  );
}

main();
