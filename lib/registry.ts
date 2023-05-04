import fetch from "node-fetch";
import { randomUUID } from "crypto";

import {
    store,
    setFrameworkCtid,
    setExistingCompetencies,
    setExistingFramework,
    RootState,
} from "./store.js";
import type {
    Competency,
    CompetencyFramework,
    CompetencyFrameworkGetResult,
    OsmtSkill,
    OsmtSkillDetail,
    PropertyLanguageMap,
    PropertyLanguageMapPlural,
    RegistryAssistantSearchResponse,
    RegistryCompetencyFrameworkGraphResponse,
    RegistryFrameworkPublishGraphResponse,
} from "./types.js";

const ENV_LIST = {
    production: {
        assistant: "https://credentialengine.org/assistant",
        registry: "https://credentialengineregistry.org",
    },
    sandbox: {
        assistant: "https://sandbox.credentialengine.org/assistant",
        registry: "https://sandbox.credentialengineregistry.org",
    },
};

export const getOrgData = async () => {
    const state = store.getState();
    const ctid = state.registryLibrary.PublishForOrganizationIdentifier;
    const env = ENV_LIST[state.registryLibrary.connection.registryEnv];
    const req = await fetch(`${env.registry}/resources/${ctid}`, {
        headers: {
            Accept: "application/json",
        },
    });
    if (!req.ok) {
        throw new Error(
            `Failed to fetch organization data from ${env.registry}/resources/${ctid}`
        );
    }
    const orgData = await req.json();
    console.log("Basic org data loaded from Registry...");

    const frameworksReq = await fetch(`${env.assistant}/search/ctdl`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `ApiToken ${state.registryLibrary.connection.apiKey}`,
        },
        body: JSON.stringify({
            Query: {
                "@type": ["ceasn:CompetencyFramework"],
                "ceasn:publisher": `${env.registry}/resources/${ctid}`,
                "ceasn:name": "OSMT Open Skills Library",
            },
            Take: 100,
            Skip: 0,
        }),
    });
    if (!req.ok) {
        throw new Error(
            `Failed to fetch framework data from ${env.assistant}/search/ctdl`
        );
    }
    console.log("CompetencyFramework search request successful...");
    const frameworkListData =
        (await frameworksReq.json()) as RegistryAssistantSearchResponse;
    if (
        frameworkListData?.data?.length &&
        frameworkListData.data[0]["ceterms:ctid"]
    ) {
        const frameworkCtid = frameworkListData.data[0]["ceterms:ctid"];
        store.dispatch(setFrameworkCtid(frameworkCtid));
        console.log(
            `A previously created CompetencyFramework was found and will be updated. ${frameworkCtid}.`
        );

        const frameworkDetailReq = await fetch(
            `${env.registry}/graph/${frameworkCtid}`,
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );
        if (!frameworkDetailReq.ok) {
            throw new Error(
                `Failed to fetch framework and included competency data from ${env.registry}/graph/${frameworkCtid}`
            );
        }
        const frameworkDetailData =
            (await frameworkDetailReq.json()) as RegistryCompetencyFrameworkGraphResponse;

        const frameworkItself = frameworkDetailData["@graph"].find(
            (item) => item["@type"] === "ceasn:CompetencyFramework"
        ) as CompetencyFrameworkGetResult;
        store.dispatch(setExistingFramework(frameworkItself));

        const competencies = frameworkDetailData["@graph"].filter(
            (item) => item["@type"] === "ceasn:Competency"
        ) as Competency[];
        store.dispatch(setExistingCompetencies(competencies));
    } else {
        console.log(
            "No existing CompetencyFramework found on the Registry. A new one will be created."
        );
        store.dispatch(setFrameworkCtid(`ce-${randomUUID()}`));
    }
};

const _lang = (language: string, value: string): PropertyLanguageMap => {
    return { [language]: value };
};
const _langPlural = (
    language: string,
    values: string[]
): PropertyLanguageMapPlural => {
    return { [language]: values };
};

