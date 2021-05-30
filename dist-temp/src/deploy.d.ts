import BN from "bn.js";
export declare type DeployParams = {
    chainId: number;
    account: string;
    balance: string;
    contractName: string;
    args: string[];
    gasLimit: number;
    gasPrice: string;
    initialETH: string;
    uploadSources: boolean;
};
export declare function deploy(contractName: string, constructorArgs: string[], gasLimit: number, initialETH: BN | string | number, uploadSources: boolean): Promise<void>;
export declare function askAddress(message: string): Promise<string>;
