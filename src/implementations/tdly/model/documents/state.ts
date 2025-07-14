import { DocumentItem } from "@model/document"
import { Taggable } from "./tag"

// TODO: inflaters

/**
 * @class
 * represents a state that a list item can be in
 */
export interface State extends DocumentItem<StateType>, Taggable<StateType> {
    /** @property {string} name unique name for the state, doubles as ID */

    /** @property {string?} description an optional description for the state */
    description?: string

    /** @property {string?} marker the symbol to use when a list item is in this state (i.e. checkmark, unchecked box, bullet, hyphen */
    marker?: string
}

export interface StateGraph extends DocumentItem<StateGraphType>, Taggable<StateGraphType> {
    /** @property {string?} description an optional description for the state */
    description?: string

    nodes: StateGraphNode[]
}

export interface StateGraphNode {
    next: StateGraphNode|null
    previous: StateGraphNode|null

    stateName: string
}

export const StateType = "State"
export type StateType = typeof StateType
export const StateGraphType = "StateGraph"
export type StateGraphType = typeof StateGraphType
