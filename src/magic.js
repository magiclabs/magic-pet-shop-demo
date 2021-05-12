import { Magic } from 'magic-sdk';
import Web3 from "web3";

export const magic = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, {
    network: 'rinkeby', // Supports "rinkeby", "ropsten", "kovan"
});

export const web3 = new Web3(magic.rpcProvider);