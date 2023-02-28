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
  NumberField,
  CheckboxField,
} from "~/components/pages/admin/forms";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import { trpc } from "~/lib/trpc";

type PageProps = {
  positionId: number;
};

type Option = { value: number; label: string };

type EditPositionFieldValues = {
  title: string;
  order: number;
  category: string;
  requiredSkills: string;
  workSchedule: string;
  workModel: string;
  duration: string;
  description: string;
  activeTechnicalTest: Option;
  technicalTestIsMandatory?: boolean;
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
    watch,
    reset,
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<EditPositionFieldValues>();

  const activeTechnicalTest = watch("activeTechnicalTest");

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

  const technicalTestOptions = useMemo(() => {
    if (!technicalTestsQuery.data) {
      return [];
    }

    return technicalTestsQuery.data.map((technicalTest) => ({
      value: technicalTest.id,
      label: technicalTest.title,
    }));
  }, [technicalTestsQuery.data]);

  useEffect(() => {
    if (query.data && technicalTestsQuery.data) {
      const { activeTechnicalTestId } = query.data;
      const technicalTests = technicalTestsQuery.data;

      let activeTechnicalTest;
      if (activeTechnicalTestId) {
        activeTechnicalTest = {
          value: activeTechnicalTestId,
          label:
            technicalTests.find(
              (technicalTest) => technicalTest.id === activeTechnicalTestId
            )?.title || "Necunoscut",
        };
      }

      reset({
        ...query.data,
        order: query.data.order || undefined,
        activeTechnicalTest,
      });
    }
  }, [query.data, technicalTestsQuery.data, reset]);

  if (!query.data || !technicalTestsQuery.data) {
    return <p>Se încarcă...</p>;
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
          <NumberField
            name="order"
            label="Indice de ordine"
            placeholder="1, 2, 3, ..."
            required
            register={register}
            errors={errors}
          />
          <TextField
            name="category"
            label="Categorie"
            hint="În ce categorie de activitate se încadrează postul."
            register={register}
            errors={errors}
          />
          <TextField
            name="requiredSkills"
            label="Skill-uri necesare"
            hint="Ce skill-uri ar trebui să aibe candidații care vor să aplice pe acest post."
            register={register}
            errors={errors}
          />
          <TextField
            name="workSchedule"
            label="Program de lucru"
            hint="Part time (4/6 ore), full time, dacă programul este flexibil sau nu."
            register={register}
            errors={errors}
          />
          <TextField
            name="workModel"
            label="Mod de lucru"
            hint="Dacă este fizic/remote/hibrid și în ce măsură."
            register={register}
            errors={errors}
          />
          <TextField
            name="duration"
            label="Durată"
            hint="Cât de mult o să dureze angajarea (e.g.: 3 luni, două săptămâni, toată vara, perioadă nedeterminată etc.)"
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
          {activeTechnicalTest && (
            <CheckboxField
              name="technicalTestIsMandatory"
              label="Completarea testului tehnic este obligatorie pentru a aplica"
              register={register}
              errors={errors}
            />
          )}
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

  const positionId = parseInt(id);
  if (Number.isNaN(positionId)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      session,
      positionId,
    },
  };
};
