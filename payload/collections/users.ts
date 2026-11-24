import { randomBytes } from "node:crypto";

import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from "payload";

import { loadServerEnv } from "../../lib/env-schema";
import type { User } from "../../payload-types";
import {
  adminOrSelf,
  hasRole,
  isAdmin,
  isAdminField,
  USER_ROLES,
  type UserRole,
} from "../access/roles";

export const PASSWORD_MIN_LENGTH = 12;

const LINK_VALID_HOURS = 48;
const LINK_VALID_MS = LINK_VALID_HOURS * 60 * 60 * 1000;
const INVITE_TOKEN = "inviteToken";

// Same validation as lib/env.ts; the Payload CLI loads this file too.
const httpsSite = loadServerEnv(process.env).SITE_URL.startsWith("https:");

const ROLE_LABELS = {
  admin: { cs: "Administrátor", en: "Admin" },
  editor: { cs: "Editor", en: "Editor" },
} satisfies Record<UserRole, { cs: string; en: string }>;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** E-mail with the link to set a password; used for invitations and password resets. */
export function passwordEmailHtml(token: string, siteUrl: string): string {
  const link = escapeHtml(
    `${siteUrl}/admin/reset/${encodeURIComponent(token)}`,
  );
  return [
    "<p>Dobrý den,</p>",
    "<p>pro přístup do administrace webu si nastavte heslo:</p>",
    `<p><a href="${link}">Nastavit heslo</a></p>`,
    `<p>Odkaz platí ${LINK_VALID_HOURS} hodin. Pokud jste o přístup nežádali, e-mail můžete ignorovat.</p>`,
  ].join("\n");
}

/** Password policy: at least `PASSWORD_MIN_LENGTH` characters. Empty means unchanged. */
export function validatePassword(value: unknown): true | string {
  if (
    typeof value === "string" &&
    value.length > 0 &&
    value.length < PASSWORD_MIN_LENGTH
  ) {
    return `Heslo musí mít alespoň ${PASSWORD_MIN_LENGTH} znaků.`;
  }
  return true;
}

/** The first account, created on Payload's "create first user" screen, becomes an admin. */
const firstUserIsAdmin: CollectionBeforeChangeHook<User> = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== "create") return data;
  const existing = await req.payload.count({ collection: "users", req });
  return existing.totalDocs === 0 ? { ...data, role: "admin" } : data;
};

/**
 * Invitation: an admin creates an account without choosing a password, and the
 * new user receives a link to set their own. The token is written in the same
 * operation because Payload's `forgotPassword` cannot see an uncommitted user.
 */
const prepareInvitation: CollectionBeforeChangeHook<User> = ({
  data,
  operation,
  req,
}) => {
  if (operation !== "create" || !hasRole(req.user, "admin")) return data;
  if (data.sendInvite === false) return data;

  const token = randomBytes(20).toString("hex");
  req.context[INVITE_TOKEN] = token;
  return {
    ...data,
    // Nobody learns this password; the invited user replaces it through the link.
    password: data.password ?? randomBytes(24).toString("base64url"),
    resetPasswordToken: token,
    resetPasswordExpiration: new Date(Date.now() + LINK_VALID_MS).toISOString(),
  };
};

const sendInvitation: CollectionAfterChangeHook<User> = async ({
  doc,
  operation,
  req,
}) => {
  const token = req.context[INVITE_TOKEN];
  if (operation !== "create" || typeof token !== "string") return doc;

  // One token per created user; never reuse it for another create on the same request.
  delete req.context[INVITE_TOKEN];

  // Without an e-mail adapter Payload writes the message to the server log.
  await req.payload.sendEmail({
    to: doc.email,
    subject: PASSWORD_EMAIL_SUBJECT,
    html: passwordEmailHtml(token, req.payload.config.serverURL),
  });
  return doc;
};

const PASSWORD_EMAIL_SUBJECT = "Nastavení hesla do administrace webu";

/**
 * Accounts that sign in to the CMS admin. Site visitors are not users of this
 * collection; see docs/architecture.md before adding end-user accounts.
 */
export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: { cs: "Uživatel", en: "User" },
    plural: { cs: "Uživatelé", en: "Users" },
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "role"],
    // Editors reach their own account from the account menu, not the navigation.
    hidden: ({ user }) => !hasRole(user, "admin"),
  },
  auth: {
    // Five wrong passwords in a row lock the account for ten minutes.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // The session cookie travels only over HTTPS when the site runs on HTTPS.
    cookies: { secure: httpsSite, sameSite: "Lax" },
    forgotPassword: {
      expiration: LINK_VALID_MS,
      generateEmailSubject: () => PASSWORD_EMAIL_SUBJECT,
      generateEmailHTML: (args) =>
        passwordEmailHtml(
          args?.token ?? "",
          args?.req?.payload.config.serverURL ?? "",
        ),
    },
  },
  access: {
    admin: ({ req }) => hasRole(req.user, "admin", "editor"),
    read: adminOrSelf,
    create: isAdmin,
    update: adminOrSelf,
    delete: isAdmin,
    unlock: isAdmin,
  },
  hooks: {
    beforeChange: [firstUserIsAdmin, prepareInvitation],
    afterChange: [sendInvitation],
  },
  fields: [
    // Overrides the auth password field so the policy also applies when a
    // password is set through an invitation or reset link.
    {
      name: "password",
      type: "text",
      virtual: true,
      hidden: true,
      validate: validatePassword,
    },
    {
      name: "name",
      label: { cs: "Jméno", en: "Name" },
      type: "text",
    },
    {
      name: "role",
      label: { cs: "Role", en: "Role" },
      type: "select",
      required: true,
      // Only the first-user screen creates an account without a signed-in user.
      defaultValue: ({ user }: { user?: unknown }) =>
        user ? "editor" : "admin",
      saveToJWT: true,
      options: USER_ROLES.map((role) => ({
        label: ROLE_LABELS[role],
        value: role,
      })),
      access: { create: isAdminField, update: isAdminField },
      admin: {
        description: {
          cs: "Editor spravuje obsah. Administrátor navíc uživatele a nastavení.",
          en: "Editors manage content. Admins also manage users and settings.",
        },
      },
    },
    {
      name: "sendInvite",
      label: {
        cs: "Poslat pozvánku s odkazem na nastavení hesla",
        en: "Send an invitation with a link to set a password",
      },
      type: "checkbox",
      virtual: true,
      defaultValue: true,
      access: { read: () => false, update: () => false },
      admin: {
        condition: (_data, _siblingData, { operation, user }) =>
          operation === "create" && hasRole(user, "admin"),
      },
    },
  ],
};
