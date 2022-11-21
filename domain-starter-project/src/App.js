import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import contractAbi from "./utils/contractABI.json";
import { ethers } from "ethers";

// Constants
const TWITTER_HANDLE = '_UNCHAIN';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = ".samurai";
const CONTRACT_ADDRESS = "0xCe0522d69b672CfbBbab5bf4Fa5ABb9FECfEEBB5";

const App = () => {
	const [currentAccount, setCurrentAccount] = useState("");
	const [domain, setDomain] = useState("");
	const [record, setRecord] = useState("");

	// connectWallet 関数を定義
	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask -> https://metamask.io/");
				return;
			}

			// アカウントへのアクセスを要求するメソッドを使用。
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});

			// Metamask を一度認証すれば Connected とコンソールに表示。
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		}
		catch (error) {
			console.log(error);
		}
	};

	// ウォレットの接続を確認
	const checkIfWalletIsConnected = async () => {
		// window.ethereumの設定。この表記法はJavascriptの「分割代入」を参照。
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have MetaMask!");
			return;
		}
		else {
			console.log("We have the ethereum object", ethereum);
		}

		// ユーザーのウォレットをリクエスト
		const accounts = await ethereum.request({ method: "eth_accounts" });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setCurrentAccount(account);
		}
		else {
			console.log("No authorized account found");
		}
	}

	const mintDomain = async () => {
		// ドメインがnullのときrunしません。
		if (!domain) {
			return;
		}
		// ドメインが3文字に満たない、短すぎる場合にアラートを出します。
		if (domain.length < 3) {
			alert("Domain must be at least 3 characters long");
			return;
		}
		// ドメインの文字数に応じて価格を計算します。
		// 3 chars = 0.05 MATIC, 4 chars = 0.03 MATIC, 5 or more = 0.01 MATIC
		const price = domain.length === 3 ? "0.05" : domain.length === 4 ? "0.03" : "0.01";
		console.log("Minting domain", domain, "with price", price);

		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(
				CONTRACT_ADDRESS,
				contractAbi.abi,
				signer
				);
		
				console.log("Going to pop wallet now to pay gas...");
				let tx = await contract.register(domain, {
				value: ethers.utils.parseEther(price),
				});
				// ミントされるまでトランザクションを待つ。
				const receipt = await tx.wait();
		
				// トランザクションが問題なく実行されたか確認。
				if (receipt.status === 1) {
				console.log(
					"Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash
				);
		
				// domain,recordをセット。
				tx = await contract.setRecord(domain, record);
				await tx.wait();
		
				console.log("Record set! https://mumbai.polygonscan.com/tx/" + tx.hash);
		
				setRecord("");
				setDomain("");
				} else {
				alert("Transaction failed! Please try again");
				}
			}
		}
		catch (error) {
		  console.log(error);
		}
	};

	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<img
				src="https://media.giphy.com/media/3ohhwytHcusSCXXOUg/giphy.gif"
				alt="Ninja donut gif"
			/>
			<button
				onClick={connectWallet}
				className="cta-button connect-wallet-button"
			>
				Connect Wallet
			</button>
		</div>
	)

	// ドメインネームとデータの入力フォーム
	const renderInputForm = () => {
		return (
			<div className="form-container">
				<div className="first-row">
					<input
					type="text"
					value={domain}
					placeholder="domain"
					onChange={(e) => setDomain(e.target.value)}
					/>
					<p className="tld"> {tld} </p>
				</div>

				<input
					type="text"
					value={record}
					placeholder="whats ur samurai power"
					onChange={(e) => setRecord(e.target.value)}
				/>

				<div className="button-container">
					<button
					className="cta-button mint-button"
					onClick={mintDomain}
					>
						Mint
					</button>
				</div>
			</div>
		);
	};

	useEffect(() => {
		checkIfWalletIsConnected()
	}, [])

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<header>
						<div className="left">
							<p className="title">🐱‍👤 Ninja Name Service</p>
							<p className="subtitle">Your immortal API on the blockchain!</p>
						</div>
					</header>
				</div>

				{!currentAccount && renderNotConnectedContainer()}
				{currentAccount && renderInputForm()}

        		<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
