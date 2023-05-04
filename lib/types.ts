export interface OsmtSkill {
    id: string; // e.g. "http://localhost:8080/api/skills/60f17310-8462-46ad-b739-25dbb70746cb",
    uuid: string;
    skillName: string;
    skillStatement: string;
    authors: string[]; // e.g. ["Nate", "Marco the Cat"]. Note previous versions may have been "string" values only.
    status: string; // always "published" (I think drafts or archived don't appear in this list)
    keywords: string[]; // e.g. ["Smartness", "Intellgentleman"],
    publishDate: string | null; // e.g. "2023-03-23T23:47:07.099272Z",
}

export interface OsmtSkillDetail extends OsmtSkill {
    // "@context": "https://rsd.openskillsnetwork.org/context-v1.json"
    type: string; // always "RichSkillDescriptor",
    updateDate: string | null; // e.g. "2023-03-29T20:14:00.258186Z",
    archiveDate: string | null;
    creationDate: string; // e.g. "2023-03-23T22:53:02.211872Z",
    collections: Array<{ uuid: string; name: string }>; // e.g. [{"uuid": "5bf3d3cc-5fdc-4702-97c7-84894b482c01", "name": "Nate's Favorite Skills!"}],
    // "occupations": [{
    // 	"code": "15-2051.01",
    // 	"targetNodeName": "Business Intelligence Analysts",
    // 	"frameworkName": "o*net",
    // 	"parents": [{
    // 		"code": "15-0000",
    // 		"targetNodeName": "Computer and Mathematical Occupations",
    // 		"level": "Major"
    // 	}, {
    // 		"code": "15-2000",
    // 		"targetNodeName": "Mathematical Science Occupations",
    // 		"level": "Minor"
    // 	}, {
    // 		"code": "15-2050",
    // 		"targetNodeName": "Data Scientists",
    // 		"level": "Broad"
    // 	}, {
    // 		"code": "15-2051",
    // 		"targetNodeName": "Data Scientists",
    // 		"level": "Detailed"
    // 	}]
    // }
    // ]
    categories: string[]; // e.g. ["Intelligence"]. Note previous versions may have been "string" values only.
    certifications: Array<{ name: string }>; // e.g. [{"name": "Cert of Smarts"}]
    standards: Array<{ skillName: string }>; // e.g. [{"skillName": "Smartness paradigms"}]
    alignments: Array<{
        id: string; // e.g. "https://en.wikipedia.org/wiki/Strategic_intelligence",
        skillName: string; // e.g. "Strategic Intelligence",
        isPartOf?: { name: string }; // e.g. {"name": "Wikipedia"}
    }>;
    employers: Array<{ name: string }>; // e.g. [{"name": "Skybridge Skills"}]
    skillName: string; // e.g. "Be Intelligent!";
    skillStatement: string; // e.g. "The ability to perceive or infer information, and to retain it as knowledge to be applied towards adaptive behaviors within an environment or context."
    creator: string | null; // e.g. "https://credentialengineregistry.org/resources/ce-036d082d-d80e-41a7-99a0-2d63a4ad3a4a";
}

export interface OsmtCollectionSummary {
    uuid: string; // e.g. "5bf3d3cc-5fdc-4702-97c7-84894b482c01"
    name: string; // e.g. "Favorite Skills!"
    description: string; // e.g. "Author loves skills and using them."
    skillCount: number;
    workspaceOwner: string; // e.g. ""
    status: string; // e.g. "published". Only published skill and collections will be returned.
    publishDate: string; // ISO8601 e.g. "2023-04-06T23:05:38" -- watch out for lack of time zone. Assume UTC.
}

export interface OsmtCollectionDetail {
    // "@context": "https://rsd.openskillsnetwork.org/context-v1.json";
    type: string; // always "RichSkillCollection";
    uuid: string; // e.g. "5bf3d3cc-5fdc-4702-97c7-84894b482c01";

