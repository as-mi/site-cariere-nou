import { SubmitHandler, useForm } from "react-hook-form";

import { TFunction, useTranslation } from "next-i18next";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { trpc } from "~/lib/trpc";

import ConsentCheckbox from "~/components/forms/consent-checkbox";
import { useEffect } from "react";

type Options = {
  applyToOtherPartners: boolean;
};

type OptionsSectionProps = {
  t: TFunction;
  initialData?: Options;
};

const OptionsSection: React.FC<OptionsSectionProps> = ({ t, initialData }) => {
  const { t: commonT } = useTranslation("common");

  const queryClient = useQueryClient();

  const query = trpc.participant.optionsGet.useQuery(undefined, {
    initialData,
  });

  const mutation = trpc.participant.optionsUpdate.useMutation({
    onSuccess: (_, variables) => {
      const queryKey = getQueryKey(
        trpc.participant.optionsGet,
        undefined,
        "query"
      );
      queryClient.setQueryData(queryKey, variables);
    },
  });

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<Options>();

  const onSubmit: SubmitHandler<Options> = (options) => {
    mutation.mutate(options);
  };

  useEffect(() => {
    if (query.data) {
      reset(query.data);
    }
  }, [query.data, reset]);

  if (query.isLoading) {
    return <p>{commonT("loading")}</p>;
  }

  if (!query.data) {
    return <p>{commonT("errors.loadingError")}</p>;
  }

  return (
    <section>
      <h2 className="font-display text-xl font-semibold">
        {t("optionsSectionTitle")}
      </h2>
      <form
        onChange={() => handleSubmit(onSubmit)()}
        onSubmit={(event) => event.preventDefault()}
      >
        <ConsentCheckbox
          name="applyToOtherPartners"
          label={t("options.applyToOtherPartners")!}
          register={register}
          fieldErrors={errors.applyToOtherPartners}
        />
      </form>
    </section>
  );
};

export default OptionsSection;
