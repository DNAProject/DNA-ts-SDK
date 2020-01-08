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

import { Address, CurveLabel, KeyParameters, KeyType, PrivateKey } from '../src/crypto';
import { PublicKey } from '../src/crypto/PublicKey';
import { SignatureScheme } from '../src/crypto/SignatureScheme';
import RestClient from '../src/network/rest/restClient';
import { makeApproveTx, makeTransferFromTx, makeTransferTx } from '../src/smartcontract/nativevm/assetTxBuilder';
import { State } from '../src/smartcontract/nativevm/token';
import { comparePublicKeys } from '../src/transaction/program';
import { addSign } from '../src/transaction/transactionBuilder';
// tslint:disable-next-line:max-line-length
import { reverseHex } from '../src/utils';
import { WebsocketClient } from './../src/network/websocket/websocketClient';
import { signTransaction, signTx } from './../src/transaction/transactionBuilder';

describe('test transfer asset', () => {
    const socketClient = new WebsocketClient('ws://127.0.0.1:20335');
    const restClient = new RestClient('http://127.0.0.1:20334');
    const gasLimit = '20000';
    const gasPrice = '500';
    const adminPrivateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93');
    const adminAddress = new Address('AJkkLbouowk6teTaxz1F2DYKfJh24PVk3r');
    const toPrivateKey = new PrivateKey('cd19cfe79112f1339749adcb3491595753ea54687e78925cb5e01a6451244406');
    const toAddress = new Address('AU9TioM24rXk5E3tUGrv8jwgBA1aZVVKDW');
    const sm2Account = {
        'address': 'ATk57i8rMXFSBpHAdX3UQ4TNe48BBrfCoc',
        'label': 'sm2Account',
        'lock': false,
        'algorithm': 'SM2',
        'parameters': { curve: 'sm2p256v1' },
        'key': 'jQUCWPZZN1tN0ghtsYHuLZoBGdFfUaRaofKSHEYctMIKLdN3Otv52Oi9d3ujNW2p',
        'enc-alg': 'aes-256-gcm',
        'salt': 'jn+zIuiOC5lrn+vrySF1Lw==',
        'isDefault': false,
        'publicKey': '1314031220580679fda524f575ac48b39b9f74cb0a97993df4fac5798b04c702d07a39',
        'signatureScheme': 'SM3withSM2'
    };

    const sleep = (time: number) => new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });

    test('test_transfer_asset_GAS', async () => {
        const from = adminAddress;
        const to = new Address('AVDEiCVQzm7EffYH6vBQNXKYXR7RdVGNsA');
        const tx = makeTransferTx('GAS', from, to, 0.01 * 1e9, gasPrice, gasLimit);
        console.log(tx.serializeUnsignedData());
        signTransaction(tx, adminPrivateKey);
        const response = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        // tslint:disable:no-console
        console.log(JSON.stringify(response));
        expect(response.Result.State).toEqual(1);
    }, 10000);

    test('test_get_balance', async () => {
        const to = new Address('AJkkLbouowk6teTaxz1F2DYKfJh24PVk3r');
        const result = await restClient.getBalance(to);
        console.log(result);
        expect(result).toBeTruthy();
    }, 10000);

    test('transfer with multi assign address', async () => {
        // tslint:disable:max-line-length
        const w = [{ name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AXmQDzzvpEtPkNwBEFsREzApTTDZFW6frD', 'enc-alg': 'aes-256-gcm', 'key': 'YfOr9im4rOciy3cV7JkVo9QCfrRT4IGLa/CZKUJfL29pM6Zi1oVEM67+8MezMIro', 'algorithm': 'ECDSA', 'salt': 'RCIo60eCJAwzkTYmIfp3GA==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '037c9e6c6a446b6b296f89b722cbf686b81e0a122444ef05f0f87096777663284b', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AY5W6p4jHeZG2jjW6nS1p4KDUhcqLkU6jz', 'enc-alg': 'aes-256-gcm', 'key': 'gpgMejEHzawuXG+ghLkZ8/cQsOJcs4BsFgFjSaqE7SC8zob8hqc6cDNhJI/NBkk+', 'algorithm': 'ECDSA', 'salt': 'tuLGZOimilSnypT91WrenQ==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '03dff4c63267ae5e23da44ace1bc47d0da1eb8d36fd71181dcccf0e872cb7b31fa', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'ALZVrZrFqoSvqyi38n7mpPoeDp7DMtZ9b6', 'enc-alg': 'aes-256-gcm', 'key': 'guffI05Eafq9F0j3/eQxHWGo1VN/xpeIkXysEPeH51C2YHYCNnCWTWAdqDB7lonl', 'algorithm': 'ECDSA', 'salt': 'oZPg+5YotRWStVsRMYlhfg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '0205bc592aa9121428c4144fcd669ece1fa73fee440616c75624967f83fb881050', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AMogjmLf2QohTcGST7niV75ekZfj44SKme', 'enc-alg': 'aes-256-gcm', 'key': 'fAknSuXzMMC0nJ2+YuTpTLs6Hl5Dc0c2zHZBd2Q7vCuv8Wt97uYz1IU0t+AtrWts', 'algorithm': 'ECDSA', 'salt': '0BVIiUf46rb/e5dVZIwfrg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '030a34dcb075d144df1f65757b85acaf053395bb47b019970607d2d1cdd222525c', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AZzQTkZvjy7ih9gjvwU8KYiZZyNoy6jE9p', 'enc-alg': 'aes-256-gcm', 'key': 'IufXVQfrL3LI7g2Q7dmmsdoF7BdoI/vHIsXAxd4qkqlkGBYj3pcWHoQgdCF+iVOv', 'algorithm': 'ECDSA', 'salt': 'zUtzh0B4UW0wokzL+ILdeg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '021844159f97d81da71da52f84e8451ee573c83b296ff2446387b292e44fba5c98', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AKEqQKmxCsjWJz8LPGryXzb6nN5fkK1WDY', 'enc-alg': 'aes-256-gcm', 'key': 'PYEJ1c79aR7bxdzvBlj3lUMLp0VLKQHwSe+/OS1++1qa++gBMJJmJWJXUP5ZNhUs', 'algorithm': 'ECDSA', 'salt': 'uJhjsfcouCGZQUdHO2TZZQ==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '020cc76feb375d6ea8ec9ff653bab18b6bbc815610cecc76e702b43d356f885835', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' },
        { name: 'MyWallet', version: '1.1', scrypt: { p: 8, n: 16384, r: 8, dkLen: 64 }, identities: null, accounts: [{ 'address': 'AQNpGWz4oHHFBejtBbakeR43DHfen7cm8L', 'enc-alg': 'aes-256-gcm', 'key': 'ZG/SfHRArUkopwhQS1MW+a0fvQvyN1NnwonU0oZH8y1bGqo5T+dQz3rz1qsXqFI2', 'algorithm': 'ECDSA', 'salt': '6qiU9bgK/+1T2V8l14mszg==', 'parameters': { curve: 'P-256' }, 'label': '', 'publicKey': '03aa4d52b200fd91ca12deff46505c4608a0f66d28d9ae68a342c8a8c1266de0f9', 'signatureScheme': 'SHA256withECDSA', 'isDefault': true, 'lock': false }], extra: '' }
        ];
        const params = {
            cost: 16384,
            blockSize: 8,
            parallel: 8,
            size: 64
        };
        const pks = [];
        const pris = [];
        for (const v of w) {
            pks.push(new PublicKey(v.accounts[0].publicKey));
            const p = new PrivateKey(v.accounts[0].key);
            pris.push(p.decrypt('1', new Address(v.accounts[0].address), v.accounts[0].salt, params));
        }

        const mulAddr = Address.fromMultiPubKeys(2, [pks[0], pks[1]]);
        console.log('mulAddr: ' + mulAddr.toBase58());
        const tx = makeTransferTx('gas', mulAddr,
            new Address('AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve'), 1 * 1e9, gasPrice, gasLimit, mulAddr);
        const multiPri = [pris[0], pris[1]];
        for (const p of multiPri) {
            signTx(tx, 2, [pks[0], pks[1]], p);
        }
        console.log('tx:' + JSON.stringify(tx));
        const result = await socketClient.sendRawTransaction(tx.serialize());
        console.log(result);

        // const mulAddr = Address.fromMultiPubKeys(5, pks);
        // console.log('mulAddr: ' + mulAddr.toBase58());
        // // console.log('pris: ' + JSON.stringify(pris));
        // const payer = mulAddr;
        // const tx = makeTransferTx('DNA', mulAddr,
        //     new Address('AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve'), 100, gasPrice, gasLimit, payer);
        // const multiPri = [pris[0], pris[1], pris[2], pris[3], pris[4]];
        // for (const p of multiPri) {
        //     signTx(tx, 5, pks, p);
        // }
        // console.log('tx:' + JSON.stringify(tx));
        // const result = await restClient.sendRawTransaction(tx.serialize());
        // console.log(result);
        // expect(result.Error).toEqual(0);
    }, 10000);

    test('get_allowance', async () => {
        const from = adminAddress;
        const to = toAddress;
        const res = await restClient.getAllowance('gas', from, to);
        console.log(res);
    }, 10000);

    test('send_approve_transferFrom', async () => {
        const res1 = await restClient.getAllowance('gas', adminAddress, toAddress);
        const allowance1 = Number(res1.Result);
        console.log('allowance1: ' + allowance1);

        const tx1 = makeApproveTx('gas', adminAddress, toAddress, 10 * 1e9, '500', '20000', adminAddress);
        signTransaction(tx1, adminPrivateKey);
        const res2 = await socketClient.sendRawTransaction(tx1.serialize(), false);
        console.log(res2);
        await sleep(6000);

        const res3 = await restClient.getAllowance('gas', adminAddress, toAddress);
        const allowance2 = Number(res3.Result);
        console.log('allowance2: ' + allowance2);
        expect(allowance2 - allowance1).toEqual(10 * 1e9);

        const res4 = await restClient.getBalance(adminAddress);
        const res5 = await restClient.getBalance(toAddress);
        const adminBalance1 = Number(res4.Result.gas);
        const toBalance1 = Number(res5.Result.gas);
        console.log(`adminBalance1: ${adminBalance1}, toBalance1: ${toBalance1}`);

        const tx = makeTransferFromTx('gas', toAddress, adminAddress, toAddress, 10 * 1e9, '500', '20000', adminAddress);
        signTransaction(tx, toPrivateKey);
        addSign(tx, adminPrivateKey);
        const res6 = await socketClient.sendRawTransaction(tx.serialize(), false);
        await sleep(6000);

        const res7 = await restClient.getBalance(adminAddress);
        const res8 = await restClient.getBalance(toAddress);
        const adminBalance2 = Number(res7.Result.gas);
        const toBalance2 = Number(res8.Result.gas);
        console.log(`adminBalance2: ${adminBalance2}, toBalance2: ${toBalance2}`);
        expect(adminBalance1 - adminBalance2).toEqual(10 * 1e9);
        expect(toBalance2 - toBalance1).toEqual(10 * 1e9);

        const res9 = await restClient.getAllowance('gas', adminAddress, toAddress);
        const allowance3 = Number(res9.Result);
        console.log('allowance3: ' + allowance3);
        expect(allowance3).toEqual(allowance1);

    }, 20 * 1000);

    test('send_transferFrom', async () => {
        const tx = makeTransferFromTx('gas', toAddress, adminAddress, toAddress, 10 * 1e9, '500', '20000', adminAddress);
        // Here we need the signatures of sender and payer. We can only sign once here if the sender is the same as the payer.
        signTransaction(tx, toPrivateKey);
        addSign(tx, adminPrivateKey);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false);
        console.log(res);
    });

    test('sort_pk', () => {
        const pk1 = new PublicKey('03a3c7a40461238a210d306ce4a79db69800449173e47b9e2fa92b7815d7517872');
        const pk2 = new PublicKey('023c5b6e0e4fe8647d1065ecd09c60d251e1e168999202423e3be5d174866f9349');
        const pks = [pk1, pk2];
        console.log(pks);
        const add1 = Address.fromMultiPubKeys(2, [pk1, pk2]);
        console.log('add1: ' + add1.toBase58());
        pks.sort(comparePublicKeys);
        console.log(pks);
        const add2 = Address.fromMultiPubKeys(2, [pk2, pk1]);
        console.log('add2: ' + add2.toBase58());
    });



});
