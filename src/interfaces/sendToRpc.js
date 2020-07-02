/**
 * File: sendToRpc.js
 * -----------------
 * Обращение к Bitcoin RPC.
 */
// const rp = require('request-promise-native');
const Client = require('bitcoin-core');

const sendRawTransaction = (transactionHex) => {
  const client = new Client({
    username: 'test',
    password: 'test',
    network: 'testnet',
  });

  // const txHex = '0200000000010115a217354b160e008b265ccdc303d932c51c7139ac5ad6215b25e704de2057200000000000ffffffff02a0bb0d00000000001976a914b408f135d00c5dce34d428695bcb59744143dc4d88ac70110100000000001976a914f0798320ecfb1c8ef493b392d39b4df5333e24b988ac024830450221008e7bed7cf4cfdb32b220f802d48e9420a41385e3955aa7685009f7d2b5ab2f7602202f600a460b71c580f67856b86cbe5dda0b34d12f747fa355b24f64f20017359d01210256fe88a34e2fc892f7005cd2017c6fdc4f5ee1786f9ed28d1e0338cd3e9ae30200000000';
  const txHex = transactionHex;

  client.sendRawTransaction(txHex, (error, response) => {
    if (error) console.log(error);
    console.log(response);
  });
};

export default sendRawTransaction;

// curl --user test --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendrawtransaction", "params": ["0200000000010115a217354b160e008b265ccdc303d932c51c7139ac5ad6215b25e704de2057200000000000ffffffff02a0bb0d00000000001976a914b408f135d00c5dce34d428695bcb59744143dc4d88ac70110100000000001976a914f0798320ecfb1c8ef493b392d39b4df5333e24b988ac024830450221008e7bed7cf4cfdb32b220f802d48e9420a41385e3955aa7685009f7d2b5ab2f7602202f600a460b71c580f67856b86cbe5dda0b34d12f747fa355b24f64f20017359d01210256fe88a34e2fc892f7005cd2017c6fdc4f5ee1786f9ed28d1e0338cd3e9ae30200000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:8332/

// curl --user test --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendrawtransaction", "params": ["0200000000010115a217354b160e008b265ccdc303d932c51c7139ac5ad6215b25e704de2057200000000000ffffffff02a0bb0d00000000001976a914b408f135d00c5dce34d428695bcb59744143dc4d88ac70110100000000001976a914f0798320ecfb1c8ef493b392d39b4df5333e24b988ac024830450221008e7bed7cf4cfdb32b220f802d48e9420a41385e3955aa7685009f7d2b5ab2f7602202f600a460b71c580f67856b86cbe5dda0b34d12f747fa355b24f64f20017359d01210256fe88a34e2fc892f7005cd2017c6fdc4f5ee1786f9ed28d1e0338cd3e9ae30200000000"] }' -H 'content-type: application/json;' http://127.0.0.1:8332/

// curl --user test --data-binary '{"method": "echo", "params": ["Hello JSON-RPC"], "id":1}' -H 'content-type: text/plain;' http://127.0.0.1:8332/