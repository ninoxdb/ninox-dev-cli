import { Env } from '@salesforce/kit';



// export class Config {
//   static get env() {
//     return new Env();
//   }
// }

export const env = new Env(process.env);