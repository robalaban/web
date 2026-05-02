// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

function remarkReadingTime() {
  return (tree, { data }) => {
    let text = '';
    const walk = (node) => {
      if (typeof node.value === 'string') text += ' ' + node.value;
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
    const words = text.split(/\s+/).filter(Boolean).length;
    data.astro.frontmatter.readingTime = Math.max(1, Math.ceil(words / 200));
  };
}

export default defineConfig({
  site: 'https://robertbalaban.com',
  integrations: [mdx()],

  markdown: {
    remarkPlugins: [remarkReadingTime],
    shikiConfig: {
      themes: {
        light: 'min-light',
        dark: 'min-dark',
      },
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()]
  }
});