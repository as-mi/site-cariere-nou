import { ReactElement, useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import { trpc } from "~/lib/trpc";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import {
  SubmitButton,
  TextAreaField,
  TextField,
} from "~/components/pages/admin/forms";

import { CommonFieldValues } from "~/components/pages/admin/technical-tests/forms/common";
import QuestionsEditor from "~/components/pages/admin/technical-tests/forms/questions-editor";

type PageProps = {
  technicalTestId: number;
};

const AdminEditTechnicalTestPage: NextPageWithLayout<PageProps> = ({
  technicalTestId,
}) => {
  const [successfullySaved, setSuccessfullySaved] = useState(false);

  const query = trpc.admin.technicalTest.read.useQuery(
    { id: technicalTestId },
    { retry: false },
  );

  const mutation = trpc.admin.technicalTest.update.useMutation({
    onSuccess: () => setSuccessfullySaved(true),
  });

  const useFormMethods = useForm<CommonFieldValues>();
  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = useFormMethods;

  const onSubmit: SubmitHandler<CommonFieldValues> = async (data) => {
    setSuccessfullySaved(false);

    const payload = {
      id: technicalTestId,
      ...data,
    };
    mutation.mutate(payload);
  };

  useEffect(() => {
    if (query.data) {
      const formData = {
        ...query.data,
        positionId: undefined,
      };
      reset(formData);
    }
  }, [query.data, reset]);

  if (query.isLoading) {
    return <p>Loading...</p>;
  }

  if (!query.data) {
    return <p>Error while loading data: {query.error!.message}</p>;
  }

  return (
    <>
      <header>
        <Link href="/admin/technical-tests">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Editează un test tehnic existent
        </h1>
      </header>
      <FormProvider {...useFormMethods}>
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
              className="min-h-[8rem]"
            />

            <QuestionsEditor />
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
      </FormProvider>
    </>
  );
};

export default AdminEditTechnicalTestPage;

AdminEditTechnicalTestPage.getLayout = (page: ReactElement) => (
  <Layout title="Editează un test tehnic existent">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
  resolvedUrl,
  params,
}) => {
  const session = await getServerSession(req, res);

  const returnUrl = resolvedUrl;

  if (!session || !session.user) {
    return redirectToLoginPage(returnUrl);
  }

  const id = params?.id;
  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  const technicalTestId = parseInt(id);
  if (Number.isNaN(technicalTestId)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      technicalTestId,
    },
  };
};
