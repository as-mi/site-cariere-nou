import { TFunction, useTranslation } from "next-i18next";

import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";

import ExternalLink from "../../common/external-link";

type SocialMediaLinkProps = {
  href: string;
  icon: IconProp;
  title: string;
  className?: string;
};

const SocialMediaLink: React.FC<SocialMediaLinkProps> = ({
  href,
  icon,
  title,
  className,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="inline-block rounded-full bg-green-800 text-white hover:bg-green-700"
  >
    <span title={title}>
      <FontAwesomeIcon icon={icon} className={className} />
    </span>
  </a>
);

const ContactSection: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <section id="contact" className="bg-zinc-100 p-12">
      <div className="mx-auto flex max-w-5xl flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-around">
        <address className="mb-5 flex-1 not-italic">
          <div className="mb-5">
            <p>Strada Academiei Nr. 14,</p>
            <p>București</p>
          </div>

          <p>
            <span className="font-bold">{t("contactSection.telephone")}:</span>{" "}
            <ExternalLink href="tel:+40752300470">0752 300 470</ExternalLink>
          </p>
          <p>
            <span className="font-bold">{t("contactSection.e-mail")}:</span>{" "}
            <ExternalLink href="mailto:cd@asmi.ro">cd@asmi.ro</ExternalLink>
          </p>
        </address>
        <section className="mb-5 flex-1">
          <h3 className="font-bold">{t("contactSection.usefulLinks")}</h3>
          <ul className="list-disc pl-5">
            <li>
              <ExternalLink href="https://www.asmi.ro/">ASMI</ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://fmi.unibuc.ro/">FMI</ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://unibuc.ro/">
                Universitatea din București
              </ExternalLink>
            </li>
          </ul>
        </section>
        <section className="flex-1">
          <p className="font-bold">{t("contactSection.contactUs")}</p>
          <p>{t("contactSection.weWillReplyASAP")}</p>
          <div className="mt-3 space-x-2 pl-1">
            <SocialMediaLink
              href="https://www.facebook.com/asmi.ub/"
              icon={faFacebookF}
              title="Facebook"
              className="h-8 w-8 p-2"
            />
            <SocialMediaLink
              href="https://www.instagram.com/asmi.ub/"
              icon={faInstagram}
              title="Instagram"
              className="h-8 w-8 p-1.5"
            />
          </div>
        </section>
      </div>
    </section>
  );
};

export default ContactSection;