export const mapOsmtSkillToCtdl = (
    skill: OsmtSkillDetail,
    state: RootState,
    existingCompetency?: Competency
): Competency => {
    const env = ENV_LIST[state.registryLibrary.connection.registryEnv];
    const lang = state.registryLibrary.DefaultLanguage;
    const competencyFrameworkId = `${env.registry}/resources/${state.registryLibrary.CTID}`;
    const uuid = existingCompetency?.["ceterms:ctid"] ?? `ce-${randomUUID()}`;
    let competency: Competency = {
        ...(existingCompetency ?? {
            "@type": "ceasn:Competency",
        }),
        "@id": `${env.registry}/resources/${uuid}`,
        "ceterms:ctid": uuid,
        "ceasn:competencyLabel": _lang(lang, skill.skillName),
        "ceasn:competencyText": _lang(lang, skill.skillStatement),
        "ceasn:conceptKeyword": _langPlural(lang, skill.keywords ?? []),
        "ceasn:competencyCategory": _lang(
            lang,
            skill.categories?.join(", ") ?? ""
        ),
        "ceterms:inLanguage": [lang],
        "ceasn:isPartOf": competencyFrameworkId,
        "ceasn:skillEmbodied": [skill.id],
        "ceasn:exactAlignment": [skill.id], // Alignment URL... CE sample used the OSMT url here e.g. ["https://staging.osmt.dev/api/skills/3ac23770-5d0b-49c7-8dca-f891c2868e37"
        "ceasn:majorAlignment": skill.alignments?.map((aa) => aa.id), // Alignment URL... of what the CTDL Competency aligns to
    };
    return competency;
};

export const findExistingCompetencyBySkillId = (
    skillId: string,
    state: RootState
): Competency | undefined => {
    return Object.values(
        state.registryLibrary.existingCompetencyMap ?? {}
    ).find((c) => c["ceasn:skillEmbodied"]?.includes(skillId));
};

export const publishFramework = async () => {
    const state: RootState = store.getState();
    const env = ENV_LIST[state.registryLibrary.connection.registryEnv];
    const lang = state.registryLibrary.DefaultLanguage;
    const frameworkCtid = state.registryLibrary.CTID as string;

    const frameworkDocument: CompetencyFramework = {
        "@id": `${env.registry}/resources/${frameworkCtid}`,
        "ceterms:ctid": frameworkCtid,
        "@type": "ceasn:CompetencyFramework",
        "ceasn:name": _lang("en-us", "OSMT Open Skills Library"),
        "ceasn:description": _lang(
            "en-us",
            `Open Skills published via the Open Skills Management Toolset at ${state.osmtSkills.domain}.`
        ),
        "ceasn:inLanguage": [lang],
        "ceasn:publisher": [
            `${env.registry}/resources/${state.registryLibrary.PublishForOrganizationIdentifier}`,
        ],
        "ceasn:hasTopChild": Object.values(
            state.registryLibrary.CompetencyMap ?? {}
        ).map((e) => e["@id"]),
    };
    const competencies = Object.values(
        state.registryLibrary.CompetencyMap ?? {}
    );
    const graphUrl = `${env.registry}/graph/${frameworkCtid}`;
    const graphDocument = {
        CTID: frameworkCtid,
        PublishForOrganizationIdentifier:
            state.registryLibrary.PublishForOrganizationIdentifier,
        CompetencyFrameworkGraph: {
            "@context": "https://credreg.net/ctdlasn/schema/context/json",
            "@id": graphUrl,
            "@graph": [frameworkDocument, ...competencies],
        },
    };
    console.log(JSON.stringify(graphDocument, null, 2));

    console.log(`Publishing competency framework... ${graphUrl}`);
    const publishReq = await fetch(
        `${env.assistant}/competencyframework/publishgraph`,
        {
            method: "POST",
            headers: {
                Authorization: `ApiToken ${state.registryLibrary.connection.apiKey}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(graphDocument),
        }
    );
    if (!publishReq.ok) {
        throw new Error(
            `Failed to publish framework to ${env.assistant}/competencyframework/publishgraph`
        );
    }

    const publishedData =
        (await publishReq.json()) as RegistryFrameworkPublishGraphResponse;
    if (publishedData?.Successful === true) {
        console.log("CompetencyFramework publish request successful...");
        console.log(publishedData?.GraphUrl);
    } else {
        console.log(publishedData);
    }
};
