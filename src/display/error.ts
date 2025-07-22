import { BaseStyles, Style, UIDocument } from "@display/document";
import { UIDocBuilder } from "./docbuilder";

export class AppError extends Error {
  readonly type = "AppError"

  constructor(
    readonly title:string,
    readonly message:string,
    readonly style:Style=BaseStyles.error
  ) {
    super(`${title} - ${message}`);
  }

  compile():UIDocument {
    return UIDocBuilder.start()
      .style(this.style)
      .addBlock(this.title)
      .modifyLast()
        .heading(1)
        .break<UIDocBuilder>()
      .addBlock(this.message)
      .finish()
  }
}

export class AppNotReady extends AppError {
  constructor() {
    super("The app is not ready!", "The app encountered a bug. It is not ready to do this yet.")
  }
}
