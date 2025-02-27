import { ReactElement, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { PackageType } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import {
  CheckboxField,
  FileField,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "~/components/pages/admin/forms";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import { trpc } from "~/lib/trpc";

type AddCompanyFieldValues = {
  name: string;
  slug: string;
  siteUrl: string;
  packageType: PackageType;
  logo: FileList;
  description: string;
  useExternalUrlForPositions: boolean;
  positionsExternalUrl: string | null;
  instagramUrl: string;
  linkedinUrl: string;
  facebookUrl: string;
  thisYearPartner: boolean;
};

const AdminNewCompanyPage: NextPageWithLayout = () => {
  const mutation = trpc.admin.company.create.useMutation();

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (mutation.isSuccess) {
      router.push("/admin/companies");
    }
  }, [mutation.isSuccess, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AddCompanyFieldValues>();

  const onSubmit: SubmitHandler<AddCompanyFieldValues> = async (data) => {
    setIsUploadingImage(true);

    let logoImageId: number | undefined;
    try {
      const formData = new FormData();
      formData.append("file", data.logo[0]);

      const options = {
        method: "POST",
        body: formData,
      };
      const response = await fetch("/api/images/upload", options);
      if (!response.ok) {
        throw new Error(
          `Failed to upload image: status code ${response.status}`,
        );
      }

      const { id } = await response.json();

      if (!id) {
        throw new Error("Failed to upload image, back end returned no ID");
      }

      if (typeof id !== "number") {
        throw new Error(
          "Back end did not return an image ID of the expected type",
        );
      }

      logoImageId = id;
    } catch (e) {
      if (e instanceof Error) {
        setFileUploadError(e.message);
      } else {
        setFileUploadError("Failed to upload logo");
      }
      return;
    }

    setIsUploadingImage(false);

    const payload = {
      ...data,
      logo: undefined,
      logoImageId,
    };

    mutation.mutate(payload);
  };

  const watchUseExternalUrlForPositions = watch("useExternalUrlForPositions");

  return (
    <>
      <header>
        <Link href="/admin/companies">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Adaugă o nouă companie
        </h1>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
        <div className="space-y-3">
          <TextField
            name="name"
            label="Nume"
            required
            register={register}
            errors={errors}
          />
          <TextField
            name="slug"
            label="Slug"
            placeholder="example-corp"
            hint="Va fi folosit în generarea URL-ului pentru pagina acestei companii"
            required
            register={register}
            errors={errors}
          />
          <TextField
            name="siteUrl"
            label="URL site"
            placeholder="https://www.example.com"
            register={register}
            errors={errors}
          />

          <SelectField
            name="packageType"
            label="Tip pachet"
            options={[
              { value: PackageType.BRONZE, label: "Bronze" },
              { value: PackageType.SILVER, label: "Silver" },
              { value: PackageType.GOLD, label: "Gold" },
              { value: PackageType.PLATINUM, label: "Platinum" },
            ]}
            register={register}
            errors={errors}
          />

          <FileField
            name="logo"
            label="Logo"
            accept="image/png, image/jpeg"
            required
            register={register}
            errors={errors}
          />

          <TextAreaField
            name="description"
            label="Descriere"
            register={register}
            errors={errors}
            className="min-h-[8rem]"
          />

          <div className="py-4">
            <fieldset>
              <legend className="mb-1 font-semibold">
                Link-uri social media
              </legend>
              <div className="space-y-2 px-2">
                <TextField
                  name="facebookUrl"
                  label="Link pagină de Facebook"
                  placeholder="https://www.facebook.com/asmi.ub/"
                  register={register}
                  errors={errors}
                />
                <TextField
                  name="instagramUrl"
                  label="Link pagină de Instagram"
                  placeholder="https://www.instagram.com/asmi.ub/"
                  register={register}
                  errors={errors}
                />
                <TextField
                  name="linkedinUrl"
                  label="Link pagină de LinkedIn"
                  placeholder="https://www.linkedin.com/company/asmi-ub/"
                  register={register}
                  errors={errors}
                />
              </div>
            </fieldset>
          </div>

          <CheckboxField
            name="thisYearPartner"
            label="Companie parteneră anul acesta"
            register={register}
            errors={errors}
          />

          <CheckboxField
            name="useExternalUrlForPositions"
            label="Folosește link extern pentru joburi"
            register={register}
            errors={errors}
          />

          {watchUseExternalUrlForPositions && (
            <TextField
              name="positionsExternalUrl"
              label="Link extern pentru joburi"
              placeholder="https://www.example.com/careers"
              required
              register={register}
              errors={errors}
            />
          )}
        </div>

        <SubmitButton
          label="Adaugă"
          disabled={isUploadingImage || mutation.isLoading}
          className="mt-6"
        />

        {fileUploadError && (
          <div className="my-3 text-red-400">{fileUploadError}</div>
        )}
        {mutation.error && (
          <div className="mt-3 text-red-400">{mutation.error.message}</div>
        )}
      </form>
    </>
  );
};

export default AdminNewCompanyPage;

AdminNewCompanyPage.getLayout = (page: ReactElement) => (
  <Layout title="Adaugă o nouă companie">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  resolvedUrl,
}) => {
  const session = await getServerSession(req, res);

  const returnUrl = resolvedUrl;

  if (!session || !session.user) {
    return redirectToLoginPage(returnUrl);
  }

  return {
    props: {
      session,
    },
  };
};
