#!/usr/bin/env node
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = createInterface({ input: stdin, output: stdout });
const pw = (await rl.question("Admin password: ")).trim();
rl.close();

if (pw.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(pw, 10);
console.log("\nPaste this into Vercel env var ADMIN_PASSWORD_HASH:\n");
console.log(hash);
