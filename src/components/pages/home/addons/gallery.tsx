import React from "react";

interface GalleryBackgroundProps {
  src: string;
}

const GalleryBackground: React.FC<GalleryBackgroundProps> = ({ src }) => {
  return (
    <div className="absolute z-0 w-full h-full top-0 left-0 opacity-40">
      <video
        src={src}
        controls={false}
        autoPlay={true}
        loop={true}
        muted={true}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};

export default GalleryBackground;
