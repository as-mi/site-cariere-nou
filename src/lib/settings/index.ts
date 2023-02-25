import _ from "lodash";
import { z } from "zod";

export const SETTINGS = {
  showComingSoonMessage: {
    key: "showComingSoonMessage",
    label: `Afișează mesajul de „În curând” pe prima pagină`,
    hint: `Pe prima pagină se va afișa un mesaj că proiectul va avea loc „În curând” și va fi ascunsă lista cu companiile.`,
    schema: z.boolean().default(true),
  },
  alwaysShowCompaniesForAdmin: {
    key: "alwaysShowCompaniesForAdmin",
    label: `Afișează companiile pentru admin chiar dacă sunt ascunse pentru participanți`,
    schema: z.boolean().default(true),
  },
  showProfileLink: {
    key: "showProfileLink",
    label: `Afișează link-ul către „Contul meu” în bara de navigare de pe prima pagină`,
    hint: `Pagina va fi în continuare accesibilă de către cei care navighează direct pe ea, iar utilizatorii autentificați vor vedea în continuare link-ul.`,
    schema: z
      .boolean()
      .default(
        process.env.CARIERE_SHOW_PROFILE_LINK
          ? !!process.env.CARIERE_SHOW_PROFILE_LINK
          : false
      ),
  },
  enableSocialLogin: {
    key: "enableSocialLogin",
    label: `Permite autentificarea prin conturile de rețele sociale`,
    schema: z.boolean().default(false),
  },
  registrationEnabled: {
    key: "registrationEnabled",
    label: `Permite-le utilizatorilor să-și creeze/înregistreze noi conturi (cu oricare dintre metodele de autentificare active)`,
    schema: z
      .boolean()
      .default(
        process.env.CARIERE_REGISTRATION_ENABLED
          ? !!process.env.CARIERE_REGISTRATION_ENABLED
          : false
      ),
  },
  showEvents: {
    key: "showEvents",
    label: `Afișează secțiunea cu evenimentele pe prima pagină`,
    schema: z.boolean().default(false),
  },
  alwaysShowEventsForAdmin: {
    key: "alwaysShowEventsForAdmin",
    label: `Afișează evenimentele pentru admin chiar dacă este ascunsă pentru ceilalți utilizatori`,
    schema: z.boolean().default(true),
  },
  showAvailablePositions: {
    key: "showAvailablePositions",
    label: `Afișează posturile disponibile pe paginile companiilor`,
    schema: z.boolean().default(false),
  },
  alwaysShowAvailablePositionsForAdmin: {
    key: "alwaysShowAvailablePositionsForAdmin",
    label: `Afișează posturile disponibile pentru admin chiar dacă sunt ascunse pentru participanți`,
    schema: z.boolean().default(true),
  },
} as const;

export type Settings = typeof SETTINGS;
export type SettingKey = keyof Settings;
export type Setting = {
  key: string;
  env?: string;
  label: string;
  hint?: string;
  schema: z.Schema;
};
export type KnownSetting<K extends SettingKey> = Settings[K];
export type SettingSchema<K extends SettingKey> = KnownSetting<K>["schema"];
export type SettingValueType<K extends SettingKey> = z.infer<SettingSchema<K>>;
