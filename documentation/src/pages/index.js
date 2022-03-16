import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Gushio Documentation 📖
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Gushio is a runner for shell scripts written in JavaScript">
      <HomepageHeader />
      <main>
        <section>
          <div className="container">
            <div className="row padding--md">
              <p>Gushio* is the tool to execute automation scripts written in JavaScript.</p>
              <p>Gushio is built on top of battle-tested libraries
                  like <a href="https://www.npmjs.com/package/commander" rel="nofollow">commander</a> and <a href="https://www.npmjs.com/package/shelljs" rel="nofollow">shelljs</a> and
                  allows you to write a multiplatform shell script in a single JavaScript file without having to worry
                  about <code>package.json</code> and dependencies installation.
              </p>
              <sub><em>* Gushio is pronounced like the italian word "guscio" (IPA: /'guʃʃo/) which means "shell".</em></sub>
            </div>
          </div>
        </section>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
