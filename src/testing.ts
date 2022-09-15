import BN from "bn.js";
import { expect, use } from "chai";
import CBN from "chai-bn";
export * from "chai-bn";

export function useChaiBN() {
  use(CBN(BN));
}

export async function expectRevert(fn: () => any, withError: string | RegExp) {
  if (typeof withError === "string") {
    expect(withError.trim(), "must provide expected error message").to.not.be.empty;
  } else {
    expect(withError.source, "must provide expected error message").to.not.be.empty;
  }

  let err: Error | null = null;
  try {
    await fn();
  } catch (e: any) {
    err = e;
  }

  expect(!!err, `expected to revert with '${withError}'`).to.be.true;

  if (typeof withError === "string") {
    expect(err!.message).to.include(withError, `expected error message:\n\t'${withError}'\n\tbut was:\n\t'${err!.message}'\n\n\t`);
  } else {
    expect(err!.message).to.match(withError, `expected error to match:\n\t'${withError}'\n\tbut was:\n\t'${err!.message}'\n\n\t`);
  }
}
