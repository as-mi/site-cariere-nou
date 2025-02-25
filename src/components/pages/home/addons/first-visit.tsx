import React, { useState, useEffect } from "react";
import Image from "next/image";
import logoCariere from "~/images/logos/asmi.png";

const firstVisit: React.FC = () => {
  const [isBoxVisible, setIsBoxVisible] = useState<boolean>(false);

  useEffect(() => {
    const firstTime = localStorage.getItem("firstTime");
    if (!firstTime) {
      localStorage.setItem("firstTime", "false");

      setIsBoxVisible(true);
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        setIsBoxVisible(false);
        document.body.style.overflow = "auto";
      }, 4000);
    }
  }, []);

  return (
    <div>
      {isBoxVisible && (
        <div className="overlay">
          <Image
            src={logoCariere}
            alt="Cariere v14.0"
            className="mx-auto w-full max-w-[260px] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
            priority
            unoptimized
          />
        </div>
      )}
    </div>
  );
};

export default firstVisit;
