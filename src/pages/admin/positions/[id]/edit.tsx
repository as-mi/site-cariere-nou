import { ReactElement, useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { GetServerSideProps } from "next";
import Link from "next/link";

import Select from "react-select";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import {
  SubmitButton,
  TextAreaField,
  TextField,
} from "~/components/pages/admin/forms";

import { trpc } from "~/lib/trpc";

type PageProps = {
  positionId: number;
};

type Option = { value: number; label: string };

type EditPositionFieldValues = {
  title: string;
  description: string;
  activeTechnicalTest: Option;
};

const AdminEditPositionPage: NextPageWithLayout<PageProps> = ({
  positionId,
}) => {
  const [successfullySaved, setSuccessfullySaved] = useState(false);

  const query = trpc.admin.position.read.useQuery({ id: positionId });
  const technicalTestsQuery = trpc.admin.technicalTest.getAll.useQuery({
    positionId,
  });

  const mutation = trpc.admin.position.update.useMutation({
    onSuccess: () => setSuccessfullySaved(true),
  });

  const {
    reset,
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<EditPositionFieldValues>();

  const onSubmit: SubmitHandler<EditPositionFieldValues> = async (data) => {
    setSuccessfullySaved(false);

    const payload = {
      id: positionId,
      ...data,
      activeTechnicalTest: undefined,
      activeTechnicalTestId: data.activeTechnicalTest?.value || null,
    };
    mutation.mutate(payload);
  };

  useEffect(() => {
    if (query.data) {
      reset(query.data);
    }
  }, [query.data, reset]);

  const technicalTestOptions = useMemo(() => {
    if (!technicalTestsQuery.data) {
      return [];
    }

    return technicalTestsQuery.data.map((technicalTest) => ({
      value: technicalTest.id,
      label: technicalTest.title,
    }));
  }, [technicalTestsQuery.data]);

  if (!query.data || !technicalTestsQuery.data) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <header>
        <Link href="/admin/positions">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Editează o poziție existentă
        </h1>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
        <div className="space-y-3">
          <TextField
            name="title"
            label="Titlu"
            required
            register={register}
            errors={errors}
          />
          <TextAreaField
            name="description"
            label="Descriere"
            register={register}
            errors={errors}
            className="min-h-[8rem] min-w-[24rem]"
          />
          <div>
            <label htmlFor="activeTechnicalTest" className="block">
              Test tehnic
            </label>
            <Controller
              name="activeTechnicalTest"
              control={control}
              render={({ field }) => (
                <Select
                  id="activeTechnicalTest"
                  options={technicalTestOptions}
                  isClearable
                  {...field}
                  className="text-black"
                />
              )}
            />
          </div>
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

export default AdminEditPositionPage;

AdminEditPositionPage.getLayout = (page: ReactElement) => (
  <Layout title="Editează un post existent">{page}</Layout>
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

  const positionId = parseInt(id);
  if (Number.isNaN(positionId)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      positionId,
    },
  };
};
