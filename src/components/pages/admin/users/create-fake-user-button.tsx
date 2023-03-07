import { useCallback } from "react";

import { getQueryKey } from "@trpc/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/lib/trpc";

import Button from "~/components/pages/admin/common/button";

const CreateFakeUserButton: React.FC = () => {
  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    const queryKey = getQueryKey(trpc.admin.user.readMany);
    queryClient.invalidateQueries(queryKey);
  }, [queryClient]);

  const mutation = trpc.admin.user.createFakeUser.useMutation({
    onSuccess,
  });

  return (
    <Button disabled={mutation.isLoading} onClick={() => mutation.mutate()}>
      Generează un nou utilizator cu date fake
    </Button>
  );
};

export default CreateFakeUserButton;
