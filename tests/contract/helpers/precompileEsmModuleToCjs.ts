import { rollup } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import cjs from '@rollup/plugin-commonjs';
import nodeEval from 'node-eval';

/*
  takes in an ESM module that jest cannot import
  returns an evaled CJS module for direct use
  - inputPath: string - the path to the esm module
  - context: object - an object that allows passing global variables as defined by node-eval
    https://github.com/node-eval/node-eval#context
*/
export default async function precompileEsmModuleToCjs (inputPath: string, context?: any): Promise<any> {
  const cjsModuleAsString = await rollup({
    input: inputPath,
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      cjs()
    ]
  }).then(async bundle => await bundle.generate({ format: 'cjs', inlineDynamicImports: true }))
    .then(generated => {
      return generated.output[0].code;
    });

  return nodeEval(cjsModuleAsString, './index.js', context);
}
