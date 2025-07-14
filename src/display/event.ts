import { Typed } from "@typed/typed"
import { SimpleType } from "@typed/simple"

export class EventManager {
  readonly handlers = {} as Record<string,EventHandler<string>[]>

  on(event:string, handler:EventHandler):EventHandlerHandle {
    if (!(event in this.handlers)) {
      this.handlers[event] = []
    }
    const index = this.handlers[event].push(handler) - 1
    return {
      type: event,
      index,
      handler
    }
  }

  stop({type,index}:EventHandlerHandle) {
    this.handlers[type] = this.handlers[type]
      .filter((_,i) => i !== index)
  }

  send(event:Event): void {
    if (!(event.type in this.handlers)) {
      return
    }
    for (let handler of this.handlers[event.type]) {
      handler(event)
    }
  }
}

export interface Event<T extends string = string, M extends SimpleType=SimpleType> extends Typed<T> {
  readonly message:M
}

export type EventHandler<T extends string = string, M extends SimpleType=SimpleType> = (e:Event<T,M>)=>void

export interface EventHandlerHandle<T extends string = string, M extends SimpleType = SimpleType> extends Typed<T> {
  readonly index: number
  readonly handler:EventHandler<T,M>
}
