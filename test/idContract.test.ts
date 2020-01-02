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

// tslint:disable:max-line-length
import axios from 'axios';
import { GetStatusResponse } from '../src/claim/claim';
import { MAIN_DNA_URL, TEST_DNA_URL } from '../src/consts';
import { DEFAULT_ALGORITHM, DNA_NETWORK, TEST_NODE } from '../src/consts';
import { Address, CurveLabel, KeyParameters, KeyType, PrivateKey, PublicKey } from '../src/crypto';
import { Identity } from '../src/identity';
import { RestClient } from '../src/index';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import AbiFunction from '../src/smartcontract/abi/abiFunction';
import AbiInfo from '../src/smartcontract/abi/abiInfo';
import { Parameter, ParameterType } from '../src/smartcontract/abi/parameter';
import json2 from '../src/smartcontract/data/idContract.abi';
import { buildAddAttributeTx, buildAddControlKeyTx, buildAddRecoveryTx,
    buildChangeRecoveryTx, buildGetAttributesTx, buildGetDDOTx, buildGetPublicKeyStateTx,
    buildGetPublicKeysTx, buildRegIdWithAttributes, buildRegisterDNAidTx, buildRemoveAttributeTx, buildRemoveControlKeyTx
} from '../src/smartcontract/nativevm/idContractTxBuilder';
import { State } from '../src/smartcontract/nativevm/token';
import { buildCommitRecordTx, buildGetRecordStatusTx, buildRevokeRecordTx } from '../src/smartcontract/neovm/attestClaimTxBuilder';
import { DDO, DDOAttribute, PublicKeyWithId } from '../src/transaction/ddo';
import InvokeCode from '../src/transaction/payload/invokeCode';
import { Transaction } from '../src/transaction/transaction';
import { addSign , buildRestfulParam,
    buildRpcParam, buildTxParam, makeInvokeTransaction, sendRawTxRestfulUrl } from '../src/transaction/transactionBuilder';
import TxSender from '../src/transaction/txSender';
import { VmType } from '../src/transaction/vmcode';
import { ab2hexstring, hexstr2str, str2hexstr, StringReader } from '../src/utils';
import { Account } from '../src/account';
import { signTransaction, signTx } from '../src/transaction/transactionBuilder';

