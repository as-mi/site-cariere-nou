import { useCallback, useMemo } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import Button from "~/components/pages/admin/common/button";

type CreateFakeObjectButtonProps = {
  label: string;
  createFakeObjectProcedure: {
    useMutation: ({ onSuccess }: { onSuccess: () => void }) => {
      isLoading: boolean;
      mutate: () => void;
    };
  };
  invalidateQueryProcedure: {
    useQuery: (params: any, options: any) => any;
  };
};

const CreateFakeUserButton: React.FC<CreateFakeObjectButtonProps> = ({
  label,
  createFakeObjectProcedure,
  invalidateQueryProcedure,
}) => {
  const queryClient = useQueryClient();

  const invalidateQueryKey = useMemo(
    () => getQueryKey(invalidateQueryProcedure as any),
    [invalidateQueryProcedure],
  );

  const onSuccess = useCallback(
    () => queryClient.invalidateQueries(invalidateQueryKey),
    [queryClient, invalidateQueryKey],
  );

  const mutation = createFakeObjectProcedure.useMutation({ onSuccess });

  return (
    <Button disabled={mutation.isLoading} onClick={() => mutation.mutate()}>
      {label}
    </Button>
  );
};

export default CreateFakeUserButton;
