import { TokenStateContext } from "@app/pool/[id]/layout"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline"
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid"
import { Avatar, AvatarGroup, Button, Skeleton } from "@nextui-org/react"
import React, { useContext } from "react"

interface TokenPairDisplayProps {
  className?: string;
  token0ImageUrl?: string;
  token1ImageUrl?: string;
  size?: "md" | "lg";
  showInverse?: boolean;
}

const TokenPairDisplay = (props: TokenPairDisplayProps) => {
    const tokenState = useContext(TokenStateContext)
    if (tokenState == null) return

    let _size = props.size
    if (_size == undefined) _size = "md"

    let _tokenImageClassName: string = ""
    let _textClassName: string = ""

    switch (_size) {
    case "md":
        _tokenImageClassName = "w-5 h-5"
        _textClassName = "text-sm"
        break
    case "lg":
        _tokenImageClassName = "w-9 h-9"
        _textClassName = "text-3xl"
        break
    }

    const _showInverse = () =>
        props.showInverse ? (
            <Button
                isIconOnly
                variant="light"
                className="w-6 h-6 min-w-0 justify-none"
                endContent={<ArrowsRightLeftIcon height={16} width={16} />}
            />
        ) : null

    return (
        <div className={`${props.className}`}>
            {tokenState.finishLoadWithoutConnected ? (
                <div className="flex gap-2 items-center">
                    <AvatarGroup>
                        <Avatar
                            classNames={{
                                base: `${_tokenImageClassName}`,
                            }}
                            showFallback
                            src={props.token0ImageUrl}
                            fallback={<QuestionMarkCircleIcon className={`${_tokenImageClassName}`} />}
                        />
                        <Avatar
                            classNames={{
                                base: `${_tokenImageClassName}`,
                            }}
                            showFallback
                            src={props.token1ImageUrl}
                            fallback={<QuestionMarkCircleIcon className={`${_tokenImageClassName}`} />}
                        />
                    </AvatarGroup>
                    <span className={`font-bold ${_textClassName}`}>
                        {" "}
                        {tokenState.token0Symbol}/{tokenState.token1Symbol}{" "}
                    </span>
                    {_showInverse()}
                </div>
            ) : (
                <Skeleton className="h-6 w-24 rounded" />
            )}
        </div>
    )
}

export default TokenPairDisplay
