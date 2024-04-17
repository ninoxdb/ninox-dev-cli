## First POC for the CLI for downloading a database

I have two objects
I want to parse them into the following types

const db={"id":"ut0i1nutbi9t","name":"6050","dbname":"6050","settings":{"name":"6050","icon":"database","color":"#9da9ce"},"icon":"database"};
const sc={
    "types": {
        "A": {
            "nextFieldId": 2,
            "caption": "Table1",
            "captions": {},
            "hidden": false,
            "fields": {
                "A": {
                    "base": "string",
                    "caption": "Text",
                    "captions": {},
                    "required": false,
                    "order": 0,
                    "formWidth": 0.5,
                    "uuid": "MLrSITSPLyQ6uFH0",
                    "globalSearch": true,
                    "hasIndex": false,
                    "tooltips": {},
                    "stringAutocorrect": true,
                    "stringMultiline": false,
                    "height": 1
                }
            },
            "uis": {},
            "afterCreate": "(var x := 1; ((x+( = A));(A := x)))",
            "afterUpdate": "(var x := 1; ((x+( = A));(A := x)))",
            "uuid": "mAQsbi4gWS3eLKa2",
            "globalSearch": true,
            "order": 0,
            "kind": "table"
        }
    },
    "afterOpenBehavior": "restoreNavigation",
    "afterOpen": "alert(---Hello World---)",
    "hideCalendar": false,
    "hideSearch": false,
    "hideDatabase": false,
    "hideNavigation": false
};
to be parsed as:
interface Database{
    id: string;
    settings: {
        name: string;
        icon: string;
        color: string;
    }
}
// and 
const sc={
    "types": {
        "A": {
            "nextFieldId": 2,
            "caption": "Table1",
            "captions": {},
            "hidden": false,
            "fields": {
                "A": {
                    "base": "string",
                    "caption": "Text",
                    "captions": {},
                    "required": false,
                    "order": 0,
                    "formWidth": 0.5,
                    "uuid": "MLrSITSPLyQ6uFH0",
                    "globalSearch": true,
                    "hasIndex": false,
                    "tooltips": {},
                    "stringAutocorrect": true,
                    "stringMultiline": false,
                    "height": 1
                }
            },
            "uis": {},
            "afterCreate": "(var x := 1; ((x+( = A));(A := x)))",
            "afterUpdate": "(var x := 1; ((x+( = A));(A := x)))",
            "uuid": "mAQsbi4gWS3eLKa2",
            "globalSearch": true,
            "order": 0,
            "kind": "table"
        }
    },
    "afterOpenBehavior": "restoreNavigation",
    "afterOpen": "alert(---Hello World---)",
    "hideCalendar": false,
    "hideSearch": false,
    "hideDatabase": false,
    "hideNavigation": false
};
// to be parsed as
interface DatabaseSchema{
    database: string;
    public isProtected: boolean;
    public readonly seq: number;
    public readonly version: number;
    public nextTypeId: number;
    public queryCache: { [key: string]: string | undefined };
    public readonly afterOpen: string | undefined;
    public readonly globalCode: string | undefined;
    public globalCodeExp: string | undefined;
    public globalScope: any;
    public afterOpenBehavior: 'openHome' | 'restoreNavigation';
    public fileSync: 'full' | 'cached';
    public dateFix: 'enabled' | 'disabled';
    public compatibility: 'latest' | '3.7.0';
    public dbId: string | undefined;
    public dbName: string | undefined;
    public hideCalendar: boolean;
    public hideSearch: boolean;
    public hideDatabase: boolean;
    public hideNavigation: boolean;
    public knownDatabases: {
        dbId: string;
        name: string;
        teamId: string;
        teamName: string;
    }[];
    public externalSchemas: { [key: string]: DatabaseSchema } = {};
}




// and
interface Table {
    isSQLFilterable:boolean;
    comparator:string;
   queryCache: Record<string, string | undefined>;
   nextFieldId: number;
    id: string;
    caption: string;
   captions: { [key: string]: string };
    icon: string | undefined;
    hidden: boolean;
    description: string | undefined;

    globalSearch: boolean;
    fields: {
    [key: string]: unknown;
  };
    uis: { [key: string]: unknown };
   sorted: Array<unknown>;
   color: any;
   background: any;
   uuid: any;
   fulltextTokens: any;
   isNew?: boolean;

    readRoles: string[] | undefined;
    writeRoles: string[] | undefined;
    createRoles: string[] | undefined;
    deleteRoles: string[] | undefined;

    afterUpdate: string | undefined;
    afterCreate: string | undefined;
    canRead: string | undefined;
    canWrite: string | undefined;
    canCreate: string | undefined;
    canDelete: string | undefined;

   canReadExp: string | undefined;
   canWriteExp: string | undefined;
   canCreateExp: string | undefined;
   canDeleteExp: string | undefined;

   afterCreateExp: string | undefined;
   afterUpdateExp: string | undefined;

   hasFiles: boolean;
   hasHistory: boolean;
   hasComments: boolean;
   order: number | undefined;
   _dateFields: { [key: string]: unknown };

   master: any;
   masterRef: any;
   parentRefs: unknown[] | undefined;
   children: unknown[] | undefined;

   kind: "table" | "page";
}



//    public readonly types: { [key: string]: NodeType };
// public readonly uuids: { [key: string]: NodeType | Field | UIType };