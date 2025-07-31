import { Typed } from "@typed/typed"
import { SimpleType } from "@typed/simple"

export class EventManager<K extends string> {
  readonly handlers = {} as Record<K,EventHandler<K>[]>

  on<EK extends K>(event:EK, handler:EventHandler):EventHandlerHandle {
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

  stop<EK extends K>({type,index}:EventHandlerHandle<EK>) {
    this.handlers[type] = this.handlers[type]
      .filter((_,i) => i !== index)
  }

  send<EK extends K>(event:Event<EK>): void {
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
