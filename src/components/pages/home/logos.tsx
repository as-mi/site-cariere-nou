import Image from "next/image";

import ExternalLink from "~/components/common/external-link";

import logoAsmi from "../../../images/logos/asmi.png";
import logoFmi from "../../../images/logos/fmi.png";
import logoUnibuc from "../../../images/logos/unibuc.png";

type LogoProps = {
  href: string;
  src: any;
  alt: string;
};

const Logo: React.FC<LogoProps> = ({ href, src, alt }) => (
  <ExternalLink
    href={href}
    className="mx-3 flex flex-1 flex-col items-center justify-center"
    style={{ maxWidth: "300px" }}
  >
    <Image src={src} alt={alt} className="max-h-20 object-contain" />
  </ExternalLink>
);

const LogosSection: React.FC = () => (
  <section className="bg-zinc-100">
    <div className="mx-auto flex max-w-screen-lg items-center justify-between px-3 py-5">
      <Logo
        href="https://www.asmi.ro"
        src={logoAsmi}
        alt="Asociația Studenților la Matematică și Informatică"
      />
      <Logo
        href="https:/fmi.unibuc.ro"
        src={logoFmi}
        alt="Facultatea de Matematică și Informatică"
      />
      <Logo
        href="https://unibuc.ro"
        src={logoUnibuc}
        alt="Universitatea din București"
      />
    </div>
  </section>
);

export default LogosSection;
