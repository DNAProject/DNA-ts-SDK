
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

import { Address } from '../../crypto';
import { makeNativeContractTx } from '../../transaction/transactionUtils';
import { hex2VarBytes, str2hexstr, varifyPositiveInt } from '../../utils';
import { buildNativeCodeScript } from '../abi/nativeVmParamsBuilder';
import Struct from '../abi/struct';
import { Transaction } from './../../transaction/transaction';

/**
 * Address of auth contract.
 */
export const AUTH_CONTRACT = '0000000000000000000000000000000000000006';
const contractAddress = new Address(AUTH_CONTRACT);

/**
 * Creates transaction that initialize the admin of some contract.
 * @param adminDNAId Admin's DNA ID
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeInitContractAdminTx(
    adminDNAId: string,
    payer: Address,
    gasPrice: string,
    gasLimit: string): Transaction {
    if (adminDNAId.substr(0, 3) === 'did') {
        adminDNAId = str2hexstr(adminDNAId);
    }
    const params = hex2VarBytes(adminDNAId);
    const tx = makeNativeContractTx('initContractAdmin', params, contractAddress,
                                     gasPrice, gasLimit, payer);
    return tx;
}

/**
 * Transfer the authority to new admin
 * @param contractAddr Uer's contract address
 * @param newAdminDNAid New admin's DNA ID. This id must be registered.
 * @param keyNo Original admin's public key id. Use this pk to varify tx.
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeTransferAuthTx(
    contractAddr: Address,
    newAdminDNAid: string,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (newAdminDNAid.substr(0, 3) === 'did') {
        newAdminDNAid = str2hexstr(newAdminDNAid);
    }
    const struct = new Struct();
    struct.add(contractAddress.serialize(), newAdminDNAid, keyNo);
    const list = [struct];
    const params = buildNativeCodeScript(list);

    const tx = makeNativeContractTx('transfer', params, contractAddress, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * verify the user's token of target contract
 * @param contractAddr user's target contract address
 * @param callerDNAId caller's DNA ID.This id must be registered.
 * @param funcName the function to call
 * @param keyNo publicKey's id, use this pk to varify tx
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeVerifyTokenTx(
    contractAddr: Address,
    callerDNAId: string,
    funcName: string,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (callerDNAId.substr(0, 3) === 'did') {
        callerDNAId = str2hexstr(callerDNAId);
    }
    const struct = new Struct();
    struct.add(contractAddr.serialize(), callerDNAId, str2hexstr(funcName), keyNo);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx('verifyToken', params, contractAddress, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * assign functions to role. must be called by contract's admin
 * @param contractAddr target contract's address
 * @param adminDNAId admin's DNA ID.This id must be registered.
 * @param role role name
 * @param funcNames array of function name
 * @param keyNo publicKey's id, use the pk to varify tx
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeAssignFuncsToRoleTx(
    contractAddr: Address,
    adminDNAId: string,
    role: string,
    funcNames: string[],
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (adminDNAId.substr(0, 3) === 'did') {
        adminDNAId = str2hexstr(adminDNAId);
    }
    const struct = new Struct();
    struct.add(contractAddr.serialize(), adminDNAId, str2hexstr(role), funcNames.length);
    for (const f of funcNames) {
        struct.add(str2hexstr(f));
    }
    struct.add(keyNo);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx('assignFuncsToRole', params,
                                    contractAddress, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * assign role to DNA IDs. must be called by contract's admin
 * @param contractAddr target contract's address
 * @param adminDNAId admin's DNA ID.This id must be registered.
 * @param role role's name
 * @param ontIds array of DNA ID
 * @param keyNo admin's pk id.use to varify tx.
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeAssignDNAIdsToRoleTx(
    contractAddr: Address,
    adminDNAId: string,
    role: string,
    ontIds: string[],
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (adminDNAId.substr(0, 3) === 'did') {
        adminDNAId = str2hexstr(adminDNAId);
    }
    const struct = new Struct();
    struct.add(contractAddr.serialize(), adminDNAId, str2hexstr(role), ontIds.length);
    for (const i of ontIds) {
        if (i.substr(0, 3) === 'did') {
            struct.add(str2hexstr(i));
        } else {
            struct.add(i);
        }
    }
    struct.add(keyNo);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx('assignDNAIDsToRole', params,
        contractAddress, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * delegate role to others. Can't delegate repeatedly。
 * @param contractAddr target contract's address
 * @param from DNA ID of user that wants to delegate role.This id must be registered.
 * @param to DNA ID of user that will receive role.This id must be registered.
 * @param role role name
 * @param period time of delegate period in second
 * @param level = 1 for now.
 * @param keyNo The number of user's publick in the DDO.
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeDelegateRoleTx(
    contractAddr: Address,
    from: string,
    to: string,
    role: string,
    period: number,
    level: number = 1,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    varifyPositiveInt(period);
    if (from.substr(0, 3) === 'did') {
        from = str2hexstr(from);
    }
    if (to.substr(0, 3) === 'did') {
        to = str2hexstr(to);
    }
    const struct = new Struct();
    struct.add(contractAddr.serialize(), from, to, str2hexstr(role), period, level, keyNo);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx('delegate', params,
        contractAddress, gasPrice, gasLimit, payer);
    return tx;
}

/**
 * role's owner can withdraw the delegate in advance
 * @param contractAddr target contract's address
 * @param initiator DNA ID of role's owner.This id must be registered.
 * @param delegate DNA ID of role's agent.This id must be registered.
 * @param role role's name
 * @param keyNo The number of user's public key in the DDO
 * @param payer Address to pay for the gas.
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 */
export function makeWithdrawRoleTx(
    contractAddr: Address,
    initiator: string,
    delegate: string,
    role: string,
    keyNo: number,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transaction {
    varifyPositiveInt(keyNo);
    if (initiator.substr(0, 3) === 'did') {
        initiator = str2hexstr(initiator);
    }
    if (delegate.substr(0, 3) === 'did') {
        delegate = str2hexstr(delegate);
    }
    const struct = new Struct();
    struct.add(contractAddr.serialize(), initiator, delegate, str2hexstr(role), keyNo);
    const params = buildNativeCodeScript([struct]) ;

    const tx = makeNativeContractTx('withdraw', params,
        contractAddress, gasPrice, gasLimit, payer);
    return tx;
}
