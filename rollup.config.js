import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import builtins from 'rollup-plugin-node-builtins';

export default {
  input: 'src/MerkleProof2019.ts',
  output: [
    {
      file: 'dist/MerkleProof2019.js',
      format: 'cjs',
      name: 'MerkleProof2019'
    },
    {
      file: 'dist/MerkleProof2019-es.js',
      format: 'es',
      name: 'MerkleProof2019'
    }
  ],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: true,
      extensions: ['.js', '.json']
    }),
    typescript(),
    commonjs({ extensions: ['.js', '.ts'] }),
    json(),
    builtins()
  ]
};
