const fs = require('fs');

const content = `export const environment = {
  omdbApiKey: '${process.env.OMDB_API_KEY || ''}',
  tmdbApiKey: '${process.env.TMDB_API_KEY || ''}',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageBase: 'https://image.tmdb.org/t/p',
};`;

fs.writeFileSync('src/environments/environment.ts', content);
console.log('Generated src/environments/environment.ts');
