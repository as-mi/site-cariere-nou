import { GetServerSideProps, NextPage } from "next";

import Head from "next/head";
import Link from "next/link";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { PackageType, Role } from "@prisma/client";

import showdown from "showdown";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { getServerSession } from "~/lib/auth";
import { getSettingValue } from "~/lib/settings/get";
import prisma from "~/lib/prisma";

import { useIsAdmin } from "~/hooks/use-role";

import ApplicationsDeadlineNotice from "~/components/common/applications-deadline-notice";
import ApplicationsClosedNotice from "~/components/common/applications-closed-notice";
import Footer from "~/components/common/footer";
import Header from "~/components/pages/companies/header";
import ExternalLink from "~/components/common/external-link";
import NavBar from "~/components/pages/companies/navbar";
import PositionCard, {
  Position,
} from "~/components/pages/companies/positions/position-card";

import Translate from "~/components/common/translate";
import { isThisYear } from "date-fns";

type Logo = {
  id: number;
  width: number;
  height: number;
};

type Company = {
  id: number;
  name: string;
  descriptionHtml: string;
  packageType: PackageType;
  siteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  logo: Logo;
  positionsExternalUrl: string | null;
  positions: Position[];
  videoUrl: string | null;
};

type PageProps = {
  company: Company;
  showAvailablePositions: boolean;
  alwayShowAvailablePositionsForAdmin: boolean;
  allowParticipantsToApplyToPositions: boolean;
  closeApplications: boolean;
  resolvedUrl: string;
  applyToPositionId: number | null;
};

const CompanyPage: NextPage<PageProps> = ({
  company,
  showAvailablePositions,
  alwayShowAvailablePositionsForAdmin,
  allowParticipantsToApplyToPositions,
  closeApplications,
  resolvedUrl,
  applyToPositionId,
}) => {
  const pageTitle = `${company.name} - Cariere v14.0`;

  const isAdmin = useIsAdmin();

  showAvailablePositions =
    showAvailablePositions || (alwayShowAvailablePositionsForAdmin && isAdmin);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <ApplicationsDeadlineNotice />
      {closeApplications && <ApplicationsClosedNotice />}
      <NavBar companyId={company.id} />
      <main className="min-h-screen bg-black">
        <Header company={company} />
        <section className="bg-white p-4 xs:py-8 xs:px-6 sm:py-12 md:py-16 pt-28">
          <div className="prose mx-auto max-w-prose">
            {company.descriptionHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: company.descriptionHtml }}
              />
            ) : (
              <div className="sm:py-4">
                {company.name} este Partener {company.packageType} în cadrul
                Cariere v14. Nu a fost publicată încă o descriere a companiei.
              </div>
            )}
          </div>
        </section>
        {showAvailablePositions && (
          <section className="flex flex-col items-center bg-black p-3 pt-8 text-white sm:pb-16">
            <header className="mb-3">
              <h2 className="font-display text-2xl sm:mb-6 sm:text-3xl">
                Poziții deschise
              </h2>
            </header>
            {company.positionsExternalUrl !== null ? (
              <div className="text-xl">
                Aplică{" "}
                <ExternalLink href={company.positionsExternalUrl}>
                  aici
                </ExternalLink>
              </div>
            ) : company.positions.length === 0 ? (
              <div className="px-8 py-6 text-center sm:py-12">
                Acest partener nu a publicat încă nicio poziție.
              </div>
            ) : (
              <div className="flex w-full max-w-6xl flex-row flex-wrap items-center justify-center gap-4 xs:px-3 md:gap-8">
                {company.positions.map((position) => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    enableApplicationForm={allowParticipantsToApplyToPositions}
                    applicationsClosed={closeApplications}
                    returnUrl={resolvedUrl}
                    initiallyShowApplicationForm={
                      position.id === applyToPositionId
                    }
                  />
                ))}
              </div>
            )}
            {isAdmin && (
              <Link
                href={`/admin/positions/new?companyId=${company.id}`}
                className="mt-4 inline-block rounded-md bg-blue-700 px-3 py-2 text-white hover:bg-blue-800 active:bg-blue-900"
              >
                <FontAwesomeIcon
                  icon={faPlus}
                  className="mr-2 inline-block h-3 w-3"
                />
                Adaugă un post nou
              </Link>
            )}
          </section>
        )}
      </main>

      <Translate />
      <Footer />
    </>
  );
};

export default CompanyPage;

