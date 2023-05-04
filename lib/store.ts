import reduxToolkit from "@reduxjs/toolkit";
const { configureStore, createSlice } = reduxToolkit;
import type { PayloadAction } from "@reduxjs/toolkit";
import {
    CompetencyFrameworkGetResult,
    OsmtSkill,
    OsmtSkillDetail,
    SkillMap,
    OsmtSkillLibrary,
    OsmtCollectionDetail,
    OsmtCollectionSummary,
    RegistryCompetencyLibrary,
    Competency,
} from "./types.js";

const initialOsmtSkills: OsmtSkillLibrary = {
    skillMap: {},
    collectionMap: {},
};
const osmtSkills = createSlice({
    name: "osmtSkills",
    initialState: initialOsmtSkills,
    reducers: {
        setOsmtDomain: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                domain: action.payload,
            };
        },
        upsertOsmtSkill: (state, action: PayloadAction<OsmtSkill>) => {
            const { id } = action.payload;
            return {
                ...state,
                skillMap: {
                    ...state.skillMap,
                    id: action.payload,
                },
            };
        },
        upsertManyOsmtSkills: (state, action: PayloadAction<OsmtSkill[]>) => {
            return action.payload.reduce((acc, skill) => {
                acc.skillMap[skill.id] = skill;
                return acc;
            }, state);
        },
        replaceOsmtLibrary: (state, action: PayloadAction<OsmtSkill[]>) => {
            return {
                ...state,
                skillMap: action.payload.reduce((acc: SkillMap, skill) => {
                    acc[skill.id] = skill;
                    return acc;
                }, {}),
            };
        },
        deleteOsmtSkill: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            return {
                ...state,
                skillMap: Object.fromEntries(
                    Object.entries(state.skillMap).filter(
                        ([key, value]) => key !== id
                    )
                ),
            };
        },
    },
});
export const {
    upsertOsmtSkill,
    upsertManyOsmtSkills,
    deleteOsmtSkill,
    replaceOsmtLibrary,
    setOsmtDomain,
} = osmtSkills.actions;

const initialRegistrySkills: RegistryCompetencyLibrary = {
    CompetencyMap: {},
    DefaultLanguage: "en-us",
    connection: {
        registryEnv: "sandbox",
        organizations: [],
    },
};

const registryLibrary = createSlice({
    name: "registryLibrary",
    initialState: initialRegistrySkills,
    reducers: {
        setApiKey: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                connection: {
                    ...state.connection,
                    apiKey: action.payload,
                },
            };
        },
        setRegistryEnv: (
            state,
            action: PayloadAction<"sandbox" | "production">
        ) => {
            return {
                ...state,
                connection: {
                    ...state.connection,
                    registryEnv: action.payload,
                },
            };
        },
        setCompetency: (state, action: PayloadAction<Competency>) => {
            return {
                ...state,
                CompetencyMap: {
                    ...state.CompetencyMap,
                    [action.payload["ceterms:ctid"]]: action.payload,
                },
            };
        },
        setRegistryOrgCtid: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                PublishForOrganizationIdentifier: action.payload,
            };
        },
        setFrameworkCtid: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                CTID: action.payload,
            };
        },
        setExistingFramework: (
            state,
            action: PayloadAction<CompetencyFrameworkGetResult>
        ) => {
            return {
                ...state,
                existingFramework: action.payload,
            };
        },
        setExistingCompetencies: (
            state,
            action: PayloadAction<Competency[]>
        ) => {
            return {
                ...state,
                existingCompetencyMap: action.payload.reduce(
                    (acc: { [key: string]: Competency }, comp) => {
                        acc[comp["ceterms:ctid"]] = comp;
                        return acc;
                    },
                    {}
                ),
            };
        },
    },
});
export const {
    setApiKey,
    setCompetency,
    setFrameworkCtid,
    setExistingFramework,
    setExistingCompetencies,
    setRegistryEnv,
    setRegistryOrgCtid,
} = registryLibrary.actions;

export const store = configureStore({
    reducer: {
        osmtSkills: osmtSkills.reducer,
        registryLibrary: registryLibrary.reducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
