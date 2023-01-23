import Image from "next/image";

import logoCariereSmall from "../../../images/logos/cariere-small-white.png";

const NavBar: React.FC = () => (
  <header className="fixed z-50 w-full bg-black px-2 py-3">
    <nav>
      <Image
        src={logoCariereSmall}
        alt="Logo Cariere"
        width={98}
        height={40}
        // TODO: need to determine why Next.js's built-in compression algorithm
        // makes this image look very blurry
        unoptimized
      />
    </nav>
  </header>
);

export default NavBar;
