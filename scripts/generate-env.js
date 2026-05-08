const fs = require('fs');

const content = `export const environment = {
  tmdbApiKey: '${process.env.TMDB_API_KEY || ''}',
  tmdbReadToken: '${process.env.TMDB_READ_TOKEN || ''}',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageBase: 'https://image.tmdb.org/t/p',
};`;

fs.writeFileSync('src/environments/environment.ts', content);
console.log('Generated src/environments/environment.ts');
