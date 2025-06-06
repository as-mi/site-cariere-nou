import { ReactElement, useEffect, useMemo } from "react";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import Select from "react-select";

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

const AdminNewTechnicalTestPage: NextPageWithLayout = () => {
  const mutation = trpc.admin.technicalTest.create.useMutation({
    onSuccess: () => {
      router.push("/admin/technical-tests");
    },
  });

  const useFormMethods = useForm<CommonFieldValues>();
  const {
    resetField,
    watch,
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useFormMethods;

  const watchCompany = watch("company");
  const companyId: number | undefined = watchCompany?.value;

  const onSubmit: SubmitHandler<CommonFieldValues> = (data) => {
    // const positionId = parseInt(data.position.value as unknown as string);
    const positionId = data.position!.value;
    const payload = {
      positionId,
      title: data.title,
      description: data.description,
      questions: [],
      tallyLink: data.tallyLink,
    };
    mutation.mutate(payload);
  };

  const router = useRouter();

  const companiesQuery = trpc.admin.company.getAll.useQuery();
  const positionsQuery = trpc.admin.position.getAll.useQuery(
    {
      companyId: companyId!,
    },
    {
      enabled: companyId !== undefined,
    },
  );

  const companyOptions = useMemo(() => {
    if (!companiesQuery.data) {
      return [];
    }

    return companiesQuery.data.map((company) => ({
      value: company.id,
      label: company.name,
    }));
  }, [companiesQuery.data]);

  const positionOptions = useMemo(() => {
    if (!positionsQuery.data) {
      return [];
    }

    return positionsQuery.data.map((position) => ({
      value: position.id,
      label: position.title,
    }));
  }, [positionsQuery.data]);

  useEffect(() => {
    resetField("position", { defaultValue: null });
  }, [resetField, companyId]);

  if (companiesQuery.isLoading) {
    return <p>Se încarcă...</p>;
  }

  if (!companiesQuery.data) {
    return (
      <p>
        Eroare la încărcarea companiilor din baza de date:{" "}
        {companiesQuery.error.message}
      </p>
    );
  }

  return (
    <>
      <header>
        <Link href="/admin/technical-tests">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Adaugă un nou test tehnic
        </h1>
      </header>
      <FormProvider {...useFormMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
          <div className="space-y-3">
            <div>
              <label htmlFor="company" className="block">
                Companie
              </label>
              <Controller
                name="company"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    id="company"
                    options={companyOptions}
                    {...field}
                    className="text-black"
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="position" className="block">
                Post
              </label>
              <Controller
                name="position"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    id="position"
                    isDisabled={positionsQuery.isLoading}
                    options={positionOptions}
                    {...field}
                    className="text-black"
                  />
                )}
              />
            </div>

            <TextField
              name="title"
              label="Titlu"
              required
              register={register}
              errors={errors}
            />

            <TextField
              name="tallyLink"
              label="Tally Link"
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

            {/* <QuestionsEditor /> */}
          </div>

          <SubmitButton
            label="Adaugă"
            disabled={mutation.isLoading}
            className="mt-6"
          />

          {mutation.error && (
            <div className="mt-3 text-red-400">{mutation.error.message}</div>
          )}
        </form>
      </FormProvider>
    </>
  );
};

export default AdminNewTechnicalTestPage;

AdminNewTechnicalTestPage.getLayout = (page: ReactElement) => (
  <Layout title="Adaugă un nou test tehnic">{page}</Layout>
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
