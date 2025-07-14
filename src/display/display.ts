import { EventManager } from "./event";
import { UIDocument } from "./text";

export abstract class Display {
  readonly events:EventManager = new EventManager()

  abstract displayMessge(message: UIDocument): Promise<void>
  abstract display(document: UIDocument): Promise<void>
}
