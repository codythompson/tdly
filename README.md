# (t)o(d) (l)ist for (y)aml
_and maybe other file formats too_

## The aim of this project is to provide a todo list model/interface that is editor and storage agnostic.

- allows for editing the list documents...
    - "manually" in a text editor
    - with a web GUI of some sort
    - via a CLI
- is very portable
    - filetype/permanent-storage agnostic.
        - yaml files are the base use case
        - list documents stored locally
        - or list docs stored "on the cloud" (i.e. google drive)
        - or maybe a nosql instance?
    - tries to avoid over-engineering things, while still keeping somewhat modular.
        - storage engine interface has basically two methods
            - write(document)
            - read(document)
        - no ORM or custom SQL
- should only aim to serve a single user
    - shouldn't worry about multiple "connections" or concurrent "reads"
    - should be designed so the whole system can easily run on a PC/mac, regardless of where the document files are stored.
        - running in the cloud is "allowed", but should not be designed with scalability in mind.

### As well as provide really good default implementations of the interface.

- v1
    - fancy terminal based UI using blessed-js
    - stores lists in .yaml files for easy manual editing
- v2
    - stores yaml files in google drive or similar consumer level cloud based storage
- v2.1
    - ability to sync/download to local yaml files
- v3
    - web app (maybe PWA) GUI
- vN (no particular order)
    - JSON support
    - nosql (i.e. mongodb) support
    - tdly mobile app
    - tdlyAAS / tdly-platform
        - host folks tdly instances/files

## technical notes

### coding guidelines / styling / philosophy

#### only one _nullish_ value, and it shall be `undefined`

In order to avoid problems like checking for `null` when the value is actually `undefined` or vice versa, this project has adopted a philosophy of pick one kind of _nullish_ and stick to it as much as possible.

This project somewhat arbitrarily picks `undefined` as the official _nullish_.

- code in this project should never intentionally use `null` as a value.
- Any encounters with a `null` value should be treated as a bug in the code somewhere.
- The typeguards defined in `./src/util/type.ts` and elsewhere should throw an `UnexpectedNullError` (defined in `./src/util/type.ts`) if a null value is encountered.
