import { ReactElement, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Link from "next/link";

import { PackageType } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import {
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "~/components/pages/admin/forms";

import { trpc } from "~/lib/trpc";
import { GetServerSideProps } from "next";

type PageProps = {
  companyId: number;
};

type EditCompanyFieldValues = {
  name: string;
  slug: string;
  siteUrl: string;
  packageType: PackageType;
  description: string;
};

const AdminEditCompanyPage: NextPageWithLayout<PageProps> = ({ companyId }) => {
  const [successfullySaved, setSuccessfullySaved] = useState(false);

  const query = trpc.admin.company.read.useQuery({ id: companyId });

  const mutation = trpc.admin.company.update.useMutation({
    onSuccess: () => setSuccessfullySaved(true),
  });

  // const [isUploadingImage, setIsUploadingImage] = useState(false);
  // const [fileUploadError, setFileUploadError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCompanyFieldValues>();

  const onSubmit: SubmitHandler<EditCompanyFieldValues> = async (data) => {
    setSuccessfullySaved(false);

    const payload = {
      id: companyId,
      ...data,
    };
    mutation.mutate(payload);
  };

  useEffect(() => {
    if (query.data) {
      reset(query.data);
    }
  }, [query.data, reset]);

  if (!query.data) {
    return <p>Loading...</p>;
  }

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
            ]}
            register={register}
            errors={errors}
          />

          {/* TODO: allow editing company logo */}
          {/* <FileField
            name="logo"
            label="Logo"
            accept="image/png, image/jpeg"
            required
            register={register}
            errors={errors}
          /> */}

          <TextAreaField
            name="description"
            label="Descriere"
            register={register}
            errors={errors}
            className="min-h-[8rem] min-w-[24rem]"
          />
        </div>

        <SubmitButton
          label="Salvează"
          disabled={mutation.isLoading}
          className="mt-6"
        />

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
