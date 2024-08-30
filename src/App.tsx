// Import functionalities
import './App.css';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { useEffect, useState } from "react";
import './App.css';

// Import to fix polyfill issue with buffer with webpack
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

// Create types
type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
* @description gets Phantom provider, if it exists
*/
const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

export default function App() {
  // Create state variable for the provider
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );

  // Create state variable for the Phantom wallet key
  const [receiverPublicKey, setReceiverPublicKey] = useState<PublicKey | undefined>(
    undefined
  );

  // Create state variable for the sender wallet key
  const [senderKeypair, setSenderKeypair] = useState<Keypair | undefined>(
    undefined
  );

  // Connection to use with local Solana test validator
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  // This function runs whenever the component updates (e.g., render, refresh)
  useEffect(() => {
    const provider = getProvider();

    // If the Phantom provider exists, set it as the provider
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  /**
   * @description Creates a new KeyPair and airdrops 2 SOL into it.
   * This function is called when the "Create a New Solana Account" button is clicked.
   */
  const createSender = async () => {
    const newKeypair = Keypair.generate();

    console.log('Sender account: ', newKeypair.publicKey.toString());
    setSenderKeypair(newKeypair);

    console.log('Airdropping 2 SOL to Sender Wallet');
    const airdropSign = await connection.requestAirdrop(
      newKeypair.publicKey,
      2 * LAMPORTS_PER_SOL
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    // Confirm the transaction
    await connection.confirmTransaction({
      signature: airdropSign,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight
    }, 'confirmed');

    console.log('Wallet Balance: ' + (await connection.getBalance(newKeypair.publicKey)) / LAMPORTS_PER_SOL);
  }

  /**
   * @description Prompts the user to connect their wallet, if it exists.
   * This function is called when the "Connect to Phantom Wallet" button is clicked.
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (solana) {
      try {
        const response = await solana.connect();
        console.log('Wallet account:', response.publicKey.toString());
        setReceiverPublicKey(response.publicKey);
      } catch (err) {
        console.error(err);
      }
    }
  };

  /**
   * @description Disconnects the wallet, if it exists.
   * This function is called when the "Disconnect Wallet" button is clicked.
   */
  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (solana) {
      try {
        await solana.disconnect();
        setReceiverPublicKey(receiverPublicKey);
        console.log("Wallet disconnected");
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  /**
   * @description Transfers 1 SOL from the sender wallet to the connected wallet.
   * This function is called when the "Transfer SOL to Phantom Wallet" button is clicked.
   */
  const transferSol = async () => {
    if (!senderKeypair || !receiverPublicKey) {
      console.error("Missing senderKeypair or receiverPublicKey");
      return;
    }

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderKeypair.publicKey,
          toPubkey: receiverPublicKey,
          lamports: LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
      console.log("Transaction sent and confirmed with signature:", signature);

      const senderBalance = (await connection.getBalance(senderKeypair.publicKey)) / LAMPORTS_PER_SOL;
      const receiverBalance = (await connection.getBalance(receiverPublicKey)) / LAMPORTS_PER_SOL;

      console.log("Sender Balance: " + senderBalance);
      console.log("Receiver Balance: " + receiverBalance);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Module 2 Assessment</h2>
        <div className="buttons">
        <div style={{ display: "flex", alignItems: "center" }}>
            <button
              style={{
                fontSize: "16px",
                padding: "15px",
                fontWeight: "bold",
                borderRadius: "5px",
                marginBottom: "10px",
                marginRight: "10px",
              }}
              onClick={createSender}
            >
              Create a New Solana Account
            </button>
            {senderKeypair && (
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                Public Key: {senderKeypair.publicKey.toString()}
              </span>
            )}
          </div>
          {provider && !receiverPublicKey && (
            <button
              style={{
                fontSize: "16px",
                padding: "15px",
                fontWeight: "bold",
                borderRadius: "5px",
                marginBottom: "10px",
              }}
              onClick={connectWallet}
            >
              Connect to Phantom Wallet
            </button>
          )}
          {provider && receiverPublicKey && (
            <div>
              <button
                style={{
                  fontSize: "16px",
                  padding: "15px",
                  fontWeight: "bold",
                  borderRadius: "5px",
                  marginBottom: "10px",
                }}
                onClick={disconnectWallet}
              >
                Disconnect from Wallet
              </button>
            </div>
          )}
          {provider && receiverPublicKey && senderKeypair && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={transferSol}
          >
            Transfer SOL to Phantom Wallet
          </button>
          )}
        </div>
        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
      </header>
    </div>
  );
}
