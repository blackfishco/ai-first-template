# Vocabulary

One word for one thing. Use these terms in code, comments, commit messages, tickets, and when talking to the user. Extend the table with the project's own domain terms; the "avoid" column is what keeps the vocabulary from drifting.

| Term | Meaning | Avoid |
| --- | --- | --- |
| **site** | What visitors see: the routes under `app/(frontend)`. | frontend, web, storefront |
| **admin** | The CMS interface at `/admin`. | backoffice, dashboard, Payload UI |
| **CMS** | Payload: the config, collections, and admin together. | backend |
| **visitor** | Someone browsing the site. Has no account. | user, customer, client |
| **editor** | A CMS account that manages content. | user, author |
| **admin (role)** | A CMS account that also manages accounts and settings. Say "an admin" for the person and "the admin" for the interface. | superuser, owner |
| **account** | A document in the `users` collection: a CMS sign-in. | user (when a visitor could be meant) |
| **page** | A document in the `pages` collection, served at `/<slug>`. | article, post, site |
| **block** | One section of a page, chosen by an editor. Config in `payload/blocks`. | component, module, widget |
| **section** | The React component that renders a block. | block (for the component) |
| **slot** | A piece of UI a route passes into a shared component because a feature owns it. | children, injection |
| **slug** | The last part of a page's address, without slashes. | URL, path, handle |
| **path** | A site address without the language prefix, starting with `/`. | URL, route, slug |
| **language** | Czech or English. In code: `locale`. | lang, translation |
| **content locale** | The language a CMS field value is stored in. | translation |
| **messages** | Interface text in `messages/<locale>.json`. | translations, strings, copy |
| **draft** | A saved version that visitors cannot see. | unpublished, hidden |
| **preview** | Seeing a draft on the site as a signed-in editor. | draft mode (for the feature) |
| **migration** | A committed change to the database schema. | schema sync, push |
| **seed** | The script that fills the CMS with demo content. | fixtures, import |
| **deployment** | One built version running on a host. | release, environment |
| **environment** | Production, preview, development, or CI. | stage, instance |
| **feature** | A folder in `features/` that owns one capability end to end. | module, domain |
| **loader** | A `server-only` function that reads content and returns a view type. | fetcher, service, repository |
| **view type** | The small shape a loader returns to the site. | DTO, model, entity |
| **error code** | A stable string a Server Action returns instead of text, translated by the interface. | error message |
