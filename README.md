# Solana React DApp

This project is a simple decentralized application (DApp) built with React and Solana's Web3.js library. It allows users to create a new Solana account, connect to a Phantom wallet, and transfer SOL from the newly created account to the connected wallet. The application is designed to work with a local Solana test validator.

## Features

- **Create a New Solana Account**: Generate a new Solana Keypair and airdrop 2 SOL into the new account.
- **Connect to Phantom Wallet**: Connect to a user's Phantom wallet using the Phantom browser extension.
- **Transfer SOL**: Transfer 1 SOL from the newly created account to the connected Phantom wallet.
- **Display Public Key**: Display the public key of the newly created account next to the "Create a New Solana Account" button.

## Installation

**Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/solana-react-dapp.git
   cd solana-react-dapp
Install Dependencies:

Copy code
npm install
Start the Local Solana Test Validator:

Make sure you have the Solana CLI installed. Start the local test validator with:
solana-test-validator
Run the Application:

npm start
The app should open in your default web browser at http://localhost:3000.

