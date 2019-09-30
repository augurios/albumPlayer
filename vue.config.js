module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        mac: {
          icon: './public/img/icons.icns',
          category: 'public.app-category.utilities',
        },
        linux: {
          target: [
            'AppImage',
            'deb',
          ],
          publish: ['github'],
        },
        win: {
          icon: './public/img/icons/icon_256x256.png',
          publish: ['github'],
        },
        publish: {
          provider: 'github',
          private: false,
          publishAutoUpdate: true,
        },
      },
    },
  },
};
