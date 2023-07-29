import { useCallback } from "react";

import { trpc } from "~/lib/trpc";

import Button from "~/components/pages/admin/common/button";

const RevalidateHomePageButton: React.FC = () => {
  const revalidateHomePageMutation = trpc.admin.revalidateHomePage.useMutation({
    onSuccess: () => {
      alert("Prima pagină a fost actualizată cu succes!");
    },
  });

  const handleRevalidation = useCallback(
    () => revalidateHomePageMutation.mutate(),
    [revalidateHomePageMutation],
  );

  return <Button onClick={handleRevalidation}>Regenerează prima pagină</Button>;
};

export default RevalidateHomePageButton;
