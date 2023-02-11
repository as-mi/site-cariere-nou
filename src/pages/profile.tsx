import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { TFunction, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { signOut } from "next-auth/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

import { Role } from "@prisma/client";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";
import useRole from "~/hooks/use-role";

import ContactInfoSection from "~/components/pages/profile/contact-info/section";

type Profile = {
  phoneNumber: string;
};

type Resume = {
  fileName: string;
};

type User = {
  id: number;
  name: string;
  role: Role;
  profile?: Profile;
  resumes: Resume[];
};

type ResumeUploadFormProps = {
  t: TFunction;
  onCancel: () => void;
  onSuccess: () => void;
};

type ResumeUploadFormFieldValues = {
  file: FileList;
};

const ResumeUploadForm: React.FC<ResumeUploadFormProps> = ({
  t,
  onCancel,
  onSuccess,
}) => {
  const [fileUploadError, setFileUploadError] = useState("");

  const { handleSubmit, register, watch } =
    useForm<ResumeUploadFormFieldValues>();

  const watchFile = watch("file");

  const onSubmit: SubmitHandler<ResumeUploadFormFieldValues> = async (data) => {
    setFileUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", data.file[0]);

      const options = {
        method: "POST",
        body: formData,
      };
      const response = await fetch("/api/resumes/upload", options);
      if (!response.ok) {
        throw new Error(
          `Failed to upload résumé: status code ${response.status}`
        );
      }
    } catch (e) {
      if (e instanceof Error) {
        setFileUploadError(e.message);
      } else {
        setFileUploadError("Failed to upload logo");
      }
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="file" className="mb-1 block font-semibold">
          Fișier:
        </label>
        <input
          id="file"
          type="file"
          accept="application/pdf"
          {...register("file", { required: true })}
        />
      </div>
      <div className="my-3 space-x-3">
        <button
          type="submit"
          disabled={(watchFile?.length ?? 0) === 0}
          className="rounded-md bg-blue-700 px-3 py-2 text-center text-white disabled:bg-blue-300"
        >
          {t("resumeUploadForm.submit")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-zinc-700 px-3 py-2 text-center text-white"
        >
          {t("resumeUploadForm.cancel")}
        </button>
      </div>
      {fileUploadError && <div className="text-red-600">{fileUploadError}</div>}
    </form>
  );
};

type PageProps = {
  user: User;
};

const ProfilePage: NextPage<PageProps> = ({ user }) => {
  const router = useRouter();

  const { t } = useTranslation("profile");

  const pageTitle = useMemo(() => `${t("pageTitle")} - Cariere v12.0`, [t]);

  const [showResumeUploadForm, setShowResumeUploadForm] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const role = useRole();

  const contactInfo = {
    name: user.name,
    phoneNumber: user.profile?.phoneNumber ?? "",
  };

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <main className="mx-auto max-w-md rounded-lg bg-white px-6 py-6 text-black">
        <h1 className="font-display text-3xl font-bold">{t("pageTitle")}</h1>
        <ContactInfoSection t={t} initialData={contactInfo} />
        <div className="mt-3 flex flex-row flex-wrap items-center gap-3">
          <Link
            href="/"
            className="flex-1 rounded-md bg-green-700 px-3 py-2 text-center text-white hover:bg-green-800 active:bg-green-900 sm:flex-none"
          >
            Înapoi la pagina principală
          </Link>
          <button
            onClick={handleSignOut}
            className="flex-1 rounded-md bg-red-600 px-3 py-2 text-center text-white hover:bg-red-700 active:bg-red-800 sm:flex-none"
          >
            Dezautentificare
          </button>
        </div>
        {role == Role.PARTICIPANT && (
          <section className="mt-5">
            <h2 className="font-display text-xl font-semibold">CV-uri</h2>
            <div className="my-3">
              {showResumeUploadForm ? (
                <ResumeUploadForm
                  t={t}
                  onCancel={() => setShowResumeUploadForm(false)}
                  onSuccess={() => {
                    router.push("/profile");
                    setShowResumeUploadForm(false);
                  }}
                />
              ) : (
                <button
                  onClick={() => setShowResumeUploadForm(true)}
                  className="rounded-md bg-blue-600 px-3 py-2 text-center text-white"
                >
                  <FontAwesomeIcon icon={faUpload} className="mr-2 h-4 w-4" />{" "}
                  Adaugă un CV
                </button>
              )}
            </div>
            <div>
              {user.resumes.length === 0 ? (
                "Nu ai încărcat încă niciun CV."
              ) : (
                <ul>
                  {user.resumes.map((resume, index) => (
                    <li key={index} className="p-3">
                      CV-ul numărul {index + 1}: &nbsp;&nbsp; &quot;
                      {resume.fileName}
                      &quot;
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
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
    select: {
      id: true,
      name: true,
      profile: {
        select: {
          phoneNumber: true,
        },
      },
      resumes: {
        select: {
          fileName: true,
        },
      },
    },
  });

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", ["common", "profile"])),
      session,
      user,
    },
  };
};
