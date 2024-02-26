import { useMemo } from "react";

import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { signOut } from "next-auth/react";

import { Prisma, Role } from "@prisma/client";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";
import { getSettingValue } from "~/lib/settings/get";

import useRole from "~/hooks/use-role";

import ApplicationsDeadlineNotice from "~/components/common/applications-deadline-notice";
import ApplicationsClosedNotice from "~/components/common/applications-closed-notice";
import ContactInfoSection from "~/components/pages/profile/contact-info/section";
import OptionsSection from "~/components/pages/profile/options/section";
import ResumesSection from "~/components/pages/profile/resumes/section";

const userWithProfileAndResumes = Prisma.validator<Prisma.UserArgs>()({
  select: {
    id: true,
    email: true,
    name: true,
    consentApplyToOtherPartners: true,
    profile: {
      select: {
        phoneNumber: true,
      },
    },
    resumes: {
      select: {
        id: true,
        fileName: true,
      },
      orderBy: [{ id: "asc" }],
    },
  },
});

type UserWithProfilesAndResumes = Prisma.UserGetPayload<
  typeof userWithProfileAndResumes
>;

type PageProps = {
  user: UserWithProfilesAndResumes;
  closeApplications: boolean;
};

const ProfilePage: NextPage<PageProps> = ({ user, closeApplications }) => {
  const { t, i18n } = useTranslation("profile");

  const pageTitle = useMemo(() => `${t("pageTitle")} - Cariere v13.0`, [t]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const role = useRole();

  const contactInfo = {
    email: user.email,
    name: user.name,
    phoneNumber: user.profile?.phoneNumber ?? "",
  };

  const resumes = user.resumes;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <ApplicationsDeadlineNotice />
      {closeApplications && <ApplicationsClosedNotice />}
      <div className="min-h-screen bg-black px-4 py-8">
        <main className="mx-auto max-w-md rounded-lg bg-white px-6 py-6 text-black">
          <h1 className="font-display text-3xl font-bold">{t("pageTitle")}</h1>
          <ContactInfoSection t={t} initialData={contactInfo} />
          {role == Role.PARTICIPANT && (
            <>
              <OptionsSection
                t={t}
                initialData={{
                  applyToOtherPartners: user.consentApplyToOtherPartners,
                }}
                readOnly={closeApplications}
              />
              <ResumesSection
                t={t}
                i18n={i18n}
                initialData={resumes}
                readOnly={closeApplications}
              />
            </>
          )}
          <div className="mt-3 flex flex-row flex-wrap items-center gap-3">
            <Link
              href="/"
              className="flex-1 basis-[max-content] rounded-md bg-green-700 px-3 py-2 text-center text-white hover:bg-green-800 active:bg-green-900 sm:flex-none"
            >
              {t("backToHomePage")}
            </Link>
            <button
              onClick={handleSignOut}
              className="flex-1 basis-[max-content] rounded-md bg-red-600 px-3 py-2 text-center text-white hover:bg-red-700 active:bg-red-800 sm:flex-none"
            >
              {t("signOut")}
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProfilePage;

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  req,
  res,
  resolvedUrl,
}) => {
  const session = await getServerSession(req, res);

  const returnUrl = resolvedUrl;

  if (!session || !session.user) {
    return redirectToLoginPage(returnUrl);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    ...userWithProfileAndResumes,
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  const closeApplications = await getSettingValue("closeApplications");

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", ["common", "profile"])),
      session,
      user,
      closeApplications,
    },
  };
};
