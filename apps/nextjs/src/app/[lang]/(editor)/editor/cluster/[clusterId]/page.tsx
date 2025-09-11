import { notFound, redirect } from "next/navigation";
// Temporarily disable database imports to avoid connection issues during build
// import type { User } from "@saasfly/auth";
// import { authOptions, getCurrentUser } from "@saasfly/auth";
// import { db } from "@saasfly/db";
// import { ClusterConfig } from "~/components/k8s/cluster-config";
// import type { Cluster } from "~/types/k8s";

/*
async function getClusterForUser(clusterId: Cluster["id"], userId: User["id"]) {
  return await db
    .selectFrom("K8sClusterConfig")
    .selectAll()
    .where("id", "=", Number(clusterId))
    .where("authUserId", "=", userId)
    .executeTakeFirst();
}
*/

interface EditorClusterProps {
  params: {
    clusterId: number;
    lang: string;
  };
}

export default async function EditorClusterPage({
  params,
}: EditorClusterProps) {
  // Temporarily disable K8s cluster editor to avoid database connection issues
  return (
    <div className="container mx-auto py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">K8s Cluster Editor</h1>
        <p className="text-gray-600 mb-4">
          Cluster Editor is temporarily disabled during development.
        </p>
        <p className="text-sm text-gray-500">
          Cluster ID: {params.clusterId}
        </p>
      </div>
    </div>
  );

  /* Original implementation - temporarily commented out
  const user = await getCurrentUser();
  if (!user) {
    redirect(authOptions?.pages?.signIn ?? "/login-clerk");
  }

  // console.log("EditorClusterPage user:" + user.id + "params:", params);
  const cluster = await getClusterForUser(params.clusterId, user.id);

  if (!cluster) {
    notFound();
  }
  return (
    <ClusterConfig
      cluster={{
        id: cluster.id,
        name: cluster.name,
        location: cluster.location,
      }}
      params={{ lang: params.lang }}
    />
  );
  */
}
