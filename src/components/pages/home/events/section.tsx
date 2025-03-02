import Link from "next/link";

import { TFunction } from "next-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { useIsAdmin } from "~/hooks/use-role";

import pattern from "~/images/pattern.png";

import EventCard, { SerializedEvent } from "./card";

export type { SerializedEvent };

type EventsSectionProps = {
  t: TFunction;
  events: SerializedEvent[];
};

const EventsSection: React.FC<EventsSectionProps> = ({ t, events }) => {
  const isAdmin = useIsAdmin();

  return (
    <section
      id="events"
      className="bg-white bg-repeat-y px-3 py-16 text-black sm:py-20 md:py-28"
    >
      <header className="mb-10">
        <h2 className="text-center font-display text-2xl font-bold uppercase xs:text-3xl sm:text-4xl md:text-5xl">
          {t("eventsSection.title")}
        </h2>
      </header>
      <div className="w-full overflow-x-auto text-center">
        {events.length > 0 ? (
          <div className="inline-flex max-w-5xl flex-1 flex-row justify-start gap-4 lg:flex-wrap lg:justify-center">
            {events.map((event) => (
              <EventCard
                key={event.id}
                t={t}
                event={event}
                className="flex-1"
              />
            ))}
          </div>
        ) : (
          <p className="text-2xl font-semibold">
            {t("eventsSection.noEvents")}
          </p>
        )}
        {isAdmin && (
          <div className="mx-auto mt-10 flex max-w-md flex-row justify-center">
            <Link href="/admin/events/new" className="admin-button">
              <FontAwesomeIcon
                icon={faPlus}
                className="mr-2 inline-block h-4 w-4"
              />
              Adaugă un nou eveniment
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
