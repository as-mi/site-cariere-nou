type ExternalLinkProps = {
  href: string;
  children: React.ReactNode;
};

const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children }) => (
  // We already use `noopener` for security, we don't want to switch to `noreferrer` for SEO reasons.
  // eslint-disable-next-line react/jsx-no-target-blank
  <a
    href={href}
    target="_blank"
    rel="noopener"
    className="cursor-pointer text-green-800 hover:text-green-600"
  >
    {children}
  </a>
);

export default ExternalLink;