describe('test DNA ID contract', () => {

    const gasPrice = '500';
    const gasLimit = '20000';
    const socketClient = new WebsocketClient('ws://127.0.0.1:20335');

    const restClient = new RestClient('http://127.0.0.1:20334');

    let privateKey: PrivateKey;
    let publicKey: PublicKey;
    // tslint:disable-next-line:prefer-const
    let pk2: PublicKey;
    let dnaid: string;
    // tslint:disable:prefer-const
    let oldrecovery: string;
    let newrecovery: string;
    let pkId: string;

    let abiInfo: AbiInfo;
    let identity: Identity;

    abiInfo = AbiInfo.parseJson(JSON.stringify(json2));
    // privateKey = PrivateKey.random()
    // console.log('privatekey: ' + privateKey)
    // console.log('publick key: ' + publicKey)
    // tslint:disable:no-console

    privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b95');
    const account = Account.create(privateKey, '123456', '');
    console.log('account: ' + account.address.toBase58());
    publicKey = privateKey.getPublicKey();
    console.log('pk: ' + publicKey.key);
    // dnaid = 'did:dna:AUG62qrHboRc4oNn8SvJ31ha6BkwLPKvvG';
    dnaid = 'did:dna:' + account.address.toBase58();

    const pri2 = new PrivateKey('cd19cfe79112f1339749adcb3491595753ea54687e78925cb5e01a6451244406');
    const account2 = Account.create(pri2, '123456', '');
    const pub2 = pri2.getPublicKey();
    const dnaid2 = 'did:dna:ALnvzTMkbanffAKzQwxJ3EGoBqYuR6WqcG';
    console.log('address2: ' + account2.address.toBase58());

    const pri3 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b97');
    const account3 = Account.create(pri3, '123456', '');
    const pub3 = pri3.getPublicKey();
    const dnaid3 = Address.generateDNAid(pub3);
    console.log('pk3:' + pri3.getPublicKey().serializeHex());
    console.log('address3: ' + account3.address.toBase58());

    const pri4 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b98');
    const account4 = Account.create(pri4, '123456', '');
    const pub4 = pri4.getPublicKey();
    const dnaid4 = Address.generateDNAid(pub4);
    console.log('pk4:' + pri4.getPublicKey().serializeHex());
    console.log('address4: ' + account4.address.toBase58());

    const pri5 = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b99');
    const account5 = Account.create(pri5, '123456', '');
    const pub5 = pri5.getPublicKey();
    const dnaid5 = Address.generateDNAid(pub5);
    console.log('address5: ' + account5.address.toBase58());

    test('testRegisterDNAid', async () => {

        const tx = buildRegisterDNAidTx(dnaid, publicKey, gasPrice, gasLimit, account.address);
        console.log(tx.serialize());
        signTransaction(tx, privateKey);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 10000);

    test('testDDOTx', async () => {
        const tx = buildGetDDOTx(dnaid);
        const response = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(response);
        const ddo = DDO.deserialize(response.Result.Result);
        console.log(ddo);
    }, 10000);

    test('testRegIdWithAttributes', async () => {
        // tslint:disable-next-line:no-shadowed-variable
        const dnaid = Address.generateDNAid(pub2);
        const attr = new DDOAttribute();
        attr.key = 'hello';
        attr.type = 'string',
        attr.value = 'world';
        const tx = buildRegIdWithAttributes(dnaid, [attr], pub2, gasPrice, gasLimit);
        tx.payer = account2.address;
        signTransaction(tx, pri2);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 10000);

    test('testAddAttribute', async () => {
        // tslint:disable-next-line:one-variable-per-declaration
        const claimId = 'claim:b5a87bea92d52525b6eba3b670595cf8b9cbb51e972f5cbff499d48677ddee8a',
            context = 'claim:staff_authentication8',
            issuer = 'did:dna:TVuF6FH1PskzWJAFhWAFg17NSitMDEBNoa';
            // let key = str2hexstr(claimId)

        const type = 'JSON';
        const data = {
            Type : 'JSON',
            Value : {
                Context: context,
                Issuer: issuer
            }
        };
        const value = JSON.stringify(data);

        const attr = new DDOAttribute();
        attr.key = claimId;
        attr.type = type;
        attr.value = value;
        const did = dnaid5;
        const tx = buildAddAttributeTx(did, [attr], pub5, gasPrice, gasLimit);
        tx.payer = account2.address;
        signTransaction(tx, pri2);
        addSign(tx, pri5);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 10000);

    test('testRemoveAttribute', async () => {
        const claimId = 'claim:b5a87bea92d52525b6eba3b670595cf8b9cbb51e972f5cbff499d48677ddee8a';
        // const key = str2hexstr(claimId);
        // let key = str2hexstr('Claim:twitter');
        let key = claimId;

        console.log('removeAttr key: ' + key);
        const tx = buildRemoveAttributeTx(dnaid, claimId, pub5, gasPrice, gasLimit);
        tx.payer = account5.address;
        signTransaction(tx, pri5);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 10000);

    test('testGetAttributs', async () => {
        const tx = buildGetAttributesTx(dnaid5);
        tx.payer = account.address;
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        const attr = DDOAttribute.deserialize(res.Result.Result);
        console.log(attr);
        expect(attr).toBeTruthy();
    }, 10000);

    test('testGetPublicKeyState', async () => {
        const tx = buildGetPublicKeyStateTx(dnaid5, 2);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        const result = res.Result.Result;
        console.log(hexstr2str(result));
        expect(hexstr2str(result)).toEqual('in use');
    }, 10000);

    test('testAddPK', async () => {
        const tx = buildAddControlKeyTx(dnaid5, pub4, pub5, gasPrice, gasLimit);
        tx.payer = account5.address;
        signTransaction(tx, pri5);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 10000);

    test('testGetPublicKeys', async () => {
        const tx = buildGetPublicKeysTx(dnaid5);
        // tx.payer = account.address;
        // signTransaction(tx, privateKey);
        // let param = buildTxParam(tx)
        // sendTx(param)
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        const r = PublicKeyWithId.deserialize(res.Result.Result);
        console.log('pkWithId: ' + JSON.stringify(r));
    }, 10000);

    test('testRemovePK', async () => {
        const tx = buildRemoveControlKeyTx(dnaid, pub4, pub5, gasPrice, gasLimit);
        tx.payer = account5.address;
        signTransaction(tx, pri5);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 10000);

    test('testAddRecovery', async () => {
        const tx = buildAddRecoveryTx(dnaid5, account3.address, pub5, gasPrice, gasLimit);
        tx.payer = account5.address;
        signTransaction(tx, pri5);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 10000);

    test('testChangeRecovery', async () => {
        const tx = buildChangeRecoveryTx(dnaid5, account2.address, account3.address, gasPrice, gasLimit);
        tx.payer = account3.address;
        signTransaction(tx, pri3);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(res);
        expect(res.Error).toEqual(0);
    }, 10000);

});
