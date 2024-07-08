#!/usr/bin/env node
import { program } from "commander";
import { existsSync, promises as fs } from "node:fs";
import { cwd } from "node:process";
import { resolve } from "node:path";

async function cli() {
  const { key, outDir: out } = program
    .requiredOption("-k, --key <string>")
    .requiredOption("-o, --outDir <path>")
    .parse()
    .opts<{ key: string; outDir: string }>();

  const version = 0;

  const res = await fetch(`https://api.writeflow.dev/v${version}/sdks/ts`, {
    headers: {
      "X-API-KEY": key,
    },
  });

  if (!res.ok) {
    program.error("Sorry, please try again later.");
  }

  const outDir = resolve(cwd(), out);
  const exists = existsSync(outDir);

  if (!exists) {
    await fs.mkdir(outDir, { recursive: true });
  }

  await fs.writeFile(resolve(outDir, "writeflow.ts"), await res.text());
}

cli();
