import _ from "lodash";

/**
 * @returns throttled version of fn, with up to milliseconds per invocation
 */
export function throttle<T>(self: any, ms: number, fn: () => Promise<T>): () => Promise<T> {
  return _.bind(_.throttle(fn, ms), self);
}

/**
 * sleep for ms
 */
export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * keep invoking fn, catching errors, sleeping between invocations
 */
export async function keepTrying<T>(fn: () => Promise<T>, retries = 3, ms = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await timeout(fn, ms);
    } catch (e) {
      await sleep(ms);
    }
  }
  throw new Error("failed to invoke fn " + new Error().stack);
}

export async function timeout<T>(fn: () => Promise<T>, ms = 1000): Promise<T> {
  let failed = false;
  const r = await Promise.race([
    fn(),
    new Promise((resolve) => {
      setTimeout(() => {
        failed = true;
        resolve(null);
      }, ms);
    }),
  ]);
  if (!failed && !!r) return r as T;
  else throw new Error("timeout");
}

/**
 * runs a shell command thats keeps macbooks from sleeping duing invocation of fn
 * automatically killing the spawned process on exit
 */
export async function preventMacSleep<T>(fn: () => Promise<T>) {
  if (!process.env.NODE) throw new Error("should only be called from node.js");

  const caffeinate = eval("require")("child_process").exec("caffeinate -dimsu");
  const kill = () => caffeinate.kill("SIGABRT");
  process.on("exit", kill);
  try {
    return await fn();
  } finally {
    kill();
  }
}
