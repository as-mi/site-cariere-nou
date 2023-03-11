import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import {
  faAddressCard,
  faBuilding,
  faCalendar,
  faFile,
  faGear,
  faHouse,
  faImage,
  faListCheck,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export type LinkData = {
  href: string;
  icon: IconDefinition;
  label: string;
};

export const links: LinkData[] = [
  {
    href: "/admin",
    icon: faHouse,
    label: "Acasă",
  },
  {
    href: "/admin/events",
    icon: faCalendar,
    label: "Evenimente",
  },
  {
    href: "/admin/users",
    icon: faUser,
    label: "Utilizatori",
  },
  {
    href: "/admin/images",
    icon: faImage,
    label: "Imagini",
  },
  {
    href: "/admin/companies",
    icon: faBuilding,
    label: "Companii",
  },
  {
    href: "/admin/positions",
    icon: faAddressCard,
    label: "Posturi",
  },
  {
    href: "/admin/technical-tests",
    icon: faListCheck,
    label: "Teste tehnice",
  },
  {
    href: "/admin/resumes",
    icon: faFile,
    label: "CV-uri",
  },
  {
    href: "/admin/settings",
    icon: faGear,
    label: "Setări",
  },
];