    skills: Array<{ id: string }>; // e.g. [{"id": "http://localhost:8080/api/skills/60f17310-8462-46ad-b739-25dbb70746cb"}];
    // unknown if this list is pagninated or not and we might sometimes only get a partial list.

    author: string; // maybe array of strings someday in the future? e.g. "Big University";
    updateDate: string | null; // e.g. "2023-04-22T00:17:38.756588Z";
    archiveDate: string | null;
    publishDate: string | null;
    creationDate: string;
    creator: string | null; // e.g. "https://credentialengineregistry.org/resources/ce-036d082d-d80e-41a7-99a0-2d63a4ad3a4a";
    status: string; // always "published"; (drafts not included in what we can fetch)
    description: string | null; // e.g. "Cyber security skills are important on the information superhighway.";
    name: string; // e.g. "Cyber Security Skills"
    id: string; // e.g. "http://localhost:8080/api/collections/5bf3d3cc-5fdc-4702-97c7-84894b482c01";
    owner: ""; // ??
}

export interface SkillMap {
    [key: string]: OsmtSkill | OsmtSkillDetail;
}

export interface OsmtSkillLibrary {
    domain?: string; // OSMT domain e.g. "osmt.example.com"
    skillMap: SkillMap;
    collectionMap: { [key: string]: CompetencyFramework };
}

/* A property can be represented as a map of values for each supported language e.g.
"ceasn:competencyLabel": {
    "en-us": "Access Creation"
}
*/
export interface PropertyLanguageMap {
    [key: string]: string;
}

/* A plural language map allows for multiple values for a given language e.g.
"ceasn:conceptKeyword": {
    "en-us": [
        "Authentications",
        "Authorization (Computing)",
        "Authentication",
        "SafeNet"
    ]
},
*/
export interface PropertyLanguageMapPlural {
    [key: string]: string[];
}

/*
CTDL graph representation of a CompetencyFramework. See https://credreg.net/ctdl/terms#CompetencyFramework
Some properties will be generated and are commented out here.
*/
export interface CompetencyFramework {
    "@id": string; // Resource URL for the framework itself. Auto-generate CTID then put it into this format for the registry env e.g. "https://sandbox.credentialengineregistry.org/resources/ce-3e7df7ec-1a9b-4503-9ff3-21256022b515"
    "@type": string; // Always: "ceasn:CompetencyFramework";

    // "ceasn:creator": string[]; // Org ID resource URL e.g. ["https://sandbox.credentialengineregistry.org/resources/ce-9d30f846-dfa4-4b1c-90fa-9d01238a86ac"]
    // "ceasn:dateCreated": string; // ISO8601 e.g. "2021-02-11"
    // "ceasn:dateModified": string; // ISO8601 e.g. "2021-02-18T21:08:58.01Z"
    "ceasn:description": PropertyLanguageMap; // A library description e.g. {"en-us": "OSMT Library by Author Org"}
    "ceasn:hasTopChild": string[]; // Generated list of competency IDs [
    //     "https://sandbox.credentialengineregistry.org/resources/ce-3ac23770-5d0b-49c7-8dca-f891c2868e37", // Top-level competency, first in the list
    //     "https://sandbox.credentialengineregistry.org/resources/ce-1b0eeb3f-e8bc-4e0f-8c55-0bcd56905ef2"
    // ];
    "ceasn:inLanguage": string[]; // e.g. ["en"];
    "ceasn:name": string | PropertyLanguageMap; // {"en-us": "Cybersecurity Collection"}
    "ceasn:publisher": string[]; // Org ID resource URL e.g. ["https://sandbox.credentialengineregistry.org/resources/ce-9d30f846-dfa4-4b1c-90fa-9d01238a86ac"]
    "ceasn:publisherName"?: PropertyLanguageMap; // e.g. {"en-us": "Western Governors University"}
    "ceterms:ctid": string; // CTID of this CompetencyFramework, initially auto-generated. (owned at library level) e.g. "ce-3e7df7ec-1a9b-4503-9ff3-21256022b515";
    // socList: string[]; // Generated: List of SOC codes that this framework is associated with, e.g. ["15-1121", "15-1122"]
}
export interface CompetencyFrameworkGetResult extends CompetencyFramework {
    "ceasn:publisher": string[];
    "ceasn:name": PropertyLanguageMap;
}

