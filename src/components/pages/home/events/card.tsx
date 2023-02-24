import { TFunction } from "next-i18next";

import classNames from "classnames";

import {
  faCalendar,
  faClock,
  faMapLocation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";

import ExternalLink from "~/components/common/external-link";

type Event = {
  name: string;
  type: string;
  location: string;
  date: string;
  startTime?: string;
  timeInterval?: string;
  facebookEventUrl?: string;
};

type EventCardProps = {
  t: TFunction;
  event: Event;
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
        <h3 className="text-md text-gray-400">{event.type}</h3>
      </header>
      <div className="space-y-2 pl-1 pt-3">
        <p className="min-h-[2.5rem]">
          <span title={t("eventsSection.card.location")!}>
            <FontAwesomeIcon
              icon={faMapLocation}
              className="mr-1 inline h-4 w-4"
            />
          </span>{" "}
          {event.location}
        </p>
        <p>
          <span title={t("eventsSection.card.date")!}>
            <FontAwesomeIcon
              icon={faCalendar}
              className="mr-2 inline h-4 w-4"
            />
          </span>
          {event.date}
        </p>
        <p>
          <span title={t("eventsSection.card.time")!}>
            <FontAwesomeIcon icon={faClock} className="mr-2 inline h-4 w-4" />
          </span>
          {event.startTime ?? event.timeInterval}
        </p>
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
