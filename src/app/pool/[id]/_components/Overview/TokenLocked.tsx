"use client"

import React, { useContext } from "react"
import { Card, CardBody, Spacer } from "@nextui-org/react"
import { TitleDisplay } from "@app/_shared"
import TokenLockedDetails from "./TokenLockedDetails"
import { TokenStateContext } from "../../layout"

interface TokenLockedProps {
    clasName? : string,
    token0ImageUrl?: string,
    token1ImageUrl?: string,
}

const TokenLocked = (props: TokenLockedProps) => {
    const tokenState = useContext(TokenStateContext)
    if (tokenState == null) return
    return (
        <div className = {`${props.clasName}`}>
            <TitleDisplay title="Total Tokens Locked"/>
            <Spacer y={2}/>
            <Card>
                <CardBody className="p-3">
                    <TokenLockedDetails tokenLocked={tokenState.token0Locked} tokenSymbol={tokenState.token0Symbol}/>
                    <Spacer y={2}/>
                    <TokenLockedDetails tokenLocked={tokenState.token1Locked} tokenSymbol={tokenState.token1Symbol}/>
                </CardBody>
            </Card>
        </div>
 
    )
}

export default TokenLocked
