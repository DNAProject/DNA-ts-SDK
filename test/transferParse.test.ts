import { Signature } from '../src/crypto';
import { Address } from '../src/crypto/address';
import { deserializeTransferTx,
    makeTransferTx } from '../src/smartcontract/nativevm/assetTxBuilder';
import opcode from '../src/transaction/opcode';
import { addSign, signTransaction } from '../src/transaction/transactionBuilder';
import { num2hexstring, str2hexstr, StringReader } from '../src/utils';
import { PrivateKey } from './../src/crypto/PrivateKey';
import { PublicKey } from './../src/crypto/PublicKey';
import { WebsocketClient } from './../src/network/websocket/websocketClient';
import { Transaction } from './../src/transaction/transaction';

describe('parse transfer tx', () => {
    const from = new Address('AJAhnApxyMTBTHhfpizua48EEFUxGg558x');
    const to = new Address('ALFZykMAYibLoj66jcBdbpTnrBCyczf4CL');
    test('transfer 15 gas', () => {
        const tx = makeTransferTx('gas', from, to, 15, '500', '20000', from);
        const transfer = deserializeTransferTx(tx.serialize());
        expect(transfer.amount).toEqual(15);
        expect(transfer.from.toBase58()).toEqual('AJAhnApxyMTBTHhfpizua48EEFUxGg558x');
        expect(transfer.to.toBase58()).toEqual('ALFZykMAYibLoj66jcBdbpTnrBCyczf4CL');
        expect(transfer.tokenType).toEqual('GAS');
        // console.log(tx);
    });

    test('transfer 10000 GAS', () => {
        const tx = makeTransferTx('GAS', from, to, 10000, '500', '20000', from);
        const transfer = deserializeTransferTx(tx.serialize());
        expect(transfer.amount).toEqual(10000);
        expect(transfer.from.toBase58()).toEqual('AJAhnApxyMTBTHhfpizua48EEFUxGg558x');
        expect(transfer.to.toBase58()).toEqual('ALFZykMAYibLoj66jcBdbpTnrBCyczf4CL');
        expect(transfer.tokenType).toEqual('GAS');
        // console.log(tx);
    });

    test('hex', () => {
        const res = Buffer.from('AZ+qwfuOR6zlBfXbYr4N/TKzjUMKExB0bZsSN1MaDGR+aMpmwpDOYiMefCdDMVQzKkvy05+cW4EJmBycFuB/FdI=', 'base64').toString('hex');
        console.log(res);
    });

    test('sig', () => {
        const sigData = '01c6985632e146fc51d08773101830fe0e2d006f7377589e2a4d00fd986901d91628b3494401046e9f47c440a6b503b65b8a7e2b4d4bbc48aad54954bafe5cc1d3';
        const pk = new PublicKey('02f64df7d4cf8c604f2662ed1b9614986b803070c68bcfe09418f06776114d7ced');
        const pri = new PrivateKey('09dc431f249e9f0bacbfb525f631518bee8629167f62b5c79e55fa6fd39aea0c');
        const pk2 = pri.getPublicKey();
        console.log('pk2: ' + pk2.key);
        console.log('address: ' + Address.fromPubKey(pk2).toBase58());

        const sig = Signature.deserializeHex(sigData);
        const res = pk.verify('505c316ac990aaab268ce5f402a02198a686531d2af5d1eace055ed2d21a9962', sig);
        console.log('veeify: ' + res);
    });

});
