import { isStrArr } from "../../util/type"
import { DocumentItem, Typed } from "../document"

/**
 * A tag, akin to a label or category
 * A thing, can have multiple tags.
 * A tag, can be associated with many things.
 */
export interface Tag extends DocumentItem<TagType> {
   /**
    * @property {string} name the unique name for the tag - should NOT be case sensititive
    */
    name: string

    description?: string

    /**
     * @property {string} name any aliases the tag might have - should NOT be case sensitive
     */
    aliases: string[]
}

/**
 * A thing that has tags associated with it.
 */
export interface Taggable<T extends string> extends Typed<T> {
    /**
     * @property {string} type the type of thing the tagged thing is (i.e. list, list item, idk)
     */

    /**
     * @property {string} tags a list of tag names that the thing is tagged/associated with
     */
    tags: string[]
}

export function isTaggable<T extends string>(typed:Typed<T>): typed is Taggable<T> {
    const taggedArr = (typed as any).tagged;
    return isStrArr(taggedArr);
}

export const TagType = "Tag"
export type TagType = typeof TagType
