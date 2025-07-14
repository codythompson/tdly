import { Typed } from "@typed/typed"
import { isStrArr } from "../../../../typed/guards"
import { DocumentItem } from "@model/document"
import { DocumentItemInflater, GenericDocumentInflater } from "@model/inflater"
import { ItemPropertyMap } from "@model/properties"

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

export class TagItemInflater extends DocumentItemInflater<Tag> {
    readonly type = TagType
    inflateItem(_:any, item: DocumentItem<TagType>, props: ItemPropertyMap): Tag {
        return {
            ...item,
            description: props.forceGet<string|undefined>("description"),
            aliases: props.forceGet<string[]|undefined>("aliases") ?? []
        }
    }
}

export class TagsInflater extends GenericDocumentInflater<TagsType, TagType> {
    constructor() {
        super(TagsType, [ new TagItemInflater() ])
    }
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
export const TagsType = "Tags"
export type TagsType = typeof TagsType