export interface Competency {
    "@id": string; // `${registryBaseDomain}/resources/${ctid}` e.g. "https://sandbox.credentialengineregistry.org/resources/ce-3ac23770-5d0b-49c7-8dca-f891c2868e37"
    "@type": string; // always "ceasn:Competency"
    "ceterms:ctid": string; // Generated ID `ce-${uuidv4()}` e.g. "ce-3ac23770-5d0b-49c7-8dca-f891c2868e37"
    "ceasn:competencyCategory"?: PropertyLanguageMap;
    "ceasn:competencyLabel": PropertyLanguageMap;
    "ceasn:competencyText": PropertyLanguageMap;
    "ceasn:conceptKeyword"?: PropertyLanguageMapPlural;
    "ceterms:inLanguage"?: string[]; // e.g. ["en-us"]
    "ceasn:isPartOf": string; // CompetencyFramework ID e.g. "https://sandbox.credentialengineregistry.org/resources/ce-3e7df7ec-1a9b-4503-9ff3-21256022b515",
    "ceasn:isTopChildOf"?: string; // CompetencyFramework ID e.g. "https://sandbox.credentialengineregistry.org/resources/ce-3e7df7ec-1a9b-4503-9ff3-21256022b515",
    "ceasn:skillEmbodied"?: string[]; // URL ?? OSMT Skill URL e.g. ["https://skills.emsidata.com/skills/KS120S165SXK6CKVK77P"]
    "ceasn:exactAlignment"?: string[]; // Alignment URL... CE sample used the OSMT url here e.g. ["https://staging.osmt.dev/api/skills/3ac23770-5d0b-49c7-8dca-f891c2868e37"
    "ceasn:majorAlignment": string[]; // Alignment URL... of what the CTDL Competency aligns to
}

export interface RegistryCompetencyFrameworkDocument {
    CTID?: string;
    DefaultLanguage: string;
    PublishForOrganizationIdentifier?: string;
    CompetencyFrameworkGraph?: {
        "@context": string;
        "@id": string;
        "@graph": Array<CompetencyFramework | Competency>;
    };
}

/* A set of Competencies organized by an Organization */
export interface RegistryCompetencyLibrary
    extends RegistryCompetencyFrameworkDocument {
    CompetencyMap: {
        [key: string]: Competency;
    };
    connection: {
        apiKey?: string; // Used for request header `Authorization: ApiKey ${apiKey}`
        registryEnv: "sandbox" | "production";
        organizations: Array<{
            "ceterms:ctid": string;
            "ceterms:name": string;
        }>;
    };
    existingCompetencyMap?: {
        [key: string]: Competency;
    };
    existingFramework?: CompetencyFramework;
}

export interface RegistryAssistantSearchResponse {
    data?: {
        "@id": string;
        "ceterms:ctid"?: string;
    }[];
    valid: boolean;
    status: string;
    extra: any;
}

export interface RegistryCompetencyFrameworkGraphResponse {
    "@context": string;
    "@id": string;
    "@graph": Array<CompetencyFrameworkGetResult | Competency>;
}

export interface RegistryFrameworkPublishGraphResponse {
    Successful: boolean;
    Messages: string[];
    CTID: string;
    ResponseDate: string;
    EnvelopeUrl: string;
    GraphUrl: string;
    CredentialFinderUrl: string;
    RegistryEnvelopeIdentifier: string;
    Payload: string;
}
