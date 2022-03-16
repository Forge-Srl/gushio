import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Multiplatform',
    description: (
      <>
        Gushio was designed from the ground up to ensure the same script can run identically under Linux, macOS and Windows.
      </>
    ),
  },
  {
    title: 'No boilerplate',
    description: (
      <>
        Gushio lets you focus on your script, reducing the boilerplate like writing a package.json and installing dependencies.
      </>
    ),
  },
  {
    title: 'Sensible defaults',
    description: (
      <>
        The common Node.js environment is extended with additional functionalities and libraries to ease the script development.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
