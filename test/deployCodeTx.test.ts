import { VmType } from './../src/transaction/payload/deployCode';
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

import DeployCode from '../src/transaction/payload/deployCode';
import { Transaction, TxType } from '../src/transaction/transaction';

import { buildRestfulParam, buildRpcParam, buildTxParam, Default_params, makeDeployCodeTransaction,
     makeInvokeTransaction, sendRawTxRestfulUrl, signTransaction
    } from '../src/transaction/transactionBuilder';
import { ab2hexstring, ab2str, num2hexstring , reverseHex, str2hexstr } from '../src/utils';

import axios from 'axios';
import { MAIN_NODE, MAIN_DNA_URL, DNA_NETWORK, TEST_NODE, TEST_DNA_URL } from '../src/consts';
import AbiFunction from '../src/smartcontract/abi/abiFunction';
import AbiInfo from '../src/smartcontract/abi/abiInfo';
import { Parameter } from '../src/smartcontract/abi/parameter';
import TxSender from '../src/transaction/txSender';

import { Address } from '../src/crypto';
import { RestClient, WebsocketClient } from '../src/index';
import json from '../src/smartcontract/data/idContract.abi';
import { VmCode } from '../src/transaction/vmcode';
import { Account } from './../src/account';
import { PrivateKey } from './../src/crypto/PrivateKey';
// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('test deploy contract', () => {

    const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93');
    const account = Account.create(privateKey, '123456', 'test');
    console.log(account.address.toBase58());

    const dnaid = '6469643a6f6e743a5452616a31684377615135336264525450635a78596950415a364d61376a6351564b';

    const abiInfo = AbiInfo.parseJson(JSON.stringify(json));

    const txSender = new TxSender(TEST_DNA_URL.SOCKET_URL);

    // tslint:disable-next-line:max-line-length
    const attestClaimAvmCode = '013fc56b6a00527ac46a51527ac46a00c3046e616d659c640900655d076c7566616a00c30568656c6c6f9c642a00536a52527ac46a51c3c0519e640700006c7566616a51c300c36a53527ac46a53c3651a076c7566616a00c3097465737448656c6c6f9c646c006a51c3c0559e640700006c7566616a51c300c36a54527ac46a51c351c36a55527ac46a51c352c36a56527ac46a51c353c36a57527ac46a51c354c36a58527ac46a54c36a55c36a56c36a57c36a58c35479517956727551727553795279557275527275651c066c7566616a00c308746573744c6973749c6424006a51c3c0519e640700006c7566616a51c300c36a59527ac46a59c365b1056c7566616a00c30e746573744c697374416e645374729c6451006a51c351c176c9681553797374656d2e52756e74696d652e4e6f74696679616a51c3c0529e640700006c7566616a51c300c36a59527ac46a51c351c36a57527ac46a59c36a57c37c65f1046c7566616a00c30e746573745374727563744c6973749c6431006a51c3681553797374656d2e52756e74696d652e4e6f74696679616a51c300c36a5a527ac46a5ac36570046c7566616a00c314746573745374727563744c697374416e645374729c6432006a51c3c0529e640700006c7566616a51c300c36a5a527ac46a51c351c36a57527ac46a5ac36a57c37c65fa036c7566616a00c307746573744d61709c6416006a51c300c36a53527ac46a53c3655b036c7566616a00c30a746573744765744d61709c6424006a51c3c0519e640700006c7566616a51c300c36a5b527ac46a5bc365b1026c7566616a00c30c746573744d6170496e4d61709c6416006a51c300c36a53527ac46a53c365c2016c7566616a00c30f746573744765744d6170496e4d61709c6424006a51c3c0519e640700006c7566616a51c300c36a5b527ac46a5bc365e3006c7566616a00c30d7472616e736665724d756c74699c6416006a51c300c36a5c527ac46a5cc3650b006c756661006c756659c56b6a00527ac4006a52527ac46a00c3c06a53527ac4616a52c36a53c39f6473006a00c36a52c3c36a51527ac46a52c351936a52527ac46a51c3c0539e6420001b7472616e736665724d756c746920706172616d73206572726f722ef0616a51c300c36a51c351c36a51c352c35272652900009c64a2ff157472616e736665724d756c7469206661696c65642ef06288ff616161516c756656c56b6a00527ac46a51527ac46a52527ac4516c756657c56b6a00527ac4681953797374656d2e53746f726167652e476574436f6e7465787461086d61705f6b6579327c681253797374656d2e53746f726167652e476574616a51527ac40f746573744765744d6170496e4d61706a51c352c176c9681553797374656d2e52756e74696d652e4e6f74696679616a51c3681a53797374656d2e52756e74696d652e446573657269616c697a65616a52527ac46a52c36a00c3c36c756659c56b6a00527ac46a00c36a51527ac46a51c3681853797374656d2e52756e74696d652e53657269616c697a65616a52527ac4076d6170496e666f6a52c352c176c9681553797374656d2e52756e74696d652e4e6f74696679616a51c3036b6579c3681853797374656d2e52756e74696d652e53657269616c697a65616a53527ac4681953797374656d2e53746f726167652e476574436f6e7465787461086d61705f6b6579326a53c35272681253797374656d2e53746f726167652e507574616a52c36c756656c56b6a00527ac4681953797374656d2e53746f726167652e476574436f6e7465787461076d61705f6b65797c681253797374656d2e53746f726167652e476574616a51527ac46a51c3681a53797374656d2e52756e74696d652e446573657269616c697a65616a52527ac46a52c36a00c3c36c756657c56b6a00527ac46a00c36a51527ac46a51c3681853797374656d2e52756e74696d652e53657269616c697a65616a52527ac4681953797374656d2e53746f726167652e476574436f6e7465787461076d61705f6b65796a52c35272681253797374656d2e53746f726167652e507574616a51c3036b6579c36c756658c56b6a00527ac46a51527ac400c176c96a52527ac46a52c36a00c3c86a52c36a51c3c86a52c36c756655c56b6a00527ac40e746573745374727563744c6973746a00c352c176c9681553797374656d2e52756e74696d652e4e6f74696679616a00c36c756659c56b6a00527ac46a51527ac40e746573744c697374416e645374726a00c36a51c353c176c9681553797374656d2e52756e74696d652e4e6f746966796100c176c96a52527ac46a52c36a00c3c86a52c36a51c3c86a52c36c756655c56b6a00527ac40b746573744d73674c6973746a00c352c176c9681553797374656d2e52756e74696d652e4e6f74696679616a00c36c75665fc56b6a00527ac46a51527ac46a52527ac46a53527ac46a54527ac4097465737448656c6c6f6a00c36a51c36a52c36a53c36a54c356c176c9681553797374656d2e52756e74696d652e4e6f746966796100c176c96a55527ac46a55c36a00c3c86a55c36a51c3c86a55c36a52c3c86a55c36a53c3c86a55c36a54c3c86a55c36c756654c56b6a00527ac46a00c36c756653c56b046e616d656c7566';

    // const url = 'http://polaris1.ont.io:20334';
    const url = 'http://127.0.0.1:20334';
    const restClient = new RestClient(url);
    const socketClient = new WebsocketClient('http://127.0.0.1:20335');
    test('test_deploy_with_avm_code', async () => {

        const tx = makeDeployCodeTransaction(attestClaimAvmCode,
            'name', '1.0', 'alice', 'testmail', 'desc', true, '500', '30000000');
        tx.payer = account.address;
        signTransaction(tx, privateKey);
        const result = await restClient.sendRawTransaction(tx.serialize());
        // tslint:disable:no-console
        console.log(result);
        expect(result.Error).toEqual(0);
    }, 10000);

    test('get_contract', async () => {
        const contract = Address.fromVmCode(attestClaimAvmCode);
        const codeHash = contract.toHexString();
        // tslint:disable:no-console
        console.log('contract address: ' + contract.serialize());
        console.log('codeHash: ' + codeHash);
        const result = await restClient.getContract(codeHash);
        console.log(result);
        expect(result.Result).toBeTruthy();
    }, 10000);

    test('getContract', async () => {
        const restClient = new RestClient(MAIN_DNA_URL.REST_URL);
        const hash = '36bb5c053b6b839c8f6b923fe852f91239b9fccc';
        const contract = reverseHex(hash);
        const res = await restClient.getContract(hash);
        console.log(res);
    });

    test('run_name', async () => {
        const contract = reverseHex('eb7f5d8314b8c71532420bd675408b52e5805c9e');
        const contractAddr = new Address(contract);
        const method = 'name';
        const params = [];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
    });

    test('run_list', async () => {
        const contract = reverseHex('eb7f5d8314b8c71532420bd675408b52e5805c9e');
        const contractAddr = new Address(contract);
        const method = 'testList';
        const params = [];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await socketClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
    });
});
