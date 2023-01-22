type ExternalLinkProps = {
  href: string;
  children: React.ReactNode;
};

const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="cursor-pointer text-green-800 hover:text-green-600"
  >
    {children}
  </a>
);

export default ExternalLink;
