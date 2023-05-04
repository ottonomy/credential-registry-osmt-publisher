# Credential Registry OSMT Publisher

Publish your library of skills from your OSMT server or collection to the
Credential Registry.

-   OSMT publishes your organization's **Rich Skill Descriptors** (RSDs) using
    the CTDL and CTDL-ASN open data vocabularies.
-   The Credential Registry is a directory of organizations and of the
    credentials, competencies, frameworks, and pathways that they publish. The
    Registry is a service of Credential Engine, a non-profit organization
    dedicated to promoting transparency and credential literacy in the
    marketplace. Credential Engine is also the author of the CTDL and CTDL-ASN
    vocabularies.

This project provides a CLI to publish the published skills from an OSMT server
or collection to the Credential Registry. It supports an initial publication of
skills and update of the same skills to the registry.

If a user manually updates some data in the Registry website and then publishes
an update with this CLI, some of the manual changes may be overwritten.

## Installation

-   Clone this repository
    `git clone git@github.com:ottonomy/credential-registry-osmt-publisher.git`
-   Navigate to the installed directory and run `npm install`

TODO improvement: publish to NPM and enable this to be installable as a global
package that makes a CLI command available.

## Operation

Prepare for publication:

-   Ensure you have signed up for a Credential Engine Publisher account and log
    in. Go to your publisher
    [Dashboard](https://sandbox.credentialengine.org/accounts/Dashboard)
-   Find the Organization you want to publish data to. If the Organization
    record does not yet exist, create it, and approve it for publication. You
    may need to wait for approval from Credential Engine.
-   Locate the Organization "CTID" and the API Key. You will paste these into
    the CLI when prompted.

Run the command: `npm run cli`, and a series of prompts will guide you through
the process.

```
> credential-engine-osmt-publisher
? Enter your OSMT server URL:
```

The steps are:

-   Enter your OSMT server URL. This is the URL of the OSMT server you want to
    publish from. For example, `osmt.example.com`
-   OSMT availability is validated, and data is loaded from OSMT
-   Select Credential Registry environment (Production or sandbox). This matches
    the
-   Enter your Registry Organization CTID (from
    [Dashboard](https://sandbox.credentialengine.org/accounts/Dashboard))
-   Enter your Registry API Key (from
    [Dashboard](https://sandbox.credentialengine.org/accounts/Dashboard))
-   Registry connection is validated, and existing data is loaded from the
    Registry.
-   Summary of data to be published is shown. You can choose to publish or
    cancel.
-   Data is published to the Registry. If the data already exists, it is
    updated.
-   Summary of published data is shown.

# Project Notes and TODOs

-   [ ] Add a `--dry-run` option to preview the changes that will be made to the
        registry.
-   [ ] Implement schema checking of the OSMT data as part of server URL
        validation. Report relevant error messages.
-   Registry Connection:
    -   [ ] Prompt for API key
    -   [ ] Get org list with API key
-   OSMT Connection:
    -   [ ] Prompt for server URL
    -   [ ] Validate server URL: proper error messages for invalid URLs, server
            misconfiguration, etc.
-   Skills
    -   [ ] Paginate OSMT API requests to get all skills.
    -   [ ] MAYBE: get each individual skill in JSON-LD
-   Previewing
    -   [ ] Show a preview of the data that will be published to the registry.
    -   [ ] Save CompetencyFramework graph
-   Collections:
    -   [ ] Get collection list and each collection detail from OSMT server.
    -   [ ] generate index of collections like
            https://credreg.net/registry/assistant#publishcollection with
            `"ProxyFor"`
    -   [ ] Push collections to registry also

### OSMT APIs

`GET /api/skills` => Array<RSD> `GET /api/collections` => Array<Collection>
`GET /api/collections/:id` => Collection

Pagination is handled through request query params and response headers. For
example, a response might include the following headers. Query params control
page size and sort order. The most common case here will just be to grab
`rel=next` links from the Link header until you have paged through the entire
result set.

```
X-Total-Count: 111
Link: <http://localhost:8080/api/skills?size=50&sort&status=draft,published&from=50>; rel="next"
A Link header showing both a "prev" and a "next" page:
Link: <http://localhost:8080/api/skills?size=50&sort=&status=draft,published&from=100>; rel="next",<http://localhost:8080/api/skills?size=50&sort=&status=draft,published&from=0>; rel="prev"
```

### Registry APIs

Documentation

-   [Overview](https://credreg.net/registry/assistant#overview)
-   [Collections](https://credreg.net/registry/assistant#publishcollection)

### JSON-LD graph endpoint

-   The endpoint is
    `POST https://sandbox.credentialengine.org/assistant/competencyframework/publishgraph`
    for example for the `https://sandbox.credentialengine.org/assistant` CE
    environment
-   Authentication header is `Authorization: ApiToken MYTOKEN`

Here is an example request body (for a graph of 1 `CompetencyFramework`
containing 2 `Competency` records).

```jsonc
{
    "CTID": "ce-3e7df7ec-1a9b-4503-9ff3-21256022b515", // CTID of the CompetencyFramework (auto-generated initially)
    "PublishForOrganizationIdentifier": "ce-9d30f846-dfa4-4b1c-90fa-9d01238a86ac", // Organization CTID (obtain from API from org list with API key)
    "CompetencyFrameworkGraph": {
        "@context": "https://credreg.net/ctdlasn/schema/context/json",
        "@id": "https://sandbox.credentialengineregistry.org/graph/ce-3e7df7ec-1a9b-4503-9ff3-21256022b515", // Graph URL, this is the graph I'm posting. I can get the graph from this URL too.
        "@graph": [
            {
                "@id": "https://sandbox.credentialengineregistry.org/resources/ce-3e7df7ec-1a9b-4503-9ff3-21256022b515", // Resource URL for the framework itself. Auto-generate CTID then put it into this format for the registry env.
                "@type": "ceasn:CompetencyFramework",
                "ceasn:creator": [
                    "https://sandbox.credentialengineregistry.org/resources/ce-9d30f846-dfa4-4b1c-90fa-9d01238a86ac"
                ],
                "ceasn:dateCreated": "2021-02-11",
                "ceasn:dateModified": "2021-02-18T21:08:58.01Z",
                "ceasn:description": {
                    "en-us": "This is a collection of skills needed for numerous cybersecurity jobs."
                },
                "ceasn:hasTopChild": [
                    "https://sandbox.credentialengineregistry.org/resources/ce-3ac23770-5d0b-49c7-8dca-f891c2868e37", // Top-level competency, first in the list
                    "https://sandbox.credentialengineregistry.org/resources/ce-1b0eeb3f-e8bc-4e0f-8c55-0bcd56905ef2"
                ],
                "ceasn:inLanguage": ["en"],
                "ceasn:name": {
                    "en-us": "Cybersecurity Collection"
                },
                "ceasn:publisher": [
                    "https://sandbox.credentialengineregistry.org/resources/ce-9d30f846-dfa4-4b1c-90fa-9d01238a86ac"
                ],
                "ceasn:publisherName": {
                    "en-us": ["Western Governors University"]
                },
                "ceterms:ctid": "ce-3e7df7ec-1a9b-4503-9ff3-21256022b515",
                "socList": [
                    "11-3021.00",
                    "15-1121.00",
                    "15-1121.01",
                    "15-1122.00",
                    "15-1141.00",
                    "15-1142.00",
                    "15-1143.00",
                    "15-1143.01"
                ]
            },
            {
                "@id": "https://sandbox.credentialengineregistry.org/resources/ce-3ac23770-5d0b-49c7-8dca-f891c2868e37", // First referenced competency in CompetencyFramework["ceasn:hasTopChild"]
                "@type": "ceasn:Competency",
                "ceasn:competencyCategory": {
                    "en-us": "Authentications"
                },
                "ceasn:competencyLabel": {
                    "en-us": "Access Creation"
                },
                "ceasn:competencyText": {
                    "en-us": "Create group and system authentication access."
                },
                "ceasn:conceptKeyword": {
                    "en-us": [
                        "Authentications",
                        "Authorization (Computing)",
                        "Authentication",
                        "SafeNet"
                    ]
                },
                "ceasn:isPartOf": "https://sandbox.credentialengineregistry.org/resources/ce-3e7df7ec-1a9b-4503-9ff3-21256022b515",
                "ceasn:isTopChildOf": "https://sandbox.credentialengineregistry.org/resources/ce-3e7df7ec-1a9b-4503-9ff3-21256022b515",
                "ceasn:skillEmbodied": [
                    "https://skills.emsidata.com/skills/KS120S165SXK6CKVK77P"
                ],
                "ceterms:ctid": "ce-3ac23770-5d0b-49c7-8dca-f891c2868e37",
                "ceasn:exactAlignment": [
                    "https://staging.osmt.dev/api/skills/3ac23770-5d0b-49c7-8dca-f891c2868e37"
                ]
            }
        ]
    },
    "DefaultLanguage": "en-US"
}
```

### Future improvements

-   Add mappings for occupations
-   Publish collections mirroring OSMT collections as well
