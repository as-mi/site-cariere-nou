import Image from "next/image";

type NextImageProps = React.ComponentPropsWithoutRef<typeof Image>;

type UploadedImageProps = {
  imageId: number;
  width: number;
  height: number;
  alt: string;
  queryString?: string;
} & Omit<NextImageProps, "src" | "width" | "height" | "alt">;

const UploadedImage: React.FC<UploadedImageProps> = ({
  imageId,
  width,
  height,
  alt,
  queryString,
  ...otherProps
}) => (
  <Image
    src={`/api/images/${imageId}${queryString ? `?${queryString}` : ""}`}
    width={width}
    height={height}
    alt={alt}
    {...otherProps}
    unoptimized
  />
);

export default UploadedImage;
