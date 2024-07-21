import cp from "child_process";

import Web3 from "web3";
import { chainId, setWeb3Instance, hasWeb3Instance, sleep, block } from "../dist";

describe("network", () => {
	let anvil: any;

	beforeAll(async()=>{
		anvil = cp.exec("anvil");
		anvil.stdout.on("data", (data: any) => {
			if (data.includes("Listening on")) {
				const rpcUrl = data.split("Listening on")[1].trim();
				setWeb3Instance(new Web3("http://" + rpcUrl));
			}
		})
		while (!hasWeb3Instance()) await sleep(10);
	})

	afterAll(()=>{
		anvil.kill();
	})

	it("chainId", async () => {
		expect((await block()).number).toBe(0);
		expect(await chainId()).toBe(31337);
	});
});