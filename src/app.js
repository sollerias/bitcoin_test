import sendRawTransaction from './interfaces/sendToRpc';

const express = require('express');
require('dotenv').config({
  path: './src/config/dev_local.env',
});

const app = express();
app.use(express.json({
  extended: false,
}));

const bip39 = require('bip39');
const hdkey = require('hdkey');
const createHash = require('create-hash');
const bitcoin = require('bitcoinjs-lib');
// const bs58check = require('bs58check');

const currentNetwork = bitcoin.networks.testnet;

const createWallet = async () => {
  const mnemonic = bip39.generateMnemonic(); // generates string
  // const mnemonic = "gentle mutual speak consider mandate kingdom cash
  // explain soul exile cabin squeeze";
  const seed = await bip39.mnemonicToSeed(mnemonic); // creates seed buffer
  // console.log(`Seed: ${seed}`);
  // console.log(`mnemonic: ${mnemonic}`);

  const root = hdkey.fromMasterSeed(seed);
  // const masterPrivateKey = root.privateKey.toString('hex');
  // console.log(`masterPrivateKey: ${masterPrivateKey}`);

  const addrnode = root.derive("m/44'/0'/0'/0/0");
  // eslint-disable-next-line no-underscore-dangle
  // console.log(`addrnodePublicKey: ${addrnode._publicKey}`);

  // eslint-disable-next-line no-underscore-dangle
  const step1 = addrnode._publicKey;
  const step2 = createHash('sha256').update(step1).digest();
  const step3 = createHash('rmd160').update(step2).digest();
  const step4 = Buffer.allocUnsafe(21);
  // console.log(`step1: ${step1} | step2: ${step2} | step3: ${step3} | step4: ${step4}`);

  // step4.writeUInt8(0x00, 0); // 0x00 for mainnet
  step4.writeUInt8(0x6f, 0); // 0x6f for testnet
  step3.copy(step4, 1); // step4 now holds the extended RIPMD-160 result
  // const step9 = bs58check.encode(step4);
  // console.log(`Base58Check: ${step9}`);
  /*
  Mainnet
  pubKeyHash: 0x00,
  Testnet
  pubKeyHash: 0x6f,
*/
};

createWallet();

/**
 * sendTransaction() - prepare and send bitcoin transaction.
 */
const sendTransaction = () => {
  // Import the private key of the Bitcoin address
  /**
   * Получить WIF - privatekey из Bitcoin Core:
   * Окно - > Консоль.Вводим команду:
   * dumpprivkey tb1qksy0zdwsp3wuudx59p54hj6ew3q58hzdmm4m2p
   */
  // currentNetwork - необходимо указать, если сеть testnet.
  const bratishkaKey = bitcoin.ECPair.fromWIF('cU1C5dEQ6mHEVyTf8UNoKypd9AESr3iQNr9EiW1PMjYwjYZMuV15', currentNetwork);
  // bratishkaAddress - адрес из Bitcoin Core необходимо зашифровать, используя
  // открытый ключ.
  const bratishkaAddress = bitcoin.payments.p2pkh({
    pubkey: bratishkaKey.publicKey,
  }).address;
  // console.log(bratishkaAddress);
  // receivingWalletKey - адрес из Bitcoin Core необходимо зашифровать, используя
  // открытый ключ.
  const receivingWalletKey = bitcoin.ECPair.fromWIF('cPFCKo2agVDxQDMQwHBmNkgcG8WtUpotnivNm5bcyKEdEwKUtyFg', currentNetwork);
  const receivingWalletAddress = bitcoin.payments.p2pkh({
    pubkey: receivingWalletKey.publicKey,
  }).address;
  // console.log(receivingWalletAddress);

  // const {
  //   address,
  // } = bitcoin.payments.p2pkh({
  //   pubkey: bratishkaKey.publicKey,
  // });
  // console.log(address);

  // Для формирования транзакции необходимо работать с классом Psbt;
  const psbt = new bitcoin.Psbt();
  // Добавляем вход, с которого пойдёт транзакция
  psbt.addInput({
    // if hash is string, txid, if hash is Buffer, is reversed compared to txid
    hash: '205720de04e7255b21d65aac39711cc532d903c3cd5c268b000e164b3517a215',
    index: 0,
    /**
     * В этом моменте необходимо определиться, транзакция SegWit или Нет.
     * Данную информацию я смог найти из данного источника:
     * https: //live.blockcypher.com/btc-testnet
     * В нем по хэшу нашел транзакцию.Детализация выхода показала JSON, предоставленный в файле
     *  ./mixins/transactionExample.json.
     * В нем ищем поле txs - > outputs - > наш адрес.
     * В моём случае - tb1qksy0zdwsp3wuudx59p54hj6ew3q58hzdmm4m2p
     * Script type для этого поля: "script_type": "pay-to-witness-pubkey-hash"
     * Соответственно, нам необходима unspent transaction типа witnessUtxo.
     * scriptPubKey для неё беру из этого же JSON,
     * поля "script": "0014b408f135d00c5dce34d428695bcb59744143dc4d".
     * Value - из поля "value": 1000000.
     */
    // non-segwit inputs now require passing the whole previous tx as Buffer
    /*
    nonWitnessUtxo: Buffer.from(
      '0200000001f9f34e95b9d5c8abcd20fc5bd4a825d1517be62f0f775e5f36da944d9' +
      '452e550000000006b483045022100c86e9a111afc90f64b4904bd609e9eaed80d48' +
      'ca17c162b1aca0a788ac3526f002207bb79b60d4fc6526329bf18a77135dc566020' +
      '9e761da46e1c2f1152ec013215801210211755115eabf846720f5cb18f248666fec' +
      '631e5e1e66009ce3710ceea5b1ad13ffffffff01' +
      // value in satoshis (Int64LE) = 0x015f90 = 90000
      '905f010000000000' +
      // scriptPubkey length
      '19' +
      // scriptPubkey
      '76a9148bbc95d2709c71607c60ee3f097c1217482f518d88ac' +
      // locktime
      '00000000',
      'hex',
    ),
    */
    // // If this input was segwit, instead of nonWitnessUtxo, you would add
    // // a witnessUtxo as follows. The scriptPubkey and the value only are needed.
    witnessUtxo: {
      script: Buffer.from(
        '0014b408f135d00c5dce34d428695bcb59744143dc4d',
        'hex',
      ),
      value: 1000000,
    },

    // Not featured here:
    //   redeemScript. A Buffer of the redeemScript for P2SH
    //   witnessScript. A Buffer of the witnessScript for P2WSH
  });
  // Если выходов несколько, указываю их последовательно
  psbt.addOutput({
    address: bratishkaAddress,
    value: 900000,
  });
  psbt.addOutput({
    address: receivingWalletAddress,
    value: 70000,
  });
  // Вход у меня будет нулевой, подписанный ключом для
  // кошелька, из которого идет оплата
  psbt.signInput(0, bratishkaKey);
  psbt.validateSignaturesOfInput(0);
  psbt.finalizeAllInputs();
  // transactionHash - необходим для осуществления транзакции через RPC
  const transactionHash = psbt.extractTransaction().toHex();
  // console.log('transactionHash: ', transactionHash);
  sendRawTransaction(transactionHash);
};

sendTransaction();

module.exports = app;
