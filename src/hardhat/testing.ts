import { expect, use } from "chai";
import cbn from "@defi.org/chai-bignumber";
export * as cbn from "@defi.org/chai-bignumber";

export function useChaiBigNumber() {
  use(cbn());
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
