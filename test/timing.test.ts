import { expect } from "chai";
import { sleep, throttle, keepTrying, preventMacSleep } from "../src";
import { useChaiBigNumber } from "../src/hardhat";

useChaiBigNumber();

describe("timing", () => {
  it("throttle & sleep", async () => {
    class Foo {
      i = 0;
      bar = throttle(this, 1000, async () => this.i++);
    }

    const foo = new Foo();
    expect(await foo.bar()).to.eq(0);
    expect(await foo.bar()).to.eq(0);
    expect(await foo.bar()).to.eq(0);
    await sleep(1000);
    expect(await foo.bar()).to.gt(0);
  });

  it("keep trying", async () => {
    let i = 0;
    const result = await keepTrying(async () => {
      if (i == 2) return "ok";
      i++;
      throw new Error("will catch this twice");
    });
    expect(result).to.eq("ok");
  });

  it("prevent mac from sleeping", async () => {
    const result = await preventMacSleep(async () => {
      return "ok";
    });
    expect(result).to.eq("ok");
  });
});
