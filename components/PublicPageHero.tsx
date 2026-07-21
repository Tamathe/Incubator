import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./PublicPageHero.module.css";

interface PublicPageHeroProps {
  kicker: ReactNode;
  title: ReactNode;
  description: ReactNode;
  image: {
    src: string;
    alt: string;
    caption: ReactNode;
    position?: string;
  };
  children?: ReactNode;
}

export default function PublicPageHero({
  kicker,
  title,
  description,
  image,
  children,
}: PublicPageHeroProps) {
  return (
    <header className={`container ${styles.hero}`}>
      <div className={styles.copy}>
        <p className={`mono ${styles.kicker}`}>{kicker}</p>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
        {children && <div className={styles.actions}>{children}</div>}
      </div>

      <figure className={styles.figure}>
        <div className={styles.image}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(max-width: 820px) 100vw, 46vw"
            style={{ objectPosition: image.position ?? "center" }}
          />
        </div>
        <figcaption>{image.caption}</figcaption>
      </figure>
    </header>
  );
}
