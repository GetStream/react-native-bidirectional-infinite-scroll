/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'React Native Bidirectional Infinite Scroll',
  tagline: 'Bidirectional infinite scroll using react-native and FlatList',
  url: 'https://getstream.github.io',
  baseUrl: '/react-native-bidirectional-infinite-scroll/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'https://getstream.imgix.net/images/favicons/favicon-96x96.png',
  organizationName: 'getstream', // Usually your GitHub org/user name.
  projectName: 'react-native-bidirectional-infinite-scroll', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Bidirectional Infinite Scroll',
      items: [
        {
          href:
            'https://github.com/GetStream/react-native-bidirectional-infinite-scroll',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      copyright: `Created by <a rel="noreferrer" href="https://github.com/vishalnarkhede" target="_blank">Vishal Narkhede</a> | Built with ❤️ <a rel="noreferrer" href="https://getstream.io" target="_blank">@Stream</a>`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
