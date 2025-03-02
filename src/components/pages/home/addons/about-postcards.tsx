import React from "react";
import Image from "next/image";
import { TFunction } from "next-i18next";

interface PostcardProps {
  t: TFunction;
  imageUrl: string;
  name: string;
  description: string;
  phoneNumber: string;
}

const Postcard: React.FC<PostcardProps> = ({
  imageUrl,
  name,
  description,
  phoneNumber,
  t,
}) => {
  return (
    <div className="z-10 bg-pm bg-no-repeat bg-cover bg-center p-1 rounded-lg max-w-xs w-full aboutPostcard">
      <div className="p-2 border-2 mt-6 mb-2 avatarFramePostcard">
        <Image
          src={imageUrl}
          alt="Postcard"
          className="avatarPostcard"
          width={190}
          height={190}
          unoptimized
        />
      </div>
      <div className="flex flex-col justify-center items-center space-y-2 pt-2 pb-12">
        <p className="font-bold uppercase font-display relative text-2xl text-white">
          {name}
        </p>
        {/* <p className="text-white text-xl italic">{description}</p> */}
        <a target="_blank" href={`https://wa.me/${phoneNumber}`}>
          <button className="aboutpc text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none">
            {t("aboutSection.contact")}
          </button>
        </a>
      </div>
    </div>
  );
};

interface PostcardsRow {
  t: TFunction;
}

const PostcardsRow: React.FC<PostcardsRow> = ({ t }) => {
  return (
    <div className="z-10 sc:space-x-32 aboutPostcards w-full mb-2">
      <Postcard
        t={t}
        imageUrl="/images/roxana.png"
        name="Roxana Asavei"
        description={t("aboutSection.roxana")}
        phoneNumber="40753662813"
      />
      <Postcard
        t={t}
        imageUrl="/images/matei.png"
        name="Matei Andrei"
        description={t("aboutSection.matei")}
        phoneNumber="40751251601"
      />
    </div>
  );
};

export default PostcardsRow;
