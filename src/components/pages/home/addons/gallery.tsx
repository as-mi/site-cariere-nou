import React, { useEffect, useState } from "react";

interface GalleryBackgroundProps {
  src: string;
}
const GalleryBackground: React.FC<GalleryBackgroundProps> = ({ src }) => {
  const [hasWindow, setHasWindow] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);
  return (
    <div className="absolute z-0 w-full h-full top-0 left-0 opacity-40">
      {hasWindow ? (
        <video
          playsInline={true}
          webkit-playsinline="true"
          src={src}
          controls={false}
          autoPlay={true}
          loop={true}
          muted={true}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            userSelect: "none",
            animationPlayState: "running",
            msTouchSelect: "none",
            touchAction: "none",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            WebkitTapHighlightColor: "rgba(0,0,0,0)",
          }}
        />
      ) : null}
    </div>
  );
};

export default GalleryBackground;
