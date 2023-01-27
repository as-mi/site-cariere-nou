import Image from "next/image";

import logoAsmi from "../../../images/logos/asmi.png";
import logoFmi from "../../../images/logos/fmi.png";
import logoUnibuc from "../../../images/logos/unibuc.png";

type LogoProps = {
  src: any;
  alt: string;
};

const Logo: React.FC<LogoProps> = ({ src, alt }) => (
  <div
    className="mx-3 flex flex-1 flex-col items-center justify-center"
    style={{ maxWidth: "300px" }}
  >
    <Image src={src} alt={alt} />
  </div>
);

const LogosSection: React.FC = () => (
  <section className="bg-zinc-100">
    <div className="mx-auto flex max-w-screen-lg items-center justify-between px-3 py-5">
      <Logo
        src={logoAsmi}
        alt="Asociația Studenților la Matematică și Informatică"
      />
      <Logo src={logoFmi} alt="Facultatea de Matematică și Informatică" />
      <Logo src={logoUnibuc} alt="Universitatea din București" />
    </div>
  </section>
);

export default LogosSection;
