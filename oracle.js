require("dotenv").config();
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const common = require("ethereumjs-common");

const oracle = async (_value) => {

	try {
		const web3 = new Web3(process.env.NODE);

		//@dev abi of the smart contract that will manipulate the oracle
		const abiContract = [
		  {
			inputs: [],
			name: "getNum",
			outputs: [
			  {
				internalType: "uint256",
				name: "",
				type: "uint256",
			  },
			],
			stateMutability: "view",
			type: "function",
		  },
		  {
			inputs: [
			  {
				internalType: "uint256",
				name: "_num",
				type: "uint256",
			  },
			],
			name: "setNum",
			outputs: [],
			stateMutability: "nonpayable",
			type: "function",
		  },
		];
		
		const addressContract = process.env.ADDRESS_CONTRACT;
	  
		const contractInstance = new web3.eth.Contract(abiContract, addressContract);
	  
		const numbersTransaction = await web3.eth.getTransactionCount(process.env.ADDRESS_WALLET);
	  
		const amountGas = await contractInstance.methods.setNum(_value).estimateGas({});
		
		let rawTx = {
			nonce: web3.utils.toHex(numbersTransaction),
			gasPrice: web3.utils.toHex(web3.utils.toWei("25", "gwei")),
			gasLimit: web3.utils.toHex(amountGas),
			to: addressContract,
			value: "0x00",
			data: contractInstance.methods.setNum(_value).encodeABI(),
		};
		
		const chain = common.default.forCustomChain(
			"mainnet",
			{
			  name: "avax",
			  networkId: 43113,
			  chainId:43113,
			},
			"petersburg"
		);

		const tx = new Tx(rawTx, { common: chain });
		
		tx.sign(Buffer.from(process.env.PRIVATE_KEY, "hex"));
		
		const serializedTx = tx.serialize().toString("hex");
		
		const firma = await web3.eth.sendSignedTransaction("0x" + serializedTx);
	
		const response = {
			statusCode: 200,
			body: firma,
		};

		console.log(response);

		return response;

	} catch (error) {

		const response = {
			statusCode: 404,
			body: error,
		};

		console.log(response);

	}


};
//ejecucion del oraculo
oracle(10);
