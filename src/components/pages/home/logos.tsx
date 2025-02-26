import Image from "next/image";

import ExternalLink from "~/components/common/external-link";

import logoAsmi from "../../../images/logos/asmi.png";
import logoFmi from "../../../images/logos/fmi.png";
import logoUnibuc from "../../../images/logos/unibuc.png";

type LogoProps = {
  href: string;
  src: any;
  alt: string;
  custom?: string;
};

const Logo: React.FC<LogoProps> = ({ href, src, alt, custom }) => (
  <ExternalLink
    href={href}
    className="mx-3 flex flex-1 flex-col items-center justify-center"
    style={{ maxWidth: "300px" }}
  >
    <Image
      src={src}
      alt={alt}
      className={`max-h-24 sm:max-h-32 object-contain ${custom}`}
    />
  </ExternalLink>
);

const LogosSection: React.FC = () => (
  <section className="bg-zinc-100" style={{ paddingTop: "6vh" }}>
    <div className="mx-auto flex max-w-screen-lg flex-col items-center justify-between px-3 py-5 space-y-10 sm:flex-row sm:space-y-0 sm:space-x-24">
      <Logo
        href="https://fmi.unibuc.ro"
        src={logoFmi}
        alt="Facultatea de Matematică și Informatică"
        custom={"logo"}
      />
      <Logo
        href="https://www.asmi.ro"
        src={logoAsmi}
        alt="Asociația Studenților la Matematică și Informatică"
        custom={"asmi"}
      />
      <Logo
        href="https://unibuc.ro"
        src={logoUnibuc}
        alt="Universitatea din București"
        custom={"logo"}
      />
    </div>
  </section>
);

export default LogosSection;
