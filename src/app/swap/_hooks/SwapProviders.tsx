"use client"
import { ContextProps } from "@app/_shared"
import { RootState } from "@redux"
import React, {
    createContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import useSwapReducer, { SwapState } from "./useSwapReducer.hook"
import { useSelector } from "react-redux"
import { usePathname, useSearchParams } from "next/navigation"
import { chainInfos } from "@config"
import { ERC20Contract } from "@blockchain"
import utils from "@utils"
import { getTokenApi } from "@services"
import { useRouter } from "next/navigation"

interface SwapContext {
  swapState: SwapState;
  actions: {
    doReverse: () => Promise<void>;
  };
  updaters: {
    initialize: () => void;
    updateBeforeConnected: () => Promise<void>;
    upateAfterConnected: () => Promise<void>;
  };
}

export const SwapContext = createContext<SwapContext | null>(null)

const SwapProviders = (props: ContextProps) => {
    const chainId = useSelector((state: RootState) => state.blockchain.chainId)
    const account = useSelector((state: RootState) => state.blockchain.account)

    const [swapState, swapDispatch] = useSwapReducer()
    const router = useRouter()
    const path = usePathname()
    const searchParams = useSearchParams()

    const _getTokenPair = () => {
        const tokenIn =
      searchParams.get("tokenIn") ?? chainInfos[chainId].stableTokens[0]

        const tokenOut =
      searchParams.get("tokenOut") ?? chainInfos[chainId].exchangeToken
        return {
            tokenIn,
            tokenOut,
        }
    }

    const [preventExecution, setPreventExecution] = useState(false)

    const doReverse = async () => {
        const { tokenIn, tokenOut } = _getTokenPair()
        const params = new URLSearchParams(searchParams)
        params.set("tokenIn", tokenOut)
        params.set("tokenOut", tokenIn)
        router.push(`${path}?${params.toString()}`)

        const { infoIn, infoOut } = swapState

        swapDispatch({
            type: "SET_INFO_OUT",
            payload: infoOut,
        })

        swapDispatch({
            type: "SET_INFO_IN",
            payload: infoIn,
        })

        setPreventExecution(true)
    }

    const actions = useMemo(() => {
        return { doReverse }
    }, [doReverse])

    const finishInitializeRef = useRef(false)

    const initialize = () => {
        const tokenIn =
      searchParams.get("tokenIn") ?? chainInfos[chainId].stableTokens[0]

        swapDispatch({
            type: "SET_TOKEN_IN",
            payload: tokenIn,
        })
        const tokenOut =
      searchParams.get("tokenOut") ?? chainInfos[chainId].exchangeToken

        swapDispatch({
            type: "SET_TOKEN_OUT",
            payload: tokenOut,
        })

        finishInitializeRef.current = true
    }

    useEffect(() => {
        initialize()
    }, [])

    const updateBeforeConnected = async () => {
        const updateTokenInInfo = async () => {
            const tokenInContract = new ERC20Contract(
                chainId,
                swapState.infoIn.address
            )

            const decimalsIn = await tokenInContract.decimals()
            if (decimalsIn == null) return
            swapDispatch({ type: "SET_DECIMALS_IN", payload: decimalsIn })

            const promises: Promise<void>[] = []

            const additionalInPromise = async () => {
                const additionalIn = await getTokenApi(
                    swapState.infoIn.address,
                    chainId
                )
                if (additionalIn != null) {
                    // const blobUrl = await fetchAndCreateSvgBlobUrl(additionalIn.imageUrlUrl)
                    // if (blobUrl == null) return
                    // swapDispatch({ type: "SET_IMAGE_URL_IN", payload: blobUrl })
                }
            }
            promises.push(additionalInPromise())

            const symbolInPromise = async () => {
                const symbolIn = await tokenInContract.symbol()
                if (symbolIn == null) return
                swapDispatch({ type: "SET_SYMBOL_IN", payload: symbolIn })
            }
            promises.push(symbolInPromise())

            await Promise.all(promises)
        }

        const updateTokenOutInfo = async () => {
            const tokenOutContract = new ERC20Contract(
                chainId,
                swapState.infoOut.address
            )

            const decimalsOut = await tokenOutContract.decimals()
            if (decimalsOut == null) return
            swapDispatch({
                type: "SET_DECIMALS_OUT",
                payload: decimalsOut,
            })

            const promises: Promise<void>[] = []

            const additionalOutPromise = async () => {
                const additionalOut = await getTokenApi(
                    swapState.infoIn.address,
                    chainId
                )
                if (additionalOut != null) {
                    // const blobUrl = await fetchAndCreateSvgBlobUrl(additionalOut.imageUrlUrl)
                    // if (blobUrl == null) return
                    // swapDispatch({ type: "SET_IMAGE_URL_OUT", payload: blobUrl })
                }
            }
            promises.push(additionalOutPromise())

            const symbolOutPromise = async () => {
                const symbolOut = await tokenOutContract.symbol()
                if (symbolOut == null) return
                swapDispatch({ type: "SET_SYMBOL_OUT", payload: symbolOut })
            }
            promises.push(symbolOutPromise())

            await Promise.all(promises)
        }

        const promises: Promise<void>[] = []
        promises.push(updateTokenInInfo())
        promises.push(updateTokenOutInfo())
        await Promise.all(promises)

        swapDispatch({
            type: "SET_FINISH_UPDATE_BEFORE_CONNECTED",
            payload: true,
        })
    }

    useEffect(() => {
        if (!finishInitializeRef.current) return
        if (preventExecution) {
            setPreventExecution(false)
            return
        }
        updateBeforeConnected()
    }, [
        finishInitializeRef.current,
        swapState.infoIn.address,
        swapState.infoOut.address,
    ])

    const upateAfterConnected = async () => {
        if (!account || !swapState.state.finishUpdateAfterConnected) {
            swapDispatch({
                type: "SET_FINISH_UPDATE_AFTER_CONNECTED",
                payload: false,
            })
            return
        }

        const tokenInContract = new ERC20Contract(
            chainId,
            swapState.infoIn.address
        )
        const tokenOutContract = new ERC20Contract(
            chainId,
            swapState.infoOut.address
        )

        const promises: Promise<void>[] = []

        const balanceInPromise = async () => {
            const balanceIn = await tokenInContract.balanceOf(account)
            if (balanceIn == null) return
            swapDispatch({
                type: "SET_BALANCE_IN",
                payload: utils.math.computeRedenomination(
                    balanceIn,
                    swapState.infoIn.decimals,
                    3
                ),
            })
        }
        promises.push(balanceInPromise())

        const balanceOutPromise = async () => {
            const balanceOut = await tokenOutContract.balanceOf(account)
            if (balanceOut == null) return
            swapDispatch({
                type: "SET_BALANCE_OUT",
                payload: utils.math.computeRedenomination(
                    balanceOut,
                    swapState.infoOut.decimals,
                    3
                ),
            })
        }
        promises.push(balanceOutPromise())
    }

    useEffect(() => {
        upateAfterConnected()
    }, [account, swapState.state.finishUpdateBeforeConnected])

    const updaters = useMemo(() => {
        return {
            initialize,
            updateBeforeConnected,
            upateAfterConnected,
        }
    }, [initialize, updateBeforeConnected, upateAfterConnected])
    return (
        <SwapContext.Provider value={{ swapState, actions, updaters }}>
            {props.children}
        </SwapContext.Provider>
    )
}
export default SwapProviders
