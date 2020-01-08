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
import { Address, PublicKey } from '../../crypto';
import { DDOAttribute } from '../../transaction/ddo';
import { Transaction } from '../../transaction/transaction';
import { makeNativeContractTx } from '../../transaction/transactionUtils';
import { num2hexstring, str2hexstr } from '../../utils';
import { buildNativeCodeScript } from '../abi/nativeVmParamsBuilder';
import Struct from '../abi/struct';

/**
 * Address of DNA ID contract
 */
export const DNAID_CONTRACT = '0000000000000000000000000000000000000003';

/**
 * Method names in DNA ID contract
 */
const DNAID_METHOD  = {
    regIDWithPublicKey: 'regIDWithPublicKey',
    regIDWithAttributes: 'regIDWithAttributes',
    addAttributes: 'addAttributes',
    removeAttribute: 'removeAttribute',
    getAttributes: 'getAttributes',
    getDDO: 'getDDO',
    addKey: 'addKey',
    removeKey: 'removeKey',
    getPublicKeys: 'getPublicKeys',
    addRecovery: 'addRecovery',
    changeRecovery: 'changeRecovery',
    getKeyState: 'getKeyState'
};

/**
 * Registers Identity.
 *
 * GAS calculation: gasLimit * gasPrice is equal to the amount of gas consumed.
 *
 * @param dnaid User's DNA ID
 * @param publicKey Public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRegisterDNAidTx(
    dnaid: string,
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = DNAID_METHOD.regIDWithPublicKey;

    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }
    const struct = new Struct();
    struct.add(dnaid, publicKey.serializeHex());
    const list = [struct];
    const params = buildNativeCodeScript(list);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(DNAID_CONTRACT),
        gasPrice,
        gasLimit,
        payer
    );

    return tx;
}

/**
 * Registers Identity with initial attributes.
 *
 * @param dnaid User's DNA ID
 * @param attributes Array of DDOAttributes
 * @param publicKey User's public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRegIdWithAttributes(
    dnaid: string,
    attributes: DDOAttribute[],
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
) {
    const method = DNAID_METHOD.regIDWithAttributes;
    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }

    // let attrs = '';
    // for (const a of attributes) {
    //     attrs += a.serialize();
    // }

    // const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, dnaid);
    // const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, publicKey.serializeHex());
    // const p3 = new Parameter(f.parameters[2].getName(), ParameterType.ByteArray, attrs);
    // f.setParamsValue(p1, p2, p3);
    const attrLen = attributes.length;
    const struct = new Struct();
    struct.add(dnaid, publicKey.serializeHex(), attrLen);
    for (const a of attributes) {
        const key = str2hexstr(a.key);
        const type = str2hexstr(a.type);
        const value = str2hexstr(a.value);
        struct.add(key, type, value);
    }
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx(
        method,
        params,
        new Address(DNAID_CONTRACT),
        gasPrice,
        gasLimit,
        payer
    );

    return tx;
}

/**
 * Adds attributes to DNA ID.
 *
 * @param dnaid User's DNA ID
 * @param attributes Array of DDOAttributes
 * @param publicKey User's public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddAttributeTx(
    dnaid: string,
    attributes: DDOAttribute[],
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = DNAID_METHOD.addAttributes;

    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }
    const struct = new Struct();
    struct.add(dnaid, attributes.length);
    for (const a of attributes) {
        const key = str2hexstr(a.key);
        const type = str2hexstr(a.type);
        const value = str2hexstr(a.value);
        struct.add(key, type, value);
    }
    struct.list.push(publicKey.serializeHex());
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(DNAID_CONTRACT),
        gasPrice,
        gasLimit,
        payer
    );
    return tx;
}

/**
 * Removes attribute from DNA ID.
 *
 * @param dnaid User's DNA ID
 * @param key Key of attribute to remove
 * @param publicKey User's public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 *
 */
export function buildRemoveAttributeTx(
    dnaid: string,
    key: string,
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = DNAID_METHOD.removeAttribute;

    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }

    const struct = new Struct();
    struct.add(dnaid, str2hexstr(key), publicKey.serializeHex());
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx(
        method,
        params,
        new Address(DNAID_CONTRACT),
        gasPrice,
        gasLimit,
        payer
    );
    return tx;
}

/**
 * Queries attributes attached to DNA ID.
 *
 * @param dnaid User's DNA ID
 */
export function buildGetAttributesTx(dnaid: string) {
    const method = DNAID_METHOD.getAttributes;

    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }

    const struct = new Struct();
    struct.add(dnaid);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(method, params, new Address(DNAID_CONTRACT));
    return tx;
}

/**
 * Queries Description Object of DNA ID(DDO).
 *
 * @param dnaid User's DNA ID
 */
