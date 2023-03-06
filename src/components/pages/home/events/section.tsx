import { TFunction } from "next-i18next";

import { Event } from "@prisma/client";

import pattern from "~/images/pattern.png";

import EventCard from "./card";

type EventsSectionProps = {
  t: TFunction;
  events: Event[];
};

const EventsSection: React.FC<EventsSectionProps> = ({ t, events }) => (
  <section
    id="events"
    className="bg-white bg-repeat-y px-3 py-16 text-black sm:py-20 md:py-28"
    style={{
      backgroundImage: `url(${pattern.src})`,
    }}
  >
    <header className="mb-10">
      <h2 className="text-center font-display text-2xl font-bold uppercase xs:text-3xl sm:text-4xl md:text-5xl">
        {t("eventsSection.title")}
      </h2>
    </header>
    <div className="w-full overflow-x-auto text-center">
      <div className="inline-flex max-w-5xl flex-1 flex-row justify-start gap-4">
        {events.map((event) => (
          <EventCard key={event.id} t={t} event={event} className="flex-1" />
        ))}
      </div>
    </div>
  </section>
);

export default EventsSection;
