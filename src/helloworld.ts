import { TDLYApp } from "./implementations/tdly/cli/app";

function wait (ms:number):Promise<void>
{
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const app = new TDLYApp()

export async function main ():Promise<void>
{
    console.log("elo")
    app.showDirectory("./")
}
