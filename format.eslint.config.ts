import nextTs from 'eslint-config-next/typescript';
import nextVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'typescript-eslint';

import config from './eslint.config';

const formatConfig = [
  ...config,
  {
    name: 'formatting',
    rules: {
      ...Object.fromEntries(nextTs.flatMap((v) => Object.keys(v.rules ?? {}).map((rule) => [rule, 'off']))),
      ...Object.fromEntries(nextVitals.flatMap((v) => Object.keys(v.rules ?? {}).map((rule) => [rule, 'off']))),
      ...typescript.configs.disableTypeChecked.rules,
      'react-hooks/component-hook-factories': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/use-memo': 'off',
    },
  },
];

export default formatConfig;
