import { ReactElement } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Link from "next/link";
import { useRouter } from "next/router";

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

type AddUserFieldValues = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

const AdminNewUserPage: NextPageWithLayout = () => {
  const router = useRouter();

  const mutation = trpc.admin.userCreate.useMutation({
    onSuccess: () => {
      router.push("/admin/users");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddUserFieldValues>();

  const onSubmit: SubmitHandler<AddUserFieldValues> = (data) => {
    mutation.mutate(data);
  };

  return (
    <>
      <header>
        <Link href="/admin/users">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Adaugă un nou utilizator
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
            hint="Dacă lași acest câmp gol, utilizatorul va trebui să-și reseteze parola înainte de prima autentificare"
            register={register}
            errors={errors}
          />
          <SelectField
            name="role"
            label="Rol"
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

export default AdminNewUserPage;

AdminNewUserPage.getLayout = (page: ReactElement) => (
  <Layout title="Adaugă un nou utilizator">{page}</Layout>
);
