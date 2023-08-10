// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const prism = require('prism-react-renderer');
const gushioRepository = 'https://github.com/forge-srl/gushio';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Gushio',
  tagline: 'Like bash scripts, but in JavaScript',
  url: 'https://forge-srl.github.io',
  baseUrl: '/gushio/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'forge-srl',
  projectName: 'gushio',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: `${gushioRepository}/main/documentation/`,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Gushio',
        /*logo: {
          alt: 'Gushio Logo',
          src: '/img/logo.svg',
        },*/
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Documentation',
          },
          {
            type: 'docsVersionDropdown',
          },
          {
            href: gushioRepository,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Documentation',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/gushio',
              },
              {
                label: 'GitHub Discussions',
                href: `${gushioRepository}/discussions`,
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: gushioRepository,
              },
              {
                label: 'Forge S.r.l.',
                href: 'https://forge.srl',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Forge S.r.l. - Built with Docusaurus.`,
      },
      prism: {
        theme: prism.themes.github,
        darkTheme: prism.themes.dracula,
      },
    }),
};

module.exports = config;
