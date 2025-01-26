import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'My API',
    description: 'API Documentation',
  },
  host: 'localhost:8000', 
  schemes: ['http'], // Use https if your API runs on https
};

const outputFile = './swagger-output.json'; // Path to the output file
const endpointsFiles = ['./src/app.js']; // Path to the entry point of your application

swaggerAutogen(outputFile, endpointsFiles).then(() => {
  console.log('Swagger documentation generated!');
});
