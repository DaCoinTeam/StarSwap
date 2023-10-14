import { ChainName, GAS_LIMIT, GAS_PRICE } from "../../config"
import Web3, { Address } from "web3"
import abi from "./abi"
import { getHttpWeb3 } from "../provider"

const getLiquidityPoolContract = (web3: Web3, poolAddress: Address) =>
    new web3.eth.Contract(abi, poolAddress, web3)

class LiquidityPoolContract {
    private chainName: ChainName
    private poolAddress: Address
    private sender?: Address
    private web3?: Web3

    constructor(
        chainName: ChainName,
        poolAddress: Address,
        sender?: Address,
        web3?: Web3
    ) {
        this.chainName = chainName
        this.sender = sender
        this.poolAddress = poolAddress
        this.web3 = web3
    }

    async token0() {
        try {
            const web3 = getHttpWeb3(this.chainName)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return await contract.methods.token0().call()
        } catch (ex) {
            console.log(ex)
            return null
        }
    }

    async token1() {
        try {
            const web3 = getHttpWeb3(this.chainName)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return await contract.methods.token1().call()
        } catch (ex) {
            console.log(ex)
            return null
        }
    }

    async protocolFee() {
        try {
            const web3 = getHttpWeb3(this.chainName)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return Number(await contract.methods.protocolFee().call())
        } catch (ex) {
            console.log(ex)
            return null
        }
    }

    async token1AmountOut(_token0AmountIn: bigint, controller?: AbortController) {
        try {
            const web3 = getHttpWeb3(this.chainName, controller)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return BigInt(await contract.methods.token1AmountOut(_token0AmountIn).call())
        } catch (ex) {
            console.log(ex)
            return null
        }
    }

    async token0AmountOut(_token1AmountIn: bigint, controller?: AbortController) {
        try {
            const web3 = getHttpWeb3(this.chainName, controller)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return BigInt(await contract.methods.token0AmountOut(_token1AmountIn).call())
        } catch (ex) {
            console.log(ex)
            return null
        }
    }

    async token0Price() {
        try {
            const web3 = getHttpWeb3(this.chainName)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return await contract.methods.token0Price().call()
        } catch (ex) {
            console.log(ex)
            return null
        }
    }

    async token0BasePrice() {
        try {
            const web3 = getHttpWeb3(this.chainName)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return BigInt(await contract.methods.token0BasePrice().call())
        } catch (ex) {
            console.log(ex)
            return null
        }
    }


    async token0MaxPrice() {
        try {
            const web3 = getHttpWeb3(this.chainName)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return BigInt(await contract.methods.token0MaxPrice().call())
        } catch (ex) {
            console.log(ex)
            return null
        }
    }



    async isProviderRegistered() {
        try {
            if (this.web3 == null) return
            const contract = getLiquidityPoolContract(this.web3, this.poolAddress)
            return await contract.methods.isProviderRegistered().call()
        } catch (ex) {
            console.log(ex)
            return null
        }
    }

    async registerProvider() {
        try {
            if (this.web3 == null) return
            const contract = getLiquidityPoolContract(this.web3, this.poolAddress)
            const data = contract.methods.registerProvider().encodeABI()
            
            return await this.web3.eth.sendTransaction({
                from: this.sender,
                to: this.poolAddress,
                data,
                gasLimit: GAS_LIMIT,
                gasPrice: GAS_PRICE,
            })
        } catch (ex) {
            console.log(ex)
            return null
        }
    }

    async name() {
        try {
            const web3 = getHttpWeb3(this.chainName)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return await contract.methods.name().call()
        } catch (ex) {
            console.log(ex)
            return null
        }
    }

    async symbol() {
        try {
            const web3 = getHttpWeb3(this.chainName)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return await contract.methods.symbol().call()
        } catch (ex) {
            console.log(ex)
            return null
        }
    }

    async decimals() {
        try {
            const web3 = getHttpWeb3(this.chainName)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return Number(await contract.methods.decimals().call())
        } catch (ex) {
            console.log(ex)
            return null
        }
    }

    async balanceOf(_owner: Address) {
        try {
            const web3 = getHttpWeb3(this.chainName)
            const contract = getLiquidityPoolContract(web3, this.poolAddress)
            return BigInt((await contract.methods.balanceOf(_owner).call()).toString())
        } catch (ex) {
            console.log(ex)
            return null
        }
    }
}

export default LiquidityPoolContract
