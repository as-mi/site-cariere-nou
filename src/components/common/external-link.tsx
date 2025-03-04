import classNames from "classnames";

type ExternalLinkProps = {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  className,
  style,
  children,
}) => (
  // We already use `noopener` for security, we don't want to switch to `noreferrer` for SEO reasons.
  // eslint-disable-next-line react/jsx-no-target-blank
  <a
    href={href}
    target="_blank"
    rel="noopener"
    className={classNames("cursor-pointer", className)}
    style={style}
  >
    {children}
  </a>
);

export default ExternalLink;