export function buildGetDDOTx(dnaid: string) {
    const method = DNAID_METHOD.getDDO;
    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }

    const struct = new Struct();
    struct.add(dnaid);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx(method, params, new Address(DNAID_CONTRACT));
    return tx;
}
/**
 * Adds a new public key to DNA ID.
 *
 * @param dnaid User's DNA ID
 * @param newPk New public key to be added
 * @param userKey User's public key or address
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddControlKeyTx(
    dnaid: string,
    newPk: PublicKey,
    userKey: PublicKey | Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = DNAID_METHOD.addKey;

    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }

    const p1 = dnaid;
    const p2 = newPk.serializeHex();
    let p3;
    if (userKey instanceof PublicKey) {
        p3 = userKey.serializeHex();
    } else if (userKey instanceof Address) {
        p3 = userKey.serialize();
    }
    const struct = new Struct();
    struct.add(p1, p2, p3);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx(
        method,
        params,
        new Address(DNAID_CONTRACT),
        gasPrice,
        gasLimit,
        payer
    );

    return tx;
}

/**
 * Revokes a public key from DNA ID.
 *
 * @param dnaid User's DNA ID
 * @param pk2Remove Public key to be removed
 * @param sender User's public key or address
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildRemoveControlKeyTx(
    dnaid: string,
    pk2Remove: PublicKey,
    sender: PublicKey | Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = DNAID_METHOD.removeKey;

    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }

    const p1 = dnaid;
    const p2 = pk2Remove.serializeHex();
    let p3;
    if (sender instanceof PublicKey) {
        p3 = sender.serializeHex();
    } else if (sender instanceof Address) {
        p3 = sender.serialize();
    }
    const struct = new Struct();
    struct.add(p1, p2, p3);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(
        method,
        params,
        new Address(DNAID_CONTRACT),
        gasPrice,
        gasLimit,
        payer
    );
    return tx;
}

/**
 * Queries public keys attached to DNA ID.
 *
 * @param dnaid User's DNA ID
 */
export function buildGetPublicKeysTx(dnaid: string) {
    const method = DNAID_METHOD.getPublicKeys;

    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }
    const struct = new Struct();
    struct.add(dnaid);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(method, params, new Address(DNAID_CONTRACT));
    return tx;
}

/**
 * Adds recovery address to DNA ID.
 *
 * @param dnaid User's DNA ID
 * @param recovery Recovery address, must have not be set
 * @param publicKey User's public key, must be user's existing public key
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildAddRecoveryTx(
    dnaid: string,
    recovery: Address,
    publicKey: PublicKey,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = DNAID_METHOD.addRecovery;

    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }

    const p1 = dnaid;
    const p2 = recovery;
    const p3 = publicKey.serializeHex();
    const struct = new Struct();
    struct.add(p1, p2, p3);
    const params = buildNativeCodeScript([struct]);
    const tx = makeNativeContractTx(method, params, new Address(DNAID_CONTRACT), gasPrice, gasLimit, payer);
    return tx;
}

/**
 * Changes recovery address of DNA ID.
 *
 * This contract call must be initiated by the original recovery address.
 *
 * @param dnaid user's DNA ID
 * @param newrecovery New recovery address
 * @param oldrecovery Original recoevery address
 * @param gasPrice Gas price
 * @param gasLimit Gas limit
 * @param payer Payer
 */
export function buildChangeRecoveryTx(
    dnaid: string,
    newrecovery: Address,
    oldrecovery: Address,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transaction {
    const method = DNAID_METHOD.changeRecovery;

    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }

    const p1 = dnaid;
    const p2 = newrecovery;
    const p3 = oldrecovery;
    const struct = new Struct();
    struct.add(p1, p2, p3);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(method, params, new Address(DNAID_CONTRACT),
    gasPrice, gasLimit);
    tx.payer = payer || oldrecovery;
    return tx;
}

/**
 * Queries the state of the public key associated with DNA ID.
 *
 * @param dnaid user's DNA ID
 * @param pkId User's public key Id
 */
export function buildGetPublicKeyStateTx(dnaid: string, pkId: number) {
    const method = DNAID_METHOD.getKeyState;

    if (dnaid.substr(0, 3) === 'did') {
        dnaid = str2hexstr(dnaid);
    }

    // tslint:disable-next-line:no-console
    console.log('did: ' + dnaid);

    const index = num2hexstring(pkId, 4, true);

    // tslint:disable-next-line:no-console
    console.log('index: ' + index);

    const struct = new Struct();
    struct.add(dnaid, pkId);
    const params = buildNativeCodeScript([struct]);

    const tx = makeNativeContractTx(method, params, new Address(DNAID_CONTRACT));
    return tx;
}
