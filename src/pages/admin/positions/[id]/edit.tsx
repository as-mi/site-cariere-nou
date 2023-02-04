import { ReactElement, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Link from "next/link";

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
  positionId: number;
};

type EditPositionFieldValues = {
  title: string;
  description: string;
};

const AdminEditPositionPage: NextPageWithLayout<PageProps> = ({
  positionId,
}) => {
  const [successfullySaved, setSuccessfullySaved] = useState(false);

  const query = trpc.admin.position.read.useQuery({ id: positionId });

  const mutation = trpc.admin.position.update.useMutation({
    onSuccess: () => setSuccessfullySaved(true),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPositionFieldValues>();

  const onSubmit: SubmitHandler<EditPositionFieldValues> = async (data) => {
    setSuccessfullySaved(false);

    const payload = {
      id: positionId,
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
