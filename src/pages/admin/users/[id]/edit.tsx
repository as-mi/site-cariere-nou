import { ReactElement, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { Role } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import {
  EmailField,
  PasswordField,
  SelectField,
  SubmitButton,
  TextField,
} from "~/components/pages/admin/forms";

import { trpc } from "~/lib/trpc";

type PageProps = {
  userId: number;
};

type EditUserFieldValues = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

const AdminEditUserPage: NextPageWithLayout<PageProps> = ({ userId }) => {
  const [successfullySaved, setSuccessfullySaved] = useState(false);

  const query = trpc.admin.userRead.useQuery({ id: userId });

  const mutation = trpc.admin.userUpdate.useMutation({
    onSuccess: () => setSuccessfullySaved(true),
  });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFieldValues>();

  const onSubmit: SubmitHandler<EditUserFieldValues> = (data) => {
    setSuccessfullySaved(false);
    mutation.mutate({
      id: userId,
      ...data,
    });
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
        <Link href="/admin/users">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Editează un utilizator existent
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
          <EmailField
            name="email"
            label="Adresă de e-mail"
            required
            register={register}
            errors={errors}
          />
          <PasswordField
            name="password"
            label="Parolă"
            hint="Dacă lași acest câmp gol, nu se va modifica parola curentă a utilizatorului"
            register={register}
            errors={errors}
          />
          <SelectField
            name="role"
            label="Rol"
            hint="Utilizatorul va trebui să se re-autentifice pentru a observa modificările în urma schimbării rolului"
            options={[
              { value: Role.PARTICIPANT, label: "Participant" },
              { value: Role.RECRUITER, label: "Recruiter" },
              { value: Role.ADMIN, label: "Admin" },
            ]}
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

export default AdminEditUserPage;

AdminEditUserPage.getLayout = (page: ReactElement) => (
  <Layout title="Editează un utilizator existent">{page}</Layout>
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

  const userId = parseInt(id);
  if (Number.isNaN(id)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      userId,
    },
  };
};
