import BN from "bn.js";
import { expect, use } from "chai";
import CBN from "chai-bn";

export function useChaiBN() {
  use(CBN(BN));
}

export async function expectRevert(fn: () => any) {
  let err: Error | null = null;
  try {
    await fn();
  } catch (e) {
    err = e;
  }
  expect(!!err, "expected to revert").true;
}
