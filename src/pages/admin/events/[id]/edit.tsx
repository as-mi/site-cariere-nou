import { ReactElement, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { GetServerSideProps } from "next";
import Link from "next/link";

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

type PageProps = {
  eventId: number;
};

type EditEventFieldValues = {
  name: string;
  kind: EventKind;
  location: string;
  date: string;
  time: string;
  facebookEventUrl: string;
};

const AdminEditEventPage: NextPageWithLayout<PageProps> = ({ eventId }) => {
  const [successfullySaved, setSuccessfullySaved] = useState(false);

  const query = trpc.admin.event.read.useQuery({ id: eventId });

  const mutation = trpc.admin.event.update.useMutation({
    onSuccess: () => setSuccessfullySaved(true),
  });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditEventFieldValues>();

  const onSubmit: SubmitHandler<EditEventFieldValues> = (data) => {
    setSuccessfullySaved(false);
    mutation.mutate({
      id: eventId,
      ...data,
      date: new Date(data.date),
    });
  };

  useEffect(() => {
    if (query.data) {
      const data = query.data;
      const values = {
        ...data,
        date: new Date(data.date).toISOString().split("T")[0],
      };
      reset(values);
    }
  }, [query.data, reset]);

  if (!query.data) {
    return <p>Se încarcă...</p>;
  }

  return (
    <>
      <header>
        <Link href="/admin/events">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Editează un eveniment existent
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

export default AdminEditEventPage;

AdminEditEventPage.getLayout = (page: ReactElement) => (
  <Layout title="Editează un utilizator existent">{page}</Layout>
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

  const eventId = parseInt(id);
  if (Number.isNaN(eventId)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      session,
      eventId,
    },
  };
};
