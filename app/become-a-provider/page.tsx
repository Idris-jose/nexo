import { permanentRedirect } from "next/navigation";

/** Old placeholder URL: the real page lives at /become-provider/. */
export default function Page() {
  permanentRedirect("/become-provider/");
}
