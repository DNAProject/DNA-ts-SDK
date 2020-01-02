/*
* Copyright (C) 2018 The DNA Authors
* This file is part of The DNA library.
*
* The DNA is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* The DNA is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with The DNA.  If not, see <http://www.gnu.org/licenses/>.
*/
import { BigNumber } from 'bignumber.js';
import BigInt from '../../common/bigInt';
import { TOKEN_TYPE } from '../../consts';
import { Address } from '../../crypto';
import { Transaction } from '../../transaction/transaction';
import { makeNativeContractTx } from '../../transaction/transactionUtils';
import { Transfer } from '../../transaction/transfer';
import { hex2VarBytes, hexstr2str, StringReader } from '../../utils';
import { buildNativeCodeScript } from '../abi/nativeVmParamsBuilder';
import Struct from '../abi/struct';
import { State } from './token';

export const GAS_CONTRACT = '0000000000000000000000000000000000000002';

/**
 * Get the address of native asset contract
 * @param tokenType Token type. Can only be DNA or ONG
 */
export function getTokenContract(tokenType: string) {
    if (tokenType.toUpperCase() === TOKEN_TYPE.GAS) {
        return new Address(GAS_CONTRACT);
    } else {
        throw new Error('Error token type.');
    }
}

/**
 * Verify amount
 * @param amount Amount
 */
export function verifyAmount(amount: number | string) {
    const value = new BigNumber(amount);

    if (!value.isInteger() || value.lte(new BigNumber(0))) {
        throw new Error('Amount is invalid.');
    }
}

/**
 * Creates transaction to transfer native assets.
 * @param tokenType gas
 * @param from sender's address
 * @param to receiver's address
 * @param amount Amount of amount to transfer
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Address to pay for transaction's gas.
 */
