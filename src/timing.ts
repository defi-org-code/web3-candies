/**
 * sleep for ms
 */
export async function sleep(ms:number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * keep invoking fn, catching errors, sleeping between invocations
 */
export async function keepTrying(fn:any, retries = 3, ms = 1000) {
  let e;
  for (let i = 0; i < retries; i++) {
    try {
      return await timeout(fn, ms);
    } catch (_e) {
      e = _e;
      await sleep(ms);
    }
  }
  throw new Error("failed to invoke fn " + e);
}

export async function timeout(fn:any, ms = 1000) {
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
  if (!failed && !!r) return r;
  else throw new Error("timeout");
}
