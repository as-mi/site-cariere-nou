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
import { trpc } from "~/lib/trpc";
import useRole from "~/hooks/use-role";

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

type ProfileDisplayProps = {
  t: TFunction;
  user: User;
};

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ t, user }) => {
  const role = useRole();

  return (
    <>
      <div>
        <span className="font-semibold">{t("fields.name")}:</span> {user.name}
      </div>
      <div>
        <span className="font-semibold">{t("fields.phoneNumber")}:</span>{" "}
        {user.profile?.phoneNumber}
      </div>
      {process.env.NODE_ENV === "development" && role && (
        <div>
          <span className="font-semibold">{t("fields.role")}:</span>{" "}
          {role.toLowerCase()}
        </div>
      )}
    </>
  );
};

type ProfileEditFormProps = {
  t: TFunction;
  user: User;
  onCancel: () => void;
  onSuccess: () => void;
};

type ProfileEditFormFieldValues = {
  name: string;
  phoneNumber: string;
};

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  t,
  user,
  onCancel,
  onSuccess,
}) => {
  const mutation = trpc.participant.profileUpdate.useMutation({
    onSuccess,
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ProfileEditFormFieldValues>({
    defaultValues: {
      name: user.name,
      phoneNumber: user.profile?.phoneNumber,
    },
  });

  const onSubmit: SubmitHandler<ProfileEditFormFieldValues> = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">
          <span className="font-semibold">{t("fields.name")}:</span>
        </label>
        <input
          id="name"
          type="text"
          {...register("name", { required: true })}
          className="m-1 rounded-md bg-gray-200 p-1"
        />
        {errors.name && <div>{errors.name.message}</div>}
      </div>
      <div>
        <label htmlFor="phoneNumber">
          <span className="font-semibold">{t("fields.phoneNumber")}</span>:
        </label>
        <input
          id="phoneNumber"
          type="tel"
          {...register("phoneNumber", { required: true })}
          className="m-1 rounded-md bg-gray-200 p-1"
        />
        {errors.phoneNumber && <div>{errors.phoneNumber.message}</div>}
      </div>
      <div className="my-3 space-x-3">
        <button
          type="submit"
          className="rounded-md bg-blue-700 px-3 py-2 text-center text-white"
        >
          {t("profileUpdateForm.submit")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-zinc-700 px-3 py-2 text-center text-white"
        >
          {t("profileUpdateForm.cancel")}
        </button>
      </div>
      {mutation.error && (
        <div className="mt-3 text-red-600">{mutation.error.message}</div>
      )}
    </form>
  );
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

  const [showProfileEditForm, setShowProfileEditForm] = useState(false);
  const [showResumeUploadForm, setShowResumeUploadForm] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const role = useRole();

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <main className="mx-auto max-w-md rounded-lg bg-white px-6 py-6 text-black">
        <h1 className="font-display text-3xl font-bold">{t("pageTitle")}</h1>
        <section>
          <h2 className="font-display text-xl font-semibold">
            Date de contact
          </h2>
          {showProfileEditForm ? (
            <ProfileEditForm
              t={t}
              user={user}
              onCancel={() => setShowProfileEditForm(false)}
              onSuccess={() => {
                router.push("/profile");
                setShowProfileEditForm(false);
              }}
            />
          ) : (
            <>
              <ProfileDisplay t={t} user={user} />
              <div className="my-3">
                <button
                  onClick={() => setShowProfileEditForm(true)}
                  className="rounded-md bg-blue-700 px-3 py-2 text-center text-white"
                >
                  {t("editProfile")}
                </button>
              </div>
            </>
          )}
        </section>
        <div className="mt-3 flex flex-row flex-wrap items-center gap-3">
          <Link
            href="/"
            className="flex-1 rounded-md bg-green-700 px-3 py-2 text-center text-white sm:flex-none"
          >
            Înapoi la pagina principală
          </Link>
          <button
            onClick={handleSignOut}
            className="flex-1 rounded-md bg-red-600 px-3 py-2 text-center text-white sm:flex-none"
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
