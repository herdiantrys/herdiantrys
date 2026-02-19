import { getProfile } from "@/lib/sanityProfile";
import FooterClient from "./FooterClient";

const Footer = async ({ dict }: { dict: any }) => {
    const profile = await getProfile();

    return <FooterClient dict={dict} profile={profile} />;
};

export default Footer;
