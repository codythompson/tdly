import { UIDocBuilder } from "@display/docbuilder";
import { TDLYApp } from "./implementations/tdly/cli/app";

function wait (ms:number):Promise<void>
{
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const app = new TDLYApp()

async function main ():Promise<void>
{
    app.displayUIDocument(UIDocBuilder.Basic("hello", "world world"))
}
