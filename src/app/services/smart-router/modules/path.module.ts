import web3, { Address, Bytes, Sha3Input } from "web3"
import Pair from "./pair.module"
import Pool from "./pool.module"

class Path {
    steps: (Address | number)[]
    constructor(steps?: (Address | number)[]) {
        this.steps = steps ?? []
    }

    encodePacked(): Bytes {
        const inputs: Sha3Input[] = this.steps.map((step) => {
            if (typeof step == "number") {
                console.log("num" + step)
                return { type: "uint32", value: step }
            }
            return { type: "address", value: step }
        })
        return web3.utils.encodePacked(...inputs)
    }

    getFirstPool(): {
    tokenStart: Address;
    tokenEnd: Address;
    indexPool: number;
    } {
        return {
            tokenStart: this.steps[0] as Address,
            tokenEnd: this.steps[2] as Address,
            indexPool: this.steps[1] as number,
        }
    }

    private hasEncounteredPair(token: Address): boolean {
        const length = this.steps.length
        if (length < 3) {
            throw new Error("Path length must be at least 3")
        }

        const pairNext = new Pair(this.steps.at(-1) as Address, token)

        for (let i = 0; i < (length - 1) / 2; i++) {
            const pairCurrent = new Pair(
        this.steps[2 * i] as Address,
        this.steps[2 * i + 2] as Address
            )

            if (pairCurrent.compare(pairNext)) return true
        }
        return false
    }

    getLast(): Address {
        return this.steps.at(-1) as Address
    }

    create(pool: Pool, tokenStart: Address): boolean {
        const pair = pool.getPair(tokenStart)
        if (pair == null) return false

        this.steps.push(pair.tokenStart, pool.indexPool, pair.tokenEnd)
        return true
    }

    pushNextHop(indexPool: number, token: Address): boolean {
        if (this.hasEncounteredPair(token)) return false
        this.steps.push(indexPool, token)
        return true
    }

    generatePathsFromNextHop(
        pools: Pool[],
        tokenEnd: Address
    ): {
    exactEndPaths: Path[];
    restPaths: Path[];
  } {
        const exactEndPaths: Path[] = []
        const restPaths: Path[] = []
        const tokenStart = this.steps.at(-1) as Address

        for (const pool of pools) {
            const pair = pool.getPair(tokenStart)
            if (pair == null) continue

            const steps = Object.assign([], this.steps)
            const pathCurrent = new Path(steps)
            
            console.log(pathCurrent.steps.length)
            const pushResult = pathCurrent.pushNextHop(pool.indexPool, pair.tokenEnd)
            console.log(pathCurrent.steps.length)

            if (!pushResult) continue
            if (pair.tokenEnd == tokenEnd) {
                exactEndPaths.push(pathCurrent)
                continue
            }

            restPaths.push(pathCurrent)
        }
        return { exactEndPaths, restPaths }
    }
}
export default Path
