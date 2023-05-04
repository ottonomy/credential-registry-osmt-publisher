#! /usr/bin/env node
import inquirer from "inquirer";
import { fetchOsmtSkills, upfixOneOsmtSkill } from "./index.js";
import {
    store,
    setRegistryEnv,
    setApiKey,
    RootState,
    setRegistryOrgCtid,
    setCompetency,
} from "./store.js";
import {
    mapOsmtSkillToCtdl,
    getOrgData,
    findExistingCompetencyBySkillId,
    publishFramework,
} from "./registry.js";
import { OsmtSkillDetail } from "./types.js";

const configureRegistry = async () => {
    const userChoices = await inquirer.prompt([
        {
            type: "list",
            name: "registryEnv",
            message:
                "Which Credential Registry environment would you like to use?",
            choices: [
                {
                    name: "Credential Registry",
                    value: "production",
                    short: "credentialengineregistry.org (production)",
                },
                {
                    name: "Sandbox (for testing)",
                    value: "sandbox",
                    short: "sandbox.credentialengineregistry.org (sandbox)",
                },
            ],
        },
        {
            type: "input",
            name: "orgCtid",
            message: "What is your Organization's CTID?",
            validate: (input) => {
                if (
                    input.length !=
                    "ce-11111111-aaaa-bbbb-cccc-000000000000".length
                ) {
                    return "Please check your CTID and try again. Values are expected to be based on UUIDs.";
                }
                return true;
            },
        },
        {
            type: "input",
            name: "apiKey",
            message: "What is your Organization's Credential Registry API key?",
            validate: (input) => {
                if (
                    input.length !=
                    "11111111-aaaa-bbbb-cccc-000000000000".length
                ) {
                    return "Please check your API key and try again. Values are expected to be UUIDs.";
                }
                return true;
            },
        },
    ]);
    store.dispatch(setRegistryEnv(userChoices.registryEnv));
    store.dispatch(setApiKey(userChoices.apiKey));
    store.dispatch(setRegistryOrgCtid(userChoices.orgCtid));

    console.log("Registry configured successfully. Testing connection...");
    await getOrgData();

    return;
};

const reconcileSkills = async () => {
    console.log("Converting OSMT skills to Registry input format...");
    const state: RootState = store.getState();
    const osmtSkillKeys = Object.keys(state.osmtSkills.skillMap);
    osmtSkillKeys.map((key) => {
        const competency = mapOsmtSkillToCtdl(
            state.osmtSkills.skillMap[key] as OsmtSkillDetail,
            state,
            findExistingCompetencyBySkillId(key, state)
        );
        store.dispatch(setCompetency(competency));
    });
};

const main = async () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "osmtDomain",
                message:
                    "What is the domain of your OSMT instance? (e.g. `osmt.example.com')",
                validate: fetchOsmtSkills,
            },
        ])
        .then(async (answers) => {
            console.log("Domain validated successfully.");
            console.log(
                `${
                    Object.keys(store.getState().osmtSkills.skillMap).length
                } skills loaded from OSMT instance at ${answers.osmtDomain}`
            );

            await configureRegistry();

            let state: RootState = store.getState();
            // fetch all osmt skills detail
            const osmtSkillKeys = Object.keys(state.osmtSkills.skillMap);

            const upfixPromises = osmtSkillKeys.map((key) => {
                // Space requests out randomly at ~20 requests per second.
                const randomDelay = Math.round(
                    (Math.random() * 1000 * osmtSkillKeys.length) / 20
                );
                return upfixOneOsmtSkill(
                    state.osmtSkills.skillMap[key],
                    state,
                    randomDelay
                );
            });
            Promise.all(upfixPromises).then(async (values) => {
                // Next, map all osmt skills to CTDL, reconciling with existing CTIDs.
                await reconcileSkills();

                await publishFramework();
            });
        })
        .catch((err) => {
            console.log(err.message);
        });
};

main();
