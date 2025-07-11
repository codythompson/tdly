import { TextGroup } from "./text";

export interface Display {
    display(textGroup: TextGroup | TextGroup[]): Promise<void>
}
