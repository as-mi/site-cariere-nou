import { ReactElement, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { PackageType } from "@prisma/client";

import { trpc } from "~/lib/trpc";

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
import CompanyLogo from "~/components/common/company-logo";

type PageProps = {
  companyId: number;
};

type EditCompanyFieldValues = {
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
};

const AdminEditCompanyPage: NextPageWithLayout<PageProps> = ({ companyId }) => {
  const [successfullySaved, setSuccessfullySaved] = useState(false);

  const query = trpc.admin.company.read.useQuery({ id: companyId });

  const mutation = trpc.admin.company.update.useMutation({
    onSuccess: () => setSuccessfullySaved(true),
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");
  const [imageVersion, setImageVersion] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<EditCompanyFieldValues>();

  const onSubmit: SubmitHandler<EditCompanyFieldValues> = async (data) => {
    setSuccessfullySaved(false);
    setFileUploadError("");

    if (data.logo.length > 0) {
      setIsUploadingImage(true);

      try {
        const formData = new FormData();
        formData.append("id", query.data!.logoImageId.toString());
        formData.append("file", data.logo[0]);

        const options = {
          method: "PUT",
          body: formData,
        };
        const response = await fetch("/api/images/upload", options);
        if (!response.ok) {
          throw new Error(
            `Failed to upload image: status code ${response.status}`
          );
        }
      } catch (e) {
        if (e instanceof Error) {
          setFileUploadError(e.message);
        } else {
          setFileUploadError("Failed to upload logo");
        }
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    setImageVersion((value) => value + 1);

    const payload = {
      id: companyId,
      ...data,
    };
    if (!data.useExternalUrlForPositions) {
      payload.positionsExternalUrl = null;
    }
    mutation.mutate(payload);
  };

  useEffect(() => {
    if (query.data) {
      const formData = {
        ...query.data,
        logo: undefined,
        useExternalUrlForPositions: !!query.data.positionsExternalUrl,
      };

      reset(formData);
    }
  }, [query.data, reset]);

  if (!query.data) {
    return <p>Loading...</p>;
  }

  const watchUseExternalUrlForPositions = watch("useExternalUrlForPositions");

  return (
    <>
      <header>
        <Link href="/admin/companies">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Editează o companie existentă
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
            ]}
            register={register}
            errors={errors}
          />

          <div>
            <FileField
              name="logo"
              label="Logo"
              accept="image/png, image/jpeg"
              register={register}
              errors={errors}
            />
            <div className="mx-auto mt-6 mb-8 max-w-xs">
              <CompanyLogo
                company={query.data}
                queryString={`v=${imageVersion}`}
                className="max-h-32 rounded-md bg-white object-contain p-4"
              />
            </div>
          </div>

          <TextAreaField
            name="description"
            label="Descriere"
            register={register}
            errors={errors}
            className="min-h-[8rem] min-w-[24rem]"
          />

          <br></br>
          <br></br>
          <label>Social media:</label>
          <TextField
            name="instagramUrl"
            label="URL Instagram"
            placeholder="https://www.example.com"
            register={register}
            errors={errors}
          />
          <TextField
            name="linkedinUrl"
            label="URL LinkedIn"
            placeholder="https://www.example.com"
            register={register}
            errors={errors}
          />
          <TextField
            name="facebookUrl"
            label="URL Facebook"
            placeholder="https://www.example.com"
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
          label="Salvează"
          disabled={isUploadingImage || mutation.isLoading}
          className="mt-6"
        />

        {fileUploadError && (
          <div className="my-3 text-red-400">{fileUploadError}</div>
        )}
        {mutation.error && (
          <div className="mt-3 text-red-400">{mutation.error.message}</div>
        )}
        {successfullySaved && (
          <div className="mt-3 text-green-400">Salvat cu succes!</div>
        )}
      </form>
    </>
  );
};

export default AdminEditCompanyPage;

AdminEditCompanyPage.getLayout = (page: ReactElement) => (
  <Layout title="Editează o companie existentă">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
}) => {
  const id = params?.id;
  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  const companyId = parseInt(id);
  if (Number.isNaN(companyId)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      companyId,
    },
  };
};
