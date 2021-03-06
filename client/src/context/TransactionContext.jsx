import React , {useEffect, useState} from 'react';
import {ethers} from 'ethers';
import {contractABI, contractAddress} from '../utils/constants';


export const TransactionContext = React.createContext();

const {ethereum} = window;
const initialState = ""
const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
    
    return transactionContract;

    console.log({
        provider,
        signer,
        transactionContract
    })
}

export const TransactionProvider = ({children}) => {

    const[currentAccount, setCurrentAccount]= useState(initialState);
    const[formData, setFormData]= useState({addressTo: '',amount: '',keyword: '',message: ''});
    const[isLoading, setisLoading] = useState(false)
    const[transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const[transactions, setTransactions] = useState([])
    const handleChange = (e,name) =>{
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }

    const getAllTransaction = async() => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
              }));
            console.log(structuredTransactions);
            setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error);
        }
    }

    const checkIfWalletIsConnected = async () => {
        try{
            if(!ethereum) return alert("Please install metamask");
            const accounts = await ethereum.request({method: 'eth_accounts'});

            if(accounts.length){
                setCurrentAccount(accounts[0]);
                getAllTransaction();
            }else{
                console.log("No accounts found");
            }
            console.log(accounts);
        }
        catch(error){
            console.log("no eth object");
        }
    }
    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem("transactionCount", transactionCount);

        } catch (error) {
            
        }
    }
    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const accounts = await ethereum.request({method:'eth_requestAccounts'});
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const {addressTo, amount, keyword, message} = formData;
            getEthereumContract();
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);
            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from : currentAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount._hex,
                }]
            });

            const transactionHash =  await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
            setisLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setisLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object 2");
        }
    }

    useEffect(()=>{
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);

    return(
        <TransactionContext.Provider value = {{connectWallet, currentAccount, formData, sendTransaction, handleChange, isLoading,transactionCount,transactions}}>
            {children}
        </TransactionContext.Provider>
    )
}