import fetch from "node-fetch";
import isValidDomain from "is-valid-domain";
import parseLinkHeader from "parse-link-header";

import {
    store,
    replaceOsmtLibrary,
    upsertOsmtSkill,
    RootState,
    setOsmtDomain,
} from "./store.js";
import type { OsmtSkill, OsmtSkillDetail } from "./types.js";

/* Fetch JSON from the skill id endpoint and upsert the skill into the store */
export const upfixOneOsmtSkill = (
    skill: OsmtSkill,
    state: RootState,
    delay = 0
): Promise<boolean> => {
    // After patiently waiting for a delay if necessary, fetch the skill and upsert
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const url = `http://${state.osmtSkills.domain}/api/skills/${skill.uuid}`;
            console.log(`Fetching skill from ${url}`);
            const res = await fetch(url, {
                headers: { Accept: "application/json" },
            });
            if (!res.ok) {
                throw new Error(
                    `Failed to fetch skill ${skill.id} from ${url}`
                );
            }
            const data = (await res.json()) as OsmtSkillDetail;
            store.dispatch(upsertOsmtSkill(data));

            resolve(true);
        }, delay);
    });
};

const _fixupOsmtSkill = (skill: OsmtSkill): OsmtSkill => {
    // There remains a persistent OSMT bug that in dev environments causes the skill id to be prefixed with a dash
    return {
        ...skill,
        id: skill.id.startsWith("-") ? skill.id.substring(1) : skill.id,
    };
};

export const fetchOsmtSkills = async (
    domain: string
): Promise<boolean | string> => {
    if (domain != "localhost:8080" && !isValidDomain(domain)) {
        return `This domain appears to be invalid. Double-check that https://${domain}/api/skills is a valid URL.`;
    }
    const firstUrl = new URL(`http://${domain}/api/skills`).href;
    let fetchedSkills: OsmtSkill[] = [];

    const fetchPage = async (url: string): Promise<void> => {
        const res = await fetch(url, {
            headers: { Accept: "application/json" },
        });
        if (res.status !== 200) {
            throw new Error(
                `Did not get expected response from ${url}. Double-check that this is the right URL and it is correctly returning skills data.`
            );
        }
        const skills = (await res.json()) as OsmtSkill[];
        fetchedSkills = fetchedSkills.concat(skills);

        const linkHeader = res.headers.get("Link");
        if (linkHeader) {
            const parsed = parseLinkHeader(linkHeader);
            if (parsed && parsed.next) {
                return await fetchPage(parsed.next.url);
            }
        }
        return;
    };
    try {
        await fetchPage(firstUrl);
    } catch (err) {
        if (err instanceof Error) return err?.message;
    }
    store.dispatch(setOsmtDomain(domain));
    store.dispatch(
        replaceOsmtLibrary(fetchedSkills.map((s) => _fixupOsmtSkill(s)))
    );
    return true;
};