// TODO: make static generation work again for company pages
// export async function getStaticPaths() {
//   return {
//     paths: [],
//     fallback: "blocking",
//   };
// }

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
  query,
  locale,
  req,
  res,
  resolvedUrl,
}) => {
  const slug = params?.slug;
  if (typeof slug !== "string" || !slug) {
    if (process.env.NODE_ENV === "development") {
      throw new Error("`slug` route parameter is not a non-empty string");
    } else {
      return {
        notFound: true,
      };
    }
  }

  const company = await prisma.company.findUnique({
    select: {
      id: true,
      name: true,
      description: true,
      packageType: true,
      siteUrl: true,
      facebookUrl: true,
      instagramUrl: true,
      linkedinUrl: true,
      logo: {
        select: {
          id: true,
          width: true,
          height: true,
        },
      },
      positionsExternalUrl: true,
      videoUrl: true,
      positions: {
        select: {
          id: true,
          title: true,
          category: true,
          requiredSkills: true,
          workSchedule: true,
          workModel: true,
          duration: true,
          description: true,
          activeTechnicalTestId: true,
          technicalTestIsMandatory: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    where: { slug },
  });

  if (!company) {
    return {
      notFound: true,
    };
  }

  let applyToPositionId: number | null = null;
  if (query.applyToPositionId) {
    if (typeof query.applyToPositionId !== "string") {
      throw new Error(
        "Invalid value for `applyToPositionId` query string parameter",
      );
    }

    applyToPositionId = parseInt(query.applyToPositionId);
    if (Number.isNaN(applyToPositionId)) {
      throw new Error("Value for `applyToPositionId` must be an integer ID");
    }
  }

  const session = await getServerSession(req, res);
  const user = session?.user;

  let positionsAlreadyAppliedToIds = new Set();
  let completedTechnicalTestsIds = new Set();
  if (user && user.role === Role.PARTICIPANT) {
    const applications = await prisma.participantApplyToPosition.findMany({
      where: {
        userId: user.id,
        position: {
          companyId: company.id,
        },
      },
      select: {
        positionId: true,
      },
    });
    positionsAlreadyAppliedToIds = new Set(
      applications.map((application) => application.positionId),
    );

    const answeredTechnicalTests =
      await prisma.participantAnswersToTechnicalTest.findMany({
        where: {
          userId: user.id,
          technicalTest: {
            position: {
              companyId: company.id,
            },
          },
        },
        select: {
          technicalTestId: true,
        },
      });
    completedTechnicalTestsIds = new Set(
      answeredTechnicalTests.map((answers) => answers.technicalTestId),
    );
  }

  const converter = new showdown.Converter();

  const positions = company.positions.map(
    ({
      id,
      title,
      category,
      requiredSkills,
      workSchedule,
      workModel,
      duration,
      description,
      activeTechnicalTestId,
      technicalTestIsMandatory,
    }) => ({
      id,
      title,
      category,
      requiredSkills,
      workSchedule,
      workModel,
      duration,
      descriptionHtml: converter.makeHtml(description),
      alreadyAppliedTo: positionsAlreadyAppliedToIds.has(id),
      technicalTestId: activeTechnicalTestId || null,
      technicalTestCompleted: activeTechnicalTestId
        ? completedTechnicalTestsIds.has(activeTechnicalTestId)
        : null,
      technicalTestIsMandatory,
    }),
  );

  const showAvailablePositions = await getSettingValue(
    "showAvailablePositions",
  );
  const alwayShowAvailablePositionsForAdmin = await getSettingValue(
    "alwaysShowAvailablePositionsForAdmin",
  );
  const allowParticipantsToApplyToPositions = await getSettingValue(
    "allowParticipantsToApplyToPositions",
  );
  const closeApplications = await getSettingValue("closeApplications");

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", ["common", "home"])),
      session,
      company: {
        id: company.id,
        name: company.name,
        packageType: company.packageType,
        siteUrl: company.siteUrl,
        facebookUrl: company.facebookUrl,
        instagramUrl: company.instagramUrl,
        linkedinUrl: company.linkedinUrl,
        logo: company.logo,
        descriptionHtml: converter.makeHtml(company.description),
        positionsExternalUrl: company.positionsExternalUrl,
        positions,
        videoUrl: company.videoUrl,
      },
      showAvailablePositions,
      alwayShowAvailablePositionsForAdmin,
      allowParticipantsToApplyToPositions,
      closeApplications,
      resolvedUrl,
      applyToPositionId,
    },
  };
};
