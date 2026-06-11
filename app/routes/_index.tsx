import { redirect } from "react-router";

export function loader() {
  return redirect("/pipeline");
}

export default function IndexRedirect() {
  return null;
}
