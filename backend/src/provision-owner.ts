import { randomUUID } from "node:crypto";
import { stdin, stdout } from "node:process";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ownerProvisioningAuth } from "./auth.js";
import { config } from "./config.js";
import { db } from "./db.js";
import { auditEvents, users } from "./schema.js";

const emailSchema = z.email();

const argument = (name: string) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const readSecret = (prompt: string): Promise<string> => new Promise((resolve, reject) => {
  if (!stdin.isTTY) return reject(new Error("Owner provisioning requires an interactive terminal."));
  let value = "";
  const cleanup = () => { stdin.off("data", onData); stdin.setRawMode(false); stdin.pause(); };
  const onData = (chunk: string) => {
    for (const character of chunk) {
      if (character === "\u0003") { cleanup(); reject(new Error("Owner provisioning cancelled.")); return; }
      if (character === "\r" || character === "\n") { cleanup(); stdout.write("\n"); resolve(value); return; }
      if (character === "\u007f" || character === "\b") { if (value.length) { value = value.slice(0, -1); stdout.write("\b \b"); } continue; }
      if (character >= " ") { value += character; stdout.write("*"); }
    }
  };
  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.setEncoding("utf8");
  stdin.resume();
  stdin.on("data", onData);
});

const main = async () => {
  const email = argument("--email")?.trim().toLowerCase();
  const name = argument("--name")?.trim();
  if (!email || !name) throw new Error("Usage: npm run provision:owner -- --email owner@example.com --name \"Owner name\"");
  if (!emailSchema.safeParse(email).success) throw new Error("A valid owner email is required.");
  if (!config.AUTH_INVITE_ONLY) throw new Error("AUTH_INVITE_ONLY must remain true.");
  if (!config.AUTH_ALLOWED_EMAILS.includes(email)) throw new Error("This email is not in AUTH_ALLOWED_EMAILS.");

  const password = await readSecret("New password: ");
  const confirmation = await readSecret("Confirm password: ");
  if (password !== confirmation) throw new Error("Passwords did not match.");
  if (password.length < 8) throw new Error("Password must contain at least 8 characters.");

  const created = await ownerProvisioningAuth.api.signUpEmail({ body: { name, email, password } });
  await db.transaction(async (transaction) => {
    await transaction.update(users).set({ role: "owner", updatedAt: new Date() }).where(eq(users.id, created.user.id));
    await transaction.insert(auditEvents).values({
      id: randomUUID(), actorId: created.user.id, correlationId: randomUUID(), action: "auth.owner.provisioned",
      metadata: { provisionedBy: "interactive-vps-command", inviteOnly: true }
    });
  });
  stdout.write("Owner account created and audited. The password was not logged.\n");
};

main().catch((error: unknown) => { stderr(error); process.exitCode = 1; });

const stderr = (error: unknown) => {
  const message = error instanceof Error ? error.message : "Owner provisioning failed.";
  process.stderr.write(`Owner provisioning failed: ${message}\n`);
};
