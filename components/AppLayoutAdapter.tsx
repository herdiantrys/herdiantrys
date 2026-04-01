import { getRequestUserContext } from "@/lib/request-user-context";
import Shell from "./layout/Shell";

export default async function AppLayoutAdapter({
    children,
    dict
}: {
    children: React.ReactNode,
    dict: any
}) {
    const { shellUser } = await getRequestUserContext();

    return (
        <Shell dict={dict} user={shellUser} variant={shellUser ? "default" : "guest"}>
            {children}
        </Shell>
    );
}
