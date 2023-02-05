import { ReactElement, useEffect, useMemo } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  useFieldArray,
  useForm,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";

import Link from "next/link";
import { useRouter } from "next/router";

import Select from "react-select";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import {
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "~/components/pages/admin/forms";

import { trpc } from "~/lib/trpc";

enum QuestionType {
  SHORT_TEXT = "shortText",
  LONG_TEXT = "longText",
  SINGLE_CHOICE = "singleChoice",
}

type Choice = {
  id: number;
  label: string;
};

type Question = {
  id: number;
  title: string;
  details: string;
  type: QuestionType;
  choices?: Choice[];
};

type AddTechnicalTestFieldValues = {
  company: Option;
  position: Option;
  title: string;
  description: string;
  questions: Question[];
};

type TechnicalTestQuestionChoicesEditorProps = {
  control: Control<AddTechnicalTestFieldValues>;
  register: UseFormRegister<AddTechnicalTestFieldValues>;
  errors: FieldErrors<AddTechnicalTestFieldValues>;
  questionIndex: number;
};

const TechnicalTestQuestionChoicesEditor: React.FC<
  TechnicalTestQuestionChoicesEditorProps
> = ({ control, register, errors, questionIndex }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.choices`,
    rules: { required: true },
  });

  const addNewChoice = () => {
    append({
      id: Math.floor(Math.random() * 65536),
      label: "",
    });
  };

  const removeChoice = (choiceIndex: number) => {
    remove(choiceIndex);
  };

  return (
    <div>
      <h4>Variante de răspuns</h4>

      <div className="space-y-1 p-2">
        {fields.map((choice, choiceIndex) => (
          <div key={choice.id} className="flex flex-row">
            <div className="pr-2">
              <button
                onClick={() => removeChoice(choiceIndex)}
                className="hover:text-zinc-500 active:text-zinc-600"
              >
                <FontAwesomeIcon icon={faClose} className="h-4 w-4" />
              </button>
            </div>
            <TextField
              name={`questions.${questionIndex}.choices.${choiceIndex}.label`}
              label="Variantă"
              required
              register={register}
              errors={errors}
            />
          </div>
        ))}
      </div>

      <button
        onClick={addNewChoice}
        className="rounded-md bg-zinc-800 py-1 px-2 text-sm hover:bg-zinc-700 active:bg-zinc-600"
      >
        Adaugă o nouă variantă de răspuns
      </button>

      {errors.questions?.[questionIndex]?.choices?.root?.type ===
        "required" && (
        <p className="mt-2 text-sm">
          Trebuie adăugată cel puțin o variantă de răspuns
        </p>
      )}
    </div>
  );
};

type TechnicalTestQuestionEditorProps = {
  index: number;
  control: Control<AddTechnicalTestFieldValues>;
  watch: UseFormWatch<AddTechnicalTestFieldValues>;
  register: UseFormRegister<AddTechnicalTestFieldValues>;
  errors: FieldErrors<AddTechnicalTestFieldValues>;
};

const questionTypeOptions = [
  { value: QuestionType.SINGLE_CHOICE, label: "Alegere unică" },
  { value: QuestionType.SHORT_TEXT, label: "Text scurt" },
  { value: QuestionType.LONG_TEXT, label: "Text lung" },
];

const TechnicalTestQuestionEditor: React.FC<
  TechnicalTestQuestionEditorProps
> = ({ index, control, watch, register, errors }) => {
  const watchQuestionType = watch(`questions.${index}.type`);

  return (
    <div>
      <h3 className="font-display text-lg font-semibold">
        Întrebarea #{index + 1}
      </h3>
      <div className="space-y-2 py-2">
        <TextField
          name={`questions.${index}.title`}
          label="Titlu"
          required
          register={register}
          errors={errors}
        />

        <TextAreaField
          name={`questions.${index}.details`}
          label="Detalii"
          register={register}
          errors={errors}
        />

        <SelectField
          name={`questions.${index}.type`}
          label="Tip întrebare"
          options={questionTypeOptions}
          register={register}
          errors={errors}
        />

        {watchQuestionType === QuestionType.SINGLE_CHOICE && (
          <TechnicalTestQuestionChoicesEditor
            control={control}
            register={register}
            errors={errors}
            questionIndex={index}
          />
        )}
      </div>
    </div>
  );
};

type TechnicalTestQuestionsEditorProps = {
  control: Control<AddTechnicalTestFieldValues>;
  watch: UseFormWatch<AddTechnicalTestFieldValues>;
  register: UseFormRegister<AddTechnicalTestFieldValues>;
  errors: FieldErrors<AddTechnicalTestFieldValues>;
};

const TechnicalTestQuestionsEditor: React.FC<
  TechnicalTestQuestionsEditorProps
> = ({ control, watch, register, errors }) => {
  const { fields, append } = useFieldArray({
    control,
    name: "questions",
    rules: { required: true },
  });

  const addNewQuestion = () => {
    append({
      id: Math.floor(Math.random() * 65536),
      title: "",
      details: "",
      type: QuestionType.SINGLE_CHOICE,
    });
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Întrebări</h2>
      <div className="pl-2 pt-1">
        {fields.map((question, index) => (
          <TechnicalTestQuestionEditor
            key={question.id}
            index={index}
            control={control}
            watch={watch}
            register={register}
            errors={errors}
          />
        ))}
      </div>
      <button
        onClick={addNewQuestion}
        className="mt-3 rounded-md bg-zinc-800 py-2 px-3 hover:bg-zinc-700 active:bg-zinc-600"
      >
        Adaugă o nouă intrebare
      </button>
      {errors.questions?.root?.type === "required" && (
        <p className="mt-3">Trebuie adăugată cel puțin o întrebare</p>
      )}
    </div>
  );
};

type EntityId = number;
type Option = { value: EntityId; label: string };

const AdminNewTechnicalTestPage: NextPageWithLayout = () => {
  const mutation = trpc.admin.technicalTest.create.useMutation({
    onSuccess: () => {
      router.push("/admin/technical-tests");
    },
  });

  const {
    watch,
    resetField,
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<AddTechnicalTestFieldValues>();

  const watchCompany = watch("company");
  const companyId: number | undefined = watchCompany?.value;

  const onSubmit: SubmitHandler<AddTechnicalTestFieldValues> = (data) => {
    // const positionId = parseInt(data.position.value as unknown as string);
    const positionId = data.position.value;
    const payload = {
      positionId,
      title: data.title,
      description: data.description,
      questions: data.questions,
    };
    console.log(payload);
    mutation.mutate(payload);
  };

  const router = useRouter();

  const companiesQuery = trpc.admin.company.getAll.useQuery();
  const positionsQuery = trpc.admin.position.getAll.useQuery(
    {
      companyId,
    },
    {
      enabled: !!companyId,
    }
  );

  const companyOptions = useMemo(() => {
    if (!companiesQuery.data) {
      return [];
    }

    return companiesQuery.data.map((company) => ({
      value: company.id,
      label: company.name,
    }));
  }, [companiesQuery.data]);

  const positionOptions = useMemo(() => {
    if (!positionsQuery.data) {
      return [];
    }

    return positionsQuery.data.map((position) => ({
      value: position.id,
      label: position.title,
    }));
  }, [positionsQuery.data]);

  useEffect(() => {
    if (!companyId) {
      resetField("position", { defaultValue: null });
    }
  }, [resetField, companyId]);

  if (companiesQuery.isLoading) {
    return <p>Se încarcă...</p>;
  }

  if (!companiesQuery.data) {
    return (
      <p>
        Eroare la încărcarea companiilor din baza de date:{" "}
        {companiesQuery.error.message}
      </p>
    );
  }

  return (
    <>
      <header>
        <Link href="/admin/technical-tests">Înapoi</Link>
        <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
          Adaugă un nou test tehnic
        </h1>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
        <div className="space-y-3">
          <div>
            <label htmlFor="company" className="block">
              Companie
            </label>
            <Controller
              name="company"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  id="company"
                  options={companyOptions}
                  {...field}
                  className="text-black"
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="position" className="block">
              Post
            </label>
            <Controller
              name="position"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  id="position"
                  isDisabled={positionsQuery.isLoading}
                  options={positionOptions}
                  {...field}
                  className="text-black"
                />
              )}
            />
          </div>

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

          <TechnicalTestQuestionsEditor
            control={control}
            watch={watch}
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

export default AdminNewTechnicalTestPage;

AdminNewTechnicalTestPage.getLayout = (page: ReactElement) => (
  <Layout title="Adaugă un nou test tehnic">{page}</Layout>
);
