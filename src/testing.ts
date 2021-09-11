import BN from "bn.js";
import { expect, use } from "chai";
import CBN from "chai-bn";
export * from "chai-bn";

export function useChaiBN() {
  use(CBN(BN));
}

export async function expectRevert(fn: () => any, withError: string) {
  expect(withError.trim(), "must provide expected error message").to.not.be.empty;
  let err: Error | null = null;
  try {
    await fn();
  } catch (e) {
    err = e;
  }
  expect(!!err, `expected to revert with '${withError}'`).to.be.true;
  expect(err!.message).to.include(withError);
}
