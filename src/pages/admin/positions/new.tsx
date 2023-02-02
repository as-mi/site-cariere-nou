import { ReactElement, useMemo } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import Link from "next/link";
import { useRouter } from "next/router";

import Select from "react-select";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import {
  SubmitButton,
  TextAreaField,
  TextField,
} from "~/components/pages/admin/forms";

import { trpc } from "~/lib/trpc";

type AddPositionFieldValues = {
  company: { value: number; label: string };
  title: string;
  description: string;
};

const AdminNewPositionPage: NextPageWithLayout = () => {
  const router = useRouter();

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
            <Controller
              name="company"
              control={control}
              render={({ field }) => (
                <Select
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
