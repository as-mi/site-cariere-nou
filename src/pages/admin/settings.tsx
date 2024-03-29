import { Fragment, ReactElement, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import _ from "lodash";

import { GetServerSideProps } from "next";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { Role, SettingValue } from "@prisma/client";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";
import { trpc } from "~/lib/trpc";
import { SETTINGS, Setting } from "~/lib/settings";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import { SubmitButton, TextAreaField } from "~/components/pages/admin/forms";
import CheckboxField from "~/components/pages/admin/forms/checkbox-field";

type SettingsEditorProps = {
  setting: Setting;
  value: string;
};

type SettingEditorFieldValues = {
  value: string;
};

const SettingEditor = ({ setting, value }: SettingsEditorProps) => {
  const [successfullySaved, setSuccessfullySaved] = useState(false);

  const queryClient = useQueryClient();
  const mutation = trpc.admin.setting.update.useMutation({
    onSuccess: () => {
      setSuccessfullySaved(true);

      const queryKey = getQueryKey(
        trpc.admin.setting.getAll,
        undefined,
        "query",
      );
      queryClient.invalidateQueries(queryKey);
    },
  });

  useEffect(() => {
    if (successfullySaved) {
      const handle = setTimeout(() => setSuccessfullySaved(false), 3000);
      return () => {
        clearTimeout(handle);
      };
    }
  }, [successfullySaved]);

  const valueType = typeof JSON.parse(value);
  if (valueType === "boolean") {
    value = JSON.parse(value);
  }

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SettingEditorFieldValues>({
    defaultValues: {
      value,
    },
  });

  const onSubmit: SubmitHandler<SettingEditorFieldValues> = (data) => {
    setSuccessfullySaved(false);

    if (valueType === "boolean") {
      data.value = JSON.stringify(data.value);
    }

    mutation.mutate({ key: setting.key, value: data.value });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="font-display text-xl">{setting.label}</h2>
      <p className="mt-2">
        <code>{setting.key}</code>
      </p>
      {setting.hint && <p className="mt-2 text-sm">{setting.hint}</p>}
      {valueType === "boolean" ? (
        <CheckboxField
          label="Valoare"
          name="value"
          register={register}
          errors={errors}
          wrapperClassName="mt-3"
        />
      ) : (
        <TextAreaField
          label="Valoare"
          name="value"
          required
          register={register}
          errors={errors}
          wrapperClassName="mt-3"
        />
      )}
      <SubmitButton label="Salvează" className="mt-3" />

      {mutation.error && (
        <div className="mt-3 text-red-400">{mutation.error.message}</div>
      )}
      {successfullySaved && (
        <div className="mt-3 text-green-400">Salvat cu succes!</div>
      )}
    </form>
  );
};

type PageProps = {
  initialData: Record<string, SettingValue>;
};

const AdminSettingsPage: NextPageWithLayout<PageProps> = ({ initialData }) => {
  const knownSettingsCount = Object.keys(SETTINGS).length;

  const query = trpc.admin.setting.getAll.useQuery(undefined, {
    initialData,
    staleTime: 200,
  });

  if (query.isLoading) {
    return <p>Se încarcă...</p>;
  }

  if (!query.data) {
    return <p>Eroare la încărcarea datelor</p>;
  }

  const settingValuesByKey = query.data;

  const settingEditors = Object.entries(SETTINGS).map(([key, setting]) => {
    let value = settingValuesByKey[key]?.value;
    if (value === undefined) {
      const result = setting.schema.safeParse(undefined);
      if (result.success) {
        value = result.data;
      }
    }

    value = JSON.stringify(value);

    return <SettingEditor key={key} setting={setting} value={value} />;
  });

  return (
    <>
      <header>
        <h1 className="my-2 font-display text-3xl">Setări</h1>
        <p className="my-2">
          {knownSettingsCount == 1
            ? `Există o setare disponibilă`
            : `Sunt ${knownSettingsCount} setări disponibile`}
          .
        </p>
      </header>
      <div className="max-w-md space-y-6">
        <hr />
        {settingEditors.map((editor) => (
          <Fragment key={editor.key}>
            {editor}
            <hr />
          </Fragment>
        ))}
      </div>
    </>
  );
};

export default AdminSettingsPage;

AdminSettingsPage.getLayout = (page: ReactElement) => (
  <Layout title="Setări">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
  resolvedUrl,
}) => {
  const session = await getServerSession(req, res);

  const returnUrl = resolvedUrl;

  if (!session || !session.user) {
    return redirectToLoginPage(returnUrl);
  }

  if (session.user.role !== Role.ADMIN) {
    return {
      props: {
        session,
        initialData: {},
      },
    };
  }

  const settingValues = await prisma.settingValue.findMany();
  const settingValuesByKey = _.keyBy(
    settingValues,
    (settingValue) => settingValue.key,
  );

  return {
    props: {
      session,
      initialData: settingValuesByKey,
    },
  };
};
