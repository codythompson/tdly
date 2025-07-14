import { BaseStyles, Style, UIDocument } from "@display/text";

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
    return {
      blocks: [
        {
          content: this.title,
          headingLevel: 1
        },
        this.message
      ],
      style: this.style
    }
  }
}

export class AppNotReady extends AppError {
  constructor() {
    super("The app is not ready!", "The app encountered a bug. It is not ready to do this yet.")
  }
}
