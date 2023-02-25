import { SubmitHandler, useForm } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { TFunction, useTranslation } from "next-i18next";

import useRole from "~/hooks/use-role";

import { PHONE_NUMBER_PATTERN } from "~/lib/phone-numbers";
import { trpc } from "~/lib/trpc";

import type { ContactInfo } from "./common";

type ContactInfoEditFormProps = {
  t: TFunction;
  contactInfo: ContactInfo;
  onCancel: () => void;
  onSuccess: () => void;
};

type ContactInfoFieldValues = ContactInfo;

const ContactInfoEditForm: React.FC<ContactInfoEditFormProps> = ({
  t,
  contactInfo,
  onCancel,
  onSuccess,
}) => {
  const { t: commonT } = useTranslation("common");

  const role = useRole();

  const queryClient = useQueryClient();

  const mutation = trpc.participant.profileUpdate.useMutation({
    onSuccess: (_, variables) => {
      const queryKey = getQueryKey(trpc.common.profileRead, undefined, "query");
      queryClient.setQueryData(queryKey, {
        ...contactInfo,
        ...variables,
      });
      onSuccess();
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ContactInfoFieldValues>({
    defaultValues: {
      name: contactInfo.name,
      phoneNumber: contactInfo.phoneNumber,
    },
  });

  const onSubmit: SubmitHandler<ContactInfoFieldValues> = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="py-2">
        <span className="font-semibold">{t("fields.email")}:</span>
        <span className="ml-2">{contactInfo.email}</span>
      </div>
      <div>
        <label htmlFor="name">
          <span className="font-semibold">{t("fields.name")}:</span>
        </label>
        <input
          id="name"
          type="text"
          {...register("name", { required: true })}
          className="m-1 rounded-md bg-gray-200 p-1"
        />
        {errors.name?.type === "required" && (
          <div>{commonT("forms.required")}</div>
        )}
      </div>
      <div>
        <label htmlFor="phoneNumber">
          <span className="font-semibold">{t("fields.phoneNumber")}</span>:
        </label>
        <input
          id="phoneNumber"
          type="tel"
          {...register("phoneNumber", {
            required: true,
            pattern: PHONE_NUMBER_PATTERN,
          })}
          className="m-1 rounded-md bg-gray-200 p-1"
        />
        <div className="text-sm text-zinc-800">
          Exemplu de format acceptat:{" "}
          <span className="text-zinc-900">0712.345.678</span>
        </div>
        {errors.phoneNumber?.type === "required" && (
          <div>{commonT("forms.required")}</div>
        )}
        {errors.phoneNumber?.type === "pattern" && (
          <div>{commonT("forms.pattern")}</div>
        )}
      </div>
      {process.env.NODE_ENV === "development" && role && (
        <div className="py-2">
          <span className="font-semibold">{t("fields.role")}:</span>{" "}
          {role.toLowerCase()}
        </div>
      )}
      <div className="my-3 space-x-3">
        <button
          type="submit"
          className="rounded-md bg-blue-700 px-3 py-2 text-center text-white hover:bg-blue-800 active:bg-blue-900"
        >
          {t("profileUpdateForm.submit")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-zinc-700 px-3 py-2 text-center text-white hover:bg-zinc-800 active:bg-zinc-900"
        >
          {t("profileUpdateForm.cancel")}
        </button>
      </div>
      {mutation.error && (
        <div className="mt-3 text-red-600">{mutation.error.message}</div>
      )}
    </form>
  );
};

export default ContactInfoEditForm;
