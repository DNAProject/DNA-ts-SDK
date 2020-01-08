import BigNumber from 'bignumber.js';
import * as Long from 'long';
import { PrivateKey } from '../src/crypto/PrivateKey';
import { RestClient, Struct } from '../src/index';
import { WebsocketClient } from '../src/network/websocket/websocketClient';
import { createCodeParamsScript, deserializeItem } from '../src/transaction/scriptBuilder';
import { bigIntFromBytes, bigIntToBytes, hexstr2str, hexstring2ab, num2hexstring, reverseHex, str2hexstr, StringReader } from '../src/utils';
import { Account } from './../src/account';
import { Address } from './../src/crypto/address';
import { Parameter, ParameterType } from './../src/smartcontract/abi/parameter';
import { makeInvokeTransaction, signTransaction } from './../src/transaction/transactionBuilder';
import { reverseHex } from './../src/utils';

describe('test smarct contract params', () => {
    const socketClient = new WebsocketClient('ws://127.0.0.1:20335');
    const restClient = new RestClient('http://127.0.0.1:20334');

    const privateKey = new PrivateKey('7c47df9664e7db85c1308c080f398400cb24283f5d922e76b478b5429e821b93');
    const account = Account.create(privateKey, '123456', 'test');
    console.log(account.address.toBase58());
    test('test_params_Array', async () => {
        const contract = reverseHex('eb7f5d8314b8c71532420bd675408b52e5805c9e');
        const contractAddr = new Address(contract);
        const method = 'testHello';

        const params = [
            new Parameter('op', ParameterType.String, 'test'),
            new Parameter('args', ParameterType.Array,
                [
                    new Parameter('arg1', ParameterType.Boolean, false),
                    new Parameter('arg2', ParameterType.Integer, 3),
                    // new Parameter('arg3', ParameterType.ByteArray, account.address.serialize()),
                    new Parameter('arg3', ParameterType.Address, account.address),
                    new Parameter('arg4', ParameterType.String, 'arg4')
                ]
            )
        ];

        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
    }, 10000);

    test('test_list', async () => {
        const contract = reverseHex('eb7f5d8314b8c71532420bd675408b52e5805c9e');
        const contractAddr = new Address(contract);
        const method = 'testList';

        const params = [
            new Parameter('args', ParameterType.Array,
                [
                    new Parameter('arg1', ParameterType.String, 'test')
                ]
            )
        ];
        console.log(JSON.stringify(params));
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false, true);
        console.log(JSON.stringify(res));
    }, 10000);

    test('testMap', async () => {
        const contract = reverseHex('eb7f5d8314b8c71532420bd675408b52e5805c9e');
        const contractAddr = new Address(contract);
        const method = 'testMap';

        const params = [
            new Parameter('args', ParameterType.Map,
                { key : new Parameter('', ParameterType.String, 'test'),
                    key2: new Parameter('', ParameterType.String, 'test')
                }
            )
        ];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(JSON.stringify(res));
    }, 10000);

    test('testGetmap', async () => {
        const contract = reverseHex('eb7f5d8314b8c71532420bd675408b52e5805c9e');
        const contractAddr = new Address(contract);
        const method = 'testGetMap';

        const params = [
            new Parameter('args', ParameterType.String, 'key')
        ];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
        const val = hexstr2str(res.Result.Result);
        expect(val).toEqual('test');
    }, 10000);

    test('testMapInMap', async () => {
        const contract = reverseHex('eb7f5d8314b8c71532420bd675408b52e5805c9e');
        const contractAddr = new Address(contract);
        const method = 'testMapInMap';

        const params = [
            new Parameter('args', ParameterType.Map,
                {
                    key: new Parameter('', ParameterType.String, 'hello2'),
                    key2: new Parameter('', ParameterType.ByteArray, 'aabb'),
                    key3: new Parameter('', ParameterType.Integer, 100),
                    key4: new Parameter('', ParameterType.Boolean, true),
                    key5: new Parameter('', ParameterType.Array, [
                        new Parameter('', ParameterType.String, 'hello'),
                        new Parameter('', ParameterType.Integer, 100)
                    ]),
                    key6: new Parameter('', ParameterType.Map, {
                        key: new Parameter('', ParameterType.String, 'hello2'),
                        key1: new Parameter('', ParameterType.Boolean, true),
                        key3: new Parameter('', ParameterType.Integer, 100)
                    })
                }

            )
        ];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await socketClient.sendRawTransaction(tx.serialize(), false);
        console.log(JSON.stringify(res));
    }, 10000);

    test('testMapInNestedMap', async () => {
        const contract = reverseHex('eb7f5d8314b8c71532420bd675408b52e5805c9e');
        const contractAddr = new Address(contract);
        const method = 'testMapInMap';

        const params = [
            new Parameter('', ParameterType.Map, {
                key: new Parameter('name', ParameterType.Map,
                    {
                        key: new Parameter('', ParameterType.String, 'Hello')
                    }
                )
            })
        ];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await restClient.sendRawTransaction(tx.serialize(), false);
        console.log(JSON.stringify(res));
    }, 10000);

    test('testGetMapInMap', async () => {
        const contract = reverseHex('eb7f5d8314b8c71532420bd675408b52e5805c9e');
        const contractAddr = new Address(contract);
        const method = 'testGetMapInMap';

        const params = [
            new Parameter('', ParameterType.String, 'key')
        ];
        const tx = makeInvokeTransaction(method, params, contractAddr, '500', '20000', account.address);
        signTransaction(tx, privateKey);
        const res = await restClient.sendRawTransaction(tx.serialize(), true);
        console.log(JSON.stringify(res));
        const val = hexstr2str(res.Result.Result);
        expect(val).toEqual('Hello');
    })

    test('deserialize_item', () => {
        const hex = '820600036b6579000668656c6c6f3200046b6579320002aabb00046b65793302016400046b657934010100046b6579358002000568656c6c6f02016400046b657936820300036b6579000668656c6c6f3200046b657931010100046b657933020164';
        const sr = new StringReader(hex);
        const val = deserializeItem(sr);
        expect(val.get('key5').length).toEqual;
        console.log(val);
    });
});

