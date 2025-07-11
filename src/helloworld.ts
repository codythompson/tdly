function wait (ms:number):Promise<void>
{
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main ():Promise<void>
{
    console.log("hi");
    await wait(200);
    console.log(" .")
    await wait(200);
    console.log(" .")
    await wait(200);
    console.log(" .")
    await wait(2000);
    console.log("okthen");
}
