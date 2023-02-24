import { GetServerSideProps, NextPage } from "next";

import Head from "next/head";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { PackageType, Role } from "@prisma/client";

import showdown from "showdown";

import { getServerSession } from "~/lib/auth";
import { getSettingValue } from "~/lib/settings/get";
import prisma from "~/lib/prisma";

import { useIsAdmin } from "~/hooks/use-role";

import Footer from "~/components/common/footer";
import ExternalLink from "~/components/common/external-link";
import CompanyLogo from "~/components/common/company-logo";
import NavBar from "~/components/pages/companies/navbar";
import PositionCard, {
  Position,
} from "~/components/pages/companies/position-card";

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
  logo: Logo;
  positionsExternalUrl: string | null;
  positions: Position[];
};

type PageProps = {
  company: Company;
  showAvailablePositions: boolean;
  alwayShowAvailablePositionsForAdmin: boolean;
  applyToPositionId: number | null;
};

const CompanyPage: NextPage<PageProps> = ({
  company,
  showAvailablePositions,
  alwayShowAvailablePositionsForAdmin,
  applyToPositionId,
}) => {
  const pageTitle = `${company.name} - Cariere v12.0`;

  const isAdmin = useIsAdmin();

  showAvailablePositions =
    showAvailablePositions || (alwayShowAvailablePositionsForAdmin && isAdmin);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <NavBar companyId={company.id} />
      <main className="min-h-screen bg-black pt-32 md:pt-40 lg:pt-48">
        <header className="flex flex-col items-center justify-center bg-black py-8 text-white sm:py-12 md:py-20">
          <div className="mx-10 mb-8 max-w-sm rounded-lg bg-white p-4 xs:mb-12 xs:p-8 sm:mb-16 sm:p-12">
            <CompanyLogo company={company} />
          </div>
          <h1 className="mb-2 font-display text-3xl sm:text-5xl">
            {company.name}
          </h1>
          <h2 className="font-display text-xl">
            Partener {company.packageType}
          </h2>
          {company.siteUrl && (
            <h3 className="mt-1 font-display text-lg">
              Link:{" "}
              <a
                href={company.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-200 active:text-zinc-300"
              >
                {company.siteUrl}
              </a>
            </h3>
          )}
        </header>
        <section className="bg-white p-4 xs:py-8 xs:px-6 sm:py-12 md:py-16">
          <div className="prose mx-auto max-w-prose">
            {company.descriptionHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: company.descriptionHtml }}
              />
            ) : (
              <div className="sm:py-4">
                {company.name} este Partener {company.packageType} în cadrul
                Cariere v12. Nu a fost publicată încă o descriere a companiei.
              </div>
            )}
          </div>
        </section>
        {showAvailablePositions && (
          <section className="flex flex-col items-center bg-black p-3 pt-8 text-white sm:pb-16">
            <header className="mb-3">
              <h2 className="font-display text-2xl">Poziții deschise</h2>
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
              <div className="flex w-full flex-col items-center gap-4 xs:px-3">
                {company.positions.map((position) => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    initiallyShowApplicationForm={
                      position.id === applyToPositionId
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

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
      logo: {
        select: {
          id: true,
          width: true,
          height: true,
        },
      },
      positionsExternalUrl: true,
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
        "Invalid value for `applyToPositionId` query string parameter"
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
      applications.map((application) => application.positionId)
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
      answeredTechnicalTests.map((answers) => answers.technicalTestId)
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
    })
  );

  const showAvailablePositions = await getSettingValue(
    "showAvailablePositions"
  );
  const alwayShowAvailablePositionsForAdmin = await getSettingValue(
    "alwaysShowAvailablePositionsForAdmin"
  );

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", ["common", "home"])),
      company: {
        id: company.id,
        name: company.name,
        packageType: company.packageType,
        siteUrl: company.siteUrl,
        logo: company.logo,
        descriptionHtml: converter.makeHtml(company.description),
        positionsExternalUrl: company.positionsExternalUrl,
        positions,
      },
      showAvailablePositions,
      alwayShowAvailablePositionsForAdmin,
      applyToPositionId,
    },
  };
};
