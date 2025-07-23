import { main } from "./helloworld"

main()
  .catch(console.error)
  .then(() => console.log("done"))
