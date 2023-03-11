import { ReactElement, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import { trpc } from "~/lib/trpc";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";
import { FileField, SubmitButton } from "~/components/pages/admin/forms";
import UploadedImage from "~/components/common/uploaded-image";
import classNames from "classnames";

type PageProps = {
  imageId: number;
};

type EditImageFieldValues = {
  file: FileList;
};

const AdminEditImagePage: NextPageWithLayout<PageProps> = ({ imageId }) => {
  const query = trpc.admin.image.read.useQuery({ id: imageId });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");
  const [imageBackgroundColor, setImageBackgroundColor] = useState<
    "white" | "black"
  >("white");
  const [imageVersion, setImageVersion] = useState(1);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditImageFieldValues>();

  const onSubmit: SubmitHandler<EditImageFieldValues> = async (data) => {
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("id", imageId.toString());
      formData.append("file", data.file[0]);

      const options = {
        method: "PUT",
        body: formData,
      };
      const response = await fetch("/api/images/upload", options);
      if (!response.ok) {
        throw new Error(
          `Failed to upload image: status code ${response.status}`
        );
      }
    } catch (e) {
      if (e instanceof Error) {
        setFileUploadError(e.message);
      } else {
        setFileUploadError("Failed to upload image");
      }
      setIsUploadingImage(false);
      return;
    }

    router.push("/admin/images");
  };

  if (query.isLoading) {
    return <p>Se încarcă...</p>;
  }

  if (!query.data) {
    return (
      <p>
        Eroare la încărcarea datelor:
        {query.error ? `: ${query.error.message}` : ""}
      </p>
    );
  }

  const image = query.data;

  return (
    <>
      <header>
        <Link href="/admin/images">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Înlocuiește o imagine existentă
        </h1>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
        <div>
          <FileField
            name="file"
            label="Imagine"
            accept="image/png, image/jpeg"
            required
            register={register}
            errors={errors}
          />
          <div className="mx-auto mt-6 mb-8 max-w-xs">
            <UploadedImage
              imageId={imageId}
              width={image.width}
              height={image.height}
              alt="Imaginea încărcată"
              queryString={`v=${imageVersion}`}
              className={classNames(
                "max-h-32 rounded-md object-contain p-4 transition-colors duration-500",
                imageBackgroundColor === "white" ? "bg-white" : "bg-black"
              )}
            />
          </div>
          <label className="align-middle">
            <input
              type="checkbox"
              checked={imageBackgroundColor === "white"}
              onChange={() =>
                setImageBackgroundColor(
                  imageBackgroundColor === "white" ? "black" : "white"
                )
              }
              className="mr-2 h-4 w-4"
            />
            Afișează previzualizarea imaginii pe un fundal alb
          </label>
        </div>

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

export default AdminEditImagePage;

AdminEditImagePage.getLayout = (page: ReactElement) => (
  <Layout title="Editează o imagine">{page}</Layout>
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

  const imageId = parseInt(id);
  if (Number.isNaN(imageId)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      session,
      imageId,
    },
  };
};
