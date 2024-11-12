import { getHumeAccessToken } from "@/utils/getHumeAccessToken";
import dynamicImport from "next/dynamic";

const Chat = dynamicImport(() => import("@/components/Chat"), {
  ssr: false,
});

export const dynamic = "force-dynamic";

export default async function Page() {
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error();
  }

  return (
    <div className={"grow flex flex-col"}>
      <Chat accessToken={accessToken} />
    </div>
  );
}
