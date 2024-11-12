import { getHumeAccessToken } from "@/utils/getHumeAccessToken";
import dynamicImport from "next/dynamic";

const Chat = dynamicImport(() => import("@/components/Chat"), {
  ssr: false,
});

export const dynamic = "force-dynamic";

export default async function Page() {
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    return (
      <div className="grow flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-medium mb-2">Configuration Required</h1>
          <p className="text-muted-foreground">
            Please ensure HUME_EVI_API_KEY and HUME_SECRET_KEY are properly set
            in your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={"grow flex flex-col"}>
      <Chat accessToken={accessToken} />
    </div>
  );
}