export function makeTransferTx(
    tokenType: string,
    from: Address,
    to: Address,
    amount: number | string,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transfer {
    verifyAmount(amount);
    const num = new BigNumber(amount);
    const struct = new Struct();
    struct.add(from, to, num);
    const list = [];
    list.push([struct]);
    const contract = getTokenContract(tokenType);
    const params = buildNativeCodeScript(list);
    const tx: Transfer = makeNativeContractTx('transfer', params, contract, gasPrice, gasLimit) as any;
    tx.tokenType = tokenType;
    tx.from = from;
    tx.to = to;
    tx.amount = amount;
    tx.method = 'transfer';

    if (payer) {
        tx.payer = payer;
    } else {
        tx.payer = from;
    }
    return tx;
}

/**
 * Create transaction for asset transfer approve
 * @param tokenType gas
 * @param from Sender's address
 * @param to receiver's address
 * @param amount Amount to approve
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Address of fee payer
 */
export function makeApproveTx(
    tokenType: string,
    from: Address,
    to: Address,
    amount: number | string,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    verifyAmount(amount);
    const struct = new Struct();
    struct.add(from, to, amount);
    const list = [];
    list.push(struct);
    const contract = getTokenContract(tokenType);
    const params = buildNativeCodeScript(list);
    const tx: Transfer = makeNativeContractTx('approve', params, contract, gasPrice, gasLimit) as any;
    tx.tokenType = tokenType;
    tx.from = from;
    tx.to = to;
    tx.amount = amount;
    tx.method = 'approve';

    if (payer) {
        tx.payer = payer;
    } else {
        tx.payer = from;
    }
    return tx;
}

/**
 * Create transaction for asset transfer from
 * @param tokenType gas
 * @param from Sender's address
 * @param to receiver's address
 * @param amount Amount to approve
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Address of fee payer
 */
export function makeTransferFromTx(
    tokenType: string,
    sender: Address,
    from: Address,
    to: Address,
    amount: number | string,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    verifyAmount(amount);
    const struct = new Struct();
    struct.add(sender, from, to, amount);
    const list = [];
    list.push(struct);
    const contract = getTokenContract(tokenType);
    const params = buildNativeCodeScript(list);
    const tx: Transfer = makeNativeContractTx('transferFrom', params, contract, gasPrice, gasLimit) as any;
    tx.tokenType = tokenType;
    tx.from = from;
    tx.to = to;
    tx.amount = amount;
    tx.method = 'transferFrom';

    if (payer) {
        tx.payer = payer;
    } else {
        tx.payer = from;
    }
    return tx;
}

/**
 * transfer from multiple senders to one receiver
 * this tx needs multiple senders' signature.
 * @param tokenType
 * @param from array of senders' address
 * @param to receiver's address
 * @param amounts
 */
export function makeTransferStateTx(
    tokenType: string,
    states: State[],
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const structs = [];
    for (const state of states) {
        verifyAmount(state.value);
        const s = new Struct();
        s.add(state.from, state.to, new BigNumber(state.value));
        structs.push(s);
    }

    const list = [];
    list.push(structs);
    const params = buildNativeCodeScript(list);
    const contract = getTokenContract(tokenType);
    const tx = makeNativeContractTx('transfer', params, contract, gasPrice, gasLimit);
    if (payer) {
        tx.payer = payer;
    }
    return tx;
}

/**
 * transfer from one sender to multiple receivers
 * @param tokenType
 * @param from
 * @param to
 * @param amounts
 */
export function makeTransferToMany(
    tokenType: string,
    from: Address,
    to: Address[],
    amounts: string | number [],
    gasPrice: string,
    gasLimit: string
): Transaction {

    if (to.length !== amounts.length) {
        throw new Error('Params error.');
    }

    const structs = [];
    for (let i = 0; i < to.length; i++) {
        verifyAmount(amounts[i]);
        const s = new Struct();
        s.add(from, to[i], new BigNumber(amounts[i]));
        structs.push(s);
    }

    const list = [];
    list.push(structs);

    const contract = getTokenContract(tokenType);
    const params = buildNativeCodeScript(list);
    const tx: Transfer = makeNativeContractTx('transfer', params, contract, gasPrice, gasLimit) as any;
    tx.payer = from;
    return tx;
}

/**
 * Creates transaction to query allowance that can be sent from sender to receiver
 * @param asset Asset type. Only DNA or ONg.
 * @param from Sender's address
 * @param to Receiver's address
 */
export function makeQueryAllowanceTx(from: Address, to: Address): Transaction {
    const contract = GAS_CONTRACT;
    const list = [];
    const struct = new Struct();
    struct.add(from, to);
    list.push(struct);
    const params = buildNativeCodeScript(list);
    const tx = makeNativeContractTx('allowance', params, new Address(contract));
    return tx;
}

/**
 * Creates transaction to query balance.
 * @param address Address to query balance
 */
export function makeQueryBalanceTx(address: Address): Transaction {
    const contract = GAS_CONTRACT;
    const params = hex2VarBytes(address.serialize());
    const tx = makeNativeContractTx('balanceOf', params, new Address(contract));
    return tx;
}

export function deserializeTransferTx(str: string): Transfer {
    const tx: Transfer = Transaction.deserialize(str) as any;
    const code = tx.payload.serialize();
    const contractIndex1 = code.lastIndexOf('14' + '000000000000000000000000000000000000000');
    const contractIndex2 = code.lastIndexOf('14' + '0000000000000000000000000000000000000002');
    if (contractIndex1 > 0 && code.substr(contractIndex1 + 41, 1) === '2') {
        tx.tokenType = 'GAS';
    } else {
        throw new Error('Not a transfer tx');
    }
    const contractIndex = Math.max(contractIndex1, contractIndex2);
    const params = code.substring(0, contractIndex);
    const paramsEnd = params.indexOf('6a7cc86c') + 8;
    if (params.substr(paramsEnd, 4) === '51c1') { // transfer
        const methodStr = params.substring(paramsEnd + 6);
        tx.method = hexstr2str(methodStr);
    } else {
        const methodStr = params.substring(paramsEnd + 2);
        tx.method = hexstr2str(methodStr);
    }

    if (tx.method === 'transfer') {
        const sr = new StringReader(params);
        // const codeLength = sr.readNextLen();
        // const bytes = sr.read(4);
        sr.pos += 10;
        const from = new Address(sr.read(20));
        tx.from = from;
        // const bytes2 = sr.read(4);
        sr.pos += 8;
        const to = new Address(sr.read(20));
        tx.to = to;
        // const bytes3 = sr.read(3);
        sr.pos += 6;
        const numTmp = parseInt(sr.read(1), 16);
        if (sr.str.substr(sr.pos, 6) === '6a7cc8') {
            tx.amount = numTmp - 80;
        } else {
            const amount = BigInt.fromHexstr(sr.read(numTmp)).value;
            tx.amount = new BigNumber(amount).toString();
        }
    } else if (tx.method === 'transferFrom') {
        const sr = new StringReader(params);
        // const codeLength = sr.readNextLen();
        // const bytes = sr.read(4);
        sr.pos += 10;
        const from = new Address(sr.read(20));
        tx.from = from;
        // const bytes1 = sr.read(4);
        // const contract = new Address(sr.read(20));
        // const bytes2 = sr.read(4);
        sr.pos += 56;
        const to = new Address(sr.read(20));
        tx.to = to;
        // const bytes3 = sr.read(3);
        sr.pos += 6;
        const numTmp = parseInt(sr.read(1), 16);
        if (sr.str.substr(sr.pos, 6) === '6a7cc8') {
            tx.amount = numTmp - 80;
        } else {
            const amount = BigInt.fromHexstr(sr.read(numTmp)).value;
            tx.amount = new BigNumber(amount).toString();
        }
    } else {
        throw new Error('Not a transfer tx');
    }

    return tx;
}
