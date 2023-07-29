import { ReactElement, useEffect, useMemo } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import Select from "react-select";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import {
  NumberField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "~/components/pages/admin/forms";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import { trpc } from "~/lib/trpc";

type AddPositionFieldValues = {
  company: { value: number; label: string };
  title: string;
  order: number;
  category: string;
  requiredSkills: string;
  workSchedule: string;
  workModel: string;
  duration: string;
  description: string;
};

const AdminNewPositionPage: NextPageWithLayout = () => {
  const router = useRouter();

  // When using the "Add new position" button on a company's page,
  // the company's ID is passed in as a query string parameter
  const companyId = useMemo(() => {
    if (typeof router.query.companyId === "string") {
      return parseInt(router.query.companyId);
    }
  }, [router.query.companyId]);

  const companiesQuery = trpc.admin.company.getAll.useQuery();

  const companyOptions = useMemo(() => {
    if (!companiesQuery.data) {
      return [];
    }

    return companiesQuery.data.map((company) => ({
      value: company.id,
      label: company.name,
    }));
  }, [companiesQuery.data]);

  const mutation = trpc.admin.position.create.useMutation({
    onSuccess: () => {
      router.push("/admin/positions");
    },
  });

  const {
    setValue,
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddPositionFieldValues>();

  const onSubmit: SubmitHandler<AddPositionFieldValues> = (data) => {
    const payload = {
      ...data,
      company: undefined,
      companyId: data.company.value,
    };
    mutation.mutate(payload);
  };

  useEffect(() => {
    if (companyOptions && companyId) {
      const companyOption = companyOptions.find(
        (option) => option.value === companyId,
      );

      if (!companyOption) {
        return;
      }

      setValue("company", companyOption);
    }
  }, [companyOptions, companyId, setValue]);

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
        <Link href="/admin/positions">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Adaugă un nou post
        </h1>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
        <div className="space-y-3">
          <div>
            <label htmlFor="company" className="block">
              Companie
            </label>
            <Controller
              name="company"
              control={control}
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
    </>
  );
};

export default AdminNewPositionPage;

AdminNewPositionPage.getLayout = (page: ReactElement) => (
  <Layout title="Adaugă un nou post">{page}</Layout>
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
