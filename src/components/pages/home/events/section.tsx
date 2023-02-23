import Image from "next/image";

import { TFunction } from "next-i18next";

import pattern from "~/images/pattern.png";
import EventCard from "./card";

type EventsSectionProps = {
  t: TFunction;
};

type Event = {
  id: number;
  name: string;
  type: string;
  location: string;
  date: string;
  startTime?: string;
  timeInterval?: string;
  facebookEventUrl?: string;
};

// TODO: read these from the database, instead of hardcoding them
const events: Event[] = [
  {
    id: 1,
    name: "Workshop: How to CV + How to Interview",
    type: "Workshop",
    location: "Amfiteatrul Pompeiu, Facultatea de Matematică și Informatică",
    date: "25 martie",
    startTime: "12:00",
    facebookEventUrl: "https://www.facebook.com/events/478777697648477",
  },
  {
    id: 2,
    name: "Workshop: GitHub + Integrare Profesională",
    type: "Workshop",
    location: "Amfiteatrul Pompeiu, Facultatea de Matematică și Informatică",
    date: "26 martie",
    startTime: "12:00",
    facebookEventUrl: "https://www.facebook.com/events/573060301522184/",
  },
];

const EventsSection: React.FC<EventsSectionProps> = ({ t }) => {
  return (
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
      <div className="mx-auto flex max-w-5xl flex-1 flex-row justify-center gap-4 overflow-auto">
        {events.map((event) => (
          <EventCard key={event.id} t={t} event={event} className="flex-1" />
        ))}
      </div>
    </section>
  );
};

export default EventsSection;
