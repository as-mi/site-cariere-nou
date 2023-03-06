import { TFunction } from "next-i18next";

import classNames from "classnames";

import { Event, EventKind } from "@prisma/client";

import {
  faCalendar,
  faClock,
  faMapLocation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";

import ExternalLink from "~/components/common/external-link";

export type SerializedEvent = Omit<Event, "date"> & { date: string };

type EventCardProps = {
  t: TFunction;
  event: SerializedEvent;
  className?: string;
};

const EventCard: React.FC<EventCardProps> = ({ t, event, className }) => {
  return (
    <div
      className={classNames(
        "min-w-[16rem] max-w-sm rounded-lg border-2 border-gray-200 bg-white p-6 text-start drop-shadow-md",
        className
      )}
    >
      <header className="h-24">
        <h2 className="font-display text-lg font-bold">{event.name}</h2>
        <h3 className="text-md text-gray-400">
          {event.kind === EventKind.WORKSHOP ? "Workshop" : "Prezentare"}
        </h3>
      </header>
      <div className="space-y-2 pl-1 pt-3">
        {event.location && (
          <p>
            <span title={t("eventsSection.card.location")!}>
              <FontAwesomeIcon
                icon={faMapLocation}
                className="mr-1 inline h-4 w-4"
              />
            </span>{" "}
            {event.location}
          </p>
        )}
        <p>
          <span title={t("eventsSection.card.date")!}>
            <FontAwesomeIcon
              icon={faCalendar}
              className="mr-2 inline h-4 w-4"
            />
          </span>
          {event.date}
        </p>
        {event.time && (
          <p>
            <span title={t("eventsSection.card.time")!}>
              <FontAwesomeIcon icon={faClock} className="mr-2 inline h-4 w-4" />
            </span>
            {event.time}
          </p>
        )}
        {event.facebookEventUrl && (
          <p>
            <span title={t("eventsSection.card.facebookEvent")!}>
              <FontAwesomeIcon
                icon={faFacebook}
                className="mr-2 inline h-4 w-4"
              />
            </span>
            <ExternalLink href={event.facebookEventUrl}>
              {t("eventsSection.card.facebookEvent")}
            </ExternalLink>
          </p>
        )}
      </div>
    </div>
  );
};

export default EventCard;
