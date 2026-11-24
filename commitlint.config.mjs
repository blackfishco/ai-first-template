/**
 * Conventional commits with the ticket as the scope: `feat(bf-123): summary`.
 *
 * The ticket links every commit to the reason for it. Commits that belong to
 * no ticket use one of the fixed scopes below.
 */
const TICKET = /^[a-z]{2,10}-\d+$/;
const FIXED_SCOPES = new Set(["deps", "release", "repo"]);

const commitlintConfig = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "scope-is-ticket": ({ scope }) => [
          typeof scope === "string" &&
            (TICKET.test(scope) || FIXED_SCOPES.has(scope)),
          "the scope must be a ticket such as bf-123, or one of: deps, release, repo",
        ],
      },
    },
  ],
  rules: {
    "scope-empty": [2, "never"],
    "scope-is-ticket": [2, "always"],
  },
};

export default commitlintConfig;
