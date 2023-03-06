import { ReactElement } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { EventKind } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import {
  DateField,
  SelectField,
  SubmitButton,
  TextField,
} from "~/components/pages/admin/forms";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import { trpc } from "~/lib/trpc";

type AddEventFieldValues = {
  name: string;
  kind: EventKind;
  location: string;
  date: string;
  time: string;
  facebookEventUrl: string;
};

const AdminNewEventPage: NextPageWithLayout = () => {
  const router = useRouter();

  const mutation = trpc.admin.event.create.useMutation({
    onSuccess: () => {
      router.push("/admin/events");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddEventFieldValues>();

  const onSubmit: SubmitHandler<AddEventFieldValues> = (data) => {
    const payload = {
      ...data,
      date: new Date(data.date),
    };
    mutation.mutate(payload);
  };

  return (
    <>
      <header>
        <Link href="/admin/events">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Adaugă un nou eveniment
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
          <SelectField
            name="kind"
            label="Tip eveniment"
            options={[
              { value: EventKind.WORKSHOP, label: "Workshop" },
              { value: EventKind.PRESENTATION, label: "Prezentare" },
            ]}
            required
            register={register}
            errors={errors}
          />
          <TextField
            name="location"
            label="Locație"
            register={register}
            errors={errors}
          />
          <DateField
            name="date"
            label="Data"
            required
            register={register}
            errors={errors}
          />
          <TextField
            name="time"
            label="Intervalul orar / ora de începere"
            register={register}
            errors={errors}
          />
          <TextField
            name="facebookEventUrl"
            label="Link eveniment pe Facebook"
            register={register}
            errors={errors}
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

export default AdminNewEventPage;

AdminNewEventPage.getLayout = (page: ReactElement) => (
  <Layout title="Adaugă un nou eveniment">{page}</Layout>
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
