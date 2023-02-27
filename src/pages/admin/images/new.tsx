import { ReactElement, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Link from "next/link";
import { useRouter } from "next/router";

import { PackageType } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import {
  CheckboxField,
  FileField,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "~/components/pages/admin/forms";

type AddImageFieldValues = {
  file: FileList;
};

const AdminNewImagePage: NextPageWithLayout = () => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AddImageFieldValues>();

  const onSubmit: SubmitHandler<AddImageFieldValues> = async (data) => {
    setIsUploadingImage(true);

    let logoImageId: number | undefined;
    try {
      const formData = new FormData();
      formData.append("file", data.file[0]);

      const options = {
        method: "POST",
        body: formData,
      };
      const response = await fetch("/api/images/upload", options);
      if (!response.ok) {
        throw new Error(
          `Failed to upload image: status code ${response.status}`
        );
      }

      const { id } = await response.json();

      if (!id) {
        throw new Error("Failed to upload image, back end returned no ID");
      }

      if (typeof id !== "number") {
        throw new Error(
          "Back end did not return an image ID of the expected type"
        );
      }
    } catch (e) {
      if (e instanceof Error) {
        setFileUploadError(e.message);
      } else {
        setFileUploadError("Failed to upload image");
      }
      return;
    }

    setIsUploadingImage(false);

    router.push("/admin/images");
  };

  return (
    <>
      <header>
        <Link href="/admin/images">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Încarcă o nouă imagine
        </h1>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
        <FileField
          name="file"
          label="Imagine"
          accept="image/png, image/jpeg"
          required
          register={register}
          errors={errors}
        />

        <SubmitButton
          label="Încarcă"
          disabled={isUploadingImage}
          className="mt-6"
        />

        {fileUploadError && (
          <div className="my-3 text-red-400">{fileUploadError}</div>
        )}
      </form>
    </>
  );
};

export default AdminNewImagePage;

AdminNewImagePage.getLayout = (page: ReactElement) => (
  <Layout title="Încarcă o nouă imagine">{page}</Layout>
);
