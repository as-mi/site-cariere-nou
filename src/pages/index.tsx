import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

import { PHASE_PRODUCTION_BUILD } from "next/dist/shared/lib/constants";

import { Trans, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import _ from "lodash";

import { PackageType } from "@prisma/client";

import prisma from "~/lib/prisma";
import { getBaseUrl } from "~/lib/base-url";
import { getSettingValue } from "~/lib/settings/get";

import { useIsAdmin } from "~/hooks/use-role";

import ApplicationsDeadlineNotice from "~/components/common/applications-deadline-notice";
import ApplicationsClosedNotice from "~/components/common/applications-closed-notice";
import VisitBox from "~/components/pages/home/addons/first-visit";
import NavBar from "~/components/pages/home/navbar";
import HeroSection from "~/components/pages/home/hero";
import LogosSection from "~/components/pages/home/logos";
import AboutSection from "~/components/pages/home/about";
import ContactSection from "~/components/pages/home/contact";
// import LastYearSection from "~/components/pages/home/last-year-partners";
// import Testimonials from "~/components/pages/home/testimonials";
import Translate from "~/components/common/translate";
import ScrollToTopButton from "~/components/pages/home/addons/scroll-to-top";
import PartnersSection, {
  CompaniesByPackageType,
  Company,
} from "~/components/pages/home/partners/section";
import EventsSection, {
  SerializedEvent,
} from "~/components/pages/home/events/section";
import CookieConsent from "~/components/common/cookie-consent";
import Footer from "~/components/common/footer";

type PageProps = {
  baseUrl: string;
  showComingSoonMessage: boolean;
  alwaysShowCompaniesForAdmin: boolean;
  hideProfileLink: boolean;
  showEvents: boolean;
  alwaysShowEventsForAdmin: boolean;
  closeApplications: boolean;
  companiesByPackageType: CompaniesByPackageType;
  events: SerializedEvent[];
};

const HomePage: NextPage<PageProps> = ({
  baseUrl,
  showComingSoonMessage,
  alwaysShowCompaniesForAdmin,
  hideProfileLink,
  showEvents,
  alwaysShowEventsForAdmin,
  closeApplications,
  companiesByPackageType,
  events,
}) => {
  const { t } = useTranslation("home");

  const isAdmin = useIsAdmin();

  const isEventsSectionVisible =
    showEvents || (alwaysShowEventsForAdmin && isAdmin);

  return (
    <>
      <Head>
        <title>Cariere v14.0</title>
        <meta
          name="description"
          content="Cariere este un târg de job-uri și internship-uri dedicat studenților."
        />
        <meta name="og:title" content="Cariere v14.0" />
        <meta name="og:url" content={`${baseUrl}/`} />
        <meta
          name="og:image"
          content={`${baseUrl}/images/open-graph-image.png`}
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Removed notification (traditionally)
      <ApplicationsDeadlineNotice />
      {closeApplications && <ApplicationsClosedNotice />} */}

      {/*Added a black box which appears when visits for the first time*/}
      <VisitBox></VisitBox>

      <NavBar
        t={t}
        hideEventsLink={!isEventsSectionVisible} // Button 'events' is hidden until an event post is made
        hideProfileLink={!hideProfileLink} // DeMorgan this if accounts don't work well
        home={true} // True if you create from index
      />

      <main>
        <HeroSection
          t={t}
          // Change this to false after the events ends (from Prisma)
          // Find where showComingSoonMessage is coming from, I am pretty sure that's from Prisma
          showComingSoonMessage={showComingSoonMessage}
          showEventsSectionLink={isEventsSectionVisible}
        />

        {/* Added media queries for logos and redesign */}
        <LogosSection />

        <AboutSection t={t} />

        <PartnersSection
          t={t}
          showComingSoonMessage={
            alwaysShowCompaniesForAdmin
              ? !isAdmin && showComingSoonMessage
              : showComingSoonMessage
          }
          companiesByPackageType={companiesByPackageType}
        />
        {isEventsSectionVisible && <EventsSection t={t} events={events} />}
        <ContactSection />
      </main>

      <Footer />

      <Translate />
      <ScrollToTopButton />

      <CookieConsent />
    </>
  );
};

export default HomePage;

export const getStaticProps: GetStaticProps<PageProps> = async ({ locale }) => {
  const ssrConfig = await serverSideTranslations(locale ?? "ro", [
    "common",
    "home",
  ]);

  const baseUrl = getBaseUrl();

  const showComingSoonMessage = await getSettingValue("showComingSoonMessage");
  const alwaysShowCompaniesForAdmin = await getSettingValue(
    "alwaysShowCompaniesForAdmin",
  );
  const showProfileLink = await getSettingValue("showProfileLink");
  const hideProfileLink = !showProfileLink;
  const showEvents = await getSettingValue("showEvents");
  const alwaysShowEventsForAdmin = await getSettingValue(
    "alwaysShowEventsForAdmin",
  );
  const closeApplications = await getSettingValue("closeApplications");

  // When performing the initial static page build, we don't want to access the database
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return {
      props: {
        ...ssrConfig,
        baseUrl,
        showComingSoonMessage,
        alwaysShowCompaniesForAdmin,
        hideProfileLink,
        showEvents,
        alwaysShowEventsForAdmin,
        closeApplications,
        companiesByPackageType: {},
        events: [],
      },
      // The page will be regenerated using the data from the database once the first request comes in
      revalidate: 1,
    };
  }

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      packageType: true,
      logo: {
        select: {
          id: true,
          width: true,
          height: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const companiesByPackageType = _.groupBy(companies, "packageType") as Partial<
    Record<PackageType, Company[]>
  >;

  const events = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      kind: true,
      location: true,
      date: true,
      time: true,
      facebookEventUrl: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return {
    props: {
      ...ssrConfig,
      baseUrl,
      showComingSoonMessage,
      alwaysShowCompaniesForAdmin,
      hideProfileLink,
      showEvents,
      alwaysShowEventsForAdmin,
      closeApplications,
      companiesByPackageType,
      events: events.map((event) => ({
        ...event,
        date: event.date.toLocaleDateString("ro", {
          day: "numeric",
          month: "long",
        }),
      })),
    },
  };
};
