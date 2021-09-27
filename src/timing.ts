import _ from "lodash";

export function throttle<T>(self: any, seconds: number, fn: () => Promise<T>): () => Promise<T> {
  return _.bind(_.throttle(fn, seconds * 1000), self);
}

export async function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * keep invoking fn, catching and loggin errors, sleeping 1 second between invocations, until successful
 */
export async function keepTrying<T>(fn: () => Promise<T>): Promise<T> {
  do {
    try {
      return await fn();
    } catch (e) {
      console.error(e);
      await sleep(1);
    }
  } while (true);
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
